import { useState, useEffect, useRef } from 'react'
import Modal from '../../components/Modal/Modal'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import { adminContacts } from '../../../api/admin'
import { useToast } from '../../../shared/hooks/useToast'

export default function AdminContacts() {
    const toast = useToast()
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedMessage, setSelectedMessage] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 })
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    })
    const [filters, setFilters] = useState({
        is_read: '',
        search: '',
        sort_by: 'created_at',
        sort_order: 'desc',
        per_page: 10,
        page: 1,
    })
    const [deleting, setDeleting] = useState(false)

    // Используем ref для отслеживания первого монтирования
    const isInitialMount = useRef(true)

    // Функция загрузки сообщений — без useCallback, чтобы избежать лишних зависимостей
    const loadMessages = async (currentFilters) => {
        setLoading(true)
        try {
            const response = await adminContacts.list(currentFilters)
            if (response.success) {
                setMessages(response.data || [])
                setPagination(response.meta || {
                    current_page: 1,
                    last_page: 1,
                    per_page: 10,
                    total: 0,
                })
                if (response.stats) {
                    setStats(response.stats)
                }
            }
        } catch (error) {
            console.error('Failed to load messages:', error)
            toast.error('Ошибка загрузки сообщений')
        } finally {
            setLoading(false)
        }
    }

    // Функция загрузки статистики
    const loadStats = async () => {
        try {
            const response = await adminContacts.getStats()
            if (response.success && response.data) {
                setStats(response.data)
            }
        } catch (error) {
            console.error('Failed to load stats:', error)
        }
    }

    // Загрузка при монтировании
    useEffect(() => {
        loadMessages(filters)
        loadStats()
    }, []) // Пустой массив — только при монтировании

    // Отдельный эффект для фильтров (кроме первого рендера)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }
        loadMessages(filters)
    }, [filters.page, filters.per_page, filters.is_read, filters.search]) // Только нужные зависимости

    // Обновление фильтра
    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
    }

    // Сброс фильтров
    const resetFilters = () => {
        const defaultFilters = {
            is_read: '',
            search: '',
            sort_by: 'created_at',
            sort_order: 'desc',
            per_page: 10,
            page: 1,
        }
        setFilters(defaultFilters)
        // Загружаем напрямую, не дожидаясь обновления состояния
        loadMessages(defaultFilters)
        loadStats()
    }

    // Переход на страницу
    const goToPage = (page) => {
        if (page >= 1 && page <= pagination.last_page) {
            setFilters(prev => ({ ...prev, page }))
        }
    }

    // Открыть детали сообщения
    const openMessage = async (message) => {
        setSelectedMessage(message)
        // Если сообщение не прочитано - отмечаем
        if (!message.is_read) {
            try {
                const response = await adminContacts.markAsRead(message.id)
                if (response.success) {
                    // Обновляем сообщение в списке
                    setMessages(prev => prev.map(m =>
                        m.id === message.id ? { ...m, is_read: true, status_label: 'Прочитано', status_badge: 'neutral' } : m
                    ))
                    setSelectedMessage(prev => prev ? { ...prev, is_read: true } : null)
                    loadStats()
                }
            } catch (error) {
                console.error('Failed to mark as read:', error)
            }
        }
    }

    // Удаление сообщения
    const handleDelete = async () => {
        if (!confirmDelete) return

        setDeleting(true)
        try {
            const response = await adminContacts.delete(confirmDelete.id)
            if (response.success) {
                toast.success('Сообщение удалено')
                setMessages(prev => prev.filter(m => m.id !== confirmDelete.id))
                setConfirmDelete(null)
                loadStats()
                // Если на странице не осталось сообщений и это не первая страница - переходим назад
                if (messages.length === 1 && pagination.current_page > 1) {
                    goToPage(pagination.current_page - 1)
                } else {
                    loadMessages(filters)
                }
            }
        } catch (error) {
            console.error('Failed to delete message:', error)
            toast.error('Ошибка удаления сообщения')
        } finally {
            setDeleting(false)
        }
    }

    // Форматирование даты для отображения
    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        const date = new Date(dateStr)
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // Поиск при отправке формы
    const handleSearchSubmit = (e) => {
        e.preventDefault()
        loadMessages(filters)
    }

    if (loading && messages.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 18, color: '#666' }}>Загрузка сообщений...</div>
            </div>
        )
    }

    return (
        <div>
            {/* Статистика */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-label">Всего сообщений</div>
                    <div className="stat-value">{stats.total}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Непрочитанные</div>
                    <div className="stat-value" style={{ color: 'var(--state-info)' }}>{stats.unread}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Прочитанные</div>
                    <div className="stat-value" style={{ color: 'var(--state-success)' }}>{stats.read}</div>
                </div>
            </div>

            {/* Фильтры */}
            <div className="admin-filters" style={{
                marginBottom: 20,
                padding: 16,
                background: '#f5f5f5',
                borderRadius: 8,
            }}>
                <form onSubmit={handleSearchSubmit} style={{
                    display: 'flex',
                    gap: 12,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}>
                    <div className="admin-form-group" style={{ minWidth: 150 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Статус</label>
                        <select
                            value={filters.is_read}
                            onChange={(e) => updateFilter('is_read', e.target.value)}
                            className="admin-input"
                            style={{ width: '100%' }}
                        >
                            <option value="">Все</option>
                            <option value="0">Непрочитанные</option>
                            <option value="1">Прочитанные</option>
                        </select>
                    </div>

                    <div className="admin-form-group" style={{ flex: 1, minWidth: 200 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Поиск</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            placeholder="Имя, email или текст сообщения..."
                            className="admin-input"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className="admin-form-group" style={{ minWidth: 150 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>На странице</label>
                        <select
                            value={filters.per_page}
                            onChange={(e) => updateFilter('per_page', e.target.value)}
                            className="admin-input"
                            style={{ width: '100%' }}
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-admin btn-admin-primary" style={{ height: 38 }}>
                        🔍 Применить
                    </button>

                    <button
                        type="button"
                        className="btn-admin btn-admin-secondary"
                        onClick={resetFilters}
                        style={{ height: 38 }}
                    >
                        Сбросить
                    </button>
                </form>
            </div>

            {/* Таблица сообщений */}
            {messages.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">✉️</div>
                    <p>Нет сообщений по выбранным фильтрам</p>
                </div>
            ) : (
                <>
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th style={{ width: 40 }}></th>
                                <th>Имя</th>
                                <th>Email</th>
                                <th>Телефон</th>
                                <th>Сообщение</th>
                                <th>Дата</th>
                                <th>Статус</th>
                                <th style={{ width: 100 }}>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {messages.map((msg) => (
                                <tr
                                    key={msg.id}
                                    style={{
                                        background: msg.is_read ? 'transparent' : 'rgba(36,104,170,0.04)',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => openMessage(msg)}
                                >
                                    <td>
                                        {!msg.is_read && (
                                            <span
                                                style={{
                                                    display: 'inline-block',
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    background: 'var(--state-info)',
                                                }}
                                            />
                                        )}
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{msg.name}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{msg.email}</td>
                                    <td>{msg.phone || '—'}</td>
                                    <td style={{ maxWidth: 250 }}>
                                        <div style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {msg.message}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                                        {msg.created_at_formatted || formatDate(msg.created_at)}
                                    </td>
                                    <td>
                                        <StatusBadge status={msg.is_read ? 'read' : 'unread'} customLabel={msg.status_label} />
                                    </td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="icon-btn-admin"
                                            onClick={() => openMessage(msg)}
                                            title="Просмотреть"
                                        >
                                            👁️
                                        </button>
                                        <button
                                            className="icon-btn-admin"
                                            onClick={() => setConfirmDelete(msg)}
                                            title="Удалить"
                                            style={{ color: 'var(--state-error)' }}
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

            {/* Модальное окно с деталями сообщения */}
            {selectedMessage && (
                <Modal
                    title={`Сообщение от ${selectedMessage.name}`}
                    onClose={() => setSelectedMessage(null)}
                    maxWidth={700}
                >
                    <div>
                        {/* Информация об отправителе */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 16,
                            marginBottom: 24,
                            padding: 16,
                            background: '#f9fafb',
                            borderRadius: 12,
                        }}>
                            <div>
                                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Имя</div>
                                <div style={{ fontWeight: 500 }}>{selectedMessage.name}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Email</div>
                                <div>
                                    <a href={`mailto:${selectedMessage.email}`} style={{ color: 'var(--red-default)' }}>
                                        {selectedMessage.email}
                                    </a>
                                </div>
                            </div>
                            {selectedMessage.phone && (
                                <div>
                                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Телефон</div>
                                    <div>
                                        <a href={`tel:${selectedMessage.phone}`} style={{ color: 'var(--red-default)' }}>
                                            {selectedMessage.phone}
                                        </a>
                                    </div>
                                </div>
                            )}
                            <div>
                                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Дата отправки</div>
                                <div>{selectedMessage.created_at_formatted || formatDate(selectedMessage.created_at)}</div>
                            </div>
                        </div>

                        {/* Текст сообщения */}
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Сообщение</div>
                            <div style={{
                                padding: 16,
                                background: '#f9fafb',
                                borderRadius: 12,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                lineHeight: 1.6,
                            }}>
                                {selectedMessage.message}
                            </div>
                        </div>

                        {/* Действия */}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid #e0e0e0', paddingTop: 20 }}>
                            <button
                                className="btn-admin btn-admin-secondary"
                                onClick={() => setSelectedMessage(null)}
                            >
                                Закрыть
                            </button>
                            <button
                                className="btn-admin btn-admin-danger"
                                onClick={() => {
                                    setConfirmDelete(selectedMessage)
                                    setSelectedMessage(null)
                                }}
                            >
                                🗑️ Удалить
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Диалог подтверждения удаления */}
            {confirmDelete && (
                <ConfirmDialog
                    message={`Удалить сообщение от ${confirmDelete.name}? Это действие нельзя отменить.`}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmDelete(null)}
                    confirmText={deleting ? 'Удаление...' : 'Удалить'}
                    cancelText="Отмена"
                />
            )}
        </div>
    )
}