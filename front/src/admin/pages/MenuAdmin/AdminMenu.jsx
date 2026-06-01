import { useState, useMemo, useEffect } from 'react'
import { useMenuCategories } from '../../hooks/useMenuCategories'
import { adminMenuCategories } from '../../../api/admin'
import Modal from '../../components/Modal/Modal'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import RichTextEditor from '../../../shared/components/RichTextEditor/RichTextEditor'
import { useToast } from '../../../shared/hooks/useToast'
import menuData from '../../../data/menu.json'
import SafeHtml from '../../../shared/components/SafeHtml/SafeHtml'

// Мок блюд (пока без бэка)
const flattenMenu = data =>
    Object.entries(data.items).flatMap(([cat, dishes]) =>
        dishes.map(d => ({ ...d, category_slug: cat }))
    )

const EMPTY_DISH = {
    title_ru: '', title_en: '',
    description_ru: '', description_en: '',
    price: '',
    category_slug: '',
    featured: false,
    image: 'https://picsum.photos/100/100?random=' + Math.floor(Math.random() * 100),
}

// Компонент для отображения дерева категорий с кнопкой удаления
// Кнопка видна: если категория выбрана ИЛИ при наведении
function CategoryTree({ categories, activeCategoryId, onSelect, onDeleteCategory, level = 0 }) {
    const [hoveredId, setHoveredId] = useState(null)

    if (!categories || categories.length === 0) return null

    return (
        <div style={{ marginLeft: level * 16 }}>
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
                                style={{ flex: 1 }}
                                onClick={() => onSelect(cat)}
                            >
                                <span style={{ fontWeight: isActive ? 600 : 400 }}>
                                    {cat.title_ru}
                                </span>
                                {cat.is_active === false && (
                                    <span style={{ marginLeft: 8, fontSize: 11, color: '#999' }}>(скрыта)</span>
                                )}
                            </div>
                            {/* Кнопка удаления видна: если выбрана ИЛИ наведена */}
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
                                level={level + 1}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default function AdminMenu() {
    const { categories, loading: categoriesLoading, error: categoriesError, getFlatCategories, refetch } = useMenuCategories()
    const toast = useToast()

    // Мок для блюд (пока храним в состоянии)
    const [items, setItems] = useState(() => flattenMenu(menuData))
    const [activeCategory, setActiveCategory] = useState(null)
    const [modal, setModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY_DISH)
    const [confirm, setConfirm] = useState(null)
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

    // Получаем плоский список категорий для селекта
    useEffect(() => {
        if (categories.length > 0) {
            setFlatCategories(getFlatCategories())
        }
    }, [categories, getFlatCategories])

    // Фильтруем блюда по slug выбранной категории
    const filteredItems = useMemo(() => {
        if (!activeCategory) return items
        return items.filter(item => item.category_slug === activeCategory.slug)
    }, [items, activeCategory])

    // При загрузке категорий выбираем первую корневую категорию по умолчанию
    useEffect(() => {
        if (!categoriesLoading && categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0])
        }
    }, [categoriesLoading, categories, activeCategory])

    const openCreate = () => {
        setForm({
            ...EMPTY_DISH,
            category_slug: activeCategory?.slug || '',
            image: `https://picsum.photos/100/100?random=${Date.now()}`
        })
        setEditing(null)
        setModal(true)
    }

    const openEdit = item => {
        setForm({ ...EMPTY_DISH, ...item })
        setEditing(item.id)
        setModal(true)
    }

    const handleSave = e => {
        e.preventDefault()
        const data = { ...form, price: Number(form.price) }
        if (editing) {
            setItems(prev => prev.map(item => item.id === editing ? { ...data, id: editing } : item))
            toast.success('Блюдо обновлено')
        } else {
            const newId = Math.max(...items.map(i => i.id), 0) + 1
            setItems(prev => [...prev, { ...data, id: newId }])
            toast.success('Блюдо добавлено')
        }
        setModal(false)
    }

    const handleRemove = (id) => {
        setItems(prev => prev.filter(item => item.id !== id))
        setConfirm(null)
        toast.success('Блюдо удалено')
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
            await refetch()

            if (response && response.data) {
                setActiveCategory(response.data)
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
            }

            setCategoryToDelete(null)
            await refetch()
        } catch (err) {
            console.error('Delete category error:', err)
            toast.error(err.message || 'Ошибка удаления категории')
        } finally {
            setDeletingCategory(false)
        }
    }

    const f = field => ({
        value: form[field] ?? '',
        onChange: e => setForm(p => ({ ...p, [field]: e.target.value })),
        className: 'admin-input',
    })

    if (categoriesLoading) {
        return <div className="admin-loading">Загрузка категорий...</div>
    }

    if (categoriesError) {
        return <div className="admin-error">Ошибка: {categoriesError}</div>
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button className="btn-admin btn-admin-primary" onClick={openCreate} disabled={!activeCategory}>
                    + Добавить блюдо
                </button>
            </div>

            <div className="menu-admin-layout">
                {/* Категории - дерево из API */}
                <div className="categories-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
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
                        <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Нет категорий</p>
                    ) : (
                        <CategoryTree
                            categories={categories}
                            activeCategoryId={activeCategory?.id}
                            onSelect={setActiveCategory}
                            onDeleteCategory={(cat) => setCategoryToDelete(cat)}
                        />
                    )}
                </div>

                {/* Блюда */}
                <div className="dishes-panel">
                    <p style={{ fontSize: 14, marginBottom: 14 }}>
                        Категория: <strong style={{ color: 'var(--red-default)' }}>
                        {activeCategory?.title_ru || 'Не выбрана'}
                    </strong>
                    </p>

                    {filteredItems.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🍽️</div>
                            <p>Нет блюд в этой категории</p>
                        </div>
                    ) : (
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                <tr>
                                    <th>Фото</th>
                                    <th>Название</th>
                                    <th>Цена</th>
                                    <th>Рек.</th>
                                    <th>Действия</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredItems.map(dish => (
                                    <tr key={dish.id}>
                                        <td><img src={dish.image} alt={dish.title_ru} className="dish-img-thumb" /></td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{dish.title_ru}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                                                <SafeHtml html={dish.description_ru} as="div" />
                                            </div>
                                        </td>
                                        <td style={{ fontFamily: 'Georgia,serif', color: 'var(--red-default)' }}>
                                            {dish.price?.toLocaleString()} ₽
                                        </td>
                                        <td>{dish.featured && <span className="badge badge-gold">★ Рек.</span>}</td>
                                        <td>
                                            <button className="icon-btn-admin" onClick={() => openEdit(dish)}>✏️</button>
                                            <button className="icon-btn-admin" onClick={() => setConfirm(dish.id)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Модальное окно добавления блюда */}
            {modal && (
                <Modal title={editing ? 'Редактировать блюдо' : 'Новое блюдо'} onClose={() => setModal(false)}>
                    {/* ... содержимое модалки блюда остаётся без изменений ... */}
                </Modal>
            )}

            {/* Модальное окно добавления категории */}
            {categoryModalOpen && (
                <Modal title="Добавить категорию" onClose={() => setCategoryModalOpen(false)}>
                    <form onSubmit={handleCreateCategory}>
                        <div className="admin-form-group">
                            <label>Название (RU) *</label>
                            <input
                                type="text"
                                value={newCategoryForm.title_ru}
                                onChange={e => setNewCategoryForm({ ...newCategoryForm, title_ru: e.target.value })}
                                className="admin-input"
                                required
                            />
                            {categoryFormErrors.title_ru && (
                                <span style={{ color: '#ef4444', fontSize: 12 }}>{categoryFormErrors.title_ru[0]}</span>
                            )}
                        </div>

                        <div className="admin-form-group">
                            <label>Название (EN)</label>
                            <input
                                type="text"
                                value={newCategoryForm.title_en}
                                onChange={e => setNewCategoryForm({ ...newCategoryForm, title_en: e.target.value })}
                                className="admin-input"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label>Slug (URL-идентификатор)</label>
                            <input
                                type="text"
                                value={newCategoryForm.slug}
                                onChange={e => setNewCategoryForm({ ...newCategoryForm, slug: e.target.value })}
                                className="admin-input"
                                placeholder="оставьте пустым для автоматической генерации"
                            />
                            {categoryFormErrors.slug && (
                                <span style={{ color: '#ef4444', fontSize: 12 }}>{categoryFormErrors.slug[0]}</span>
                            )}
                        </div>

                        <div className="admin-form-group">
                            <label>Родительская категория</label>
                            <select
                                value={newCategoryForm.parent_id || ''}
                                onChange={e => setNewCategoryForm({ ...newCategoryForm, parent_id: e.target.value ? Number(e.target.value) : null })}
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
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input
                                    type="checkbox"
                                    checked={newCategoryForm.is_active}
                                    onChange={e => setNewCategoryForm({ ...newCategoryForm, is_active: e.target.checked })}
                                />
                                Активна (отображается на сайте)
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                            <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setCategoryModalOpen(false)}>
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
            {confirm && (
                <ConfirmDialog
                    message="Удалить блюдо?"
                    onConfirm={() => handleRemove(confirm)}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </div>
    )
}