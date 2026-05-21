import { useAdminStore } from '../../hooks/useAdminStore'
import { Link } from 'react-router-dom'
import newsInitial from '../../../data/news.json'
import restaurantsInitial from '../../../data/restaurants.json'
import reviewsInitial from '../../../data/reviews.json'
import StatusBadge from '../../components/StatusBadge/StatusBadge'

const MOCK_ORDERS = [
    { id: 1001, type: 'Столик', client: 'Анна Иванова', date: '2025-06-20', status: 'new' },
    { id: 1002, type: 'Мероприятие', client: 'Михаил Смирнов', date: '2025-06-25', status: 'processing' },
    { id: 1003, type: 'Столик', client: 'Елена Петрова', date: '2025-06-18', status: 'confirmed' },
]

export default function Dashboard() {
    const { items: news }        = useAdminStore('admin_news', newsInitial)
    const { items: restaurants } = useAdminStore('admin_restaurants', restaurantsInitial)
    const { items: reviews }     = useAdminStore('admin_reviews', reviewsInitial)

    const pendingReviews = reviews.filter(r => r.status === 'pending').length

    const stats = [
        { label: 'Новостей',      value: news.length,        to: '/admin/news' },
        { label: 'Ресторанов',    value: restaurants.length,  to: '/admin/restaurants' },
        { label: 'Отзывов (ожид)', value: pendingReviews,     to: '/admin/reviews' },
        { label: 'Новых заказов', value: MOCK_ORDERS.filter(o => o.status === 'new').length, to: '/admin/orders' },
    ]

    return (
        <div>
            <div className="stats-grid">
                {stats.map(s => (
                    <Link to={s.to} key={s.label} style={{ textDecoration: 'none' }}>
                        <div className="stat-card" style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                             onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'}
                             onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                            <div className="stat-label">{s.label}</div>
                            <div className="stat-value">{s.value}</div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Последние заказы */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 400 }}>Последние заказы</h2>
                    <Link to="/admin/orders" style={{ fontSize: 13, color: 'var(--red-default)', textDecoration: 'none' }}>
                        Все заказы →
                    </Link>
                </div>
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                        <tr><th>ID</th><th>Тип</th><th>Клиент</th><th>Дата</th><th>Статус</th></tr>
                        </thead>
                        <tbody>
                        {MOCK_ORDERS.map(o => (
                            <tr key={o.id}>
                                <td>#{o.id}</td>
                                <td>{o.type}</td>
                                <td>{o.client}</td>
                                <td>{o.date}</td>
                                <td><StatusBadge status={o.status} /></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Отзывы на модерации */}
            {pendingReviews > 0 && (
                <div style={{ background: 'rgba(36,104,170,0.08)', border: '1px solid rgba(36,104,170,0.2)', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: 'var(--state-info)' }}>
            ⏳ Ожидают проверки <strong>{pendingReviews}</strong> отзывов
          </span>
                    <Link to="/admin/reviews" className="btn-admin btn-admin-primary" style={{ textDecoration: 'none', padding: '6px 16px', fontSize: 13 }}>
                        Проверить
                    </Link>
                </div>
            )}
        </div>
    )
}