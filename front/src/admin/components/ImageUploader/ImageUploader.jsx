// src/admin/components/ImageUploader/ImageUploader.jsx
import { useState, useRef, useCallback } from 'react'
import { adminUpload } from '../../../api/admin'
import { useToast } from '../../../shared/hooks/useToast'

/**
 * Компонент для загрузки изображений
 * @param {string} value - текущий URL изображения
 * @param {function} onChange - колбэк при изменении (принимает URL)
 * @param {string} directory - директория для загрузки
 * @param {boolean} disabled - отключен ли компонент
 * @param {number} maxSizeMB - максимальный размер в МБ
 * @param {string} placeholder - текст-заглушка
 */
export default function ImageUploader({
                                          value,
                                          onChange,
                                          directory = 'images',
                                          disabled = false,
                                          maxSizeMB = 5,
                                          placeholder = 'Нажмите или перетащите изображение'
                                      }) {
    const [uploading, setUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [previewUrl, setPreviewUrl] = useState(value || '')
    const fileInputRef = useRef(null)
    const toast = useToast()

    // Обновляем preview при изменении value извне
    useState(() => {
        setPreviewUrl(value || '')
    }, [value])

    const handleFile = async (file) => {
        if (!file) return

        // Проверка типа
        if (!file.type.startsWith('image/')) {
            toast.error('Можно загружать только изображения')
            return
        }

        // Проверка размера
        const maxSize = maxSizeMB * 1024 * 1024
        if (file.size > maxSize) {
            toast.error(`Максимальный размер файла: ${maxSizeMB}MB`)
            return
        }

        setUploading(true)
        try {
            const result = await adminUpload.upload(file, 'image', directory)
            if (result.success && result.url) {
                setPreviewUrl(result.url)
                onChange(result.url)
                toast.success('Изображение загружено')
            } else {
                throw new Error(result.message || 'Ошибка загрузки')
            }
        } catch (err) {
            console.error('Upload error:', err)
            toast.error(err.message || 'Ошибка загрузки изображения')
        } finally {
            setUploading(false)
        }
    }

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
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

        const file = e.dataTransfer.files?.[0]
        if (file) handleFile(file)
    }

    const handleRemove = async () => {
        if (previewUrl && !disabled) {
            // Пробуем удалить файл с сервера
            try {
                await adminUpload.delete(previewUrl)
            } catch (err) {
                console.warn('Failed to delete file from server:', err)
            }
            setPreviewUrl('')
            onChange('')
            toast.success('Изображение удалено')
        }
    }

    const openFileDialog = () => {
        if (!disabled && !uploading) {
            fileInputRef.current?.click()
        }
    }

    return (
        <div style={{ width: '100%' }}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={disabled || uploading}
            />

            {previewUrl ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                        src={previewUrl}
                        alt="Preview"
                        style={{
                            maxWidth: '100%',
                            maxHeight: 200,
                            borderRadius: 8,
                            objectFit: 'cover',
                            border: '1px solid #e0e0e0'
                        }}
                    />
                    {!disabled && (
                        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8 }}>
                            <button
                                type="button"
                                onClick={openFileDialog}
                                disabled={uploading}
                                style={{
                                    background: 'rgba(0,0,0,0.6)',
                                    border: 'none',
                                    borderRadius: 4,
                                    color: 'white',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    fontSize: 12
                                }}
                            >
                                {uploading ? '⏳' : '🔄'}
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                disabled={uploading}
                                style={{
                                    background: 'rgba(220,38,38,0.9)',
                                    border: 'none',
                                    borderRadius: 4,
                                    color: 'white',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    fontSize: 12
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    onClick={openFileDialog}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                        border: `2px dashed ${dragActive ? '#dc2626' : '#ccc'}`,
                        borderRadius: 8,
                        padding: '40px 20px',
                        textAlign: 'center',
                        cursor: disabled || uploading ? 'default' : 'pointer',
                        backgroundColor: dragActive ? 'rgba(220,38,38,0.05)' : '#fafafa',
                        transition: 'all 0.2s',
                        opacity: disabled ? 0.5 : 1
                    }}
                >
                    {uploading ? (
                        <div>
                            <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                            <div style={{ fontSize: 14, color: '#666' }}>Загрузка...</div>
                        </div>
                    ) : (
                        <>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                            <div style={{ fontSize: 14, color: '#666' }}>{placeholder}</div>
                            <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                                JPEG, PNG, WebP, GIF до {maxSizeMB}MB
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}