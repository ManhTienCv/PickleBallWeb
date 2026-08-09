<?php

namespace App\Modules\Booking\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TimeSlotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'court_id' => $this->court_id,
            'date' => $this->date ? $this->date->format('Y-m-d') : null,
            'start_time' => substr($this->start_time, 0, 5),
            'end_time' => substr($this->end_time, 0, 5),
            'price' => (float) $this->price,
            'status' => $this->status,
            'court' => new CourtResource($this->whenLoaded('court')),
        ];
    }
}
