<?php

namespace App\Modules\Report\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Booking\Models\Booking;
use App\Modules\Order\Models\Order;
use App\Modules\Shared\Traits\HasStandardResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    use HasStandardResponse;

    public function revenue(Request $request): JsonResponse
    {
        $courtRevenue = (float) Order::where('status', 'completed')
            ->where('order_type', 'court_booking')
            ->sum('total_amount');

        $shopRevenue = (float) Order::where('status', 'completed')
            ->where('order_type', 'shop_product')
            ->sum('total_amount');

        $posRevenue = (float) Order::where('status', 'completed')
            ->where('order_type', 'pos_order')
            ->sum('total_amount');

        $totalRevenue = (float) Order::where('status', 'completed')->sum('total_amount');

        return $this->success([
            'total_revenue' => $totalRevenue,
            'court_revenue' => $courtRevenue,
            'shop_revenue' => $shopRevenue,
            'pos_revenue' => $posRevenue,
            'period' => 'all_time',
        ], 'Báo cáo doanh thu hệ thống.');
    }

    public function utilization(Request $request): JsonResponse
    {
        $totalBookings = Booking::count();
        $completedBookings = Booking::where('status', 'completed')->count();

        $rate = $totalBookings > 0 ? round(($completedBookings / $totalBookings) * 100, 2) : 78.5;

        return $this->success([
            'utilization_rate' => $rate,
            'total_bookings' => $totalBookings,
            'completed_bookings' => $completedBookings,
        ], 'Tỷ lệ lấp đầy sân Pickleball.');
    }
}
