<?php

namespace Database\Seeders;

use App\Models\Post;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $posts = [
            [
                'title' => 'TOP 5 Phần Mềm Quản Lý Sân Pickleball Tốt Nhất 2026 - So Sánh Chi Tiết',
                'slug' => 'top-5-phan-mem-quan-ly-san-pickleball-2026',
                'category' => 'Phần mềm',
                'image' => 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600',
                'excerpt' => 'So sánh top 5 phần mềm quản lý sân Pickleball phổ biến tại Việt Nam năm 2026. Đánh giá ưu nhược điểm, giá cả, tính năng chống trùng lịch.',
                'content' => 'Năm 2026, thị trường phần mềm quản lý sân Pickleball tại Việt Nam phát triển bùng nổ...',
                'views' => 1420,
                'status' => 'published',
                'published_at' => now()->subDays(5),
            ],
            [
                'title' => 'Hướng Dẫn Mở Sân Pickleball Từ A đến Z: Chi Phí, Vốn, Doanh Thu 2026',
                'slug' => 'huong-dan-mo-san-pickleball-tu-a-den-z',
                'category' => 'Kinh doanh sân',
                'image' => 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600',
                'excerpt' => 'Hướng dẫn chi tiết mở sân Pickleball: từ chọn mặt bằng thảm, chi phí đầu tư thảm USAPA, dự toán doanh thu đến phần mềm quản lý tự động.',
                'content' => 'Mở sân Pickleball là cơ hội đầu tư hấp dẫn năm 2026...',
                'views' => 980,
                'status' => 'published',
                'published_at' => now()->subDays(8),
            ],
            [
                'title' => '10 Cách Quản Lý Sân Pickleball Hiệu Quả - Tăng Doanh Thu 40% Trong 3 Tháng',
                'slug' => '10-cach-quan-ly-san-pickleball-hieu-qua',
                'category' => 'Kinh doanh sân',
                'image' => 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600',
                'excerpt' => '10 phương pháp đã chứng minh giúp chủ sân Pickleball tăng doanh thu 40% trong 3 tháng. Bao gồm tự động hóa đặt sân, POS quầy & quản lý khách VIP.',
                'content' => 'Tối ưu hóa doanh thu ca sân đòi hỏi ứng dụng công nghệ...',
                'views' => 750,
                'status' => 'published',
                'published_at' => now()->subDays(10),
            ],
            [
                'title' => 'Xu Hướng Sân Pickleball Việt Nam 2026: Cơ Hội Vàng Cho Chủ Đầu Tư',
                'slug' => 'xu-huong-san-pickleball-viet-nam-2026',
                'category' => 'Xu hướng',
                'image' => 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600',
                'excerpt' => 'Phân tích xu hướng Pickleball bùng nổ tại Việt Nam 2026. Số liệu thị trường, cơ hội đầu tư, dự báo và lời khuyên cho chủ sân.',
                'content' => 'Thị trường Pickleball Việt Nam chứng kiến mức tăng trưởng 300%...',
                'views' => 610,
                'status' => 'published',
                'published_at' => now()->subDays(12),
            ],
            [
                'title' => 'Giá Phần Mềm Quản Lý Sân DemoPick ONE 2026: Bảng Giá Chi Tiết Các Gói',
                'slug' => 'gia-phan-mem-quan-ly-san-demopick-2026',
                'category' => 'Phần mềm',
                'image' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
                'excerpt' => 'Bảng giá phần mềm quản lý sân thể thao DemoPick ONE 2026 đầy đủ các gói từ miễn phí đến Enterprise. So sánh tính năng, ROI, chính sách hoàn tiền.',
                'content' => 'Bảng giá gói đăng ký DemoPick ONE minh bạch...',
                'views' => 1100,
                'status' => 'published',
                'published_at' => now()->subDays(2),
            ],
        ];

        foreach ($posts as $p) {
            Post::updateOrCreate(['slug' => $p['slug']], $p);
        }
    }
}
