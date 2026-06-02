<?php

namespace App\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $lang = $request->get('lang', 'ru');

        return [
            'id' => $this['id'],
            'slug' => $this['slug'],
            'title' => $lang === 'ru' ? $this['title_ru'] : ($this['title_en'] ?? $this['title_ru']),
            'items' => $this['items'],
            'children' => $this['children'],
        ];
    }
}
