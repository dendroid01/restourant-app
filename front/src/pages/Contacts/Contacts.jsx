import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useForm, RULES } from '../../shared/hooks/useForm'
import FormField from '../../shared/components/FormField/FormField'

const INITIAL = { name: '', email: '', phone: '', message: '' }

const SCHEMA = {
    name:    [RULES.required, RULES.minLength(2)],
    email:   [RULES.required, RULES.email],
    phone:   [RULES.phone],            // телефон необязателен, но если введён — валидируем
    message: [RULES.required, RULES.minLength(10)],
}

export default function Contacts() {
    const { t } = useTranslation()
    const { values, errors, touched, handleChange, handleBlur, handleSubmit, reset } =
        useForm(INITIAL, SCHEMA)

    const onValid = (data) => {
        console.log('ContactForm ✅', data)
        alert('Сообщение отправлено!')
        reset()
    }

    const field = (name, extra = {}) => ({
        name,
        value: values[name],
        error: errors[name],
        touched: touched[name],
        onChange: handleChange,
        onBlur: handleBlur,
        ...extra,
    })

    return (
        <main>
            <div className="breadcrumbs">
                <div className="container">
                    <ul className="breadcrumbs-list">
                        <li><Link to="/">{t('breadcrumbs.home')}</Link></li>
                        <li>{t('nav.contacts')}</li>
                    </ul>
                </div>
            </div>

            <section className="page-section">
                <div className="container">
                    <h1 className="h1-28 section-title">{t('contacts.title')}</h1>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>

                        {/* Контактная информация */}
                        <div>
                            <h2 className="h2-22" style={{ marginBottom: 'var(--spacing-md)' }}>
                                {t('contacts.reach_us')}
                            </h2>
                            <p className="body-16" style={{ marginBottom: 'var(--spacing-sm)' }}>
                                <i className="fas fa-phone" style={{ color: 'var(--brand-red-default)', width: 30 }} />
                                +7 (495) 123-45-67
                            </p>
                            <p className="body-16" style={{ marginBottom: 'var(--spacing-sm)' }}>
                                <i className="fas fa-envelope" style={{ color: 'var(--brand-red-default)', width: 30 }} />
                                info@labelleepoque.ru
                            </p>
                            <p className="body-16" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <i className="fas fa-map-marker-alt" style={{ color: 'var(--brand-red-default)', width: 30 }} />
                                г. Москва, ул. Тверская, 15
                            </p>

                            <h2 className="h2-22" style={{ marginBottom: 'var(--spacing-md)' }}>
                                {t('contacts.hours')}
                            </h2>
                            <p className="body-16"><strong>Ресторан на Тверской:</strong></p>
                            <p className="small-14">Пн-Вс: 12:00 — 00:00</p>
                            <p className="body-16" style={{ marginTop: 'var(--spacing-sm)' }}>
                                <strong>Ресторан на Патриарших:</strong>
                            </p>
                            <p className="small-14">Пн-Вс: 12:00 — 02:00</p>
                        </div>

                        {/* Форма */}
                        <div>
                            <h2 className="h2-22" style={{ marginBottom: 'var(--spacing-md)' }}>
                                {t('contacts.write_us')}
                            </h2>
                            <form onSubmit={handleSubmit(onValid)} noValidate>
                                <FormField
                                    {...field('name')}
                                    label="Имя"
                                    type="text"
                                    placeholder={t('forms.name_placeholder')}
                                    required
                                />
                                <FormField
                                    {...field('email')}
                                    label="Email"
                                    type="email"
                                    placeholder={t('forms.email_placeholder')}
                                    required
                                />
                                <FormField
                                    {...field('phone')}
                                    label="Телефон"
                                    type="tel"
                                    placeholder="+7 (9XX) XXX-XX-XX"
                                />
                                <FormField
                                    {...field('message')}
                                    label="Сообщение"
                                    type="textarea"
                                    placeholder={t('forms.message_placeholder')}
                                    rows={5}
                                    required
                                />
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                    {t('contacts.send')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Карта */}
            <section className="page-section">
                <div className="container">
                    <h2 className="h1-28 section-title">{t('contacts.map_title')}</h2>
                    <div className="map-placeholder">
                        <div style={{ textAlign: 'center' }}>
                            <i className="fas fa-map-marker-alt"
                               style={{ fontSize: 48, marginBottom: 'var(--spacing-md)', color: 'var(--brand-red-default)' }} />
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