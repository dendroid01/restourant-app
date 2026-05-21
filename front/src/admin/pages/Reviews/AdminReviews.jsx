import { useState } from 'react'
import { useAdminStore } from '../../hooks/useAdminStore'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import reviewsInitial from '../../../data/reviews.json'

// Добавляем статус pending к начальным данным
const withStatus = reviewsInitial.map((r, i) => ({
    ...r,
    status: i === 1 ? 'pending' : 'approved',
}))

const FILTERS = [
    { key: 'all',      label: 'Все' },
    { key: 'pending',  label: 'На проверке' },
    { key: 'approved', label: 'Одобренные' },
    { key: 'rejected', label: 'Отклонённые' },
]

export default function AdminReviews() {
    const { items, update, remove } = useAdminStore('admin_reviews', withStatus)
    const [filter, setFilter] = useState('all')
    const [confirm, setConfirm] = useState(null)

    const filtered = filter === 'all' ? items : items.filter(r => r.status === filter)

    const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n)

    return (
        <div>
            <div className="filter-btn-group">
                {FILTERS.map(f => (
                    <button key={f.key} className={`filter-pill${filter === f.key ? ' active' : ''}`}
                            onClick={() => setFilter(f.key)}>
                        {f.label}
                        <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
              ({f.key === 'all' ? items.length : items.filter(r => r.status === f.key).length})
            </span>
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">⭐</div><p>Нет отзывов</p></div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                        <tr><th>Имя</th><th>Оценка</th><th>Отзыв</th><th>Дата</th><th>Статус</th><th>Действия</th></tr>
                        </thead>
                        <tbody>
                        {filtered.map(r => (
                            <tr key={r.id}>
                                <td style={{ fontWeight: 500 }}>{r.name}</td>
                                <td style={{ color: 'var(--gold-default)', letterSpacing: 2 }}>{stars(r.rating)}</td>
                                <td style={{ maxWidth: 260 }}>
                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.text_ru}</div>
                                </td>
                                <td>{r.date_ru}</td>
                                <td><StatusBadge status={r.status} /></td>
                                <td>
                                    <button className="icon-btn-admin" title="Одобрить"
                                            onClick={() => update(r.id, { status: 'approved' })}>✅</button>
                                    <button className="icon-btn-admin" title="Отклонить"
                                            onClick={() => update(r.id, { status: 'rejected' })}>❌</button>
                                    <button className="icon-btn-admin" title="Удалить"
                                            onClick={() => setConfirm(r.id)}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {confirm && (
                <ConfirmDialog message="Удалить отзыв?" onConfirm={() => { remove(confirm); setConfirm(null) }} onCancel={() => setConfirm(null)} />
            )}
        </div>
    )
}