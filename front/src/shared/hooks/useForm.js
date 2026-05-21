import {useState, useCallback} from 'react'
import i18n from 'i18next'

const getTranslation = (key, params = {}) => {
    return i18n.t(`validation.${key}`, params)
}

// ─── Правила валидации ───────────────────────────────────────────────
export const RULES = {
    required: (v) => {
        const isValid = String(v ?? '').trim().length > 0
        return isValid ? null : getTranslation('required')
    },

    email: (v) => {
        if (!v) return null
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
        return re.test(String(v).trim())
            ? null
            : getTranslation('email')
    },

    phone: (v) => {
        if (!v) return null
        const valid = /^(\+7|8|7)\d{10}$/.test(String(v).replace(/[\s\-\(\)]/g, ''))
        return valid ? null : getTranslation('phone')
    },

    minLength: (min) => (v) => {
        const isValid = String(v ?? '').length >= min
        return isValid ? null : getTranslation('minLength', {min})
    },

    maxLength: (max) => (v) => {
        const isValid = String(v ?? '').length <= max
        return isValid ? null : getTranslation('maxLength', {max})
    },

    min: (minVal) => (v) => {
        const isValid = Number(v) >= minVal
        return isValid ? null : getTranslation('min', {min: minVal})
    },

    max: (maxVal) => (v) => {
        const isValid = Number(v) <= maxVal
        return isValid ? null : getTranslation('max', {max: maxVal})
    },

    fullName: (v) => {
        if (!v) return getTranslation('required')
        const trimmed = String(v).trim()
        const words = trimmed.split(/\s+/).filter(w => w.length > 0)

        // Проверяем: минимум 2 слова, каждое минимум 2 символа
        if (words.length < 2) {
            return getTranslation('fullName.two_words')
        }

        if (words.some(word => word.length < 2)) {
            return getTranslation('fullName.min_chars')
        }

        // Проверка на допустимые символы (буквы, пробелы, дефисы, точки)
        const validPattern = /^[a-zA-Zа-яА-ЯёЁ\s\-\.]+$/
        if (!validPattern.test(trimmed)) {
            return getTranslation('fullName.invalid_chars')
        }

        return null
    },
}

// ─── Маска телефона ──────────────────────────────────────────────────
// Принимает сырой ввод, возвращает строку вида +7 (9XX) XXX-XX-XX
export function applyPhoneMask(raw) {
    // Оставляем только цифры
    let digits = raw.replace(/\D/g, '')

    // Если начинается с 8 или 7 — заменяем на 7
    if (digits.startsWith('8') || digits.startsWith('7')) {
        digits = '7' + digits.slice(1)
    } else if (digits.length > 0) {
        digits = '7' + digits
    }

    // Обрезаем до 11 цифр
    digits = digits.slice(0, 11)

    // Форматируем
    const d = digits
    let result = ''
    if (d.length > 0) result = '+' + d[0]
    if (d.length > 1) result += ' (' + d.slice(1, 4)
    if (d.length >= 4) result += ') ' + d.slice(4, 7)
    if (d.length >= 7) result += '-' + d.slice(7, 9)
    if (d.length >= 9) result += '-' + d.slice(9, 11)

    return result
}

// ─── Основной хук ────────────────────────────────────────────────────
/**
 * @param {Object} initialValues  — начальные значения { fieldName: value }
 * @param {Object} validationSchema — схема { fieldName: [rule1, rule2, ...] }
 *
 * Правила — функции (value) => string|null
 * Используйте RULES.required, RULES.email, RULES.phone и т.д.
 */
export function useForm(initialValues, validationSchema = {}) {
    const [values, setValues] = useState(initialValues)
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})
    const [submitted, setSubmitted] = useState(false)

    // Валидация одного поля
    const validateField = useCallback(
        (name, value) => {
            const rules = validationSchema[name] ?? []
            for (const rule of rules) {
                const error = rule(value)
                if (error) return error
            }
            return null
        },
        [validationSchema]
    )

    // Валидация всей формы, возвращает объект ошибок
    const validateAll = useCallback(() => {
        const newErrors = {}
        for (const name of Object.keys(validationSchema)) {
            const error = validateField(name, values[name])
            if (error) newErrors[name] = error
        }
        return newErrors
    }, [values, validationSchema, validateField])

    // onChange с маской для телефона и live-валидацией тронутых полей
    const handleChange = useCallback(
        (e) => {
            const {name, value, type, checked} = e.target
            let nextValue = type === 'checkbox' ? checked : value

            // Автоматическая маска для полей с именем phone/телефон
            if (name === 'phone') {
                nextValue = applyPhoneMask(value)
            }

            setValues((prev) => ({...prev, [name]: nextValue}))

            // Перевалидируем, только если поле уже было тронуто или форма сабмитилась
            if (touched[name] || submitted) {
                const error = validateField(name, nextValue)
                setErrors((prev) => ({...prev, [name]: error}))
            }
        },
        [touched, submitted, validateField]
    )

    // onBlur — помечаем поле тронутым и сразу валидируем
    const handleBlur = useCallback(
        (e) => {
            const {name, value} = e.target
            setTouched((prev) => ({...prev, [name]: true}))
            const error = validateField(name, value)
            setErrors((prev) => ({...prev, [name]: error}))
        },
        [validateField]
    )

    // Для чекбоксов и select — ручная установка значения
    const setValue = useCallback((name, value) => {
        setValues((prev) => ({...prev, [name]: value}))
        if (touched[name] || submitted) {
            const error = validateField(name, value)
            setErrors((prev) => ({...prev, [name]: error}))
        }
    }, [touched, submitted, validateField])

    // Вызывается в onSubmit
    const handleSubmit = useCallback(
        (onValid) => (e) => {
            e.preventDefault()
            setSubmitted(true)

            const allErrors = validateAll()
            // Помечаем все поля тронутыми
            const allTouched = Object.keys(validationSchema).reduce(
                (acc, k) => ({...acc, [k]: true}),
                {}
            )
            setTouched(allTouched)
            setErrors(allErrors)

            if (Object.keys(allErrors).length === 0) {
                onValid(values)
            }
        },
        [values, validateAll, validationSchema]
    )

    const reset = useCallback(() => {
        setValues(initialValues)
        setErrors({})
        setTouched({})
        setSubmitted(false)
    }, [initialValues])

    // Есть ли ошибки в форме прямо сейчас
    const isValid = Object.keys(validateAll()).length === 0

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setValue,
        reset,
        isValid,
    }
}