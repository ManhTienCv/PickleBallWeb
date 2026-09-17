<?php

namespace App\Modules\Shop\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductReview extends Model
{
    use HasFactory;

    protected $connection = 'shop';

    protected $fillable = [
        'product_id',
        'user_id',
        'order_id',
        'user_name',
        'user_avatar',
        'rating',
        'comment',
        'images',
        'variant_purchased',
        'is_verified_purchase',
        'likes',
        'status',
    ];

    protected $casts = [
        'rating' => 'integer',
        'images' => 'array',
        'is_verified_purchase' => 'boolean',
        'likes' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }
}
