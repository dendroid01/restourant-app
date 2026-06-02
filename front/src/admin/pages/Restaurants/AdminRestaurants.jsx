// AdminRestaurants.jsx - с разделением по языкам
import { useState, useEffect, useRef } from 'react'
import { useAdminStore } from '../../hooks/useAdminStore'
import Modal from '../../components/Modal/Modal'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import MultiImageUploader from '../../components/MultiImageUploader/MultiImageUploader'

const EMPTY = {
    name_ru: '',
    name_en: '',
    address_ru: '',
    address_en: '',
    description_ru: '',
    description_en: '',
    phone: '',
    hours_ru: '',
    hours_en: '',
    lat: '',
    lng: '',
    order: 0,
    status: 'active',
    galleries: [],
}

export default function AdminRestaurants() {
    const {
        items,
        setItems,
        loading,
        error,
        hasMore,
        loadFirst,
        loadMore,
        create,
        update,
        remove,
        reorder
    } = useAdminStore('restaurants')

    const [modal, setModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY)
    const [confirm, setConfirm] = useState(null)
    const [draggedItem, setDraggedItem] = useState(null)
    const [activeLang, setActiveLang] = useState('ru') // 'ru' или 'en'
    const observerRef = useRef()
    const lastItemRef = useRef()

    // Загрузка при монтировании
    useEffect(() => {
        loadFirst({ sort_by: 'order', sort_order: 'asc' })
    }, [])

    // Intersection Observer для бесконечного скролла
    useEffect(() => {
        if (loading) return
        if (observerRef.current) observerRef.current.disconnect()

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore({ sort_by: 'order', sort_order: 'asc' })
            }
        })

        if (lastItemRef.current) {
            observerRef.current.observe(lastItemRef.current)
        }

        return () => observerRef.current?.disconnect()
    }, [loading, hasMore, items])

    const openCreate = () => {
        setForm({ ...EMPTY, galleries: [] });
        setEditing(null);
        setModal(true)
    }

    const openEdit = (item) => {
        setForm({
            ...EMPTY,
            ...item,
            galleries: item.galleries || []
        });
        setEditing(item.id);
        setModal(true)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        try {
            if (editing) {
                await update(editing, form)
            } else {
                await create(form)
            }
            setModal(false)
        } catch (err) {
            alert(err.message)
        }
    }

    // Drag-and-Drop для ресторанов
    const handleDragStart = (e, index) => {
        setDraggedItem(index)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e, index) => {
        e.preventDefault()
        if (draggedItem === null) return
        if (draggedItem === index) return

        const reorderedItems = [...items]
        const [dragged] = reorderedItems.splice(draggedItem, 1)
        reorderedItems.splice(index, 0, dragged)

        const updatedOrders = reorderedItems.map((item, idx) => ({
            id: item.id,
            order: idx
        }))

        setItems(reorderedItems)
        setDraggedItem(index)
        reorder(updatedOrders)
    }

    const handleDragEnd = () => {
        setDraggedItem(null)
    }

    // Получение главного изображения (первое из галереи)
    const getMainImage = (item) => {
        if (item.galleries && item.galleries.length > 0) {
            return item.galleries[0].image_url
        }
        if (item.main_image) {
            return item.main_image
        }
        // Если нет изображений, возвращаем null
        return null
    }

    const f = (field) => ({
        value: form[field] ?? '',
        onChange: e => setForm(p => ({ ...p, [field]: e.target.value })),
        className: 'admin-input',
    })

    if (loading && items.length === 0) {
        return <div style={{ textAlign: 'center', padding: 40 }}>Загрузка...</div>
    }

    if (error) {
        return <div style={{ textAlign: 'center', padding: 40, color: 'red' }}>Ошибка: {error}</div>
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <button className="btn-admin btn-admin-primary" onClick={openCreate}>
                    + Добавить ресторан
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 20 }}>
                {items.map((r, idx) => {
                    const isLast = idx === items.length - 1
                    const mainImage = getMainImage(r)

                    return (
                        <div
                            key={r.id}
                            ref={isLast ? lastItemRef : null}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDragEnd={handleDragEnd}
                            style={{
                                background: 'var(--bg-white)',
                                borderRadius: 16,
                                border: `1px solid ${draggedItem === idx ? 'var(--primary)' : 'var(--gray-border)'}`,
                                overflow: 'hidden',
                                cursor: 'grab',
                                transition: 'all 0.2s',
                                opacity: draggedItem === idx ? 0.5 : 1,
                            }}
                        >
                            <div style={{ height: 160, background: 'var(--gray-disabled-bg)', overflow: 'hidden' }}>
                                <img
                                    src={mainImage}
                                    alt={r.name_ru}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <div style={{ padding: 18 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                    <div>
                                        <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 400, margin: 0 }}>
                                            {activeLang === 'ru' ? r.name_ru : r.name_en || r.name_ru}
                                        </h3>
                                        <small style={{ color: 'var(--text-secondary)' }}>Порядок: {r.order ?? 0}</small>
                                        {r.galleries && r.galleries.length > 0 && (
                                            <small style={{ color: 'var(--text-secondary)', marginLeft: 8 }}>
                                                📷 {r.galleries.length}
                                            </small>
                                        )}
                                    </div>
                                    <StatusBadge status={r.status} />
                                </div>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                                    📍 {activeLang === 'ru' ? r.address_ru : r.address_en || r.address_ru}
                                </p>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>📞 {r.phone}</p>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                    🕐 {activeLang === 'ru' ? r.hours_ru : r.hours_en || r.hours_ru}
                                </p>
                                {r.lat && r.lng && (
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                                        🗺️ {r.lat}, {r.lng}
                                    </p>
                                )}
                                <div style={{ display: 'flex', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--gray-border)' }}>
                                    <button className="btn-admin btn-admin-secondary" style={{ flex: 1, fontSize: 13 }} onClick={() => openEdit(r)}>
                                        ✏️ Редактировать
                                    </button>
                                    <button className="btn-admin btn-admin-danger" style={{ fontSize: 13 }} onClick={() => setConfirm(r.id)}>
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {loading && items.length > 0 && (
                <div style={{ textAlign: 'center', padding: 20 }}>Загрузка ещё...</div>
            )}

            {modal && (
                <Modal title={editing ? 'Редактировать ресторан' : 'Новый ресторан'} onClose={() => setModal(false)} maxWidth={800}>
                    <form onSubmit={handleSave} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
                        {/* Переключатель языка */}
                        <div style={{
                            display: 'flex',
                            gap: 8,
                            marginBottom: 24,
                            background: '#f5f5f5',
                            padding: 8,
                            borderRadius: 8,
                            width: 'fit-content'
                        }}>
                            <button
                                type="button"
                                onClick={() => setActiveLang('ru')}
                                style={{
                                    padding: '8px 24px',
                                    background: activeLang === 'ru' ? '#1976d2' : 'transparent',
                                    color: activeLang === 'ru' ? 'white' : '#666',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                }}
                            >
                                🇷🇺 Русский
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveLang('en')}
                                style={{
                                    padding: '8px 24px',
                                    background: activeLang === 'en' ? '#1976d2' : 'transparent',
                                    color: activeLang === 'en' ? 'white' : '#666',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                }}
                            >
                                🇬🇧 English
                            </button>
                        </div>

                        {/* Поля для выбранного языка */}
                        {activeLang === 'ru' ? (
                            // RU поля
                            <>
                                <div className="admin-form-group">
                                    <label>Название (RU) *</label>
                                    <input {...f('name_ru')} required />
                                </div>

                                <div className="admin-form-group">
                                    <label>Адрес (RU) *</label>
                                    <input {...f('address_ru')} />
                                </div>

                                <div className="admin-form-group">
                                    <label>Режим работы (RU) *</label>
                                    <input {...f('hours_ru')} />
                                </div>

                                <div className="admin-form-group">
                                    <label>Описание (RU)</label>
                                    <textarea {...f('description_ru')} rows={3} className="admin-input" />
                                </div>
                            </>
                        ) : (
                            // EN поля
                            <>
                                <div className="admin-form-group">
                                    <label>Name (EN) *</label>
                                    <input {...f('name_en')} />
                                </div>

                                <div className="admin-form-group">
                                    <label>Address (EN) *</label>
                                    <input {...f('address_en')} />
                                </div>

                                <div className="admin-form-group">
                                    <label>Working Hours (EN) *</label>
                                    <input {...f('hours_en')} />
                                </div>

                                <div className="admin-form-group">
                                    <label>Description (EN)</label>
                                    <textarea {...f('description_en')} rows={3} className="admin-input" />
                                </div>
                            </>
                        )}

                        {/* Общие поля (не зависят от языка) */}
                        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #e0e0e0' }}>
                            <h4 style={{ marginBottom: 16, fontSize: 16, fontWeight: 500 }}>Общие настройки</h4>

                            <div className="admin-form-row-2">
                                <div className="admin-form-group">
                                    <label>Телефон *</label>
                                    <input {...f('phone')} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Статус *</label>
                                    <select {...f('status')} className="admin-input">
                                        <option value="active">Активен</option>
                                        <option value="inactive">Скрыт</option>
                                    </select>
                                </div>
                            </div>

                            <div className="admin-form-row-2">
                                <div className="admin-form-group">
                                    <label>Широта (lat)</label>
                                    <input type="number" step="any" {...f('lat')} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Долгота (lng)</label>
                                    <input type="number" step="any" {...f('lng')} />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label>Порядок сортировки (меньше = выше)</label>
                                <input type="number" {...f('order')} />
                            </div>

                            <div className="admin-form-group">
                                <label>Галерея изображений</label>
                                <MultiImageUploader
                                    value={form.galleries || []}
                                    onChange={(galleries) => setForm(p => ({ ...p, galleries }))}
                                    directory="restaurants"
                                    maxSizeMB={5}
                                    maxFiles={20}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--gray-border)' }}>
                            <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setModal(false)}>Отмена</button>
                            <button type="submit" className="btn-admin btn-admin-primary">Сохранить</button>
                        </div>
                    </form>
                </Modal>
            )}

            {confirm && (
                <ConfirmDialog
                    message="Удалить ресторан?"
                    onConfirm={async () => {
                        await remove(confirm);
                        setConfirm(null)
                    }}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </div>
    )
}