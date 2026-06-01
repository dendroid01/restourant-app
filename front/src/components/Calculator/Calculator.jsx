// src/components/Calculator/Calculator.jsx
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { publicApi } from '../../api/client'

export default function Calculator({ guestCount = 1, onSelectionChange }) {
    const { t, i18n } = useTranslation()
    const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en'
    const [quantities, setQuantities] = useState({})
    const [search, setSearch] = useState('')
    const [dishes, setDishes] = useState([])
    const [loading, setLoading] = useState(true)

    // Загрузка блюд для мероприятий
    useEffect(() => {
        loadEventDishes()
    }, [])

    const loadEventDishes = async () => {
        try {
            const response = await publicApi.getEventDishes()
            if (response.success && response.data) {
                setDishes(response.data)
            }
        } catch (error) {
            console.error('Failed to load event dishes:', error)
        } finally {
            setLoading(false)
        }
    }

    const update = (id, delta) => {
        setQuantities(prev => {
            const cur = prev[id] || 0
            const next = Math.max(0, Math.min(100, cur + delta))
            const newQuantities = { ...prev, [id]: next }

            // Удаляем если 0
            if (next === 0) {
                delete newQuantities[id]
            }

            // Уведомляем родителя об изменении
            if (onSelectionChange) {
                const items = Object.entries(newQuantities).map(([menuItemId, quantity]) => ({
                    menu_item_id: parseInt(menuItemId),
                    quantity
                }))
                onSelectionChange(items, totalPerPerson(newQuantities))
            }

            return newQuantities
        })
    }

    const totalPerPerson = (qtyMap = quantities) => {
        return dishes.reduce((sum, dish) => sum + (qtyMap[dish.id] || 0) * dish.price, 0)
    }

    const filtered = dishes.filter(dish =>
        dish[`title_${lang}`]?.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) {
        return (
            <div className="calculator-block" style={{ textAlign: 'center', padding: '40px' }}>
                <p>{t('common.loading') || 'Загрузка...'}</p>
            </div>
        )
    }

    return (
        <div className="calculator-block">
            <h2 className="h2-22">{t('events.calculator_title')}</h2>
            <p className="caption-12" style={{marginBottom: 'var(--spacing-md)'}}>
                {t('events.calculator_desc')}
            </p>

            {/* Search */}
            <div style={{position: 'relative', marginBottom: 'var(--spacing-md)'}}>
                <i className="fas fa-search" style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#adb5bd'
                }}/>
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t('events.search_placeholder')}
                    style={{
                        width: '100%', padding: '12px 16px 12px 48px', fontSize: 16,
                        border: '1px solid #e0e0e0', borderRadius: 12, fontFamily: 'inherit'
                    }}
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => setSearch('')}
                        style={{
                            position: 'absolute',
                            right: 16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#adb5bd',
                            fontSize: 18
                        }}
                    >
                        <i className="fas fa-times-circle"/>
                    </button>
                )}
            </div>

            {/* Dishes */}
            {filtered.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#6c757d',
                    background: '#f8f9fa',
                    borderRadius: 12
                }}>
                    <i className="fas fa-utensils" style={{fontSize: 48, opacity: 0.5, display: 'block', marginBottom: 16}}/>
                    <p>{t('events.no_results')}</p>
                    <p style={{fontSize: 14, marginTop: 8}}>{t('events.no_results_hint')}</p>
                </div>
            ) : (
                filtered.map(dish => (
                    <div className="calculator-item" key={dish.id}>
                        <div>
                            <p className="h3-16-medium">{dish[`title_${lang}`]}</p>
                            <p className="caption-12">{dish.price.toLocaleString()} ₽ {t('menu.per_portion')}</p>
                        </div>
                        <div className="quantity-control">
                            <button type="button" onClick={() => update(dish.id, -1)}>-</button>
                            <span>{quantities[dish.id] || 0}</span>
                            <button type="button" onClick={() => update(dish.id, 1)}>+</button>
                        </div>
                    </div>
                ))
            )}

            {search && filtered.length > 0 && (
                <p style={{fontSize: 13, color: '#6c757d', marginTop: 8}}>
                    {t('events.found')} {filtered.length}
                </p>
            )}

            <div className="total-price">
                {t('events.total_label')} <span>{totalPerPerson().toLocaleString()}</span> ₽
            </div>
            <p className="caption-12" style={{marginTop: 'var(--spacing-sm)'}}>
                {t('events.total_note')}
            </p>
        </div>
    )
}