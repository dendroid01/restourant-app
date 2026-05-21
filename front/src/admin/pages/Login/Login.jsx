import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/admin.css'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname ?? '/admin'

    const [email, setEmail] = useState('admin@example.com')
    const [password, setPassword] = useState('qwerty123!')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await new Promise(r => setTimeout(r, 400)) // имитация запроса
            login(email, password)
            navigate(from, { replace: true })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="admin-root admin-login-page">
            <div className="login-card">
                <div className="login-logo">✦ RESTORAN ADMIN</div>
                <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 400, textAlign: 'center', marginBottom: 8 }}>
                    Вход в панель
                </h1>
                <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
                    Введите email и пароль
                </p>

                {error && <div className="login-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="admin-form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            className="admin-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="admin-form-group">
                        <label>Пароль</label>
                        <input
                            type="password"
                            className="admin-input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-admin btn-admin-primary"
                        style={{ width: '100%', marginTop: 8, padding: '12px 24px', fontSize: 15 }}
                        disabled={loading}
                    >
                        {loading ? 'Входим...' : 'Войти в систему'}
                    </button>
                </form>

                <div style={{ marginTop: 24, padding: '14px', background: 'var(--bg-light)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <strong>Тестовые данные:</strong><br />
                    admin@example.com / qwerty123!<br />
                    manager@example.com / qwerty123!
                </div>
            </div>
        </div>
    )
}