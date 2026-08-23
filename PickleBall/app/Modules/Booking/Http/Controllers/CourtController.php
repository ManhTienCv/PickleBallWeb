<?php

namespace App\Modules\Booking\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Booking\Http\Resources\CourtResource;
use App\Modules\Booking\Models\Court;
use App\Modules\Shared\Traits\HasStandardResponse;
use Illuminate\Http\JsonResponse;

class CourtController extends Controller
{
    use HasStandardResponse;

    public function index(): JsonResponse
    {
        $courts = Court::where('status', 'active')->get();

        return $this->success(CourtResource::collection($courts), 'Danh sách sân Pickleball.');
    }

    public function show(int $id): JsonResponse
    {
        $court = Court::findOrFail($id);

        return $this->success(new CourtResource($court), 'Chi tiết sân Pickleball.');
    }
}
