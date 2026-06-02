import { useState, useEffect } from 'react'
import './RestaurantGallery.css'

export default function RestaurantGallery({ images, restaurantName }) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)

    if (!images || images.length === 0) {
        return (
            <div className="restaurant-gallery-empty">
                <div className="empty-gallery-placeholder">
                    <i className="fas fa-image"></i>
                    <p>Нет фотографий</p>
                </div>
            </div>
        )
    }

    const openModal = (index = 0) => {
        setSelectedImageIndex(index)
        setIsModalOpen(true)
        document.body.style.overflow = 'hidden'
    }

    const closeModal = () => {
        setIsModalOpen(false)
        document.body.style.overflow = ''
    }

    const nextImage = (e) => {
        e?.stopPropagation()
        setSelectedImageIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = (e) => {
        e?.stopPropagation()
        setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isModalOpen) return
            if (e.key === 'ArrowLeft') prevImage()
            if (e.key === 'ArrowRight') nextImage()
            if (e.key === 'Escape') closeModal()
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isModalOpen])

    return (
        <>
            <div className="restaurant-gallery">
                <div className="gallery-main" onClick={() => openModal(0)}>
                    <img src={images[0]} alt={restaurantName} loading="lazy" />
                    {images.length > 1 && (
                        <div className="gallery-badge">
                            <i className="fas fa-images"></i> {images.length} фото
                        </div>
                    )}
                    <div className="gallery-overlay">
                        <i className="fas fa-search-plus"></i>
                        <span>Нажмите для просмотра</span>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="gallery-modal" onClick={closeModal}>
                    <div className="gallery-modal-content" onClick={e => e.stopPropagation()}>
                        {/* Крестик на картинке сверху справа */}
                        <button className="gallery-modal-close" onClick={closeModal}>
                            <i className="fas fa-times"></i>
                        </button>

                        {images.length > 1 && (
                            <>
                                <button className="gallery-modal-nav prev" onClick={prevImage}>
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <button className="gallery-modal-nav next" onClick={nextImage}>
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </>
                        )}

                        <img
                            src={images[selectedImageIndex]}
                            alt={`${restaurantName} ${selectedImageIndex + 1}`}
                            className="gallery-modal-image"
                        />

                        {images.length > 1 && (
                            <div className="gallery-modal-counter">
                                {selectedImageIndex + 1} / {images.length}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}