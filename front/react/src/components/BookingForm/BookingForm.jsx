import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const today = new Date().toISOString().split('T')[0]

export default function BookingForm() {
    const { t } = useTranslation()
    const [form, setForm] = useState({
        name: '', phone: '', email: '', restaurant: '', date: '', time: '', guests: '', wishes: ''
    })

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

    const handleSubmit = e => {
        e.preventDefault()
        console.log('BookingForm submit:', form)
        alert(t('booking.title') + ' — OK!')
        setForm({ name: '', phone: '', email: '', restaurant: '', date: '', time: '', guests: '', wishes: '' })
    }

    return (
        <form onSubmit={handleSubmit}>
            {[
                { label: t('booking.name'), name: 'name', type: 'text', placeholder: t('forms.name_placeholder') },
                { label: t('booking.phone'), name: 'phone', type: 'tel', placeholder: t('forms.phone_placeholder') },
                { label: t('booking.email'), name: 'email', type: 'email', placeholder: t('forms.email_placeholder') },
            ].map(f => (
                <div className="form-group" key={f.name}>
                    <label className="form-label">{f.label}</label>
                    <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange}
                           className="form-control" placeholder={f.placeholder} required />
                </div>
            ))}

            <div className="form-group">
                <label className="form-label">{t('booking.restaurant')}</label>
                <select name="restaurant" value={form.restaurant} onChange={handleChange} className="form-control" required>
                    <option value="">{t('booking.choose_restaurant')}</option>
                    <option value="tverskaya">{t('booking.choose_restaurant') === 'Choose a restaurant' ? 'Tverskaya Restaurant' : 'Ресторан на Тверской'}</option>
                    <option value="patriarshiye">{t('booking.choose_restaurant') === 'Choose a restaurant' ? 'Patriarshiye Ponds' : 'Ресторан на Патриарших'}</option>
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">{t('booking.date')}</label>
                <input type="date" name="date" value={form.date} onChange={handleChange}
                       className="form-control" min={today} required />
            </div>
            <div className="form-group">
                <label className="form-label">{t('booking.time')}</label>
                <input type="time" name="time" value={form.time} onChange={handleChange} className="form-control" required />
            </div>
            <div className="form-group">
                <label className="form-label">{t('booking.guests')}</label>
                <input type="number" name="guests" value={form.guests} onChange={handleChange}
                       className="form-control" min={1} max={50} required />
            </div>
            <div className="form-group">
                <label className="form-label">{t('booking.wishes')}</label>
                <textarea name="wishes" value={form.wishes} onChange={handleChange}
                          className="form-control" rows={3} placeholder={t('booking.wishes_placeholder')} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{t('booking.submit')}</button>
        </form>
    )
}