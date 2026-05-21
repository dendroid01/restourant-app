import { useState, useMemo } from 'react'
import { useAdminStore } from '../../hooks/useAdminStore'
import Modal from '../../components/Modal/Modal'
import StatusBadge from '../../components/StatusBadge/StatusBadge'

const MOCK_ORDERS = [
    { id: '1001', type: 'table', typeLabel: 'Бронирование столика', client: 'Анна Иванова', phone: '+7 (912) 345-67-89', email: 'anna@example.com', restaurant: 'Петровский', date: '2025-06-20', time: '19:00', guests: 4, wishes: 'Место у окна', status: 'new', amount: null },
    { id: '1002', type: 'event', typeLabel: 'Мероприятие', client: 'Михаил Смирнов', phone: '+7 (921) 456-78-90', email: 'mikhail@example.com', restaurant: 'Набережный', date: '2025-06-25', guests: 15, wishes: 'Детский день рождения', status: 'processing', amount: 45600 },
    { id: '1003', type: 'table', typeLabel: 'Бронирование столика', client: 'Елена Петрова', phone: '+7 (931) 567-89-01', email: 'elena@example.com', restaurant: 'Садовый', date: '2025-06-18', time: '20:30', guests: 2, wishes: 'Вегетарианское меню', status: 'confirmed', amount: null },
    { id: '1004', type: 'event', typeLabel: 'Мероприятие', client: 'Дмитрий Козлов', phone: '+7 (941) 678-90-12', email: 'dmitry@example.com', restaurant: 'Петровский', date: '2025-07-05', guests: 30, wishes: 'Корпоратив, проектор', status: 'new', amount: 124500 },
    { id: '1005', type: 'table', typeLabel: 'Бронирование столика', client: 'Ольга Соколова', phone: '+7 (951) 789-01-23', email: 'olga@example.com', restaurant: 'Набережный', date: '2025-06-15', time: '18:00', guests: 6, wishes: '', status: 'cancelled', amount: null },
]

const STATUS_OPTIONS = [
    { value: 'new',        label: 'Новая' },
    { value: 'processing', label: 'В обработке' },
    { value: 'confirmed',  label: 'Подтверждена' },
    { value: 'cancelled',  label: 'Отменена' },
]

export default function AdminOrders() {
    const { items, update } = useAdminStore('admin_orders', MOCK_ORDERS)
    const [filters, setFilters] = useState({ type: 'all', status: 'all', restaurant: 'all', dateFrom: '', dateTo: '' })
    const [editing, setEditing] = useState(null)
    const [editForm, setEditForm] = useState({})

    const filtered = useMemo(() => items.filter(o => {
        if (filters.type !== 'all' && o.type !== filters.type) return false
        if (filters.status !== 'all' && o.status !== filters.status) return false
        if (filters.restaurant !== 'all' && o.restaurant !== filters.restaurant) return false
        if (filters.dateFrom && o.date < filters.dateFrom) return false
        if (filters.dateTo   && o.date > filters.dateTo)   return false
        return true
    }), [items, filters])

    const openEdit = order => {
        setEditing(order.id)
        setEditForm({ ...order })
    }

    const handleSave = () => {
        update(editing, editForm)
        setEditing(null)
    }

    const ef = field => ({
        value: editForm[field] ?? '',
        onChange: e => setEditForm(p => ({ ...p, [field]: e.target.value })),
        className: 'admin-input',
    })

    const setFilter = (k, v) => setFilters(p => ({ ...p, [k]: v }))

    return (
        <div>
            {/* Фильтры */}
            <div className="admin-filters">
                {[
                    { key: 'type', label: 'Тип', options: [{ value: 'all', label: 'Все' }, { value: 'table', label: 'Бронирование' }, { value: 'event', label: 'Мероприятие' }] },
                    { key: 'status', label: 'Статус', options: [{ value: 'all', label: 'Все' }, ...STATUS_OPTIONS] },
                    { key: 'restaurant', label: 'Ресторан', options: [{ value: 'all', label: 'Все' }, { value: 'Петровский', label: 'Петровский' }, { value: 'Набережный', label: 'Набережный' }, { value: 'Садовый', label: 'Садовый' }] },
                ].map(f => (
                    <div className="admin-filter-group" key={f.key}>
                        <label>{f.label}</label>
                        <select className="admin-input" value={filters[f.key]} onChange={e => setFilter(f.key, e.target.value)}>
                            {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                ))}
                <div className="admin-filter-group">
                    <label>Дата от</label>
                    <input type="date" className="admin-input" value={filters.dateFrom} onChange={e => setFilter('dateFrom', e.target.value)} />
                </div>
                <div className="admin-filter-group">
                    <label>Дата до</label>
                    <input type="date" className="admin-input" value={filters.dateTo} onChange={e => setFilter('dateTo', e.target.value)} />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">📋</div><p>Нет заказов по фильтрам</p></div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead><tr><th>ID</th><th>Тип</th><th>Клиент</th><th>Ресторан</th><th>Дата</th><th>Статус</th><th>Сумма</th><th>Действие</th></tr></thead>
                        <tbody>
                        {filtered.map(o => (
                            <tr key={o.id}>
                                <td style={{ color: 'var(--text-tertiary)' }}>#{o.id}</td>
                                <td>
                    <span className={`badge ${o.type === 'table' ? 'badge-success' : 'badge-error'}`} style={{ fontSize: 11 }}>
                      {o.typeLabel}
                    </span>
                                </td>
                                <td style={{ fontWeight: 500 }}>{o.client}</td>
                                <td>{o.restaurant}</td>
                                <td>{o.date}</td>
                                <td>
                                    <select
                                        className="admin-input"
                                        style={{ padding: '3px 8px', borderRadius: 20, fontSize: 12, width: 'auto' }}
                                        value={o.status}
                                        onChange={e => update(o.id, { status: e.target.value })}
                                    >
                                        {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                </td>
                                <td>{o.amount ? o.amount.toLocaleString() + ' ₽' : '—'}</td>
                                <td>
                                    <button className="btn-admin btn-admin-secondary" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => openEdit(o)}>
                                        📝 Ред.
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Модалка редактирования */}
            {editing && (
                <Modal title={`Заказ #${editing}`} onClose={() => setEditing(null)} maxWidth={620}>
                    <div>
                        {[
                            { label: 'Клиент', field: 'client' },
                            { label: 'Телефон', field: 'phone' },
                            { label: 'Email', field: 'email', type: 'email' },
                            { label: 'Дата', field: 'date', type: 'date' },
                            { label: 'Гостей', field: 'guests', type: 'number' },
                        ].map(row => (
                            <div key={row.field} className="order-detail-row">
                                <div className="order-detail-label">{row.label}</div>
                                <div className="order-detail-value">
                                    <input type={row.type ?? 'text'} {...ef(row.field)} />
                                </div>
                            </div>
                        ))}
                        {editForm.time !== undefined && (
                            <div className="order-detail-row">
                                <div className="order-detail-label">Время</div>
                                <div className="order-detail-value"><input type="time" {...ef('time')} /></div>
                            </div>
                        )}
                        <div className="order-detail-row">
                            <div className="order-detail-label">Пожелания</div>
                            <div className="order-detail-value"><textarea {...ef('wishes')} rows={2} className="admin-input" /></div>
                        </div>
                        <div className="order-detail-row">
                            <div className="order-detail-label">Статус</div>
                            <div className="order-detail-value">
                                <select {...ef('status')} className="admin-input">
                                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                            <button className="btn-admin btn-admin-secondary" onClick={() => setEditing(null)}>Отмена</button>
                            <button className="btn-admin btn-admin-primary" onClick={handleSave}>Сохранить</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}