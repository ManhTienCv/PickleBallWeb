<?php

namespace App\Modules\Order\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Order\Services\GhnShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    protected GhnShippingService $shippingService;

    public function __construct(GhnShippingService $shippingService)
    {
        $this->shippingService = $shippingService;
    }

    public function provinces(): JsonResponse
    {
        $data = $this->shippingService->getProvinces();
        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function districts(Request $request): JsonResponse
    {
        $provinceId = (int) $request->query('province_id', 201);
        $data = $this->shippingService->getDistricts($provinceId);
        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function wards(Request $request): JsonResponse
    {
        $districtId = (int) $request->query('district_id', 1485);
        $data = $this->shippingService->getWards($districtId);
        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function calculateFee(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'toDistrictId' => 'nullable|integer',
            'toWardCode' => 'nullable|string',
            'weightGram' => 'nullable|integer',
            'insuranceValue' => 'nullable|numeric',
        ]);

        $toDistrictId = (int) ($validated['toDistrictId'] ?? 1485);
        $toWardCode = $validated['toWardCode'] ?? '1A0307';
        $weightGram = (int) ($validated['weightGram'] ?? 700);
        $insuranceValue = (int) ($validated['insuranceValue'] ?? 0);

        $result = $this->shippingService->calculateFee($toDistrictId, $toWardCode, $weightGram, $insuranceValue);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    public function createOrder(Request $request): JsonResponse
    {
        $result = $this->shippingService->createShippingOrder($request->all());
        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    public function tracking(string $code): JsonResponse
    {
        $data = $this->shippingService->getTrackingTimeline($code);
        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
