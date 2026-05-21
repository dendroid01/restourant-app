import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

// Мок-учётные данные
const MOCK_USERS = [
    { email: 'admin@example.com', password: 'qwerty123!', role: 'admin', name: 'Администратор' },
    { email: 'manager@example.com', password: 'qwerty123!', role: 'manager', name: 'Менеджер' },
]

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('admin_user')
            return saved ? JSON.parse(saved) : null
        } catch {
            return null
        }
    })

    const login = useCallback((email, password) => {
        const found = MOCK_USERS.find(
            u => u.email === email && u.password === password
        )
        if (!found) throw new Error('Неверный email или пароль')
        const { password: _, ...safeUser } = found
        localStorage.setItem('admin_user', JSON.stringify(safeUser))
        setUser(safeUser)
        return safeUser
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('admin_user')
        setUser(null)
    }, [])

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be inside AuthProvider')
    return ctx
}