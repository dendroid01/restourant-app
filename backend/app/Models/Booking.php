<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'restaurant_id', 'client_name', 'phone', 'email',
        'date', 'time', 'guests', 'wishes', 'status', 'admin_comment'
    ];

    protected $casts = ['date' => 'date', 'guests' => 'integer'];

    public function restaurant() { return $this->belongsTo(Restaurant::class); }

    public function scopeNew($query) { return $query->where('status', 'new'); }
}
