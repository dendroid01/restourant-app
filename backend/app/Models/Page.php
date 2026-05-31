<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $fillable = [
        'slug', 'title', 'content', 'meta_title', 'meta_description',
        'is_system', 'status'
    ];

    protected $casts = ['is_system' => 'boolean'];

    public function getRouteKeyName() { return 'slug'; }
}
