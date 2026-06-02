// src/hooks/usePublicMenu.js
import { useState, useEffect, useCallback } from 'react'
import { publicMenu } from '../../api/public'

export function usePublicMenu() {
    const [categories, setCategories] = useState([])
    const [featuredItems, setFeaturedItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Загрузка категорий с блюдами
    const loadCategories = useCallback(async () => {
        try {
            const response = await publicMenu.getCategories()
            if (response.success) {
                setCategories(response.data)
                return response.data
            }
            throw new Error('Failed to load categories')
        } catch (err) {
            setError(err.message)
            return []
        }
    }, [])

    // Загрузка рекомендуемых блюд
    const loadFeatured = useCallback(async (limit = 10) => {
        try {
            const response = await publicMenu.getFeatured(limit)
            if (response.success) {
                setFeaturedItems(response.data)
                return response.data
            }
            throw new Error('Failed to load featured items')
        } catch (err) {
            setError(err.message)
            return []
        }
    }, [])

    // Загрузка всех данных
    const loadAll = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            await Promise.all([
                loadCategories(),
                loadFeatured()
            ])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [loadCategories, loadFeatured])

    useEffect(() => {
        loadAll()
    }, [loadAll])

    return {
        categories,
        featuredItems,
        loading,
        error,
        reload: loadAll,
        loadCategories,
        loadFeatured,
    }
}

// Хук для получения блюд по категории
export function useMenuItems(filters = {}) {
    const [items, setItems] = useState([])
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const loadItems = useCallback(async (newFilters = filters) => {
        setLoading(true)
        setError(null)
        try {
            const response = await publicMenu.getItems(newFilters)
            if (response.success) {
                setItems(response.data)
                setCount(response.count || response.data.length)
                return response.data
            }
            throw new Error('Failed to load items')
        } catch (err) {
            setError(err.message)
            return []
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadItems()
    }, [loadItems])

    return {
        items,
        count,
        loading,
        error,
        reload: loadItems,
    }
}