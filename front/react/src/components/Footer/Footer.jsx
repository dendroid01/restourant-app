import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
    const { t } = useTranslation()
    return (
        <footer className="main-footer">
            <div className="container">
                <div className="footer-grid">
                    <div>
                        <div className="logo-18" style={{ marginBottom: 'var(--spacing-md)' }}>La Belle Époque</div>
                        <p className="small-14">{t('footer.description')}</p>
                    </div>
                    <div>
                        <h3 className="h3-16-medium" style={{ color: 'white' }}>{t('footer.quick_links')}</h3>
                        <ul className="footer-links">
                            <li><Link to="/">{t('nav.home')}</Link></li>
                            <li><Link to="/about">{t('nav.about')}</Link></li>
                            <li><Link to="/news">{t('nav.news')}</Link></li>
                            <li><Link to="/contacts">{t('footer.sitemap')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="h3-16-medium" style={{ color: 'white' }}>{t('footer.contacts')}</h3>
                        <ul className="footer-links">
                            <li><i className="fas fa-phone" /> +7 (495) 123-45-67</li>
                            <li><i className="fas fa-envelope" /> info@labelleepoque.ru</li>
                            <li><i className="fas fa-map-marker-alt" /> г. Москва, ул. Тверская, 15</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="h3-16-medium" style={{ color: 'white' }}>{t('footer.social')}</h3>
                        <div className="social-icons">
                            <a href="#"><i className="fab fa-instagram" /></a>
                            <a href="#"><i className="fab fa-telegram" /></a>
                            <a href="#"><i className="fab fa-whatsapp" /></a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p className="caption-12">{t('footer.rights')}</p>
                </div>
            </div>
        </footer>
    )
}