import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { shopService, ProductVariant, ProductReview } from '@/services/shop.service'
import { cartService } from '@/services/cart.service'
import TechnicalSpecsTable from '@/components/product/TechnicalSpecsTable'
import { ProductReviewsSection } from '@/components/product/ProductReviewsSection'
import ProductCard from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  ShoppingCart,
  Check,
  Star,
  Sparkles,
  Plus,
  Layers,
  Palette,
  Ruler,
  PackagePlus,
  CheckSquare,
  Square,
  ArrowRight,
  Gift,
  Heart,
} from 'lucide-react'
import { toast } from 'sonner'
import { wishlistService } from '@/services/wishlist.service'

const SAFE_PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' font-weight='bold' fill='%2394a3b8'%3EPickleball DemoPick%3C/text%3E%3C/svg%3E"
import { authHelpers } from '@/stores/useAuthStore'
import { useAuthModalStore } from '@/stores/useAuthModalStore'

// Default color palettes with authentic Pickleball local assets
const DEFAULT_COLOR_VARIANTS = [
  {
    name: 'Đen Carbon Pro',
    hex: '#0f172a',
    image: '/images/pickleball_paddle_joola.jpg',
  },
  {
    name: 'Xanh Neon Cyber',
    hex: '#06b6d4',
    image: '/images/pickleball_paddle_balls.jpg',
  },
  {
    name: 'Carbon Raw T700',
    hex: '#334155',
    image: '/images/pickleball_carbon_technology.png',
  },
  {
    name: 'Trắng Bạc Titan',
    hex: '#e2e8f0',
    image: '/images/pickleball_paddles_collection.jpg',
  },
]

const APPAREL_SIZES = [
  { size: 'S', desc: '45 - 55 kg' },
  { size: 'M', desc: '55 - 65 kg' },
  { size: 'L', desc: '65 - 75 kg' },
  { size: 'XL', desc: '75 - 85 kg' },
  { size: 'XXL', desc: '> 85 kg' },
]

const PADDLE_THICKNESSES = [
  {
    thickness: '14mm',
    title: '14mm - Sức Mạnh & Tốc Độ (Power & Speed)',
    desc: 'Thân mỏng, lực đàn hồi mạnh, hỗ trợ smash và phản xạ nhanh trên lưới.',
  },
  {
    thickness: '16mm',
    title: '16mm - Kiểm Soát & Độ Xoáy (Control & Touch)',
    desc: 'Lõi dày êm ái, điểm ngọt (sweet spot) rộng, dink bóng chuẩn xác vùng Kitchen.',
  },
]

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  // State
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc')

  // Interactive Variant States
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR_VARIANTS[0])
  const [selectedThickness, setSelectedThickness] = useState<'14mm' | '16mm'>('16mm')
  const [selectedSize, setSelectedSize] = useState<string>('L')
  const [activeImage, setActiveImage] = useState<string>('')

  // Reviews State
  const [reviews, setReviews] = useState<ProductReview[]>([])

  // Frequently Bought Together Bundle States
  const [includeBundleBall, setIncludeBundleBall] = useState(true)
  const [includeBundleGrip, setIncludeBundleGrip] = useState(true)
  const [isAddingBundle, setIsAddingBundle] = useState(false)

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => shopService.getProductBySlug(slug!),
    enabled: !!slug,
  })

  // Fetch all products for Related Products & Cross-Sell
  const { data: allProductsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => shopService.getProducts(),
  })

  // Calculate Related Products (Same category/brand or top items)
  const relatedProducts = React.useMemo(() => {
    if (!allProductsData?.items || !product) return []
    const others = allProductsData.items.filter((p) => p && p.id !== product.id && p.slug !== product.slug)

    const sameCat = product.category?.id
      ? others.filter((p) => p.category?.id === product.category?.id)
      : []

    const sameBrand = product.brand?.id
      ? others.filter((p) => p.brand?.id === product.brand?.id && !sameCat.some((sc) => sc.id === p.id))
      : []

    const remaining = others.filter(
      (p) => !sameCat.some((sc) => sc.id === p.id) && !sameBrand.some((sb) => sb.id === p.id)
    )

    return [...sameCat, ...sameBrand, ...remaining].slice(0, 4)
  }, [allProductsData, product])

  // Bundle Pricing calculations
  const bundleBallPrice = 150000
  const bundleGripPrice = 45000
  const bundleDiscount = 20000

  const currentMainPrice = (selectedVariant ? selectedVariant.price : product?.price) || 0
  const isBothAccessoriesSelected = includeBundleBall && includeBundleGrip

  const bundleTotalPrice =
    currentMainPrice +
    (includeBundleBall ? bundleBallPrice : 0) +
    (includeBundleGrip ? bundleGripPrice : 0) -
    (isBothAccessoriesSelected ? bundleDiscount : 0)

  const handleAddBundleToCart = async () => {
    if (!product) return
    if (!authHelpers.isAuthenticated()) {
      toast.info('Vui lòng đăng nhập để mua combo sản phẩm.')
      useAuthModalStore.getState().openLogin()
      return
    }
    setIsAddingBundle(true)
    try {
      const variantId = selectedVariant ? selectedVariant.id : product.variants?.[0]?.id || product.id || Date.now()
      await cartService.addToCart(variantId, 1, product)

      if (includeBundleBall) {
        await cartService.addToCart(99901, 1, {
          id: 99901,
          name: 'Hộp 3 Quả Bóng Thi Đấu Pickleball USAPA',
          slug: 'hop-3-qua-bong-thi-dau-usapa',
          description: 'Bóng thi đấu đục lỗ ngoài trời chính hãng',
          price: bundleBallPrice,
          image_url: '/images/pickleball_balls_yellow.jpg',
          in_stock: true,
          variants: [],
        })
      }

      if (includeBundleGrip) {
        await cartService.addToCart(99902, 1, {
          id: 99902,
          name: 'Cuộn Quấn Cán Vợt Chống Mồ Hôi Cao Cấp',
          slug: 'cuon-quan-can-vot-chong-mo-hoi',
          description: 'Bọc tay cầm chống trượt thấm hút mồ hôi',
          price: bundleGripPrice,
          image_url: '/images/pickleball_overgrip_tape.jpg',
          in_stock: true,
          variants: [],
        })
      }

      toast.success('Đã thêm trọn bộ combo vào giỏ hàng thành công!', {
        action: {
          label: 'Xem giỏ hàng →',
          onClick: () => navigate('/cart'),
        },
      })
    } catch {
      toast.error('Có lỗi xảy ra khi thêm combo vào giỏ hàng.')
    } finally {
      setIsAddingBundle(false)
    }
  }

  const isPaddle = product?.name
    ? product.name.toLowerCase().includes('vợt') ||
    product.category?.name?.toLowerCase().includes('vợt')
    : false

  const isApparel = product?.name
    ? product.name.toLowerCase().includes('áo') ||
    product.name.toLowerCase().includes('quần') ||
    product.category?.name?.toLowerCase().includes('quần áo')
    : false

  // Load product initial data & reviews
  useEffect(() => {
    if (product) {
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0])
      }
      setActiveImage(product.image_url || DEFAULT_COLOR_VARIANTS[0].image)

      // Load reviews from backend API
      shopService.getProductReviews(product.id || 1).then((revList) => {
        if (revList) {
          setReviews(revList)
        }
      })
    }
  }, [product])

  const [isWishlisted, setIsWishlisted] = useState<boolean>(() =>
    product ? wishlistService.isInWishlist(product.id) : false
  )

  useEffect(() => {
    if (product) {
      setIsWishlisted(wishlistService.isInWishlist(product.id))
    }
    const handler = () => {
      if (product) {
        setIsWishlisted(wishlistService.isInWishlist(product.id))
      }
    }
    window.addEventListener('wishlist-updated', handler)
    return () => window.removeEventListener('wishlist-updated', handler)
  }, [product])

  const handleToggleWishlist = async () => {
    if (!product) return
    if (!authHelpers.isAuthenticated()) {
      toast.info('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích.')
      useAuthModalStore.getState().openLogin()
      return
    }
    const res = await wishlistService.toggleWishlist(product)
    setIsWishlisted(res.in_wishlist)
    if (res.in_wishlist) {
      toast.success(`Đã thêm "${product.name}" vào danh sách yêu thích!`, {
        action: {
          label: 'Xem yêu thích →',
          onClick: () => navigate('/wishlist'),
        },
      })
    } else {
      toast.info(`Đã bỏ "${product.name}" khỏi danh sách yêu thích.`)
    }
  }

  // Change image when color changes
  const handleColorSelect = (colorItem: typeof DEFAULT_COLOR_VARIANTS[0]) => {
    setSelectedColor(colorItem)
    setActiveImage(colorItem.image)
  }


  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-slate-200 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse" />
            <div className="h-24 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Không tìm thấy sản phẩm</h2>
        <Button onClick={() => navigate('/products')} className="mt-4">
          Quay lại cửa hàng
        </Button>
      </div>
    )
  }


  const currentPrice = selectedVariant
    ? selectedVariant.price ?? product?.price ?? 0
    : product?.price ?? 0
  const isOutOfStock = selectedVariant
    ? ((selectedVariant.stock_quantity ?? selectedVariant.stock_qty ?? 10) <= 0)
    : !product?.in_stock

  // Variant label for cart and review
  const fullVariantLabel = isPaddle
    ? `${selectedThickness} • ${selectedColor.name}`
    : isApparel
      ? `Size ${selectedSize} • ${selectedColor.name}`
      : selectedColor.name

  const handleAddToCart = () => {
    if (!authHelpers.isAuthenticated()) {
      toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.')
      useAuthModalStore.getState().openLogin()
      return
    }

    const variantId = selectedVariant?.id || product.id || 1
    // Instant 0ms toast notification
    toast.success(
      `Đã thêm ${quantity} x "${product.name} (${fullVariantLabel})" vào giỏ hàng!`,
      {
        action: {
          label: 'Xem giỏ hàng →',
          onClick: () => navigate('/cart'),
        },
      }
    )
    cartService.addToCart(variantId, quantity, product).catch(() => {
      toast.error('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.')
    })
  }

  // Calculate review score stats for hero summary
  const totalReviews = reviews.length
  const avgScore = totalReviews
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0'


  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-background font-sans pb-16">
      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-6xl space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
          <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline">
            Trang chủ
          </Link>
          <span className="text-slate-400 dark:text-slate-600">›</span>
          <Link to="/products" className="hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline">
            Cửa hàng
          </Link>
          <span className="text-slate-400 dark:text-slate-600">›</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">{product.name}</span>
        </div>

        {/* Product Details Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white dark:bg-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-border shadow-sm">
          {/* CỘT TRÁI: Gallery & Ảnh Thay Đổi Động */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 relative border border-slate-200 dark:border-border group">
              <img
                src={activeImage}
                alt={product.name}
                onError={(e) => {
                  const target = e.currentTarget
                  target.onerror = null
                  target.src = SAFE_PLACEHOLDER_IMAGE
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {product.brand && (
                <Badge className="absolute top-4 left-4 text-xs bg-slate-900/90 dark:bg-slate-800/90 text-white font-medium px-3 py-1 backdrop-blur-md border border-slate-700">
                  {product.brand.name}
                </Badge>
              )}

              {isPaddle && (
                <Badge className="absolute top-4 right-4 bg-emerald-600 text-white font-medium text-xs px-3 py-1 gap-1 shadow-md">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" /> USAPA Approved
                </Badge>
              )}

              {/* Tag Màu Đang Xem */}
              <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-border shadow-sm flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 inline-block shrink-0 shadow-sm"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <span>Màu: {selectedColor.name}</span>
              </div>
            </div>

            {/* Thumbnail Gallery Click Để Đổi Ảnh */}
            <div className="grid grid-cols-4 gap-2.5">
              {DEFAULT_COLOR_VARIANTS.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleColorSelect(item)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all relative cursor-pointer ${selectedColor.name === item.name
                    ? 'border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-600/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 opacity-80 hover:opacity-100'
                    }`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      const target = e.currentTarget
                      target.onerror = null
                      target.src = SAFE_PLACEHOLDER_IMAGE
                    }}
                    className="w-full h-full object-cover"
                  />
                  <span
                    className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white dark:border-slate-800 shadow-sm"
                    style={{ backgroundColor: item.hex }}
                  />
                </button>
              ))}
            </div>

            {/* Guarantees Bar */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-border text-center">
              <div>🛡️ 100% Chính Hãng</div>
              <div>🚚 Freeship Từ 500K</div>
              <div>🔄 Đổi Trả 7 Ngày</div>
            </div>
          </div>

          {/* CỘT PHẢI: Tùy Chọn Biến Thể & Đặt Hàng */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {product.category && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {product.category.name}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Review summary snippet */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-amber-500">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 ml-1">{avgScore} / 5</span>
                </div>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  {totalReviews} đánh giá khách hàng
                </button>
              </div>

              {/* Price Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-border flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(currentPrice)}
                </span>
                {product.sale_price && (
                  <span className="text-sm text-slate-400 dark:text-slate-500 line-through font-mono">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(product.price)}
                  </span>
                )}
                <Badge className="bg-amber-500 text-white font-bold text-xs ml-auto shadow-sm">
                  Tiết Kiệm 15%
                </Badge>
              </div>

              {/* 1. BỘ CHỌN MÀU SẮC */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Màu Sắc: </span>
                    <strong className="text-emerald-700 dark:text-emerald-400 normal-case font-extrabold">
                      {selectedColor.name}
                    </strong>
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    (Nhấn để đổi ảnh sản phẩm)
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {DEFAULT_COLOR_VARIANTS.map((color) => {
                    const isCurrent = selectedColor.name === color.name
                    return (
                      <button
                        key={color.name}
                        onClick={() => handleColorSelect(color)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-colors duration-150 cursor-pointer ${isCurrent
                          ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 shadow-sm ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'
                          }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0 shadow-sm"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ml-1" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 2. BỘ CHỌN ĐỘ DÀY (NẾU LÀ VỢT) HOẶC SIZE (NẾU LÀ QUẦN ÁO) */}
              {isPaddle && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Độ Dày Mặt Vợt:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 normal-case font-extrabold">
                      {selectedThickness}
                    </strong>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PADDLE_THICKNESSES.map((item) => {
                      const isSelected = selectedThickness === item.thickness
                      return (
                        <button
                          key={item.thickness}
                          onClick={() => setSelectedThickness(item.thickness as '14mm' | '16mm')}
                          className={`p-3.5 rounded-xl text-left border transition-colors duration-150 text-xs cursor-pointer ${isSelected
                            ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/80 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-emerald-500'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
                            }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className={isSelected ? 'text-emerald-800 dark:text-emerald-300 font-bold' : 'text-slate-900 dark:text-slate-100'}>
                              {item.title}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 leading-snug font-normal">
                            {item.desc}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {isApparel && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                      <Ruler className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Kích Thước / Size Áo:</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 normal-case font-extrabold">
                        Size {selectedSize}
                      </strong>
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {APPAREL_SIZES.map((s) => {
                      const isSelected = selectedSize === s.size
                      return (
                        <button
                          key={s.size}
                          onClick={() => setSelectedSize(s.size)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors duration-150 flex flex-col items-center min-w-[68px] cursor-pointer ${isSelected
                            ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'
                            }`}
                        >
                          <span className="font-extrabold text-sm">{s.size}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-300 font-medium">
                            {s.desc}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Variant Tóm Tắt */}
              <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-sm">
                <span className="font-bold">
                  Đang chọn: <strong>{fullVariantLabel}</strong>
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  Tồn kho: {selectedVariant?.stock_quantity ?? 15} SP
                </span>
              </div>

              {/* Quantity Counter & Add to Cart */}
              <div className="flex items-center gap-4 pt-3 border-t border-slate-200 dark:border-border">
                <div className="flex items-center border border-slate-300 dark:border-border rounded-xl overflow-hidden bg-white dark:bg-slate-900/60 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-sm text-slate-900 dark:text-slate-100">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>
                    {isOutOfStock ? 'Hết Hàng Rất Tiếc' : 'Thêm Vào Giỏ Hàng Ngay'}
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleToggleWishlist}
                  className="h-11 w-11 p-0 rounded-xl border-slate-300 dark:border-border hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 transition-transform active:scale-95 cursor-pointer"
                  title={isWishlisted ? 'Bỏ khỏi yêu thích' : 'Lưu vào yêu thích'}
                >
                  <Heart
                    className={`h-5 w-5 transition-colors ${isWishlisted
                        ? 'fill-rose-500 text-rose-500'
                        : 'text-slate-600 dark:text-slate-300 hover:text-rose-500'
                      }`}
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* TABS SECTION */}
        <Card className="p-6 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm space-y-6 rounded-3xl">
          <div className="flex items-center gap-6 border-b border-slate-200 dark:border-border pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('desc')}
              className={`text-sm font-bold pb-2 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${activeTab === 'desc'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
            >
              Mô Tả Sản Phẩm
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`text-sm font-bold pb-2 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${activeTab === 'specs'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
            >
              Thông Số Kỹ Thuật Chi Tiết
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`text-sm font-bold pb-2 transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
            >
              <span>Đánh Giá Khách Hàng</span>
              <Badge
                variant="outline"
                className="text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
              >
                {totalReviews}
              </Badge>
            </button>
          </div>

          {/* TAB 1: MÔ TẢ */}
          {activeTab === 'desc' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              <p>
                Sản phẩm <strong className="text-slate-900 dark:text-slate-100 font-bold">{product.name}</strong> được kiểm định nghiêm ngặt về
                chất lượng, phù hợp cho cả tập luyện phong trào và thi đấu chuyên nghiệp.
                Đồng bộ tồn kho thời gian thực giữa bán trực tiếp tại quầy POS và thanh
                toán online qua website.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Công nghệ viền đúc nguyên khối chống va đập và bảo vệ thảm sân.</li>
                <li>Lõi Polypropylene Honeycomb giảm chấn động cổ tay hiệu quả.</li>
                <li>Cán vợt bọc lớp da đục lỗ hút mồ hôi êm ái chống trơn trượt.</li>
              </ul>
            </div>
          )}

          {/* TAB 2: THÔNG SỐ KỸ THUẬT */}
          {activeTab === 'specs' && (
            <TechnicalSpecsTable
              specs={{
                origin: product.brand?.name || 'JOOLA / Selkirk',
                material: product.specs?.material || 'T700 Raw Carbon Fiber 3S',
                thickness: selectedThickness || '16mm Polypropylene Honeycomb',
                weight: product.specs?.weight || '230g ± 5g (Standard Middleweight)',
                usapa_certified: product.specs?.usapa_certified !== false,
              }}
            />
          )}

          {/* TAB 3: ĐÁNH GIÁ & NHẬN XÉT KHÁCH HÀNG (5-STAR RATINGS & HÌNH ẢNH THỰC TẾ) */}
          {activeTab === 'reviews' && (
            <ProductReviewsSection
              productId={product?.id || 1}
              productName={product?.name || ''}
              variantLabel={fullVariantLabel}
              reviews={reviews}
              onReviewsChange={setReviews}
            />
          )}
        </Card>

        {/* COMBO KHUYÊN DÙNG (Frequently Bought Together Bundle) */}
        <Card className="p-6 sm:p-8 bg-white dark:bg-card border-slate-200/80 dark:border-border rounded-3xl shadow-sm space-y-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold px-2.5 py-0.5 text-xs">
                  <Gift className="w-3.5 h-3.5 mr-1" />
                  Combo Tiết Kiệm
                </Badge>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                  Thường được mua cùng
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Trang bị đầy đủ phụ kiện thi đấu cần thiết với mức giá ưu đãi đặc biệt
              </p>
            </div>
            {isBothAccessoriesSelected && (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold self-start sm:self-auto">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Tiết kiệm 20.000₫ khi mua trọn bộ
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: 3 Product Cards in a responsive Grid (No squishing/cramping) */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Item 1: Main Product */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 p-1 shrink-0 overflow-hidden border border-slate-200/60 dark:border-slate-700 shadow-sm">
                      <img
                        src={product.image_url || DEFAULT_COLOR_VARIANTS[0].image}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                        Sản phẩm này
                      </span>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                        {product.name}
                      </h4>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Giá:</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-emerald-400">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentMainPrice)}
                    </span>
                  </div>
                </div>

                {/* Item 2: Pickleball Balls */}
                <div
                  onClick={() => setIncludeBundleBall(!includeBundleBall)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between space-y-3 ${includeBundleBall
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 shadow-sm'
                      : 'bg-slate-50/40 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 p-1 shrink-0 overflow-hidden border border-slate-200/60 dark:border-slate-700 shadow-sm relative">
                      <img
                        src="/images/pickleball_balls_yellow.jpg"
                        alt="Hộp 3 Bóng USAPA"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                        Phụ kiện 1
                      </span>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                        Hộp 3 Bóng USAPA
                      </h4>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {includeBundleBall ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <span>Mua kèm</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-emerald-400">
                      + 150.000₫
                    </span>
                  </div>
                </div>

                {/* Item 3: Overgrip Tape */}
                <div
                  onClick={() => setIncludeBundleGrip(!includeBundleGrip)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between space-y-3 ${includeBundleGrip
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 shadow-sm'
                      : 'bg-slate-50/40 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 p-1 shrink-0 overflow-hidden border border-slate-200/60 dark:border-slate-700 shadow-sm relative">
                      <img
                        src="/images/pickleball_overgrip_tape.jpg"
                        alt="Quấn Cán Vợt Overgrip"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                        Phụ kiện 2
                      </span>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                        Quấn Cán Chống Trượt
                      </h4>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {includeBundleGrip ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <span>Mua kèm</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-emerald-400">
                      + 45.000₫
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Bundle Summary & Add Button */}
            <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-900/70 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                  Tổng giá trị combo ({1 + (includeBundleBall ? 1 : 0) + (includeBundleGrip ? 1 : 0)} món):
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-emerald-400">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bundleTotalPrice)}
                  </span>
                  {isBothAccessoriesSelected && (
                    <span className="text-xs text-slate-400 line-through font-medium">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bundleTotalPrice + bundleDiscount)}
                    </span>
                  )}
                </div>
                {isBothAccessoriesSelected && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    ✓ Đã giảm trừ trực tiếp 20.000₫ ưu đãi
                  </p>
                )}
              </div>

              <Button
                onClick={handleAddBundleToCart}
                disabled={isAddingBundle || !product.in_stock}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 gap-2 transition-all active:scale-[0.99]"
              >
                <PackagePlus className="w-4 h-4" />
                <span>{isAddingBundle ? 'Đang thêm combo...' : 'Thêm trọn bộ vào giỏ hàng'}</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* SẢN PHẨM TƯƠNG TỰ (Related & Similar Products Grid) */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 dark:border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Sản phẩm tương tự
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Các mẫu trang bị cùng phân khúc được nhiều người chơi Pickleball đánh giá cao
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
            >
              <span>Xem tất cả sản phẩm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-card rounded-3xl border border-slate-200/80 dark:border-border">
              <p className="text-xs text-slate-500">Đang cập nhật thêm các sản phẩm cùng loại...</p>
            </div>
          )}
        </div>
      </div>


    </div>
  )
}
