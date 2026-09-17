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

        $isToday = ($date === Carbon::today()->format('Y-m-d'));
        $now = Carbon::now();
        $cutoffThreshold = $now->copy()->addMinutes(30);

        $activeSessions = $isToday
            ? \App\Modules\Booking\Models\CourtSession::where('status', 'in_progress')->get()->keyBy('court_id')
            : collect();

        $slots = $query->orderBy('court_id')->orderBy('start_time')->get()->map(function ($slot) use ($isToday, $cutoffThreshold, $now, $activeSessions) {
            if ($isToday) {
                $slotStartTime = Carbon::createFromTimeString($slot->start_time);
                if ($slotStartTime->lessThanOrEqualTo($cutoffThreshold)) {
                    $slot->is_cut_off = true;
                }

                // If this court currently has an active in_progress session covering now
                if ($activeSessions->has($slot->court_id)) {
                    $slotEndTime = Carbon::createFromTimeString($slot->end_time);
                    if ($now->greaterThanOrEqualTo($slotStartTime->copy()->subMinutes(15)) && $now->lessThanOrEqualTo($slotEndTime)) {
                        $slot->status = 'in_use';
                    }
                }
            }
            return $slot;
        });

        return $this->success(TimeSlotResource::collection($slots), 'Danh sách khung giờ.');
    }
}
