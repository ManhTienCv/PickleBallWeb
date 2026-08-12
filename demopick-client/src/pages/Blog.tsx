import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Calendar, Clock, ArrowRight, Flame, Tag, Send, PhoneCall, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

interface BlogPost {
  id: number
  title: string
  slug: string
  category: 'Kinh doanh sân' | 'Phần mềm' | 'Kỹ thuật chơi' | 'Xu hướng'
  image: string
  date: string
  readTime: string
  excerpt: string
}

const mockPosts: BlogPost[] = [
  {
    id: 1,
    title: 'TOP 5 Phần Mềm Quản Lý Sân Pickleball Tốt Nhất 2026 - So Sánh Chi Tiết',
    slug: 'top-5-phan-mem-quan-ly-san-pickleball-2026',
    category: 'Phần mềm',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600',
    date: '15/12/2025',
    readTime: '5 phút đọc',
    excerpt: 'So sánh top 5 phần mềm quản lý sân Pickleball phổ biến tại Việt Nam năm 2026. Đánh giá ưu nhược điểm, giá cả, tính năng chống trùng lịch để chọn giải pháp phù hợp.',
  },
  {
    id: 2,
    title: 'Hướng Dẫn Mở Sân Pickleball Từ A đến Z: Chi Phí, Vốn, Doanh Thu 2026',
    slug: 'huong-dan-mo-san-pickleball-tu-a-den-z',
    category: 'Kinh doanh sân',
    image: '/images/pickleball_match.jpg',
    date: '12/12/2025',
    readTime: '8 phút đọc',
    excerpt: 'Hướng dẫn chi tiết mở sân Pickleball: từ chọn mặt bằng thảm, chi phí đầu tư thảm USAPA, dự toán doanh thu đến phần mềm quản lý tự động.',
  },
  {
    id: 3,
    title: '10 Cách Quản Lý Sân Pickleball Hiệu Quả - Tăng Doanh Thu 40% Trong 3 Tháng',
    slug: '10-cach-quan-ly-san-pickleball-hieu-qua',
    category: 'Kinh doanh sân',
    image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600',
    date: '10/12/2025',
    readTime: '7 phút đọc',
    excerpt: '10 phương pháp đã chứng minh giúp chủ sân Pickleball tăng doanh thu 40% trong 3 tháng. Bao gồm tự động hóa đặt sân, POS quầy, mã QR VietQR & quản lý khách VIP.',
  },
  {
    id: 4,
    title: 'Xu Hướng Sân Pickleball Việt Nam 2026: Cơ Hội Vàng Cho Chủ Đầu Tư',
    slug: 'xu-huong-san-pickleball-viet-nam-2026',
    category: 'Xu hướng',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600',
    date: '08/12/2025',
    readTime: '6 phút đọc',
    excerpt: 'Phân tích xu hướng Pickleball bùng nổ tại Việt Nam 2026. Số liệu thị trường, cơ hội đầu tư, dự báo và lời khuyên cho chủ sân muốn nhảy vào hot trend.',
  },
  {
    id: 5,
    title: 'Cách Tính Giá Thuê Sân Pickleball Theo Giờ - Bí Quyết Tối Đa Doanh Thu',
    slug: 'cach-tinh-gia-thue-san-pickleball-theo-gio',
    category: 'Kinh doanh sân',
    image: 'https://images.unsplash.com/photo-1511067007398-7e4b90aab4bc?w=600',
    date: '05/12/2025',
    readTime: '5 phút đọc',
    excerpt: 'Hướng dẫn cách tính giá thuê sân Pickleball khoa học theo khung giờ peak/off-peak, ngày trong tuần, mùa giải. Công thức tối ưu doanh thu cho chủ sân.',
  },
  {
    id: 6,
    title: 'Giá Phần Mềm Quản Lý Sân DemoPick ONE 2026: Bảng Giá Chi Tiết Các Gói',
    slug: 'gia-phan-mem-quan-ly-san-demopick-2026',
    category: 'Phần mềm',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
    date: '07/01/2026',
    readTime: '6 phút đọc',
    excerpt: 'Bảng giá phần mềm quản lý sân thể thao DemoPick ONE 2026 đầy đủ các gói từ miễn phí đến Enterprise. So sánh tính năng, ROI, chính sách hoàn tiền.',
  },
]

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>(mockPosts)
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('Tất cả')
  const [emailInput, setEmailInput] = useState('')

  useEffect(() => {
    api.get('/posts')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const apiPosts: BlogPost[] = res.data.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            category: item.category || 'Phần mềm',
            image: item.image || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600',
            date: item.published_at ? new Date(item.published_at).toLocaleDateString('vi-VN') : item.date || '01/01/2026',
            readTime: '5 phút đọc',
            excerpt: item.excerpt || '',
          }))
          setPosts(apiPosts)
        }
      })
      .catch(() => {
        // Fallback silently to mock posts if backend API is not running
      })
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput) {
      toast.error('Vui lòng nhập địa chỉ email của bạn.')
      return
    }
    toast.success('Cảm ơn bạn đã đăng ký nhận bản tin tư vấn Pickleball!')
    setEmailInput('')
  }

  const filteredPosts = posts.filter((post) => {
    const matchCat = activeCat === 'Tất cả' || post.category === activeCat
    const matchSearch = post.title.toLowerCase().includes(search.toLowerCase()) || post.excerpt.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans pb-12">
      {/* Blog Hero Header Section - Architectural Ivory Canvas Theme */}
      <section className="bg-white text-slate-900 rounded-3xl mx-2 sm:mx-6 mt-2 mb-8 p-8 sm:p-12 border border-slate-200/90 shadow-xl shadow-slate-200/60 relative overflow-hidden text-center">
        {/* Decorative Ambient Orbs */}
        <div className="absolute -top-24 -right-24 w-[380px] h-[380px] bg-[#27c372]/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] bg-emerald-600/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="container mx-auto max-w-4xl space-y-4 relative z-10">
          <Badge className="bg-[#27c372]/15 text-[#16a34a] border border-[#27c372]/30 px-3.5 py-1 font-extrabold text-xs rounded-full">
            📖 Blog Kiến Thức Pickleball Pick ONE
          </Badge>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Kiến Thức Quản Lý & <span className="text-[#27c372]">Kinh Nghiệm Mở Sân Pickleball</span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-semibold">
            Tổng hợp kiến thức, hướng dẫn, kinh nghiệm kinh doanh cụm sân Pickleball tiêu chuẩn USAPA. Dành cho chủ sân và cộng đồng Pickleball Việt Nam.
          </p>

          <div className="pt-4 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Tìm bài viết theo từ khóa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 h-12 bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-2xl shadow-inner focus:bg-white text-sm font-medium"
            />
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="container mx-auto py-10 px-4 sm:px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Articles Grid (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="block group">
                  <Card className="overflow-hidden border-slate-200 bg-white hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge className="absolute top-3 left-3 bg-emerald-600 font-bold text-[11px] shadow-sm">
                        {post.category}
                      </Badge>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {post.readTime}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center text-emerald-600 font-bold text-xs group-hover:translate-x-1 transition-transform">
                        <span>Đọc tiếp</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 font-bold">
                &lt;
              </Button>
              <Button size="sm" className="h-9 w-9 p-0 font-bold bg-emerald-600">
                1
              </Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 font-bold">
                2
              </Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 font-bold">
                3
              </Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 font-bold">
                &gt;
              </Button>
            </div>
          </div>

          {/* Right Sidebar: Categories, Recent Posts & Newsletter Widget (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Categories Card */}
            <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-3">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                <Tag className="h-4 w-4 text-emerald-600" />
                Chuyên mục
              </h4>

              <div className="space-y-1.5 text-xs font-semibold">
                {[
                  { name: 'Tất cả', count: 25 },
                  { name: 'Phần mềm', count: 8 },
                  { name: 'Kinh doanh sân', count: 10 },
                  { name: 'Kỹ thuật chơi', count: 4 },
                  { name: 'Xu hướng', count: 3 },
                ].map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCat(cat.name)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all ${
                      activeCat === cat.name
                        ? 'bg-emerald-100 text-emerald-900 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {cat.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </Card>

            {/* Top Recent Articles Widget */}
            <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-3">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                <Flame className="h-4 w-4 text-amber-500" />
                Bài mới nhất
              </h4>

              <div className="divide-y divide-slate-100">
                {mockPosts.slice(0, 5).map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="py-3 flex items-start gap-3 group block">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-16 h-12 rounded-lg object-cover bg-slate-100 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="space-y-1">
                      <h5 className="font-bold text-xs text-slate-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {post.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.date}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Clean Newsletter Subscription Widget (Replaces awkward box in red outline) */}
            <Card className="p-5 border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-md space-y-3">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <Send className="h-4 w-4 text-emerald-400" />
                <h4 className="font-bold text-white text-sm uppercase tracking-wider">
                  Đăng ký nhận bản tin
                </h4>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Nhận thông báo kinh nghiệm quản lý sân Pickleball & bí quyết tăng doanh thu 40% miễn phí hàng tuần.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-2 pt-1">
                <Input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="text-xs h-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus-visible:ring-emerald-500"
                />
                <Button type="submit" className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm">
                  Đăng ký ngay
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
