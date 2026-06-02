import { useAuth } from '../context/AuthContext'

export function usePermission(permission) {
    const { user } = useAuth()

    if (!user) return false
    if (user.role === 'admin') return true

    return user.permissions?.includes(permission) ?? false
}