import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import newsData from '../../data/news.json'

export default function NewsDetail() {
    const { id } = useParams()
    const { t, i18n } = useTranslation()
    const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en'
    const news = newsData.find(n => n.id === id)

    if (!news) return <main><div className="container" style={{ padding: '64px 0' }}><p>Новость не найдена</p></div></main>

    return (
        <main>
            <div className="breadcrumbs"><div className="container"><ul className="breadcrumbs-list">
                <li><Link to="/">{t('breadcrumbs.home')}</Link></li>
                <li><Link to="/news">{t('nav.news')}</Link></li>
                <li>{news[`title_${lang}`]}</li>
            </ul></div></div>

            <article className="page-section">
                <div className="container">
                    <div className="news-date" style={{ marginBottom: 'var(--spacing-sm)' }}>{news[`date_${lang}`]}</div>
                    <h1 className="display-36" style={{ marginBottom: 'var(--spacing-lg)' }}>{news[`title_${lang}`]}</h1>
                    <img src={news.image} alt={news[`title_${lang}`]} style={{ width: '100%', borderRadius: 8, marginBottom: 'var(--spacing-lg)' }} />
                    <div className="body-16" style={{ maxWidth: 800, margin: '0 auto' }}>
                        {news[`content_${lang}`].split('\n\n').map((para, i) => (
                            <p key={i} style={{ marginBottom: 'var(--spacing-md)' }}>{para}</p>
                        ))}
                        <p className="small-14" style={{ color: 'var(--text-tertiary)', marginTop: 'var(--spacing-lg)' }}>
                            {news.tags.map(tag => `#${tag}`).join(' ')}
                        </p>
                    </div>
                    <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'center' }}>
                        <Link to="/news" className="btn btn-secondary">{t('news.back')}</Link>
                        <Link to="/booking" className="btn btn-primary" style={{ marginLeft: 'var(--spacing-sm)' }}>{t('news.book_table')}</Link>
                    </div>
                </div>
            </article>
        </main>
    )
}