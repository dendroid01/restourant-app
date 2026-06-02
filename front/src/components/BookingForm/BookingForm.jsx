// src/components/BookingForm/BookingForm.jsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, RULES } from '../../shared/hooks/useForm'
import FormField from '../../shared/components/FormField/FormField'
import { useToast } from '../../shared/hooks/useToast'
import { publicApi } from '../../api/client'

const today = new Date().toISOString().split('T')[0]

const INITIAL = {
    client_name: '',
    phone: '',
    email: '',
    restaurant_id: '',
    date: '',
    time: '',
    guests: '',
    wishes: '',
}

const SCHEMA = {
    client_name: [RULES.required, RULES.fullName],
    phone: [RULES.required, RULES.phone],
    email: [RULES.required, RULES.email],
    restaurant_id: [RULES.required],
    date: [RULES.required],
    time: [RULES.required],
    guests: [RULES.required, RULES.min(1), RULES.max(50)],
}

export default function BookingForm() {
    const { t, i18n } = useTranslation()
    const isRu = i18n.language?.startsWith('ru')
    const toast = useToast()
    const [restaurants, setRestaurants] = useState([])
    const [loading, setLoading] = useState(false)

    const { values, errors, touched, handleChange, handleBlur, handleSubmit, reset } =
        useForm(INITIAL, SCHEMA)

    // Загрузка ресторанов
    useEffect(() => {
        loadRestaurants()
    }, [])

    const loadRestaurants = async () => {
        try {
            const response = await publicApi.getRestaurants()
            if (response.success && response.data) {
                const options = [
                    { value: '', label: isRu ? 'Выберите ресторан' : 'Choose a restaurant' },
                    ...response.data.map(r => ({
                        value: r.id.toString(),
                        label: r.label
                    }))
                ]
                setRestaurants(options)
            }
        } catch (error) {
            console.error('Failed to load restaurants:', error)
            toast.error(isRu ? 'Ошибка загрузки ресторанов' : 'Failed to load restaurants')
        }
    }

    const onValid = async (data) => {
        setLoading(true)
        try {
            const requestData = {
                restaurant_id: parseInt(data.restaurant_id),
                client_name: data.client_name,
                phone: data.phone,
                email: data.email,
                date: data.date,
                time: data.time,
                guests: parseInt(data.guests),
                wishes: data.wishes || null,
            }

            const response = await publicApi.createBooking(requestData)

            if (response.success) {
                toast.success(isRu ? 'Бронирование успешно отправлено!' : 'Booking submitted successfully!')
                reset() // Сбрасываем форму через reset из useForm
            } else {
                toast.error(response.message || (isRu ? 'Ошибка отправки' : 'Submission failed'))
            }
        } catch (error) {
            console.error('Booking error:', error)
            if (error.body?.errors) {
                const errors = error.body.errors
                Object.keys(errors).forEach(field => {
                    toast.error(`${field}: ${errors[field].join(', ')}`)
                })
            } else {
                toast.error(error.body?.message || error.message || (isRu ? 'Ошибка отправки' : 'Submission failed'))
            }
        } finally {
            setLoading(false)
        }
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
        <form onSubmit={handleSubmit(onValid)} noValidate>
            <FormField
                {...field('client_name')}
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
                {...field('restaurant_id')}
                label={t('booking.restaurant')}
                type="select"
                options={restaurants}
                required
                disabled={restaurants.length === 0}
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
            <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
            >
                {loading ? (isRu ? 'Отправка...' : 'Sending...') : t('booking.submit')}
            </button>
        </form>
    )
}