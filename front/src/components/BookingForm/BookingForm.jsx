import { useTranslation } from 'react-i18next'
import { useForm, RULES } from '../../shared/hooks/useForm'
import FormField from '../../shared/components/FormField/FormField'

const RESTAURANTS_RU = [
    { value: '', label: 'Выберите ресторан' },
    { value: 'tverskaya', label: 'Ресторан на Тверской' },
    { value: 'patriarshiye', label: 'Ресторан на Патриарших' },
]
const RESTAURANTS_EN = [
    { value: '', label: 'Choose a restaurant' },
    { value: 'tverskaya', label: 'Tverskaya Restaurant' },
    { value: 'patriarshiye', label: 'Patriarshiye Ponds' },
]

const today = new Date().toISOString().split('T')[0]

const INITIAL = {
    name: '', phone: '', email: '',
    restaurant: '', date: '', time: '',
    guests: '', wishes: '',
}

const SCHEMA = {
    name:       [RULES.required, RULES.minLength(2)],
    phone:      [RULES.required, RULES.phone],
    email:      [RULES.required, RULES.email],
    restaurant: [RULES.required],
    date:       [RULES.required],
    time:       [RULES.required],
    guests:     [RULES.required, RULES.min(1), RULES.max(50)],
}

export default function BookingForm() {
    const { t, i18n } = useTranslation()
    const isRu = i18n.language?.startsWith('ru')

    const { values, errors, touched, handleChange, handleBlur, handleSubmit, reset } =
        useForm(INITIAL, SCHEMA)

    const onValid = (data) => {
        console.log('BookingForm ✅', data)
        alert(isRu ? 'Бронирование отправлено!' : 'Booking submitted!')
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

    const restaurants = isRu ? RESTAURANTS_RU : RESTAURANTS_EN

    return (
        <form onSubmit={handleSubmit(onValid)} noValidate>
            <FormField
                {...field('name')}
                label={t('booking.name')}
                type="text"
                placeholder={t('forms.name_placeholder')}
                required
            />
            <FormField
                {...field('phone')}
                label={t('booking.phone')}
                type="tel"
                placeholder="+7 (9XX) XXX-XX-XX"
                required
            />
            <FormField
                {...field('email')}
                label={t('booking.email')}
                type="email"
                placeholder={t('forms.email_placeholder')}
                required
            />
            <FormField
                {...field('restaurant')}
                label={t('booking.restaurant')}
                type="select"
                options={restaurants}
                required
            />
            <FormField
                {...field('date')}
                label={t('booking.date')}
                type="date"
                required
                inputProps={{ min: today }}
            />
            <FormField
                {...field('time')}
                label={t('booking.time')}
                type="time"
                required
            />
            <FormField
                {...field('guests')}
                label={t('booking.guests')}
                type="number"
                required
                inputProps={{ min: 1, max: 50 }}
            />
            <FormField
                {...field('wishes')}
                label={t('booking.wishes')}
                type="textarea"
                placeholder={t('booking.wishes_placeholder')}
                rows={3}
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {t('booking.submit')}
            </button>
        </form>
    )
}