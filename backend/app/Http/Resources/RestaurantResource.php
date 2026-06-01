<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name_ru' => $this->name_ru,
            'name_en' => $this->name_en,
            'description_ru' => $this->description_ru,
            'description_en' => $this->description_en,
            'address_ru' => $this->address_ru,
            'address_en' => $this->address_en,
            'phone' => $this->phone,
            'hours_ru' => $this->hours_ru,
            'hours_en' => $this->hours_en,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'order' => $this->order,
            'status' => $this->status,
            'status_label' => $this->status === 'active' ? 'Активен' : 'Скрыт',
            'main_image' => $this->galleries->first()?->image_url,
            'galleries' => RestaurantGalleryResource::collection($this->whenLoaded('galleries')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
