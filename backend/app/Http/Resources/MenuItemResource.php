<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'title_ru' => $this->category->title_ru,
                    'title_en' => $this->category->title_en,
                ];
            }),
            'title_ru' => $this->title_ru,
            'title_en' => $this->title_en,
            'description_ru' => $this->description_ru,
            'description_en' => $this->description_en,
            'price' => (float) $this->price,
            'price_formatted' => number_format($this->price, 0, ',', ' ') . ' ₽',
            'image' => $this->image,
            'order' => $this->order,
            'is_featured' => (bool) $this->is_featured,
            'is_active' => (bool) $this->is_active,
            'is_available_for_events' => (bool) $this->is_available_for_events,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
