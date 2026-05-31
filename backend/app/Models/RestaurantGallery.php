<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RestaurantGallery extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'image_url',
        'order'
    ];

    protected $casts = [
        'order' => 'integer'
    ];

    /**
     * Связь: галерея принадлежит ресторану
     */
    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}
