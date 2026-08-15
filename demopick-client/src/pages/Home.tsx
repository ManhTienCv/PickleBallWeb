import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { shopService } from '@/services/shop.service'
import ProductCard from '@/components/ProductCard'
import { cartService } from '@/services/cart.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  ShoppingBag,
  Calendar,
  Sparkles,
  Zap,
  ShieldCheck,
  Award,
  Star,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  Flame,
  Truck,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const { data: productData, isLoading } = useQuery({
    queryKey: ['home-featured-products'],
    queryFn: () => shopService.getProducts({ page: 1 }),
  })

  const rawProducts = productData?.items || []

  const filteredProducts = rawProducts.filter((product: any) => {
    if (!product || !product.name) return false
    const pName = String(product.name).toLowerCase()
    const cName = String(product.category?.name || '').toLowerCase()
    if (activeCategory === 'all') return true
    if (activeCategory === 'racket') return pName.includes('vợt') || cName.includes('vợt')
    if (activeCategory === 'ball') return pName.includes('bóng') || cName.includes('bóng')
    if (activeCategory === 'accessory') return pName.includes('túi') || pName.includes('băng') || pName.includes('phụ') || cName.includes('phụ')
    return true
  }).slice(0, 8)

  const handleAddToCart = async (product: any) => {
    if (!product.variants || product.variants.length === 0) {
      toast.error('Sản phẩm chưa có biến thể khả dụng')
      return
    }
    try {
      await cartService.addToCart(product.variants[0].id, 1)
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`)
    } catch {
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng đăng nhập.')
    }
  }

  return (
    <div className="space-y-16 pb-16">
      {/* 🟢 HERO SECTION WITH ELEVATED PURE WHITE CANVAS & DARK CHARCOAL CARD SHOWCASE */}
      <section className="relative bg-white text-slate-900 rounded-3xl mx-2 sm:mx-4 mt-2 border border-slate-200/90 shadow-xl shadow-slate-200/70 overflow-visible">
        {/* Background Decorative Soft Blur Spheres */}
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-[#27c372]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[420px] h-[420px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 py-12 sm:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Text Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/10 border border-emerald-700/20 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                <span>Hệ Thống Đặt Sân & Pro Shop Pickleball Đạt Chuẩn European SOA</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-slate-900">
                Thiết Bị Thể Thao & <br />
                <span className="text-[#27c372] font-black">
                  Sân Pickleball Class-A
                </span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl font-semibold">
                Một trải nghiệm ứng dụng đồng bộ đa dịch vụ: Chọn giữ chỗ sân Pickleball tự động trong 7 ngày và mua sắm vợt bóng chính hãng tiện lợi chỉ trong 1 quy trình duy nhất.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/booking">
                  <Button size="lg" className="gap-2 bg-[#27c372] hover:bg-[#22c55e] text-white font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-[#27c372]/25 scale-[1.02] transition-all">
                    <Calendar className="h-5 w-5 text-white" />
                    <span>Đặt Lịch Sân Ngay</span>
                    <ArrowRight className="h-4 w-4 text-white" />
                  </Button>
                </Link>

                <Link to="/products">
                  <Button size="lg" variant="outline" className="gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 font-extrabold rounded-2xl px-6 py-3.5 shadow-sm">
                    <ShoppingBag className="h-5 w-5 text-[#27c372]" />
                    <span>Xem Cửa Hàng Vợt</span>
                  </Button>
                </Link>
              </div>

              {/* Quick Stats Badges */}
              <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-200/80 text-xs sm:text-sm">
                <div>
                  <div className="text-2xl font-black text-slate-900">4 Sân Thi Đấu</div>
                  <div className="text-slate-500 font-semibold">Mặt sân đạt chuẩn USAPA Pro</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#27c372]">10 Phút</div>
                  <div className="text-slate-500 font-semibold">Khoá lịch tự động không sợ trùng</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">100%</div>
                  <div className="text-slate-500 font-semibold">Vợt & Bóng chính hãng Hãng</div>
                </div>
              </div>
            </div>

            {/* Right Interactive 3D Floating Showcase Card (Harmonized Light Architectural Theme) */}
            <div className="lg:col-span-5 relative perspective-[1200px] pt-4 sm:pt-0">
              {/* Floating Live Status Badge (Top-Right) */}
              <div className="absolute -top-3 right-3 z-30 bg-slate-900 border border-[#27c372]/50 px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 hidden sm:flex">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27c372] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#27c372]"></span>
                </span>
                <span className="text-[11px] font-extrabold text-white">⚡ Giữ Chỗ Tự Động 24/7</span>
              </div>

              {/* Main 3D Card Showcase */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 bg-white p-4.5 shadow-xl shadow-slate-200/50 transition-all duration-500 transform hover:rotate-y-[-4deg] hover:rotate-x-[3deg] space-y-3.5">
                {/* Image Banner - Authentic Pickleball Court Photo */}
                <div className="aspect-video rounded-2xl overflow-hidden relative border border-slate-200 shadow-inner group">
                  <img
                    src="/images/pickleball_court.jpg"
                    alt="Sân Pickleball Pick Center"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <Badge className="absolute top-3 left-3 bg-[#27c372] text-white font-black shadow-md">
                    Đang mở cửa (05:00 - 23:00)
                  </Badge>
                </div>

                {/* Quick Info Box - Clean & Uncluttered */}
                <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-extrabold text-slate-800">
                      <MapPin className="h-3.5 w-3.5 text-[#27c372]" />
                      Cầu Giấy, Hà Nội
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-extrabold">
                      <Star className="h-3.5 w-3.5 fill-amber-400" /> 4.9 (120+ Đánh giá)
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base">Cụm Sân Pickleball Pick Center</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    Đèn LED chống chói thi đấu chuyên nghiệp, lounge máy lạnh, phòng tắm nóng lạnh & pro shop hỗ trợ mượn vợt cao cấp dùng thử.
                  </p>

                  <Link to="/booking" className="block pt-1">
                    <Button size="sm" className="w-full bg-[#27c372] hover:bg-[#22c55e] text-white font-black rounded-xl gap-1.5 shadow-md shadow-[#27c372]/20">
                      <span>Kiểm tra lịch trống hôm nay</span>
                      <ArrowRight className="h-3.5 w-3.5 text-white" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟢 FEATURED PRODUCTS SECTION (Harmonious European Layout) */}
      <section className="container mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-[#16a34a] font-bold text-xs uppercase tracking-wider">
              <Flame className="h-4 w-4 text-[#27c372]" />
              <span>USAPA Certified • Trang Bị Hot Nhất 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Vợt & Phụ Kiện Thi Đấu <span className="text-[#27c372]">Hot Nhất</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Vợt carbon 3S, bóng thi đấu và túi phụ kiện tiêu chuẩn quốc tế từ JOOLA, Selkirk, Franklin.
            </p>
          </div>

          {/* Category Filter Pills & See All Link */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Tất Cả' },
              { id: 'racket', label: '🏓 Vợt Carbon 3S' },
              { id: 'ball', label: '🟡 Bóng Thi Đấu' },
              { id: 'accessory', label: '🎒 Túi & Phụ Kiện' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeCategory === tab.id
                    ? 'bg-[#27c372] text-white shadow-sm shadow-[#27c372]/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <Link to="/products" className="ml-1">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold text-slate-700 border-slate-300 rounded-full h-8 px-3.5 hover:bg-slate-100">
                <span>Xem tất cả</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Product Grid resting cleanly on page */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}

        {/* Minimal Guarantees Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="flex items-center gap-2.5 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-[#27c372]/15 text-[#16a34a] flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-xs">100% Chính Hãng</p>
              <p className="text-[11px] text-slate-500 font-medium">Đạt chuẩn USAPA</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-[#27c372]/15 text-[#16a34a] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-xs">Giao Hỏa Tốc 2H</p>
              <p className="text-[11px] text-slate-500 font-medium">Nội thành Hà Nội & TP.HCM</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-[#27c372]/15 text-[#16a34a] flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-xs">Đổi Trả 7 Ngày</p>
              <p className="text-[11px] text-slate-500 font-medium">Lỗi nhà sản xuất</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-[#27c372]/15 text-[#16a34a] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-xs">Bảo Hành 12 Tháng</p>
              <p className="text-[11px] text-slate-500 font-medium">Mặt vợt carbon 3S</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🟢 HIGHLIGHT FEATURES SECTION */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900">Tại Sao Chọn Pick Web?</h2>
            <p className="text-slate-600 text-sm">
              Trải nghiệm đặt dịch vụ thể thao hiện đại, minh bạch và tiện lợi nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-primary/40 transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Lịch Sân Trực Quan 7 Ngày</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Xem chính xác khung giờ trống theo từng sân (Sân A1, A2, VIP), giá giờ thường và giờ cao điểm được minh bạch rõ ràng.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-primary/40 transition-all">
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Khoá Sân Tự Động 10 Phút</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hệ thống tạm giữ khung giờ bằng công nghệ Pessimistic Lock giúp bạn yên tâm thanh toán mà không sợ bị người khác đặt đè.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
