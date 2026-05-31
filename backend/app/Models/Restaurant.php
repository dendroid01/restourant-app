<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    protected $fillable = [
        'name_ru', 'name_en', 'description_ru', 'description_en',
        'address_ru', 'address_en', 'phone', 'hours_ru', 'hours_en',
        'lat', 'lng', 'order', 'status'
    ];

    protected $casts = [
        'status' => 'string',
        'lat' => 'decimal:8',
        'lng' => 'decimal:8'
    ];

    public function galleries() { return $this->hasMany(RestaurantGallery::class)->orderBy('order'); }
    public function bookings() { return $this->hasMany(Booking::class); }
    public function eventRequests() { return $this->hasMany(EventRequest::class); }

    public function getMainImageAttribute() {
        return $this->galleries->first()?->image_url ?? null;
    }

    public function scopeActive($query) {
        return $query->where('status', 'active');
    }
}
