<?php

namespace App\Modules\Shop\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory;

    protected $connection = 'shop';

    protected $fillable = [
        'code',
        'title',
        'description',
        'discount_type',
        'discount_value',
        'max_discount',
        'min_order_amount',
        'usage_limit',
        'used_count',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'usage_limit' => 'integer',
        'used_count' => 'integer',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function isValidForAmount(float $amount): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->start_date && now()->lt($this->start_date)) {
            return false;
        }

        if ($this->end_date && now()->gt($this->end_date)) {
            return false;
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return false;
        }

        if ($amount < (float) $this->min_order_amount) {
            return false;
        }

        return true;
    }

    public function calculateDiscount(float $amount): float
    {
        if (!$this->isValidForAmount($amount)) {
            return 0;
        }

        if ($this->discount_type === 'percentage') {
            $discount = ($amount * (float) $this->discount_value) / 100;
            if ($this->max_discount !== null && $discount > (float) $this->max_discount) {
                $discount = (float) $this->max_discount;
            }
            return round($discount, 0);
        }

        return min($amount, (float) $this->discount_value);
    }
}
