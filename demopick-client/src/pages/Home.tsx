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
      {/* 🟢 HERO SECTION WITH RICH GRADIENTS & BACKGROUND IMAGE */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        {/* Background Decorative Blur Gradients */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-16 sm:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Text Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Nền tảng Pickleball Đa Dịch Vụ Đầu Tiên</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Thiết Bị Thể Thao & <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-primary bg-clip-text text-transparent">
                  Sân Pickleball Chuẩn SOA
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                Một ứng dụng kết hợp cả 2 dịch vụ: Mua sắm vợt bóng chính hãng và giữ chỗ lịch sân Pickleball trực quan 7 ngày chỉ trong một lần thanh toán duy nhất.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/booking">
                  <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-7 shadow-lg shadow-primary/25 rounded-xl">
                    <Calendar className="h-5 w-5" />
                    <span>Đặt Lịch Sân Ngay</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link to="/products">
                  <Button size="lg" variant="outline" className="gap-2 bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-white font-semibold rounded-xl">
                    <ShoppingBag className="h-5 w-5 text-emerald-400" />
                    <span>Xem Cửa Hàng Vợt</span>
                  </Button>
                </Link>
              </div>

              {/* Quick Stats Badges */}
              <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-xs sm:text-sm">
                <div>
                  <div className="text-2xl font-black text-white">4 Sân</div>
                  <div className="text-slate-400 font-medium">Mặt sân tiêu chuẩn USAPA</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400">10 Phút</div>
                  <div className="text-slate-400 font-medium">Giữ chỗ khoá sân tự động</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-primary">100%</div>
                  <div className="text-slate-400 font-medium">Vợt & Bóng chính hãng</div>
                </div>
              </div>
            </div>

            {/* Right Visual Card Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-800/40 p-4 backdrop-blur-md shadow-2xl space-y-4">
                {/* Image Banner */}
                <div className="aspect-video rounded-xl overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800"
                    alt="Sân Pickleball DemoPick"
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-emerald-600 text-white font-bold">
                    Đang mở cửa (05:00 - 23:00)
                  </Badge>
                </div>

                {/* Quick Info Box */}
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      Cầu Giấy, Hà Nội
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400" /> 4.9 (120+ Đánh giá)
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base">Cụm Sân Pickleball DemoPick Center</h3>
                  <p className="text-xs text-slate-300">
                    Đèn LED chống chói tiêu chuẩn thi đấu, khu vực lounge máy lạnh, tắm nước nóng & pro shop cho mượn vợt thử nghiệm.
                  </p>

                  <Link to="/booking" className="block pt-1">
                    <Button size="sm" className="w-full bg-slate-800 hover:bg-slate-700 text-primary border border-primary/30 font-semibold gap-1.5">
                      <span>Kiểm tra lịch trống hôm nay</span>
                      <ArrowRight className="h-3.5 w-3.5" />
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
