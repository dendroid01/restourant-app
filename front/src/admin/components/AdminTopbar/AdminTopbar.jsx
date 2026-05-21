import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const TITLES = {
    '/admin':             'Дашборд',
    '/admin/news':        'Новости',
    '/admin/restaurants': 'Рестораны',
    '/admin/menu':        'Меню',
    '/admin/pages':       'Страницы',
    '/admin/reviews':     'Отзывы',
    '/admin/orders':      'Заказы',
    '/admin/managers':    'Менеджеры',
}

export default function AdminTopbar() {
    const { pathname } = useLocation()
    const { user } = useAuth()
    const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? 'A'

    return (
        <div className="admin-topbar">
            <h1 className="admin-page-title">{TITLES[pathname] ?? 'Админпанель'}</h1>
            <div className="admin-user-info">
                <span>{user?.name}</span>
                <div className="admin-avatar">{initials}</div>
            </div>
        </div>
    )
}