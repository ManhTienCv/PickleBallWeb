<?php

namespace App\Modules\Booking\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Booking\Http\Requests\CheckInScanRequest;
use App\Modules\Booking\Http\Resources\BookingResource;
use App\Modules\Booking\Models\Booking;
use App\Modules\Booking\Models\CheckInLog;
use App\Modules\Shared\Exceptions\ApiException;
use App\Modules\Shared\Traits\HasStandardResponse;
use Illuminate\Http\JsonResponse;

class CheckInAdminController extends Controller
{
    use HasStandardResponse;

    public function scan(CheckInScanRequest $request): JsonResponse
    {
        $qrToken = $request->input('qr_token');
        $staffId = $request->user()->id;

        $booking = Booking::with('items.court')
            ->where('qr_token', $qrToken)
            ->first();

        if (! $booking) {
            throw new ApiException('Mã QR check-in không hợp lệ hoặc không tồn tại.', 404);
        }

        if ($booking->status === 'cancelled') {
            throw new ApiException('Đơn đặt sân này đã bị hủy.', 400);
        }

        CheckInLog::create([
            'booking_id' => $booking->id,
            'booking_code' => $booking->booking_code,
            'staff_id' => $staffId,
            'checkin_type' => $request->input('checkin_type', 'court'),
            'items_served' => $request->input('items_served', []),
            'checked_in_at' => now(),
        ]);

        $booking->update(['status' => 'completed']);

        return $this->success(
            new BookingResource($booking->fresh('items.court')),
            'Check-in sân thành công!'
        );
    }
}
