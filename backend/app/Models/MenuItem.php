<?php

// app/Models/MenuItem.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MenuItem extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'menu_category_id', 'title_ru', 'title_en',
        'description_ru', 'description_en',
        'price', 'image', 'featured', 'sort_order',
    ];

    protected $casts = [
        'featured' => 'boolean',
        'price' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(MenuCategory::class, 'menu_category_id');
    }
}
