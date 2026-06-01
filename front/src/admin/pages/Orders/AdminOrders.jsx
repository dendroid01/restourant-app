// src/pages/Admin/Orders/AdminOrders.jsx
import { useState } from 'react';
import Modal from '../../components/Modal/Modal';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import OrderItemsManager from './OrderItemsManager';

const STATUS_OPTIONS = [
    { value: 'new', label: 'Новая' },
    { value: 'processing', label: 'В обработке' },
    { value: 'confirmed', label: 'Подтверждена' },
    { value: 'cancelled', label: 'Отменена' },
];

const TYPE_OPTIONS = [
    { value: 'all', label: 'Все' },
    { value: 'booking', label: 'Бронирование' },
    { value: 'event', label: 'Мероприятие' },
];

export default function AdminOrders() {
    const {
        orders,
        loading,
        stats,
        pagination,
        filters,
        restaurants,
        updateStatus,
        updateOrder,
        deleteOrder,
        updateFilter,
        resetFilters,
        goToPage,
    } = useAdminOrders();

    const [editingOrder, setEditingOrder] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [activeStatusOrderId, setActiveStatusOrderId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('info');

    const openEdit = (order) => {
        setEditingOrder(order.id);
        setEditForm({ ...order });
    };

    const handleSave = async () => {
        if (!editingOrder) return;

        try {
            await updateOrder(editingOrder, editForm);
            setEditingOrder(null);
        } catch (error) {
            alert('Ошибка при сохранении');
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;

        setDeleting(true);
        try {
            await deleteOrder(confirmDelete);
            setConfirmDelete(null);
        } catch (error) {
            alert('Ошибка при удалении: ' + error.message);
        } finally {
            setDeleting(false);
        }
    };

    const ef = (field) => ({
        value: editForm[field] ?? '',
        onChange: (e) => setEditForm((p) => ({ ...p, [field]: e.target.value })),
        className: 'admin-input',
    });

    const setFilter = (key, value) => updateFilter(key, value);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        updateFilter('page', 1);
    };

    const handleReset = () => {
        resetFilters();
    };

    const handleStatusClick = (orderId) => {
        setActiveStatusOrderId(activeStatusOrderId === orderId ? null : orderId);
    };

    const handleStatusChange = async (order, newStatus) => {
        await updateStatus(order, newStatus);
        setActiveStatusOrderId(null);
    };

    if (loading && orders.length === 0) {
        return <div className="loading-spinner">Загрузка заказов...</div>;
    }

    return (
        <div>
            {/* Статистика */}
            {stats && (
                <div className="stats-grid" style={{ marginBottom: 24 }}>
                    <div className="stat-card">
                        <div className="stat-label">Всего заказов</div>
                        <div className="stat-value">{stats.total_orders}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Новых</div>
                        <div className="stat-value">{stats.new_orders}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Бронирований</div>
                        <div className="stat-value">{stats.bookings?.total || 0}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Мероприятий</div>
                        <div className="stat-value">{stats.events?.total || 0}</div>
                    </div>
                </div>
            )}

            {/* Фильтры */}
            <div className="admin-filters" style={{
                marginBottom: 20,
                padding: 16,
                background: '#f5f5f5',
                borderRadius: 8
            }}>
                <form onSubmit={handleSearchSubmit} style={{
                    display: 'flex',
                    gap: 12,
                    flexWrap: 'wrap',
                    alignItems: 'flex-end'
                }}>
                    <div className="admin-form-group" style={{ minWidth: 150 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Тип</label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilter('type', e.target.value)}
                            className="admin-input"
                            style={{ width: '100%' }}
                        >
                            {TYPE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-form-group" style={{ minWidth: 150 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Статус</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilter('status', e.target.value)}
                            className="admin-input"
                            style={{ width: '100%' }}
                        >
                            <option value="all">Все</option>
                            {STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-form-group" style={{ minWidth: 180 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Ресторан</label>
                        <select
                            value={filters.restaurant_id}
                            onChange={(e) => setFilter('restaurant_id', e.target.value)}
                            className="admin-input"
                            style={{ width: '100%' }}
                        >
                            <option value="all">Все</option>
                            {restaurants.map(r => (
                                <option key={r.id} value={r.id}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-form-group" style={{ minWidth: 150 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Дата от</label>
                        <input
                            type="date"
                            value={filters.date_from}
                            onChange={(e) => setFilter('date_from', e.target.value)}
                            className="admin-input"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className="admin-form-group" style={{ minWidth: 150 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Дата до</label>
                        <input
                            type="date"
                            value={filters.date_to}
                            onChange={(e) => setFilter('date_to', e.target.value)}
                            className="admin-input"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className="admin-form-group" style={{ flex: 1, minWidth: 200 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Поиск</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilter('search', e.target.value)}
                            placeholder="Имя, телефон, email..."
                            className="admin-input"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <button type="submit" className="btn-admin btn-admin-primary" style={{ height: 38 }}>
                        🔍 Применить
                    </button>

                    <button
                        type="button"
                        className="btn-admin btn-admin-secondary"
                        onClick={handleReset}
                        style={{ height: 38 }}
                    >
                        Сбросить
                    </button>
                </form>
            </div>

            {/* Таблица заказов */}
            {orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <p>Нет заказов по выбранным фильтрам</p>
                </div>
            ) : (
                <>
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Тип</th>
                                <th>Клиент</th>
                                <th>Ресторан</th>
                                <th>Дата</th>
                                <th>Гости</th>
                                <th>Статус</th>
                                <th>Сумма</th>
                                <th>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td style={{ color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                                        #{order.id}
                                    </td>
                                    <td>
                                        <span className={`badge ${order.type === 'booking' ? 'badge-success' : 'badge-error'}`}>
                                            {order.type_label}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>
                                        <div>{order.client_name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{order.phone}</div>
                                    </td>
                                    <td>{order.restaurant_name}</td>
                                    <td>
                                        {order.date}
                                        {order.time && <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{order.time}</div>}
                                    </td>
                                    <td>{order.guests}</td>
                                    <td style={{ position: 'relative' }}>
                                        <div
                                            onClick={() => handleStatusClick(order.id)}
                                            style={{ cursor: 'pointer', display: 'inline-block' }}
                                        >
                                            <StatusBadge status={order.status} />
                                        </div>

                                        {activeStatusOrderId === order.id && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    marginTop: 4,
                                                    zIndex: 100,
                                                    background: 'white',
                                                    borderRadius: 8,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                    border: '1px solid #e0e0e0',
                                                    minWidth: 140,
                                                    overflow: 'hidden'
                                                }}
                                                onMouseLeave={() => setActiveStatusOrderId(null)}
                                            >
                                                {STATUS_OPTIONS.map((option) => (
                                                    <div
                                                        key={option.value}
                                                        onClick={() => handleStatusChange(order, option.value)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            cursor: 'pointer',
                                                            transition: 'background 0.2s',
                                                            fontSize: 13,
                                                            borderBottom: '1px solid #f0f0f0',
                                                            ...(order.status === option.value && {
                                                                background: '#f5f5f5',
                                                                fontWeight: 500
                                                            })
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = '#f5f5f5';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = order.status === option.value ? '#f5f5f5' : 'white';
                                                        }}
                                                    >
                                                        {option.label}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td>{order.amount_formatted || '—'}</td>
                                    <td>
                                        <button
                                            className="icon-btn-admin"
                                            onClick={() => setSelectedOrder(order)}
                                            title="Детали"
                                        >
                                            👁️
                                        </button>
                                        <button
                                            className="icon-btn-admin"
                                            onClick={() => openEdit(order)}
                                            title="Редактировать"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="icon-btn-admin"
                                            onClick={() => setConfirmDelete(order)}
                                            title="Удалить"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Пагинация */}
                    {pagination.last_page > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                            <button
                                className="btn-admin btn-admin-secondary"
                                onClick={() => goToPage(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                            >
                                ← Назад
                            </button>
                            <span style={{ padding: '8px 16px', background: '#f0f0f0', borderRadius: 6 }}>
                                {pagination.current_page} / {pagination.last_page}
                            </span>
                            <button
                                className="btn-admin btn-admin-secondary"
                                onClick={() => goToPage(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                            >
                                Вперёд →
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Модалка редактирования */}
            {editingOrder && (
                <Modal title={`Заказ #${editingOrder}`} onClose={() => setEditingOrder(null)} maxWidth={620}>
                    <div>
                        {[
                            { label: 'Клиент', field: 'client_name' },
                            { label: 'Телефон', field: 'phone' },
                            { label: 'Email', field: 'email', type: 'email' },
                            { label: 'Дата', field: 'date', type: 'date' },
                            { label: 'Гостей', field: 'guests', type: 'number' },
                        ].map((row) => (
                            <div key={row.field} className="admin-form-group" style={{ marginBottom: 16 }}>
                                <label>{row.label}</label>
                                <input
                                    type={row.type ?? 'text'}
                                    {...ef(row.field)}
                                />
                            </div>
                        ))}
                        {editForm.time !== undefined && (
                            <div className="admin-form-group" style={{ marginBottom: 16 }}>
                                <label>Время</label>
                                <input type="time" {...ef('time')} />
                            </div>
                        )}
                        <div className="admin-form-group" style={{ marginBottom: 16 }}>
                            <label>Пожелания</label>
                            <textarea
                                {...ef('wishes')}
                                rows={2}
                                className="admin-input"
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: 16 }}>
                            <label>Статус</label>
                            <select {...ef('status')} className="admin-input">
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                            <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setEditingOrder(null)}>
                                Отмена
                            </button>
                            <button type="button" className="btn-admin btn-admin-primary" onClick={handleSave}>
                                Сохранить
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Модалка детального просмотра */}
            {selectedOrder && (
                <Modal
                    title={`Заказ #${selectedOrder.id}`}
                    onClose={() => {
                        setSelectedOrder(null);
                        setActiveTab('info');
                    }}
                    maxWidth={900}
                >
                    {/* Вкладки */}
                    <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e0e0e0', marginBottom: 20 }}>
                        <button
                            onClick={() => setActiveTab('info')}
                            style={{
                                padding: '8px 16px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                borderBottom: activeTab === 'info' ? '2px solid #dc2626' : 'none',
                                color: activeTab === 'info' ? '#dc2626' : '#666',
                                fontWeight: activeTab === 'info' ? 600 : 400,
                            }}
                        >
                            Информация
                        </button>
                        {selectedOrder.type === 'event' && (
                            <button
                                onClick={() => setActiveTab('menu')}
                                style={{
                                    padding: '8px 16px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    borderBottom: activeTab === 'menu' ? '2px solid #dc2626' : 'none',
                                    color: activeTab === 'menu' ? '#dc2626' : '#666',
                                    fontWeight: activeTab === 'menu' ? 600 : 400,
                                }}
                            >
                                Меню мероприятия
                            </button>
                        )}
                    </div>

                    {activeTab === 'info' && (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div className="admin-form-group">
                                    <label>Клиент</label>
                                    <input value={selectedOrder.client_name || ''} readOnly className="admin-input" disabled />
                                </div>
                                <div className="admin-form-group">
                                    <label>Телефон</label>
                                    <input value={selectedOrder.phone || ''} readOnly className="admin-input" disabled />
                                </div>
                                <div className="admin-form-group">
                                    <label>Email</label>
                                    <input value={selectedOrder.email || ''} readOnly className="admin-input" disabled />
                                </div>
                                <div className="admin-form-group">
                                    <label>Ресторан</label>
                                    <input value={selectedOrder.restaurant_name || ''} readOnly className="admin-input" disabled />
                                </div>
                                <div className="admin-form-group">
                                    <label>Дата</label>
                                    <input value={selectedOrder.date || ''} readOnly className="admin-input" disabled />
                                </div>
                                {selectedOrder.time && (
                                    <div className="admin-form-group">
                                        <label>Время</label>
                                        <input value={selectedOrder.time || ''} readOnly className="admin-input" disabled />
                                    </div>
                                )}
                                <div className="admin-form-group">
                                    <label>Количество гостей</label>
                                    <input value={selectedOrder.guests || ''} readOnly className="admin-input" disabled />
                                </div>
                                <div className="admin-form-group">
                                    <label>Статус</label>
                                    <input value={selectedOrder.status_label || selectedOrder.status || ''} readOnly className="admin-input" disabled />
                                </div>
                                {selectedOrder.amount_formatted && (
                                    <div className="admin-form-group">
                                        <label>Сумма</label>
                                        <input value={selectedOrder.amount_formatted} readOnly className="admin-input" disabled />
                                    </div>
                                )}
                                {selectedOrder.amount_per_person_formatted && (
                                    <div className="admin-form-group">
                                        <label>На человека</label>
                                        <input value={selectedOrder.amount_per_person_formatted} readOnly className="admin-input" disabled />
                                    </div>
                                )}
                            </div>
                            {selectedOrder.wishes && (
                                <div className="admin-form-group" style={{ marginTop: 16 }}>
                                    <label>Пожелания</label>
                                    <textarea value={selectedOrder.wishes || ''} readOnly className="admin-input" rows={3} disabled />
                                </div>
                            )}
                            {selectedOrder.admin_comment && (
                                <div className="admin-form-group" style={{ marginTop: 16 }}>
                                    <label>Комментарий администратора</label>
                                    <textarea value={selectedOrder.admin_comment || ''} readOnly className="admin-input" rows={2} disabled />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'menu' && selectedOrder.type === 'event' && (
                        <OrderItemsManager
                            order={selectedOrder}
                            onUpdate={(updatedOrder) => {
                                setSelectedOrder(updatedOrder);
                                // Обновляем заказ в списке
                                const updatedOrderId = updatedOrder.id;
                                updateOrder(updatedOrderId, updatedOrder);
                            }}
                        />
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                        <button className="btn-admin btn-admin-secondary" onClick={() => setSelectedOrder(null)}>
                            Закрыть
                        </button>
                    </div>
                </Modal>
            )}

            {/* Подтверждение удаления */}
            {confirmDelete && (
                <ConfirmDialog
                    message={`Удалить заказ #${confirmDelete.id} от ${confirmDelete.client_name}? Это действие нельзя отменить.`}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmDelete(null)}
                    confirmText={deleting ? 'Удаление...' : 'Удалить'}
                    cancelText="Отмена"
                />
            )}
        </div>
    );
}