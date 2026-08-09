<?php

namespace App\Modules\Shop\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductVariant extends Model
{
    use HasFactory;

    protected $connection = 'shop';

    protected $fillable = [
        'product_id',
        'sku',
        'color',
        'weight',
        'grip_size',
        'price_override',
        'stock_qty',
        'reserved_qty',
        'low_stock_threshold',
        'status',
    ];

    protected $casts = [
        'price_override' => 'decimal:2',
        'stock_qty' => 'integer',
        'reserved_qty' => 'integer',
        'low_stock_threshold' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function inventoryTransactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class, 'variant_id');
    }

    public function getEffectivePriceAttribute(): float
    {
        return (float) ($this->price_override ?? $this->product->base_price);
    }

    public function getAvailableStockAttribute(): int
    {
        return max(0, $this->stock_qty - $this->reserved_qty);
    }
}
