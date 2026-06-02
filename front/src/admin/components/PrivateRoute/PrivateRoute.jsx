import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PrivateRoute({ children, requiredPermission }) {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: '100%',
                backgroundColor: '#f5f5f5'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <style>
                    {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}
                </style>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />
    }

    // Проверка на конкретное право
    if (requiredPermission) {
        const hasAccess = user.role === 'admin' || user.permissions?.includes(requiredPermission)

        if (!hasAccess) {
            return <Navigate to="/admin" replace />
        }
    }

    return children
}