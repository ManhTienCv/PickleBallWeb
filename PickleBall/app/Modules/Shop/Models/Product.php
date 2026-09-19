<?php

namespace App\Modules\Shop\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $connection = 'shop';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'short_description',
        'brand_id',
        'category_id',
        'base_price',
        'status',
        'is_featured',
        'images',
        'specifications',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'is_featured' => 'boolean',
        'images' => 'array',
        'specifications' => 'array',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }
}

