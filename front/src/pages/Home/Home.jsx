import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import HeroSlider from '../../components/HeroSlider/HeroSlider'
import NewsCard from '../../components/NewsCard/NewsCard'
import newsData from '../../data/news.json'

export default function Home() {
    const { t } = useTranslation()

    const slides = [
        { image: 'https://picsum.photos/1920/600?random=1', title: t('home.hero_title_1'), subtitle: t('home.hero_sub_1'), link: { href: '/menu', label: t('home.see_menu') } },
        { image: 'https://picsum.photos/1920/600?random=2', title: t('home.hero_title_2'), subtitle: t('home.hero_sub_2'), link: { href: '/booking', label: t('home.book_now') } },
        { image: 'https://picsum.photos/1920/600?random=3', title: t('home.hero_title_3'), subtitle: t('home.hero_sub_3'), link: { href: '/menu', label: t('home.see_menu') } },
    ]

    const advantages = [
        { img: 'https://picsum.photos/400/300?random=10', title: t('home.adv_1_title'), desc: t('home.adv_1_desc') },
        { img: 'https://picsum.photos/400/300?random=11', title: t('home.adv_2_title'), desc: t('home.adv_2_desc') },
        { img: 'https://picsum.photos/400/300?random=12', title: t('home.adv_3_title'), desc: t('home.adv_3_desc') },
    ]

    const categories = [
        { img: 'https://picsum.photos/200/200?random=50', label: t('menu.breakfast'), anchor: '#breakfast' },
        { img: 'https://picsum.photos/200/200?random=51', label: t('menu.salads'), anchor: '#salads' },
        { img: 'https://picsum.photos/200/200?random=52', label: t('menu.hot'), anchor: '#hot' },
        { img: 'https://picsum.photos/200/200?random=53', label: t('menu.desserts'), anchor: '#desserts' },
    ]

    return (
        <main>
            <HeroSlider slides={slides} />

            {/* Advantages */}
            <section className="page-section">
                <div className="container">
                    <h2 className="h1-28 section-title">{t('home.advantages_title')}</h2>
                    <div className="grid-3">
                        {advantages.map((a, i) => (
                            <div className="card" key={i}>
                                <img src={a.img} alt={a.title} className="card-img" loading="lazy" />
                                <div className="card-content">
                                    <h3 className="h3-16-medium">{a.title}</h3>
                                    <p className="small-14">{a.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* News */}
            <section className="page-section">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                        <h2 className="h1-28">{t('home.news_title')}</h2>
                        <Link to="/news" className="btn btn-secondary">{t('home.all_news')}</Link>
                    </div>
                    <div className="news-grid">
                        {newsData.slice(0, 3).map(n => <NewsCard key={n.id} news={n} />)}
                    </div>
                </div>
            </section>

            {/* About teaser */}
            <section className="page-section">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                        <h2 className="h1-28">{t('home.about_title')}</h2>
                        <Link to="/about" className="btn btn-secondary">{t('home.more')}</Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                        <img src="https://picsum.photos/600/400?random=30" alt="Interior" style={{ width: '100%', borderRadius: 8 }} loading="lazy" />
                        <div>
                            <h3 className="h2-22">{t('home.about_story_title')}</h3>
                            <p className="body-16" style={{ margin: 'var(--spacing-md) 0' }}>{t('home.about_text_1')}</p>
                            <p className="body-16">{t('home.about_text_2')}</p>
                            <div style={{ marginTop: 'var(--spacing-lg)' }}>
                                <Link to="/about#restaurants" className="btn btn-primary">{t('home.our_restaurants')}</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="page-section">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                        <h2 className="h1-28">{t('home.categories_title')}</h2>
                        <Link to="/menu" className="btn btn-secondary">{t('home.all_menu')}</Link>
                    </div>
                    <div className="categories-grid">
                        {categories.map((c, i) => (
                            <Link to={`/menu${c.anchor}`} key={i} className="category-card" style={{ textDecoration: 'none' }}>
                                <img src={c.img} alt={c.label} className="category-img" loading="lazy" />
                                <h3 className="h3-16-medium">{c.label}</h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="page-section cta-section">
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 className="h1-28" style={{ color: 'white' }}>{t('home.cta_title')}</h2>
                    <p className="body-16" style={{ margin: 'var(--spacing-md) 0', color: 'var(--text-tertiary)' }}>{t('home.cta_sub')}</p>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                        <Link to="/booking" className="btn btn-primary">{t('home.book_table')}</Link>
                        <Link to="/events" className="btn btn-secondary" style={{ background: 'transparent', color: 'white', borderColor: 'white' }}>
                            {t('home.order_event')}
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}