<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuCategoryFlatResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this['id'],
            'title' => $this['title'],
            'title_ru' => $this['title_ru'],
            'depth' => $this['depth'],
            'parent_id' => $this['parent_id'],
        ];
    }
}
