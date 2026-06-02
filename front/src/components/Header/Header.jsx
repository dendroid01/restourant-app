// src/components/Header/Header.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMenu } from '../../shared/context/MenuContext'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher' // Добавляем импорт

export default function Header() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const { categories, loading } = useMenu()
    const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en'

    const getCategoryAnchorId = (category) => {
        return `category-${category.id}`
    }

    const getCategoryTitle = (category) => {
        return category[`title_${lang}`] || category.title_ru || category.title
    }

    const rootCategories = categories.filter(cat => !cat.parent_id)

    // Функция для скролла вверх
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Обработчик клика по "Меню"
    const handleMenuClick = (e) => {
        e.preventDefault()
        if (window.location.pathname === '/menu') {
            scrollToTop()
        } else {
            navigate('/menu')
            setTimeout(scrollToTop, 100)
        }
    }

    // Обработчик клика по категории
    const handleCategoryClick = (e, categoryId) => {
        e.preventDefault()
        const anchorId = getCategoryAnchorId({ id: categoryId })

        if (window.location.pathname === '/menu') {
            const element = document.getElementById(anchorId)
            if (element) {
                const headerHeight = 100
                const elementPosition = element.getBoundingClientRect().top
                const offsetPosition = elementPosition + window.scrollY - headerHeight

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                })
                window.history.pushState(null, '', `#${anchorId}`)
            }
        } else {
            navigate(`/menu#${anchorId}`)
        }
    }

    return (
        <header className="main-header">
            <div className="container nav-container">
                <div className="logo">
                    <Link to="/" className="logo-18">La Belle Époque</Link>
                </div>
                <nav>
                    <ul className="nav-menu">
                        <li className="nav-item">
                            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                {t('nav.home')}
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink to="/about" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                {t('nav.about')}
                            </NavLink>
                            <ul className="dropdown-menu">
                                <li><Link to="/about#restaurants">{t('nav.restaurants')}</Link></li>
                                <li><Link to="/about#service">{t('nav.service')}</Link></li>
                                <li><Link to="/contacts">{t('nav.contacts')}</Link></li>
                                <li><Link to="/about#awards">{t('nav.awards')}</Link></li>
                                <li><Link to="/about#staff">{t('nav.staff')}</Link></li>
                                <li><Link to="/about#reviews">{t('nav.reviews')}</Link></li>
                            </ul>
                        </li>

                        <li className="nav-item">
                            <NavLink
                                to="/menu"
                                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                                onClick={handleMenuClick}
                            >
                                {t('nav.menu')}
                            </NavLink>
                            {!loading && rootCategories.length > 0 && (
                                <ul className="dropdown-menu">
                                    {rootCategories.map(category => (
                                        <li key={category.id}>
                                            <a
                                                href={`/menu#${getCategoryAnchorId(category)}`}
                                                onClick={(e) => handleCategoryClick(e, category.id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {getCategoryTitle(category)}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {loading && (
                                <ul className="dropdown-menu">
                                    <li><Link to="/menu">{t('nav.loading')}</Link></li>
                                </ul>
                            )}
                        </li>

                        <li className="nav-item">
                            <NavLink to="/news" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                {t('nav.news')}
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink to="/events" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                {t('nav.events')}
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink to="/contacts" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                {t('nav.contacts')}
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <LanguageSwitcher /> {/* Возвращаем кнопку перевода */}
                    <Link to="/booking" className="btn btn-primary" style={{ padding: '8px 16px' }}>
                        {t('nav.booking')}
                    </Link>
                </div>
            </div>
        </header>
    )
}