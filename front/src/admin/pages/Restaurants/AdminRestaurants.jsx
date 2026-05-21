import { useState } from 'react'
import { useAdminStore } from '../../hooks/useAdminStore'
import Modal from '../../components/Modal/Modal'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import restaurantsInitial from '../../../data/restaurants.json'

const EMPTY = {
    name_ru: '', name_en: '',
    address_ru: '', address_en: '',
    description_ru: '', description_en: '',
    phone: '',
    hours_ru: '', hours_en: '',
    status: 'active',
    image: 'https://picsum.photos/500/400?random=' + Math.floor(Math.random() * 100),
}

export default function AdminRestaurants() {
    const { items, create, update, remove } = useAdminStore('admin_restaurants', restaurantsInitial)
    const [modal, setModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY)
    const [confirm, setConfirm] = useState(null)

    const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true) }
    const openEdit   = item => { setForm({ ...EMPTY, ...item }); setEditing(item.id); setModal(true) }

    const handleSave = e => {
        e.preventDefault()
        editing ? update(editing, form) : create(form)
        setModal(false)
    }

    const f = field => ({
        value: form[field] ?? '',
        onChange: e => setForm(p => ({ ...p, [field]: e.target.value })),
        className: 'admin-input',
    })

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <button className="btn-admin btn-admin-primary" onClick={openCreate}>+ Добавить ресторан</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 20 }}>
                {items.map(r => (
                    <div key={r.id} style={{ background: 'var(--bg-white)', borderRadius: 16, border: '1px solid var(--gray-border)', overflow: 'hidden' }}>
                        <div style={{ height: 160, background: 'var(--gray-disabled-bg)', overflow: 'hidden' }}>
                            <img src={r.image} alt={r.name_ru} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: 18 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 400 }}>{r.name_ru}</h3>
                                <StatusBadge status={r.status} />
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>📍 {r.address_ru}</p>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>📞 {r.phone}</p>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🕐 {r.hours_ru}</p>
                            <div style={{ display: 'flex', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--gray-border)' }}>
                                <button className="btn-admin btn-admin-secondary" style={{ flex: 1, fontSize: 13 }} onClick={() => openEdit(r)}>✏️ Редактировать</button>
                                <button className="btn-admin btn-admin-danger" style={{ fontSize: 13 }} onClick={() => setConfirm(r.id)}>🗑️</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {modal && (
                <Modal title={editing ? 'Редактировать ресторан' : 'Новый ресторан'} onClose={() => setModal(false)} maxWidth={700}>
                    <form onSubmit={handleSave}>
                        <div className="admin-form-row-2">
                            <div className="admin-form-group"><label>Название (RU) *</label><input {...f('name_ru')} required /></div>
                            <div className="admin-form-group"><label>Название (EN)</label><input {...f('name_en')} /></div>
                        </div>
                        <div className="admin-form-row-2">
                            <div className="admin-form-group"><label>Адрес (RU)</label><input {...f('address_ru')} /></div>
                            <div className="admin-form-group"><label>Адрес (EN)</label><input {...f('address_en')} /></div>
                        </div>
                        <div className="admin-form-row-2">
                            <div className="admin-form-group"><label>Телефон</label><input {...f('phone')} /></div>
                            <div className="admin-form-group"><label>Статус</label>
                                <select {...f('status')} className="admin-input">
                                    <option value="active">Активен</option>
                                    <option value="inactive">Скрыт</option>
                                </select>
                            </div>
                        </div>
                        <div className="admin-form-row-2">
                            <div className="admin-form-group"><label>Режим работы (RU)</label><input {...f('hours_ru')} /></div>
                            <div className="admin-form-group"><label>Режим работы (EN)</label><input {...f('hours_en')} /></div>
                        </div>
                        <div className="admin-form-group"><label>Описание (RU)</label><textarea {...f('description_ru')} rows={3} className="admin-input" /></div>
                        <div className="admin-form-group"><label>Описание (EN)</label><textarea {...f('description_en')} rows={3} className="admin-input" /></div>
                        <div className="admin-form-group"><label>URL картинки</label><input {...f('image')} /></div>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                            <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setModal(false)}>Отмена</button>
                            <button type="submit" className="btn-admin btn-admin-primary">Сохранить</button>
                        </div>
                    </form>
                </Modal>
            )}

            {confirm && (
                <ConfirmDialog
                    message="Удалить ресторан?"
                    onConfirm={() => { remove(confirm); setConfirm(null) }}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </div>
    )
}