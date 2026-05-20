import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'

export default function Header() {
    const { t } = useTranslation()

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
                            <NavLink to="/menu" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                {t('nav.menu')}
                            </NavLink>
                            <ul className="dropdown-menu">
                                <li><Link to="/menu#breakfast">{t('nav.breakfast')}</Link></li>
                                <li><Link to="/menu#lunch">{t('nav.lunch')}</Link></li>
                                <li><Link to="/menu#dinner">{t('nav.dinner')}</Link></li>
                                <li><Link to="/menu#wine">{t('nav.wine')}</Link></li>
                            </ul>
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
                    <LanguageSwitcher />
                    <Link to="/booking" className="btn btn-primary" style={{ padding: '8px 16px' }}>
                        {t('nav.booking')}
                    </Link>
                </div>
            </div>
        </header>
    )
}