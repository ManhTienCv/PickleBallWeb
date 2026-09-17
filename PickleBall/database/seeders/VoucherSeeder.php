<?php

namespace Database\Seeders;

use App\Modules\Shop\Models\Voucher;
use Illuminate\Database\Seeder;

class VoucherSeeder extends Seeder
{
    public function run(): void
    {
        $vouchers = [
            [
                'code' => 'CHAOBANMOI',
                'title' => 'Ưu đãi chào bạn mới - Giảm 50K',
                'description' => 'Giảm ngay 50.000đ cho đơn hàng phụ kiện và thiết bị từ 300.000đ.',
                'discount_type' => 'fixed',
                'discount_value' => 50000,
                'max_discount' => null,
                'min_order_amount' => 300000,
                'usage_limit' => 1000,
                'used_count' => 42,
                'start_date' => now()->subDays(10),
                'end_date' => now()->addMonths(6),
                'is_active' => true,
            ],
            [
                'code' => 'DEMOPICK10',
                'title' => 'Giảm 10% thiết bị thi đấu (Tối đa 200K)',
                'description' => 'Áp dụng cho đơn hàng tổng từ 1.000.000đ trở lên khi mua vợt, bóng thi đấu.',
                'discount_type' => 'percentage',
                'discount_value' => 10,
                'max_discount' => 200000,
                'min_order_amount' => 1000000,
                'usage_limit' => 500,
                'used_count' => 128,
                'start_date' => now()->subDays(5),
                'end_date' => now()->addMonths(3),
                'is_active' => true,
            ],
            [
                'code' => 'FREESHIP30',
                'title' => 'Hỗ trợ 30K phí vận chuyển GHN Toàn Quốc',
                'description' => 'Áp dụng giảm 30.000đ phí giao hàng nhanh cho đơn từ 500.000đ.',
                'discount_type' => 'fixed',
                'discount_value' => 30000,
                'max_discount' => null,
                'min_order_amount' => 500000,
                'usage_limit' => 2000,
                'used_count' => 310,
                'start_date' => now()->subDays(15),
                'end_date' => now()->addMonths(12),
                'is_active' => true,
            ],
            [
                'code' => 'VIPPRO500',
                'title' => 'Đặc quyền Vợt Chuyên Nghiệp - Giảm 500K',
                'description' => 'Giảm trực tiếp 500.000đ cho các dòng vợt thi đấu cao cấp JOOLA, Selkirk, CRBN từ 4.500.000đ.',
                'discount_type' => 'fixed',
                'discount_value' => 500000,
                'max_discount' => null,
                'min_order_amount' => 4500000,
                'usage_limit' => 200,
                'used_count' => 19,
                'start_date' => now()->subDays(2),
                'end_date' => now()->addMonths(2),
                'is_active' => true,
            ],
            [
                'code' => 'TRIAN15',
                'title' => 'Tri ân khách hàng thân thiết - Giảm 15%',
                'description' => 'Giảm 15% tối đa 300.000đ cho mọi đơn hàng từ 1.500.000đ.',
                'discount_type' => 'percentage',
                'discount_value' => 15,
                'max_discount' => 300000,
                'min_order_amount' => 1500000,
                'usage_limit' => 300,
                'used_count' => 88,
                'start_date' => now()->subDays(1),
                'end_date' => now()->addMonths(1),
                'is_active' => true,
            ],
        ];

        foreach ($vouchers as $v) {
            Voucher::updateOrCreate(['code' => $v['code']], $v);
        }
    }
}
