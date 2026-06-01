// hooks/useAdminReviews.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { adminReviews } from '../../api/admin'
import { useToast } from '../../shared/hooks/useToast'

export function useAdminReviews() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
    })
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        average_rating: 0
    })
    const [statuses, setStatuses] = useState([])
    const [ratingOptions, setRatingOptions] = useState([])

    const [filters, setFilters] = useState({
        status: 'all',
        rating: '',
        search: '',
        date_from: '',
        date_to: '',
        sort_by: 'created_at',
        sort_order: 'desc',
        per_page: 10,
        page: 1
    })

    const toast = useToast()
    // ✅ Используем ref для toast
    const toastRef = useRef(toast)

    useEffect(() => {
        toastRef.current = toast
    }, [toast])

    // ✅ Убираем toast из зависимостей
    const fetchReviews = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await adminReviews.list(filters)

            console.log('Admin API response:', response)

            // ✅ Правильная обработка response
            setReviews(response.data || [])
            setMeta(response.meta || {
                current_page: 1,
                last_page: 1,
                per_page: 10,
                total: 0
            })
            setStats(response.stats || {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
                average_rating: 0
            })
            setStatuses(response.statuses || [])
            setRatingOptions(response.rating_options || [])
        } catch (err) {
            setError(err.message)
            toastRef.current.error('Ошибка загрузки отзывов')
        } finally {
            setLoading(false)
        }
    }, [filters]) // ✅ filters в зависимостях, но без toast

    const fetchStats = useCallback(async () => {
        try {
            const response = await adminReviews.getStats()
            setStats(response.data || response)
        } catch (err) {
            console.error('Stats error:', err)
        }
    }, [])

    useEffect(() => {
        fetchReviews()
    }, [fetchReviews]) // ✅ fetchReviews стабилен, т.к. не зависит от toast

    const updateStatus = useCallback(async (id, newStatus, actionFn) => {
        const currentReview = reviews.find(r => r.id === id)
        if (!currentReview) return false

        setReviews(prev => prev.map(review =>
            review.id === id ? { ...review, status: newStatus } : review
        ))

        try {
            await actionFn(id)
            toastRef.current.success(`Отзыв ${newStatus === 'approved' ? 'одобрен' : 'отклонён'}`)
            await fetchStats()
            return true
        } catch (err) {
            setReviews(prev => prev.map(review =>
                review.id === id ? currentReview : review
            ))
            toastRef.current.error('Ошибка при обновлении статуса')
            return false
        }
    }, [reviews, fetchStats]) // ✅ убрали toast

    const approve = useCallback((id) => {
        return updateStatus(id, 'approved', adminReviews.approve)
    }, [updateStatus])

    const reject = useCallback((id) => {
        return updateStatus(id, 'rejected', adminReviews.reject)
    }, [updateStatus])

    const deleteReview = useCallback(async (id) => {
        const currentReview = reviews.find(r => r.id === id)
        if (!currentReview) return false

        setReviews(prev => prev.filter(review => review.id !== id))

        try {
            await adminReviews.delete(id)
            toastRef.current.success('Отзыв удалён')
            await fetchStats()
            await fetchReviews()
            return true
        } catch (err) {
            setReviews(prev => [...prev, currentReview].sort((a, b) => a.id - b.id))
            toastRef.current.error('Ошибка при удалении')
            return false
        }
    }, [reviews, fetchStats, fetchReviews])

    const changePage = useCallback((page) => {
        setFilters(prev => ({ ...prev, page }))
    }, [])

    const changeFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
    }, [])

    return {
        reviews,
        loading,
        error,
        meta,
        stats,
        statuses,
        ratingOptions,
        filters,
        approve,
        reject,
        deleteReview,
        changePage,
        changeFilters,
        refetch: fetchReviews
    }
}