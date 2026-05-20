import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
    const { i18n } = useTranslation()
    const current = i18n.language?.startsWith('ru') ? 'ru' : 'en'

    const toggle = () => i18n.changeLanguage(current === 'ru' ? 'en' : 'ru')

    return (
        <button
            onClick={toggle}
            style={{
                background: 'none',
                border: '1px solid var(--gray-border)',
                borderRadius: '20px',
                padding: '4px 12px',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                transition: 'all 0.2s',
            }}
        >
            {current === 'ru' ? 'EN' : 'RU'}
        </button>
    )
}