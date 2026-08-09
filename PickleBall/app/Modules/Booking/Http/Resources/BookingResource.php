<?php

namespace App\Modules\Booking\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_code' => $this->booking_code,
            'user_id' => $this->user_id,
            'unified_order_id' => $this->unified_order_id,
            'total_amount' => (float) $this->total_amount,
            'status' => $this->status,
            'notes' => $this->notes,
            'qr_token' => $this->qr_token,
            'cancellation_fee' => (float) $this->cancellation_fee,
            'items' => $this->items ? $this->items->map(fn ($item) => [
                'id' => $item->id,
                'slot_id' => $item->slot_id,
                'court_id' => $item->court_id,
                'court_name' => $item->court?->name,
                'date' => $item->date ? $item->date->format('Y-m-d') : null,
                'start_time' => substr($item->start_time, 0, 5),
                'end_time' => substr($item->end_time, 0, 5),
                'price' => (float) $item->price,
            ]) : [],
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
