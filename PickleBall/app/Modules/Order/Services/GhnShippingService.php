<?php

namespace App\Modules\Order\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GhnShippingService
{
    protected string $apiUrl;
    protected string $apiToken;
    protected int $shopId;
    protected int $fromDistrictId;
    protected string $fromWardCode;

    public function __construct()
    {
        $this->apiUrl = env('GHN_API_URL', 'https://dev-online-gateway.ghn.vn/shiip/public-api');
        $this->apiToken = env('GHN_TOKEN', 'cf94a081-4b11-11ee-b394-8ac292e00e8b');
        $this->shopId = (int) env('GHN_SHOP_ID', 195234);
        $this->fromDistrictId = (int) env('GHN_FROM_DISTRICT_ID', 1485);
        $this->fromWardCode = env('GHN_FROM_WARD_CODE', '1A0307');
    }

    public function getProvinces(): array
    {
        return Cache::remember('ghn_provinces_v1', 86400, function () {
            if ($this->apiToken && !str_contains($this->apiToken, 'cf94a081')) {
                try {
                    $response = Http::withHeaders(['Token' => $this->apiToken])
                        ->timeout(5)
                        ->get("{$this->apiUrl}/master-data/province");
                    if ($response->successful() && !empty($response->json('data'))) {
                        return $response->json('data');
                    }
                } catch (\Throwable $e) {
                    Log::warning('GHN API Provinces failed, falling back to local master data: ' . $e->getMessage());
                }
            }
            return [
                ['ProvinceID' => 201, 'ProvinceName' => 'Hà Nội', 'Code' => 'HN'],
                ['ProvinceID' => 202, 'ProvinceName' => 'TP. Hồ Chí Minh', 'Code' => 'HCM'],
                ['ProvinceID' => 203, 'ProvinceName' => 'Đà Nẵng', 'Code' => 'DN'],
                ['ProvinceID' => 204, 'ProvinceName' => 'Hải Phòng', 'Code' => 'HP'],
                ['ProvinceID' => 205, 'ProvinceName' => 'Cần Thơ', 'Code' => 'CT'],
                ['ProvinceID' => 206, 'ProvinceName' => 'Bình Dương', 'Code' => 'BD'],
                ['ProvinceID' => 207, 'ProvinceName' => 'Đồng Nai', 'Code' => 'DNAI'],
                ['ProvinceID' => 208, 'ProvinceName' => 'Quảng Ninh', 'Code' => 'QN'],
            ];
        });
    }

    public function getDistricts(int $provinceId): array
    {
        $cacheKey = "ghn_districts_{$provinceId}";
        return Cache::remember($cacheKey, 86400, function () use ($provinceId) {
            if ($this->apiToken && !str_contains($this->apiToken, 'cf94a081')) {
                try {
                    $response = Http::withHeaders(['Token' => $this->apiToken])
                        ->timeout(5)
                        ->get("{$this->apiUrl}/master-data/district", ['province_id' => $provinceId]);
                    if ($response->successful() && !empty($response->json('data'))) {
                        return $response->json('data');
                    }
                } catch (\Throwable $e) {
                    Log::warning('GHN API Districts failed: ' . $e->getMessage());
                }
            }

            if ($provinceId === 201) {
                return [
                    ['DistrictID' => 1485, 'ProvinceID' => 201, 'DistrictName' => 'Quận Cầu Giấy', 'Code' => '1485'],
                    ['DistrictID' => 1482, 'ProvinceID' => 201, 'DistrictName' => 'Quận Ba Đình', 'Code' => '1482'],
                    ['DistrictID' => 1486, 'ProvinceID' => 201, 'DistrictName' => 'Quận Đống Đa', 'Code' => '1486'],
                    ['DistrictID' => 1484, 'ProvinceID' => 201, 'DistrictName' => 'Quận Hoàn Kiếm', 'Code' => '1484'],
                ];
            }
            if ($provinceId === 202) {
                return [
                    ['DistrictID' => 1442, 'ProvinceID' => 202, 'DistrictName' => 'Quận 1', 'Code' => '1442'],
                    ['DistrictID' => 1443, 'ProvinceID' => 202, 'DistrictName' => 'Quận 3', 'Code' => '1443'],
                    ['DistrictID' => 1444, 'ProvinceID' => 202, 'DistrictName' => 'Quận 7', 'Code' => '1444'],
                ];
            }
            return [
                ['DistrictID' => $provinceId * 10 + 1, 'ProvinceID' => $provinceId, 'DistrictName' => 'Quận / Huyện Trung Tâm', 'Code' => (string)($provinceId * 10 + 1)],
            ];
        });
    }

    public function getWards(int $districtId): array
    {
        $cacheKey = "ghn_wards_{$districtId}";
        return Cache::remember($cacheKey, 86400, function () use ($districtId) {
            if ($this->apiToken && !str_contains($this->apiToken, 'cf94a081')) {
                try {
                    $response = Http::withHeaders(['Token' => $this->apiToken])
                        ->timeout(5)
                        ->get("{$this->apiUrl}/master-data/ward", ['district_id' => $districtId]);
                    if ($response->successful() && !empty($response->json('data'))) {
                        return $response->json('data');
                    }
                } catch (\Throwable $e) {
                    Log::warning('GHN API Wards failed: ' . $e->getMessage());
                }
            }

            if ($districtId === 1485) {
                return [
                    ['WardCode' => '1A0307', 'DistrictID' => 1485, 'WardName' => 'Phường Dịch Vọng'],
                    ['WardCode' => '1A0308', 'DistrictID' => 1485, 'WardName' => 'Phường Dịch Vọng Hậu'],
                    ['WardCode' => '1A0309', 'DistrictID' => 1485, 'WardName' => 'Phường Quan Hoa'],
                    ['WardCode' => '1A0310', 'DistrictID' => 1485, 'WardName' => 'Phường Yên Hòa'],
                ];
            }
            return [
                ['WardCode' => '1A' . str_pad((string)$districtId, 4, '0', STR_PAD_LEFT), 'DistrictID' => $districtId, 'WardName' => 'Phường / Xã Trung Tâm'],
            ];
        });
    }

    public function calculateFee(int $toDistrictId, string $toWardCode, int $weightGram = 700, int $insuranceValue = 0): array
    {
        $isLocalHanoi = ($toDistrictId >= 1480 && $toDistrictId <= 1495);
        $baseFee = $isLocalHanoi ? 22000 : 38000;
        if ($weightGram > 1000) {
            $extraKg = ceil(($weightGram - 1000) / 500);
            $baseFee += $extraKg * 5000;
        }

        $isFreeship = $insuranceValue >= 1000000;
        $finalFee = $isFreeship ? 0 : $baseFee;
        $deliveryTime = $isLocalHanoi ? 'Trong ngày hoặc 24 giờ' : '1 - 2 ngày làm việc';

        return [
            'shippingFee' => $finalFee,
            'originalFee' => $baseFee,
            'isFreeship' => $isFreeship,
            'expectedDeliveryTime' => $deliveryTime,
            'carrier' => 'GHN Express',
        ];
    }

    public function createShippingOrder(array $params): array
    {
        $trackingNumber = 'GHN' . date('ymd') . rand(10000, 99999);
        return [
            'trackingNumber' => $trackingNumber,
            'orderCode' => $params['orderCode'] ?? 'HD' . rand(10000, 99999),
            'carrier' => 'GHN Express',
            'status' => 'READY_TO_PICK',
            'expectedDeliveryTime' => '1 - 2 ngày',
            'shippingFee' => $params['shippingFee'] ?? 28000,
            'codAmount' => $params['codAmount'] ?? 0,
        ];
    }

    public function getTrackingTimeline(string $code): array
    {
        $now = now();
        return [
            'trackingNumber' => $code,
            'carrier' => 'GHN Express',
            'status' => 'DELIVERING',
            'timeline' => [
                [
                    'stage' => 1,
                    'title' => 'Đã tiếp nhận đơn hàng',
                    'time' => $now->copy()->subHours(6)->format('H:i d/m/Y'),
                    'location' => 'Bưu cục GHN Cầu Giấy, Hà Nội',
                    'description' => 'Hệ thống DemoPick đã tạo vận đơn và sẵn sàng bàn giao kiện hàng.',
                ],
                [
                    'stage' => 2,
                    'title' => 'Shipper đã lấy hàng thành công',
                    'time' => $now->copy()->subHours(4)->format('H:i d/m/Y'),
                    'location' => 'Kho Tổng DemoPick SportHub',
                    'description' => 'Nhân viên GHN Express đã nhận kiện hàng thể thao Pickleball.',
                ],
                [
                    'stage' => 3,
                    'title' => 'Nhập kho phân loại trung chuyển',
                    'time' => $now->copy()->subHours(2)->format('H:i d/m/Y'),
                    'location' => 'Kho Phân Loại GHN Mê Linh SOC',
                    'description' => 'Kiện hàng đang được phân tuyến giao nhanh tới địa chỉ người nhận.',
                ],
                [
                    'stage' => 4,
                    'title' => 'Đang giao hàng tới người nhận',
                    'time' => $now->format('H:i d/m/Y'),
                    'location' => 'Bưu cục phát nội thành',
                    'description' => 'Shipper GHN đang trên đường giao kiện hàng tới cửa nhà bạn.',
                ],
            ],
        ];
    }
}
