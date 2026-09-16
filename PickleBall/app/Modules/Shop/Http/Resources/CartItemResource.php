<?php

namespace App\Modules\Shop\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $product = $this->variant?->product;

        return [
            'id' => $this->id,
            'item_type' => $this->item_type,
            'variant_id' => $this->variant_id,
            'product_variant_id' => $this->variant_id,
            'slot_id' => $this->slot_id,
            'quantity' => $this->quantity,
            'unit_price' => (float) $this->unit_price,
            'subtotal' => (float) ($this->unit_price * $this->quantity),
            'total_price' => (float) ($this->unit_price * $this->quantity),
            'metadata' => $this->metadata,
            'variant' => new ProductVariantResource($this->whenLoaded('variant')),
            'product' => $product ? new ProductResource($product) : null,
        ];
    }
}
