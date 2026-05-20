import { useTranslation } from 'react-i18next'

export default function ReviewCard({ review }) {
    const { i18n } = useTranslation()
    const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en'
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)

    return (
        <div className="review-card">
            <div className="rating">{stars}</div>
            <p className="body-16" style={{ margin: 'var(--spacing-sm) 0' }}>{review[`text_${lang}`]}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="small-14">{review.name}</span>
                <span className="caption-12">{review[`date_${lang}`]}</span>
            </div>
        </div>
    )
}