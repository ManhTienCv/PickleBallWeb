<?php

namespace App\Modules\Booking\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Booking\Http\Requests\CreateHoldRequest;
use App\Modules\Booking\Http\Resources\HoldResource;
use App\Modules\Booking\Services\HoldService;
use App\Modules\Shared\Traits\HasStandardResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HoldController extends Controller
{
    use HasStandardResponse;

    public function __construct(protected HoldService $holdService) {}

    public function store(CreateHoldRequest $request): JsonResponse
    {
        $userId = $request->user()?->id;
        $sessionId = $request->header('X-Session-Id') ?: $request->input('session_id');

        $hold = $this->holdService->createHold($request->input('slot_id'), $userId, $sessionId);
        $hold->load('slot.court');

        return $this->created(new HoldResource($hold), 'Giữ chỗ sân thành công (có hiệu lực trong 10 phút).');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $userId = $request->user()?->id;
        $sessionId = $request->header('X-Session-Id') ?: $request->input('session_id');

        $this->holdService->releaseHold($id, $userId, $sessionId);

        return $this->success(null, 'Đã hủy giữ chỗ.');
    }
}
