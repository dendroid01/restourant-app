import { useTranslation } from 'react-i18next'
import HeroSlider from '../../components/HeroSlider/HeroSlider'
import DishCard from '../../components/DishCard/DishCard'
import menuData from '../../data/menu.json'
import { Link } from 'react-router-dom'

export default function Menu() {
    const { t, i18n } = useTranslation()
    const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en'

    const slides = menuData.recommended.map(d => ({
        image: d.image,
        title: d[`title_${lang}`],
        subtitle: d[`description_${lang}`] || t('menu.recommended'),
        price: d.price,
    }))

    const sections = [
        { id: 'breakfast', label: t('menu.breakfast') },
        { id: 'salads', label: t('menu.salads') },
        { id: 'hot', label: t('menu.hot') },
        { id: 'desserts', label: t('menu.desserts') },
        { id: 'wine', label: t('menu.wine') },
    ]

    return (
        <main>
            <div className="breadcrumbs"><div className="container"><ul className="breadcrumbs-list"><li><Link to="/">{t('breadcrumbs.home')}</Link></li><li>{t('nav.menu')}</li></ul></div></div>

            <HeroSlider slides={slides} height="500px" />

            {/* Categories */}
            <section className="page-section">
                <div className="container">
                    <h1 className="h1-28 section-title">{t('menu.title')}</h1>
                    <div className="categories-grid">
                        {menuData.categories.map(c => (
                            <a href={`#${c.id}`} key={c.id} className="category-card" style={{ textDecoration: 'none' }}>
                                <img src={c.image} alt={c[`title_${lang}`]} className="category-img" />
                                <h3 className="h3-16-medium">{c[`title_${lang}`]}</h3>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {sections.map(s => (
                <section id={s.id} className="page-section" key={s.id}>
                    <div className="container">
                        <h2 className="h1-28 section-title">{s.label}</h2>
                        <div className="menu-items-grid">
                            {(menuData.items[s.id] || []).map(dish => <DishCard key={dish.id} dish={dish} />)}
                        </div>
                    </div>
                </section>
            ))}
        </main>
    )
}