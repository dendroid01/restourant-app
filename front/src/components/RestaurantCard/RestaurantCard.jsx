import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import RestaurantGallery from '../RestaurantGallery/RestaurantGallery'
import './RestaurantCard.css'

export default function RestaurantCard({ restaurant, isExpanded = false }) {
    const { t, i18n } = useTranslation()
    const [expanded, setExpanded] = useState(isExpanded)

    const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en'

    const toggleExpand = () => setExpanded(!expanded)

    // Получаем список изображений (массив строк URL)
    const images = restaurant.galleries || []

    // Если нет галереи, но есть main_image - создаём массив с одним фото
    const galleryImages = images.length > 0
        ? images
        : (restaurant.main_image ? [restaurant.main_image] : [])

    return (
        <div className="restaurant-card" id={`restaurant-${restaurant.id}`}>
            <RestaurantGallery
                images={galleryImages}
                restaurantName={restaurant.name}
            />

            <div className="restaurant-info">
                <div className="restaurant-header">
                    <h2 className="h2-22">{restaurant.name}</h2>
                    {restaurant.description && (
                        <p className="restaurant-description body-16">{restaurant.description}</p>
                    )}
                </div>

                <div className="restaurant-details">
                    <div className="detail-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{restaurant.address}</span>
                    </div>

                    {restaurant.phone && (
                        <div className="detail-item">
                            <i className="fas fa-phone"></i>
                            <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
                        </div>
                    )}

                    {restaurant.hours && (
                        <div className="detail-item">
                            <i className="far fa-clock"></i>
                            <span>{restaurant.hours}</span>
                        </div>
                    )}
                </div>

                {restaurant.lat && restaurant.lng && !expanded && (
                    <button className="btn btn-outline" onClick={toggleExpand}>
                        {t('about.show_on_map') || 'Показать на карте'}
                    </button>
                )}

                {expanded && restaurant.lat && restaurant.lng && (
                    <div className="restaurant-map">
                        <iframe
                            title={`map-${restaurant.id}`}
                            width="100%"
                            height="300"
                            style={{ border: 0, borderRadius: '8px' }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}&z=15&output=embed`}
                        />
                        <button className="btn btn-secondary" onClick={toggleExpand}>
                            {t('about.hide_map') || 'Скрыть карту'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}