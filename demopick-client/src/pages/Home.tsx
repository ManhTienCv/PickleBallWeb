import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { shopService } from '@/services/shop.service'
import ProductCard from '@/components/ProductCard'
import { cartService } from '@/services/cart.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  ShoppingBag,
  Calendar,
  ShieldCheck,
  Award,
  MapPin,
  Truck,
  RotateCcw,
  CircleDot,
  Layers,
  ChevronRight,
  Trophy,
} from 'lucide-react'
import { toast } from 'sonner'

export default function Home() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const { data: productData, isLoading } = useQuery({
    queryKey: ['home-featured-products'],
    queryFn: () => shopService.getProducts({ page: 1 }),
  })

  const rawProducts = productData?.items || []

  // Filter Products for Home Grid
  const filteredProducts = rawProducts
    .filter((product: any) => {
      if (!product || !product.name) return false
      const pName = String(product.name).toLowerCase()
      const cName = String(product.category?.name || '').toLowerCase()
      if (activeCategory === 'all') return true
      if (activeCategory === 'racket') return pName.includes('vợt') || cName.includes('vợt')
      if (activeCategory === 'ball') return pName.includes('bóng') || cName.includes('bóng')
      if (activeCategory === 'accessory')
        return (
          pName.includes('túi') ||
          pName.includes('băng') ||
          pName.includes('phụ') ||
          cName.includes('phụ')
        )
      if (activeCategory === 'apparel')
        return (
          pName.includes('áo') ||
          pName.includes('quần') ||
          pName.includes('váy') ||
          cName.includes('quần') ||
          cName.includes('trang phục')
        )
      return true
    })
    .slice(0, 8)

  const handleAddToCart = async (product: any) => {
    const variantId = product.variants?.[0]?.id || product.id || Date.now()
    try {
      await cartService.addToCart(variantId, 1, product)
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`, {
        action: {
          label: 'Xem giỏ hàng →',
          onClick: () => navigate('/cart'),
        },
      })
    } catch {
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng.')
    }
  }

  // 5 Featured Categories (Khớp 100% Ảnh 1)
  const featuredCategories = [
    {
      id: 'Vợt Pickleball',
      name: 'Vợt Pickleball',
      count: '24+ Mẫu vợt',
      icon: Trophy,
      color: 'from-emerald-500/10 to-emerald-500/5',
      iconColor: 'text-emerald-700',
    },
    {
      id: 'Bóng Pickleball',
      name: 'Bóng Pickleball',
      count: 'Chuẩn USAPA 40 lỗ',
      icon: CircleDot,
      color: 'from-amber-500/10 to-amber-500/5',
      iconColor: 'text-amber-700',
    },
    {
      id: 'Phụ kiện & Bao vợt',
      name: 'Phụ kiện & Bao vợt',
      count: 'Túi, Băng quấn, Nón',
      icon: ShoppingBag,
      color: 'from-blue-500/10 to-blue-500/5',
      iconColor: 'text-blue-700',
    },
    {
      id: 'Quần áo & Trang phục',
      name: 'Quần áo & Trang phục',
      count: 'Dry-fit thoáng khí',
      icon: Layers,
      color: 'from-purple-500/10 to-purple-500/5',
      iconColor: 'text-purple-700',
    },
    {
      id: 'Dịch vụ Đặt Sân',
      name: 'Sân Thi Đấu Pro',
      count: '4 Sân chuẩn quốc tế',
      icon: Calendar,
      color: 'from-rose-500/10 to-rose-500/5',
      iconColor: 'text-rose-700',
      isBooking: true,
    },
  ]

  // Top Brands
  const topBrands = [
    { name: 'JOOLA', tag: 'Official USAPA', desc: 'Vợt Carbon 3S' },
    { name: 'SELKIRK', tag: 'Made in USA', desc: 'Công nghệ Power Air' },
    { name: 'CRBN', tag: 'Raw Carbon Fiber', desc: 'Kiểm soát & Tạo xoáy' },
    { name: 'FRANKLIN', tag: 'Official Ball', desc: 'Bóng thi đấu X-40' },
    { name: 'GAMMA', tag: 'Pro Accessories', desc: 'Phụ kiện & Dây quấn' },
    { name: 'HEAD', tag: 'Radical Tour', desc: 'Sức mạnh vượt trội' },
  ]

  // 4 Featured Courts
  const courts = [
    {
      id: 'A1',
      name: 'Sân A1 - Pro USAPA',
      type: 'Trong nhà / Máy lạnh',
      price: '180.000 đ/h',
      status: 'Sẵn sàng đón khách',
      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=500',
    },
    {
      id: 'A2',
      name: 'Sân A2 - Pro USAPA',
      type: 'Đèn LED 500 Lux',
      price: '180.000 đ/h',
      status: 'Sẵn sàng đón khách',
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=500',
    },
    {
      id: 'A3',
      name: 'Sân A3 - Standard',
      type: 'Luyện tập & Giao lưu',
      price: '150.000 đ/h',
      status: 'Sẵn sàng đón khách',
      image: 'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&q=80&w=500',
    },
    {
      id: 'VIP',
      name: 'Sân VIP Center',
      type: 'Khán đài & Lounge riêng',
      price: '250.000 đ/h',
      status: 'Sẵn sàng đón khách',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=500',
    },
  ]

  return (
    <div className="space-y-16 pb-20 font-sans">
      {/* ========================================================= */}
      {/* 1. HERO SECTION (ELEVATED PURE WHITE CANVAS & ARCHITECTURAL) */}
      {/* ========================================================= */}
      <section className="container mx-auto max-w-7xl px-3 sm:px-6">
        <div className="relative bg-white dark:bg-card text-slate-900 dark:text-foreground rounded-3xl p-6 sm:p-12 border border-slate-200/90 dark:border-border shadow-xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden transition-colors duration-300">
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-28 -right-28 w-[450px] h-[450px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-28 -left-28 w-[450px] h-[450px] bg-emerald-600/10 dark:bg-emerald-600/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-slate-900 dark:text-slate-100">
                Thiết Bị Thể Thao & <br />
                <span className="text-emerald-600 dark:text-emerald-400">Sân Pickleball Class-A</span>
              </h1>

              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                Hệ thống thể thao liên thông tiện lợi: Giữ chỗ 4 cụm sân thi đấu tự động 24/7 và mua sắm vợt bóng chính hãng chuẩn quốc tế chỉ trong một nền tảng duy nhất.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link to="/booking">
                  <Button
                    size="lg"
                    className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-7 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all text-sm cursor-pointer"
                  >
                    <Calendar className="h-4.5 w-4.5 text-white" />
                    <span>Đặt Lịch Sân Ngay</span>
                    <ArrowRight className="h-4 w-4 text-white" />
                  </Button>
                </Link>

                <Link to="/products">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-border hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-2xl px-6 py-3.5 shadow-xs text-sm cursor-pointer"
                  >
                    <ShoppingBag className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Khám Phá Sản Phẩm</span>
                  </Button>
                </Link>
              </div>

              {/* Quick Stats Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 dark:border-border text-xs sm:text-sm">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">4 Sân Đấu</div>
                  <div className="text-slate-600 dark:text-slate-300 font-medium">Chuẩn USAPA Pro</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">10 Phút</div>
                  <div className="text-slate-600 dark:text-slate-300 font-medium">Khóa lịch tự động</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">100%</div>
                  <div className="text-slate-600 dark:text-slate-300 font-medium">Hàng chính hãng</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Showcase Card */}
            <div className="lg:col-span-5 relative pt-4 sm:pt-0">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-border bg-white dark:bg-card p-4 shadow-xl shadow-slate-200/50 dark:shadow-black/50 space-y-4">
                {/* Court Image Banner */}
                <div className="aspect-video rounded-2xl overflow-hidden relative border border-slate-200 dark:border-border shadow-inner group">
                  <img
                    src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=800"
                    alt="Sân Pickleball Pick Center"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Quick Info */}
                <div className="bg-[#FAF8F5] dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200/80 dark:border-border space-y-3">
                  <div className="flex items-center text-xs text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      Cầu Giấy, Hà Nội
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Cụm Sân Pickleball Pick Center</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    Đèn LED chống chói thi đấu chuyên nghiệp, lounge máy lạnh, phòng tắm nóng lạnh & pro shop hỗ trợ mượn vợt dùng thử.
                  </p>

                  <Link to="/booking" className="block pt-1">
                    <Button
                      size="sm"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl gap-1.5 shadow-md shadow-emerald-600/20 text-xs h-10 cursor-pointer"
                    >
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

      {/* ========================================================= */}
      {/* 2. ✨ DANH MỤC NỔI BẬT */}
      {/* ========================================================= */}
      <section className="container mx-auto max-w-7xl px-3 sm:px-6 space-y-5">
        <div className="flex items-end justify-between border-b border-slate-200/80 dark:border-border pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Danh mục nổi bật
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              Khám phá theo loại sản phẩm và dịch vụ
            </p>
          </div>

          <Link
            to="/products"
            className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors group"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 5 Distinct Category Cards in a Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {featuredCategories.map((cat) => {
            const Icon = cat.icon
            const destination = cat.isBooking ? '/booking' : `/products?category=${encodeURIComponent(cat.id)}`

            return (
              <Link
                key={cat.id}
                to={destination}
                className="group relative bg-white dark:bg-card rounded-2xl p-5 border border-slate-200/90 dark:border-border shadow-sm hover:shadow-lg dark:hover:shadow-black/50 hover:border-emerald-500/50 transition-all duration-300 flex flex-col items-center text-center space-y-3 cursor-pointer"
              >
                {/* Soft Icon Box */}
                <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] dark:bg-slate-900/80 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 border border-slate-100 dark:border-border group-hover:border-emerald-200 dark:group-hover:border-emerald-800 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-xs">
                  <Icon className={`w-7 h-7 ${cat.iconColor} dark:text-emerald-400`} />
                </div>

                <div className="space-y-0.5">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
                    {cat.count}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SẢN PHẨM NỔI BẬT */}
      {/* ========================================================= */}
      <section className="container mx-auto max-w-7xl px-3 sm:px-6 space-y-6">
        {/* Section Header with Category Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-border pb-5">
          <div className="space-y-1.5 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Sản Phẩm Được Mua Nhiều Nhất
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-normal">
              Vợt carbon 3S, bóng thi đấu và phụ kiện chính hãng JOOLA, Selkirk, Franklin.
            </p>
          </div>

          {/* Sliding Pill Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none relative">
            {[
              { id: 'all', label: 'Tất Cả' },
              { id: 'racket', label: 'Vợt Carbon' },
              { id: 'ball', label: 'Bóng Thi Đấu' },
              { id: 'accessory', label: 'Phụ Kiện' },
            ].map((tab) => {
              const isActive = activeCategory === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className="relative px-4 py-2 rounded-full text-xs font-medium transition-colors shrink-0 select-none flex items-center justify-center cursor-pointer"
                >
                  {isActive && (
                    <motion.div
                      layoutId="home-category-sliding-pill"
                      transition={{
                        type: 'spring',
                        stiffness: 280,
                        damping: 26,
                        mass: 0.8,
                      }}
                      className="absolute inset-0 bg-slate-900 dark:bg-emerald-600 rounded-full shadow-sm z-0"
                    />
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 bg-white dark:bg-card border border-slate-200/90 dark:border-border rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors z-0" />
                  )}
                  <span
                    className={`relative z-10 transition-colors ${
                      isActive ? 'text-white font-semibold' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              )
            })}

            <Link to="/products" className="ml-1 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs font-medium text-slate-700 dark:text-slate-300 border-slate-300 dark:border-border rounded-full h-8 px-3.5 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Product Cards Grid: 4 Cột Cân Đối, Vừa Vặn */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-slate-200/70 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 4. CỤM SÂN THI ĐẤU (FEATURED COURTS) */}
      {/* ========================================================= */}
      <section className="container mx-auto max-w-7xl px-3 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-border pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Hệ Thống 4 Sân Đấu Chuẩn USAPA
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              Mặt sân Decoturf thi đấu chống trơn trượt, đèn LED 500 Lux chuẩn giải đấu
            </p>
          </div>

          <Link to="/booking">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-300 dark:border-border text-xs font-semibold gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span>Xem sơ đồ & lịch trống</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {courts.map((court) => (
            <div
              key={court.id}
              className="bg-white dark:bg-card rounded-2xl overflow-hidden border border-slate-200/90 dark:border-border shadow-sm hover:shadow-lg dark:hover:shadow-black/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="aspect-[16/10] overflow-hidden relative group">
                <img
                  src={court.image}
                  alt={court.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-2.5 left-2.5 bg-slate-900/90 dark:bg-slate-800/90 text-white text-[11px] font-medium backdrop-blur-sm">
                  {court.type}
                </Badge>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      {court.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{court.name}</h3>
                  <div className="text-sm font-bold text-slate-900 dark:text-emerald-400">{court.price}</div>
                </div>

                <Link to="/booking" className="block pt-1">
                  <Button
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl h-9"
                  >
                    Đặt sân này
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. ✨ THƯƠNG HIỆU THỂ THAO ĐỒNG HÀNH */}
      {/* ========================================================= */}
      <section className="container mx-auto max-w-7xl px-3 sm:px-6">
        <div className="bg-white dark:bg-card rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-border shadow-sm space-y-5">
          <div className="text-center space-y-1">
            <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
              Đối Tác Phân Phối Chính Hãng
            </h3>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Các thương hiệu Pickleball hàng đầu thế giới
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {topBrands.map((brand) => (
              <Link
                key={brand.name}
                to={`/products?search=${encodeURIComponent(brand.name)}`}
                className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-slate-900/60 border border-slate-200/70 dark:border-border hover:border-emerald-500/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all text-center space-y-1 group cursor-pointer"
              >
                <div className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 tracking-wider">
                  {brand.name}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                  {brand.desc}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. 4 CAM KẾT VÀNG CHẤT LƯỢNG */}
      {/* ========================================================= */}
      <section className="container mx-auto max-w-7xl px-3 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3.5 bg-white dark:bg-card p-5 rounded-2xl border border-slate-200/90 dark:border-border shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50 group-hover:scale-105 transition-transform">
              <Award className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">100% Chính Hãng</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Đạt chuẩn USAPA Pro</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white dark:bg-card p-5 rounded-2xl border border-slate-200/90 dark:border-border shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50 group-hover:scale-105 transition-transform">
              <Truck className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">Giao Hỏa Tốc 2H</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Nội thành Hà Nội</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white dark:bg-card p-5 rounded-2xl border border-slate-200/90 dark:border-border shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50 group-hover:scale-105 transition-transform">
              <RotateCcw className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">Đổi Trả 7 Ngày</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Lỗi nhà sản xuất</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white dark:bg-card p-5 rounded-2xl border border-slate-200/90 dark:border-border shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">Bảo Hành 12 Tháng</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Mặt vợt carbon 3S</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
