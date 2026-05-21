import { useState } from 'react'
import { useAdminStore } from '../../hooks/useAdminStore'
import Modal from '../../components/Modal/Modal'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import RichTextEditor from '../../../shared/components/RichTextEditor/RichTextEditor'
import { useToast } from '../../../shared/hooks/useToast'
import menuData from '../../../data/menu.json'

const ALL_CATEGORIES = [
    { id: 'breakfast', label: '🥐 Завтраки' },
    { id: 'salads',    label: '🥗 Салаты' },
    { id: 'hot',       label: '🔥 Горячие блюда' },
    { id: 'desserts',  label: '🍰 Десерты' },
    { id: 'wine',      label: '🍷 Винная карта' },
]

const flattenMenu = data =>
    Object.entries(data.items).flatMap(([cat, dishes]) =>
        dishes.map(d => ({ ...d, category: cat }))
    )

const EMPTY_DISH = {
    title_ru: '', title_en: '',
    description_ru: '', description_en: '',
    price: '',
    category: 'hot',
    featured: false,
    image: 'https://picsum.photos/100/100?random=' + Math.floor(Math.random() * 100),
}

export default function AdminMenu() {
    const { items, create, update, remove } = useAdminStore('admin_menu', flattenMenu(menuData))
    const toast = useToast()
    const [activeCategory, setActiveCategory] = useState('hot')
    const [modal, setModal]   = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm]     = useState(EMPTY_DISH)
    const [confirm, setConfirm] = useState(null)

    const filtered = items.filter(d => d.category === activeCategory)

    const openCreate = () => { setForm({ ...EMPTY_DISH, category: activeCategory }); setEditing(null); setModal(true) }
    const openEdit   = item => { setForm({ ...EMPTY_DISH, ...item }); setEditing(item.id); setModal(true) }

    const handleSave = e => {
        e.preventDefault()
        const data = { ...form, price: Number(form.price) }
        if (editing) {
            update(editing, data)
            toast.success('Блюдо обновлено')
        } else {
            create(data)
            toast.success('Блюдо добавлено')
        }
        setModal(false)
    }

    const handleRemove = (id) => {
        remove(id)
        setConfirm(null)
        toast.success('Блюдо удалено')
    }

    const f = field => ({
        value: form[field] ?? '',
        onChange: e => setForm(p => ({ ...p, [field]: e.target.value })),
        className: 'admin-input',
    })

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button className="btn-admin btn-admin-primary" onClick={openCreate}>+ Добавить блюдо</button>
            </div>

            <div className="menu-admin-layout">
                {/* Категории */}
                <div className="categories-panel">
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>Категории</p>
                    {ALL_CATEGORIES.map(cat => (
                        <div
                            key={cat.id}
                            className={`cat-item${activeCategory === cat.id ? ' active' : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            <span>{cat.label}</span>
                            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                                {items.filter(d => d.category === cat.id).length}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Блюда */}
                <div className="dishes-panel">
                    <p style={{ fontSize: 14, marginBottom: 14 }}>
                        Категория: <strong style={{ color: 'var(--red-default)' }}>
                        {ALL_CATEGORIES.find(c => c.id === activeCategory)?.label}
                    </strong>
                    </p>

                    {filtered.length === 0 ? (
                        <div className="empty-state"><div className="empty-state-icon">🍽️</div><p>Нет блюд в этой категории</p></div>
                    ) : (
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead><tr><th>Фото</th><th>Название</th><th>Цена</th><th>Рек.</th><th>Действия</th></tr></thead>
                                <tbody>
                                {filtered.map(dish => (
                                    <tr key={dish.id}>
                                        <td><img src={dish.image} alt={dish.title_ru} className="dish-img-thumb" /></td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{dish.title_ru}</div>
                                            {/* Показываем plain-текст описания в таблице */}
                                            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}
                                                 dangerouslySetInnerHTML={{ __html: dish.description_ru }} />
                                        </td>
                                        <td style={{ fontFamily: 'Georgia,serif', color: 'var(--red-default)' }}>{dish.price?.toLocaleString()} ₽</td>
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

            {modal && (
                <Modal title={editing ? 'Редактировать блюдо' : 'Новое блюдо'} onClose={() => setModal(false)}>
                    <form onSubmit={handleSave}>
                        <div className="admin-form-row-2">
                            <div className="admin-form-group"><label>Название (RU) *</label><input {...f('title_ru')} required /></div>
                            <div className="admin-form-group"><label>Название (EN)</label><input {...f('title_en')} /></div>
                        </div>

                        {/* Описание RU */}
                        <div className="admin-form-group">
                            <label>Описание (RU)</label>
                            <RichTextEditor
                                value={form.description_ru}
                                onChange={val => setForm(p => ({ ...p, description_ru: val }))}
                                placeholder="Описание блюда (RU)..."
                                adminStyle
                                minHeight={100}
                            />
                        </div>

                        {/* Описание EN */}
                        <div className="admin-form-group">
                            <label>Описание (EN)</label>
                            <RichTextEditor
                                value={form.description_en}
                                onChange={val => setForm(p => ({ ...p, description_en: val }))}
                                placeholder="Dish description (EN)..."
                                adminStyle
                                minHeight={100}
                            />
                        </div>

                        <div className="admin-form-row-2">
                            <div className="admin-form-group"><label>Цена (₽) *</label><input {...f('price')} type="number" min="0" required /></div>
                            <div className="admin-form-group"><label>Категория</label>
                                <select {...f('category')} className="admin-input">
                                    {ALL_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="admin-form-group"><label>URL картинки</label><input {...f('image')} /></div>
                        <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input type="checkbox" id="featured" checked={!!form.featured}
                                   onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} />
                            <label htmlFor="featured" style={{ marginBottom: 0, cursor: 'pointer' }}>⭐ Рекомендуемое блюдо</label>
                        </div>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                            <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setModal(false)}>Отмена</button>
                            <button type="submit" className="btn-admin btn-admin-primary">Сохранить</button>
                        </div>
                    </form>
                </Modal>
            )}

            {confirm && (
                <ConfirmDialog message="Удалить блюдо?" onConfirm={() => handleRemove(confirm)} onCancel={() => setConfirm(null)} />
            )}
        </div>
    )
}