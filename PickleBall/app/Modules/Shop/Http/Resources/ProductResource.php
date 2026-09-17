<?php

namespace App\Modules\Shop\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $variants = $this->whenLoaded('variants');
        $inStock = true;
        if ($this->relationLoaded('variants')) {
            if ($this->variants->count() > 0) {
                $totalStock = $this->variants->sum(function ($v) {
                    return (int) ($v->stock_qty ?? $v->available_stock ?? $v->stock_quantity ?? 0);
                });
                $inStock = $totalStock > 0;
            } else {
                $inStock = true;
            }
        }

        $firstImage = is_array($this->images) && count($this->images) > 0
            ? $this->images[0]
            : 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600';

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'price' => (float) $this->base_price,
            'base_price' => (float) $this->base_price,
            'sale_price' => null,
            'image_url' => $firstImage,
            'images' => $this->images ?? [],
            'status' => $this->status,
            'is_featured' => (bool) $this->is_featured,
            'in_stock' => $inStock,
            'rating_avg' => round((float) ($this->reviews()->where('status', 'approved')->avg('rating') ?: 5.0), 1),
            'reviews_count' => (int) $this->reviews()->where('status', 'approved')->count(),
            'specifications' => $this->specifications ?? (object) [],
            'category' => new CategoryResource($this->whenLoaded('category')),
            'brand' => new BrandResource($this->whenLoaded('brand')),
            'variants' => ProductVariantResource::collection($variants),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
