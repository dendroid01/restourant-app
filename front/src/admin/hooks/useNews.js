import { useState, useCallback, useEffect } from 'react'
import { adminNews } from '../../api/admin'
import { useToast } from '../../shared/hooks/useToast'

export function useNews() {
    const [news, setNews] = useState([])
    const [loading, setLoading] = useState(true)
    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    })
    const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 })
    const [statuses, setStatuses] = useState([])
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        date_from: '',
        date_to: '',
        sort_by: 'published_at',
        sort_order: 'desc',
    })

    const toast = useToast()

    // Загрузка списка новостей
    const loadNews = useCallback(async (page = 1) => {
        setLoading(true)
        try {
            const response = await adminNews.list(page, filters)
            // response.data = { success, data, meta, stats, statuses }
            setNews(response.data || [])
            setMeta(response.meta || { current_page: page, last_page: 1, per_page: 10, total: 0 })
            if (response.stats) setStats(response.stats)
            if (response.statuses) setStatuses(response.statuses)
        } catch (error) {
            console.error('Failed to load news:', error)
            toast.error('Ошибка загрузки новостей')
        } finally {
            setLoading(false)
        }
    }, [filters, toast])

    // При изменении фильтров - перезагружаем с первой страницы
    useEffect(() => {
        loadNews(1)
    }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

    // Создание новости
    const createNews = useCallback(async (data) => {
        setLoading(true)
        try {
            const response = await adminNews.create(data)
            toast.success('Новость успешно создана')
            await loadNews(meta.current_page)
            return response.data
        } catch (error) {
            console.error('Failed to create news:', error)
            toast.error(error.message || 'Ошибка создания новости')
            throw error
        } finally {
            setLoading(false)
        }
    }, [loadNews, meta.current_page, toast])

    // Обновление новости
    const updateNews = useCallback(async (id, data) => {
        setLoading(true)
        try {
            const response = await adminNews.update(id, data)
            toast.success('Новость успешно обновлена')
            await loadNews(meta.current_page)
            return response.data
        } catch (error) {
            console.error('Failed to update news:', error)
            toast.error(error.message || 'Ошибка обновления новости')
            throw error
        } finally {
            setLoading(false)
        }
    }, [loadNews, meta.current_page, toast])

    // Удаление новости
    const deleteNews = useCallback(async (id) => {
        setLoading(true)
        try {
            await adminNews.remove(id)
            toast.success('Новость успешно удалена')
            // Если на последней странице остался 1 элемент - переходим на предыдущую
            const newPage = news.length === 1 && meta.current_page > 1 ? meta.current_page - 1 : meta.current_page
            await loadNews(newPage)
        } catch (error) {
            console.error('Failed to delete news:', error)
            toast.error(error.message || 'Ошибка удаления новости')
            throw error
        } finally {
            setLoading(false)
        }
    }, [loadNews, meta.current_page, news.length, toast])

    // Загрузка статусов (если нужно отдельно)
    const loadStatuses = useCallback(async () => {
        try {
            const response = await adminNews.getStatuses()
            setStatuses(response.data || [])
        } catch (error) {
            console.error('Failed to load statuses:', error)
        }
    }, [])

    // Обновление фильтров
    const updateFilter = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }, [])

    const resetFilters = useCallback(() => {
        setFilters({
            status: '',
            search: '',
            date_from: '',
            date_to: '',
            sort_by: 'published_at',
            sort_order: 'desc',
        })
    }, [])

    return {
        news,
        loading,
        meta,
        stats,
        statuses,
        filters,
        loadNews,
        createNews,
        updateNews,
        deleteNews,
        loadStatuses,
        updateFilter,
        resetFilters,
    }
}