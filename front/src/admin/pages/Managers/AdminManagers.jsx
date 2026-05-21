import { useState } from 'react'
import { useAdminStore } from '../../hooks/useAdminStore'
import Modal from '../../components/Modal/Modal'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import { useAuth } from '../../context/AuthContext'

const ALL_RIGHTS = ['Новости', 'Рестораны', 'Меню', 'Страницы', 'Отзывы', 'Заказы']

const INITIAL = [
    { id: 'm1', name: 'Алексей М.', email: 'alexey@example.com', status: 'active', rights: ['Новости', 'Отзывы'] },
    { id: 'm2', name: 'Мария К.', email: 'maria@example.com', status: 'active', rights: ['Меню', 'Рестораны'] },
    { id: 'm3', name: 'Иван С.', email: 'ivan@example.com', status: 'blocked', rights: ['Новости'] },
]

const EMPTY = { name: '', email: '', password: '', status: 'active', rights: [] }

export default function AdminManagers() {
    const { isAdmin } = useAuth()
    const { items, create, update, remove } = useAdminStore('admin_managers', INITIAL)
    const [modal, setModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY)
    const [confirm, setConfirm] = useState(null)

    if (!isAdmin) {
        return <div className="empty-state"><div className="empty-state-icon">🔒</div><p>Только для администратора</p></div>
    }

    const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true) }
    const openEdit   = item => { setForm({ ...EMPTY, ...item }); setEditing(item.id); setModal(true) }

    const handleSave = e => {
        e.preventDefault()
        const { password, ...data } = form
        editing ? update(editing, data) : create(data)
        setModal(false)
    }

    const toggleRight = right => {
        setForm(p => ({
            ...p,
            rights: p.rights.includes(right) ? p.rights.filter(r => r !== right) : [...p.rights, right],
        }))
    }

    const f = field => ({
        value: form[field] ?? '',
        onChange: e => setForm(p => ({ ...p, [field]: e.target.value })),
        className: 'admin-input',
    })

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <button className="btn-admin btn-admin-primary" onClick={openCreate}>+ Добавить менеджера</button>
            </div>

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead><tr><th>Имя</th><th>Email</th><th>Статус</th><th>Доступ</th><th>Действия</th></tr></thead>
                    <tbody>
                    {items.map(m => (
                        <tr key={m.id}>
                            <td style={{ fontWeight: 500 }}>{m.name}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{m.email}</td>
                            <td><StatusBadge status={m.status} /></td>
                            <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{m.rights?.join(', ') || '—'}</td>
                            <td>
                                <button className="icon-btn-admin" onClick={() => openEdit(m)}>✏️</button>
                                <button className="icon-btn-admin" title={m.status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                                        onClick={() => update(m.id, { status: m.status === 'active' ? 'blocked' : 'active' })}>
                                    {m.status === 'active' ? '🔒' : '🔓'}
                                </button>
                                <button className="icon-btn-admin" onClick={() => setConfirm(m.id)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {modal && (
                <Modal title={editing ? 'Редактировать менеджера' : 'Новый менеджер'} onClose={() => setModal(false)}>
                    <form onSubmit={handleSave}>
                        <div className="admin-form-group"><label>Имя *</label><input {...f('name')} required /></div>
                        <div className="admin-form-group"><label>Email *</label><input type="email" {...f('email')} required /></div>
                        {!editing && (
                            <div className="admin-form-group">
                                <label>Пароль *</label>
                                <input type="password" className="admin-input" value={form.password}
                                       onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                            </div>
                        )}
                        <div className="admin-form-group">
                            <label>Статус</label>
                            <select {...f('status')} className="admin-input">
                                <option value="active">Активен</option>
                                <option value="blocked">Заблокирован</option>
                            </select>
                        </div>
                        <div className="admin-form-group">
                            <label>Доступ к разделам</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                                {ALL_RIGHTS.map(r => (
                                    <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={form.rights?.includes(r) ?? false} onChange={() => toggleRight(r)} />
                                        {r}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                            <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setModal(false)}>Отмена</button>
                            <button type="submit" className="btn-admin btn-admin-primary">
                                {editing ? 'Сохранить' : 'Создать'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {confirm && (
                <ConfirmDialog message="Удалить менеджера?" onConfirm={() => { remove(confirm); setConfirm(null) }} onCancel={() => setConfirm(null)} />
            )}
        </div>
    )
}