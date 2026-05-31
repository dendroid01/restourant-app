<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    protected $fillable = [
        'author_id', 'title_ru', 'title_en', 'excerpt_ru', 'excerpt_en',
        'content_ru', 'content_en', 'image_thumb', 'image_full',
        'published_at', 'status', 'tags'
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'tags' => 'array',
        'status' => 'string'
    ];

    public function author() { return $this->belongsTo(User::class, 'author_id'); }

    public function scopePublished($query) {
        return $query->where('status', 'published')->whereNotNull('published_at');
    }

    protected static function booted()
    {
        static::creating(function ($news) {
            if ($news->status === 'published' && !$news->published_at) {
                $news->published_at = now();
            }
        });
    }
}
