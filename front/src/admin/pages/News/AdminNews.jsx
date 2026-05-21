import { useState } from 'react'
import { useAdminStore } from '../../hooks/useAdminStore'
import Modal from '../../components/Modal/Modal'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import RichTextEditor from '../../../shared/components/RichTextEditor/RichTextEditor'
import { useToast } from '../../../shared/hooks/useToast'
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
    const toast = useToast()
    const [modal, setModal] = useState(null)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [confirm, setConfirm] = useState(null)

    const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setModal('form') }
    const openEdit   = item => { setForm({ ...EMPTY_FORM, ...item }); setEditing(item.id); setModal('form') }

    const handleSave = e => {
        e.preventDefault()
        if (editing) {
            update(editing, form)
            toast.success('Новость обновлена')
        } else {
            create(form)
            toast.success('Новость создана')
        }
        setModal(null)
    }

    const handleRemove = (id) => {
        remove(id)
        setConfirm(null)
        toast.success('Новость удалена')
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
                <Modal title={editing ? 'Редактировать новость' : 'Новая новость'} onClose={() => setModal(null)} maxWidth={720}>
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

                        {/* Анонс RU */}
                        <div className="admin-form-group">
                            <label>Анонс (RU)</label>
                            <RichTextEditor
                                value={form.excerpt_ru}
                                onChange={val => setForm(p => ({ ...p, excerpt_ru: val }))}
                                placeholder="Краткое описание новости (RU)..."
                                adminStyle
                                minHeight={80}
                            />
                        </div>

                        {/* Анонс EN */}
                        <div className="admin-form-group">
                            <label>Анонс (EN)</label>
                            <RichTextEditor
                                value={form.excerpt_en}
                                onChange={val => setForm(p => ({ ...p, excerpt_en: val }))}
                                placeholder="Short news description (EN)..."
                                adminStyle
                                minHeight={80}
                            />
                        </div>

                        {/* Контент RU */}
                        <div className="admin-form-group">
                            <label>Текст (RU)</label>
                            <RichTextEditor
                                value={form.content_ru}
                                onChange={val => setForm(p => ({ ...p, content_ru: val }))}
                                placeholder="Полный текст новости (RU)..."
                                adminStyle
                                minHeight={180}
                            />
                        </div>

                        {/* Контент EN */}
                        <div className="admin-form-group">
                            <label>Текст (EN)</label>
                            <RichTextEditor
                                value={form.content_en}
                                onChange={val => setForm(p => ({ ...p, content_en: val }))}
                                placeholder="Full news text (EN)..."
                                adminStyle
                                minHeight={180}
                            />
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
                    onConfirm={() => handleRemove(confirm)}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </div>
    )
}