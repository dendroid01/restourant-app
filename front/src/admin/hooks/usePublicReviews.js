// src/admin/hooks/usePublicReviews.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { publicReviews } from '../../api/admin'
import { useToast } from '../../shared/hooks/useToast'

export function usePublicReviews() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [averageRating, setAverageRating] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const toast = useToast()

    // Храним toast в ref, чтобы не включать в зависимости
    const toastRef = useRef(toast)

    useEffect(() => {
        toastRef.current = toast
    }, [toast])

    const isMounted = useRef(true)
    const fetchInProgress = useRef(false)

    // Убираем toast из зависимостей
    const fetchReviews = useCallback(async () => {
        if (fetchInProgress.current) return

        fetchInProgress.current = true
        setLoading(true)

        try {
            const response = await publicReviews.list()

            if (isMounted.current) {
                const reviewsData = response.data || response
                setReviews(Array.isArray(reviewsData) ? reviewsData : [])
                setAverageRating(response.meta?.average_rating || 0)
            }
        } catch (err) {
            console.error('Error fetching reviews:', err)
            if (isMounted.current && err.status !== 401) {
                toastRef.current.error('Ошибка загрузки отзывов')
            }
        } finally {
            if (isMounted.current) {
                setLoading(false)
            }
            fetchInProgress.current = false
        }
    }, []) // ← ПУСТОЙ МАССИВ! Функция никогда не пересоздается

    const submitReview = useCallback(async (formData) => {
        setSubmitting(true)
        try {
            const response = await publicReviews.create({
                name: formData.name,
                email: formData.email || null,
                rating: parseInt(formData.rating),
                text_ru: formData.text
            })

            toastRef.current.success(response.message || response.data?.message || 'Спасибо за отзыв! Он будет опубликован после модерации.')
            await fetchReviews()
            return { success: true, data: response }
        } catch (err) {
            const errorMessage = err.body?.message || err.body?.error || err.message || 'Ошибка при отправке отзыва'
            toastRef.current.error(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setSubmitting(false)
        }
    }, [fetchReviews]) // ← только fetchReviews, который стабилен

    useEffect(() => {
        isMounted.current = true
        fetchReviews()

        return () => {
            isMounted.current = false
        }
    }, [fetchReviews]) // ← fetchReviews стабилен, эффект сработает 1 раз

    return {
        reviews,
        loading,
        averageRating,
        submitting,
        submitReview,
        refetch: fetchReviews
    }
}