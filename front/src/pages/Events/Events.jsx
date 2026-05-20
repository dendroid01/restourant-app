import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import EventForm from '../../components/EventForm/EventForm'
import Calculator from '../../components/Calculator/Calculator'

export default function Events() {
    const { t } = useTranslation()
    const [guestCount, setGuestCount] = useState(1)

    return (
        <main>
            <div className="breadcrumbs"><div className="container"><ul className="breadcrumbs-list"><li><Link to="/">{t('breadcrumbs.home')}</Link></li><li>{t('nav.events')}</li></ul></div></div>
            <section className="page-section">
                <div className="container">
                    <h1 className="h1-28 section-title">{t('events.title')}</h1>
                    <div style={{ maxWidth: 800, margin: '0 auto' }}>
                        <EventForm onGuestsChange={setGuestCount} />
                        <Calculator guestCount={guestCount} />
                    </div>
                </div>
            </section>
        </main>
    )
}