<?php

namespace App\Modules\Shop\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryTransaction extends Model
{
    use HasFactory;

    protected $connection = 'shop';

    protected $fillable = [
        'variant_id',
        'type',
        'quantity',
        'stock_after',
        'reference_type',
        'reference_id',
        'performed_by',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'stock_after' => 'integer',
    ];

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}
