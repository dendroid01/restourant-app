import { api } from './client'

export const adminNews = {
    list:    (page = 1)        => api.get(`/admin/news?page=${page}`),
    create:  (data)            => api.post('/admin/news', data),
    update:  (id, data)        => api.put(`/admin/news/${id}`, data),
    remove:  (id)              => api.delete(`/admin/news/${id}`),
}

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