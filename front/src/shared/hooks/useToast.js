import toast from 'react-hot-toast'

const BASE = {
    duration: 3500,
    style: {
        fontFamily: "'Inter', sans-serif",
        fontSize: '14px',
        borderRadius: '10px',
        padding: '12px 16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    },
}

export function useToast() {
    return {
        success: (msg) =>
            toast.success(msg, {
                ...BASE,
                style: {
                    ...BASE.style,
                    background: '#fff',
                    color: '#1A1212',
                    border: '1px solid rgba(57,115,57,0.25)',
                },
                iconTheme: { primary: '#397339', secondary: '#fff' },
            }),

        error: (msg) =>
            toast.error(msg, {
                ...BASE,
                style: {
                    ...BASE.style,
                    background: '#fff',
                    color: '#1A1212',
                    border: '1px solid rgba(169,50,38,0.25)',
                },
                iconTheme: { primary: '#A93226', secondary: '#fff' },
            }),

        info: (msg) =>
            toast(msg, {
                ...BASE,
                icon: 'ℹ️',
                style: {
                    ...BASE.style,
                    background: '#fff',
                    color: '#1A1212',
                    border: '1px solid rgba(36,104,170,0.25)',
                },
            }),

        loading: (msg) =>
            toast.loading(msg, {
                ...BASE,
                style: { ...BASE.style, background: '#fff', color: '#1A1212' },
            }),

        dismiss: toast.dismiss,
    }
}