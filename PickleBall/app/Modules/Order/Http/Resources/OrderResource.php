<?php

namespace App\Modules\Order\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_code' => $this->order_code,
            'user_id' => $this->user_id,
            'order_type' => $this->order_type,
            'subtotal' => (float) $this->subtotal,
            'discount' => (float) $this->discount,
            'total_amount' => (float) $this->total_amount,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'pickup_notes' => $this->pickup_notes,
            'items' => $this->items ? $this->items->map(fn ($item) => [
                'id' => $item->id,
                'item_type' => $item->item_type,
                'reference_id' => $item->reference_id,
                'item_name' => $item->item_name,
                'item_sku' => $item->item_sku,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'total_price' => (float) $item->total_price,
                'metadata' => $item->metadata,
            ]) : [],
            'payment' => $this->whenLoaded('payment', fn () => [
                'gateway' => $this->payment->gateway,
                'amount' => (float) $this->payment->amount,
                'status' => $this->payment->status,
                'gateway_response' => $this->payment->gateway_response,
                'paid_at' => $this->payment->paid_at?->toISOString(),
            ]),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
