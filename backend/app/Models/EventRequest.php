<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventRequest extends Model
{
    protected $fillable = [
        'restaurant_id', 'client_name', 'phone', 'email',
        'date', 'guests', 'wishes', 'total_price_per_person',
        'total_price', 'status', 'admin_comment'
    ];

    protected $casts = [
        'date' => 'date',
        'total_price_per_person' => 'decimal:2',
        'total_price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
    public function items()
    {
        return $this->hasMany(EventRequestItem::class);
    }

    public function recalculateTotal()
    {
        $this->total_price = $this->items->sum(function ($item) {
                return $item->quantity * $item->menuItem->price;
            }) * $this->guests;

        $this->total_price_per_person = $this->items->sum(function ($item) {
            return $item->quantity * $item->menuItem->price;
        });

        return $this;
    }
}
