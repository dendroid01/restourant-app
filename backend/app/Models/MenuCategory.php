<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuCategory extends Model
{
    protected $fillable = [
        'parent_id', 'slug', 'title_ru', 'title_en', 'order', 'is_active'
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function parent() { return $this->belongsTo(MenuCategory::class, 'parent_id'); }
    public function children() { return $this->hasMany(MenuCategory::class, 'parent_id')->orderBy('order'); }
    public function items() { return $this->hasMany(MenuItem::class, 'category_id')->where('is_active', true); }

    public function scopeRoot($query) { return $query->whereNull('parent_id'); }
}
