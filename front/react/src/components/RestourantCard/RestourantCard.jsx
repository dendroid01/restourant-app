import { useTranslation } from 'react-i18next'

export default function RestaurantCard({ restaurant }) {
    const { i18n } = useTranslation()
    const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en'

    return (
        <div className="restaurant-card">
            <img src={restaurant.image} alt={restaurant[`name_${lang}`]} style={{ width: '100%', borderRadius: '8px' }} loading="lazy" />
            <div>
                <h2 className="h2-22">{restaurant[`name_${lang}`]}</h2>
                <p className="body-16" style={{ margin: 'var(--spacing-sm) 0' }}>{restaurant[`description_${lang}`]}</p>
                <p className="small-14"><i className="fas fa-map-marker-alt" /> {restaurant[`address_${lang}`]}</p>
                <p className="small-14"><i className="fas fa-phone" /> {restaurant.phone}</p>
                <p className="small-14"><i className="fas fa-clock" /> {restaurant[`hours_${lang}`]}</p>
            </div>
        </div>
    )
}