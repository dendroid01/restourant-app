<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class News extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title_ru', 'title_en',
        'excerpt_ru', 'excerpt_en',
        'content_ru', 'content_en',
        'date_ru', 'date_en',
        'image', 'image_thumb',
        'tags', 'status',
    ];

    protected $casts = [
        'tags' => 'array',
    ];
}
