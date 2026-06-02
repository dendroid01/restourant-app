import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
    { to: '/admin',             icon: '📊', label: 'Дашборд',   permission: null },
    { to: '/admin/news',        icon: '📰', label: 'Новости',    permission: 'news' },
    { to: '/admin/restaurants', icon: '🏛️', label: 'Рестораны',  permission: 'restaurants' },
    { to: '/admin/menu',        icon: '🍽️', label: 'Меню',       permission: 'menu' },
    { to: '/admin/pages',       icon: '📄', label: 'Страницы',    permission: 'pages' },
    { to: '/admin/reviews',     icon: '⭐', label: 'Отзывы',      permission: 'reviews' },
    { to: '/admin/orders',      icon: '📞', label: 'Заказы',      permission: 'orders' },
    { to: '/admin/managers',    icon: '👥', label: 'Менеджеры',   permission: 'managers' },
]

export default function AdminSidebar() {
    const { user, logout, isAdmin } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/admin/login')
    }

    const canAccess = (item) => {
        // Дашборд доступен всем авторизованным
        if (!item.permission) return true

        // Админ имеет доступ ко всему
        if (isAdmin) return true

        // Менеджеры проверяют свои права
        return user?.permissions?.includes(item.permission) ?? false
    }

    return (
        <aside className="admin-sidebar">
            <div className="admin-logo">✦ RESTORAN</div>
            <nav className="admin-nav">
                {NAV.filter(canAccess).map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/admin'}
                        className={({ isActive }) =>
                            `admin-nav-item${isActive ? ' active' : ''}`
                        }
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
                <button className="admin-nav-item logout" onClick={handleLogout}>
                    <span>🚪</span>
                    <span>Выход</span>
                </button>
            </nav>
        </aside>
    )
}