import {api} from './client'

export const adminOrders = {
    list: (filters = {}) => {
        const apiFilters = {};

        // Тип заказа
        if (filters.type && filters.type !== 'all') {
            apiFilters.type = filters.type === 'table' ? 'booking' : filters.type;
        }

        // Статус
        if (filters.status && filters.status !== 'all') {
            apiFilters.status = filters.status;
        }

        // Ресторан
        if (filters.restaurant_id && filters.restaurant_id !== 'all') {
            apiFilters.restaurant_id = filters.restaurant_id;
        }

        // Даты
        if (filters.date_from) {
            apiFilters.date_from = filters.date_from;
        }
        if (filters.date_to) {
            apiFilters.date_to = filters.date_to;
        }

        // Поиск
        if (filters.search) {
            apiFilters.search = filters.search;
        }

        // Сортировка
        if (filters.sort_by && filters.sort_by !== 'date') {
            apiFilters.sort_by = filters.sort_by;
        }
        if (filters.sort_order && filters.sort_order !== 'desc') {
            apiFilters.sort_order = filters.sort_order;
        }

        // Пагинация
        if (filters.page) {
            apiFilters.page = filters.page;
        }
        if (filters.per_page) {
            apiFilters.per_page = filters.per_page;
        }

        const q = new URLSearchParams(apiFilters).toString();
        return api.get(`/admin/orders${q ? `?${q}` : ''}`);
    },

    updateStatus: (type, id, status) => {
        return api.patch(`/admin/orders/${type}/${id}/status`, {status});
    },

    update: (type, id, data) => {
        return api.patch(`/admin/orders/${type}/${id}`, data);
    },

    getStats: () => api.get('/admin/orders/stats'),

    getRestaurants: () => api.get('/admin/restaurants/select'),  // ИСПРАВЛЕНО: добавил /admin

    delete: (type, id) => api.delete(`/admin/orders/${type}/${id}`),

    addEventItem: (eventId, data) => api.post(`/admin/orders/event/${eventId}/items`, data),
    updateEventItem: (eventId, itemId, data) => api.put(`/admin/orders/event/${eventId}/items/${itemId}`, data),
    deleteEventItem: (eventId, itemId) => api.delete(`/admin/orders/event/${eventId}/items/${itemId}`),
    getAvailableDishes: (eventId) => api.get(`/admin/orders/event/${eventId}/available-dishes`),
};

export const adminDashboard = {
    stats: () => api.get('/admin/stats'),        // ИСПРАВЛЕНО: добавил /admin
    summary: () => api.get('/admin/stats/summary'), // ИСПРАВЛЕНО: добавил /admin
}

export const adminNews = {
    list: (page = 1, filters = {}) => {
        const params = new URLSearchParams({
            page,
            per_page: filters.per_page || 10,
            ...(filters.status && {status: filters.status}),
            ...(filters.search && {search: filters.search}),
            ...(filters.date_from && {date_from: filters.date_from}),
            ...(filters.date_to && {date_to: filters.date_to}),
            ...(filters.sort_by && {sort_by: filters.sort_by}),
            ...(filters.sort_order && {sort_order: filters.sort_order}),
        }).toString()
        return api.get(`/admin/news?${params}`)  // ИСПРАВЛЕНО: добавил /admin
    },
    getById: (id) => api.get(`/admin/news/${id}`),  // ИСПРАВЛЕНО: добавил /admin
    create: (data) => api.post('/admin/news', data),  // ИСПРАВЛЕНО: добавил /admin
    update: (id, data) => api.put(`/admin/news/${id}`, data),  // ИСПРАВЛЕНО: добавил /admin
    remove: (id) => api.delete(`/admin/news/${id}`),  // ИСПРАВЛЕНО: добавил /admin
    getStatuses: () => api.get('/admin/news/statuses'),  // ИСПРАВЛЕНО: добавил /admin
}

export const adminRestaurants = {
    list: (params = {}) => {
        const q = new URLSearchParams(params).toString()
        return api.get(`/admin/restaurants?${q}`)  // ИСПРАВЛЕНО: добавил /admin
    },
    getById: (id) => api.get(`/admin/restaurants/${id}`),  // ИСПРАВЛЕНО: добавил /admin
    create: (data) => api.post('/admin/restaurants', data),  // ИСПРАВЛЕНО: добавил /admin
    update: (id, data) => api.put(`/admin/restaurants/${id}`, data),  // ИСПРАВЛЕНО: добавил /admin
    remove: (id) => api.delete(`/admin/restaurants/${id}`),  // ИСПРАВЛЕНО: добавил /admin
    reorder: (orders) => api.post('/admin/restaurants/reorder', {orders}),  // ИСПРАВЛЕНО: добавил /admin
    getStatuses: () => api.get('/admin/restaurants/statuses'),  // ИСПРАВЛЕНО: добавил /admin
    getAllActive: () => api.get('/admin/restaurants/all'),  // ИСПРАВЛЕНО: добавил /admin
}

export const adminMenuCategories = {
    getTree: () => api.get('/admin/menu/categories'),  // ИСПРАВЛЕНО: добавил /admin
    getFlat: () => api.get('/admin/menu/categories/flat'),  // ИСПРАВЛЕНО: добавил /admin
    getById: (id) => api.get(`/admin/menu/categories/${id}`),  // ИСПРАВЛЕНО: добавил /admin
    create: (data) => api.post('/admin/menu/categories', data),  // ИСПРАВЛЕНО: добавил /admin
    update: (id, data) => api.put(`/admin/menu/categories/${id}`, data),  // ИСПРАВЛЕНО: добавил /admin
    remove: (id) => api.delete(`/admin/menu/categories/${id}`),  // ИСПРАВЛЕНО: добавил /admin
    reorder: (orders) => api.post('/admin/menu/categories/reorder', {orders}),  // ИСПРАВЛЕНО: добавил /admin
    getStatuses: () => api.get('/admin/menu/categories/statuses'),  // ИСПРАВЛЕНО: добавил /admin
}

export const adminMenuItems = {
    list: (params = {}) => {
        const q = new URLSearchParams(params).toString()
        return api.get(`/admin/menu/items?${q}`)  // ИСПРАВЛЕНО: добавил /admin
    },
    getById: (id) => api.get(`/admin/menu/items/${id}`),  // ИСПРАВЛЕНО: добавил /admin
    create: (data) => api.post('/admin/menu/items', data),  // ИСПРАВЛЕНО: добавил /admin
    update: (id, data) => api.put(`/admin/menu/items/${id}`, data),  // ИСПРАВЛЕНО: добавил /admin
    remove: (id) => api.delete(`/admin/menu/items/${id}`),  // ИСПРАВЛЕНО: добавил /admin
    bulkUpdateStatus: (ids, isActive) => api.post('/admin/menu/items/bulk/status', {ids, is_active: isActive}),  // ИСПРАВЛЕНО: добавил /admin
    bulkUpdateFeatured: (ids, isFeatured) => api.post('/admin/menu/items/bulk/featured', {ids, is_featured: isFeatured}),  // ИСПРАВЛЕНО: добавил /admin
    reorder: (orders) => api.post('/admin/menu/items/reorder', {orders}),  // ИСПРАВЛЕНО: добавил /admin
    getStats: () => api.get('/admin/menu/items/stats'),  // ИСПРАВЛЕНО: добавил /admin
    getEventDishes: () => api.get('/admin/menu/items/event-dishes'),  // ИСПРАВЛЕНО: добавил /admin
    getFeatured: (limit = 10) => api.get(`/admin/menu/items/featured?limit=${limit}`),  // ИСПРАВЛЕНО: добавил /admin
}

export const adminReviews = {
    list: (filters = {}) => {
        const params = new URLSearchParams()

        if (filters.status && filters.status !== 'all') params.append('status', filters.status)
        if (filters.rating) params.append('rating', filters.rating)
        if (filters.search) params.append('search', filters.search)
        if (filters.date_from) params.append('date_from', filters.date_from)
        if (filters.date_to) params.append('date_to', filters.date_to)
        if (filters.sort_by) params.append('sort_by', filters.sort_by)
        if (filters.sort_order) params.append('sort_order', filters.sort_order)
        if (filters.per_page) params.append('per_page', filters.per_page)

        const query = params.toString()
        return api.get(`/admin/reviews${query ? `?${query}` : ''}`)
    },

    getById: (id) => api.get(`/admin/reviews/${id}`),
    approve: (id) => api.patch(`/admin/reviews/${id}/approve`),
    reject: (id) => api.patch(`/admin/reviews/${id}/reject`),
    updateStatus: (id, status) => api.patch(`/admin/reviews/${id}/status`, {status}),
    delete: (id) => api.delete(`/admin/reviews/${id}`),
    getStats: () => api.get('/admin/reviews/stats'),
}

export const publicReviews = {
    list: () => api.get('/reviews'),
    create: (data) => api.post('/reviews', data),
}

export const adminManagers = {
    list: (filters = {}) => {
        const params = new URLSearchParams()

        if (filters.is_active !== undefined && filters.is_active !== '') {
            params.append('is_active', filters.is_active)
        }
        if (filters.search) params.append('search', filters.search)
        if (filters.sort_by) params.append('sort_by', filters.sort_by)
        if (filters.sort_order) params.append('sort_order', filters.sort_order)
        if (filters.per_page) params.append('per_page', filters.per_page)

        const query = params.toString()
        return api.get(`/admin/managers${query ? `?${query}` : ''}`)  // ИСПРАВЛЕНО: добавил /admin
    },

    getById: (id) => api.get(`/admin/managers/${id}`),  // ИСПРАВЛЕНО: добавил /admin
    create: (data) => api.post('/admin/managers', data),  // ИСПРАВЛЕНО: добавил /admin
    update: (id, data) => api.put(`/admin/managers/${id}`, data),  // ИСПРАВЛЕНО: добавил /admin
    delete: (id) => api.delete(`/admin/managers/${id}`),  // ИСПРАВЛЕНО: добавил /admin
    toggleBlock: (id) => api.patch(`/admin/managers/${id}/block`),  // ИСПРАВЛЕНО: добавил /admin
    getStats: () => api.get('/admin/managers/stats'),  // ИСПРАВЛЕНО: добавил /admin
    getSections: () => api.get('/admin/managers/sections'),  // ИСПРАВЛЕНО: добавил /admin
}

export const adminUpload = {
    upload: async (file, type = 'image', directory = null) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)
        if (directory) formData.append('directory', directory)

        const response = await api.post('/admin/upload', formData)  // ИСПРАВЛЕНО: добавил /admin
        return response.data
    },

    uploadMultiple: async (files, directory = null) => {
        const formData = new FormData()
        files.forEach(file => formData.append('files[]', file))
        if (directory) formData.append('directory', directory)

        const response = await api.post('/admin/upload/multiple', formData)  // ИСПРАВЛЕНО: добавил /admin
        return response.data
    },

    delete: (url) => api.delete('/admin/upload', { url }),  // ИСПРАВЛЕНО: добавил /admin

    info: (url) => api.get('/admin/upload/info', { params: { url } }),  // ИСПРАВЛЕНО: добавил /admin
}

export const adminContacts = {
    /**
     * Получить список сообщений
     * @param {Object} filters - { is_read, search, sort_by, sort_order, per_page, page }
     */
    list: (filters = {}) => {
        const params = new URLSearchParams()

        if (filters.is_read !== undefined && filters.is_read !== '') {
            params.append('is_read', filters.is_read)
        }
        if (filters.search) params.append('search', filters.search)
        if (filters.sort_by) params.append('sort_by', filters.sort_by)
        if (filters.sort_order) params.append('sort_order', filters.sort_order)
        if (filters.per_page) params.append('per_page', filters.per_page)
        if (filters.page) params.append('page', filters.page)

        const query = params.toString()
        return api.get(`/admin/contact${query ? `?${query}` : ''}`)
    },

    /**
     * Получить детали сообщения
     */
    getById: (id) => api.get(`/admin/contact/${id}`),

    /**
     * Отметить как прочитанное
     */
    markAsRead: (id) => api.patch(`/admin/contact/${id}/read`),

    /**
     * Удалить сообщение
     */
    delete: (id) => api.delete(`/admin/contact/${id}`),

    /**
     * Получить статистику
     */
    getStats: () => api.get('/admin/contact/stats'),
}