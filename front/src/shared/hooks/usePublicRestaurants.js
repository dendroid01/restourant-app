import { useState, useEffect, useCallback } from 'react'
import { publicRestaurants } from '../../api/public'

export const usePublicRestaurants = () => {
    const [restaurants, setRestaurants] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchRestaurants = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await publicRestaurants.getAll()
            // API возвращает { success: true, data: [...], count: number }
            if (response.success) {
                setRestaurants(response.data)
            } else {
                setRestaurants([])
            }
        } catch (err) {
            console.error('Failed to fetch restaurants:', err)
            setError(err.message || 'Ошибка загрузки ресторанов')
            setRestaurants([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchRestaurants()
    }, [fetchRestaurants])

    return { restaurants, loading, error, refetch: fetchRestaurants }
}