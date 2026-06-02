import { api } from './client'

export const publicRestaurants = {
    /**
     * Получить список всех активных ресторанов
     */
    getAll: () => api.get('/restaurants'),

    /**
     * Получить детальную информацию о ресторане
     */
    getById: (id) => api.get(`/restaurants/${id}`),

    /**
     * Получить слайды для главной страницы
     */
    getSlides: () => api.get('/restaurants/slides'),
}

export const publicMenu = {
    /**
     * Получить дерево категорий с блюдами
     */
    getCategories: () => api.get('/menu/categories'),

    /**
     * Получить список блюд с фильтрацией
     * @param {Object} filters - { category_id, category_slug, featured, search }
     */
    getItems: (filters = {}) => {
        const params = new URLSearchParams()
        if (filters.category_id) params.append('category_id', filters.category_id)
        if (filters.category_slug) params.append('category_slug', filters.category_slug)
        if (filters.featured) params.append('featured', filters.featured)
        if (filters.search) params.append('search', filters.search)

        const query = params.toString()
        return api.get(`/menu/items${query ? `?${query}` : ''}`)
    },

    /**
     * Получить рекомендуемые блюда для слайдера
     * @param {number} limit - количество блюд
     */
    getFeatured: (limit = 10) => api.get(`/menu/items/featured?limit=${limit}`),

    /**
     * Получить блюда для калькулятора мероприятий
     */
    getEventDishes: () => api.get('/menu/items/event'),

    /**
     * Получить детальную информацию о блюде
     * @param {number} id - ID блюда
     */
    getItemById: (id) => api.get(`/menu/items/${id}`),
}

// public.js - добавьте в конец файла

export const publicNews = {
    /**
     * Получить список новостей с пагинацией и фильтрацией
     * @param {Object} params - { page, per_page, year, month, search }
     */
    getList: (params = {}) => {
        const query = new URLSearchParams()
        if (params.page) query.append('page', params.page)
        if (params.per_page) query.append('per_page', params.per_page)
        if (params.year) query.append('year', params.year)
        if (params.month) query.append('month', params.month)
        if (params.search) query.append('search', params.search)

        const q = query.toString()
        return api.get(`/news${q ? `?${q}` : ''}`)
    },

    /**
     * Получить последние новости для главной страницы
     * @param {number} limit - количество новостей (по умолчанию 3)
     */
    getLatest: (limit = 3) => api.get(`/news/latest?limit=${limit}`),

    /**
     * Получить архив по годам и месяцам для фильтрации
     */
    getArchive: () => api.get('/news/archive'),

    /**
     * Получить детальную информацию о новости
     * @param {number} id - ID новости
     */
    getById: (id) => api.get(`/news/${id}`),
}