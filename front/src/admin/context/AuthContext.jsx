import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api } from '../../api/client'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [token, setToken] = useState(() => localStorage.getItem('admin_token')) // Добавьте эту строку

    // Загрузка пользователя при монтировании
    useEffect(() => {
        const loadUser = async () => {
            const storedToken = localStorage.getItem('admin_token')
            if (!storedToken) {
                setLoading(false)
                return
            }

            try {
                const response = await api.get('/admin/me')
                setUser(response.user)
            } catch (error) {
                console.error('Failed to load user:', error)
                localStorage.removeItem('admin_token')
                setToken(null) // Добавьте
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        loadUser()
    }, [])

    const login = useCallback(async (email, password) => {
        try {
            await api.csrf()

            const response = await api.post('/admin/login', {
                email,
                password,
                device_name: 'web'
            })

            const { token: newToken, user: userData } = response

            // Сохраняем токен
            localStorage.setItem('admin_token', newToken)
            setToken(newToken) // Добавьте
            setUser(userData)

            return userData
        } catch (error) {
            if (error.body?.errors) {
                const firstError = Object.values(error.body.errors)[0]?.[0]
                throw new Error(firstError || 'Ошибка входа')
            }
            throw new Error(error.message || 'Неверный email или пароль')
        }
    }, [])

    const logout = useCallback(async () => {
        try {
            await api.post('/admin/logout')
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            localStorage.removeItem('admin_token')
            setToken(null) // Добавьте
            setUser(null)
        }
    }, [])

    return (
        <AuthContext.Provider value={{
            user,
            token, // Добавьте эту строку!
            login,
            logout,
            loading,
            isAdmin: user?.role === 'admin' || user?.is_admin === true
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}