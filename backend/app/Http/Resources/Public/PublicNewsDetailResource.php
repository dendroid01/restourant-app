<?php

namespace App\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicNewsDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $lang = $request->get('lang', 'ru');

        return [
            'id' => $this->id,
            'title' => $lang === 'ru' ? $this->title_ru : ($this->title_en ?? $this->title_ru),
            'content' => $lang === 'ru' ? $this->content_ru : ($this->content_en ?? $this->content_ru),
            'excerpt' => $lang === 'ru' ? $this->excerpt_ru : ($this->excerpt_en ?? $this->excerpt_ru),
            'image_thumb' => $this->image_thumb,
            'image_full' => $this->image_full ?? $this->image_thumb,
            'published_at' => $this->published_at?->format('Y-m-d'),
            'published_at_formatted' => $lang === 'ru'
                ? $this->published_at?->format('d.m.Y')
                : $this->published_at?->format('F d, Y'),
            'tags' => $this->tags ?? [],
            'author' => $this->author?->name,
        ];
    }
}
