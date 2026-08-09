<?php

namespace App\Modules\Booking\Services;

use App\Modules\Booking\Models\Court;
use App\Modules\Booking\Models\CourtPricingRule;
use App\Modules\Booking\Models\TimeSlot;
use Carbon\Carbon;

class SlotGenerationService
{
    public function generateForDays(int $daysAhead = 7): int
    {
        $courts = Court::where('status', 'active')->get();
        $generatedCount = 0;

        $startDate = Carbon::today();

        for ($d = 0; $d < $daysAhead; $d++) {
            $date = $startDate->copy()->addDays($d);
            $dayType = $date->isWeekend() ? 'weekend' : 'weekday';

            foreach ($courts as $court) {
                $rules = CourtPricingRule::where('court_id', $court->id)
                    ->where('day_type', $dayType)
                    ->where('is_active', true)
                    ->get();

                // 1-hour slots from 05:00 to 22:00
                for ($hour = 5; $hour < 22; $hour++) {
                    $startTime = sprintf('%02d:00:00', $hour);
                    $endTime = sprintf('%02d:00:00', $hour + 1);

                    $price = $this->calculatePriceForSlot($rules, $startTime, $dayType);

                    $slot = TimeSlot::firstOrCreate(
                        [
                            'court_id' => $court->id,
                            'date' => $date->format('Y-m-d'),
                            'start_time' => $startTime,
                        ],
                        [
                            'end_time' => $endTime,
                            'price' => $price,
                            'status' => 'available',
                        ]
                    );

                    if ($slot->wasRecentlyCreated) {
                        $generatedCount++;
                    }
                }
            }
        }

        return $generatedCount;
    }

    protected function calculatePriceForSlot($rules, string $startTime, string $dayType): float
    {
        foreach ($rules as $rule) {
            if ($startTime >= $rule->start_time && $startTime < $rule->end_time) {
                return (float) $rule->price;
            }
        }

        // Default fallback price if no rule matches
        return $dayType === 'weekend' ? 150000.00 : 100000.00;
    }
}
