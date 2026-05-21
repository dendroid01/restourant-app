import Modal from '../Modal/Modal'

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (
        <Modal title="Подтверждение" onClose={onCancel} maxWidth={400}>
            <div className="confirm-box">
                <div className="confirm-icon">⚠️</div>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>{message}</p>
                <div className="confirm-actions">
                    <button className="btn-admin btn-admin-secondary" onClick={onCancel}>Отмена</button>
                    <button className="btn-admin btn-admin-danger" onClick={onConfirm}>Удалить</button>
                </div>
            </div>
        </Modal>
    )
}