import { useState } from 'react'
import { useAdminStore } from '../../hooks/useAdminStore'
import Modal from '../../components/Modal/Modal'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import newsInitial from '../../../data/news.json'

const EMPTY_FORM = {
    title_ru: '', title_en: '',
    excerpt_ru: '', excerpt_en: '',
    content_ru: '', content_en: '',
    date_ru: '', date_en: '',
    status: 'draft',
    image_thumb: 'https://picsum.photos/400/250?random=' + Math.floor(Math.random() * 100),
}

export default function AdminNews() {
    const { items, create, update, remove } = useAdminStore('admin_news', newsInitial)
    const [modal, setModal] = useState(null)   // null | 'create' | 'edit'
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [confirm, setConfirm] = useState(null)

    const openCreate = () => {
        setForm(EMPTY_FORM)
        setEditing(null)
        setModal('form')
    }

    const openEdit = item => {
        setForm({ ...EMPTY_FORM, ...item })
        setEditing(item.id)
        setModal('form')
    }

    const handleSave = e => {
        e.preventDefault()
        if (editing) update(editing, form)
        else create(form)
        setModal(null)
    }

    const f = (field) => ({
        value: form[field] ?? '',
        onChange: e => setForm(p => ({ ...p, [field]: e.target.value })),
        className: 'admin-input',
    })

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <button className="btn-admin btn-admin-primary" onClick={openCreate}>+ Новая новость</button>
            </div>

            {items.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">📰</div><p>Новостей пока нет</p></div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                        <tr><th>Заголовок (RU)</th><th>Дата</th><th>Статус</th><th>Действия</th></tr>
                        </thead>
                        <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td style={{ fontWeight: 500 }}>{item.title_ru}</td>
                                <td>{item.date_ru}</td>
                                <td><StatusBadge status={item.status} /></td>
                                <td>
                                    <button className="icon-btn-admin" onClick={() => openEdit(item)}>✏️</button>
                                    <button className="icon-btn-admin" onClick={() => setConfirm(item.id)}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modal === 'form' && (
                <Modal title={editing ? 'Редактировать новость' : 'Новая новость'} onClose={() => setModal(null)} maxWidth={680}>
                    <form onSubmit={handleSave}>
                        <div className="admin-form-row-2">
                            <div className="admin-form-group">
                                <label>Заголовок (RU) *</label>
                                <input {...f('title_ru')} required />
                            </div>
                            <div className="admin-form-group">
                                <label>Заголовок (EN)</label>
                                <input {...f('title_en')} />
                            </div>
                        </div>
                        <div className="admin-form-row-2">
                            <div className="admin-form-group">
                                <label>Дата (RU)</label>
                                <input {...f('date_ru')} placeholder="15 марта 2024" />
                            </div>
                            <div className="admin-form-group">
                                <label>Дата (EN)</label>
                                <input {...f('date_en')} placeholder="March 15, 2024" />
                            </div>
                        </div>
                        <div className="admin-form-group">
                            <label>Анонс (RU)</label>
                            <textarea {...f('excerpt_ru')} rows={2} className="admin-input" />
                        </div>
                        <div className="admin-form-group">
                            <label>Анонс (EN)</label>
                            <textarea {...f('excerpt_en')} rows={2} className="admin-input" />
                        </div>
                        <div className="admin-form-group">
                            <label>Текст (RU)</label>
                            <textarea {...f('content_ru')} rows={4} className="admin-input" />
                        </div>
                        <div className="admin-form-group">
                            <label>Текст (EN)</label>
                            <textarea {...f('content_en')} rows={4} className="admin-input" />
                        </div>
                        <div className="admin-form-row-2">
                            <div className="admin-form-group">
                                <label>Статус</label>
                                <select {...f('status')} className="admin-input">
                                    <option value="published">Опубликовано</option>
                                    <option value="draft">Черновик</option>
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label>URL картинки</label>
                                <input {...f('image_thumb')} placeholder="https://..." />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                            <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setModal(null)}>Отмена</button>
                            <button type="submit" className="btn-admin btn-admin-primary">Сохранить</button>
                        </div>
                    </form>
                </Modal>
            )}

            {confirm && (
                <ConfirmDialog
                    message="Удалить новость? Это действие нельзя отменить."
                    onConfirm={() => { remove(confirm); setConfirm(null) }}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </div>
    )
}