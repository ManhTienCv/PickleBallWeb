<?php

namespace Database\Seeders;

use App\Modules\Shop\Models\Product;
use App\Modules\Shop\Models\ProductReview;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();
        if ($products->isEmpty()) {
            return;
        }

        $reviewsData = [
            // JOOLA Perseus 3S
            'vot-joola-perseus-3s-16mm' => [
                [
                    'user_name' => 'Trần Văn Mạnh',
                    'user_avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
                    'rating' => 5,
                    'comment' => 'Vợt đánh cực kỳ đầm tay! Mặt nhám Carbon T700 tạo độ xoáy bóng rất gắt, dink bóng ở vùng Kitchen kiểm soát cực kỳ chuẩn xác. Bóc hộp nguyên seal xịn sò.',
                    'images' => [
                        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400',
                        'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
                    ],
                    'variant_purchased' => '16mm - Đen Nhám',
                    'is_verified_purchase' => true,
                    'likes' => 14,
                    'status' => 'approved',
                ],
                [
                    'user_name' => 'Nguyễn Bích Ngọc',
                    'user_avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
                    'rating' => 5,
                    'comment' => 'Giao hàng siêu nhanh trong 2h tại Hà Nội. Màu sắc bên ngoài nhìn thực tế rất sang. Cán vợt bọc êm tay, giảm chấn tốt khi smash.',
                    'images' => [
                        'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400',
                    ],
                    'variant_purchased' => '16mm - Xanh Lam',
                    'is_verified_purchase' => true,
                    'likes' => 9,
                    'status' => 'approved',
                ],
                [
                    'user_name' => 'Lê Hoàng Long',
                    'user_avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                    'rating' => 5,
                    'comment' => 'Đã test qua 3 buổi đánh giải phong trào, sweet spot rộng, đỡ bóng lệch tâm vẫn qua lưới mượt. Đáng đồng tiền bát gạo.',
                    'images' => [],
                    'variant_purchased' => '16mm - Đen Nhám',
                    'is_verified_purchase' => true,
                    'likes' => 7,
                    'status' => 'approved',
                ],
                [
                    'user_name' => 'Phạm Minh Tuấn',
                    'user_avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
                    'rating' => 4,
                    'comment' => 'Vợt chất lượng cao, tuy nhiên hơi nặng một chút cho ai mới tập chơi. Người chơi trung bình khá trở lên dùng sẽ phát huy tối đa lực.',
                    'images' => [],
                    'variant_purchased' => '16mm - Xanh Lam',
                    'is_verified_purchase' => true,
                    'likes' => 3,
                    'status' => 'approved',
                ],
            ],

            // Selkirk Vanguard Power Air
            'vot-selkirk-vanguard-power-air' => [
                [
                    'user_name' => 'Đặng Hải Nam',
                    'user_avatar' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100',
                    'rating' => 5,
                    'comment' => 'Thiết kế khí động học Air Dynamic Throat quá đỉnh, tốc độ vung vợt nhanh hơn hẳn các dòng vợt thông thường. Smash cắm sân cực kỳ uy lực!',
                    'images' => [
                        'https://images.unsplash.com/photo-1617083934555-ac7d4fed8814?w=400',
                    ],
                    'variant_purchased' => 'Đỏ Đô',
                    'is_verified_purchase' => true,
                    'likes' => 11,
                    'status' => 'approved',
                ],
                [
                    'user_name' => 'Vũ Thuỳ Linh',
                    'user_avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
                    'rating' => 5,
                    'comment' => 'Vợt cầm rất nhẹ nhàng, phản xạ trên lưới nhanh như chớp. Shop đóng gói 3 lớp chống sốc rất cẩn thận, có tem bảo hành chính hãng.',
                    'images' => [],
                    'variant_purchased' => 'Xanh Dương',
                    'is_verified_purchase' => true,
                    'likes' => 6,
                    'status' => 'approved',
                ],
            ],

            // CRBN 1X 16mm
            'vot-crbn-1x-16mm' => [
                [
                    'user_name' => 'Hoàng Đức Trọng',
                    'user_avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
                    'rating' => 5,
                    'comment' => 'Mặt nhám Raw Carbon siêu bám bóng. Cảm giác spin xoáy bóng khác biệt hoàn toàn, đối thủ rất khó đỡ bóng trả lại. 10/10.',
                    'images' => [
                        'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400',
                    ],
                    'variant_purchased' => 'Carbon Đen',
                    'is_verified_purchase' => true,
                    'likes' => 8,
                    'status' => 'approved',
                ],
                [
                    'user_name' => 'Trịnh Quốc Bảo',
                    'user_avatar' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
                    'rating' => 5,
                    'comment' => 'Form vợt dài giúp với bóng xa và cắt bóng cứu nguy cực tốt. Dòng này đang hot bên Mỹ.',
                    'images' => [],
                    'variant_purchased' => 'Carbon Đen',
                    'is_verified_purchase' => true,
                    'likes' => 4,
                    'status' => 'approved',
                ],
            ],

            // Franklin X-40 Balls
            'hop-12-bong-franklin-x40' => [
                [
                    'user_name' => 'Ngô Đình Khoa',
                    'user_avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
                    'rating' => 5,
                    'comment' => 'Bóng chuẩn USAPA thi đấu, độ nảy rất chuẩn và không bị méo sau 5 set liên tục ngoài trời nắng gắt. Đóng gói hộp chắc chắn.',
                    'images' => [
                        'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400',
                    ],
                    'variant_purchased' => 'Hộp 12 quả Vàng Neon',
                    'is_verified_purchase' => true,
                    'likes' => 15,
                    'status' => 'approved',
                ],
                [
                    'user_name' => 'Bùi Thanh Mai',
                    'user_avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
                    'rating' => 5,
                    'comment' => 'Mua cả hộp 12 quả tính ra giá rẻ hơn mua lẻ nhiều. Màu vàng neon rất dễ nhìn dưới ánh đèn sân buổi tối.',
                    'images' => [],
                    'variant_purchased' => 'Hộp 12 quả Vàng Neon',
                    'is_verified_purchase' => true,
                    'likes' => 5,
                    'status' => 'approved',
                ],
            ],

            // Joola Tac-Grip
            'quanchuan-joola-tacgrip-3pack' => [
                [
                    'user_name' => 'Lý Gia Hân',
                    'user_avatar' => 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100',
                    'rating' => 5,
                    'comment' => 'Quấn cán siêu thấm mồ hôi, tay mình hay ra mồ hôi nhiều mà cầm vẫn dính tay không hề trơn trượt. Sẽ ủng hộ shop tiếp!',
                    'images' => [],
                    'variant_purchased' => 'Trắng',
                    'is_verified_purchase' => true,
                    'likes' => 7,
                    'status' => 'approved',
                ],
            ],
        ];

        foreach ($products as $product) {
            $slug = $product->slug;
            $reviews = $reviewsData[$slug] ?? null;

            if (!$reviews) {
                // Generate 2 generic high quality reviews for other products
                $reviews = [
                    [
                        'user_name' => 'Nguyễn Anh Tuấn',
                        'user_avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
                        'rating' => 5,
                        'comment' => 'Sản phẩm chính hãng chất lượng cao, đúng như mô tả. Giao hàng nhanh và tư vấn nhiệt tình.',
                        'images' => [],
                        'variant_purchased' => 'Tiêu chuẩn',
                        'is_verified_purchase' => true,
                        'likes' => 4,
                        'status' => 'approved',
                    ],
                    [
                        'user_name' => 'Võ Hoàng Yến',
                        'user_avatar' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
                        'rating' => 5,
                        'comment' => 'Hàng đẹp, đóng gói cẩn thận. Sử dụng rất ưng ý. Đánh giá 5 sao cho DemoPick!',
                        'images' => [],
                        'variant_purchased' => 'Tiêu chuẩn',
                        'is_verified_purchase' => true,
                        'likes' => 2,
                        'status' => 'approved',
                    ],
                ];
            }

            foreach ($reviews as $rev) {
                ProductReview::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'user_name' => $rev['user_name'],
                    ],
                    array_merge($rev, [
                        'user_id' => 1,
                        'created_at' => now()->subDays(rand(1, 20)),
                        'updated_at' => now(),
                    ])
                );
            }
        }
    }
}
