import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import BookingForm from '../../components/BookingForm/BookingForm'

export default function Booking() {
    const { t } = useTranslation()
    return (
        <main>
            <div className="breadcrumbs"><div className="container"><ul className="breadcrumbs-list"><li><Link to="/">{t('breadcrumbs.home')}</Link></li><li>{t('booking.title')}</li></ul></div></div>
            <section className="page-section">
                <div className="container">
                    <h1 className="h1-28 section-title">{t('booking.title')}</h1>
                    <div style={{ maxWidth: 600, margin: '0 auto', background: 'var(--bg-white)', padding: 'var(--spacing-lg)', borderRadius: 8 }}>
                        <BookingForm />
                    </div>
                </div>
            </section>
        </main>
    )
}