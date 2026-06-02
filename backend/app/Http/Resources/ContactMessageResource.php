<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'message' => $this->message,
            'is_read' => (bool) $this->is_read,
            'status_label' => $this->is_read ? 'Прочитано' : 'Новое',
            'status_badge' => $this->is_read ? 'neutral' : 'info',
            'created_at' => $this->created_at?->toISOString(),
            'created_at_formatted' => $this->created_at?->format('d.m.Y H:i'),
        ];
    }
}
