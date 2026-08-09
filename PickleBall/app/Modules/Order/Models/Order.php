<?php

namespace App\Modules\Order\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    protected $connection = 'main';

    protected $fillable = [
        'order_code',
        'user_id',
        'idempotency_key',
        'order_type',
        'subtotal',
        'discount',
        'total_amount',
        'status',
        'payment_status',
        'pickup_notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function sagaLogs(): HasMany
    {
        return $this->hasMany(OrderSagaLog::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}
