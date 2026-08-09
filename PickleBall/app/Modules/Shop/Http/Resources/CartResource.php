<?php

namespace App\Modules\Shop\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = CartItemResource::collection($this->whenLoaded('items'));
        $totalAmount = $this->items ? $this->items->sum(fn ($i) => $i->unit_price * $i->quantity) : 0;

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'session_id' => $this->session_id,
            'total_amount' => (float) $totalAmount,
            'items_count' => $this->items ? $this->items->sum('quantity') : 0,
            'items' => $items,
        ];
    }
}
