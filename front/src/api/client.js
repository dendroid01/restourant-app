const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

// Функция для получения CSRF cookie
async function getCsrfCookie() {
    const csrfUrl = 'http://localhost:8000/sanctum/csrf-cookie';
    const response = await fetch(csrfUrl, {
        method: 'GET',
        credentials: 'include', // Важно!
    })

    if (!response.ok) {
        throw new Error('Failed to fetch CSRF cookie')
    }
}

async function request(path, options = {}) {
    const token = localStorage.getItem('admin_token')

    const res = await fetch(`${BASE}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include', // Добавьте эту строку
        ...options,
    })

    if (res.status === 401) {
        localStorage.removeItem('admin_token')
        // Не делайте редирект, если страница логина уже открыта
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/admin/login'
        }
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw Object.assign(new Error(body.message ?? 'Ошибка сервера'), { status: res.status, body })
    }

    return res.status === 204 ? null : res.json()
}

export const api = {
    // Добавьте метод для получения CSRF токена
    csrf: () => getCsrfCookie(),
    get:    (path)         => request(path),
    post:   (path, data)   => request(path, { method: 'POST',   body: JSON.stringify(data) }),
    patch:  (path, data)   => request(path, { method: 'PATCH',  body: JSON.stringify(data) }),
    put:    (path, data)   => request(path, { method: 'PUT',    body: JSON.stringify(data) }),
    delete: (path)         => request(path, { method: 'DELETE' }),
}