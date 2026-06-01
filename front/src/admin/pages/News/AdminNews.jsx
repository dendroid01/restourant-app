import {useState, useEffect} from 'react'
import {useNews} from '../../hooks/useNews'
import {adminNews} from '../../../api/admin'  // <-- ДОБАВИТЬ ЭТОТ ИМПОРТ
import Modal from '../../components/Modal/Modal'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import RichTextEditor from '../../../shared/components/RichTextEditor/RichTextEditor'
import {useToast} from '../../../shared/hooks/useToast'

const EMPTY_FORM = {
    title_ru: '',
    title_en: '',
    excerpt_ru: '',
    excerpt_en: '',
    content_ru: '',
    content_en: '',
    published_at: '',
    status: 'draft',
    tags: '',
    image_thumb: '',
    image_full: '',
}

export default function AdminNews() {
    const {
        news,
        loading,
        meta,
        stats,
        statuses,
        filters,
        loadNews,
        createNews,
        updateNews,
        deleteNews,
        updateFilter,
        resetFilters,
    } = useNews()

    const toast = useToast()
    const [modal, setModal] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [formLoading, setFormLoading] = useState(false)  // <-- отдельное состояние для загрузки формы
    const [activeLang, setActiveLang] = useState('ru') // 'ru' или 'en'
    const [activeTab, setActiveTab] = useState('main') // 'main', 'content', 'media'

    // Загрузка при монтировании
    useEffect(() => {
        loadNews(1)
    }, [])

    const openCreate = () => {
        setForm(EMPTY_FORM)
        setEditingId(null)
        setModal('form')
    }

    const openEdit = async (item) => {
        setFormLoading(true)  // <-- используем formLoading, а не loading
        setModal('form')      // <-- открываем модалку ДО загрузки, чтобы показать индикатор

        try {
            // Загружаем полные данные с сервера
            const response = await adminNews.getById(item.id)
            const fullItem = response.data  // NewsResource

            setForm({
                title_ru: fullItem.title_ru || '',
                title_en: fullItem.title_en || '',
                excerpt_ru: fullItem.excerpt_ru || '',
                excerpt_en: fullItem.excerpt_en || '',
                content_ru: fullItem.content_ru || '',
                content_en: fullItem.content_en || '',
                published_at: fullItem.published_at || '',
                status: fullItem.status || 'draft',
                tags: fullItem.tags?.join(', ') || '',
                image_thumb: fullItem.image_thumb || '',
                image_full: fullItem.image_full || '',
            })
            setEditingId(fullItem.id)
        } catch (error) {
            console.error('Error loading news:', error)
            toast.error('Ошибка загрузки данных новости')
            setModal(null)  // закрываем модалку при ошибке
        } finally {
            setFormLoading(false)
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()

        const submitData = {
            title_ru: form.title_ru,
            title_en: form.title_en,
            excerpt_ru: form.excerpt_ru,
            excerpt_en: form.excerpt_en,
            content_ru: form.content_ru,
            content_en: form.content_en,
            published_at: form.published_at || null,
            status: form.status,
            tags: form.tags,  // строка, например "важное, новости, событие"
            image_thumb: form.image_thumb,
            image_full: form.image_full,
        }

        try {
            if (editingId) {
                await updateNews(editingId, submitData)
            } else {
                await createNews(submitData)
            }
            setModal(null)
        } catch (error) {
            console.error('Save error:', error)
        }
    }

    const handleDelete = async (id) => {
        try {
            await deleteNews(id)
            setConfirmDelete(null)
        } catch (error) {
            // Ошибка уже обработана
        }
    }

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= meta.last_page) {
            loadNews(newPage)
        }
    }

    const handleFilterChange = (key, value) => {
        updateFilter(key, value)
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        loadNews(1)
    }

    const f = (field) => ({
        value: form[field] ?? '',
        onChange: e => setForm(p => ({...p, [field]: e.target.value})),
        className: 'admin-input',
    })

    return (
        <div>
            {/* Фильтры - без изменений */}
            <div className="admin-filters"
                 style={{marginBottom: 20, padding: 16, background: '#f5f5f5', borderRadius: 8}}>
                <form onSubmit={handleSearchSubmit}
                      style={{display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center'}}>
                    <div className="admin-form-group" style={{flex: 1, minWidth: 200}}>
                        <label style={{display: 'block', marginBottom: 4, fontSize: 12}}>Поиск</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={e => handleFilterChange('search', e.target.value)}
                            placeholder="Заголовок..."
                            className="admin-input"
                            style={{width: '100%'}}
                        />
                    </div>

                    <div className="admin-form-group" style={{minWidth: 150}}>
                        <label style={{display: 'block', marginBottom: 4, fontSize: 12}}>Статус</label>
                        <select
                            value={filters.status}
                            onChange={e => handleFilterChange('status', e.target.value)}
                            className="admin-input"
                            style={{width: '100%'}}
                        >
                            <option value="">Все</option>
                            {statuses.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-form-group" style={{minWidth: 150}}>
                        <label style={{display: 'block', marginBottom: 4, fontSize: 12}}>Дата с</label>
                        <input
                            type="date"
                            value={filters.date_from}
                            onChange={e => handleFilterChange('date_from', e.target.value)}
                            className="admin-input"
                            style={{width: '100%'}}
                        />
                    </div>

                    <div className="admin-form-group" style={{minWidth: 150}}>
                        <label style={{display: 'block', marginBottom: 4, fontSize: 12}}>Дата по</label>
                        <input
                            type="date"
                            value={filters.date_to}
                            onChange={e => handleFilterChange('date_to', e.target.value)}
                            className="admin-input"
                            style={{width: '100%'}}
                        />
                    </div>

                    <button type="submit" className="btn-admin btn-admin-primary" style={{height: 38}}>
                        🔍 Применить
                    </button>

                    <button
                        type="button"
                        className="btn-admin btn-admin-secondary"
                        onClick={() => {
                            resetFilters();
                            loadNews(1)
                        }}
                        style={{height: 38}}
                    >
                        Сбросить
                    </button>
                </form>
            </div>

            {/* Кнопка создания */}
            <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 20}}>
                <button className="btn-admin btn-admin-primary" onClick={openCreate}>+ Новая новость</button>
            </div>

            {/* Таблица */}
            {loading && news.length === 0 ? (
                <div className="empty-state">Загрузка...</div>
            ) : news.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📰</div>
                    <p>Новостей пока нет</p></div>
            ) : (
                <>
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>Заголовок (RU)</th>
                                <th>Дата публикации</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {news.map(item => (
                                <tr key={item.id}>
                                    <td style={{fontWeight: 500}}>{item.title_ru}</td>
                                    <td>{item.published_at_formatted || item.published_at || '—'}</td>
                                    <td><StatusBadge status={item.status}/></td>
                                    <td>
                                        <button className="icon-btn-admin" onClick={() => openEdit(item)}>✏️</button>
                                        <button className="icon-btn-admin"
                                                onClick={() => setConfirmDelete(item.id)}>🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Пагинация */}
                    {meta.last_page > 1 && (
                        <div style={{display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24}}>
                            <button
                                className="btn-admin btn-admin-secondary"
                                onClick={() => handlePageChange(meta.current_page - 1)}
                                disabled={meta.current_page === 1}
                            >
                                ← Назад
                            </button>
                            <span style={{padding: '8px 16px', background: '#f0f0f0', borderRadius: 6}}>
                                {meta.current_page} / {meta.last_page}
                            </span>
                            <button
                                className="btn-admin btn-admin-secondary"
                                onClick={() => handlePageChange(meta.current_page + 1)}
                                disabled={meta.current_page === meta.last_page}
                            >
                                Вперед →
                            </button>
                        </div>
                    )}
                </>
            )}

            {modal === 'form' && (
                <Modal title={editingId ? 'Редактировать новость' : 'Новая новость'} onClose={() => setModal(null)}
                       maxWidth={900}>
                    {formLoading ? (
                        <div style={{textAlign: 'center', padding: 40}}>Загрузка данных новости...</div>
                    ) : (
                        <form onSubmit={handleSave}>
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

                            {/* Показываем поля только для выбранного языка */}
                            {activeLang === 'ru' ? (
                                // RU поля
                                <>
                                    <div className="admin-form-group">
                                        <label>Заголовок (RU) *</label>
                                        <input {...f('title_ru')} required/>
                                    </div>

                                    <div className="admin-form-group">
                                        <label>Анонс (RU)</label>
                                        <RichTextEditor
                                            value={form.excerpt_ru}
                                            onChange={val => setForm(p => ({...p, excerpt_ru: val}))}
                                            placeholder="Краткое описание новости..."
                                            adminStyle
                                            minHeight={100}
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label>Текст (RU)</label>
                                        <RichTextEditor
                                            value={form.content_ru}
                                            onChange={val => setForm(p => ({...p, content_ru: val}))}
                                            placeholder="Полный текст новости..."
                                            adminStyle
                                            minHeight={250}
                                        />
                                    </div>
                                </>
                            ) : (
                                // EN поля
                                <>
                                    <div className="admin-form-group">
                                        <label>Title (EN)</label>
                                        <input {...f('title_en')} />
                                    </div>

                                    <div className="admin-form-group">
                                        <label>Excerpt (EN)</label>
                                        <RichTextEditor
                                            value={form.excerpt_en}
                                            onChange={val => setForm(p => ({...p, excerpt_en: val}))}
                                            placeholder="Short news description..."
                                            adminStyle
                                            minHeight={100}
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label>Content (EN)</label>
                                        <RichTextEditor
                                            value={form.content_en}
                                            onChange={val => setForm(p => ({...p, content_en: val}))}
                                            placeholder="Full news content..."
                                            adminStyle
                                            minHeight={250}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Общие поля (не зависят от языка) */}
                            <div style={{marginTop: 24, paddingTop: 24, borderTop: '1px solid #e0e0e0'}}>
                                <h4 style={{marginBottom: 16, fontSize: 16, fontWeight: 500}}>Общие настройки</h4>

                                <div className="admin-form-row-2">
                                    <div className="admin-form-group">
                                        <label>Дата публикации</label>
                                        <input type="date" {...f('published_at')} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label>Теги (через запятую)</label>
                                        <input {...f('tags')} placeholder="важное, новости, событие"/>
                                    </div>
                                </div>

                                <div className="admin-form-row-2">
                                    <div className="admin-form-group">
                                        <label>Превью картинка (URL)</label>
                                        <input {...f('image_thumb')} placeholder="https://...thumb.jpg"/>
                                    </div>
                                    <div className="admin-form-group">
                                        <label>Полная картинка (URL)</label>
                                        <input {...f('image_full')} placeholder="https://...full.jpg"/>
                                    </div>
                                </div>

                                <div className="admin-form-group">
                                    <label>Статус</label>
                                    <select {...f('status')} className="admin-input">
                                        <option value="draft">Черновик</option>
                                        <option value="published">Опубликовано</option>
                                    </select>
                                </div>
                            </div>

                            {/* Кнопки */}
                            <div style={{display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24}}>
                                <button type="button" className="btn-admin btn-admin-secondary"
                                        onClick={() => setModal(null)}>
                                    Отмена
                                </button>
                                <button type="submit" className="btn-admin btn-admin-primary" disabled={loading}>
                                    {loading ? 'Сохранение...' : 'Сохранить'}
                                </button>
                            </div>
                        </form>
                    )}
                </Modal>
            )}

            {/* Диалог подтверждения удаления */}
            {confirmDelete && (
                <ConfirmDialog
                    message="Удалить новость? Это действие нельзя отменить."
                    onConfirm={() => handleDelete(confirmDelete)}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}
        </div>
    )
}