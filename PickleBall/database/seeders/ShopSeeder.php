<?php

namespace Database\Seeders;

use App\Modules\Shop\Models\Brand;
use App\Modules\Shop\Models\Category;
use App\Modules\Shop\Models\InventoryTransaction;
use App\Modules\Shop\Models\Product;
use App\Modules\Shop\Models\ProductVariant;
use Illuminate\Database\Seeder;

class ShopSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Categories
        $racketsCat = Category::firstOrCreate(['slug' => 'vot-pickleball'], [
            'name' => 'Vợt Pickleball',
            'description' => 'Các dòng vợt cao cấp chuyên nghiệp và tập luyện',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $ballsCat = Category::firstOrCreate(['slug' => 'bong-pickleball'], [
            'name' => 'Bóng Pickleball',
            'description' => 'Bóng thi đấu trong nhà và ngoài trời tiêu chuẩn USAPA',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $accessoriesCat = Category::firstOrCreate(['slug' => 'phu-kien-tui'], [
            'name' => 'Phụ Kiện & Bao Vợt',
            'description' => 'Túi đựng, quấn cán, bình nước, băng bảo vệ',
            'sort_order' => 3,
            'is_active' => true,
        ]);

        // 2. Brands
        $joola = Brand::firstOrCreate(['slug' => 'joola'], ['name' => 'JOOLA', 'is_active' => true]);
        $selkirk = Brand::firstOrCreate(['slug' => 'selkirk'], ['name' => 'Selkirk', 'is_active' => true]);
        $crbn = Brand::firstOrCreate(['slug' => 'crbn'], ['name' => 'CRBN', 'is_active' => true]);
        $franklin = Brand::firstOrCreate(['slug' => 'franklin'], ['name' => 'Franklin', 'is_active' => true]);

        // 3. Products & Variants
        $products = [
            [
                'name' => 'Vợt JOOLA Perseus 3S Carbon 16mm',
                'slug' => 'vot-joola-perseus-3s-16mm',
                'brand_id' => $joola->id,
                'category_id' => $racketsCat->id,
                'base_price' => 5490000,
                'short_description' => 'Vợt thi đấu đỉnh cao dành cho cầu thủ chuyên nghiệp, mặt Carbon đính viền chống xước.',
                'description' => 'Công nghệ Perseus 3S cải tiến khả năng kiểm soát bóng, lõi 16mm mang lại lực nảy cực kỳ đầm tay.',
                'status' => 'active',
                'is_featured' => true,
                'images' => ['https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800'],
                'specifications' => ['material' => 'Carbon Fiber', 'core_thickness' => '16mm', 'weight_range' => '7.8 - 8.2 oz'],
                'variants' => [
                    ['sku' => 'JOO-PER3S-BLU-16MM', 'color' => 'Xanh Lam', 'weight' => '8.0 oz', 'stock_qty' => 15],
                    ['sku' => 'JOO-PER3S-BLK-16MM', 'color' => 'Đen Nhám', 'weight' => '7.9 oz', 'stock_qty' => 10],
                ],
            ],
            [
                'name' => 'Vợt Selkirk Vanguard Power Air Invikta',
                'slug' => 'vot-selkirk-vanguard-power-air',
                'brand_id' => $selkirk->id,
                'category_id' => $racketsCat->id,
                'base_price' => 6200000,
                'short_description' => 'Thiết kế lỗ khí động học tản lực, tối đa hóa tốc độ quạt tay và lực xoáy bóng.',
                'description' => 'Lớp phủ QuadFlex 4 lớp độc quyền của Selkirk cho lực đập tối ưu.',
                'status' => 'active',
                'is_featured' => true,
                'images' => ['https://images.unsplash.com/photo-1617083934555-ac7d4fed8814?w=800'],
                'specifications' => ['material' => 'Hybrid Carbon Glass', 'shape' => 'Invikta Elongated'],
                'variants' => [
                    ['sku' => 'SEL-AIR-RED-STD', 'color' => 'Đỏ Đô', 'weight' => '7.8 oz', 'stock_qty' => 8],
                    ['sku' => 'SEL-AIR-BLU-STD', 'color' => 'Xanh Dương', 'weight' => '8.1 oz', 'stock_qty' => 12],
                ],
            ],
            [
                'name' => 'Vợt CRBN 1X 16mm Middleweight',
                'slug' => 'vot-crbn-1x-16mm',
                'brand_id' => $crbn->id,
                'category_id' => $racketsCat->id,
                'base_price' => 4850000,
                'short_description' => 'Mặt nhám carbon nguyên chất gia tăng khả năng bám bóng tối đa.',
                'description' => 'Cấu trúc T700 Raw Carbon đúc nguyên khối chống va đập.',
                'status' => 'active',
                'is_featured' => true,
                'images' => ['https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800'],
                'variants' => [
                    ['sku' => 'CRBN-1X-16MM-RAW', 'color' => 'Carbon Đen', 'weight' => '8.0 oz', 'stock_qty' => 20],
                ],
            ],
            [
                'name' => 'Hộp 12 Bóng Franklin X-40 Outdoor (Vàng)',
                'slug' => 'hop-12-bong-franklin-x40',
                'brand_id' => $franklin->id,
                'category_id' => $ballsCat->id,
                'base_price' => 420000,
                'short_description' => 'Bóng thi đấu ngoài trời tiêu chuẩn USAPA chính thức.',
                'description' => 'Thiết kế 40 lỗ khoan chính xác chịu gió tốt, độ nảy đồng đều.',
                'status' => 'active',
                'is_featured' => true,
                'images' => ['https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800'],
                'variants' => [
                    ['sku' => 'FRA-X40-YELLOW-PACK12', 'color' => 'Vàng Neon', 'weight' => '12 quả', 'stock_qty' => 50],
                ],
            ],
            [
                'name' => 'Băng Cán Vợt Chống Trượt Joola Tac-Grip (Bộ 3 cái)',
                'slug' => 'quanchuan-joola-tacgrip-3pack',
                'brand_id' => $joola->id,
                'category_id' => $accessoriesCat->id,
                'base_price' => 150000,
                'short_description' => 'Hút mồ hôi cực nhanh, tạo cảm giác bám tay êm ái.',
                'description' => 'Bảo vệ tay cầm vợt khỏi ẩm mốc và mài mòn.',
                'status' => 'active',
                'is_featured' => false,
                'images' => ['https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800'],
                'variants' => [
                    ['sku' => 'JOO-GRIP-3P-WHT', 'color' => 'Trắng', 'weight' => 'Bộ 3 cuốn', 'stock_qty' => 100],
                    ['sku' => 'JOO-GRIP-3P-BLK', 'color' => 'Đen', 'weight' => 'Bộ 3 cuốn', 'stock_qty' => 80],
                ],
            ],
        ];

        foreach ($products as $pData) {
            $variants = $pData['variants'];
            unset($pData['variants']);

            $product = Product::firstOrCreate(['slug' => $pData['slug']], $pData);

            foreach ($variants as $vData) {
                $stock = $vData['stock_qty'];

                $variant = ProductVariant::firstOrCreate(['sku' => $vData['sku']], array_merge($vData, [
                    'product_id' => $product->id,
                    'stock_qty' => $stock,
                    'status' => 'active',
                ]));

                InventoryTransaction::firstOrCreate(
                    ['variant_id' => $variant->id, 'type' => 'in', 'reference_type' => 'initial_seed'],
                    [
                        'quantity' => $stock,
                        'stock_after' => $stock,
                        'notes' => 'Khởi tạo tồn kho kho ban đầu',
                    ]
                );
            }
        }
    }
}
