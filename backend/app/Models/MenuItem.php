<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    protected $fillable = [
        'category_id', 'title_ru', 'title_en', 'description_ru', 'description_en',
        'price', 'image', 'is_featured', 'is_available_for_events', 'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_featured' => 'boolean',
        'is_available_for_events' => 'boolean',
        'is_active' => 'boolean'
    ];

    public function category() { return $this->belongsTo(MenuCategory::class, 'category_id'); }
    public function eventRequestItems() { return $this->hasMany(EventRequestItem::class); }

    public function scopeFeatured($query) { return $query->where('is_featured', true)->where('is_active', true); }
    public function scopeForEvents($query) { return $query->where('is_available_for_events', true)->where('is_active', true); }
}
