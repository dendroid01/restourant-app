// hooks/useMenuItems.js
import {useState, useCallback} from 'react'
import {adminMenuItems} from '../../api/admin'
import {useToast} from '../../shared/hooks/useToast'
import {useTranslation} from 'react-i18next'

export function useMenuItems() {
    const {i18n} = useTranslation()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    })
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        featured: 0,
        for_events: 0,
    })
    const [filterOptions, setFilterOptions] = useState({
        active_statuses: [],
        featured_statuses: [],
        event_statuses: [],
    })
    const [filters, setFilters] = useState({
        category_id: '',
        is_active: '',
        is_featured: '',
        is_available_for_events: '',
        search: '',
        sort_by: 'order',
        sort_order: 'asc',
    })

    const toast = useToast()

    const loadItems = useCallback(async (page = 1) => {
        setLoading(true)
        try {
            const response = await adminMenuItems.list({
                page,
                per_page: meta.per_page,
                locale: i18n.language,
                ...filters,
            })

            setItems(response.data || [])
            setMeta({
                current_page: response.meta?.current_page || 1,
                last_page: response.meta?.last_page || 1,
                per_page: response.meta?.per_page || 10,
                total: response.meta?.total || 0,
            })
            if (response.stats) setStats(response.stats)
            if (response.filter_options) setFilterOptions(response.filter_options)
        } catch (error) {
            console.error('Load items error:', error)
            toast.error(error.message || 'Ошибка загрузки блюд')
        } finally {
            setLoading(false)
        }
    }, [filters, meta.per_page, i18n.language, toast])

    const loadStats = useCallback(async () => {
        try {
            const response = await adminMenuItems.getStats()
            if (response.data) setStats(response.data)
        } catch (error) {
            console.error('Load stats error:', error)
        }
    }, [])

    const createItem = useCallback(async (data) => {
        setLoading(true)
        try {
            await adminMenuItems.create(data)
            toast.success('Блюдо успешно создано')
            await loadItems(1)
            await loadStats()
            return true
        } catch (error) {
            console.error('Create item error:', error)
            toast.error(error.message || 'Ошибка создания блюда')
            return false
        } finally {
            setLoading(false)
        }
    }, [loadItems, loadStats, toast])

    const updateItem = useCallback(async (id, data) => {
        setLoading(true)
        try {
            await adminMenuItems.update(id, data)
            toast.success('Блюдо успешно обновлено')
            await loadItems(meta.current_page)
            await loadStats()
            return true
        } catch (error) {
            console.error('Update item error:', error)
            toast.error(error.message || 'Ошибка обновления блюда')
            return false
        } finally {
            setLoading(false)
        }
    }, [loadItems, meta.current_page, loadStats, toast])

    const deleteItem = useCallback(async (id) => {
        setLoading(true)
        try {
            await adminMenuItems.remove(id)
            toast.success('Блюдо удалено')
            await loadItems(meta.current_page)
            await loadStats()
            return true
        } catch (error) {
            console.error('Delete item error:', error)
            toast.error(error.message || 'Ошибка удаления блюда')
            return false
        } finally {
            setLoading(false)
        }
    }, [loadItems, meta.current_page, loadStats, toast])

    const bulkUpdateStatus = useCallback(async (ids, isActive) => {
        setLoading(true)
        try {
            const response = await adminMenuItems.bulkUpdateStatus(ids, isActive)
            toast.success(response.message || `Обновлено ${ids.length} блюд`)
            await loadItems(meta.current_page)
            await loadStats()
            return true
        } catch (error) {
            console.error('Bulk update status error:', error)
            toast.error(error.message || 'Ошибка обновления статусов')
            return false
        } finally {
            setLoading(false)
        }
    }, [loadItems, meta.current_page, loadStats, toast])

    const bulkUpdateFeatured = useCallback(async (ids, isFeatured) => {
        setLoading(true)
        try {
            const response = await adminMenuItems.bulkUpdateFeatured(ids, isFeatured)
            toast.success(response.message || `Обновлено ${ids.length} блюд`)
            await loadItems(meta.current_page)
            await loadStats()
            return true
        } catch (error) {
            console.error('Bulk update featured error:', error)
            toast.error(error.message || 'Ошибка обновления рекомендаций')
            return false
        } finally {
            setLoading(false)
        }
    }, [loadItems, meta.current_page, loadStats, toast])

    const updateOrder = useCallback(async (orders) => {
        try {
            await adminMenuItems.reorder(orders)
            toast.success('Порядок блюд обновлён')
            await loadItems(meta.current_page)
            return true
        } catch (error) {
            console.error('Reorder error:', error)
            toast.error(error.message || 'Ошибка обновления порядка')
            return false
        }
    }, [loadItems, meta.current_page, toast])

    const updateFilter = useCallback((key, value) => {
        setFilters(prev => ({...prev, [key]: value}))
    }, [])

    const resetFilters = useCallback(() => {
        setFilters({
            category_id: '',
            is_active: '',
            is_featured: '',
            is_available_for_events: '',
            search: '',
            sort_by: 'order',
            sort_order: 'asc',
        })
    }, [])

    return {
        items,
        loading,
        meta,
        stats,
        filterOptions,
        filters,
        loadItems,
        createItem,
        updateItem,
        deleteItem,
        bulkUpdateStatus,
        bulkUpdateFeatured,
        updateOrder,
        updateFilter,
        resetFilters,
        loadStats,
    }
}