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