// hooks/useAdminStore.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../../api/client'

// Маппинг resourceName на правильные URL
const resourceMap = {
    restaurants: '/admin/restaurants',
    news: '/admin/news',
    'menu/categories': '/admin/menu/categories',
    'menu/items': '/admin/menu/items',
    orders: '/admin/orders',
    reviews: '/admin/reviews',
    managers: '/admin/managers',
}

export function useAdminStore(resourceName, initialData = []) {
    // Получаем правильный базовый URL
    const baseUrl = resourceMap[resourceName] || `/${resourceName}`

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
    })

    const isLoadingMore = useRef(false)
    const hasMore = useRef(true)

    // Загрузка первой страницы
    const loadFirst = useCallback(async (filters = {}) => {
        setLoading(true)
        setError(null)
        try {
            const response = await api.get(`${baseUrl}?${new URLSearchParams({ ...filters, page: 1, per_page: pagination.per_page })}`)
            const data = response.data || response
            setItems(Array.isArray(data) ? data : (data.data || []))
            setPagination({
                current_page: data.meta?.current_page || 1,
                last_page: data.meta?.last_page || 1,
                per_page: data.meta?.per_page || 10,
                total: data.meta?.total || 0
            })
            hasMore.current = (data.meta?.current_page || 1) < (data.meta?.last_page || 1)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [baseUrl, pagination.per_page])

    // Загрузка следующей страницы
    const loadMore = useCallback(async (filters = {}) => {
        if (isLoadingMore.current || !hasMore.current) return

        const nextPage = pagination.current_page + 1
        if (nextPage > pagination.last_page) {
            hasMore.current = false
            return
        }

        isLoadingMore.current = true
        try {
            const response = await api.get(`${baseUrl}?${new URLSearchParams({ ...filters, page: nextPage, per_page: pagination.per_page })}`)
            const data = response.data || response
            const newItems = Array.isArray(data) ? data : (data.data || [])
            setItems(prev => [...prev, ...newItems])
            setPagination({
                current_page: data.meta?.current_page || nextPage,
                last_page: data.meta?.last_page || 1,
                per_page: data.meta?.per_page || 10,
                total: data.meta?.total || 0
            })
            hasMore.current = (data.meta?.current_page || nextPage) < (data.meta?.last_page || 1)
        } catch (err) {
            setError(err.message)
        } finally {
            isLoadingMore.current = false
        }
    }, [baseUrl, pagination])

    // Создание
    const create = useCallback(async (data) => {
        try {
            const response = await api.post(baseUrl, data)
            const newItem = response.data || response
            setItems(prev => [newItem, ...prev])
            return newItem
        } catch (err) {
            throw err
        }
    }, [baseUrl])

    // Обновление
    const update = useCallback(async (id, data) => {
        try {
            const response = await api.put(`${baseUrl}/${id}`, data)
            const updatedItem = response.data || response
            setItems(prev => prev.map(item => item.id === id ? updatedItem : item))
            return updatedItem
        } catch (err) {
            throw err
        }
    }, [baseUrl])

    // Удаление
    const remove = useCallback(async (id) => {
        try {
            await api.delete(`${baseUrl}/${id}`)
            setItems(prev => prev.filter(item => item.id !== id))
        } catch (err) {
            throw err
        }
    }, [baseUrl])

    // Обновление порядка (для DnD)
    const reorder = useCallback(async (orders) => {
        try {
            await api.post(`${baseUrl}/reorder`, { orders })
            // Обновляем локальный порядок
            setItems(prev => {
                const updated = [...prev]
                orders.forEach(({ id, order }) => {
                    const index = updated.findIndex(item => item.id === id)
                    if (index !== -1) {
                        updated[index] = { ...updated[index], order }
                    }
                })
                return updated.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            })
        } catch (err) {
            throw err
        }
    }, [baseUrl])

    return {
        items,
        setItems,
        loading,
        error,
        pagination,
        hasMore: hasMore.current,
        loadFirst,
        loadMore,
        create,
        update,
        remove,
        reorder
    }
}