import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { publicNews } from '../../api/public'
import SafeHtml from '../../shared/components/SafeHtml/SafeHtml'

export default function NewsDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en'

    const [news, setNews] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        setLoading(true)
        setError(null)

        publicNews.getById(id)
            .then(res => {
                setNews(res.data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to load news:', err)
                if (err.status === 404) {
                    setError(t('news.not_found') || 'Новость не найдена')
                } else {
                    setError(t('common.error') || 'Ошибка загрузки')
                }
                setLoading(false)
            })
    }, [id, t])

    if (loading) {
        return (
            <main>
                <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
                    <div className="loader">{t('common.loading')}</div>
                </div>
            </main>
        )
    }

    if (error || !news) {
        return (
            <main>
                <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
                    <p style={{ color: 'var(--error)', marginBottom: 'var(--spacing-md)' }}>{error || 'Новость не найдена'}</p>
                    <Link to="/news" className="btn btn-secondary">{t('news.back')}</Link>
                </div>
            </main>
        )
    }

    const content = news.content
    // Поддержка обоих форматов: plain text и HTML (из Tiptap)
    const isHtml = content?.trim().startsWith('<')

    return (
        <main>
            <div className="breadcrumbs">
                <div className="container">
                    <ul className="breadcrumbs-list">
                        <li><Link to="/">{t('breadcrumbs.home')}</Link></li>
                        <li><Link to="/news">{t('nav.news')}</Link></li>
                        <li>{news.title}</li>
                    </ul>
                </div>
            </div>

            <article className="page-section">
                <div className="container">
                    <div className="news-date" style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--text-tertiary)' }}>
                        {news.published_at_formatted}
                    </div>
                    <h1 className="display-36" style={{ marginBottom: 'var(--spacing-lg)' }}>{news.title}</h1>

                    {news.image_full && (
                        <img
                            src={news.image_full}
                            alt={news.title}
                            style={{
                                width: '100%',
                                borderRadius: 8,
                                marginBottom: 'var(--spacing-lg)'
                            }}
                            onError={(e) => {
                                if (news.image_thumb) {
                                    e.target.src = news.image_thumb
                                }
                            }}
                        />
                    )}

                    <div style={{ maxWidth: 800, margin: '0 auto' }}>
                        {content ? (
                            isHtml ? (
                                <SafeHtml html={content} />
                            ) : (
                                content.split('\n\n').map((para, i) => (
                                    <p key={i} className="body-16" style={{ marginBottom: 'var(--spacing-md)' }}>
                                        {para}
                                    </p>
                                ))
                            )
                        ) : (
                            <p className="body-16" style={{ color: 'var(--text-tertiary)' }}>
                                {t('news.no_content') || 'Содержимое отсутствует'}
                            </p>
                        )}

                        {news.tags && news.tags.length > 0 && (
                            <p className="small-14" style={{ color: 'var(--text-tertiary)', marginTop: 'var(--spacing-lg)' }}>
                                {news.tags.map(tag => `#${tag}`).join(' ')}
                            </p>
                        )}

                    </div>

                    <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'center' }}>
                        <Link to="/news" className="btn btn-secondary">{t('news.back')}</Link>
                        <Link to="/booking" className="btn btn-primary" style={{ marginLeft: 'var(--spacing-sm)' }}>
                            {t('news.book_table')}
                        </Link>
                    </div>
                </div>
            </article>
        </main>
    )
}