import React from 'react'
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
} from 'lucide-react'
import { toast } from 'sonner'

export default function Home() {
  const { data: productData, isLoading } = useQuery({
    queryKey: ['home-featured-products'],
    queryFn: () => shopService.getProducts({ page: 1 }),
  })

  const products = productData?.items?.slice(0, 4) || []

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

            {/* Right Interactive 3D Floating Showcase Card (Dark Charcoal Luxury Accent) */}
            <div className="lg:col-span-5 relative perspective-[1200px] pt-4 sm:pt-0">
              {/* Floating Live Status Badge (Top-Right) */}
              <div className="absolute -top-3 right-3 z-30 bg-[#1C1D21] border border-[#27c372]/50 px-3.5 py-1.5 rounded-full shadow-xl flex items-center gap-2 hidden sm:flex">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27c372] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#27c372]"></span>
                </span>
                <span className="text-[11px] font-extrabold text-white">⚡ Giữ Chỗ Tự Động 24/7</span>
              </div>

              {/* Main 3D Dark Charcoal Card Showcase */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-[#1C1D21] p-4.5 shadow-2xl transition-all duration-500 transform hover:rotate-y-[-4deg] hover:rotate-x-[3deg] space-y-3.5">
                {/* Image Banner */}
                <div className="aspect-video rounded-2xl overflow-hidden relative border border-slate-700/60 group">
                  <img
                    src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800"
                    alt="Sân Pickleball DemoPick"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <Badge className="absolute top-3 left-3 bg-[#27c372] text-white font-black shadow-md">
                    Đang mở cửa (05:00 - 23:00)
                  </Badge>
                </div>

                {/* Quick Info Box */}
                <div className="bg-[#121316] p-4 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-bold text-white">
                      <MapPin className="h-3.5 w-3.5 text-[#27c372]" />
                      Cầu Giấy, Hà Nội
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400" /> 4.9 (120+ Đánh giá)
                    </span>
                  </div>

                  <h3 className="font-extrabold text-white text-base">Cụm Sân Pickleball DemoPick Center</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Đèn LED chống chói thi đấu chuyên nghiệp, lounge máy lạnh, phòng tắm nóng lạnh & pro shop hỗ trợ mượn vợt cao cấp dùng thử.
                  </p>

                  {/* Clean Equipment Highlight Bar */}
                  <div className="flex items-center justify-between bg-[#1C1D21] border border-slate-800 px-3 py-2 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏆</span>
                      <span className="font-bold text-white">JOOLA Perseus 3S Carbon</span>
                    </div>
                    <span className="text-[10px] text-[#27c372] font-extrabold bg-[#27c372]/15 px-2 py-0.5 rounded border border-[#27c372]/30">USAPA Official</span>
                  </div>

                  <Link to="/booking" className="block pt-1">
                    <Button size="sm" className="w-full bg-[#27c372] hover:bg-[#22c55e] text-white font-black rounded-xl gap-1.5 shadow-md">
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

      {/* 🟢 FEATURED PRODUCTS SECTION */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
              <Zap className="h-4 w-4" />
              <span>Thiết Bị Nổi Bật Bán Chạy</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">Vợt & Phụ Kiện Thi Đấu Hot Nhất</h2>
          </div>

          <Link to="/products">
            <Button variant="outline" className="gap-2 text-slate-700 hover:text-slate-900 border-slate-300">
              <span>Xem Tất Cả Sản Phẩm</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      {/* 🟢 HIGHLIGHT FEATURES SECTION */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900">Tại Sao Chọn DemoPick Web?</h2>
            <p className="text-slate-600 text-sm">
              Trải nghiệm đặt dịch vụ thể thao hiện đại, minh bạch và tiện lợi nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-primary/40 transition-all">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Thanh Toán VietQR & MoMo</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Xác thực chuyển khoản tự động qua mã VietQR thông minh hoặc cổng ví điện tử MoMo Sandbox kèm mã Check-in QR tiện lợi.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
