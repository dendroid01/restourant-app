<?php

namespace App\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicRestaurantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $lang = $request->get('lang', 'ru');

        // Получаем URL галереи
        $galleries = [];
        if ($this->relationLoaded('galleries') && $this->galleries) {
            $galleries = $this->galleries->map(fn($g) => $g->image_url)->values()->toArray();
        }

        return [
            'id' => $this->id,
            'name' => $lang === 'ru' ? $this->name_ru : ($this->name_en ?? $this->name_ru),
            'description' => $lang === 'ru' ? $this->description_ru : ($this->description_en ?? $this->description_ru),
            'address' => $lang === 'ru' ? $this->address_ru : ($this->address_en ?? $this->address_ru),
            'phone' => $this->phone,
            'hours' => $lang === 'ru' ? $this->hours_ru : ($this->hours_en ?? $this->hours_ru),
            'lat' => $this->lat,
            'lng' => $this->lng,
            'main_image' => $this->galleries->first()?->image_url,
            'galleries' => $galleries,
        ];
    }
}
