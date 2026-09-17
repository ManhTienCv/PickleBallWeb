<?php

namespace App\Modules\Booking\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourtSession extends Model
{
    use HasFactory;

    protected $connection = 'booking';

    protected $fillable = [
        'court_id',
        'staff_id',
        'customer_name',
        'customer_phone',
        'start_time',
        'end_time',
        'duration_minutes',
        'expected_duration_minutes',
        'hourly_rate',
        'total_price',
        'status',
        'booking_id',
        'notes',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'hourly_rate' => 'decimal:2',
        'total_price' => 'decimal:2',
        'duration_minutes' => 'integer',
        'expected_duration_minutes' => 'integer',
    ];

    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    /**
     * Calculate price based on actual elapsed minutes with 15-minute block rounding.
     */
    public function calculateElapsedPrice(?Carbon $currentTime = null): array
    {
        $now = $currentTime ?? now();
        $exactMinutes = max(1, $this->start_time->diffInMinutes($now));

        // Block 15-minute rounding policy
        $roundedMinutes = max(15, (int) (ceil($exactMinutes / 15) * 15));
        $calculatedPrice = round(($roundedMinutes / 60) * (float) $this->hourly_rate, 0);

        return [
            'exact_minutes' => $exactMinutes,
            'rounded_minutes' => $roundedMinutes,
            'total_price' => (float) $calculatedPrice,
        ];
    }
}
