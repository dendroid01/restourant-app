import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function Contacts() {
    const { t } = useTranslation()
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })

    const handleSubmit = e => {
        e.preventDefault()
        console.log('Contact form:', form)
        alert(t('contacts.send') + ' — OK!')
        setForm({ name: '', email: '', phone: '', message: '' })
    }

    return (
        <main>
            <div className="breadcrumbs"><div className="container"><ul className="breadcrumbs-list"><li><Link to="/">{t('breadcrumbs.home')}</Link></li><li>{t('nav.contacts')}</li></ul></div></div>
            <section className="page-section">
                <div className="container">
                    <h1 className="h1-28 section-title">{t('contacts.title')}</h1>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>
                        <div>
                            <h2 className="h2-22" style={{ marginBottom: 'var(--spacing-md)' }}>{t('contacts.reach_us')}</h2>
                            <p className="body-16" style={{ marginBottom: 'var(--spacing-sm)' }}><i className="fas fa-phone" style={{ color: 'var(--brand-red-default)', width: 30 }} /> +7 (495) 123-45-67</p>
                            <p className="body-16" style={{ marginBottom: 'var(--spacing-sm)' }}><i className="fas fa-envelope" style={{ color: 'var(--brand-red-default)', width: 30 }} /> info@labelleepoque.ru</p>
                            <p className="body-16" style={{ marginBottom: 'var(--spacing-lg)' }}><i className="fas fa-map-marker-alt" style={{ color: 'var(--brand-red-default)', width: 30 }} /> г. Москва, ул. Тверская, 15</p>
                            <h2 className="h2-22" style={{ marginBottom: 'var(--spacing-md)' }}>{t('contacts.hours')}</h2>
                            <p className="body-16"><strong>Ресторан на Тверской:</strong></p>
                            <p className="small-14">Пн-Вс: 12:00 - 00:00</p>
                            <p className="body-16" style={{ marginTop: 'var(--spacing-sm)' }}><strong>Ресторан на Патриарших:</strong></p>
                            <p className="small-14">Пн-Вс: 12:00 - 02:00</p>
                        </div>
                        <div>
                            <h2 className="h2-22" style={{ marginBottom: 'var(--spacing-md)' }}>{t('contacts.write_us')}</h2>
                            <form onSubmit={handleSubmit}>
                                {[
                                    { name: 'name', type: 'text', placeholder: t('forms.name_placeholder') },
                                    { name: 'email', type: 'email', placeholder: t('forms.email_placeholder') },
                                    { name: 'phone', type: 'tel', placeholder: t('forms.phone_placeholder') },
                                ].map(f => (
                                    <div className="form-group" key={f.name}>
                                        <input type={f.type} className="form-control" placeholder={f.placeholder}
                                               value={form[f.name]} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                                               required={f.name !== 'phone'} />
                                    </div>
                                ))}
                                <div className="form-group">
                  <textarea className="form-control" rows={5} placeholder={t('forms.message_placeholder')} required
                            value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{t('contacts.send')}</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
            <section className="page-section">
                <div className="container">
                    <h2 className="h1-28 section-title">{t('contacts.map_title')}</h2>
                    <div className="map-placeholder">
                        <div style={{ textAlign: 'center' }}>
                            <i className="fas fa-map-marker-alt" style={{ fontSize: 48, marginBottom: 'var(--spacing-md)', color: 'var(--brand-red-default)' }} />
                            <p className="body-16">{t('contacts.map_desc')}</p>
                            <p className="caption-12" style={{ marginTop: 'var(--spacing-sm)' }}>{t('contacts.map_sub')}</p>
                            <p className="small-14" style={{ marginTop: 'var(--spacing-md)' }}>{t('contacts.metro')}</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}