import { applyPhoneMask } from '../../hooks/useForm'

/**
 * @param {string}  name
 * @param {string}  label
 * @param {string}  type          — 'text' | 'email' | 'tel' | 'password' | 'date' | 'time' | 'number' | 'select' | 'textarea'
 * @param {*}       value
 * @param {string}  error
 * @param {boolean} touched
 * @param {fn}      onChange
 * @param {fn}      onBlur
 * @param {boolean} required
 * @param {string}  placeholder
 * @param {Array}   options       — для type='select': [{value, label}]
 * @param {number}  rows          — для textarea
 * @param {Object}  inputProps    — дополнительные props для input
 * @param {string}  className     — класс для обёртки
 * @param {boolean} adminStyle    — использовать классы admin-input или form-control
 */
export default function FormField({
                                      name,
                                      label,
                                      type = 'text',
                                      value,
                                      error,
                                      touched,
                                      onChange,
                                      onBlur,
                                      required,
                                      placeholder,
                                      options = [],
                                      rows = 3,
                                      inputProps = {},
                                      className = '',
                                      adminStyle = false,
                                  }) {
    const showError = !!error && touched
    const inputClass = adminStyle ? 'admin-input' : 'form-control'
    const errorClass = adminStyle ? 'admin-field-error' : 'field-error'

    const baseProps = {
        id: name,
        name,
        value: value ?? '',
        onChange,
        onBlur,
        required,
        placeholder,
        'aria-invalid': showError ? 'true' : undefined,
        'aria-describedby': showError ? `${name}-error` : undefined,
        style: showError
            ? { borderColor: 'var(--state-error)', boxShadow: '0 0 0 3px rgba(169,50,38,0.1)' }
            : undefined,
        ...inputProps,
    }

    const wrapStyle = `${adminStyle ? 'admin-form-group' : 'form-group'} ${className}`

    return (
        <div className={wrapStyle}>
            {label && (
                <label htmlFor={name} className={adminStyle ? '' : 'form-label'}>
                    {label}
                    {required && <span style={{ color: 'var(--state-error)', marginLeft: 3 }}>*</span>}
                </label>
            )}

            {type === 'select' ? (
                <select className={inputClass} {...baseProps}>
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            ) : type === 'textarea' ? (
                <textarea className={inputClass} rows={rows} {...baseProps} />
            ) : (
                <input
                    type={type}
                    className={inputClass}
                    {...baseProps}
                />
            )}

            {/* Inline-ошибка с плавным появлением */}
            <div
                id={`${name}-error`}
                role="alert"
                style={{
                    overflow: 'hidden',
                    maxHeight: showError ? '40px' : '0',
                    opacity: showError ? 1 : 0,
                    transition: 'max-height 0.2s ease, opacity 0.2s ease',
                    marginTop: showError ? 5 : 0,
                }}
            >
        <span
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                color: 'var(--state-error)',
            }}
        >
          <span>⚠</span>
            {error}
        </span>
            </div>
        </div>
    )
}