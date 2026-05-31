<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'name', 'email', 'rating', 'text_ru', 'text_en',
        'ip_address', 'status', 'approved_at', 'approved_by'
    ];

    protected $casts = [
        'rating' => 'integer',
        'approved_at' => 'datetime'
    ];

    public function approver() { return $this->belongsTo(User::class, 'approved_by'); }

    public function scopeApproved($query) { return $query->where('status', 'approved'); }
    public function scopePending($query) { return $query->where('status', 'pending'); }

    public function approve($userId) {
        $this->status = 'approved';
        $this->approved_at = now();
        $this->approved_by = $userId;
        return $this->save();
    }

    public function reject() {
        $this->status = 'rejected';
        return $this->save();
    }
}
