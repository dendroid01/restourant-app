<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuItemListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title_ru' => $this->title_ru,
            'title_en' => $this->title_en,
            'description_ru' => $this->description_ru ? strip_tags($this->description_ru) : null,
            'price' => (float) $this->price,
            'price_formatted' => number_format($this->price, 0, ',', ' ') . ' ₽',
            'image' => $this->image,
            'is_featured' => (bool) $this->is_featured,
            'is_active' => (bool) $this->is_active,
            'order' => $this->order,
            'category_id' => $this->category_id,
            'category_name' => $this->category?->title_ru,
        ];
    }
}
