<?php

namespace App\Modules\Booking\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Booking\Http\Resources\CourtResource;
use App\Modules\Booking\Models\Court;
use App\Modules\Shared\Traits\HasStandardResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCourtController extends Controller
{
    use HasStandardResponse;

    public function index(): JsonResponse
    {
        $courts = Court::with('pricingRules')->get();
        return $this->success(CourtResource::collection($courts), 'Danh sách sân admin.');
    }

    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $court = Court::findOrFail($id);
        $newStatus = $request->input('status');

        if (!in_array($newStatus, ['active', 'maintenance', 'inactive'])) {
            $newStatus = $court->status === 'active' ? 'maintenance' : 'active';
        }

        $court->status = $newStatus;
        $court->save();

        return $this->success(new CourtResource($court), "Đã cập nhật trạng thái sân {$court->name} thành {$newStatus}.");
    }
}
