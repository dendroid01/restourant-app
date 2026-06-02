// src/components/DishCard/DishCard.jsx
import { useTranslation } from 'react-i18next'
import SafeHtml from '../../shared/components/SafeHtml/SafeHtml'

export default function DishCard({ dish }) {
    const { i18n } = useTranslation()
    const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en'

    // API возвращает объект с полями title_ru/en, description_ru/en
    const title = dish[`title_${lang}`] || dish.title_ru || dish.title_en
    const description = dish[`description_${lang}`] || ''
    const isHtml = description && description.trim().startsWith('<')

    // Форматирование цены (API может вернуть строку или число)
    const price = typeof dish.price === 'number' ? dish.price : parseFloat(dish.price) || 0

    return (
        <div className="menu-item">
            {dish.image && (
                <img
                    src={dish.image}
                    alt={title}
                    className="menu-item-img"
                    loading="lazy"
                />
            )}
            <div className="menu-item-info">
                <h3 className="h3-16-medium">{title}</h3>
                {description && (
                    isHtml
                        ? <SafeHtml html={description} className="rich-html caption-12" />
                        : <p className="caption-12">{description}</p>
                )}
                <p className="price-20" style={{ marginTop: 'var(--spacing-xs)' }}>
                    {price.toLocaleString()} ₽
                </p>
            </div>
        </div>
    )
}