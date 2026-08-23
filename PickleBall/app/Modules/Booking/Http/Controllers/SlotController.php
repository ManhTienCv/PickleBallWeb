<?php

namespace App\Modules\Booking\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Booking\Http\Resources\TimeSlotResource;
use App\Modules\Booking\Models\TimeSlot;
use App\Modules\Booking\Services\HoldService;
use App\Modules\Shared\Traits\HasStandardResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SlotController extends Controller
{
    use HasStandardResponse;

    public function __construct(protected HoldService $holdService) {}

    public function index(Request $request): JsonResponse
    {
        // Clean expired holds before querying
        $this->holdService->cleanExpiredHolds();

        $date = $request->input('date', Carbon::today()->format('Y-m-d'));
        $courtId = $request->input('court_id');

        $query = TimeSlot::with('court')
            ->where('date', $date);

        if ($courtId) {
            $query->where('court_id', $courtId);
        }

        $slots = $query->orderBy('court_id')->orderBy('start_time')->get();

        return $this->success(TimeSlotResource::collection($slots), 'Danh sách khung giờ.');
    }
}
