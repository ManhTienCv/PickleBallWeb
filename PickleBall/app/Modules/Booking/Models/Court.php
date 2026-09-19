<?php

namespace App\Modules\Booking\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Court extends Model
{
    use HasFactory, SoftDeletes;

    protected $connection = 'booking';

    protected $fillable = [
        'name',
        'code',
        'description',
        'location',
        'surface_type',
        'status',
        'amenities',
        'image_url',
    ];

    protected $casts = [
        'amenities' => 'array',
    ];

    public function pricingRules(): HasMany
    {
        return $this->hasMany(CourtPricingRule::class);
    }

    public function timeSlots(): HasMany
    {
        return $this->hasMany(TimeSlot::class);
    }
}
