// src/admin/components/MultiImageUploader/MultiImageUploader.jsx
import { useState, useRef, useCallback } from 'react'
import { adminUpload } from '../../../api/admin'
import { useToast } from '../../../shared/hooks/useToast'

/**
 * Компонент для загрузки нескольких изображений (галерея) с drag-and-drop сортировкой
 * @param {Array} value - массив объектов галереи [{image_url: string, order: number}]
 * @param {function} onChange - колбэк при изменении (принимает новый массив)
 * @param {string} directory - директория для загрузки
 * @param {boolean} disabled - отключен ли компонент
 * @param {number} maxSizeMB - максимальный размер в МБ
 * @param {number} maxFiles - максимальное количество файлов
 */
export default function MultiImageUploader({
                                               value = [],
                                               onChange,
                                               directory = 'restaurants',
                                               disabled = false,
                                               maxSizeMB = 5,
                                               maxFiles = 20
                                           }) {
    const [uploading, setUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [draggedIndex, setDraggedIndex] = useState(null)
    const fileInputRef = useRef(null)
    const toast = useToast()

    const handleFiles = async (files) => {
        if (!files || files.length === 0) return

        const fileArray = Array.from(files)

        // Проверка количества
        if (value.length + fileArray.length > maxFiles) {
            toast.error(`Максимум ${maxFiles} изображений`)
            return
        }

        // Проверка типов и размеров
        for (const file of fileArray) {
            if (!file.type.startsWith('image/')) {
                toast.error(`Файл "${file.name}" не является изображением`)
                return
            }
            const maxSize = maxSizeMB * 1024 * 1024
            if (file.size > maxSize) {
                toast.error(`Файл "${file.name}" превышает ${maxSizeMB}MB`)
                return
            }
        }

        setUploading(true)
        try {
            const result = await adminUpload.uploadMultiple(fileArray, directory)

            if (result.items && result.items.length > 0) {
                const newImages = result.items
                    .filter(item => item.success)
                    .map((item, idx) => ({
                        image_url: item.url,
                        order: value.length + idx
                    }))

                const updatedValue = [...value, ...newImages]
                onChange(updatedValue)
                toast.success(`Загружено ${newImages.length} изображений`)
            } else {
                throw new Error('Ошибка загрузки')
            }
        } catch (err) {
            console.error('Upload error:', err)
            toast.error(err.message || 'Ошибка загрузки изображений')
        } finally {
            setUploading(false)
        }
    }

    const handleFileSelect = (e) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFiles(files)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!disabled && !uploading) setDragActive(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (disabled || uploading) return

        const files = e.dataTransfer.files
        if (files && files.length > 0) {
            handleFiles(files)
        }
    }

    const handleRemove = (index) => {
        const newValue = [...value]
        const removed = newValue.splice(index, 1)[0]

        // Обновляем порядок
        const updated = newValue.map((img, idx) => ({
            ...img,
            order: idx
        }))

        onChange(updated)
        toast.success('Изображение удалено')

        // Пробуем удалить файл с сервера
        if (removed.image_url) {
            adminUpload.delete(removed.image_url).catch(console.warn)
        }
    }

    const handleDragStart = (e, index) => {
        setDraggedIndex(index)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', index.toString())
    }

    const handleDragOverItem = (e, index) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === index) return

        const newValue = [...value]
        const [dragged] = newValue.splice(draggedIndex, 1)
        newValue.splice(index, 0, dragged)

        // Обновляем порядок
        const updated = newValue.map((img, idx) => ({
            ...img,
            order: idx
        }))

        onChange(updated)
        setDraggedIndex(index)
    }

    const handleDragEnd = () => {
        setDraggedIndex(null)
    }

    const updateImageUrl = (index, newUrl) => {
        const newValue = [...value]
        newValue[index] = { ...newValue[index], image_url: newUrl }
        onChange(newValue)
    }

    return (
        <div style={{ width: '100%' }}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={disabled || uploading}
            />

            {/* Зона загрузки */}
            <div
                onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    border: `2px dashed ${dragActive ? '#dc2626' : '#ccc'}`,
                    borderRadius: 8,
                    padding: '30px 20px',
                    textAlign: 'center',
                    cursor: disabled || uploading ? 'default' : 'pointer',
                    backgroundColor: dragActive ? 'rgba(220,38,38,0.05)' : '#fafafa',
                    transition: 'all 0.2s',
                    marginBottom: 16
                }}
            >
                {uploading ? (
                    <div>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                        <div style={{ fontSize: 14, color: '#666' }}>Загрузка...</div>
                    </div>
                ) : (
                    <>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                        <div style={{ fontSize: 14, color: '#666' }}>
                            Нажмите или перетащите изображения
                        </div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                            JPEG, PNG, WebP, GIF до {maxSizeMB}MB, максимум {maxFiles} шт.
                        </div>
                    </>
                )}
            </div>

            {/* Список изображений */}
            {value.length > 0 && (
                <div>
                    <p style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                        💡 Перетаскивайте изображения для изменения порядка ({value.length} / {maxFiles})
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
                        {value.map((img, idx) => (
                            <div
                                key={idx}
                                draggable={!disabled}
                                onDragStart={(e) => handleDragStart(e, idx)}
                                onDragOver={(e) => handleDragOverItem(e, idx)}
                                onDragEnd={handleDragEnd}
                                style={{
                                    border: `2px solid ${idx === 0 ? '#dc2626' : draggedIndex === idx ? '#dc2626' : '#e0e0e0'}`,
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    position: 'relative',
                                    cursor: disabled ? 'default' : 'grab',
                                    opacity: draggedIndex === idx ? 0.5 : 1,
                                    transition: 'all 0.2s',
                                    background: '#fff'
                                }}
                            >
                                {idx === 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 4,
                                        left: 4,
                                        background: '#dc2626',
                                        color: 'white',
                                        fontSize: 10,
                                        padding: '2px 6px',
                                        borderRadius: 4,
                                        zIndex: 1
                                    }}>
                                        Главное
                                    </div>
                                )}
                                <div style={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    display: 'flex',
                                    gap: 4,
                                    zIndex: 1
                                }}>
                                    {!disabled && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(idx)}
                                            style={{
                                                background: 'rgba(220,38,38,0.9)',
                                                border: 'none',
                                                borderRadius: 4,
                                                color: 'white',
                                                cursor: 'pointer',
                                                padding: '4px 6px',
                                                fontSize: 10
                                            }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                <img
                                    src={img.image_url}
                                    alt={`gallery-${idx}`}
                                    style={{ width: '100%', height: 100, objectFit: 'cover' }}
                                    draggable={false}
                                />
                                <div style={{ padding: 6 }}>
                                    <input
                                        type="text"
                                        value={img.image_url}
                                        onChange={(e) => updateImageUrl(idx, e.target.value)}
                                        disabled={disabled}
                                        style={{
                                            fontSize: 10,
                                            width: '100%',
                                            padding: '4px',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: 4
                                        }}
                                        placeholder="URL"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}