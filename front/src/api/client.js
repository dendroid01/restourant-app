const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

async function request(path, options = {}) {
    const token = localStorage.getItem('admin_token')
    const res = await fetch(`${BASE}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept':       'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...options,
    })

    if (res.status === 401) {
        localStorage.removeItem('admin_token')
        window.location.href = '/admin/login'
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw Object.assign(new Error(body.message ?? 'Ошибка сервера'), { status: res.status, body })
    }

    return res.status === 204 ? null : res.json()
}

export const api = {
    get:    (path)         => request(path),
    post:   (path, data)   => request(path, { method: 'POST',   body: JSON.stringify(data) }),
    patch:  (path, data)   => request(path, { method: 'PATCH',  body: JSON.stringify(data) }),
    put:    (path, data)   => request(path, { method: 'PUT',    body: JSON.stringify(data) }),
    delete: (path)         => request(path, { method: 'DELETE' }),
}