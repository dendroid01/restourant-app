<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NewsListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title_ru' => $this->title_ru,
            'title_en' => $this->title_en,
            'excerpt_ru' => $this->excerpt_ru,
            'excerpt_en' => $this->excerpt_en,
            'image_thumb' => $this->image_thumb,
            'published_at_formatted' => $this->published_at?->format('d.m.Y'),
            'status' => $this->status,
            'status_label' => $this->status === 'published' ? 'Опубликовано' : 'Черновик',
            'tags_string' => is_array($this->tags) ? implode(', ', $this->tags) : '',
        ];
    }
}
