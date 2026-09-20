<?php

namespace Database\Seeders;

use App\Modules\Shop\Models\Brand;
use App\Modules\Shop\Models\Category;
use App\Modules\Shop\Models\Product;
use App\Modules\Shop\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OfficialCatalogSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Tắt foreign key check và dọn sạch bảng sản phẩm cũ
        DB::connection('shop')->statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::connection('shop')->table('product_variants')->truncate();
        DB::connection('shop')->table('products')->truncate();
        DB::connection('shop')->table('categories')->truncate();
        DB::connection('shop')->table('brands')->truncate();
        DB::connection('shop')->statement('SET FOREIGN_KEY_CHECKS=1;');

        // 2. Tạo danh mục chuẩn
        $catMap = [];
        $catMap['vot-pickleball'] = Category::create([
            'name' => 'Vợt Pickleball',
            'slug' => 'vot-pickleball',
            'description' => 'Vợt Pickleball',
            'sort_order' => 1,
            'is_active' => true,
        ]);
        $catMap['bong-pickleball'] = Category::create([
            'name' => 'Bóng Pickleball',
            'slug' => 'bong-pickleball',
            'description' => 'Bóng Pickleball',
            'sort_order' => 1,
            'is_active' => true,
        ]);
        $catMap['phu-kien-bao-vot'] = Category::create([
            'name' => 'Phụ kiện & Bao vợt',
            'slug' => 'phu-kien-bao-vot',
            'description' => 'Phụ kiện & Bao vợt',
            'sort_order' => 1,
            'is_active' => true,
        ]);
        $catMap['quan-ao-trang-phuc'] = Category::create([
            'name' => 'Quần áo & Trang phục',
            'slug' => 'quan-ao-trang-phuc',
            'description' => 'Quần áo & Trang phục',
            'sort_order' => 1,
            'is_active' => true,
        ]);
        $catMap['do-uong-do-an'] = Category::create([
            'name' => 'Đồ uống & Đồ ăn',
            'slug' => 'do-uong-do-an',
            'description' => 'Đồ uống & Đồ ăn',
            'sort_order' => 1,
            'is_active' => true,
        ]);
        $catMap['thiet-bi-dich-vu-cho-thue'] = Category::create([
            'name' => 'Thiết bị & Dịch vụ cho thuê',
            'slug' => 'thiet-bi-dich-vu-cho-thue',
            'description' => 'Thiết bị & Dịch vụ cho thuê',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        // 3. Tạo thương hiệu chuẩn
        $brandMap = [];
        $brandMap['joola'] = Brand::create([
            'name' => 'JOOLA',
            'slug' => 'joola',
            'is_active' => true,
        ]);
        $brandMap['selkirk'] = Brand::create([
            'name' => 'Selkirk',
            'slug' => 'selkirk',
            'is_active' => true,
        ]);
        $brandMap['crbn'] = Brand::create([
            'name' => 'CRBN',
            'slug' => 'crbn',
            'is_active' => true,
        ]);
        $brandMap['franklin'] = Brand::create([
            'name' => 'Franklin',
            'slug' => 'franklin',
            'is_active' => true,
        ]);
        $brandMap['six-zero'] = Brand::create([
            'name' => 'Six Zero',
            'slug' => 'six-zero',
            'is_active' => true,
        ]);
        $brandMap['engage'] = Brand::create([
            'name' => 'Engage',
            'slug' => 'engage',
            'is_active' => true,
        ]);
        $brandMap['gearbox'] = Brand::create([
            'name' => 'Gearbox',
            'slug' => 'gearbox',
            'is_active' => true,
        ]);
        $brandMap['diadem'] = Brand::create([
            'name' => 'Diadem',
            'slug' => 'diadem',
            'is_active' => true,
        ]);
        $brandMap['paddletek'] = Brand::create([
            'name' => 'Paddletek',
            'slug' => 'paddletek',
            'is_active' => true,
        ]);
        $brandMap['proxr'] = Brand::create([
            'name' => 'ProXR',
            'slug' => 'proxr',
            'is_active' => true,
        ]);
        $brandMap['dura'] = Brand::create([
            'name' => 'Dura',
            'slug' => 'dura',
            'is_active' => true,
        ]);
        $brandMap['onix'] = Brand::create([
            'name' => 'Onix',
            'slug' => 'onix',
            'is_active' => true,
        ]);
        $brandMap['demopick'] = Brand::create([
            'name' => 'DEMOPICK',
            'slug' => 'demopick',
            'is_active' => true,
        ]);
        $brandMap['babolat'] = Brand::create([
            'name' => 'Babolat',
            'slug' => 'babolat',
            'is_active' => true,
        ]);
        $brandMap['wilson'] = Brand::create([
            'name' => 'Wilson',
            'slug' => 'wilson',
            'is_active' => true,
        ]);
        $brandMap['pocari'] = Brand::create([
            'name' => 'Pocari',
            'slug' => 'pocari',
            'is_active' => true,
        ]);
        $brandMap['revive'] = Brand::create([
            'name' => 'Revive',
            'slug' => 'revive',
            'is_active' => true,
        ]);
        $brandMap['red-bull'] = Brand::create([
            'name' => 'Red Bull',
            'slug' => 'red-bull',
            'is_active' => true,
        ]);
        $brandMap['lavie'] = Brand::create([
            'name' => 'LaVie',
            'slug' => 'lavie',
            'is_active' => true,
        ]);
        $brandMap['nature-valley'] = Brand::create([
            'name' => 'Nature Valley',
            'slug' => 'nature-valley',
            'is_active' => true,
        ]);
        $brandMap['snickers'] = Brand::create([
            'name' => 'Snickers',
            'slug' => 'snickers',
            'is_active' => true,
        ]);
        $brandMap['dole'] = Brand::create([
            'name' => 'Dole',
            'slug' => 'dole',
            'is_active' => true,
        ]);

        // 4. Import toàn bộ 42 sản phẩm chuẩn với hình ảnh chuẩn nét

        $p1 = Product::create([
            'id' => 1,
            'name' => 'Vợt JOOLA Perseus 3S Carbon 16mm Ben Johns Edition',
            'slug' => 'vot-joola-perseus-3s',
            'brand_id' => $brandMap['joola']->id ?? null,
            'category_id' => $catMap['vot-pickleball']->id ?? null,
            'base_price' => 5490000,
            'short_description' => 'Vợt thi đấu đỉnh cao thế giới Ben Johns Carbon T700 Propulsion Core trợ lực tối đa',
            'description' => 'Vợt thi đấu đỉnh cao của tay vợt số 1 thế giới Ben Johns với công nghệ Carbon T700 Charged, lõi Propulsion Core trợ lực tối đa.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_paddle_joola.jpg'],
            'specifications' => json_decode('{"material": "Raw Carbon T700 Charged", "thickness": "16mm & 14mm", "weight": "225g - 235g", "usapa_certified": true, "origin": "Mỹ / Nhập khẩu chính hãng"}', true),
        ]);
        ProductVariant::create([
            'id' => 101,
            'product_id' => $p1->id,
            'sku' => 'JOO-PER-3S-16MM',
            'color' => 'Đen / Xanh',
            'weight' => '230g',
            'price_override' => 5490000,
            'stock_qty' => 25,
            'status' => 'active',
        ]);
        ProductVariant::create([
            'id' => 102,
            'product_id' => $p1->id,
            'sku' => 'JOO-PER-3S-14MM',
            'color' => 'Đen / Trắng',
            'weight' => '225g',
            'price_override' => 5490000,
            'stock_qty' => 18,
            'status' => 'active',
        ]);

        $p2 = Product::create([
            'id' => 2,
            'name' => 'Vợt Selkirk Vanguard Power Air Invikta Pro',
            'slug' => 'vot-selkirk-vanguard-power-air',
            'brand_id' => $brandMap['selkirk']->id ?? null,
            'category_id' => $catMap['vot-pickleball']->id ?? null,
            'base_price' => 6200000,
            'short_description' => 'Dòng vợt không viền Air Dynamic Throttle bứt phá tốc độ và xoáy bóng ProSpin+',
            'description' => 'Dòng vợt cao cấp không viền Air Dynamic Throttle tăng tốc độ vung vợt, màng ProSpin+ NextGen tạo xoáy bóng tối đa.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_paddle_balls.jpg'],
            'specifications' => json_decode('{"material": "QuadFlex 4 Layer Hybrid Face", "thickness": "13mm Aerodynamic", "weight": "220g - 230g", "usapa_certified": true, "origin": "USA Made"}', true),
        ]);
        ProductVariant::create([
            'id' => 201,
            'product_id' => $p2->id,
            'sku' => 'SEL-AIR-RED-STD',
            'color' => 'Đỏ Đô',
            'weight' => '230g',
            'price_override' => 6200000,
            'stock_qty' => 20,
            'status' => 'active',
        ]);

        $p3 = Product::create([
            'id' => 3,
            'name' => 'Vợt CRBN 1X Power Series 14mm Raw Carbon',
            'slug' => 'vot-crbn-1x-power-series',
            'brand_id' => $brandMap['crbn']->id ?? null,
            'category_id' => $catMap['vot-pickleball']->id ?? null,
            'base_price' => 4850000,
            'short_description' => 'Toray T700 Raw Carbon nhám tự nhiên trợ lực xoáy bóng và smash uy lực cuối sân',
            'description' => 'Bề mặt Toray T700 Raw Carbon nhám tự nhiên siêu bám bóng, hỗ trợ lực xoáy bóng và smash uy lực vùng cuối sân.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_carbon_technology.png'],
            'specifications' => json_decode('{"material": "Toray T700 Carbon Fiber", "thickness": "14mm & 16mm", "weight": "225g", "usapa_certified": true, "origin": "USA Design"}', true),
        ]);
        ProductVariant::create([
            'id' => 301,
            'product_id' => $p3->id,
            'sku' => 'CRBN-1X-14MM',
            'color' => 'Đen Nhám',
            'weight' => '225g',
            'price_override' => 4850000,
            'stock_qty' => 18,
            'status' => 'active',
        ]);
        ProductVariant::create([
            'id' => 302,
            'product_id' => $p3->id,
            'sku' => 'CRBN-1X-16MM',
            'color' => 'Đen Nhám',
            'weight' => '230g',
            'price_override' => 4850000,
            'stock_qty' => 22,
            'status' => 'active',
        ]);

        $p4 = Product::create([
            'id' => 4,
            'name' => 'Vợt Franklin Signature Pro Carbon 16mm',
            'slug' => 'vot-franklin-signature-pro-carbon',
            'brand_id' => $brandMap['franklin']->id ?? null,
            'category_id' => $catMap['vot-pickleball']->id ?? null,
            'base_price' => 3450000,
            'short_description' => 'Vợt thi đấu chính thức US Open Pickleball Championships điểm ngọt lớn kiểm soát bóng',
            'description' => 'Vợt chính thức của giải thi đấu US Open Pickleball Championships, điểm ngọt lớn, kiểm soát bóng êm ái.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_paddles_collection.jpg'],
            'specifications' => json_decode('{"material": "Carbon Fiber Surface + MaxGrit", "thickness": "16mm Polypropylene Core", "weight": "215g - 225g", "usapa_certified": true, "origin": "Chính hãng"}', true),
        ]);
        ProductVariant::create([
            'id' => 401,
            'product_id' => $p4->id,
            'sku' => 'FRA-SIG-16MM',
            'color' => 'Đen / Vàng',
            'weight' => '225g',
            'price_override' => 3450000,
            'stock_qty' => 25,
            'status' => 'active',
        ]);

        $p5 = Product::create([
            'id' => 5,
            'name' => 'Vợt Six Zero Double Black Diamond Control 16mm',
            'slug' => 'vot-six-zero-double-black-diamond',
            'brand_id' => $brandMap['six-zero']->id ?? null,
            'category_id' => $catMap['vot-pickleball']->id ?? null,
            'base_price' => 4950000,
            'short_description' => 'Raw Toray 700 Carbon nhiệt luyện toàn phần sweetspot cực rộng cho pha dink bóng',
            'description' => 'Raw Toray 700 Carbon nhiệt luyện toàn phần Carbon Fusion Edge, sweetspot cực rộng cho các pha dink bóng sát lưới.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_paddle_joola.jpg'],
            'specifications' => json_decode('{"material": "Premium Japanese Toray 700 Carbon", "thickness": "16mm Honeycomb Core", "weight": "230g", "usapa_certified": true, "origin": "Úc / USA"}', true),
        ]);
        ProductVariant::create([
            'id' => 501,
            'product_id' => $p5->id,
            'sku' => 'SIX-DBD-16MM',
            'color' => 'Carbon Nguyên Bản',
            'weight' => '230g',
            'price_override' => 4950000,
            'stock_qty' => 15,
            'status' => 'active',
        ]);

        $p6 = Product::create([
            'id' => 6,
            'name' => 'Vợt Engage Pursuit Pro EX 6.0 Raw Carbon',
            'slug' => 'vot-engage-pursuit-pro-ex',
            'brand_id' => $brandMap['engage']->id ?? null,
            'category_id' => $catMap['vot-pickleball']->id ?? null,
            'base_price' => 5600000,
            'short_description' => 'Lõi MachPro Black Polymer trợ lực và giảm chấn êm ái tăng xoáy bóng top-spin',
            'description' => 'Lõi MachPro Black Polymer trợ lực và giảm rung chấn chấn thương cổ tay, mặt vợt nhám tăng tỷ lệ xoáy bóng top-spin.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_paddle_balls.jpg'],
            'specifications' => json_decode('{"material": "Toray T700 Raw Carbon + MachPro Core", "thickness": "16mm Core", "weight": "230g - 240g", "usapa_certified": true, "origin": "Made in USA"}', true),
        ]);
        ProductVariant::create([
            'id' => 601,
            'product_id' => $p6->id,
            'sku' => 'ENG-PUR-EX60',
            'color' => 'Đen / Cam',
            'weight' => '235g',
            'price_override' => 5600000,
            'stock_qty' => 14,
            'status' => 'active',
        ]);

        $p7 = Product::create([
            'id' => 7,
            'name' => 'Vợt Gearbox Pro Power Elongated SST Carbon',
            'slug' => 'vot-gearbox-pro-power-elongated',
            'brand_id' => $brandMap['gearbox']->id ?? null,
            'category_id' => $catMap['vot-pickleball']->id ?? null,
            'base_price' => 6500000,
            'short_description' => 'Khung đúc Solid Span Technology không viền bọc lực smash uy lực nhất hiện nay',
            'description' => 'Công nghệ khung đúc nguyên khối Solid Span Technology không viền bọc, độ nảy và lực bóng smash uy lực nhất hiện nay.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_carbon_technology.png'],
            'specifications' => json_decode('{"material": "Patented Solid Carbon Core SST", "thickness": "14mm", "weight": "230g", "usapa_certified": true, "origin": "USA"}', true),
        ]);
        ProductVariant::create([
            'id' => 701,
            'product_id' => $p7->id,
            'sku' => 'GB-PROP-ELON',
            'color' => 'Đen Nhám Cạnh Đỏ',
            'weight' => '230g',
            'price_override' => 6500000,
            'stock_qty' => 10,
            'status' => 'active',
        ]);

        $p8 = Product::create([
            'id' => 8,
            'name' => 'Vợt Diadem Edge 18k Speed Pro Carbon 3D',
            'slug' => 'vot-diadem-edge-18k-speed-pro',
            'brand_id' => $brandMap['diadem']->id ?? null,
            'category_id' => $catMap['vot-pickleball']->id ?? null,
            'base_price' => 5200000,
            'short_description' => 'Bề mặt sợi carbon 18K dạng đan 3D bám bóng triệt tiêu rung giật kiểm soát tinh tế',
            'description' => 'Bề mặt sợi carbon 18K dạng đan 3D độc quyền bám bóng và triệt tiêu lực giật, cho cảm giác chạm bóng tinh tế nhất.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_paddles_collection.jpg'],
            'specifications' => json_decode('{"material": "3D 18K Carbon Fiber Face", "thickness": "16mm Core", "weight": "228g", "usapa_certified": true, "origin": "Mỹ"}', true),
        ]);
        ProductVariant::create([
            'id' => 801,
            'product_id' => $p8->id,
            'sku' => 'DIA-EDG-18K',
            'color' => 'Xanh Teal Carbon',
            'weight' => '228g',
            'price_override' => 5200000,
            'stock_qty' => 16,
            'status' => 'active',
        ]);

        $p9 = Product::create([
            'id' => 9,
            'name' => 'Vợt Paddletek Tempest Pro Bantam v3 Wave',
            'slug' => 'vot-paddletek-tempest-pro-bantam',
            'brand_id' => $brandMap['paddletek']->id ?? null,
            'category_id' => $catMap['vot-pickleball']->id ?? null,
            'base_price' => 4700000,
            'short_description' => 'Bề mặt Smart Response Technology triệt tiêu rung giật khi block bóng phản xạ nhanh',
            'description' => 'Dòng vợt huyền thoại kiểm soát bóng với bề mặt Smart Response Technology triệt tiêu rung giật khi block bóng phản xạ nhanh.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_paddle_joola.jpg'],
            'specifications' => json_decode('{"material": "High Grade Carbon Composite", "thickness": "14.3mm", "weight": "225g", "usapa_certified": true, "origin": "Made in USA"}', true),
        ]);
        ProductVariant::create([
            'id' => 901,
            'product_id' => $p9->id,
            'sku' => 'PAD-TEM-V3',
            'color' => 'Xanh Biển / Bạc',
            'weight' => '225g',
            'price_override' => 4700000,
            'stock_qty' => 12,
            'status' => 'active',
        ]);

        $p10 = Product::create([
            'id' => 10,
            'name' => 'Vợt ProXR Zane Navratil The Standard 14mm Spin',
            'slug' => 'vot-proxr-zane-navratil-standard',
            'brand_id' => $brandMap['proxr']->id ?? null,
            'category_id' => $catMap['vot-pickleball']->id ?? null,
            'base_price' => 4600000,
            'short_description' => 'Cán nghiêng công thái học độc quyền Zane Navratil cổ tay linh hoạt cắt bóng xoáy',
            'description' => 'Thiết kế cán nghiêng công thái học độc quyền của Zane Navratil giúp cổ tay linh hoạt tối đa khi cắt bóng xoáy chéo sân.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_paddle_balls.jpg'],
            'specifications' => json_decode('{"material": "T700 Raw Carbon Ultra Spin", "thickness": "14mm Core", "weight": "232g", "usapa_certified": true, "origin": "USA"}', true),
        ]);
        ProductVariant::create([
            'id' => 1001,
            'product_id' => $p10->id,
            'sku' => 'PXR-ZN-STD14',
            'color' => 'Đen / Xanh Lá',
            'weight' => '232g',
            'price_override' => 4600000,
            'stock_qty' => 15,
            'status' => 'active',
        ]);

        $p11 = Product::create([
            'id' => 11,
            'name' => 'Hộp 12 Quả Bóng Franklin X-40 Outdoor (Vàng Chanh)',
            'slug' => 'bong-franklin-x40-outdoor-12pack',
            'brand_id' => $brandMap['franklin']->id ?? null,
            'category_id' => $catMap['bong-pickleball']->id ?? null,
            'base_price' => 420000,
            'short_description' => 'Bóng thi đấu ngoài trời chuẩn 40 lỗ đục khí động học USAPA Approved độ nảy đồng đều',
            'description' => 'Bóng thi đấu ngoài trời chuẩn 40 lỗ đục khí động học, độ nảy đồng đều và độ bền cao không lo nứt vỡ, USAPA Approved.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_balls_yellow.jpg'],
            'specifications' => json_decode('{"material": "Nhựa nhiệt dẻo đúc nguyên khối", "thickness": "40 lỗ chuẩn ngoài trời", "weight": "26g", "usapa_certified": true, "origin": "USA"}', true),
        ]);
        ProductVariant::create([
            'id' => 1101,
            'product_id' => $p11->id,
            'sku' => 'FRA-X40-YELLOW-PACK12',
            'color' => 'Vàng Chanh',
            'weight' => '26g',
            'price_override' => 420000,
            'stock_qty' => 80,
            'status' => 'active',
        ]);

        $p12 = Product::create([
            'id' => 12,
            'name' => 'Hộp 3 Quả Bóng Dura Fast 40 Chuyên Nghiệp PPA Tour',
            'slug' => 'bong-dura-fast-40-pack3',
            'brand_id' => $brandMap['dura']->id ?? null,
            'category_id' => $catMap['bong-pickleball']->id ?? null,
            'base_price' => 150000,
            'short_description' => 'Bóng thi đấu chính thức giải PPA Tour đường bay nhanh đầm tay tối ưu VĐV',
            'description' => 'Bóng thi đấu chính thức các giải PPA Tour thế giới, đường bay nhanh và đầm tay, tối ưu cho các trận cầu đỉnh cao.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_balls_yellow.jpg'],
            'specifications' => json_decode('{"material": "Polyethylene công nghiệp cứng", "thickness": "40 lỗ gia công CNC", "weight": "26g", "usapa_certified": true, "origin": "USA"}', true),
        ]);
        ProductVariant::create([
            'id' => 1201,
            'product_id' => $p12->id,
            'sku' => 'DUR-FAST40-PACK3',
            'color' => 'Vàng Neon',
            'weight' => '26g',
            'price_override' => 150000,
            'stock_qty' => 120,
            'status' => 'active',
        ]);

        $p13 = Product::create([
            'id' => 13,
            'name' => 'Hộp 12 Quả Bóng Onix Fuse G2 Indoor (Màu Cam Sáng)',
            'slug' => 'bong-onix-fuse-g2-indoor',
            'brand_id' => $brandMap['onix']->id ?? null,
            'category_id' => $catMap['bong-pickleball']->id ?? null,
            'base_price' => 450000,
            'short_description' => 'Bóng thi đấu trong nhà chuẩn 26 lỗ lớn quỹ đạo ổn định độ bám sân cao',
            'description' => 'Bóng thi đấu trong nhà chuẩn 26 lỗ kích thước lớn, quỹ đạo bay ổn định, độ bám mặt sân cao không trơn trượt.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_balls_yellow.jpg'],
            'specifications' => json_decode('{"material": "Nhựa dẻo giảm tiếng ồn", "thickness": "26 lỗ trong nhà", "weight": "25g", "usapa_certified": true, "origin": "USA"}', true),
        ]);
        ProductVariant::create([
            'id' => 1301,
            'product_id' => $p13->id,
            'sku' => 'ONX-FUSE2-PACK12',
            'color' => 'Cam Sáng Indoor',
            'weight' => '25g',
            'price_override' => 450000,
            'stock_qty' => 60,
            'status' => 'active',
        ]);

        $p14 = Product::create([
            'id' => 14,
            'name' => 'Hộp 6 Quả Bóng JOOLA Primo Ball Outdoor USAPA',
            'slug' => 'bong-joola-primo-outdoor-6pack',
            'brand_id' => $brandMap['joola']->id ?? null,
            'category_id' => $catMap['bong-pickleball']->id ?? null,
            'base_price' => 260000,
            'short_description' => 'Nhựa đàn hồi cao cấp chống méo nứt khi nắng gắt độ nảy ổn định chuẩn USAPA',
            'description' => 'Hạt nhựa đàn hồi cao cấp chống biến dạng khi thời tiết lạnh hoặc nắng gắt, độ nảy giữ chuẩn sau hàng trăm trận đấu.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_balls_yellow.jpg'],
            'specifications' => json_decode('{"material": "Polyethylene dẻo nhiệt chống méo", "thickness": "40 lỗ đục cân bằng", "weight": "26g", "usapa_certified": true, "origin": "Chính hãng"}', true),
        ]);
        ProductVariant::create([
            'id' => 1401,
            'product_id' => $p14->id,
            'sku' => 'JOO-PRIMO-PACK6',
            'color' => 'Vàng Quang Học',
            'weight' => '26g',
            'price_override' => 260000,
            'stock_qty' => 75,
            'status' => 'active',
        ]);

        $p15 = Product::create([
            'id' => 15,
            'name' => 'Hộp 12 Quả Bóng Selkirk Pro S1 Tour Ball',
            'slug' => 'bong-selkirk-pro-s1-tour-ball',
            'brand_id' => $brandMap['selkirk']->id ?? null,
            'category_id' => $catMap['bong-pickleball']->id ?? null,
            'base_price' => 480000,
            'short_description' => 'Công nghệ đúc vi mô khí động học bóng bay thẳng xoáy chuẩn trong gió lớn',
            'description' => 'Thiết kế khí động học được nghiên cứu chuyên sâu đảm bảo bóng bay thẳng và xoáy chuẩn xác trong gió lớn.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_balls_yellow.jpg'],
            'specifications' => json_decode('{"material": "Khuôn đúc cân bằng vi mô", "thickness": "40 lỗ tròn khí động học", "weight": "26.2g", "usapa_certified": true, "origin": "USA"}', true),
        ]);
        ProductVariant::create([
            'id' => 1501,
            'product_id' => $p15->id,
            'sku' => 'SEL-S1TOUR-PACK12',
            'color' => 'Vàng Neon',
            'weight' => '26.2g',
            'price_override' => 480000,
            'stock_qty' => 50,
            'status' => 'active',
        ]);

        $p16 = Product::create([
            'id' => 16,
            'name' => 'Thùng 100 Quả Bóng Pickleball Tập Luyện Câu Lạc Bộ DemoPick',
            'slug' => 'thung-100-bong-tap-luyen-demopick',
            'brand_id' => $brandMap['demopick']->id ?? null,
            'category_id' => $catMap['bong-pickleball']->id ?? null,
            'base_price' => 2650000,
            'short_description' => 'Thùng 100 quả bóng dập logo DemoPick siêu bền tối ưu cho CLB và máy bắn bóng',
            'description' => 'Thùng bóng số lượng lớn tối ưu chi phí cho các câu lạc bộ, lớp huấn luyện và máy bắn bóng tự động.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_balls_yellow.jpg'],
            'specifications' => json_decode('{"material": "Nhựa dẻo siêu bền chống nứt vỡ", "thickness": "40 lỗ tiêu chuẩn", "weight": "26g", "usapa_certified": true, "origin": "Việt Nam"}', true),
        ]);
        ProductVariant::create([
            'id' => 1601,
            'product_id' => $p16->id,
            'sku' => 'DMP-BALL100-BUCKET',
            'color' => 'Vàng Chuẩn CLB',
            'weight' => '26g / quả',
            'price_override' => 2650000,
            'stock_qty' => 30,
            'status' => 'active',
        ]);

        $p17 = Product::create([
            'id' => 17,
            'name' => 'Balo Pickleball JOOLA Tour Elite Pro Backpack',
            'slug' => 'balo-pickleball-joola-tour-elite-pro',
            'brand_id' => $brandMap['joola']->id ?? null,
            'category_id' => $catMap['phu-kien-bao-vot']->id ?? null,
            'base_price' => 1850000,
            'short_description' => 'Ngăn cách nhiệt bảo vệ 4 vợt, ngăn giày thông gió riêng và móc treo sân tiện lợi',
            'description' => 'Balo đựng vợt chuyên nghiệp có ngăn cách nhiệt chứa 4 cây vợt, ngăn thông gió đựng giày và móc treo hàng rào sân cực tiện.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_backpack_apex.jpg'],
            'specifications' => json_decode('{"material": "900D Nylon chống thấm", "thickness": "Ngăn Thermoguard", "weight": "850g", "usapa_certified": true, "origin": "Chính hãng"}', true),
        ]);
        ProductVariant::create([
            'id' => 1701,
            'product_id' => $p17->id,
            'sku' => 'JOO-BAG-ELITE',
            'color' => 'Đen / Xám Than',
            'weight' => '850g',
            'price_override' => 1850000,
            'stock_qty' => 25,
            'status' => 'active',
        ]);

        $p18 = Product::create([
            'id' => 18,
            'name' => 'Túi Du Lịch Pickleball Selkirk Team Duffle Bag',
            'slug' => 'tui-du-lich-selkirk-team-duffle',
            'brand_id' => $brandMap['selkirk']->id ?? null,
            'category_id' => $catMap['phu-kien-bao-vot']->id ?? null,
            'base_price' => 1650000,
            'short_description' => 'Thể tích lớn chứa 6 vợt, bóng, khăn thi đấu cho các giải đấu xa',
            'description' => 'Thể tích lớn chứa trọn bộ 6 cây vợt, bóng, khăn và phụ kiện cho các giải đấu xa.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_backpack_apex.jpg'],
            'specifications' => json_decode('{"material": "Poly Fabric chống nước cao cấp", "thickness": "Đáy gia cố chống va đập", "weight": "900g", "usapa_certified": true, "origin": "USA"}', true),
        ]);
        ProductVariant::create([
            'id' => 1801,
            'product_id' => $p18->id,
            'sku' => 'SEL-BAG-DUFFLE',
            'color' => 'Đỏ / Đen',
            'weight' => '900g',
            'price_override' => 1650000,
            'stock_qty' => 20,
            'status' => 'active',
        ]);

        $p19 = Product::create([
            'id' => 19,
            'name' => 'Balo Đựng Vợt Franklin Pro Series Court Backpack',
            'slug' => 'balo-franklin-pro-series-court',
            'brand_id' => $brandMap['franklin']->id ?? null,
            'category_id' => $catMap['phu-kien-bao-vot']->id ?? null,
            'base_price' => 1250000,
            'short_description' => 'Quai đeo công thái học êm ái chống mỏi lưng túi phụ giữ lạnh bình nước 1L',
            'description' => 'Quai đeo công thái học êm ái chống mỏi lưng, túi phụ bên hông giữ lạnh bình nước 1 lít.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_backpack_apex.jpg'],
            'specifications' => json_decode('{"material": "Polyester trượt nước", "thickness": "Đệm chống sốc 3 lớp", "weight": "750g", "usapa_certified": true, "origin": "Chính hãng"}', true),
        ]);
        ProductVariant::create([
            'id' => 1901,
            'product_id' => $p19->id,
            'sku' => 'FRA-BAG-COURT',
            'color' => 'Xám Phối Đen',
            'weight' => '750g',
            'price_override' => 1250000,
            'stock_qty' => 30,
            'status' => 'active',
        ]);

        $p20 = Product::create([
            'id' => 20,
            'name' => 'Bao Da Bảo Vệ Mặt Vợt CRBN Neoprene Paddle Cover',
            'slug' => 'bao-da-bao-ve-mat-vot-crbn',
            'brand_id' => $brandMap['crbn']->id ?? null,
            'category_id' => $catMap['phu-kien-bao-vot']->id ?? null,
            'base_price' => 290000,
            'short_description' => 'Bọc đệm Neoprene dày dặn chống trầy xước bảo vệ độ nhám Toray T700',
            'description' => 'Bọc đệm cao su Neoprene dày dặn chống trầy xước và bảo vệ độ nhám bề mặt Carbon T700 của vợt.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_carbon_technology.png'],
            'specifications' => json_decode('{"material": "Cao su Neoprene co giãn", "thickness": "Đệm 5mm", "weight": "120g", "usapa_certified": true, "origin": "USA"}', true),
        ]);
        ProductVariant::create([
            'id' => 2001,
            'product_id' => $p20->id,
            'sku' => 'CRBN-COV-NEO',
            'color' => 'Đen Mờ Logo Trắng',
            'weight' => '120g',
            'price_override' => 290000,
            'stock_qty' => 45,
            'status' => 'active',
        ]);

        $p21 = Product::create([
            'id' => 21,
            'name' => 'Túi Đeo Chéo Pickleball Sling Bag Chống Thấm Nước',
            'slug' => 'tui-deo-cheo-pickleball-sling-bag',
            'brand_id' => $brandMap['demopick']->id ?? null,
            'category_id' => $catMap['phu-kien-bao-vot']->id ?? null,
            'base_price' => 420000,
            'short_description' => 'Sling bag đeo chéo năng động nhỏ gọn chứa 2 vợt, 4 bóng và đồ cá nhân',
            'description' => 'Thiết kế sling bag năng động đeo chéo gọn nhẹ chứa 2 cây vợt, 4 quả bóng và điện thoại cá nhân.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_backpack_apex.jpg'],
            'specifications' => json_decode('{"material": "Vải Oxford chống nước", "thickness": "Ngăn lót chống sốc", "weight": "350g", "usapa_certified": true, "origin": "Việt Nam"}', true),
        ]);
        ProductVariant::create([
            'id' => 2101,
            'product_id' => $p21->id,
            'sku' => 'DMP-SLING-BAG',
            'color' => 'Đen Xanh Emerald',
            'weight' => '350g',
            'price_override' => 420000,
            'stock_qty' => 50,
            'status' => 'active',
        ]);

        $p22 = Product::create([
            'id' => 22,
            'name' => 'Giày Thi Đấu Pickleball Babolat Jet Mach 3 Pro Court',
            'slug' => 'giay-pickleball-babolat-jet-mach-3',
            'brand_id' => $brandMap['babolat']->id ?? null,
            'category_id' => $catMap['quan-ao-trang-phuc']->id ?? null,
            'base_price' => 2950000,
            'short_description' => 'Đế cao su Michelin bám sân thân dệt Matryx EVO siêu nhẹ bứt tốc ngang êm ái',
            'description' => 'Đế cao su Michelin siêu bám mặt sân pickleball, thân giày dệt Matryx EVO siêu nhẹ bảo vệ cổ chân và khớp gối khi bứt tốc ngang.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_shoes.jpg'],
            'specifications' => json_decode('{"material": "Matryx EVO Fabric + Michelin Rubber", "thickness": "Đệm KPRS-X", "weight": "310g", "usapa_certified": true, "origin": "Pháp / Chính hãng"}', true),
        ]);
        ProductVariant::create([
            'id' => 2201,
            'product_id' => $p22->id,
            'sku' => 'BAB-JET3-41',
            'color' => 'Xanh Navy / Cam',
            'weight' => '310g',
            'price_override' => 2950000,
            'stock_qty' => 12,
            'status' => 'active',
        ]);
        ProductVariant::create([
            'id' => 2202,
            'product_id' => $p22->id,
            'sku' => 'BAB-JET3-42',
            'color' => 'Xanh Navy / Cam',
            'weight' => '315g',
            'price_override' => 2950000,
            'stock_qty' => 15,
            'status' => 'active',
        ]);

        $p23 = Product::create([
            'id' => 23,
            'name' => 'Giày Chuyên Sân Pickleball Wilson Rush Pro Ace Court',
            'slug' => 'giay-pickleball-wilson-rush-pro-ace',
            'brand_id' => $brandMap['wilson']->id ?? null,
            'category_id' => $catMap['quan-ao-trang-phuc']->id ?? null,
            'base_price' => 2450000,
            'short_description' => 'Khung 4D Support Chassis kiểm soát vặn xoắn đế Duralast bền bỉ trên sân cứng',
            'description' => 'Mũi giày gia cố 4D Support Chassis kiểm soát chuyển động vặn xoắn, đế Duralast chống mòn tối đa trên sân cứng.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_shoes.jpg'],
            'specifications' => json_decode('{"material": "Sensifeel Mesh + Duralast Rubber", "thickness": "Khung 4D Chassis", "weight": "330g", "usapa_certified": true, "origin": "Mỹ"}', true),
        ]);
        ProductVariant::create([
            'id' => 2301,
            'product_id' => $p23->id,
            'sku' => 'WIL-RUSH-41',
            'color' => 'Trắng / Xanh Đậm',
            'weight' => '330g',
            'price_override' => 2450000,
            'stock_qty' => 10,
            'status' => 'active',
        ]);
        ProductVariant::create([
            'id' => 2302,
            'product_id' => $p23->id,
            'sku' => 'WIL-RUSH-42',
            'color' => 'Trắng / Xanh Đậm',
            'weight' => '335g',
            'price_override' => 2450000,
            'stock_qty' => 14,
            'status' => 'active',
        ]);

        $p24 = Product::create([
            'id' => 24,
            'name' => 'Áo Đấu Pickleball Dry-Fit Unisex JOOLA Team Pro',
            'slug' => 'ao-dau-pickleball-dryfit-joola-team-pro',
            'brand_id' => $brandMap['joola']->id ?? null,
            'category_id' => $catMap['quan-ao-trang-phuc']->id ?? null,
            'base_price' => 380000,
            'short_description' => 'Vải mè vi sợi QuickDry co giãn 4 chiều thoát nhiệt siêu tốc khi vận động mạnh',
            'description' => 'Chất liệu vải mè vi sợi QuickDry co giãn 4 chiều, công nghệ làm mát thân nhiệt hỗ trợ vận động cường độ cao.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_shirt_dryfit.jpg'],
            'specifications' => json_decode('{"material": "88% Polyester + 12% Spandex", "thickness": "Dệt mè lỗ kim thoáng khí", "weight": "160g", "usapa_certified": true, "origin": "Chính hãng"}', true),
        ]);
        ProductVariant::create([
            'id' => 2401,
            'product_id' => $p24->id,
            'sku' => 'JOO-TSHIRT-M',
            'color' => 'Trắng / Viền Xanh',
            'weight' => '160g',
            'price_override' => 380000,
            'stock_qty' => 35,
            'status' => 'active',
        ]);
        ProductVariant::create([
            'id' => 2402,
            'product_id' => $p24->id,
            'sku' => 'JOO-TSHIRT-L',
            'color' => 'Trắng / Viền Xanh',
            'weight' => '170g',
            'price_override' => 380000,
            'stock_qty' => 40,
            'status' => 'active',
        ]);

        $p25 = Product::create([
            'id' => 25,
            'name' => 'Quần Short Thể Thao Pickleball Selkirk Performance Có Túi Sâu',
            'slug' => 'quan-short-the-thao-selkirk-performance',
            'brand_id' => $brandMap['selkirk']->id ?? null,
            'category_id' => $catMap['quan-ao-trang-phuc']->id ?? null,
            'base_price' => 320000,
            'short_description' => 'Túi sâu đặc dụng chứa gọn 2 quả bóng pickleball không bị rơi văng khi di chuyển',
            'description' => 'Thiết kế túi sâu đặc dụng chứa gọn 2 quả bóng pickleball không bị rơi văng ra khi di chuyển cứu bóng.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_shorts.jpg'],
            'specifications' => json_decode('{"material": "Co giãn 4 chiều mềm nhẹ", "thickness": "Túi sâu ôm bóng", "weight": "180g", "usapa_certified": true, "origin": "USA"}', true),
        ]);
        ProductVariant::create([
            'id' => 2501,
            'product_id' => $p25->id,
            'sku' => 'SEL-SHORT-M',
            'color' => 'Đen Thể Thao',
            'weight' => '180g',
            'price_override' => 320000,
            'stock_qty' => 30,
            'status' => 'active',
        ]);
        ProductVariant::create([
            'id' => 2502,
            'product_id' => $p25->id,
            'sku' => 'SEL-SHORT-L',
            'color' => 'Đen Thể Thao',
            'weight' => '190g',
            'price_override' => 320000,
            'stock_qty' => 30,
            'status' => 'active',
        ]);

        $p26 = Product::create([
            'id' => 26,
            'name' => 'Nón Thể Thao Visor Chắn Nắng Sân Ngoài Trời Franklin Pro',
            'slug' => 'non-visor-chan-nang-franklin-pro',
            'brand_id' => $brandMap['franklin']->id ?? null,
            'category_id' => $catMap['quan-ao-trang-phuc']->id ?? null,
            'base_price' => 180000,
            'short_description' => 'Nón nửa đầu VĐV chống chói đèn LED và nắng gắt vành thấm hút mồ hôi trán',
            'description' => 'Nón nửa đầu phong cách VĐV chuyên nghiệp, vành chắn chống lóa đèn LED sân và chống nắng gắt, thấm hút mồ hôi trán.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/sports_visor_hat.jpg'],
            'specifications' => json_decode('{"material": "Sợi Poly siêu nhẹ", "thickness": "Băng trán kháng khuẩn", "weight": "65g", "usapa_certified": true, "origin": "Chính hãng"}', true),
        ]);
        ProductVariant::create([
            'id' => 2601,
            'product_id' => $p26->id,
            'sku' => 'FRA-VISOR-WHT',
            'color' => 'Trắng Tinh',
            'weight' => '65g',
            'price_override' => 180000,
            'stock_qty' => 50,
            'status' => 'active',
        ]);

        $p27 = Product::create([
            'id' => 27,
            'name' => 'Set 3 Cuộn Quấn Cán Vợt Pickleball Wilson Pro Overgrip',
            'slug' => 'set-3-cuon-quan-can-wilson-pro-overgrip',
            'brand_id' => $brandMap['wilson']->id ?? null,
            'category_id' => $catMap['phu-kien-bao-vot']->id ?? null,
            'base_price' => 125000,
            'short_description' => 'Băng quấn cán siêu thấm mồ hôi tay bề mặt gai êm ái chống tuột cán khi smash',
            'description' => 'Băng quấn cán mỏng 0.5mm siêu thấm mồ hôi tay, bề mặt gai êm ái chống tuột tay trong các pha smash mạnh.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_overgrip_tape.jpg'],
            'specifications' => json_decode('{"material": "Polyurethane vi xốp siêu thấm", "thickness": "0.5mm x 110cm", "weight": "30g", "usapa_certified": true, "origin": "Mỹ"}', true),
        ]);
        ProductVariant::create([
            'id' => 2701,
            'product_id' => $p27->id,
            'sku' => 'WIL-GRIP-3PK',
            'color' => 'Trắng Cổ Điển',
            'weight' => '30g',
            'price_override' => 125000,
            'stock_qty' => 120,
            'status' => 'active',
        ]);

        $p28 = Product::create([
            'id' => 28,
            'name' => 'Vỉ 4 Thanh Chì Dán Cân Bằng Đầu Vợt Lead Tape 3g',
            'slug' => 'vi-thanh-chi-dan-can-bang-lead-tape-3g',
            'brand_id' => $brandMap['crbn']->id ?? null,
            'category_id' => $catMap['phu-kien-bao-vot']->id ?? null,
            'base_price' => 95000,
            'short_description' => 'Chì dán kết dính 3M tăng trọng lượng vung vợt và mở rộng sweetspot',
            'description' => 'Tăng trọng lượng vung vợt và mở rộng diện tích điểm ngọt sweetspot theo phong cách cá nhân của người chơi chuyên nghiệp.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_carbon_technology.png'],
            'specifications' => json_decode('{"material": "Chì dán kết dính 3M cao cấp", "thickness": "Thanh 5cm x 1cm", "weight": "12g tổng", "usapa_certified": true, "origin": "USA"}', true),
        ]);
        ProductVariant::create([
            'id' => 2801,
            'product_id' => $p28->id,
            'sku' => 'CRBN-LEAD-4PK',
            'color' => 'Bạc Kim Loại',
            'weight' => '12g',
            'price_override' => 95000,
            'stock_qty' => 70,
            'status' => 'active',
        ]);

        $p29 = Product::create([
            'id' => 29,
            'name' => 'Cục Gôm Tẩy Vết Bẩn & Bụi Mặt Vợt Carbon Eraser Raw Cleaner',
            'slug' => 'cuc-gom-tay-ve-sinh-mat-vot-carbon-eraser',
            'brand_id' => $brandMap['demopick']->id ?? null,
            'category_id' => $catMap['phu-kien-bao-vot']->id ?? null,
            'base_price' => 120000,
            'short_description' => 'Khôi phục độ nhám nguyên bản mặt sợi Toray T700 chỉ sau 30 giây chà nhẹ',
            'description' => 'Khôi phục độ nhám nguyên bản của mặt sợi Toray Carbon T700, tẩy sạch sợi bóng bám vào sau 30 giây chà nhẹ.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_carbon_technology.png'],
            'specifications' => json_decode('{"material": "Hợp chất cao su đặc biệt chuyên dụng", "thickness": "Khối 5cm x 5cm x 2.5cm", "weight": "50g", "usapa_certified": true, "origin": "Việt Nam"}', true),
        ]);
        ProductVariant::create([
            'id' => 2901,
            'product_id' => $p29->id,
            'sku' => 'DMP-ERASER-01',
            'color' => 'Xám Cao Su',
            'weight' => '50g',
            'price_override' => 120000,
            'stock_qty' => 85,
            'status' => 'active',
        ]);

        $p30 = Product::create([
            'id' => 30,
            'name' => 'Bộ Lưới Di Động Thi Đấu Pickleball USAPA 22-Feet Kèm Khung Thép',
            'slug' => 'bo-luoi-di-dong-pickleball-usapa-22-feet',
            'brand_id' => $brandMap['franklin']->id ?? null,
            'category_id' => $catMap['phu-kien-bao-vot']->id ?? null,
            'base_price' => 2150000,
            'short_description' => 'Khung thép sơn tĩnh điện tháo lắp 5 phút chuẩn USAPA 22ft tặng kèm túi đựng',
            'description' => 'Bộ khung thép sơn tĩnh điện tháo lắp nhanh chuẩn USAPA dài 22ft, chiều cao tâm lưới chuẩn 34 inch và hai đầu 36 inch.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_net_portable.jpg'],
            'specifications' => json_decode('{"material": "Khung thép sơn tĩnh điện + Lưới PE chống UV", "thickness": "Dài 22 feet (6.7m)", "weight": "9.5kg", "usapa_certified": true, "origin": "Chính hãng"}', true),
        ]);
        ProductVariant::create([
            'id' => 3001,
            'product_id' => $p30->id,
            'sku' => 'FRA-NET-PORT22',
            'color' => 'Khung Đen / Lưới Trắng',
            'weight' => '9.5kg',
            'price_override' => 2150000,
            'stock_qty' => 15,
            'status' => 'active',
        ]);

        $p31 = Product::create([
            'id' => 31,
            'name' => 'Nước Bù Điện Giải Pocari Sweat Ion Supply 500ml',
            'slug' => 'nuoc-bu-dien-giai-pocari-sweat-500ml',
            'brand_id' => $brandMap['pocari']->id ?? null,
            'category_id' => $catMap['do-uong-do-an']->id ?? null,
            'base_price' => 25000,
            'short_description' => 'Bù nước & 5 ion thiết yếu tương đồng dịch cơ thể hấp thụ nhanh cho VĐV',
            'description' => 'Bù nước và 5 loại ion thiết yếu (Na+, K+, Cl-, Ca2+, Mg2+) tương đồng dịch cơ thể, hấp thụ nhanh gấp 2.2 lần nước thường.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pocari_sweat_500ml.jpg'],
            'specifications' => json_decode('{"material": "Nước bù điện giải ion", "thickness": "500ml", "weight": "500g", "usapa_certified": true, "origin": "Otsuka Nhật Bản"}', true),
        ]);
        ProductVariant::create([
            'id' => 3101,
            'product_id' => $p31->id,
            'sku' => 'POC-500ML',
            'color' => 'Xanh Dương',
            'weight' => '500g',
            'price_override' => 25000,
            'stock_qty' => 120,
            'status' => 'active',
        ]);

        $p32 = Product::create([
            'id' => 32,
            'name' => 'Nước Thể Thao Revive Chanh Muối 500ml',
            'slug' => 'nuoc-the-thao-revive-chanh-muoi-500ml',
            'brand_id' => $brandMap['revive']->id ?? null,
            'category_id' => $catMap['do-uong-do-an']->id ?? null,
            'base_price' => 20000,
            'short_description' => 'Bổ sung muối khoáng vitamin B3, B6, B12 và vị chanh muối thanh mát',
            'description' => 'Bổ sung muối khoáng, vitamin B3, B6, B12 và vị chanh muối thanh mát xua tan cơn khát và chống mỏi cơ khi thi đấu.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/revive_lemon_drink.jpg'],
            'specifications' => json_decode('{"material": "Nước isotonic thể thao", "thickness": "500ml", "weight": "500g", "usapa_certified": true, "origin": "PepsiCo Việt Nam"}', true),
        ]);
        ProductVariant::create([
            'id' => 3201,
            'product_id' => $p32->id,
            'sku' => 'REV-500ML',
            'color' => 'Vàng Chanh',
            'weight' => '500g',
            'price_override' => 20000,
            'stock_qty' => 100,
            'status' => 'active',
        ]);

        $p33 = Product::create([
            'id' => 33,
            'name' => 'Nước Tăng Lực Red Bull Thái Lan Lon 250ml',
            'slug' => 'nuoc-tang-luc-red-bull-thai-lan-250ml',
            'brand_id' => $brandMap['red-bull']->id ?? null,
            'category_id' => $catMap['do-uong-do-an']->id ?? null,
            'base_price' => 25000,
            'short_description' => 'Lon vàng lùn nạp năng lượng bùng nổ tăng tỉnh táo và phản xạ thần kinh',
            'description' => 'Nạp năng lượng bùng nổ, tăng cường sự tỉnh táo và phản xạ thần kinh trong các trận thi đấu căng thẳng.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/red_bull_can.jpg'],
            'specifications' => json_decode('{"material": "Taurine, Caffeine, Vitamin nhóm B", "thickness": "250ml", "weight": "250g", "usapa_certified": true, "origin": "Thái Lan"}', true),
        ]);
        ProductVariant::create([
            'id' => 3301,
            'product_id' => $p33->id,
            'sku' => 'RED-250ML',
            'color' => 'Lon Vàng',
            'weight' => '250g',
            'price_override' => 25000,
            'stock_qty' => 90,
            'status' => 'active',
        ]);

        $p34 = Product::create([
            'id' => 34,
            'name' => 'Nước Khoáng Thiên Nhiên La Vie 500ml',
            'slug' => 'nuoc-khoang-thien-nhien-lavie-500ml',
            'brand_id' => $brandMap['lavie']->id ?? null,
            'category_id' => $catMap['do-uong-do-an']->id ?? null,
            'base_price' => 12000,
            'short_description' => 'Nước khoáng thiên nhiên thanh khiết ướp lạnh sảng khoái giải khát',
            'description' => 'Nước khoáng thiên nhiên đóng chai thanh khiết, ướp lạnh sảng khoái bổ sung khoáng chất vi lượng an lành.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/water_bottle_lavie.jpg'],
            'specifications' => json_decode('{"material": "Khoáng thiên nhiên đóng chai", "thickness": "500ml", "weight": "500g", "usapa_certified": true, "origin": "Nestlé Waters Việt Nam"}', true),
        ]);
        ProductVariant::create([
            'id' => 3401,
            'product_id' => $p34->id,
            'sku' => 'LAV-500ML',
            'color' => 'Trong Suốt',
            'weight' => '500g',
            'price_override' => 12000,
            'stock_qty' => 200,
            'status' => 'active',
        ]);

        $p35 = Product::create([
            'id' => 35,
            'name' => 'Nước Dừa Tươi Bến Tre Nguyên Trái Ướp Lạnh',
            'slug' => 'nuoc-dua-tuoi-ben-tre-nguyen-trai',
            'brand_id' => $brandMap['demopick']->id ?? null,
            'category_id' => $catMap['do-uong-do-an']->id ?? null,
            'base_price' => 30000,
            'short_description' => 'Dừa xiêm gọt sọ ướp lạnh dồi dào Kali tự nhiên phòng ngừa chuột rút hiệu quả',
            'description' => 'Dừa xiêm gọt sọ Bến Tre ướp lạnh, dồi dào chất điện giải tự nhiên và khoáng Kali giúp phòng ngừa chuột rút hiệu quả.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/fresh_coconut.jpg'],
            'specifications' => json_decode('{"material": "100% Nước dừa tươi nguyên chất", "thickness": "Trái 400ml - 500ml", "weight": "500g", "usapa_certified": true, "origin": "Bến Tre, Việt Nam"}', true),
        ]);
        ProductVariant::create([
            'id' => 3501,
            'product_id' => $p35->id,
            'sku' => 'COCO-FRESH',
            'color' => 'Trắng Gọt Sọ',
            'weight' => '500g',
            'price_override' => 30000,
            'stock_qty' => 60,
            'status' => 'active',
        ]);

        $p36 = Product::create([
            'id' => 36,
            'name' => 'Trà Chanh Sả Mật Ong Tươi Ướp Lạnh 500ml',
            'slug' => 'tra-chanh-sa-mat-ong-tuoi-500ml',
            'brand_id' => $brandMap['demopick']->id ?? null,
            'category_id' => $catMap['do-uong-do-an']->id ?? null,
            'base_price' => 28000,
            'short_description' => 'Trà thảo mộc pha trong ngày từ cốt chanh tươi, sả đập dập và mật ong hoa nhãn',
            'description' => 'Trà thảo mộc tươi pha trong ngày từ lá trà xanh hảo hạng, nước cốt chanh tươi, sả đập dập và mật ong hoa nhãn giải nhiệt.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/iced_lemon_tea.jpg'],
            'specifications' => json_decode('{"material": "Trà xanh, chanh tươi, sả tươi, mật ong", "thickness": "500ml", "weight": "500g", "usapa_certified": true, "origin": "Pha chế tại Quầy Sân"}', true),
        ]);
        ProductVariant::create([
            'id' => 3601,
            'product_id' => $p36->id,
            'sku' => 'TEA-LEMON-500',
            'color' => 'Vàng Hổ Phách',
            'weight' => '500g',
            'price_override' => 28000,
            'stock_qty' => 50,
            'status' => 'active',
        ]);

        $p37 = Product::create([
            'id' => 37,
            'name' => 'Cà Phê Sữa Đá Chiết Xuất Lạnh Cold Brew DemoPick 350ml',
            'slug' => 'ca-phe-sua-da-cold-brew-demopick-350ml',
            'brand_id' => $brandMap['demopick']->id ?? null,
            'category_id' => $catMap['do-uong-do-an']->id ?? null,
            'base_price' => 35000,
            'short_description' => 'Arabica Cầu Đất ủ lạnh 16 tiếng đậm vị mượt mà mang lại tỉnh táo tập trung cao độ',
            'description' => 'Hạt Arabica Cầu Đất ủ lạnh 16 tiếng đậm vị mượt mà, hòa cùng sữa tươi ít béo mang lại sự tỉnh táo tập trung tối đa cho người chơi.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/cold_brew_coffee.jpg'],
            'specifications' => json_decode('{"material": "Cà phê Arabica Cầu Đất ủ lạnh + Sữa tươi", "thickness": "Chai thủy tinh 350ml", "weight": "350g", "usapa_certified": true, "origin": "DemoPick Kitchen"}', true),
        ]);
        ProductVariant::create([
            'id' => 3701,
            'product_id' => $p37->id,
            'sku' => 'CB-COFFEE-350',
            'color' => 'Nâu Cà Phê Sữa',
            'weight' => '350g',
            'price_override' => 35000,
            'stock_qty' => 40,
            'status' => 'active',
        ]);

        $p38 = Product::create([
            'id' => 38,
            'name' => 'Thanh Năng Lượng Hạt Dinh Dưỡng Granola Protein Bar 50g',
            'slug' => 'thanh-nang-luong-granola-protein-bar-50g',
            'brand_id' => $brandMap['nature-valley']->id ?? null,
            'category_id' => $catMap['do-uong-do-an']->id ?? null,
            'base_price' => 35000,
            'short_description' => 'Chứa 12g protein từ yến mạch hạnh nhân chống đói hạ đường huyết giữa trận',
            'description' => 'Chứa 12g protein từ yến mạch nguyên cám, hạt hạnh nhân và hạt điều, giải pháp chống đói hạ đường huyết hoàn hảo giữa hai set đấu.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/protein_granola_bar.jpg'],
            'specifications' => json_decode('{"material": "Yến mạch, hạnh nhân, hạt điều, whey protein", "thickness": "Thanh 50g", "weight": "50g", "usapa_certified": true, "origin": "Nhập khẩu Mỹ"}', true),
        ]);
        ProductVariant::create([
            'id' => 3801,
            'product_id' => $p38->id,
            'sku' => 'BAR-PRO-50G',
            'color' => 'Nâu Hạt Ngũ Cốc',
            'weight' => '50g',
            'price_override' => 35000,
            'stock_qty' => 80,
            'status' => 'active',
        ]);

        $p39 = Product::create([
            'id' => 39,
            'name' => 'Bánh Sô-cô-la Đậu Phộng Năng Lượng Snickers Bar 50g',
            'slug' => 'banh-socola-dau-phong-snickers-bar-50g',
            'brand_id' => $brandMap['snickers']->id ?? null,
            'category_id' => $catMap['do-uong-do-an']->id ?? null,
            'base_price' => 30000,
            'short_description' => 'Nạp calo nhanh chóng với caramel dẻo, đậu phộng giòn phủ socola sữa thơm ngon',
            'description' => 'Nạp calo nhanh chóng với lớp caramel dẻo ngọt, đậu phộng rang giòn thơm bùi phủ chocolate sữa chất lượng.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/snickers_bar.jpg'],
            'specifications' => json_decode('{"material": "Đậu phộng rang, caramel, kẹo mềm xốp, socola sữa", "thickness": "250 kcal / thanh", "weight": "50g", "usapa_certified": true, "origin": "Chính hãng Mars"}', true),
        ]);
        ProductVariant::create([
            'id' => 3901,
            'product_id' => $p39->id,
            'sku' => 'SNK-BAR-50G',
            'color' => 'Nâu Socola',
            'weight' => '50g',
            'price_override' => 30000,
            'stock_qty' => 90,
            'status' => 'active',
        ]);

        $p40 = Product::create([
            'id' => 40,
            'name' => 'Chuối Tiêu Tươi Thể Thao Dole Farm Tiêu Chuẩn',
            'slug' => 'chuoi-tieu-tuoi-the-thao-dole-farm',
            'brand_id' => $brandMap['dole']->id ?? null,
            'category_id' => $catMap['do-uong-do-an']->id ?? null,
            'base_price' => 15000,
            'short_description' => 'Bổ sung Kali tự nhiên và carbohydrate dễ tiêu hóa chống chuột rút khi thi đấu',
            'description' => '"Thực phẩm vàng" của các vận động viên tennis & pickleball chuyên nghiệp, bổ sung carbohydrate dễ tiêu hóa và Kali chống chuột rút.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/dole_banana.jpg'],
            'specifications' => json_decode('{"material": "100% Chuối tiêu tươi Dole đạt chuẩn GAP", "thickness": "Trái 150g - 180g", "weight": "160g", "usapa_certified": true, "origin": "Dole Farm"}', true),
        ]);
        ProductVariant::create([
            'id' => 4001,
            'product_id' => $p40->id,
            'sku' => 'DOLE-BANANA-01',
            'color' => 'Vàng Tươi',
            'weight' => '160g',
            'price_override' => 15000,
            'stock_qty' => 70,
            'status' => 'active',
        ]);

        $p41 = Product::create([
            'id' => 41,
            'name' => 'Dịch Vụ Cho Thuê Vợt Tập Pickleball JOOLA (30k/giờ)',
            'slug' => 'dich-vu-thue-vot-tap-pickleball',
            'brand_id' => $brandMap['joola']->id ?? null,
            'category_id' => $catMap['thiet-bi-dich-vu-cho-thue']->id ?? null,
            'base_price' => 30000,
            'short_description' => 'Thuê vợt tập theo giờ chơi tại cụm sân (kèm bóng miễn phí)',
            'description' => 'Cho thuê vợt tập thi đấu JOOLA chuẩn cho người mới chơi hoặc khách quên mang vợt tại cụm sân.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_paddle_balls.jpg'],
            'specifications' => json_decode('{"material": "Composite Polymer", "thickness": "14mm", "weight": "220g", "usapa_certified": true, "origin": "JOOLA"}', true),
        ]);
        ProductVariant::create([
            'id' => 4101,
            'product_id' => $p41->id,
            'sku' => 'RENT-PAD-01',
            'color' => 'Mặc định',
            'weight' => '220g',
            'price_override' => 30000,
            'stock_qty' => 20,
            'status' => 'active',
        ]);

        $p42 = Product::create([
            'id' => 42,
            'name' => 'Dịch Vụ Cho Thuê Máy Bắn Bóng Tự Động (100k/giờ)',
            'slug' => 'dich-vu-thue-may-ban-bong-tu-dong',
            'brand_id' => $brandMap['selkirk']->id ?? null,
            'category_id' => $catMap['thiet-bi-dich-vu-cho-thue']->id ?? null,
            'base_price' => 100000,
            'short_description' => 'Thuê máy tập bắn bóng tự động lập trình nhiều góc độ theo giờ',
            'description' => 'Cho thuê máy bắn bóng tự động lập trình nhiều góc độ, xoáy và tốc độ phục vụ luyện tập dink và smash cá nhân.',
            'status' => 'active',
            'is_featured' => true,
            'images' => ['/images/pickleball_net_portable.jpg'],
            'specifications' => json_decode('{"material": "Khung hợp kim nhôm di động", "thickness": "Chứa 150 bóng", "weight": "15kg", "usapa_certified": true, "origin": "Selkirk USA"}', true),
        ]);
        ProductVariant::create([
            'id' => 4201,
            'product_id' => $p42->id,
            'sku' => 'RENT-BALL-MACHINE',
            'color' => 'Mặc định',
            'weight' => '15kg',
            'price_override' => 100000,
            'stock_qty' => 4,
            'status' => 'active',
        ]);

    }
}
