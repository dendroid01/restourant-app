<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name_ru' => $this->name_ru,
            'address_ru' => $this->address_ru,
            'phone' => $this->phone,
            'hours_ru' => $this->hours_ru,
            'status' => $this->status,
            'status_label' => $this->status === 'active' ? 'Активен' : 'Скрыт',
            'order' => $this->order,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'galleries' => RestaurantGalleryResource::collection($this->whenLoaded('galleries')),
            'main_image' => $this->galleries->first()?->image_url,
        ];
    }
}
