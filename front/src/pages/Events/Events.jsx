// src/pages/Events/Events.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import EventForm from '../../components/EventForm/EventForm'
import Calculator from '../../components/Calculator/Calculator'
import { publicApi } from '../../api/client'
import { useToast } from '../../shared/hooks/useToast'

export default function Events() {
    const { t } = useTranslation()
    const toast = useToast()
    const [guestCount, setGuestCount] = useState(10)
    const [formData, setFormData] = useState({})
    const [selectedItems, setSelectedItems] = useState([])
    const [totalPerPerson, setTotalPerPerson] = useState(0)
    const [loading, setLoading] = useState(false)

    const handleFormDataChange = (data) => {
        setFormData(data)
        // Обновляем количество гостей из формы
        if (data.guests) {
            setGuestCount(parseInt(data.guests) || 0)
        }
    }

    const handleSelectionChange = (items, total) => {
        setSelectedItems(items)
        setTotalPerPerson(total)
    }

    const handleSubmit = async () => {
        // Валидация
        if (!formData.client_name || !formData.phone || !formData.email || !formData.date || !formData.restaurant_id) {
            toast.error(t('events.fill_all_fields') || 'Пожалуйста, заполните все обязательные поля')
            return
        }

        if (selectedItems.length === 0) {
            toast.error(t('events.select_dish_error') || 'Выберите хотя бы одно блюдо')
            return
        }

        if (guestCount < 10) {
            toast.error(t('events.min_guests_error') || 'Минимальное количество гостей - 10')
            return
        }

        const totalPrice = totalPerPerson * guestCount

        const requestData = {
            restaurant_id: parseInt(formData.restaurant_id),
            client_name: formData.client_name,
            phone: formData.phone,
            email: formData.email,
            date: formData.date,
            guests: guestCount,
            wishes: formData.wishes || null,
            total_price_per_person: totalPerPerson,
            total_price: totalPrice,
            items: selectedItems
        }

        setLoading(true)
        try {
            const response = await publicApi.createEvent(requestData)
            if (response.success) {
                toast.success(t('events.request_sent') || 'Заявка на мероприятие успешно отправлена!')
                // Сбрасываем форму
                setFormData({})
                setSelectedItems([])
                setTotalPerPerson(0)
                setGuestCount(10)
                // Перезагружаем страницу или ресетим компоненты
                window.scrollTo({ top: 0, behavior: 'smooth' })
            } else {
                toast.error(response.message || t('events.submit_error') || 'Ошибка отправки')
            }
        } catch (error) {
            console.error('Event submission error:', error)
            const message = error.body?.message || error.message
            toast.error(message || t('events.submit_error') || 'Ошибка отправки заявки')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main>
            <div className="breadcrumbs">
                <div className="container">
                    <ul className="breadcrumbs-list">
                        <li><Link to="/">{t('breadcrumbs.home')}</Link></li>
                        <li>{t('nav.events')}</li>
                    </ul>
                </div>
            </div>
            <section className="page-section">
                <div className="container">
                    <h1 className="h1-28 section-title">{t('events.title')}</h1>
                    <div style={{ maxWidth: 800, margin: '0 auto' }}>
                        <EventForm
                            onFormDataChange={handleFormDataChange}
                            selectedDishes={selectedItems}
                            totalPerPerson={totalPerPerson}
                        />
                        <Calculator
                            guestCount={guestCount}
                            onSelectionChange={handleSelectionChange}
                        />
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: 'var(--spacing-lg)' }}
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (t('common.sending') || 'Отправка...') : t('events.submit')}
                        </button>
                    </div>
                </div>
            </section>
        </main>
    )
}