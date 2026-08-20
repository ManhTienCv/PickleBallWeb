import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Product, ProductVariant } from '@/services/shop.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ShoppingBag,
  Star,
  ShieldCheck,
  Sparkles,
  Eye,
  Check,
  Plus,
  Minus,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { cartService } from '@/services/cart.service'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const navigate = useNavigate()
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  if (!product) return null

  const productName = product.name ? String(product.name) : 'Sản phẩm Pickleball'
  const isRacket = productName.toLowerCase().includes('vợt')
  const brandName = product.brand?.name || (isRacket ? 'JOOLA' : 'DEMOPICK')

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  )
  const [modalQuantity, setModalQuantity] = useState(1)

  const safePrice = Number(product.price) || 0
  const originalPrice = Number(product.sale_price) || (safePrice > 1000000 ? Math.round(safePrice * 1.1) : safePrice)
  const hasDiscount = originalPrice > safePrice
  const discountPercent = hasDiscount ? Math.round(((originalPrice - safePrice) / originalPrice) * 100) : 0

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(safePrice)

  const formattedOriginalPrice = hasDiscount
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(originalPrice)
    : null

  const handleModalAddToCart = async () => {
    const variantId = selectedVariant ? selectedVariant.id : product.variants?.[0]?.id || product.id || Date.now()
    try {
      await cartService.addToCart(variantId, modalQuantity, product)
      toast.success(`Đã thêm ${modalQuantity} x "${product.name}" vào giỏ hàng!`, {
        action: {
          label: 'Xem giỏ hàng →',
          onClick: () => navigate('/cart'),
        },
      })
      setQuickViewOpen(false)
    } catch {
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng.')
    }
  }

  const handleModalBuyNow = async () => {
    await handleModalAddToCart()
    navigate('/checkout')
  }

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-emerald-500/50">
        {/* Product Image Box */}
        <div className="aspect-[4/3] sm:aspect-square overflow-hidden bg-[#FAF8F5] relative block group/img">
          <Link to={`/products/${product.slug || product.id}`}>
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600'}
              alt={product.name}
              onError={(e) => {
                ;(e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600'
              }}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover/img:scale-105"
            />
          </Link>

          {/* Top Left Discount or Status Badge (Chuẩn mẫu Ecommerce) */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            {discountPercent > 0 && product.in_stock && (
              <span className="bg-[#EA580C] text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                -{discountPercent}%
              </span>
            )}
            {!product.in_stock && (
              <span className="bg-rose-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                Hết hàng
              </span>
            )}
            {product.in_stock && discountPercent === 0 && (
              <span className="bg-slate-900 text-white text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm">
                Mới
              </span>
            )}
          </div>

          {/* Quick View Button on Image Hover */}
          <button
            onClick={() => setQuickViewOpen(true)}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/img:opacity-100 transition-all duration-300 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-full backdrop-blur-md shadow-lg flex items-center gap-1.5 z-20 scale-95 group-hover/img:scale-100"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Xem nhanh</span>
          </button>
        </div>

        {/* Content Details */}
        <div className="flex flex-1 flex-col p-4.5 sm:p-5 space-y-2">
          {/* Brand uppercase */}
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {brandName}
          </div>

          {/* Product Name (2 Lines Clamp) */}
          <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 text-base leading-snug min-h-[2.8rem]">
            <Link to={`/products/${product.slug || product.id}`}>{product.name}</Link>
          </h3>

          {/* Star Rating & Review Count */}
          <div className="flex items-center gap-1.5 text-sm pt-0.5">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs text-slate-400 font-normal ml-0.5">(54)</span>
          </div>

          {/* Price & Action Button (Bottom Row) */}
          <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
            <div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                {formattedPrice}
              </div>
              {formattedOriginalPrice && (
                <div className="text-xs text-slate-400 line-through font-normal mt-0.5">
                  {formattedOriginalPrice}
                </div>
              )}
            </div>

            {/* Quick Add Shopping Bag Button (Chuẩn ảnh mẫu Ecommerce) */}
            <button
              disabled={!product.in_stock}
              onClick={() => (onAddToCart ? onAddToCart(product) : handleModalAddToCart())}
              className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors shadow-sm disabled:opacity-40 disabled:hover:bg-slate-900 shrink-0"
              title="Thêm nhanh vào giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* QUICK VIEW PRODUCT MODAL DIALOG */}
      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="max-w-3xl sm:rounded-3xl p-0 overflow-hidden border border-slate-200 bg-white shadow-2xl font-sans">
          <DialogHeader className="sr-only">
            <DialogTitle>Chi Tiết Sản Phẩm - {product.name}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Column: Image & Gallery */}
            <div className="p-6 bg-[#FAF8F5] flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-slate-100 relative">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600'}
                alt={product.name}
                className="max-h-72 w-full object-contain rounded-2xl shadow-sm"
              />
              <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cam kết chính hãng 100% bảo hành 12 tháng</span>
              </div>
            </div>

            {/* Right Column: Info & Buy Options */}
            <div className="p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                    {brandName}
                  </span>
                  {product.in_stock ? (
                    <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-normal">
                      Còn hàng sẵn kho
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs font-normal">
                      Hết hàng
                    </Badge>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {product.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-semibold text-slate-800">4.9</span>
                  <span>•</span>
                  <span>Đã bán 142 cái</span>
                </div>

                {/* Price */}
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-slate-200/80 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">
                    {formattedPrice}
                  </span>
                  {formattedOriginalPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      {formattedOriginalPrice}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {product.description || 'Sản phẩm Pickleball cao cấp đạt chuẩn thi đấu USAPA, tối ưu khả năng kiểm soát và tạo xoáy bóng mạnh mẽ.'}
                </p>
              </div>

              {/* Quantity & Action Buttons */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">Số lượng:</span>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-white">
                    <button
                      type="button"
                      onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                      className="p-2 text-slate-500 hover:text-slate-900"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-semibold text-slate-900">
                      {modalQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalQuantity(modalQuantity + 1)}
                      className="p-2 text-slate-500 hover:text-slate-900"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleModalAddToCart}
                    disabled={!product.in_stock}
                    className="h-10 text-xs font-medium rounded-xl border-slate-300 hover:bg-slate-50 gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>Thêm giỏ hàng</span>
                  </Button>

                  <Button
                    onClick={handleModalBuyNow}
                    disabled={!product.in_stock}
                    className="h-10 text-xs font-medium rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 gap-1.5"
                  >
                    <span>Mua ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
