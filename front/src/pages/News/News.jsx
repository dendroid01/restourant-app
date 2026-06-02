import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { publicNews } from '../../api/public'
import NewsCard from '../../components/NewsCard/NewsCard'

export default function News() {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()
    const [news, setNews] = useState([])
    const [meta, setMeta] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const currentPage = parseInt(searchParams.get('page') || '1')

    // Загрузка новостей
    useEffect(() => {
        setLoading(true)
        setError(null)

        const filters = {
            page: currentPage,
            per_page: 9,
        }

        publicNews.getList(filters)
            .then(res => {
                setNews(res.data)
                setMeta(res.meta)
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to load news:', err)
                setError(t('common.error') || 'Не удалось загрузить новости')
                setLoading(false)
            })
    }, [currentPage, t])

    const handlePageChange = (newPage) => {
        if (newPage === currentPage) return
        if (newPage < 1 || (meta && newPage > meta.last_page)) return
        setSearchParams({ page: newPage })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (loading && news.length === 0) {
        return (
            <main>
                <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
                    <div className="loader">{t('common.loading')}</div>
                </div>
            </main>
        )
    }

    return (
        <main>
            <div className="breadcrumbs">
                <div className="container">
                    <ul className="breadcrumbs-list">
                        <li><Link to="/">{t('breadcrumbs.home')}</Link></li>
                        <li>{t('nav.news')}</li>
                    </ul>
                </div>
            </div>

            <section className="page-section">
                <div className="container">
                    <h1 className="h1-28 section-title">{t('news.title')}</h1>

                    {error && (
                        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--error)' }}>
                            {error}
                        </div>
                    )}

                    {!error && news.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '32px' }}>
                            <p>{t('news.no_news') || 'Новости не найдены'}</p>
                        </div>
                    )}

                    <div className="news-grid">
                        {news.map(item => (
                            <NewsCard key={item.id} news={item} />
                        ))}
                    </div>

                    {/* Пагинация */}
                    {meta && meta.last_page > 1 && (
                        <div className="pagination" style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 'var(--spacing-sm)',
                            marginTop: 'var(--spacing-xl)'
                        }}>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="pagination-btn"
                                style={{
                                    padding: '8px 16px',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 8,
                                    cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentPage <= 1 ? 0.5 : 1
                                }}
                            >
                                ← {t('pagination.prev') || 'Назад'}
                            </button>

                            <span style={{ padding: '8px 16px' }}>
                                {t('pagination.page') || 'Страница'} {currentPage} {t('pagination.of') || 'из'} {meta.last_page}
                            </span>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= meta.last_page}
                                className="pagination-btn"
                                style={{
                                    padding: '8px 16px',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 8,
                                    cursor: currentPage >= meta.last_page ? 'not-allowed' : 'pointer',
                                    opacity: currentPage >= meta.last_page ? 0.5 : 1
                                }}
                            >
                                {t('pagination.next') || 'Вперёд'} →
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}