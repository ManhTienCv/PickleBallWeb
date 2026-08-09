<?php

namespace App\Modules\Booking\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourtResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'location' => $this->location,
            'surface_type' => $this->surface_type,
            'status' => $this->status,
            'amenities' => $this->amenities ?? [],
            'image_url' => $this->image_url,
        ];
    }
}
