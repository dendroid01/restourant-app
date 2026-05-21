import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard'
import ReviewCard from '../../components/ReviewCard/ReviewCard'
import restaurantsData from '../../data/restaurants.json'
import reviewsData from '../../data/reviews.json'
import { useToast } from '../../shared/hooks/useToast'

function ReviewModal({ onClose }) {
    const { t } = useTranslation()
    const [form, setForm] = useState({ name: '', email: '', rating: '5', text: '' })
    const toast = useToast()

    const handleSubmit = e => {
        e.preventDefault()
        console.log('Review submit:', form)
        toast.success(t('about.review_sent') || 'Спасибо за отзыв!')
        onClose()
    }

    return (
        <div className="modal active" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <h2 className="h2-22">Оставить отзыв</h2>
                <form onSubmit={handleSubmit}>
                    {['name', 'email'].map(f => (
                        <div className="form-group" key={f}>
                            <label className="form-label">{f === 'name' ? t('forms.your_name') : 'Email'}</label>
                            <input type={f === 'email' ? 'email' : 'text'} className="form-control"
                                   value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} required />
                        </div>
                    ))}
                    <div className="form-group">
                        <label className="form-label">{t('forms.rating')}</label>
                        <select className="form-control" value={form.rating} onChange={e => setForm(p => ({ ...p, rating: e.target.value }))}>
                            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{'★'.repeat(r)} ({r})</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('forms.review_text')}</label>
                        <textarea className="form-control" rows={4} required value={form.text}
                                  onChange={e => setForm(p => ({ ...p, text: e.target.value }))} />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <button type="submit" className="btn btn-primary">{t('forms.send')}</button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>{t('forms.cancel')}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function About() {
    const { t,i18n } = useTranslation()
    const [showModal, setShowModal] = useState(false)

    const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en'

    const services = [
        { icon: 'fa-concierge-bell', title: t('about.service_1_title'), desc: t('about.service_1_desc') },
        { icon: 'fa-music', title: t('about.service_2_title'), desc: t('about.service_2_desc') },
        { icon: 'fa-glass-cheers', title: t('about.service_3_title'), desc: t('about.service_3_desc') },
    ]

    const staff = [
        { img: 'https://picsum.photos/300/300?random=40', name: 'Жан-Пьер Дюбуа', role_ru: 'Шеф-повар', role_en: 'Head Chef', desc_ru: 'Обладатель звезды Мишлен', desc_en: 'Michelin Star holder' },
        { img: 'https://picsum.photos/300/300?random=41', name: 'Мария Соколова', role_ru: 'Сомелье', role_en: 'Sommelier', desc_ru: 'Лучший сомелье России', desc_en: "Russia's best sommelier" },
        { img: 'https://picsum.photos/300/300?random=42', name: 'Алексей Волков', role_ru: 'Шеф-кондитер', role_en: 'Pastry Chef', desc_ru: 'Стажировка в Париже', desc_en: 'Trained in Paris' },
        { img: 'https://picsum.photos/300/300?random=43', name: 'Екатерина Морозова', role_ru: 'Управляющий', role_en: 'Manager', desc_ru: '20 лет в ресторанном бизнесе', desc_en: '20 years in the restaurant business' },
    ]

    const awards = [
        { img: 'https://picsum.photos/300/200?random=70', title_ru: 'Звезда Мишлен', title_en: 'Michelin Star', year: '2023', desc_ru: 'Присуждена за выдающуюся кухню', desc_en: 'Awarded for outstanding cuisine' },
        { img: 'https://picsum.photos/300/200?random=71', title_ru: 'Лучший ресторан Москвы', title_en: 'Best Moscow Restaurant', year: '2022', desc_ru: 'Премия "Пальмовая ветвь"', desc_en: '"Palm Branch" award' },
        { img: 'https://picsum.photos/300/200?random=72', title_ru: 'Лучший сомелье', title_en: 'Best Sommelier', year: '2021', desc_ru: 'Мария Соколова', desc_en: 'Maria Sokolova' },
    ]

    return (
        <main>
            <div className="breadcrumbs"><div className="container"><ul className="breadcrumbs-list"><li><a href="/">{t('breadcrumbs.home')}</a></li><li>{t('nav.about')}</li></ul></div></div>

            {/* Restaurants */}
            <section id="restaurants" className="page-section">
                <div className="container">
                    <h1 className="h1-28 section-title">{t('about.title')}</h1>
                    {restaurantsData.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
                </div>
            </section>

            {/* Service */}
            <section id="service" className="page-section">
                <div className="container">
                    <h2 className="h1-28 section-title">{t('about.service_title')}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--spacing-lg)' }}>
                        {services.map((s, i) => (
                            <div className="card" key={i}>
                                <div className="card-content">
                                    <i className={`fas ${s.icon}`} style={{ fontSize: 48, color: 'var(--brand-gold-default)' }} />
                                    <h3 className="h3-16-medium" style={{ marginTop: 'var(--spacing-md)' }}>{s.title}</h3>
                                    <p className="small-14">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Awards */}
            <section id="awards" className="page-section">
                <div className="container">
                    <h2 className="h1-28 section-title">{t('about.awards_title')}</h2>
                    <div className="awards-grid">
                        {awards.map((a, i) => (
                            <div className="award-card card" key={i}>
                                <img src={a.img} alt={a.title_ru} className="card-img" />
                                <div className="card-content">
                                    <h3 className="h3-16-medium">{a[`title_${lang}`] || a.title_ru}</h3>
                                    <p className="label-11-uppercase">{a.year}</p>
                                    <p className="small-14">{a[`desc_${lang}`] || a.desc_ru}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Staff */}
            <section id="staff" className="page-section">
                <div className="container">
                    <h2 className="h1-28 section-title">{t('about.staff_title')}</h2>
                    <div className="staff-grid">
                        {staff.map((s, i) => (
                            <div className="staff-card" key={i}>
                                <img src={s.img} alt={s.name} className="staff-img" />
                                <h3 className="h3-16-medium">{s.name}</h3>
                                <p className="small-14">{s[`role_${lang}`]}</p>
                                <p className="caption-12">{s[`desc_${lang}`]}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Reviews */}
            <section id="reviews" className="page-section">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                        <h2 className="h1-28">{t('about.reviews_title')}</h2>
                        <button className="btn btn-secondary" onClick={() => setShowModal(true)}>{t('about.leave_review')}</button>
                    </div>
                    {reviewsData.map(r => <ReviewCard key={r.id} review={r} />)}
                </div>
            </section>

            {showModal && <ReviewModal onClose={() => setShowModal(false)} />}
        </main>
    )
}
