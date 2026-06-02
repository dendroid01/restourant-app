import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useForm, RULES } from '../../../shared/hooks/useForm'
import FormField from '../../../shared/components/FormField/FormField'
import Modal from '../../components/Modal/Modal'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import { adminManagers } from '../../../api/admin'
import { fromApiToFrontend, fromFrontendToApi, mapSectionsFromApi } from '../../../utils/managerMappers'

// Константа для пустого состояния
let ALL_RIGHTS = []

function makeSchema(isNew) {
    return {
        name: [RULES.required, RULES.minLength(2)],
        email: [RULES.required, RULES.email],
        ...(isNew ? { password: [RULES.required, RULES.minLength(6)] } : {}),
    }
}

function ManagerForm({ initial, isNew, onSave, onClose, availableSections }) {
    const schema = makeSchema(isNew)
    const [rights, setRights] = useState(initial.rights ?? [])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
        useForm(initial, schema)

    const toggleRight = (rightLabel) =>
        setRights((prev) =>
            prev.includes(rightLabel) ? prev.filter((x) => x !== rightLabel) : [...prev, rightLabel]
        )

    const onValid = async (data) => {
        setSaving(true)
        setError(null)
        try {
            const apiData = fromFrontendToApi(
                { ...data, rights, status: values.status },
                isNew
            )
            await onSave(apiData)
        } catch (err) {
            setError(err.message || 'Ошибка сохранения')
        } finally {
            setSaving(false)
        }
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

    const sectionsList = availableSections?.length ? availableSections : ALL_RIGHTS

    return (
        <form onSubmit={handleSubmit(onValid)} noValidate>
            {error && (
                <div style={{ background: '#fee', color: '#c00', padding: 10, borderRadius: 6, marginBottom: 16 }}>
                    {error}
                </div>
            )}
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
                    {sectionsList.map((sectionLabel) => (
                        <label key={sectionLabel} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={rights.includes(sectionLabel)}
                                onChange={() => toggleRight(sectionLabel)}
                            />
                            {sectionLabel}
                        </label>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" className="btn-admin btn-admin-secondary" onClick={onClose} disabled={saving}>
                    Отмена
                </button>
                <button type="submit" className="btn-admin btn-admin-primary" disabled={saving}>
                    {saving ? 'Сохранение...' : (isNew ? 'Создать' : 'Сохранить')}
                </button>
            </div>
        </form>
    )
}

export default function AdminManagers() {
    const { isAdmin, loading: authLoading } = useAuth()
    const [managers, setManagers] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [confirm, setConfirm] = useState(null)
    const [availableSections, setAvailableSections] = useState([])
    const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0 })
    const [filters, setFilters] = useState({
        search: '',
        is_active: '',
        sort_by: 'created_at',
        sort_order: 'desc',
    })
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    })

    // Используем ref для отслеживания, был ли initial load
    const initialLoadDone = useRef(false)

    const loadManagers = useCallback(async (page = 1) => {
        setLoading(true)
        try {
            const response = await adminManagers.list({
                ...filters,
                page: page,
            })
            if (response.success) {
                const managersList = response.data.map(fromApiToFrontend)
                setManagers(managersList)
                setPagination({
                    current_page: response.meta.current_page,
                    last_page: response.meta.last_page,
                    per_page: response.meta.per_page || 10,
                    total: response.meta.total,
                })
                setStats(response.stats)
                if (response.available_sections) {
                    const sections = mapSectionsFromApi(response.available_sections)
                    setAvailableSections(sections)
                    ALL_RIGHTS = sections
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки менеджеров:', error)
        } finally {
            setLoading(false)
        }
    }, [filters])

    const loadStats = useCallback(async () => {
        try {
            const response = await adminManagers.getStats()
            if (response.success) {
                setStats(response.data)
            }
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error)
        }
    }, [])

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setPagination(prev => ({ ...prev, current_page: 1 }))
    }

    const resetFilters = () => {
        setFilters({
            search: '',
            is_active: '',
            sort_by: 'created_at',
            sort_order: 'desc',
        })
        setPagination(prev => ({ ...prev, current_page: 1 }))
    }

    const goToPage = (page) => {
        if (page >= 1 && page <= pagination.last_page) {
            setPagination(prev => ({ ...prev, current_page: page }))
            loadManagers(page)
        }
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        loadManagers(1)
    }

    // Initial load
    useEffect(() => {
        if (isAdmin && !authLoading && !initialLoadDone.current) {
            initialLoadDone.current = true
            loadManagers(1)
            loadStats()
        }
    }, [isAdmin, authLoading, loadManagers, loadStats])

    // Загрузка при изменении фильтров
    useEffect(() => {
        if (initialLoadDone.current && isAdmin && !authLoading) {
            loadManagers(1)
        }
    }, [filters.search, filters.is_active, isAdmin, authLoading, loadManagers])

    if (authLoading) {
        return <div className="loading-state">Загрузка...</div>
    }

    if (!isAdmin) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">🔒</div>
                <p>Только для администратора</p>
            </div>
        )
    }

    const openCreate = () => {
        setEditing(null)
        setModal(true)
    }

    const openEdit = (item) => {
        setEditing(item)
        setModal(true)
    }

    const handleSave = async (apiData) => {
        try {
            let response
            if (editing) {
                response = await adminManagers.update(editing.id, apiData)
                if (response.success) {
                    const updatedManager = fromApiToFrontend(response.data)
                    setManagers(prev => prev.map(m => m.id === editing.id ? updatedManager : m))
                }
            } else {
                response = await adminManagers.create(apiData)
                if (response.success) {
                    const newManager = fromApiToFrontend(response.data)
                    setManagers(prev => [newManager, ...prev])
                }
            }
            setModal(false)
            loadStats()
            loadManagers(pagination.current_page)
        } catch (error) {
            throw error
        }
    }

    const handleToggleBlock = async (manager) => {
        try {
            const response = await adminManagers.toggleBlock(manager.id)
            if (response.success) {
                const updatedManager = fromApiToFrontend(response.data)
                setManagers(prev => prev.map(m => m.id === manager.id ? updatedManager : m))
                loadStats()
            }
        } catch (error) {
            alert(error.message || 'Ошибка при изменении статуса')
        }
    }

    const handleDelete = async (id) => {
        try {
            const response = await adminManagers.delete(id)
            if (response.success) {
                setManagers(prev => prev.filter(m => m.id !== id))
                setConfirm(null)
                loadStats()
                if (managers.length === 1 && pagination.current_page > 1) {
                    goToPage(pagination.current_page - 1)
                } else {
                    loadManagers(pagination.current_page)
                }
            }
        } catch (error) {
            alert(error.message || 'Ошибка при удалении')
        }
    }

    const EMPTY_FORM = {
        name: '',
        email: '',
        password: '',
        status: 'active',
        rights: []
    }

    if (loading && managers.length === 0) {
        return <div className="loading-state">Загрузка...</div>
    }

    return (
        <div>

            {/* Фильтры - стилизованы как в AdminOrders */}
            <div className="admin-filters" style={{
                marginBottom: 20,
                padding: 16,
                background: '#f5f5f5',
                borderRadius: 8
            }}>
                <form onSubmit={handleSearchSubmit} style={{
                    display: 'flex',
                    gap: 12,
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    <div className="admin-form-group" style={{ minWidth: 200, flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Поиск</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            placeholder="Поиск по имени или email..."
                            className="admin-input"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className="admin-form-group" style={{ minWidth: 150 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Статус</label>
                        <select
                            value={filters.is_active}
                            onChange={(e) => updateFilter('is_active', e.target.value)}
                            className="admin-input"
                            style={{ width: '100%' }}
                        >
                            <option value="">Все статусы</option>
                            <option value="1">Активен</option>
                            <option value="0">Заблокирован</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-admin btn-admin-primary" style={{ height: 38 }}>
                        🔍 Применить
                    </button>

                    <button
                        type="button"
                        className="btn-admin btn-admin-secondary"
                        onClick={() => {
                            resetFilters()
                            loadManagers(1)
                        }}
                        style={{ height: 38 }}
                    >
                        Сбросить
                    </button>
                </form>
            </div>

            {/* Кнопка добавления */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <button className="btn-admin btn-admin-primary" onClick={openCreate}>
                    + Добавить менеджера
                </button>
            </div>

            {/* Таблица */}
            {managers.length === 0 && !loading ? (
                <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <p>Нет менеджеров по выбранным фильтрам</p>
                </div>
            ) : (
                <>
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>Имя</th>
                                <th>Email</th>
                                <th>Статус</th>
                                <th>Доступ</th>
                                <th>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {managers.map((m) => (
                                <tr key={m.id}>
                                    <td style={{ fontWeight: 500 }}>{m.name}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{m.email}</td>
                                    <td><StatusBadge status={m.status} /></td>
                                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                        {m.rights?.join(', ') || '—'}
                                    </td>
                                    <td>
                                        <button className="icon-btn-admin" onClick={() => openEdit(m)} title="Редактировать">
                                            ✏️
                                        </button>
                                        <button
                                            className="icon-btn-admin"
                                            title={m.status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                                            onClick={() => handleToggleBlock(m)}
                                        >
                                            {m.status === 'active' ? '🔒' : '🔓'}
                                        </button>
                                        <button
                                            className="icon-btn-admin"
                                            onClick={() => setConfirm(m)}
                                            title="Удалить"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Пагинация */}
                    {pagination.last_page > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                            <button
                                className="btn-admin btn-admin-secondary"
                                onClick={() => goToPage(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                            >
                                ← Назад
                            </button>
                            <span style={{ padding: '8px 16px', background: '#f0f0f0', borderRadius: 6 }}>
                                {pagination.current_page} / {pagination.last_page}
                            </span>
                            <button
                                className="btn-admin btn-admin-secondary"
                                onClick={() => goToPage(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                            >
                                Вперёд →
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Модальное окно */}
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
                        availableSections={availableSections}
                    />
                </Modal>
            )}

            {/* Диалог подтверждения удаления */}
            {confirm && (
                <ConfirmDialog
                    message={`Удалить менеджера "${confirm.name}"?`}
                    onConfirm={() => handleDelete(confirm.id)}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </div>
    )
}