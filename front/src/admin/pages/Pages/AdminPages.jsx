import { useState } from 'react'
import Modal from '../../components/Modal/Modal'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import { useAdminStore } from '../../hooks/useAdminStore'

const SYSTEM_PAGES = [
    { id: 'home',    title: 'Главная', slug: 'home',  status: 'published', system: true },
    { id: 'about',   title: 'О нас',   slug: 'about', status: 'published', system: true },
    { id: 'menu',    title: 'Меню',    slug: 'menu',  status: 'published', system: true },
]

const EMPTY = { title: '', slug: '', metaTitle: '', metaDesc: '', status: 'draft', content: '' }

export default function AdminPages() {
    const { items, create, update, remove } = useAdminStore('admin_custom_pages', [
        { id: 'p1', title: 'Акция: Новогодний банкет', slug: 'newyear-banquet', status: 'draft', content: '', system: false },
        { id: 'p2', title: 'Правила посещения', slug: 'rules', status: 'published', content: '', system: false },
    ])
    const [modal, setModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY)
    const [confirm, setConfirm] = useState(null)

    const allPages = [...SYSTEM_PAGES, ...items]

    const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true) }
    const openEdit = page => { setForm({ ...EMPTY, ...page }); setEditing(page.id ?? null); setModal(true) }

    const handleSave = e => {
        e.preventDefault()
        if (editing && !SYSTEM_PAGES.find(p => p.id === editing)) update(editing, form)
        else if (!editing) create({ ...form, system: false })
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
                <button className="btn-admin btn-admin-primary" onClick={openCreate}>+ Новая страница</button>
            </div>

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead><tr><th>Заголовок</th><th>Slug</th><th>Статус</th><th>Действия</th></tr></thead>
                    <tbody>
                    {allPages.map(page => (
                        <tr key={page.id}>
                            <td>
                                {page.title}
                                {page.system && <span className="badge badge-error" style={{ marginLeft: 8, fontSize: 10 }}>системная</span>}
                            </td>
                            <td style={{ color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>/{page.slug}</td>
                            <td><StatusBadge status={page.status} /></td>
                            <td>
                                <button className="icon-btn-admin" onClick={() => openEdit(page)}>✏️</button>
                                {!page.system && (
                                    <button className="icon-btn-admin" onClick={() => setConfirm(page.id)}>🗑️</button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-tertiary)' }}>* системные страницы нельзя удалить</p>

            {modal && (
                <Modal title={editing ? 'Редактировать страницу' : 'Новая страница'} onClose={() => setModal(false)} maxWidth={720}>
                    <form onSubmit={handleSave}>
                        <div className="admin-form-row-2">
                            <div className="admin-form-group"><label>Заголовок *</label><input {...f('title')} required /></div>
                            <div className="admin-form-group"><label>Slug</label><input {...f('slug')} placeholder="my-page" /></div>
                        </div>
                        <div className="admin-form-group">
                            <label>Содержимое</label>
                            <textarea {...f('content')} rows={5} className="admin-input" placeholder="Текст страницы..." />
                        </div>
                        <div className="admin-form-row-2">
                            <div className="admin-form-group"><label>Meta Title</label><input {...f('metaTitle')} /></div>
                            <div className="admin-form-group"><label>Meta Description</label><input {...f('metaDesc')} /></div>
                        </div>
                        <div className="admin-form-group">
                            <label>Статус</label>
                            <select {...f('status')} className="admin-input">
                                <option value="published">Опубликована</option>
                                <option value="draft">Черновик</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                            <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setModal(false)}>Отмена</button>
                            <button type="submit" className="btn-admin btn-admin-primary">Сохранить</button>
                        </div>
                    </form>
                </Modal>
            )}

            {confirm && (
                <ConfirmDialog message="Удалить страницу?" onConfirm={() => { remove(confirm); setConfirm(null) }} onCancel={() => setConfirm(null)} />
            )}
        </div>
    )
}