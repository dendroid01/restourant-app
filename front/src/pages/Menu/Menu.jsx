// src/pages/Menu/Menu.jsx
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import HeroSlider from '../../components/HeroSlider/HeroSlider'
import DishCard from '../../components/DishCard/DishCard'
import { useMenu } from '../../shared/context/MenuContext' // Импортируем useMenu

export default function Menu() {
    const { t, i18n } = useTranslation()
    const location = useLocation()
    const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en'
    const { categories, featuredItems, loading, error } = useMenu() // Используем контекст
    const categoryRefs = useRef({})

    const getCategoryAnchorId = (category) => {
        return `category-${category.id}`
    }

    const escapeSelector = (selector) => {
        return CSS.escape(selector)
    }

    useEffect(() => {
        if (!loading && categories.length > 0) {
            const hash = location.hash
            if (hash) {
                try {
                    const escapedHash = escapeSelector(hash.slice(1))
                    const element = document.getElementById(escapedHash)
                    if (element) {
                        setTimeout(() => {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }, 100)
                    }
                } catch (error) {
                    console.error('Invalid selector:', hash, error)
                }
            }
        }
    }, [loading, categories, location.hash])

    const slides = featuredItems.map(item => ({
        image: item.image,
        title: item.title,
        subtitle: item.description || t('menu.recommended_from_chef'),
        price: item.price,
    }))

    const getCategoryItems = (category) => {
        if (category.items && category.items.length > 0) {
            return category.items
        }
        return []
    }

    const renderCategory = (category, level = 0) => {
        const title = category.title
        const items = getCategoryItems(category)
        const hasChildren = category.children && category.children.length > 0
        const anchorId = getCategoryAnchorId(category)

        return (
            <div key={category.id} className={`category-wrapper level-${level}`}>
                <section
                    id={anchorId}
                    ref={el => categoryRefs.current[anchorId] = el}
                    className="page-section"
                >
                    <div className="container">
                        <h2 className="h1-28 section-title" style={{ marginLeft: level > 0 ? 'var(--spacing-lg)' : '0' }}>
                            {title}
                        </h2>

                        {items.length > 0 && (
                            <div className="menu-items-grid">
                                {items.map(dish => (
                                    <DishCard key={dish.id} dish={dish} />
                                ))}
                            </div>
                        )}

                        {hasChildren && (
                            <div className="subcategories">
                                {category.children.map(child => renderCategory(child, level + 1))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        )
    }

    const renderCategoriesGrid = () => {
        const rootCategories = categories.filter(c => !c.parent_id)
        const categoriesToShow = rootCategories.length > 0 ? rootCategories : categories

        return (
            <div className="categories-grid">
                {categoriesToShow.map(category => {
                    const anchorId = getCategoryAnchorId(category)
                    return (
                        <a
                            href={`#${anchorId}`}
                            key={category.id}
                            className="category-card"
                            style={{ textDecoration: 'none' }}
                            onClick={(e) => {
                                e.preventDefault()
                                const element = document.getElementById(anchorId)
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                    window.history.pushState(null, '', `#${anchorId}`)
                                }
                            }}
                        >
                            <img
                                src={category.image || 'https://picsum.photos/id/20/300/200'}
                                alt={category.title}
                                className="category-img"
                            />
                            <h3 className="h3-16-medium">
                                {category.title}
                            </h3>
                        </a>
                    )
                })}
            </div>
        )
    }

    if (loading) {
        return (
            <main>
                <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div className="loader">Загрузка меню...</div>
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main>
                <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div className="error-message">
                        <h2>Ошибка загрузки меню</h2>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()}>Попробовать снова</button>
                    </div>
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
                        <li>{t('nav.menu')}</li>
                    </ul>
                </div>
            </div>

            {slides.length > 0 && (
                <HeroSlider slides={slides} height="500px" />
            )}

            {categories.length > 0 && (
                <section className="page-section">
                    <div className="container">
                        <h1 className="h1-28 section-title">{t('menu.title')}</h1>
                        {renderCategoriesGrid()}
                    </div>
                </section>
            )}

            {categories.map(category => renderCategory(category))}

            {categories.length === 0 && !loading && (
                <section className="page-section">
                    <div className="container">
                        <p style={{ textAlign: 'center' }}>Меню временно недоступно</p>
                    </div>
                </section>
            )}
        </main>
    )
}