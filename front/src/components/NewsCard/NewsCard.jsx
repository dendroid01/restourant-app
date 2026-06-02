import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NewsCard({ news }) {
    const { t } = useTranslation()

    return (
        <div className="news-card">
            {news.image_thumb && (
                <img
                    src={news.image_thumb}
                    alt={news.title}
                    className="card-img"
                    loading="lazy"
                    onError={(e) => {
                        // Fallback если картинка не загрузилась
                        e.target.style.display = 'none'
                    }}
                />
            )}
            <div className="card-content">
                <div className="news-date">{news.published_at_formatted}</div>
                <h2 className="h3-16-medium">{news.title}</h2>
                <p className="small-14">{news.excerpt}</p>
                <Link
                    to={news.url || `/news/${news.id}`}
                    className="btn-link"
                    style={{ marginTop: 'var(--spacing-sm)', display: 'inline-block' }}
                >
                    {t('news.read_more')}
                </Link>
            </div>
        </div>
    )
}