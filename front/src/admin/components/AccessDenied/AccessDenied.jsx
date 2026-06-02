export default function AccessDenied({ section }) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">🔒</div>
            <p>У вас нет доступа к разделу "{section}"</p>
            <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
                Обратитесь к администратору для получения прав
            </p>
        </div>
    )
}