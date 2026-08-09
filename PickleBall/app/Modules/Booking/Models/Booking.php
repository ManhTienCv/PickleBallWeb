<?php

namespace App\Modules\Booking\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    use HasFactory;

    protected $connection = 'booking';

    protected $fillable = [
        'booking_code',
        'user_id',
        'unified_order_id',
        'total_amount',
        'status',
        'notes',
        'qr_token',
        'cancellation_fee',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'cancellation_fee' => 'decimal:2',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(BookingItem::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(BookingStatusHistory::class);
    }

    public function checkinLogs(): HasMany
    {
        return $this->hasMany(CheckInLog::class);
    }
}
