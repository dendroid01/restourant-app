// src/api/client.js
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

// Конфигурация маршрутов: какой тип авторизации требуется
const ROUTE_CONFIG = {
    // Публичные маршруты (без токена)
    public: {
        exactRoutes: [
            { path: '/reviews', methods: ['GET', 'POST'] },
            { path: '/admin/login', methods: ['POST'] },
            { path: '/restaurants', methods: ['GET'] },           // <-- ДОБАВЛЕНО
            { path: '/restaurants/slides', methods: ['GET'] },
            { path: '/bookings', methods: ['POST'] },
            { path: '/event-requests', methods: ['POST'] },
            { path: '/menu/categories', methods: ['GET'] },
            { path: '/menu/items', methods: ['GET'] },
            { path: '/menu/items/featured', methods: ['GET'] },
            { path: '/menu/items/event', methods: ['GET'] }
        ],
        patterns: [
            { pattern: /^\/restaurants\/\d+$/, methods: ['GET'] },      // /restaurants/123
            { pattern: /^\/news\/\d+$/, methods: ['GET'] },              // /news/123
        ]
    },
    // Админские маршруты (с токеном)
    admin: {
        exactRoutes: [
            { path: '/admin/logout', methods: ['POST'] },
            { path: '/admin/me', methods: ['GET'] },
            { path: '/stats', methods: ['GET'] },
            { path: '/admin/reviews', methods: ['GET', 'PATCH', 'DELETE'] },
            { path: '/admin/upload', methods: ['POST', 'DELETE', 'GET'] },
            { path: '/admin/restaurants/select', methods: ['GET'] },
            { path: '/admin/restaurants/all', methods: ['GET'] },
            { path: '/admin/restaurants/statuses', methods: ['GET'] },
            { path: '/admin/restaurants/reorder', methods: ['POST'] },
            { path: '/news/statuses', methods: ['GET'] },
            { path: '/menu/categories/flat', methods: ['GET'] },
            { path: '/menu/categories/reorder', methods: ['POST'] },
            { path: '/menu/categories/statuses', methods: ['GET'] },
            { path: '/menu/items/event-dishes', methods: ['GET'] },
            { path: '/menu/items/featured', methods: ['GET'] },
            { path: '/menu/items/bulk/status', methods: ['POST'] },
            { path: '/menu/items/bulk/featured', methods: ['POST'] },
            { path: '/menu/items/reorder', methods: ['POST'] },
            { path: '/menu/items/stats', methods: ['GET'] },
            { path: '/admin/reviews/stats', methods: ['GET'] },
            { path: '/admin/orders', methods: ['GET'] },
            { path: '/admin/orders/stats', methods: ['GET'] },
            { path: '/managers', methods: ['GET', 'POST'] },
            { path: '/managers/stats', methods: ['GET'] },
            { path: '/managers/sections', methods: ['GET'] },
        ],
        patterns: [
            { pattern: /^\/restaurants\/\d+$/, methods: ['PUT', 'DELETE'] },  // PUT/DELETE требуют админку
            { pattern: /^\/news\/\d+$/, methods: ['PUT', 'DELETE'] },
            { pattern: /^\/menu\/categories\/\d+$/, methods: ['PUT', 'DELETE'] },
            { pattern: /^\/menu\/items\/\d+$/, methods: ['PUT', 'DELETE'] },
            { pattern: /^\/admin\/reviews\/\d+$/, methods: ['GET', 'PATCH', 'DELETE'] },
            { pattern: /^\/admin\/orders\/[^\/]+\/\d+$/, methods: ['GET', 'PATCH', 'DELETE'] },
            { pattern: /^\/managers\/\d+$/, methods: ['GET', 'PUT', 'DELETE', 'PATCH'] },
            { pattern: /^\/admin\/orders\/event\/\d+\/items$/, methods: ['POST'] },
            { pattern: /^\/admin\/orders\/event\/\d+\/items\/\d+$/, methods: ['PUT', 'DELETE'] },
            { pattern: /^\/admin\/orders\/event\/\d+\/available-dishes$/, methods: ['GET'] },
        ]
    }
}

// Функция для проверки точного совпадения маршрута
function matchExactRoute(path, method, routes) {
    for (const route of routes) {
        if (route.path === path && route.methods.includes(method)) {
            return true
        }
    }
    return false
}

// Функция для проверки по паттерну
function matchPatternRoute(path, method, patterns) {
    for (const item of patterns) {
        if (item.pattern.test(path) && item.methods.includes(method)) {
            return true
        }
    }
    return false
}

// Функция для определения типа маршрута
function getRouteType(path, method) {
    // Убираем query параметры
    const cleanPath = path.split('?')[0]

    // Проверяем публичные точные маршруты
    if (matchExactRoute(cleanPath, method, ROUTE_CONFIG.public.exactRoutes)) {
        return 'public'
    }

    // Проверяем публичные паттерны
    if (matchPatternRoute(cleanPath, method, ROUTE_CONFIG.public.patterns || [])) {
        return 'public'
    }

    // Проверяем админские точные маршруты
    if (matchExactRoute(cleanPath, method, ROUTE_CONFIG.admin.exactRoutes)) {
        return 'admin'
    }

    // Проверяем админские паттерны
    if (matchPatternRoute(cleanPath, method, ROUTE_CONFIG.admin.patterns)) {
        return 'admin'
    }

    // Если ничего не подошло - по умолчанию админский маршрут
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
    getRestaurants: () => api.get('/restaurants'),
    createBooking: (data) => api.post('/bookings', data),
    createEvent: (data) => api.post('/event-requests', data),
    getEventDishes: () => api.get('/menu/items/event-dishes'),
}