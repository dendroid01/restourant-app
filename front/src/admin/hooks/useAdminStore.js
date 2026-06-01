// hooks/useAdminStore.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../../api/client'

export function useAdminStore(resourceName, initialData = []) {
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
            const response = await api.get(`/${resourceName}?${new URLSearchParams({ ...filters, page: 1, per_page: pagination.per_page })}`)
            setItems(response.data || [])
            setPagination({
                current_page: response.data.meta?.current_page || 1,
                last_page: response.data.meta?.last_page || 1,
                per_page: response.data.meta?.per_page || 10,
                total: response.data.meta?.total || 0
            })
            hasMore.current = (response.data.meta?.current_page || 1) < (response.data.meta?.last_page || 1)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [resourceName, pagination.per_page])

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
            const response = await api.get(`/${resourceName}?${new URLSearchParams({ ...filters, page: nextPage, per_page: pagination.per_page })}`)
            setItems(prev => [...prev, ...(response.data || [])])
            setPagination({
                current_page: response.data.meta?.current_page || nextPage,
                last_page: response.data.meta?.last_page || 1,
                per_page: response.data.meta?.per_page || 10,
                total: response.data.meta?.total || 0
            })
            hasMore.current = (response.data.meta?.current_page || nextPage) < (response.data.meta?.last_page || 1)
        } catch (err) {
            setError(err.message)
        } finally {
            isLoadingMore.current = false
        }
    }, [resourceName, pagination])

    // Создание
    const create = useCallback(async (data) => {
        try {
            const response = await api.post(`/${resourceName}`, data)
            setItems(prev => [response.data, ...prev])
            return response.data
        } catch (err) {
            throw err
        }
    }, [resourceName])

    // Обновление
    const update = useCallback(async (id, data) => {
        try {
            const response = await api.put(`/${resourceName}/${id}`, data)
            setItems(prev => prev.map(item => item.id === id ? response.data : item))
            return response.data
        } catch (err) {
            throw err
        }
    }, [resourceName])

    // Удаление
    const remove = useCallback(async (id) => {
        try {
            await api.delete(`/${resourceName}/${id}`)
            setItems(prev => prev.filter(item => item.id !== id))
        } catch (err) {
            throw err
        }
    }, [resourceName])

    // Обновление порядка (для DnD)
    const reorder = useCallback(async (orders) => {
        try {
            await api.post(`/${resourceName}/reorder`, { orders })
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
    }, [resourceName])

    return {
        items,
        setItems,  // <-- ДОБАВЛЯЕМ setItems В ВОЗВРАТ
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