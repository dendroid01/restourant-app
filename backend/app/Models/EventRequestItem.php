<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventRequestItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_request_id',
        'menu_item_id',
        'quantity'
    ];

    protected $casts = [
        'quantity' => 'integer'
    ];

    /**
     * Связь: позиция принадлежит заявке на мероприятие
     */
    public function eventRequest()
    {
        return $this->belongsTo(EventRequest::class);
    }

    /**
     * Связь: позиция принадлежит блюду из меню
     */
    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }
}
