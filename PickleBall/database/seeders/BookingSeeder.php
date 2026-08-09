<?php

namespace Database\Seeders;

use App\Modules\Booking\Models\Court;
use App\Modules\Booking\Models\CourtPricingRule;
use App\Modules\Booking\Services\SlotGenerationService;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(SlotGenerationService $slotService): void
    {
        $courtsData = [
            ['name' => 'Sân A1', 'code' => 'COURT_A1', 'location' => 'Khu A - Tầng 1', 'surface_type' => 'Pro Concrete', 'image_url' => 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600'],
            ['name' => 'Sân A2', 'code' => 'COURT_A2', 'location' => 'Khu A - Tầng 1', 'surface_type' => 'Pro Concrete', 'image_url' => 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600'],
            ['name' => 'Sân B1', 'code' => 'COURT_B1', 'location' => 'Khu B - Ngoài trời', 'surface_type' => 'Cushioned Acrylic', 'image_url' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600'],
            ['name' => 'Sân B2', 'code' => 'COURT_B2', 'location' => 'Khu B - Ngoài trời', 'surface_type' => 'Cushioned Acrylic', 'image_url' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600'],
            ['name' => 'Sân C1 (VIP)', 'code' => 'COURT_C1_VIP', 'location' => 'Khu C - VIP Mái che', 'surface_type' => 'Indoor Wooden Flex', 'image_url' => 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600'],
            ['name' => 'Sân C2 (VIP)', 'code' => 'COURT_C2_VIP', 'location' => 'Khu C - VIP Mái che', 'surface_type' => 'Indoor Wooden Flex', 'image_url' => 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600'],
        ];

        foreach ($courtsData as $cData) {
            $court = Court::firstOrCreate(['code' => $cData['code']], array_merge($cData, [
                'description' => 'Sân thi đấu đạt tiêu chuẩn Pickleball USAPA với đèn LED siêu sáng.',
                'status' => 'active',
                'amenities' => ['lighting', 'drinking_water', 'wifi', 'parking'],
            ]));

            // Pricing rules
            $isVip = str_contains($court->code, 'VIP');

            $pricingRules = [
                // Weekday
                ['day_type' => 'weekday', 'start_time' => '05:00:00', 'end_time' => '08:00:00', 'price' => $isVip ? 120000 : 90000, 'label' => 'Sáng sớm'],
                ['day_type' => 'weekday', 'start_time' => '08:00:00', 'end_time' => '16:00:00', 'price' => $isVip ? 140000 : 110000, 'label' => 'Giờ thường'],
                ['day_type' => 'weekday', 'start_time' => '16:00:00', 'end_time' => '22:00:00', 'price' => $isVip ? 200000 : 160000, 'label' => 'Giờ vàng tối'],

                // Weekend
                ['day_type' => 'weekend', 'start_time' => '05:00:00', 'end_time' => '12:00:00', 'price' => $isVip ? 180000 : 140000, 'label' => 'Cuối tuần sáng'],
                ['day_type' => 'weekend', 'start_time' => '12:00:00', 'end_time' => '22:00:00', 'price' => $isVip ? 220000 : 180000, 'label' => 'Cuối tuần chiều/tối'],
            ];

            foreach ($pricingRules as $rule) {
                CourtPricingRule::firstOrCreate([
                    'court_id' => $court->id,
                    'day_type' => $rule['day_type'],
                    'start_time' => $rule['start_time'],
                    'end_time' => $rule['end_time'],
                ], array_merge($rule, ['is_active' => true]));
            }
        }

        // Generate slots for 7 days ahead
        $slotService->generateForDays(7);
    }
}
