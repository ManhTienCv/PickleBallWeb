<?php

namespace App\Modules\Booking\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HoldResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slot_id' => $this->slot_id,
            'user_id' => $this->user_id,
            'session_id' => $this->session_id,
            'expires_at' => $this->expires_at?->toISOString(),
            'remaining_seconds' => $this->expires_at ? max(0, now()->diffInSeconds($this->expires_at, false)) : 0,
            'status' => $this->status,
            'slot' => new TimeSlotResource($this->whenLoaded('slot')),
        ];
    }
}
