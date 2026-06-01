import { api } from './client'

export const adminOrders = {
    list:   (filters = {}) => {
        const q = new URLSearchParams(filters).toString()
        return api.get(`/admin/orders?${q}`)
    },
    update: (id, data) => api.patch(`/admin/orders/${id}`, data),
}

export const adminReviews = {
    list:     (status)     => api.get(`/admin/reviews?status=${status ?? ''}`),
    moderate: (id, status) => api.patch(`/admin/reviews/${id}/moderate`, { status }),
    remove:   (id)         => api.delete(`/admin/reviews/${id}`),
}

export const adminDashboard = {
    stats: () => api.get('/stats'),
    summary: () => api.get('/stats/summary'),
}

export const adminNews = {
    list: (page = 1, filters = {}) => {
        const params = new URLSearchParams({
            page,
            per_page: filters.per_page || 10,
            ...(filters.status && { status: filters.status }),
            ...(filters.search && { search: filters.search }),
            ...(filters.date_from && { date_from: filters.date_from }),
            ...(filters.date_to && { date_to: filters.date_to }),
            ...(filters.sort_by && { sort_by: filters.sort_by }),
            ...(filters.sort_order && { sort_order: filters.sort_order }),
        }).toString()
        return api.get(`/news?${params}`)
    },
    getById: (id) => api.get(`/news/${id}`),
    create: (data) => api.post('/news', data),
    update: (id, data) => api.put(`/news/${id}`, data),
    remove: (id) => api.delete(`/news/${id}`),
    getStatuses: () => api.get('/news/statuses'),
}

export const adminRestaurants = {
    list: (params = {}) => {
        const q = new URLSearchParams(params).toString()
        return api.get(`/restaurants?${q}`)
    },
    getById: (id) => api.get(`/restaurants/${id}`),
    create: (data) => api.post('/restaurants', data),
    update: (id, data) => api.put(`/restaurants/${id}`, data),
    remove: (id) => api.delete(`/restaurants/${id}`),
    reorder: (orders) => api.post('/restaurants/reorder', { orders }),
    getStatuses: () => api.get('/restaurants/statuses'),
    getAllActive: () => api.get('/restaurants/all'),
}

export const adminMenuCategories = {
    getTree: () => api.get('/menu/categories'),
    getFlat: () => api.get('/menu/categories/flat'),
    getById: (id) => api.get(`/menu/categories/${id}`),
    create: (data) => api.post('/menu/categories', data),
    update: (id, data) => api.put(`/menu/categories/${id}`, data),
    remove: (id) => api.delete(`/menu/categories/${id}`),
    reorder: (orders) => api.post('/menu/categories/reorder', { orders }),
    getStatuses: () => api.get('/menu/categories/statuses'),
}

export const adminMenuItems = {
    list: (params = {}) => {
        const q = new URLSearchParams(params).toString()
        return api.get(`/menu/items?${q}`)
    },
    getById: (id) => api.get(`/menu/items/${id}`),
    create: (data) => api.post('/menu/items', data),
    update: (id, data) => api.put(`/menu/items/${id}`, data),
    remove: (id) => api.delete(`/menu/items/${id}`),
    bulkUpdateStatus: (ids, isActive) => api.post('/menu/items/bulk/status', { ids, is_active: isActive }),
    bulkUpdateFeatured: (ids, isFeatured) => api.post('/menu/items/bulk/featured', { ids, is_featured: isFeatured }),
    reorder: (orders) => api.post('/menu/items/reorder', { orders }),
    getStats: () => api.get('/menu/items/stats'),
    getEventDishes: () => api.get('/menu/items/event-dishes'),
    getFeatured: (limit = 10) => api.get(`/menu/items/featured?limit=${limit}`),
}