<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = ['name', 'email', 'phone', 'message', 'is_read'];
    protected $casts = ['is_read' => 'boolean'];

    public function markAsRead() {
        $this->is_read = true;
        return $this->save();
    }
}
