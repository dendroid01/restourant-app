import { useEffect } from 'react'

export default function Modal({ title, onClose, children, maxWidth = 640 }) {
    useEffect(() => {
        const handler = e => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth }}>
                <div className="modal-header">
                    <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400 }}>{title}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                {children}
            </div>
        </div>
    )
}