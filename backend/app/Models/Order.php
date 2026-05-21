<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'type', 'client', 'phone', 'email', 'restaurant',
        'date', 'time', 'guests', 'wishes',
        'amount', 'dishes', 'status',
    ];

    protected $casts = [
        'dishes' => 'array',
        'date'   => 'date',
    ];

    public function getTypeLabelAttribute(): string
    {
        return $this->type === 'table' ? 'Бронирование столика' : 'Мероприятие';
    }

    protected $appends = ['type_label'];
}
