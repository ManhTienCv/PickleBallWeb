<?php

namespace App\Modules\Booking\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckInLog extends Model
{
    use HasFactory;

    protected $connection = 'booking';
    protected $table = 'checkin_logs';

    protected $fillable = [
        'booking_id',
        'booking_code',
        'staff_id',
        'checkin_type',
        'items_served',
        'checked_in_at',
    ];

    protected $casts = [
        'items_served' => 'array',
        'checked_in_at' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
