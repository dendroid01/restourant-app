import { useTranslation } from 'react-i18next'
import { useForm, RULES } from '../../shared/hooks/useForm'
import FormField from '../../shared/components/FormField/FormField'

const minDate = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().split('T')[0]
})()

const INITIAL = {
    name: '', phone: '', email: '',
    date: '', guests: '', restaurant: '', wishes: '',
}

const SCHEMA = {
    name:       [RULES.required, RULES.minLength(2)],
    phone:      [RULES.required, RULES.phone],
    email:      [RULES.required, RULES.email],
    date:       [RULES.required],
    guests:     [RULES.required, RULES.min(10)],
    restaurant: [RULES.required],
}

export default function EventForm({ onGuestsChange }) {
    const { t, i18n } = useTranslation()
    const isRu = i18n.language?.startsWith('ru')

    const { values, errors, touched, handleChange, handleBlur, handleSubmit, reset } =
        useForm(INITIAL, SCHEMA)

    // Пробрасываем кол-во гостей наружу (для калькулятора)
    const handleChangeWrapped = (e) => {
        handleChange(e)
        if (e.target.name === 'guests') {
            onGuestsChange?.(parseInt(e.target.value) || 0)
        }
    }

    const onValid = (data) => {
        console.log('EventForm ✅', data)
    }

    const field = (name, extra = {}) => ({
        name,
        value: values[name],
        error: errors[name],
        touched: touched[name],
        onChange: handleChangeWrapped,
        onBlur: handleBlur,
        ...extra,
    })

    const restaurants = [
        { value: '', label: isRu ? 'Выберите ресторан' : 'Choose a restaurant' },
        { value: 'tverskaya', label: isRu ? 'Ресторан на Тверской' : 'Tverskaya Restaurant' },
        { value: 'patriarshiye', label: isRu ? 'Ресторан на Патриарших' : 'Patriarshiye Ponds' },
    ]

    return (
        <form id="eventForm" onSubmit={handleSubmit(onValid)} noValidate>
            <FormField {...field('name')} label={t('booking.name')} type="text" required />
            <FormField
                {...field('phone')}
                label={t('booking.phone')}
                type="tel"
                placeholder="+7 (9XX) XXX-XX-XX"
                required
            />
            <FormField {...field('email')} label={t('booking.email')} type="email" required />
            <FormField
                {...field('date')}
                label={t('booking.date')}
                type="date"
                required
                inputProps={{ min: minDate }}
            />
            <FormField
                {...field('guests')}
                label={isRu ? 'Количество гостей (от 10)' : 'Number of guests (min 10)'}
                type="number"
                required
                inputProps={{ min: 10 }}
            />
            <FormField
                {...field('restaurant')}
                label={t('booking.restaurant')}
                type="select"
                options={restaurants}
                required
            />
            <FormField
                {...field('wishes')}
                label={t('booking.wishes')}
                type="textarea"
                rows={3}
            />
        </form>
    )
}