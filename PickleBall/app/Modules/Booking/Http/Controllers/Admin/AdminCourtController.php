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

        if (! in_array($newStatus, ['active', 'maintenance', 'inactive'])) {
            $newStatus = $court->status === 'active' ? 'maintenance' : 'active';
        }

        $court->status = $newStatus;
        $court->save();

        return $this->success(new CourtResource($court), "Đã cập nhật trạng thái sân {$court->name} thành {$newStatus}.");
    }

    public function liveStatus(): JsonResponse
    {
        $today = \Carbon\Carbon::today()->format('Y-m-d');
        $currentTimeStr = \Carbon\Carbon::now()->format('H:i:s');

        $courts = Court::with(['pricingRules'])->where('status', 'active')->get();
        $activeSessions = \App\Modules\Booking\Models\CourtSession::where('status', 'in_progress')->get()->keyBy('court_id');

        $upcomingSlots = \App\Modules\Booking\Models\TimeSlot::where('date', $today)
            ->whereIn('status', ['booked', 'held'])
            ->where('end_time', '>', $currentTimeStr)
            ->orderBy('start_time')
            ->get()
            ->groupBy('court_id');

        $result = $courts->map(function ($court) use ($activeSessions, $upcomingSlots) {
            /** @var \App\Modules\Booking\Models\CourtSession|null $activeSession */
            $activeSession = $activeSessions->get($court->id);
            $hourlyRate = (float) ($court->pricingRules->first()?->price ?? 140000);

            if ($activeSession) {
                $calc = $activeSession->calculateElapsedPrice();
                $isEnding = false;
                $expectedEndTime = null;

                if ($activeSession->expected_duration_minutes) {
                    $expectedEndTime = $activeSession->start_time->copy()->addMinutes($activeSession->expected_duration_minutes);
                    $remainingToExpected = \Carbon\Carbon::now()->diffInMinutes($expectedEndTime, false);
                    if ($remainingToExpected <= 15 && $remainingToExpected >= 0) {
                        $isEnding = true;
                    }
                }

                return [
                    'id' => $court->id,
                    'name' => $court->name,
                    'code' => $court->code,
                    'surface_type' => $court->surface_type,
                    'status' => $isEnding ? 'ending' : 'in_use',
                    'status_label' => $isEnding ? 'SẮP HẾT GIỜ' : 'ĐANG CHƠI',
                    'session_id' => $activeSession->id,
                    'start_time' => $activeSession->start_time->format('H:i:s'),
                    'start_time_formatted' => $activeSession->start_time->format('H:i'),
                    'elapsed_minutes' => $calc['exact_minutes'],
                    'rounded_minutes' => $calc['rounded_minutes'],
                    'current_price' => $calc['total_price'],
                    'hourly_rate' => (float) $activeSession->hourly_rate,
                    'customer_name' => $activeSession->customer_name ?: 'Khách vãng lai',
                    'customer_phone' => $activeSession->customer_phone,
                    'expected_duration_minutes' => $activeSession->expected_duration_minutes,
                    'expected_end_time' => $expectedEndTime?->format('H:i'),
                ];
            }

            $courtSlots = $upcomingSlots->get($court->id, collect());
            $nextSlot = $courtSlots->first();

            $minutesUntilNext = null;
            $nextBookingTime = null;
            if ($nextSlot) {
                $slotStartCarbon = \Carbon\Carbon::createFromTimeString($nextSlot->start_time);
                $minutesUntilNext = max(0, \Carbon\Carbon::now()->diffInMinutes($slotStartCarbon, false));
                $nextBookingTime = substr($nextSlot->start_time, 0, 5);
            }

            return [
                'id' => $court->id,
                'name' => $court->name,
                'code' => $court->code,
                'surface_type' => $court->surface_type,
                'status' => 'available',
                'status_label' => 'TRỐNG',
                'session_id' => null,
                'hourly_rate' => $hourlyRate,
                'available_minutes_until_next' => $minutesUntilNext,
                'next_booking_time' => $nextBookingTime,
                'customer_name' => null,
                'customer_phone' => null,
            ];
        });

        return $this->success($result, 'Trạng thái trực tiếp của các sân.');
    }

    public function startSession(Request $request, int $id): JsonResponse
    {
        $court = Court::findOrFail($id);

        $active = \App\Modules\Booking\Models\CourtSession::where('court_id', $id)
            ->where('status', 'in_progress')
            ->first();

        if ($active) {
            throw new \App\Modules\Shared\Exceptions\ApiException("Sân {$court->name} hiện đang có người chơi.", 409);
        }

        $session = \App\Modules\Booking\Models\CourtSession::create([
            'court_id' => $id,
            'staff_id' => $request->user()?->id,
            'customer_name' => $request->input('customer_name', 'Khách vãng lai'),
            'customer_phone' => $request->input('customer_phone'),
            'start_time' => now(),
            'expected_duration_minutes' => $request->input('duration_minutes'),
            'hourly_rate' => $request->input('hourly_rate', 140000),
            'status' => 'in_progress',
            'booking_id' => $request->input('booking_id'),
            'notes' => $request->input('notes'),
        ]);

        $currentHour = now()->format('H:00:00');
        \App\Modules\Booking\Models\TimeSlot::where('court_id', $id)
            ->where('date', now()->format('Y-m-d'))
            ->where('start_time', $currentHour)
            ->where('status', 'available')
            ->update(['status' => 'locked']);

        return $this->created($session, "Đã bật giờ vào sân {$court->name} thành công.");
    }

    public function stopSession(Request $request, int $id): JsonResponse
    {
        $court = Court::findOrFail($id);

        $session = \App\Modules\Booking\Models\CourtSession::where('court_id', $id)
            ->where('status', 'in_progress')
            ->latest('id')
            ->first();

        if (! $session) {
            throw new \App\Modules\Shared\Exceptions\ApiException("Không tìm thấy phiên chơi đang hoạt động trên sân {$court->name}.", 404);
        }

        $calc = $session->calculateElapsedPrice();

        $session->update([
            'end_time' => now(),
            'duration_minutes' => $calc['rounded_minutes'],
            'total_price' => $calc['total_price'],
            'status' => 'completed',
        ]);

        return $this->success([
            'session' => $session,
            'court_name' => $court->name,
            'duration_minutes' => $calc['rounded_minutes'],
            'exact_minutes' => $calc['exact_minutes'],
            'total_price' => $calc['total_price'],
            'formatted_price' => number_format($calc['total_price'], 0, ',', '.') . 'đ',
            'time_range' => $session->start_time->format('H:i') . ' - ' . now()->format('H:i'),
        ], "Đã trả sân {$court->name}. Tổng tiền: " . number_format($calc['total_price'], 0, ',', '.') . 'đ');
    }
}
