<?php

namespace App\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicMenuItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $lang = $request->get('lang', 'ru');

        return [
            'id' => $this['id'],
            'category_id' => $this['category_id'],
            'title' => $lang === 'ru' ? $this['title_ru'] : ($this['title_en'] ?? $this['title_ru']),
            'description' => $lang === 'ru' ? $this['description_ru'] : ($this['description_en'] ?? $this['description_ru']),
            'price' => $this['price'],
            'price_formatted' => number_format($this['price'], 0, ',', ' ') . ' ₽',
            'image' => $this['image'],
            'is_featured' => $this['is_featured'],
        ];
    }
}
