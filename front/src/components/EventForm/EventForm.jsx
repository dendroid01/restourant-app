// src/components/EventForm/EventForm.jsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, RULES } from '../../shared/hooks/useForm'
import FormField from '../../shared/components/FormField/FormField'
import { publicApi } from '../../api/client'

const minDate = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().split('T')[0]
})()

const INITIAL = {
    client_name: '',
    phone: '',
    email: '',
    date: '',
    guests: '',
    restaurant_id: '',
    wishes: '',
}

const SCHEMA = {
    client_name: [RULES.required, RULES.fullName],
    phone: [RULES.required, RULES.phone],
    email: [RULES.required, RULES.email],
    date: [RULES.required],
    guests: [RULES.required, RULES.min(10), RULES.max(500)],
    restaurant_id: [RULES.required],
}

export default function EventForm({ onFormDataChange, selectedDishes, totalPerPerson }) {
    const { t, i18n } = useTranslation()
    const isRu = i18n.language?.startsWith('ru')
    const [restaurants, setRestaurants] = useState([])

    const { values, errors, touched, handleChange, handleBlur, setValues } =
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
        }
    }

    // Отправляем данные формы наверх при изменении
    useEffect(() => {
        if (onFormDataChange) {
            onFormDataChange(values)
        }
    }, [values, onFormDataChange])

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
        <form id="eventForm" noValidate>
            <FormField
                {...field('client_name')}
                label={t('booking.name')}
                type="text"
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
                required
            />
            <FormField
                {...field('date')}
                label={t('booking.date')}
                type="date"
                required
                inputProps={{ min: minDate }}
            />
            <FormField
                {...field('guests')}
                label={isRu ? 'Количество гостей (от 10 до 500)' : 'Number of guests (10-500)'}
                type="number"
                required
                inputProps={{ min: 10, max: 500 }}
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
                {...field('wishes')}
                label={t('booking.wishes')}
                type="textarea"
                rows={3}
            />
        </form>
    )
}