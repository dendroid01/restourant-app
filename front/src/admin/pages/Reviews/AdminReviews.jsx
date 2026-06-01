// AdminReviews.jsx
import { useState, useCallback, useRef, useEffect } from 'react'
import { useAdminReviews } from '../../hooks/useAdminReviews'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import StatusBadge from '../../components/StatusBadge/StatusBadge'

export default function AdminReviews() {
    const {
        reviews,
        loading,
        meta,
        stats,
        statuses,
        ratingOptions,
        filters,
        approve,
        reject,
        deleteReview,
        changePage,
        changeFilters
    } = useAdminReviews()

    const [confirmDelete, setConfirmDelete] = useState(null)
    const [showFilters, setShowFilters] = useState(false)
    const [searchValue, setSearchValue] = useState(filters.search || '')

    // Debounce для поиска
    const debounceTimer = useRef(null)

    const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n)

    const handleFilterChange = (key, value) => {
        changeFilters({ [key]: value })
    }

    // Поиск при вводе символов с debounce
    const handleSearchChange = useCallback((e) => {
        const value = e.target.value
        setSearchValue(value)

        // Очищаем предыдущий таймер
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current)
        }

        // Устанавливаем новый таймер
        debounceTimer.current = setTimeout(() => {
            changeFilters({ search: value })
        }, 500) // 500ms задержка
    }, [changeFilters])

    // Очищаем таймер при размонтировании
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current)
            }
        }
    }, [])

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        // При отправке формы применяем поиск сразу
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current)
        }
        changeFilters({ search: searchValue })
    }

    if (loading && reviews.length === 0) {
        return <div className="loading-spinner">Загрузка...</div>
    }

    return (
        <div>
            {/* Статистика */}
            <div className="stats-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stat-card">
                    <div className="stat-label">Всего</div>
                    <div className="stat-value">{stats.total}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">На проверке</div>
                    <div className="stat-value" style={{ color: 'var(--brand-info)' }}>{stats.pending}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Одобренные</div>
                    <div className="stat-value" style={{ color: 'var(--brand-success)' }}>{stats.approved}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Отклонённые</div>
                    <div className="stat-value" style={{ color: 'var(--brand-error)' }}>{stats.rejected}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Средний рейтинг</div>
                    <div className="stat-value">{stats.average_rating} ★</div>
                </div>
            </div>

            {/* Фильтры - добавлен gap */}
            <div className="filters-bar" style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap',
                marginBottom: 'var(--spacing-lg)'}}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <input
                        type="text"
                        name="search"
                        placeholder="Поиск по имени или тексту..."
                        value={searchValue}
                        onChange={handleSearchChange}
                        className="form-control"
                        style={{ width: 250 }}
                    />
                    <button type="submit" className="btn btn-primary">Найти</button>
                </form>

                <button
                    className="btn btn-secondary"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    🔍 {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
                </button>
            </div>

            {showFilters && (
                <div className="filters-panel" style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                        {/* Статус */}
                        <div>
                            <label className="form-label">Статус</label>
                            <select
                                className="form-control"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                {statuses.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Рейтинг */}
                        <div>
                            <label className="form-label">Рейтинг</label>
                            <select
                                className="form-control"
                                value={filters.rating}
                                onChange={(e) => handleFilterChange('rating', e.target.value)}
                            >
                                {ratingOptions.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Дата от */}
                        <div>
                            <label className="form-label">Дата от</label>
                            <input
                                type="date"
                                className="form-control"
                                value={filters.date_from}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                            />
                        </div>

                        {/* Дата до */}
                        <div>
                            <label className="form-label">Дата до</label>
                            <input
                                type="date"
                                className="form-control"
                                value={filters.date_to}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                            />
                        </div>

                        {/* Сортировка */}
                        <div>
                            <label className="form-label">Сортировать по</label>
                            <select
                                className="form-control"
                                value={filters.sort_by}
                                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                            >
                                <option value="created_at">Дате</option>
                                <option value="rating">Рейтингу</option>
                                <option value="name">Имени</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label">Порядок</label>
                            <select
                                className="form-control"
                                value={filters.sort_order}
                                onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                            >
                                <option value="desc">Сначала новые</option>
                                <option value="asc">Сначала старые</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label">На странице</label>
                            <select
                                className="form-control"
                                value={filters.per_page}
                                onChange={(e) => handleFilterChange('per_page', e.target.value)}
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                    </div>

                    <button
                        className="btn btn-secondary"
                        onClick={() => changeFilters({
                            status: 'all',
                            rating: '',
                            search: '',
                            date_from: '',
                            date_to: '',
                            sort_by: 'created_at',
                            sort_order: 'desc',
                            per_page: 10
                        })}
                        style={{ marginTop: 'var(--spacing-md)' }}
                    >
                        Сбросить фильтры
                    </button>
                </div>
            )}

            {/* Таблица отзывов */}
            {reviews.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">⭐</div>
                    <p>Нет отзывов</p>
                </div>
            ) : (
                <>
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>Имя</th>
                                <th>Email</th>
                                <th>Оценка</th>
                                <th>Отзыв</th>
                                <th>Дата</th>
                                <th>IP</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {reviews.map(r => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 500 }}>{r.name}</td>
                                    <td>{r.email || '—'}</td>
                                    <td style={{ color: 'var(--gold-default)', letterSpacing: 2 }}>
                                        {stars(r.rating)}
                                    </td>
                                    <td style={{ maxWidth: 300 }}>
                                        <div style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {r.text_ru}
                                        </div>
                                    </td>
                                    <td>{r.date_ru}</td>
                                    <td style={{ fontSize: 12, fontFamily: 'monospace' }}>
                                        {r.ip_address || '—'}
                                    </td>
                                    <td><StatusBadge status={r.status} /></td>
                                    <td>
                                        {r.status === 'pending' && (
                                            <>
                                                <button
                                                    className="icon-btn-admin"
                                                    title="Одобрить"
                                                    onClick={() => approve(r.id)}
                                                    style={{ color: 'var(--brand-success)' }}
                                                >
                                                    ✅
                                                </button>
                                                <button
                                                    className="icon-btn-admin"
                                                    title="Отклонить"
                                                    onClick={() => reject(r.id)}
                                                    style={{ color: 'var(--brand-error)' }}
                                                >
                                                    ❌
                                                </button>
                                            </>
                                        )}
                                        {r.status === 'approved' && (
                                            <button
                                                className="icon-btn-admin"
                                                title="Отклонить"
                                                onClick={() => reject(r.id)}
                                                style={{ color: 'var(--brand-error)' }}
                                            >
                                                ❌
                                            </button>
                                        )}
                                        {r.status === 'rejected' && (
                                            <button
                                                className="icon-btn-admin"
                                                title="Одобрить"
                                                onClick={() => approve(r.id)}
                                                style={{ color: 'var(--brand-success)' }}
                                            >
                                                ✅
                                            </button>
                                        )}
                                        <button
                                            className="icon-btn-admin"
                                            title="Удалить"
                                            onClick={() => setConfirmDelete(r.id)}
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
                    {meta.last_page > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                disabled={meta.current_page === 1}
                                onClick={() => changePage(meta.current_page - 1)}
                            >
                                ←
                            </button>

                            {[...Array(meta.last_page)].map((_, i) => {
                                const page = i + 1
                                if (
                                    page === 1 ||
                                    page === meta.last_page ||
                                    (page >= meta.current_page - 2 && page <= meta.current_page + 2)
                                ) {
                                    return (
                                        <button
                                            key={page}
                                            className={`pagination-btn ${meta.current_page === page ? 'active' : ''}`}
                                            onClick={() => changePage(page)}
                                        >
                                            {page}
                                        </button>
                                    )
                                } else if (
                                    page === meta.current_page - 3 ||
                                    page === meta.current_page + 3
                                ) {
                                    return <span key={page} className="pagination-dots">...</span>
                                }
                                return null
                            })}

                            <button
                                className="pagination-btn"
                                disabled={meta.current_page === meta.last_page}
                                onClick={() => changePage(meta.current_page + 1)}
                            >
                                →
                            </button>
                        </div>
                    )}
                </>
            )}

            {confirmDelete && (
                <ConfirmDialog
                    message="Удалить отзыв? Это действие нельзя отменить."
                    onConfirm={() => {
                        deleteReview(confirmDelete)
                        setConfirmDelete(null)
                    }}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}
        </div>
    )
}