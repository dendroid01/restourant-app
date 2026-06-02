// src/api/client.js
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

// Конфигурация маршрутов: какой тип авторизации требуется
const ROUTE_CONFIG = {
    // Публичные маршруты (без токена)
    public: {
        routes: [
            { path: '/reviews', methods: ['GET', 'POST'] },
            { path: '/admin/login', methods: ['POST'] },
        ],
        patterns: [
            // /reviews/* но не /admin/reviews/*
        ]
    },
    // Админские маршруты (с токеном)
    admin: {
        routes: [
            { path: '/admin/logout', methods: ['POST'] },
            { path: '/admin/me', methods: ['GET'] },
            { path: '/stats', methods: ['GET'] },
            { path: '/news', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
            { path: '/restaurants', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
            { path: '/menu/categories', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
            { path: '/menu/items', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
            { path: '/admin/reviews', methods: ['GET', 'PATCH', 'DELETE'] },
            { path: '/admin/upload', methods: ['POST', 'DELETE', 'GET'] }, // Добавляем upload
        ]
    }
}

// Функция для определения типа маршрута
function getRouteType(path, method) {
    // Проверяем публичные маршруты
    for (const route of ROUTE_CONFIG.public.routes) {
        if (path === route.path && route.methods.includes(method)) {
            return 'public'
        }
    }

    // Проверяем паттерны для публичных маршрутов
    if (path === '/reviews' || path.startsWith('/reviews?')) {
        if (method === 'GET' || method === 'POST') {
            return 'public'
        }
    }

    // Все остальное - админские маршруты
    return 'admin'
}

// Функция для получения CSRF cookie
async function getCsrfCookie() {
    const csrfUrl = 'http://localhost:8000/sanctum/csrf-cookie'
    const response = await fetch(csrfUrl, {
        method: 'GET',
        credentials: 'include',
    })

    if (!response.ok) {
        throw new Error('Failed to fetch CSRF cookie')
    }
}

async function request(path, options = {}) {
    const method = options.method || 'GET'
    const routeType = getRouteType(path, method)
    const token = localStorage.getItem('admin_token')

    // Определяем, нужно ли добавлять токен
    const shouldAddToken = routeType === 'admin' && token

    // Для публичных POST запросов к /reviews получаем CSRF cookie
    if (routeType === 'public' && method === 'POST' && path === '/reviews') {
        try {
            await getCsrfCookie()
        } catch (csrfErr) {
            console.warn('CSRF fetch failed, continuing...', csrfErr)
        }
    }

    // Подготовка headers
    const headers = {
        'Accept': 'application/json',
        ...(shouldAddToken ? { Authorization: `Bearer ${token}` } : {}),
    }

    // Не добавляем Content-Type для FormData (браузер сам установит boundary)
    const isFormData = options.body instanceof FormData
    if (!isFormData && options.body && typeof options.body === 'object') {
        headers['Content-Type'] = 'application/json'
    }

    const res = await fetch(`${BASE}${path}`, {
        headers,
        credentials: 'include',
        ...options,
        body: options.body && typeof options.body === 'object' && !isFormData
            ? JSON.stringify(options.body)
            : options.body,
    })

    // Обработка 401 - только для админских маршрутов
    if (res.status === 401 && routeType === 'admin') {
        localStorage.removeItem('admin_token')
        // Не делаем редирект, если страница логина уже открыта
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/admin/login'
        }
        throw new Error('Unauthorized')
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const error = new Error(body.message || body.error || 'Ошибка сервера')
        error.status = res.status
        error.body = body
        throw error
    }

    return res.status === 204 ? null : res.json()
}

export const api = {
    csrf: () => getCsrfCookie(),
    get: (path) => request(path),
    post: (path, data, customOptions = {}) => request(path, { method: 'POST', body: data, ...customOptions }),
    patch: (path, data) => request(path, { method: 'PATCH', body: data }),
    put: (path, data) => request(path, { method: 'PUT', body: data }),
    delete: (path, data) => request(path, { method: 'DELETE', body: data ? JSON.stringify(data) : undefined }),
}

export const publicApi = {
    // Рестораны
    getRestaurants: () => api.get('/restaurants/select'),

    // Бронирование
    createBooking: (data) => api.post('/bookings', data),

    // Мероприятия
    createEvent: (data) => api.post('/event-requests', data),

    // Блюда для мероприятий
    getEventDishes: () => api.get('/menu/items/event-dishes'),
}