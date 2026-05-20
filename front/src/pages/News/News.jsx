import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import NewsCard from '../../components/NewsCard/NewsCard'
import newsData from '../../data/news.json'

export default function News() {
    const { t } = useTranslation()
    return (
        <main>
            <div className="breadcrumbs"><div className="container"><ul className="breadcrumbs-list"><li><Link to="/">{t('breadcrumbs.home')}</Link></li><li>{t('nav.news')}</li></ul></div></div>
            <section className="page-section">
                <div className="container">
                    <h1 className="h1-28 section-title">{t('news.title')}</h1>
                    <div className="news-grid">
                        {newsData.map(n => <NewsCard key={n.id} news={n} />)}
                    </div>
                </div>
            </section>
        </main>
    )
}