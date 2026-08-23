import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { shopService, ProductVariant, ProductReview } from '@/services/shop.service'
import { cartService } from '@/services/cart.service'
import TechnicalSpecsTable from '@/components/product/TechnicalSpecsTable'
import ProductCard from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ShoppingCart,
  Check,
  Star,
  Sparkles,
  Plus,
  ThumbsUp,
  MessageSquarePlus,
  Layers,
  Palette,
  Ruler,
  Camera,
  X,
  ImageIcon,
  PackagePlus,
  CheckSquare,
  Square,
  ArrowRight,
  Gift,
} from 'lucide-react'
import { toast } from 'sonner'

// Default color palettes with realistic Pickleball high-res images
const DEFAULT_COLOR_VARIANTS = [
  {
    name: 'Đen Carbon Pro',
    hex: '#0f172a',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'Xanh Neon Cyber',
    hex: '#06b6d4',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'Hồng Pastel Sweet',
    hex: '#f43f5e',
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'Trắng Bạc Titan',
    hex: '#e2e8f0',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800',
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc')

  // Interactive Variant States
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR_VARIANTS[0])
  const [selectedThickness, setSelectedThickness] = useState<'14mm' | '16mm'>('16mm')
  const [selectedSize, setSelectedSize] = useState<string>('L')
  const [activeImage, setActiveImage] = useState<string>('')

  // Reviews System States
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | 'all' | 'with_image'>('all')
  const [newRating, setNewRating] = useState(5)
  const [newHoverRating, setNewHoverRating] = useState(0)
  const [newAuthor, setNewAuthor] = useState('')
  const [newComment, setNewComment] = useState('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  // Lightbox Zoom Image Modal
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

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
          image_url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
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
          image_url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400',
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

      // Load reviews
      const revList = shopService.getProductReviews(product.id || 1)
      setReviews(revList)
    }
  }, [product])

  // Change image when color changes
  const handleColorSelect = (colorItem: typeof DEFAULT_COLOR_VARIANTS[0]) => {
    setSelectedColor(colorItem)
    setActiveImage(colorItem.image)
  }

  // Handle Photo Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (uploadedImages.length + files.length > 3) {
      toast.error('Bạn chỉ có thể đính kèm tối đa 3 hình ảnh')
      return
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages((prev) => [...prev, event.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveUploadedImage = (indexToRemove: number) => {
    setUploadedImages(uploadedImages.filter((_, idx) => idx !== indexToRemove))
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
        <h2 className="text-2xl font-bold text-slate-900">Không tìm thấy sản phẩm</h2>
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
    ? selectedVariant.stock_quantity <= 0
    : !product?.in_stock

  // Variant label for cart and review
  const fullVariantLabel = isPaddle
    ? `${selectedThickness} • ${selectedColor.name}`
    : isApparel
      ? `Size ${selectedSize} • ${selectedColor.name}`
      : selectedColor.name

  const handleAddToCart = async () => {
    try {
      const variantId = selectedVariant?.id || product.id || 1
      await cartService.addToCart(variantId, quantity)
      toast.success(
        `Đã thêm ${quantity} x "${product.name} (${fullVariantLabel})" vào giỏ hàng!`
      )
    } catch {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.')
    }
  }

  // Handle submit review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAuthor.trim()) {
      toast.error('Vui lòng nhập họ và tên của bạn')
      return
    }
    if (!newComment.trim()) {
      toast.error('Vui lòng viết nhận xét cảm nhận của bạn')
      return
    }

    setIsSubmittingReview(true)
    const newRev = shopService.addReview(product.id || 1, {
      productId: product.id || 1,
      userName: newAuthor.trim(),
      rating: newRating,
      comment: newComment.trim(),
      variantPurchased: fullVariantLabel,
      isVerifiedPurchase: true,
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
    })

    setReviews([newRev, ...reviews])
    setNewComment('')
    setUploadedImages([])
    setShowReviewForm(false)
    setIsSubmittingReview(false)
    toast.success('Cảm ơn bạn đã gửi đánh giá kèm hình ảnh thực tế!')
  }

  const handleLikeReview = (reviewId: string) => {
    shopService.likeReview(product.id || 1, reviewId)
    setReviews(
      reviews.map((r) => (r.id === reviewId ? { ...r, likes: r.likes + 1 } : r))
    )
  }

  // Calculate review score stats & dynamic breakdown for all 5 star tiers (1 to 5 stars)
  const totalReviews = reviews.length
  const avgScore = totalReviews
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0'

  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
    return { star, count, percentage }
  })

  const filteredReviews = reviews.filter((r) => {
    if (selectedStarFilter === 'all') return true
    if (selectedStarFilter === 'with_image') return !!(r.images && r.images.length > 0)
    return r.rating === selectedStarFilter
  })

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
                          onClick={() => setSelectedThickness(item.thickness as any)}
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
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl gap-2 shadow-md shadow-emerald-600/20"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>
                    {isOutOfStock ? 'Hết Hàng Rất Tiếc' : 'Thêm Vào Giỏ Hàng Ngay'}
                  </span>
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
            <div className="space-y-8 font-sans">
              {/* Score Breakdown Summary Box */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-border items-center">
                <div className="md:col-span-4 text-center md:border-r border-slate-200 dark:border-border pr-0 md:pr-6 space-y-1">
                  <div className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">{avgScore}</div>
                  <div className="flex justify-center text-amber-400 my-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Dựa trên {totalReviews} lượt đánh giá thực tế
                  </p>
                </div>

                <div className="md:col-span-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {starCounts.map(({ star, count, percentage }) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="w-12 text-right font-bold text-slate-700 dark:text-slate-200">{star} sao</span>
                      <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-9 text-right font-mono text-[11px] text-slate-600 dark:text-slate-300 font-bold">
                        {percentage}%
                      </span>
                    </div>
                  ))}
                </div>

                <div className="md:col-span-3 flex justify-center">
                  <Button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl gap-2 shadow-sm"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    <span>{showReviewForm ? 'Đóng Form Đánh Giá' : 'Viết Đánh Giá Của Bạn'}</span>
                  </Button>
                </div>
              </div>

              {/* Bộ Lọc Theo Số Sao (5, 4, 3, 2, 1 Sao & Có Hình Ảnh) */}
              <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-border">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mr-1">Lọc theo:</span>
                <button
                  onClick={() => setSelectedStarFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors duration-150 cursor-pointer ${
                    selectedStarFilter === 'all'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Tất cả ({totalReviews})
                </button>
                {[5, 4, 3, 2, 1].map((star) => {
                  const cnt = reviews.filter((r) => r.rating === star).length
                  return (
                    <button
                      key={star}
                      onClick={() => setSelectedStarFilter(star)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors duration-150 flex items-center gap-1 cursor-pointer ${
                        selectedStarFilter === star
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{star}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>({cnt})</span>
                    </button>
                  )
                })}
                <button
                  onClick={() => setSelectedStarFilter('with_image')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors duration-150 flex items-center gap-1.5 cursor-pointer ${
                    selectedStarFilter === 'with_image'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Có hình ảnh ({reviews.filter((r) => r.images && r.images.length > 0).length})</span>
                </button>
              </div>

              {/* Form Viết Đánh Giá Mới (Kèm Tải Ảnh Thực Tế) */}
              {showReviewForm && (
                <form
                  onSubmit={handleSubmitReview}
                  className="p-6 bg-white dark:bg-card border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-sm space-y-4 animate-in fade-in duration-300"
                >
                  <div className="border-b border-slate-200 dark:border-border pb-3">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Gửi nhận xét về sản phẩm: {product.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Đánh giá của bạn sẽ giúp cộng đồng người chơi Pickleball lựa chọn đúng thiết bị phù hợp
                    </p>
                  </div>

                  {/* Interactive Star Picker */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Mức độ hài lòng của bạn:
                    </label>
                    <div className="flex items-center gap-1 text-amber-400 cursor-pointer pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onMouseEnter={() => setNewHoverRating(star)}
                          onMouseLeave={() => setNewHoverRating(0)}
                          onClick={() => setNewRating(star)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${(newHoverRating || newRating) >= star
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                              }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs text-slate-700 dark:text-slate-200 font-bold ml-2">
                        {newRating === 5
                          ? '⭐ Tuyệt vời (5/5)'
                          : newRating === 4
                            ? '⭐ Rất tốt (4/5)'
                            : newRating === 3
                              ? '⭐ Bình thường (3/5)'
                              : newRating === 2
                                ? '⭐ Tạm được (2/5)'
                                : '⭐ Chưa hài lòng (1/5)'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Họ và tên của bạn:
                      </label>
                      <Input
                        placeholder="Ví dụ: Nguyễn Văn An"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        className="text-xs h-9 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Phân loại đã mua:
                      </label>
                      <Input
                        value={fullVariantLabel}
                        readOnly
                        className="text-xs h-9 bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 rounded-xl border-slate-200 dark:border-slate-700 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Nội dung nhận xét & trải nghiệm thực tế:
                    </label>
                    <Textarea
                      placeholder="Chia sẻ cảm giác cầm vợt, độ nảy bóng, độ xoáy, đóng gói giao hàng..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="text-xs rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                      required
                    />
                  </div>

                  {/* 📸 TÍNH NĂNG TẢI ẢNH THỰC TẾ (UNBOXING / SÂN ĐẤU) */}
                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-border">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Đính kèm hình ảnh thực tế / đập hộp (Tối đa 3 ảnh):</span>
                      </label>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {uploadedImages.length}/3 ảnh
                      </span>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-3">
                      {uploadedImages.map((imgSrc, idx) => (
                        <div
                          key={idx}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-border group"
                        >
                          <img
                            src={imgSrc}
                            alt={`Review upload ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveUploadedImage(idx)}
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {uploadedImages.length < 3 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-600 bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50/50 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all text-[10px] font-bold gap-1 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Thêm ảnh</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-border">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReviewForm(false)}
                      className="text-xs rounded-xl font-bold border-border"
                    >
                      Hủy Bỏ
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmittingReview}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                    >
                      Gửi Đánh Giá Ngay
                    </Button>
                  </div>
                </form>
              )}

              {/* Danh Sách Đánh Giá Thực Tế (Kèm Ảnh Thực Tế) */}
              <div className="space-y-4 divide-y divide-slate-100 dark:divide-border">
                {filteredReviews.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 font-medium">
                    Chưa có đánh giá nào phù hợp với bộ lọc đã chọn.
                  </div>
                ) : (
                  filteredReviews.map((rev) => (
                    <div key={rev.id} className="pt-4 first:pt-0 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-emerald-200 dark:border-emerald-800">
                            {rev.userName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                                {rev.userName}
                              </span>
                              {rev.isVerifiedPurchase && (
                                <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.2">
                                  ✓ Đã mua hàng tại DemoPick
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              <div className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3 h-3 ${
                                      s <= rev.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-300 dark:text-slate-600'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span>•</span>
                              <span>{rev.createdAt}</span>
                              {rev.variantPurchased && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-600 dark:text-slate-300 font-semibold">
                                    Phân loại: {rev.variantPurchased}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Nút Like / Hữu ích */}
                        <button
                          onClick={() => handleLikeReview(rev.id)}
                          className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg transition-colors font-medium cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Hữu ích ({rev.likes})</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal pl-12">
                        {rev.comment}
                      </p>

                      {/* Danh Sách Hình Ảnh Thực Tế Khách Đính Kèm */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex items-center gap-2.5 pl-12 pt-1">
                          {rev.images.map((imgUrl, imgIdx) => (
                            <button
                              key={imgIdx}
                              onClick={() => setLightboxImage(imgUrl)}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-border hover:border-emerald-600 hover:shadow-md transition-all group relative cursor-zoom-in"
                            >
                              <img
                                src={imgUrl}
                                alt="Review attachment"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
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
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between space-y-3 ${
                    includeBundleBall
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 shadow-sm'
                      : 'bg-slate-50/40 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 p-1 shrink-0 overflow-hidden border border-slate-200/60 dark:border-slate-700 shadow-sm relative">
                      <img
                        src="https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&q=80&w=400"
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
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between space-y-3 ${
                    includeBundleGrip
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 shadow-sm'
                      : 'bg-slate-50/40 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 p-1 shrink-0 overflow-hidden border border-slate-200/60 dark:border-slate-700 shadow-sm relative">
                      <img
                        src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=400"
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

      {/* Lightbox Phóng To Ảnh Đánh Giá */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-2xl bg-black/95 border-0 p-2 text-white shadow-2xl rounded-3xl overflow-hidden">
          <DialogHeader className="p-2 flex flex-row items-center justify-between border-b border-white/10">
            <DialogTitle className="text-xs text-slate-300 font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Hình ảnh thực tế từ khách hàng</span>
            </DialogTitle>
          </DialogHeader>
          {lightboxImage && (
            <div className="flex items-center justify-center p-2 max-h-[75vh] overflow-hidden">
              <img
                src={lightboxImage}
                alt="Enlarged review photo"
                className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
