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
  ShoppingCart,
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

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  )
  const [modalQuantity, setModalQuantity] = useState(1)

  const safePrice = Number(product.price) || 0
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(safePrice)

  const formattedSalePrice = product.sale_price
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(Number(product.sale_price))
    : null

  const totalStock = product.variants?.reduce((s, v) => s + (v?.stock_quantity || 0), 0) ?? 15

  const handleModalAddToCart = async () => {
    const variantId = selectedVariant ? selectedVariant.id : product.variants?.[0]?.id
    if (!variantId) {
      toast.error('Sản phẩm chưa có biến thể khả dụng')
      return
    }
    try {
      await cartService.addToCart(variantId, modalQuantity)
      toast.success(`Đã thêm ${modalQuantity} x "${product.name}" vào giỏ hàng!`)
      setQuickViewOpen(false)
    } catch {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng.')
    }
  }

  const handleModalBuyNow = async () => {
    await handleModalAddToCart()
    navigate('/checkout')
  }

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#27c372]/50">
        {/* Product Image & Hover Action Overlay */}
        <div className="aspect-square overflow-hidden bg-slate-100 relative block group/img">
          <Link to={`/products/${product.slug}`}>
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=400'}
              alt={product.name}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover/img:scale-105"
            />
          </Link>

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {product.brand && (
              <Badge className="bg-slate-900/90 text-white backdrop-blur-md text-[10px] font-bold px-2 py-0.5 shadow-sm">
                {product.brand.name}
              </Badge>
            )}
            {isRacket && (
              <Badge className="bg-[#27c372]/90 text-white backdrop-blur-md text-[10px] font-bold px-2 py-0.5 shadow-sm flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-300" /> USAPA Approved
              </Badge>
            )}
          </div>

          {!product.in_stock ? (
            <Badge variant="destructive" className="absolute top-2.5 right-2.5 font-bold text-[10px]">
              Hết Hàng
            </Badge>
          ) : (
            <Badge className="absolute top-2.5 right-2.5 bg-amber-500/90 text-white font-bold text-[10px]">
              Bán Chạy #1
            </Badge>
          )}

          {/* Quick View Floating Hover Button */}
          <button
            onClick={() => setQuickViewOpen(true)}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/img:opacity-100 transition-all duration-300 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-md shadow-lg flex items-center gap-1.5 z-20 scale-95 group-hover/img:scale-100"
          >
            <Eye className="w-3.5 h-3.5 text-[#27c372]" />
            <span>Xem Chi Tiết</span>
          </button>
        </div>

        {/* Content Details */}
        <div className="flex flex-1 flex-col p-4 space-y-2">
          {product.category && (
            <span className="text-[11px] font-bold text-[#16a34a] uppercase tracking-wider">
              {product.category.name}
            </span>
          )}

          <h3 className="font-bold text-slate-900 group-hover:text-[#16a34a] transition-colors line-clamp-1 text-sm">
            <Link to={`/products/${product.slug}`}>{product.name}</Link>
          </h3>

          {/* Rating & Sold count */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="flex items-center text-amber-400">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="ml-1 font-bold text-slate-800 text-xs">4.9</span>
            </div>
            <span>•</span>
            <span className="text-[11px] font-medium text-slate-500">Đã bán 142</span>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1 pt-1 font-normal">
            {product.description}
          </p>

          {/* Price & Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
            <div>
              {formattedSalePrice ? (
                <div className="flex flex-col">
                  <span className="text-base font-black text-[#16a34a] leading-tight">{formattedSalePrice}</span>
                  <span className="text-[11px] text-slate-400 line-through font-mono">{formattedPrice}</span>
                </div>
              ) : (
                <span className="text-base font-black text-slate-900">{formattedPrice}</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQuickViewOpen(true)}
                className="h-8 w-8 p-0 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                title="Xem chi tiết sản phẩm"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>

              <Button
                size="sm"
                disabled={!product.in_stock}
                onClick={() => onAddToCart && onAddToCart(product)}
                className="h-8 px-3 rounded-xl gap-1.5 bg-[#27c372] hover:bg-[#22c55e] text-white font-bold text-xs shadow-sm"
              >
                <ShoppingCart className="h-3.5 w-3.5 text-white" />
                <span>Thêm</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 QUICK VIEW PRODUCT MODAL DIALOG (Form Xem Nhanh Chi Tiết Sản Phẩm) */}
      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="max-w-3xl sm:rounded-3xl p-0 overflow-hidden border border-slate-200 bg-white shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Form Chi Tiết Sản Phẩm - {product.name}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Column: Image & Badges */}
            <div className="bg-slate-50 p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-200/80">
              <div className="aspect-square w-full max-w-xs rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-md relative group">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {isRacket && (
                  <Badge className="absolute top-3 left-3 bg-[#27c372] text-white font-bold text-xs shadow-sm gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" /> USAPA Approved
                  </Badge>
                )}
              </div>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1 text-[#16a34a]">
                  <ShieldCheck className="w-4 h-4 text-[#27c372]" /> Bảo hành 12 tháng
                </span>
                <span>•</span>
                <span>100% Chính hãng</span>
              </div>
            </div>

            {/* Right Column: Detailed Product Info Form */}
            <div className="p-6 sm:p-8 flex flex-col space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="space-y-1">
                {product.brand && (
                  <span className="text-xs font-bold text-[#16a34a] uppercase tracking-wider">
                    {product.brand.name} • {product.category?.name || 'Pickleball Equipment'}
                  </span>
                )}
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <div className="flex items-center text-amber-400 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="ml-1 text-slate-800 font-black">4.9 / 5.0</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-500 font-medium">Đã bán 142 sản phẩm</span>
                </div>
              </div>

              {/* Price Tag */}
              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 flex items-baseline gap-3">
                <span className="text-2xl font-black text-[#16a34a]">
                  {formattedSalePrice || formattedPrice}
                </span>
                {formattedSalePrice && (
                  <span className="text-xs text-slate-400 line-through font-mono">
                    {formattedPrice}
                  </span>
                )}
                <Badge className="ml-auto bg-[#27c372] text-white text-[10px] font-bold">
                  Còn hàng ({totalStock} SP)
                </Badge>
              </div>

              {/* Description */}
              <div className="space-y-1 text-xs text-slate-600">
                <p className="font-bold text-slate-900">Mô tả sản phẩm:</p>
                <p className="leading-relaxed text-slate-600 font-normal">{product.description}</p>
              </div>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-900 block">Chọn phiên bản / màu sắc:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => {
                      const isSelected = selectedVariant?.id === variant.id
                      return (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                            isSelected
                              ? 'border-[#27c372] bg-emerald-50 text-[#16a34a] font-bold shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#27c372]" />}
                          <span>{variant.option_value || variant.sku || `Phiên bản #${variant.id}`}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Counter */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-900 block">Số lượng mua:</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-xs text-slate-900">{modalQuantity}</span>
                    <button
                      onClick={() => setModalQuantity(modalQuantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleModalAddToCart}
                    className="w-full bg-[#27c372] hover:bg-[#22c55e] text-white font-bold rounded-xl h-11 text-xs gap-1.5 shadow-md shadow-[#27c372]/20"
                  >
                    <ShoppingCart className="w-4 h-4 text-white" />
                    <span>Thêm Vào Giỏ</span>
                  </Button>

                  <Button
                    onClick={handleModalBuyNow}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-11 text-xs gap-1.5 shadow-md"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Mua Ngay</span>
                  </Button>
                </div>

                <div className="text-center pt-1">
                  <Link
                    to={`/products/${product.slug}`}
                    onClick={() => setQuickViewOpen(false)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#16a34a] hover:underline"
                  >
                    <span>Xem trang chi tiết đánh giá đầy đủ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
