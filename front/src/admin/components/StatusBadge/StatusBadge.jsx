const MAP = {
    published:   { cls: 'badge-success', label: 'Опубликовано' },
    draft:       { cls: 'badge-neutral', label: 'Черновик' },
    active:      { cls: 'badge-success', label: 'Активен' },
    inactive:    { cls: 'badge-neutral', label: 'Скрыт' },
    new:         { cls: 'badge-info',    label: 'Новая' },
    processing:  { cls: 'badge-warning', label: 'В обработке' },
    confirmed:   { cls: 'badge-success', label: 'Подтверждена' },
    cancelled:   { cls: 'badge-error',   label: 'Отменена' },
    approved:    { cls: 'badge-success', label: 'Одобрен' },
    pending:     { cls: 'badge-info',    label: 'На проверке' },
    rejected:    { cls: 'badge-error',   label: 'Отклонён' },
    blocked:     { cls: 'badge-error',   label: 'Заблокирован' },
}

export default function StatusBadge({ status, customLabel }) {
    const cfg = MAP[status] ?? { cls: 'badge-neutral', label: status }
    return (
        <span className={`badge ${cfg.cls}`}>{customLabel ?? cfg.label}</span>
    )
}