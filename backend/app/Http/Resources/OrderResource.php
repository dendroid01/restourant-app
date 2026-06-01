<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $statusLabels = [
            'new' => ['label' => 'Новая', 'badge' => 'info'],
            'processing' => ['label' => 'В обработке', 'badge' => 'warning'],
            'confirmed' => ['label' => 'Подтверждена', 'badge' => 'success'],
            'cancelled' => ['label' => 'Отменена', 'badge' => 'error'],
        ];

        $statusInfo = $statusLabels[$this['status']] ?? ['label' => $this['status'], 'badge' => 'neutral'];

        return [
            'id' => $this['id'],
            'original_id' => $this['original_id'],
            'type' => $this['type'],
            'type_label' => $this['type_label'],
            'type_icon' => $this['type_icon'] ?? ($this['type'] === 'booking' ? 'table' : 'event'),
            'client_name' => $this['client_name'],
            'phone' => $this['phone'],
            'email' => $this['email'],
            'restaurant_id' => $this['restaurant_id'],
            'restaurant_name' => $this['restaurant_name'],
            'date' => $this['date'],
            'time' => $this['time'] ?? null,
            'guests' => $this['guests'],
            'wishes' => $this['wishes'],
            'status' => $this['status'],
            'status_label' => $statusInfo['label'],
            'status_badge' => $statusInfo['badge'],
            'amount' => $this['amount'],
            'amount_formatted' => $this['amount'] ? number_format($this['amount'], 0, ',', ' ') . ' ₽' : null,
            'amount_per_person' => $this['amount_per_person'] ?? null,
            'amount_per_person_formatted' => isset($this['amount_per_person'])
                ? number_format($this['amount_per_person'], 0, ',', ' ') . ' ₽'
                : null,
            'admin_comment' => $this['admin_comment'] ?? null,
            'items' => $this['items'] ?? [],
            'created_at' => $this['created_at']?->toISOString(),
            'created_at_formatted' => $this['created_at']?->format('d.m.Y H:i'),
        ];
    }
}
