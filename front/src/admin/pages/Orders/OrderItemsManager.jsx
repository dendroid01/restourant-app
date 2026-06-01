// src/components/Admin/Orders/OrderItemsManager.jsx
import { useState, useEffect } from 'react';
import { adminOrders } from '../../../api/admin';
import Modal from '../../components/Modal/Modal';
import { useToast } from '../../../shared/hooks/useToast';

function OrderItemsManager({ order, onUpdate, onClose }) {
    // Add defensive check for order
    const [items, setItems] = useState(order?.items || []);
    const [loading, setLoading] = useState(false);
    const [availableDishes, setAvailableDishes] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDish, setSelectedDish] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [updatingItemId, setUpdatingItemId] = useState(null);
    const [tempQuantity, setTempQuantity] = useState(1);
    const toast = useToast();

    // Update items when order changes, with defensive check
    useEffect(() => {
        if (order?.items) {
            setItems(order.items);
        } else {
            setItems([]);
        }
    }, [order?.items]);

    // Early return if order is not provided
    if (!order) {
        return (
            <div className="order-items-manager">
                <div className="empty-state" style={{ padding: 40 }}>
                    <div className="empty-state-icon">⚠️</div>
                    <p>Данные заказа не загружены</p>
                </div>
            </div>
        );
    }

    // Load available dishes
    const loadAvailableDishes = async () => {
        try {
            const response = await adminOrders.getAvailableDishes(order.original_id);
            setAvailableDishes(response.data || []);
        } catch (error) {
            console.error('Failed to load available dishes:', error);
            toast.error('Ошибка загрузки доступных блюд');
        }
    };

    const handleAddItem = async () => {
        if (!selectedDish) return;

        setLoading(true);
        try {
            const response = await adminOrders.addEventItem(order.original_id, {
                menu_item_id: selectedDish.id,
                quantity: quantity,
            });

            setItems(response.data.items || []);
            toast.success('Блюдо добавлено');
            setShowAddModal(false);
            setSelectedDish(null);
            setQuantity(1);
            if (onUpdate) onUpdate(response.data);
        } catch (error) {
            toast.error(error.message || 'Ошибка добавления блюда');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            handleDeleteItem(itemId);
            return;
        }

        setLoading(true);
        try {
            const response = await adminOrders.updateEventItem(order.original_id, itemId, {
                quantity: newQuantity,
            });

            setItems(response.data.items || []);
            setUpdatingItemId(null);
            if (onUpdate) onUpdate(response.data);
            toast.success('Количество обновлено');
        } catch (error) {
            toast.error(error.message || 'Ошибка обновления');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!confirm('Удалить блюдо из заказа?')) return;

        setLoading(true);
        try {
            const response = await adminOrders.deleteEventItem(order.original_id, itemId);
            setItems(response.data.items || []);
            if (onUpdate) onUpdate(response.data);
            toast.success('Блюдо удалено');
        } catch (error) {
            toast.error(error.message || 'Ошибка удаления');
        } finally {
            setLoading(false);
        }
    };

    // Open add modal
    const openAddModal = async () => {
        await loadAvailableDishes();
        setShowAddModal(true);
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const totalPerPerson = order.guests ? totalAmount / order.guests : totalAmount;

    return (
        <div className="order-items-manager">
            <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>Меню мероприятия</h3>
                    <button
                        className="btn-admin btn-admin-primary"
                        onClick={openAddModal}
                        style={{ padding: '6px 12px', fontSize: 13 }}
                    >
                        + Добавить блюдо
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="empty-state" style={{ padding: 40 }}>
                        <div className="empty-state-icon">🍽️</div>
                        <p>Нет добавленных блюд</p>
                        <button className="btn-admin btn-admin-primary" onClick={openAddModal}>
                            Добавить блюдо
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="admin-table-wrap">
                            <table className="admin-table" style={{ fontSize: 14 }}>
                                <thead>
                                <tr>
                                    <th>Блюдо</th>
                                    <th style={{ width: 120 }}>Цена за шт.</th>
                                    <th style={{ width: 140 }}>Количество</th>
                                    <th style={{ width: 120 }}>Сумма</th>
                                    <th style={{ width: 60 }}></th>
                                </tr>
                                </thead>
                                <tbody>
                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>
                                                {item.title_ru || item.title_en}
                                            </div>
                                        </td>
                                        <td>{item.price?.toLocaleString()} ₽</td>
                                        <td>
                                            {updatingItemId === item.id ? (
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <input
                                                        type="number"
                                                        value={tempQuantity}
                                                        onChange={(e) => setTempQuantity(Number(e.target.value))}
                                                        min="1"
                                                        max="100"
                                                        style={{ width: 70, padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, tempQuantity)}
                                                        className="icon-btn-admin"
                                                        style={{ color: '#10b981' }}
                                                        disabled={loading}
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={() => setUpdatingItemId(null)}
                                                        className="icon-btn-admin"
                                                        style={{ color: '#6b7280' }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{
                                                            cursor: 'pointer',
                                                            padding: '4px 8px',
                                                            background: '#f3f4f6',
                                                            borderRadius: 6,
                                                            minWidth: 50,
                                                            textAlign: 'center'
                                                        }}>
                                                            {item.quantity}
                                                        </span>
                                                    <button
                                                        onClick={() => {
                                                            setUpdatingItemId(item.id);
                                                            setTempQuantity(item.quantity);
                                                        }}
                                                        className="icon-btn-admin"
                                                        title="Изменить количество"
                                                    >
                                                        ✏️
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ fontFamily: 'Georgia, serif', color: 'var(--red-default)' }}>
                                            {item.subtotal?.toLocaleString()} ₽
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="icon-btn-admin"
                                                style={{ color: '#dc2626' }}
                                                title="Удалить"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot style={{ background: '#f9fafb', fontWeight: 600 }}>
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'right' }}>Итого:</td>
                                    <td>{totalAmount.toLocaleString()} ₽</td>
                                    <td></td>
                                </tr>
                                {order.guests && (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'right', fontSize: 13, color: '#6b7280' }}>
                                            На человека ({order.guests} чел.):
                                        </td>
                                        <td style={{ fontSize: 13 }}>{totalPerPerson.toLocaleString()} ₽</td>
                                        <td></td>
                                    </tr>
                                )}
                                </tfoot>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* Add dish modal */}
            {showAddModal && (
                <Modal title="Добавить блюдо" onClose={() => setShowAddModal(false)} maxWidth={600}>
                    <div>
                        <div className="admin-form-group">
                            <label>Выберите блюдо</label>
                            <select
                                value={selectedDish?.id || ''}
                                onChange={(e) => {
                                    const dish = availableDishes.find(d => d.id === Number(e.target.value));
                                    setSelectedDish(dish);
                                }}
                                className="admin-input"
                                style={{ width: '100%' }}
                            >
                                <option value="">-- Выберите блюдо --</option>
                                {availableDishes.map(dish => (
                                    <option key={dish.id} value={dish.id}>
                                        {dish.title_ru} — {dish.price_formatted}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedDish && (
                            <div className="admin-form-group">
                                <label>Количество порций</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="admin-input"
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                            <button className="btn-admin btn-admin-secondary" onClick={() => setShowAddModal(false)}>
                                Отмена
                            </button>
                            <button
                                className="btn-admin btn-admin-primary"
                                onClick={handleAddItem}
                                disabled={!selectedDish || loading}
                            >
                                {loading ? 'Добавление...' : 'Добавить'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default OrderItemsManager;