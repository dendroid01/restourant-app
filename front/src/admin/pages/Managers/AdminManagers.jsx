import { useState } from 'react'
import { useAdminStore } from '../../hooks/useAdminStore'
import { useAuth } from '../../context/AuthContext'
import { useForm, RULES } from '../../../shared/hooks/useForm'
import FormField from '../../../shared/components/FormField/FormField'
import Modal from '../../components/Modal/Modal'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import StatusBadge from '../../components/StatusBadge/StatusBadge'

const ALL_RIGHTS = ['Новости', 'Рестораны', 'Меню', 'Страницы', 'Отзывы', 'Заказы']

const INITIAL_MANAGERS = [
    { id: 'm1', name: 'Алексей М.', email: 'alexey@example.com', status: 'active', rights: ['Новости', 'Отзывы'] },
    { id: 'm2', name: 'Мария К.',   email: 'maria@example.com',  status: 'active', rights: ['Меню', 'Рестораны'] },
    { id: 'm3', name: 'Иван С.',    email: 'ivan@example.com',   status: 'blocked', rights: ['Новости'] },
]

function makeSchema(isNew) {
    return {
        name:     [RULES.required, RULES.minLength(2)],
        email:    [RULES.required, RULES.email],
        ...(isNew ? { password: [RULES.required, RULES.minLength(6)] } : {}),
    }
}

function ManagerForm({ initial, isNew, onSave, onClose }) {
    const schema = makeSchema(isNew)
    const [rights, setRights] = useState(initial.rights ?? [])

    const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
        useForm(initial, schema)

    const toggleRight = (r) =>
        setRights((prev) =>
            prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
        )

    const onValid = (data) => {
        const { password, ...rest } = data
        onSave({ ...rest, rights, ...(isNew ? { password } : {}) })
    }

    const field = (name, extra = {}) => ({
        name,
        value: values[name],
        error: errors[name],
        touched: touched[name],
        onChange: handleChange,
        onBlur: handleBlur,
        adminStyle: true,
        ...extra,
    })

    return (
        <form onSubmit={handleSubmit(onValid)} noValidate>
            <FormField {...field('name')} label="Имя" type="text" required />
            <FormField {...field('email')} label="Email" type="email" required />
            {isNew && (
                <FormField
                    {...field('password')}
                    label="Пароль"
                    type="password"
                    required
                />
            )}
            <div className="admin-form-group">
                <label>Статус</label>
                <select
                    name="status"
                    value={values.status}
                    onChange={handleChange}
                    className="admin-input"
                >
                    <option value="active">Активен</option>
                    <option value="blocked">Заблокирован</option>
                </select>
            </div>
            <div className="admin-form-group">
                <label>Доступ к разделам</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                    {ALL_RIGHTS.map((r) => (
                        <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                            <input type="checkbox" checked={rights.includes(r)} onChange={() => toggleRight(r)} />
                            {r}
                        </label>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" className="btn-admin btn-admin-secondary" onClick={onClose}>Отмена</button>
                <button type="submit" className="btn-admin btn-admin-primary">
                    {isNew ? 'Создать' : 'Сохранить'}
                </button>
            </div>
        </form>
    )
}

export default function AdminManagers() {
    const { isAdmin } = useAuth()
    const { items, create, update, remove } = useAdminStore('admin_managers', INITIAL_MANAGERS)
    const [modal, setModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [confirm, setConfirm] = useState(null)

    if (!isAdmin) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">🔒</div>
                <p>Только для администратора</p>
            </div>
        )
    }

    const openCreate = () => { setEditing(null); setModal(true) }
    const openEdit   = (item) => { setEditing(item); setModal(true) }

    const handleSave = (data) => {
        if (editing) update(editing.id, data)
        else create(data)
        setModal(false)
    }

    const EMPTY_FORM = { name: '', email: '', password: '', status: 'active', rights: [] }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <button className="btn-admin btn-admin-primary" onClick={openCreate}>+ Добавить менеджера</button>
            </div>

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                    <tr><th>Имя</th><th>Email</th><th>Статус</th><th>Доступ</th><th>Действия</th></tr>
                    </thead>
                    <tbody>
                    {items.map((m) => (
                        <tr key={m.id}>
                            <td style={{ fontWeight: 500 }}>{m.name}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{m.email}</td>
                            <td><StatusBadge status={m.status} /></td>
                            <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{m.rights?.join(', ') || '—'}</td>
                            <td>
                                <button className="icon-btn-admin" onClick={() => openEdit(m)}>✏️</button>
                                <button
                                    className="icon-btn-admin"
                                    title={m.status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                                    onClick={() => update(m.id, { status: m.status === 'active' ? 'blocked' : 'active' })}
                                >
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
                <Modal
                    title={editing ? 'Редактировать менеджера' : 'Новый менеджер'}
                    onClose={() => setModal(false)}
                >
                    <ManagerForm
                        initial={editing ?? EMPTY_FORM}
                        isNew={!editing}
                        onSave={handleSave}
                        onClose={() => setModal(false)}
                    />
                </Modal>
            )}

            {confirm && (
                <ConfirmDialog
                    message="Удалить менеджера?"
                    onConfirm={() => { remove(confirm); setConfirm(null) }}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </div>
    )
}