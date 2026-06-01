<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'slug' => $this->slug,
            'title_ru' => $this->title_ru,
            'title_en' => $this->title_en,
            'order' => $this->order,
            'is_active' => (bool) $this->is_active,
            'is_active_label' => $this->is_active ? 'Активна' : 'Скрыта',
            'items_count' => $this->items()->count(),
            'children' => MenuCategoryResource::collection($this->whenLoaded('children')),
            'parent' => $this->whenLoaded('parent', function () {
                return [
                    'id' => $this->parent->id,
                    'title_ru' => $this->parent->title_ru,
                ];
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
