<?php

namespace App\Modules\Booking\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourtPricingRule extends Model
{
    use HasFactory;

    protected $connection = 'booking';

    protected $fillable = [
        'court_id',
        'day_type',
        'start_time',
        'end_time',
        'price',
        'label',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }
}
