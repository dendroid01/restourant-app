// resources/js/admin/hooks/useMenuCategories.js
import { useState, useEffect, useCallback } from 'react'
import { adminMenuCategories } from '../../api/admin'
import { api } from '../../api/client'

export function useMenuCategories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchCategories = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await adminMenuCategories.getTree()
            // Ваш API клиент уже возвращает data напрямую
            if (response && response.success) {
                setCategories(response.data)
            } else if (response && response.data) {
                // Если response уже содержит данные напрямую
                setCategories(response.data)
            } else {
                setCategories(response || [])
            }
        } catch (err) {
            console.error('Failed to load categories:', err)
            setError(err.message || 'Ошибка загрузки категорий')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // Убеждаемся, что CSRF получен перед запросом
        const init = async () => {
            try {
                await api.csrf()
                await fetchCategories()
            } catch (err) {
                setError('Ошибка инициализации: ' + err.message)
                setLoading(false)
            }
        }
        init()
    }, [fetchCategories])

    // Получить плоский список всех категорий (для селектов)
    const getFlatCategories = useCallback(() => {
        const flatten = (nodes, depth = 0, result = []) => {
            for (const node of nodes) {
                result.push({
                    id: node.id,
                    title: '—'.repeat(depth) + ' ' + node.title_ru,
                    title_ru: node.title_ru,
                    slug: node.slug,
                    depth: depth,
                    parent_id: node.parent_id,
                })
                if (node.children && node.children.length) {
                    flatten(node.children, depth + 1, result)
                }
            }
            return result
        }
        return flatten(categories)
    }, [categories])

    // Найти категорию по ID
    const findCategoryById = useCallback((id) => {
        const search = (nodes) => {
            for (const node of nodes) {
                if (node.id === id) return node
                if (node.children && node.children.length) {
                    const found = search(node.children)
                    if (found) return found
                }
            }
            return null
        }
        return search(categories)
    }, [categories])

    // Найти категорию по slug
    const findCategoryBySlug = useCallback((slug) => {
        const search = (nodes) => {
            for (const node of nodes) {
                if (node.slug === slug) return node
                if (node.children && node.children.length) {
                    const found = search(node.children)
                    if (found) return found
                }
            }
            return null
        }
        return search(categories)
    }, [categories])

    // Получить всех родителей категории
    const getCategoryPath = useCallback((id) => {
        const category = findCategoryById(id)
        if (!category) return []

        const path = [category]
        let current = category
        while (current.parent_id) {
            const parent = findCategoryById(current.parent_id)
            if (parent) {
                path.unshift(parent)
                current = parent
            } else {
                break
            }
        }
        return path
    }, [findCategoryById])

    return {
        categories,
        loading,
        error,
        refetch: fetchCategories,
        getFlatCategories,
        findCategoryById,
        findCategoryBySlug,
        getCategoryPath,
    }
}