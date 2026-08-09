<?php

namespace App\Modules\Shop\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $optionValue = array_filter([$this->color, $this->weight, $this->grip_size]);
        $optionStr = count($optionValue) > 0 ? implode(' - ', $optionValue) : 'Tiêu chuẩn';

        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'sku' => $this->sku,
            'color' => $this->color,
            'weight' => $this->weight,
            'grip_size' => $this->grip_size,
            'option_name' => 'Phiên bản',
            'option_value' => $optionStr,
            'price' => (float) $this->effective_price,
            'price_override' => $this->price_override ? (float) $this->price_override : null,
            'stock_qty' => $this->stock_qty,
            'stock_quantity' => $this->available_stock,
            'available_stock' => $this->available_stock,
            'status' => $this->status,
        ];
    }
}
