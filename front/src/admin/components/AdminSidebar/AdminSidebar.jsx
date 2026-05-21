import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
    { to: '/admin',             icon: '📊', label: 'Дашборд',   end: true },
    { to: '/admin/news',        icon: '📰', label: 'Новости' },
    { to: '/admin/restaurants', icon: '🏛️', label: 'Рестораны' },
    { to: '/admin/menu',        icon: '🍽️', label: 'Меню' },
    { to: '/admin/pages',       icon: '📄', label: 'Страницы' },
    { to: '/admin/reviews',     icon: '⭐', label: 'Отзывы' },
    { to: '/admin/orders',      icon: '📞', label: 'Заказы' },
    { to: '/admin/managers',    icon: '👥', label: 'Менеджеры' },
]

export default function AdminSidebar() {
    const { logout, isAdmin } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/admin/login')
    }

    return (
        <aside className="admin-sidebar">
            <div className="admin-logo">✦ RESTORAN</div>
            <nav className="admin-nav">
                {NAV.filter(n => n.to !== '/admin/managers' || isAdmin).map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
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