<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'rating' => $this->rating,
            'rating_stars' => str_repeat('★', $this->rating) . str_repeat('☆', 5 - $this->rating),
            'text_ru' => $this->text_ru,
            'text_en' => $this->text_en,
            'date_ru' => $this->created_at?->format('d.m.Y'),
            'date_en' => $this->created_at?->format('F d, Y'),
            'status' => $this->status,
            'status_label' => $this->getStatusLabel(),
            'status_badge' => $this->getStatusBadge(),
            'approved_at' => $this->approved_at?->format('d.m.Y H:i'),
            'approved_by' => $this->whenLoaded('approver', function () {
                return [
                    'id' => $this->approver->id,
                    'name' => $this->approver->name,
                ];
            }),
            'ip_address' => $this->ip_address,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }

    private function getStatusLabel(): string
    {
        return match ($this->status) {
            'approved' => 'Одобрен',
            'rejected' => 'Отклонён',
            default => 'На проверке',
        };
    }

    private function getStatusBadge(): string
    {
        return match ($this->status) {
            'approved' => 'success',
            'rejected' => 'error',
            default => 'info',
        };
    }
}
