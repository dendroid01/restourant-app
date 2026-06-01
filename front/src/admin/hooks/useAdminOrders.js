// src/hooks/useAdminOrders.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { adminOrders } from '../../api/admin';

export function useAdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all',
        restaurant_id: 'all',
        date_from: '',
        date_to: '',
        search: '',
        sort_by: 'date',
        sort_order: 'desc',
    });

    // Реф для предотвращения лишних запросов
    const loadingRef = useRef(false);

    // Загрузка заказов - отдельная функция, не зависящая от filters в deps
    const loadOrders = useCallback(async (customFilters) => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);

        try {
            const currentFilters = customFilters || filters;
            const response = await adminOrders.list(currentFilters);

            setOrders(response.data || []);
            setStats(response.stats || null);
            setPagination(response.meta || {
                current_page: 1,
                last_page: 1,
                per_page: 10,
                total: 0,
            });

            return response;
        } catch (error) {
            console.error('Failed to load orders:', error);
            throw error;
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [filters]);

    // Обновление статуса заказа
    const updateStatus = useCallback(async (order, newStatus) => {
        try {
            const response = await adminOrders.updateStatus(
                order.type,
                order.original_id,
                newStatus
            );

            setOrders(prevOrders =>
                prevOrders.map(o =>
                    o.id === order.id
                        ? { ...o, status: newStatus, status_label: response.data?.status_label }
                        : o
                )
            );

            // Обновляем статистику локально
            if (stats) {
                setStats(prevStats => {
                    if (!prevStats) return prevStats;

                    const newStats = { ...prevStats };
                    const oldStatus = order.status;

                    if (order.type === 'booking' && prevStats.bookings) {
                        newStats.bookings = {
                            ...prevStats.bookings,
                            [oldStatus]: Math.max(0, (prevStats.bookings[oldStatus] || 0) - 1),
                            [newStatus]: (prevStats.bookings[newStatus] || 0) + 1,
                        };
                        newStats.total_orders = (newStats.total_orders || 0);
                        newStats.new_orders = (newStats.bookings.new || 0) + (newStats.events?.new || 0);
                    } else if (order.type === 'event' && prevStats.events) {
                        newStats.events = {
                            ...prevStats.events,
                            [oldStatus]: Math.max(0, (prevStats.events[oldStatus] || 0) - 1),
                            [newStatus]: (prevStats.events[newStatus] || 0) + 1,
                        };
                        newStats.total_orders = (newStats.total_orders || 0);
                        newStats.new_orders = (newStats.bookings?.new || 0) + (newStats.events.new || 0);
                    }

                    return newStats;
                });
            }

            return response;
        } catch (error) {
            console.error('Failed to update status:', error);
            throw error;
        }
    }, [stats]);

    // Полное обновление заказа
    const updateOrder = useCallback(async (orderId, data) => {
        // Находим заказ по id
        const orderToUpdate = orders.find(o => o.id === orderId);
        if (!orderToUpdate) throw new Error('Order not found');

        try {
            const response = await adminOrders.update(
                orderToUpdate.type,
                orderToUpdate.original_id,
                data
            );

            setOrders(prevOrders =>
                prevOrders.map(o =>
                    o.id === orderId
                        ? { ...o, ...response.data }
                        : o
                )
            );

            return response;
        } catch (error) {
            console.error('Failed to update order:', error);
            throw error;
        }
    }, [orders]);

    // Удаление заказа
    const deleteOrder = useCallback(async (order) => {
        try {
            await adminOrders.delete(order.type, order.original_id);

            // Удаляем заказ из списка
            setOrders(prevOrders => prevOrders.filter(o => o.id !== order.id));

            // Обновляем статистику
            if (stats) {
                setStats(prevStats => {
                    if (!prevStats) return prevStats;

                    const newStats = { ...prevStats };
                    const orderStatus = order.status;

                    if (order.type === 'booking' && prevStats.bookings) {
                        newStats.bookings = {
                            ...prevStats.bookings,
                            total: Math.max(0, (prevStats.bookings.total || 0) - 1),
                            [orderStatus]: Math.max(0, (prevStats.bookings[orderStatus] || 0) - 1),
                        };
                        newStats.total_orders = Math.max(0, (newStats.total_orders || 0) - 1);
                        newStats.new_orders = (newStats.bookings.new || 0) + (newStats.events?.new || 0);
                    } else if (order.type === 'event' && prevStats.events) {
                        newStats.events = {
                            ...prevStats.events,
                            total: Math.max(0, (prevStats.events.total || 0) - 1),
                            [orderStatus]: Math.max(0, (prevStats.events[orderStatus] || 0) - 1),
                        };
                        newStats.total_orders = Math.max(0, (newStats.total_orders || 0) - 1);
                        newStats.new_orders = (newStats.bookings?.new || 0) + (newStats.events.new || 0);
                    }

                    return newStats;
                });
            }

            // Обновляем пагинацию
            setPagination(prev => ({
                ...prev,
                total: Math.max(0, (prev.total || 0) - 1),
            }));

            return true;
        } catch (error) {
            console.error('Failed to delete order:', error);
            throw error;
        }
    }, [stats]);

    // Обновление фильтра с автоматической перезагрузкой
    const updateFilter = useCallback((key, value) => {
        setFilters(prev => {
            const newFilters = {
                ...prev,
                [key]: value,
                // Сбрасываем страницу при изменении фильтров
                page: undefined
            };

            // Загружаем с новыми фильтрами
            loadOrders(newFilters);

            return newFilters;
        });
    }, [loadOrders]);

    // Сброс всех фильтров
    const resetFilters = useCallback(() => {
        const defaultFilters = {
            type: 'all',
            status: 'all',
            restaurant_id: 'all',
            date_from: '',
            date_to: '',
            search: '',
            sort_by: 'date',
            sort_order: 'desc',
        };
        setFilters(defaultFilters);
        loadOrders(defaultFilters);
    }, [loadOrders]);

    // Переход на страницу
    const goToPage = useCallback((page) => {
        if (page < 1 || page > pagination.last_page) return;

        setFilters(prev => {
            const newFilters = { ...prev, page };
            loadOrders(newFilters);
            return newFilters;
        });
    }, [pagination.last_page, loadOrders]);

    // Загрузка ресторанов для фильтра
    const [restaurants, setRestaurants] = useState([]);
    const loadRestaurants = useCallback(async () => {
        try {
            const response = await adminOrders.getRestaurants();
            setRestaurants(response.data || []);
            return response.data;
        } catch (error) {
            console.error('Failed to load restaurants:', error);
            return [];
        }
    }, []);

    // Автоматическая загрузка при монтировании - только один раз
    useEffect(() => {
        loadOrders();
        loadRestaurants();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        orders,
        loading,
        stats,
        pagination,
        filters,
        restaurants,
        loadOrders,
        updateStatus,
        updateOrder,
        deleteOrder,      // Добавлено
        updateFilter,
        resetFilters,
        goToPage,
        loadRestaurants,
    };
}