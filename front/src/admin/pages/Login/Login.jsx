import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useForm, RULES } from '../../../shared/hooks/useForm'
import FormField from '../../../shared/components/FormField/FormField'
import { useState } from 'react'
import '../../styles/admin.css'

const INITIAL = { email: 'admin@example.com', password: 'qwerty123!' }

const SCHEMA = {
    email:    [RULES.required, RULES.email],
    password: [RULES.required, RULES.minLength(6)],
}

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname ?? '/admin'

    const [serverError, setServerError] = useState('')
    const [loading, setLoading] = useState(false)

    const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
        useForm(INITIAL, SCHEMA)

    const onValid = async (data) => {
        setServerError('')
        setLoading(true)
        try {
            await login(data.email, data.password)
            navigate(from, { replace: true })
        } catch (err) {
            setServerError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const field = (name, extra = {}) => ({
        name,
        value: values[name],
        error: errors[name],
        touched: touched[name],
        onChange: handleChange,
        onBlur: handleBlur,
        adminStyle: true,
        ...extra,
    })

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

                {serverError && <div className="login-error">⚠️ {serverError}</div>}

                <form onSubmit={handleSubmit(onValid)} noValidate>
                    <FormField
                        {...field('email')}
                        label="Email"
                        type="email"
                        placeholder="admin@example.com"
                        required
                        autoFocus
                    />
                    <FormField
                        {...field('password')}
                        label="Пароль"
                        type="password"
                        placeholder="••••••"
                        required
                    />
                    <button
                        type="submit"
                        className="btn-admin btn-admin-primary"
                        style={{ width: '100%', marginTop: 8, padding: '12px 24px', fontSize: 15 }}
                        disabled={loading}
                    >
                        {loading ? 'Входим...' : 'Войти в систему'}
                    </button>
                </form>

                <div style={{ marginTop: 24, padding: 14, background: 'var(--bg-light)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <strong>Тестовые данные:</strong><br />
                    admin@example.com / qwerty123!
                    manager@example.com / qwerty123!
                </div>
            </div>
        </div>
    )
}