<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NewsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title_ru' => $this->title_ru,
            'title_en' => $this->title_en,
            'excerpt_ru' => $this->excerpt_ru,
            'excerpt_en' => $this->excerpt_en,
            'content_ru' => $this->content_ru,
            'content_en' => $this->content_en,
            'image_thumb' => $this->image_thumb,
            'image_full' => $this->image_full,
            'published_at' => $this->published_at?->format('Y-m-d'),
            'published_at_formatted' => $this->published_at?->format('d.m.Y'),
            'status' => $this->status,
            'tags' => $this->tags,
            'tags_string' => is_array($this->tags) ? implode(', ', $this->tags) : '',
            'author' => $this->whenLoaded('author', function () {
                return [
                    'id' => $this->author->id,
                    'name' => $this->author->name,
                ];
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
