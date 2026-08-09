<?php

namespace App\Modules\Booking\Services;

use App\Modules\Shared\Exceptions\ApiException;
use App\Modules\Shared\Exceptions\HoldExpiredException;
use App\Modules\Booking\Models\Hold;
use App\Modules\Booking\Models\TimeSlot;
use Illuminate\Support\Facades\DB;

class HoldService
{
    public const HOLD_TTL_MINUTES = 10;

    public function cleanExpiredHolds(): int
    {
        $expiredHolds = Hold::where('status', 'active')
            ->where('expires_at', '<', now())
            ->get();

        $count = 0;
        foreach ($expiredHolds as $hold) {
            DB::connection('booking')->transaction(function () use ($hold, &$count) {
                $hold->update(['status' => 'expired']);
                TimeSlot::where('id', $hold->slot_id)
                    ->where('status', 'held')
                    ->update(['status' => 'available']);
                $count++;
            });
        }

        return $count;
    }

    public function createHold(int $slotId, ?int $userId, ?string $sessionId = null): Hold
    {
        $this->cleanExpiredHolds();

        return DB::connection('booking')->transaction(function () use ($slotId, $userId, $sessionId) {
            /** @var TimeSlot $slot */
            $slot = TimeSlot::where('id', $slotId)->lockForUpdate()->first();

            if (!$slot) {
                throw new ApiException('Khung giờ không tồn tại.', 404);
            }

            if ($slot->status !== 'available') {
                throw new ApiException('Khung giờ này đã được giữ chỗ hoặc đã được đặt.', 409);
            }

            $slot->update(['status' => 'held']);

            // Delete any previous non-converted hold for this slot
            Hold::where('slot_id', $slotId)->delete();

            return Hold::create([
                'slot_id' => $slot->id,
                'user_id' => $userId,
                'session_id' => $sessionId,
                'expires_at' => now()->addMinutes(self::HOLD_TTL_MINUTES),
                'status' => 'active',
            ]);
        });
    }

    public function releaseHold(int $holdId, ?int $userId = null, ?string $sessionId = null): void
    {
        DB::connection('booking')->transaction(function () use ($holdId, $userId, $sessionId) {
            $query = Hold::where('id', $holdId);

            if ($userId) {
                $query->where('user_id', $userId);
            } elseif ($sessionId) {
                $query->where('session_id', $sessionId);
            }

            $hold = $query->first();

            if ($hold) {
                $hold->update(['status' => 'expired']);
                TimeSlot::where('id', $hold->slot_id)->update(['status' => 'available']);
            }
        });
    }

    public function verifyActiveHold(int $holdId, ?int $userId = null, ?string $sessionId = null): Hold
    {
        $this->cleanExpiredHolds();

        $hold = Hold::with('slot')->find($holdId);

        if (!$hold || $hold->status !== 'active' || $hold->isExpired()) {
            throw new HoldExpiredException('Thời gian giữ chỗ của bạn đã hết hạn (10 phút). Vui lòng chọn lại sân.');
        }

        if ($userId && $hold->user_id && $hold->user_id !== $userId) {
            throw new ApiException('Giữ chỗ này không thuộc về bạn.', 403);
        }

        return $hold;
    }
}
