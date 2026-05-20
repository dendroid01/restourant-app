import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const minDate = (() => {
    const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().split('T')[0]
})()

export default function EventForm({ onGuestsChange }) {
    const { t } = useTranslation()
    const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', guests: '', restaurant: '', wishes: '' })

    const handleChange = e => {
        setForm(p => ({ ...p, [e.target.name]: e.target.value }))
        if (e.target.name === 'guests') onGuestsChange?.(parseInt(e.target.value) || 0)
    }

    const handleSubmit = e => {
        e.preventDefault()
        console.log('EventForm submit:', form)
    }

    return (
        <form id="eventForm" onSubmit={handleSubmit}>
            {[
                { label: t('booking.name'), name: 'name', type: 'text' },
                { label: t('booking.phone'), name: 'phone', type: 'tel' },
                { label: t('booking.email'), name: 'email', type: 'email' },
            ].map(f => (
                <div className="form-group" key={f.name}>
                    <label className="form-label">{f.label}</label>
                    <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange}
                           className="form-control" required />
                </div>
            ))}
            <div className="form-group">
                <label className="form-label">{t('booking.date')}</label>
                <input type="date" name="date" value={form.date} onChange={handleChange}
                       className="form-control" min={minDate} required />
            </div>
            <div className="form-group">
                <label className="form-label">{t('events.title')} — кол-во гостей (от 10)</label>
                <input type="number" name="guests" value={form.guests} onChange={handleChange}
                       className="form-control" min={10} required />
            </div>
            <div className="form-group">
                <label className="form-label">{t('booking.restaurant')}</label>
                <select name="restaurant" value={form.restaurant} onChange={handleChange} className="form-control" required>
                    <option value="">{t('booking.choose_restaurant')}</option>
                    <option value="tverskaya">Ресторан на Тверской</option>
                    <option value="patriarshiye">Ресторан на Патриарших</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">{t('booking.wishes')}</label>
                <textarea name="wishes" value={form.wishes} onChange={handleChange} className="form-control" rows={3} />
            </div>
        </form>
    )
}