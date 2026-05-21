import { useTranslation } from 'react-i18next'
import SafeHtml from '../../shared/components/SafeHtml/SafeHtml'

export default function DishCard({ dish }) {
    const { i18n } = useTranslation()
    const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en'
    const description = dish[`description_${lang}`] ?? ''
    const isHtml = description.trim().startsWith('<')

    return (
        <div className="menu-item">
            <img src={dish.image} alt={dish[`title_${lang}`]} className="menu-item-img" loading="lazy" />
            <div className="menu-item-info">
                <h3 className="h3-16-medium">{dish[`title_${lang}`]}</h3>
                {isHtml
                    ? <SafeHtml html={description} className="rich-html caption-12" />
                    : <p className="caption-12">{description}</p>
                }
                <p className="price-20" style={{ marginTop: 'var(--spacing-xs)' }}>
                    {dish.price.toLocaleString()} ₽
                </p>
            </div>
        </div>
    )
}