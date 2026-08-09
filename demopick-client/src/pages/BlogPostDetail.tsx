import { useParams, Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, Clock, User, ArrowLeft, Share2, Flame, CheckCircle2, 
  Sparkles, ThumbsUp
} from 'lucide-react'
import { toast } from 'sonner'

export default function BlogPostDetail() {
  const { slug } = useParams<{ slug: string }>()

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Đã sao chép liên kết bài viết!')
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white py-12 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-4xl space-y-3 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium flex-wrap">
            <Link to="/" className="hover:underline">Trang chủ</Link>
            <span>›</span>
            <Link to="/blog" className="hover:underline">Blog</Link>
            <span>›</span>
            <Badge className="bg-emerald-600/40 text-emerald-200 border-emerald-500/30 text-[10px]">
              Phần mềm
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            TOP 5 Phần Mềm Quản Lý Sân Pickleball Tốt Nhất 2026 - So Sánh Chi Tiết
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-300 font-medium pt-2 border-t border-white/10 flex-wrap">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-emerald-400" />
              Ban Biên Tập DemoPick ONE
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" />
              15/12/2025
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-emerald-400" />
              7 phút đọc
            </span>
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar */}
      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Body (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-sm space-y-6">
              {/* Highlight Callout Box */}
              <div className="p-4 sm:p-5 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-xl text-emerald-950 font-normal text-sm sm:text-base leading-relaxed">
                Năm 2026, thị trường phần mềm quản lý sân Pickleball tại Việt Nam phát triển bùng nổ với hàng chục giải pháp số hóa. Bài viết này phân tích và so sánh chi tiết TOP 5 phần mềm quản lý sân Pickleball hàng đầu giúp các chủ sân tối ưu 40% doanh thu, chống trùng lịch tuyệt đối và tự động hóa thanh toán VietQR.
              </div>

              {/* Main Content Article Body */}
              <div className="space-y-5 text-slate-700 text-sm sm:text-base leading-relaxed font-normal">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 text-emerald-700 pt-2">
                  <span>1. DemoPick ONE - Giải Pháp Quản Lý Sân Pickleball #1 Việt Nam</span>
                </h2>
                
                <p className="text-slate-700 leading-relaxed">
                  <strong>DemoPick ONE</strong> là phần mềm quản lý sân Pickleball chuyên sâu đầu tiên áp dụng kiến trúc Micro-services / Multi-database SOA giúp xử lý hàng ngàn lượt đặt ca cùng lúc mà không lo giật lag hay trùng lịch.
                </p>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    Các ưu điểm nổi bật của DemoPick ONE:
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 list-disc pl-5 font-normal">
                    <li><strong>Lưới đặt sân trực quan Real-time:</strong> Đồng bộ tức thì giữa màn hình Admin quầy lễ tân và App khách hàng. Khách chọn ca là quầy biết ngay trong 0.1 giây.</li>
                    <li><strong>Quản lý 6 Sân Pickleball chuyên nghiệp:</strong> Phân chia linh hoạt theo sân trong nhà, sân ngoài trời và sân VIP cao cấp.</li>
                    <li><strong>Khóa sân giữ chỗ tự động 10 phút:</strong> Tránh tình trạng khách ảo đặt giữ chỗ rồi bỏ ca.</li>
                    <li><strong>Chính sách hoàn tiền hủy ca tự động:</strong> Hủy trước 2h hoàn 100%, 1-2h hoàn 50%, dưới 1h tự động khấu trừ 100%.</li>
                    <li><strong>Tự động nâng hạng hội viên (Silver, Gold, VIP Diamond):</strong> Áp dụng chiết khấu tự động 10%-15% cho khách hàng thân thiết.</li>
                    <li><strong>POS Bán hàng & Quản lý kho phụ kiện:</strong> Bán vợt, bóng, nước uống, có tính năng sửa đơn & in lại hóa đơn tiện lợi.</li>
                  </ul>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight text-emerald-700 pt-4">
                  <span>2. Các Giải Pháp Phần Mềm Quản Lý Sân Khác</span>
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  Bên cạnh DemoPick ONE, trên thị trường hiện tại còn có các nền tảng như SportSync, BookCourt, và FieldManager. Mỗi ứng dụng có thế mạnh riêng về giá thành hoặc quy mô tích hợp nhiều môn thể thao khác nhau.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">🔹 SportSync Pro</h4>
                    <p className="text-xs text-slate-600">Phù hợp với tổ hợp nhiều môn thể thao nhưng giao diện đặt lịch chưa hỗ trợ kéo trượt phóng to thu nhỏ mịn màng.</p>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">🔹 BookCourt App</h4>
                    <p className="text-xs text-slate-600">Tích hợp thanh toán cổng ngân hàng tốt nhưng chi phí hoa hồng theo lượt đặt khá cao (từ 5-8%/ca sân).</p>
                  </div>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight text-emerald-700 pt-4">
                  <span>3. Tiêu Chí Chọn Phần Mềm Quản Lý Sân Pickleball</span>
                </h2>

                <ol className="space-y-2.5 list-decimal pl-5 font-normal text-slate-700 text-xs sm:text-sm">
                  <li><strong>Dễ sử dụng cho nhân viên quầy:</strong> Giao diện POS đơn giản, nhân viên mới chỉ cần 5 phút là thao tác thạo.</li>
                  <li><strong>Đồng bộ đa nền tảng 24/7:</strong> Khách đặt trên điện thoại hay chủ sân xem báo cáo trên laptop đều khớp dữ liệu.</li>
                  <li><strong>Báo cáo doanh thu tự động:</strong> Thống kê chi tiết doanh thu sân, doanh thu nước uống phụ kiện và tỷ lệ lấp đầy ca sân.</li>
                  <li><strong>Hỗ trợ kỹ thuật 24/7:</strong> Luôn có đội ngũ hỗ trợ trực tiếp khi gặp sự cố ca trùng hoặc nghẽn mạng.</li>
                </ol>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight text-emerald-700 pt-4">
                  <span>4. Kết Luận & Lời Khuyên Đầu Tư</span>
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  Việc trang bị một phần mềm quản lý sân Pickleball chuyên nghiệp như <strong>DemoPick ONE</strong> không chỉ giúp chủ sân tiết kiệm 80% thời gian quản lý thủ công mà còn mang đến trải nghiệm đặt sân hiện đại, giữ chân hội viên lâu dài.
                </p>
              </div>

              {/* Tags & Social Shares */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-xs text-slate-500 uppercase">Tags:</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-normal">
                    #phan-mem-quan-ly-san-pickleball
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-normal">
                    #kinh-doanh-pickleball-2026
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-normal">
                    #demopick-one
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Button onClick={handleCopyLink} variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                      <Share2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Chia sẻ bài viết</span>
                    </Button>
                    <Button onClick={() => toast.success('Đã cảm ơn bài viết!')} variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                      <ThumbsUp className="h-3.5 w-3.5 text-amber-500" />
                      <span>Hữu ích (142)</span>
                    </Button>
                  </div>

                  <Link to="/blog">
                    <Button size="sm" variant="ghost" className="gap-1 text-xs font-medium text-slate-600 hover:text-emerald-600">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Quay lại danh sách Blog</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Related Articles Widget */}
            <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-3">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                <Flame className="h-4 w-4 text-amber-500" />
                Bài cùng chuyên mục
              </h4>

              <div className="divide-y divide-slate-100">
                {[
                  {
                    title: 'Hướng Dẫn Mở Sân Pickleball Từ A đến Z: Chi Phí, Vốn, Doanh Thu 2026',
                    date: '12/12/2025',
                    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300',
                  },
                  {
                    title: '10 Cách Quản Lý Sân Pickleball Hiệu Quả - Tăng Doanh Thu 40%',
                    date: '10/12/2025',
                    image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=300',
                  },
                  {
                    title: 'Xu Hướng Sân Pickleball Việt Nam 2026: Cơ Hội Vàng Cho Chủ Đầu Tư',
                    date: '08/12/2025',
                    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=300',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-start gap-3 group cursor-pointer">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-11 rounded-lg object-cover bg-slate-100 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="space-y-1">
                      <h5 className="font-semibold text-xs text-slate-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {item.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
