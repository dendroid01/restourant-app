import { useTranslation } from 'react-i18next'

export default function DishCard({ dish }) {
    const { i18n } = useTranslation()
    const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en'

    return (
        <div className="menu-item">
            <img src={dish.image} alt={dish[`title_${lang}`]} className="menu-item-img" loading="lazy" />
            <div className="menu-item-info">
                <h3 className="h3-16-medium">{dish[`title_${lang}`]}</h3>
                <p className="caption-12">{dish[`description_${lang}`]}</p>
                <p className="price-20" style={{ marginTop: 'var(--spacing-xs)' }}>
                    {dish.price.toLocaleString()} ₽
                </p>
            </div>
        </div>
    )
}