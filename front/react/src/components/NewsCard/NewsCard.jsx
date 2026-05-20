import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NewsCard({ news }) {
    const { t, i18n } = useTranslation()
    const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en'

    return (
        <div className="news-card">
            <img src={news.image_thumb} alt={news[`title_${lang}`]} className="card-img" loading="lazy" />
            <div className="card-content">
                <div className="news-date">{news[`date_${lang}`]}</div>
                <h2 className="h3-16-medium">{news[`title_${lang}`]}</h2>
                <p className="small-14">{news[`excerpt_${lang}`]}</p>
                <Link to={`/news/${news.id}`} className="btn-link" style={{ marginTop: 'var(--spacing-sm)', display: 'inline-block' }}>
                    {t('news.read_more')}
                </Link>
            </div>
        </div>
    )
}