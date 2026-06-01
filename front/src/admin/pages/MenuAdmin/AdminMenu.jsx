import {useState, useMemo, useEffect} from 'react'
import {useMenuCategories} from '../../hooks/useMenuCategories'
import {useMenuItems} from '../../hooks/useMenuItems'
import {adminMenuCategories} from '../../../api/admin'
import Modal from '../../components/Modal/Modal'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import RichTextEditor from '../../../shared/components/RichTextEditor/RichTextEditor'
import {useToast} from '../../../shared/hooks/useToast'
import SafeHtml from '../../../shared/components/SafeHtml/SafeHtml'
import {useTranslation} from 'react-i18next'

// Компонент для отображения дерева категорий с кнопкой удаления
function CategoryTree({categories, activeCategoryId, onSelect, onDeleteCategory, getCategoryTitle, level = 0}) {
    const [hoveredId, setHoveredId] = useState(null)

    if (!categories || categories.length === 0) return null

    return (
        <div style={{marginLeft: level * 16}}>
            {categories.map(cat => {
                const isActive = activeCategoryId === cat.id
                const isHovered = hoveredId === cat.id
                const showDeleteButton = isActive || isHovered

                return (
                    <div
                        key={cat.id}
                        onMouseEnter={() => setHoveredId(cat.id)}
                        onMouseLeave={() => setHoveredId(null)}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                borderRadius: 8,
                                marginBottom: 2,
                                backgroundColor: isActive ? 'rgba(220, 38, 38, 0.1)' : 'transparent',
                                cursor: 'pointer',
                            }}
                        >
                            <div
                                style={{flex: 1}}
                                onClick={() => onSelect(cat)}
                            >
                                <span style={{fontWeight: isActive ? 600 : 400}}>
                                    {getCategoryTitle(cat)}
                                </span>
                                {cat.is_active === false && (
                                    <span style={{marginLeft: 8, fontSize: 11, color: '#999'}}>(скрыта)</span>
                                )}
                            </div>
                            {showDeleteButton && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDeleteCategory(cat)
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        color: '#ef4444',
                                        padding: '4px 8px',
                                        borderRadius: 4,
                                        transition: 'opacity 0.2s',
                                    }}
                                    title="Удалить категорию"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                        {cat.children && cat.children.length > 0 && (
                            <CategoryTree
                                categories={cat.children}
                                activeCategoryId={activeCategoryId}
                                onSelect={onSelect}
                                onDeleteCategory={onDeleteCategory}
                                getCategoryTitle={getCategoryTitle}
                                level={level + 1}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// Компонент модалки для блюда
// Компонент модалки для блюда
function DishModal({isOpen, onClose, editingId, initialForm, onSave, categories, loading}) {
    const [activeLang, setActiveLang] = useState('ru')
    const [form, setForm] = useState(initialForm)
    const [formLoading, setFormLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setForm(initialForm)
            setFormLoading(false)
        }
    }, [isOpen, initialForm])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormLoading(true)
        const success = await onSave(form)
        setFormLoading(false)
        if (success) onClose()
    }

    const f = (field) => ({
        value: form?.[field] ?? '',
        onChange: e => setForm(p => ({...p, [field]: e.target.value})),
        className: 'admin-input',
    })

    if (!isOpen) return null

    // Безопасная проверка - categories всегда массив
    const safeCategories = Array.isArray(categories) ? categories : []

    return (
        <Modal title={editingId ? 'Редактировать блюдо' : 'Новое блюдо'} onClose={onClose} maxWidth={900}>
            <form onSubmit={handleSubmit}>
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
                            background: activeLang === 'ru' ? '#dc2626' : 'transparent',
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
                            background: activeLang === 'en' ? '#dc2626' : 'transparent',
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

                {/* Языковые поля */}
                {activeLang === 'ru' ? (
                    <>
                        <div className="admin-form-group">
                            <label>Название (RU) *</label>
                            <input {...f('title_ru')} required/>
                        </div>
                        <div className="admin-form-group">
                            <label>Описание (RU)</label>
                            <RichTextEditor
                                value={form?.description_ru || ''}
                                onChange={val => setForm(p => ({...p, description_ru: val}))}
                                placeholder="Описание блюда..."
                                adminStyle
                                minHeight={150}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="admin-form-group">
                            <label>Название (EN)</label>
                            <input {...f('title_en')} />
                        </div>
                        <div className="admin-form-group">
                            <label>Описание (EN)</label>
                            <RichTextEditor
                                value={form?.description_en || ''}
                                onChange={val => setForm(p => ({...p, description_en: val}))}
                                placeholder="Dish description..."
                                adminStyle
                                minHeight={150}
                            />
                        </div>
                    </>
                )}

                {/* Общие поля */}
                <div style={{marginTop: 24, paddingTop: 24, borderTop: '1px solid #e0e0e0'}}>
                    <h4 style={{marginBottom: 16, fontSize: 16, fontWeight: 500}}>Общие настройки</h4>

                    <div className="admin-form-row-2">
                        <div className="admin-form-group">
                            <label>Категория *</label>
                            <select
                                value={form?.category_id || ''}
                                onChange={e => setForm(p => ({...p, category_id: Number(e.target.value)}))}
                                className="admin-input"
                                required
                            >
                                <option value="">Выберите категорию</option>
                                {/* ИСПРАВЛЕНО: используем safeCategories вместо categories */}
                                {safeCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.title_ru}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="admin-form-group">
                            <label>Цена (₽) *</label>
                            <input type="number" step="1" {...f('price')} required/>
                        </div>
                    </div>

                    <div className="admin-form-group">
                        <label>URL изображения</label>
                        <input {...f('image')} placeholder="https://example.com/image.jpg"/>
                        {form?.image && (
                            <div style={{marginTop: 8}}>
                                <img src={form.image} alt="Preview" style={{maxWidth: 100, borderRadius: 8}}/>
                            </div>
                        )}
                    </div>

                    <div className="admin-form-group">
                        <label style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8}}>
                            <input
                                type="checkbox"
                                checked={form?.is_active ?? true}
                                onChange={e => setForm(p => ({...p, is_active: e.target.checked}))}
                            />
                            Активно (отображается на сайте)
                        </label>

                        <label style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8}}>
                            <input
                                type="checkbox"
                                checked={form?.is_featured ?? false}
                                onChange={e => setForm(p => ({...p, is_featured: e.target.checked}))}
                            />
                            Рекомендуемое (на главной)
                        </label>

                        <label style={{display: 'flex', alignItems: 'center', gap: 12}}>
                            <input
                                type="checkbox"
                                checked={form?.is_available_for_events ?? false}
                                onChange={e => setForm(p => ({...p, is_available_for_events: e.target.checked}))}
                            />
                            Доступно для мероприятий
                        </label>
                    </div>
                </div>

                {/* Кнопки */}
                <div style={{display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24}}>
                    <button type="button" className="btn-admin btn-admin-secondary" onClick={onClose}>
                        Отмена
                    </button>
                    <button type="submit" className="btn-admin btn-admin-primary" disabled={formLoading || loading}>
                        {formLoading || loading ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

// Компонент массовых действий
function BulkActions({selectedIds, onClear, onUpdateStatus, onUpdateFeatured}) {
    const [showActions, setShowActions] = useState(false)

    if (selectedIds.length === 0) return null

    return (
        <div style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '12px 20px',
            zIndex: 100,
            border: '1px solid #e0e0e0',
        }}>
            <div style={{marginBottom: 8, fontSize: 13, color: '#666'}}>
                Выбрано: {selectedIds.length}
            </div>
            <div style={{display: 'flex', gap: 8}}>
                <button
                    className="btn-admin btn-admin-secondary"
                    onClick={() => setShowActions(!showActions)}
                >
                    Действия ▼
                </button>
                <button className="btn-admin btn-admin-secondary" onClick={onClear}>
                    Отменить
                </button>
            </div>
            {showActions && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: 0,
                    marginBottom: 8,
                    background: 'white',
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0',
                    minWidth: 200,
                }}>
                    <button
                        onClick={() => onUpdateStatus(true)}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: 10,
                            textAlign: 'left',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Активировать
                    </button>
                    <button
                        onClick={() => onUpdateStatus(false)}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: 10,
                            textAlign: 'left',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Деактивировать
                    </button>
                    <hr style={{margin: '4px 0'}}/>
                    <button
                        onClick={() => onUpdateFeatured(true)}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: 10,
                            textAlign: 'left',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Сделать рекомендуемыми
                    </button>
                    <button
                        onClick={() => onUpdateFeatured(false)}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: 10,
                            textAlign: 'left',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Убрать из рекомендуемых
                    </button>
                </div>
            )}
        </div>
    )
}

export default function AdminMenu() {
    const {t, i18n} = useTranslation()
    const {
        categories,
        loading: categoriesLoading,
        error: categoriesError,
        getFlatCategories,
        refetch: refetchCategories
    } = useMenuCategories()
    const {
        items,
        loading: itemsLoading,
        meta,
        stats,
        filterOptions,
        filters,
        loadItems,
        createItem,
        updateItem,
        deleteItem,
        bulkUpdateStatus,
        bulkUpdateFeatured,
        updateFilter,
        resetFilters,
    } = useMenuItems()

    const toast = useToast()
    const [activeCategory, setActiveCategory] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [initialForm, setInitialForm] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [selectedIds, setSelectedIds] = useState([])
    const [flatCategories, setFlatCategories] = useState([])

    // Состояния для модалки создания категории
    const [categoryModalOpen, setCategoryModalOpen] = useState(false)
    const [newCategoryForm, setNewCategoryForm] = useState({
        title_ru: '',
        title_en: '',
        slug: '',
        parent_id: null,
        is_active: true,
    })
    const [categoryFormErrors, setCategoryFormErrors] = useState({})
    const [creatingCategory, setCreatingCategory] = useState(false)

    // Состояния для удаления категории
    const [categoryToDelete, setCategoryToDelete] = useState(null)
    const [deletingCategory, setDeletingCategory] = useState(false)

    // Методы для получения заголовков с учётом языка
    const getCategoryTitle = (category) => {
        return i18n.language === 'en' && category.title_en
            ? category.title_en
            : category.title_ru
    }

    const getDishTitle = (dish) => {
        return i18n.language === 'en' && dish.title_en
            ? dish.title_en
            : dish.title_ru
    }

    // Получаем плоский список категорий для селекта
    useEffect(() => {
        if (!categoriesLoading && categories && categories.length > 0) {
            const flat = getFlatCategories()
            setFlatCategories(Array.isArray(flat) ? flat : [])
        } else {
            setFlatCategories([]) // сбрасываем если нет категорий
        }
    }, [categories, categoriesLoading, getFlatCategories])

    // Загрузка блюд при изменении фильтров или активной категории
    useEffect(() => {
        loadItems(1)
    }, [filters.category_id, filters.is_active, filters.is_featured, filters.is_available_for_events, filters.search])



    // При загрузке категорий выбираем первую корневую категорию по умолчанию
    useEffect(() => {
        if (!categoriesLoading && categories.length > 0 && activeCategory === null && filters.category_id === '') {
        }
    }, [categoriesLoading, categories, activeCategory, filters.category_id])

    // При смене активной категории обновляем фильтр
    const handleCategorySelect = (category) => {
        if (activeCategory?.id === category.id) {
            // Если кликнули на ту же категорию - снимаем выделение
            setActiveCategory(null)
            updateFilter('category_id', '')
        } else {
            setActiveCategory(category)
            updateFilter('category_id', category.id)
        }
        setSelectedIds([]) // Сбрасываем выделение
    }

    const openCreate = () => {
        setEditingId(null)
        setInitialForm({
            title_ru: '',
            title_en: '',
            description_ru: '',
            description_en: '',
            price: '',
            category_id: activeCategory?.id || null,
            image: '',
            order: 0,
            is_active: true,
            is_featured: false,
            is_available_for_events: false,
        })
        setModalOpen(true)
    }

    const openEdit = async (item) => {
        setEditingId(item.id)
        setInitialForm({
            title_ru: item.title_ru || '',
            title_en: item.title_en || '',
            description_ru: item.description_ru || '',
            description_en: item.description_en || '',
            price: item.price || '',
            category_id: item.category_id,
            image: item.image || '',
            order: item.order || 0,
            is_active: item.is_active ?? true,
            is_featured: item.is_featured ?? false,
            is_available_for_events: item.is_available_for_events ?? false,
        })
        setModalOpen(true)
    }

    const handleSave = async (formData) => {
        if (editingId) {
            return await updateItem(editingId, formData)
        } else {
            return await createItem(formData)
        }
    }

    const handleDelete = async () => {
        if (confirmDelete) {
            await deleteItem(confirmDelete)
            setConfirmDelete(null)
        }
    }

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === items.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(items.map(i => i.id))
        }
    }

    const handleBulkUpdateStatus = async (isActive) => {
        await bulkUpdateStatus(selectedIds, isActive)
        setSelectedIds([])
    }

    const handleBulkUpdateFeatured = async (isFeatured) => {
        await bulkUpdateFeatured(selectedIds, isFeatured)
        setSelectedIds([])
    }

    // Обработчик создания категории
    const handleCreateCategory = async (e) => {
        e.preventDefault()
        setCreatingCategory(true)
        setCategoryFormErrors({})

        try {
            const response = await adminMenuCategories.create(newCategoryForm)
            toast.success('Категория создана')
            setCategoryModalOpen(false)
            setNewCategoryForm({
                title_ru: '',
                title_en: '',
                slug: '',
                parent_id: null,
                is_active: true,
            })
            await refetchCategories()

            if (response && response.data) {
                setActiveCategory(response.data)
                updateFilter('category_id', response.data.id)
            }
        } catch (err) {
            console.error('Create category error:', err)
            if (err.body?.errors) {
                setCategoryFormErrors(err.body.errors)
            } else {
                toast.error(err.message || 'Ошибка создания категории')
            }
        } finally {
            setCreatingCategory(false)
        }
    }

    // Обработчик удаления категории
    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return

        setDeletingCategory(true)
        try {
            await adminMenuCategories.remove(categoryToDelete.id)
            toast.success(`Категория "${categoryToDelete.title_ru}" удалена`)

            if (activeCategory?.id === categoryToDelete.id) {
                setActiveCategory(null)
                updateFilter('category_id', '')
            }

            setCategoryToDelete(null)
            await refetchCategories()
        } catch (err) {
            console.error('Delete category error:', err)
            toast.error(err.message || 'Ошибка удаления категории')
        } finally {
            setDeletingCategory(false)
        }
    }

    if (categoriesLoading) {
        return <div className="admin-loading">Загрузка категорий...</div>
    }

    if (categoriesError) {
        return <div className="admin-error">Ошибка: {categoriesError}</div>
    }

    return (
        <div>
            {/* Фильтры */}
            <div className="admin-filters"
                 style={{marginBottom: 20, padding: 16, background: '#f5f5f5', borderRadius: 8}}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    loadItems(1);
                }} style={{display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center'}}>
                    <div className="admin-form-group" style={{minWidth: 150}}>
                        <label style={{display: 'block', marginBottom: 4, fontSize: 12}}>Статус</label>
                        <select
                            value={filters.is_active}
                            onChange={e => updateFilter('is_active', e.target.value)}
                            className="admin-input"
                        >
                            {filterOptions.active_statuses?.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-form-group" style={{minWidth: 150}}>
                        <label style={{display: 'block', marginBottom: 4, fontSize: 12}}>Рекомендуемые</label>
                        <select
                            value={filters.is_featured}
                            onChange={e => updateFilter('is_featured', e.target.value)}
                            className="admin-input"
                        >
                            {filterOptions.featured_statuses?.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-form-group" style={{minWidth: 180}}>
                        <label style={{display: 'block', marginBottom: 4, fontSize: 12}}>Для мероприятий</label>
                        <select
                            value={filters.is_available_for_events}
                            onChange={e => updateFilter('is_available_for_events', e.target.value)}
                            className="admin-input"
                        >
                            {filterOptions.event_statuses?.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-form-group" style={{flex: 1, minWidth: 200}}>
                        <label style={{display: 'block', marginBottom: 4, fontSize: 12}}>Поиск</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={e => updateFilter('search', e.target.value)}
                            placeholder="Название блюда..."
                            className="admin-input"
                        />
                    </div>

                    <button type="submit" className="btn-admin btn-admin-primary">
                        🔍 Применить
                    </button>

                    <button
                        type="button"
                        className="btn-admin btn-admin-secondary"
                        onClick={() => {
                            resetFilters()
                            loadItems(1)
                        }}
                    >
                        Сбросить
                    </button>
                </form>
            </div>

            <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 16}}>
                <button className="btn-admin btn-admin-primary" onClick={openCreate} disabled={!activeCategory}>
                    + Добавить блюдо
                </button>
            </div>

            <div className="menu-admin-layout">
                {/* Категории - дерево из API */}
                <div className="categories-panel">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 12
                    }}>
                        <p style={{fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)'}}>
                            Категории
                        </p>
                        <button
                            onClick={() => setCategoryModalOpen(true)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: 18,
                                cursor: 'pointer',
                                color: 'var(--red-default)',
                                padding: '0 4px'
                            }}
                            title="Добавить категорию"
                        >
                            +
                        </button>
                    </div>

                    {categories.length === 0 ? (
                        <p style={{color: 'var(--text-tertiary)', fontSize: 13}}>Нет категорий</p>
                    ) : (
                        <CategoryTree
                            categories={categories}
                            activeCategoryId={activeCategory?.id}
                            onSelect={handleCategorySelect}
                            onDeleteCategory={(cat) => setCategoryToDelete(cat)}
                            getCategoryTitle={getCategoryTitle}
                        />
                    )}
                </div>

                {/* Блюда */}
                <div className="dishes-panel">
                    <p style={{fontSize: 14, marginBottom: 14}}>
                        Категория: <strong style={{color: 'var(--red-default)'}}>
                        {activeCategory ? getCategoryTitle(activeCategory) : 'Не выбрана'}
                    </strong>
                    </p>

                    {itemsLoading && items.length === 0 ? (
                        <div className="empty-state">Загрузка блюд...</div>
                    ) : items.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🍽️</div>
                            <p>Нет блюд в этой категории</p>
                        </div>
                    ) : (
                        <>
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                    <tr>
                                        <th style={{width: 40}}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.length === items.length && items.length > 0}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th>Фото</th>
                                        <th>Название</th>
                                        <th>Цена</th>
                                        <th>Активно</th>
                                        <th>Рек.</th>
                                        <th>Меропр.</th>
                                        <th>Действия</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {items.map(dish => (
                                        <tr key={dish.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(dish.id)}
                                                    onChange={() => toggleSelect(dish.id)}
                                                />
                                            </td>
                                            <td>
                                                {dish.image ? (
                                                    <img src={dish.image} alt={getDishTitle(dish)}
                                                         className="dish-img-thumb"/>
                                                ) : (
                                                    <div style={{
                                                        width: 50,
                                                        height: 50,
                                                        background: '#f0f0f0',
                                                        borderRadius: 8
                                                    }}/>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{fontWeight: 500}}>{getDishTitle(dish)}</div>
                                                {dish.description_ru && (
                                                    <div style={{
                                                        fontSize: 12,
                                                        color: 'var(--text-tertiary)',
                                                        marginTop: 4
                                                    }}>
                                                        <SafeHtml html={dish.description_ru.substring(0, 100)}
                                                                  as="div"/>
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{fontFamily: 'Georgia,serif', color: 'var(--red-default)'}}>
                                                {dish.price_formatted || `${dish.price?.toLocaleString()} ₽`}
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge ${dish.is_active ? 'badge-success' : 'badge-secondary'}`}>
                                                    {dish.is_active ? 'Да' : 'Нет'}
                                                </span>
                                            </td>
                                            <td>
                                                {dish.is_featured && <span className="badge badge-gold">★</span>}
                                            </td>
                                            <td>
                                                {dish.is_available_for_events &&
                                                    <span className="badge badge-blue">📅</span>}
                                            </td>
                                            <td>
                                                <button className="icon-btn-admin" onClick={() => openEdit(dish)}>✏️
                                                </button>
                                                <button className="icon-btn-admin"
                                                        onClick={() => setConfirmDelete(dish.id)}>🗑️
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
                                        onClick={() => loadItems(meta.current_page - 1)}
                                        disabled={meta.current_page === 1}
                                    >
                                        ← Назад
                                    </button>
                                    <span style={{padding: '8px 16px', background: '#f0f0f0', borderRadius: 6}}>
                                        {meta.current_page} / {meta.last_page}
                                    </span>
                                    <button
                                        className="btn-admin btn-admin-secondary"
                                        onClick={() => loadItems(meta.current_page + 1)}
                                        disabled={meta.current_page === meta.last_page}
                                    >
                                        Вперед →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Модальное окно блюда */}
            <DishModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                editingId={editingId}
                initialForm={initialForm}
                onSave={handleSave}
                categories={flatCategories}
                loading={itemsLoading}
            />

            {/* Модальное окно добавления категории */}
            {categoryModalOpen && (
                <Modal title="Добавить категорию" onClose={() => setCategoryModalOpen(false)}>
                    <form onSubmit={handleCreateCategory}>
                        <div className="admin-form-group">
                            <label>Название (RU) *</label>
                            <input
                                type="text"
                                value={newCategoryForm.title_ru}
                                onChange={e => setNewCategoryForm({...newCategoryForm, title_ru: e.target.value})}
                                className="admin-input"
                                required
                            />
                            {categoryFormErrors.title_ru && (
                                <span style={{color: '#ef4444', fontSize: 12}}>{categoryFormErrors.title_ru[0]}</span>
                            )}
                        </div>

                        <div className="admin-form-group">
                            <label>Название (EN)</label>
                            <input
                                type="text"
                                value={newCategoryForm.title_en}
                                onChange={e => setNewCategoryForm({...newCategoryForm, title_en: e.target.value})}
                                className="admin-input"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label>Slug (URL-идентификатор)</label>
                            <input
                                type="text"
                                value={newCategoryForm.slug}
                                onChange={e => setNewCategoryForm({...newCategoryForm, slug: e.target.value})}
                                className="admin-input"
                                placeholder="оставьте пустым для автоматической генерации"
                            />
                            {categoryFormErrors.slug && (
                                <span style={{color: '#ef4444', fontSize: 12}}>{categoryFormErrors.slug[0]}</span>
                            )}
                        </div>

                        <div className="admin-form-group">
                            <label>Родительская категория</label>
                            <select
                                value={newCategoryForm.parent_id || ''}
                                onChange={e => setNewCategoryForm({
                                    ...newCategoryForm,
                                    parent_id: e.target.value ? Number(e.target.value) : null
                                })}
                                className="admin-input"
                            >
                                <option value="">— Корневая категория —</option>
                                {flatCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {'—'.repeat(cat.depth)} {cat.title_ru}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="admin-form-group">
                            <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                <input
                                    type="checkbox"
                                    checked={newCategoryForm.is_active}
                                    onChange={e => setNewCategoryForm({
                                        ...newCategoryForm,
                                        is_active: e.target.checked
                                    })}
                                />
                                Активна (отображается на сайте)
                            </label>
                        </div>

                        <div style={{display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16}}>
                            <button type="button" className="btn-admin btn-admin-secondary"
                                    onClick={() => setCategoryModalOpen(false)}>
                                Отмена
                            </button>
                            <button type="submit" className="btn-admin btn-admin-primary" disabled={creatingCategory}>
                                {creatingCategory ? 'Создание...' : 'Создать'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Подтверждение удаления категории */}
            {categoryToDelete && (
                <ConfirmDialog
                    message={`Удалить категорию "${categoryToDelete.title_ru}"${categoryToDelete.children?.length > 0 ? ' и все её подкатегории?' : '?'}`}
                    onConfirm={handleDeleteCategory}
                    onCancel={() => setCategoryToDelete(null)}
                    confirmText={deletingCategory ? 'Удаление...' : 'Удалить'}
                    cancelText="Отмена"
                />
            )}

            {/* Подтверждение удаления блюда */}
            {confirmDelete && (
                <ConfirmDialog
                    message="Удалить блюдо? Это действие нельзя отменить."
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

            {/* Блок массовых действий */}
            <BulkActions
                selectedIds={selectedIds}
                onClear={() => setSelectedIds([])}
                onUpdateStatus={handleBulkUpdateStatus}
                onUpdateFeatured={handleBulkUpdateFeatured}
            />
        </div>
    )
}