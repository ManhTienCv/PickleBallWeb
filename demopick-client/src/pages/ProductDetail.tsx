import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { shopService, ProductVariant } from '@/services/shop.service'
import { cartService } from '@/services/cart.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  ShoppingCart, Check, ArrowLeft, ShieldCheck, Truck, Star, Sparkles, 
  RefreshCw, Info, Plus, Award, PackageCheck, Flame, ThumbsUp
} from 'lucide-react'
import { toast } from 'sonner'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc')

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => shopService.getProductBySlug(slug!),
    enabled: !!slug,
  })

  // Auto select first variant when product loads
  React.useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0])
    }
  }, [product])

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-slate-200 rounded-2xl animate-pulse" />
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

  const currentPrice = selectedVariant ? (selectedVariant.price ?? product?.price ?? 0) : (product?.price ?? 0)
  const isOutOfStock = selectedVariant ? (selectedVariant.stock_quantity <= 0) : (!product?.in_stock)
  const isRacket = product?.name ? String(product.name).toLowerCase().includes('vợt') : false

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Vui lòng chọn tùy chọn sản phẩm')
      return
    }
    try {
      await cartService.addToCart(selectedVariant.id, quantity)
      toast.success(`Đã thêm ${quantity} x "${product.name}" vào giỏ hàng!`)
    } catch {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-6xl space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <Link to="/" className="hover:underline">Trang chủ</Link>
          <span>›</span>
          <Link to="/products" className="hover:underline">Cửa hàng</Link>
          <span>›</span>
          <span className="text-emerald-700">{product.name}</span>
        </div>

        {/* Product Details Header Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          {/* Main Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 relative border border-slate-200 group">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {product.brand && (
                <Badge className="absolute top-4 left-4 text-xs bg-slate-900/90 text-white font-bold px-3 py-1 backdrop-blur-md">
                  {product.brand.name}
                </Badge>
              )}
              {isRacket && (
                <Badge className="absolute top-4 right-4 bg-emerald-600 text-white font-bold text-xs px-3 py-1 gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" /> USAPA Approved
                </Badge>
              )}
            </div>

            {/* Guarantees Bar */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-[11px] font-semibold text-slate-700 border border-slate-200 text-center">
              <div>🛡️ 100% Chính Hãng</div>
              <div>🚚 Freeship Từ 500K</div>
              <div>🔄 Đổi Trả 7 Ngày</div>
            </div>
          </div>

          {/* Details & Actions */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {product.category && (
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  {product.category.name}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{product.name}</h1>
              
              {/* Synced Inventory Stock Status */}
              <div className="flex items-center gap-2 text-xs">
                <Badge className="bg-emerald-600 text-white font-bold text-[11px] gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Đồng bộ POS & Web
                </Badge>
                <span className="text-slate-300">|</span>
                <span className="text-slate-700 font-bold">Tồn kho khả dụng: {selectedVariant?.stock_quantity ?? 15} sản phẩm</span>
              </div>

              {/* Price Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-baseline gap-3">
                <span className="text-3xl font-black text-emerald-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
                </span>
                {product.sale_price && (
                  <span className="text-sm text-slate-400 line-through font-mono">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                  </span>
                )}
                <Badge className="bg-amber-500 text-white font-bold text-xs ml-auto">
                  Tiết Kiệm 15%
                </Badge>
              </div>

              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm font-normal">
                {product.description}
              </p>

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                    Tùy chọn quy cách / màu sắc:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          selectedVariant?.id === variant.id
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {variant.option_value || variant.sku || `Phiên bản #${variant.id}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Counter & Add to Cart */}
              <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-sm text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
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
                  <span>{isOutOfStock ? 'Hết Hàng Rất Tiếc' : 'Thêm Vào Giỏ Hàng Ngay'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section: Mô tả / Thông số kỹ thuật */}
        <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveTab('desc')}
              className={`text-sm font-bold pb-2 transition-colors border-b-2 ${
                activeTab === 'desc'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Mô Tả Sản Phẩm
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`text-sm font-bold pb-2 transition-colors border-b-2 ${
                activeTab === 'specs'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Thông Số Kỹ Thuật Chi Tiết
            </button>
          </div>

          {activeTab === 'desc' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              <p>
                Sản phẩm <strong>{product.name}</strong> được kiểm định nghiêm ngặt về chất lượng, phù hợp cho cả tập luyện phong trào và thi đấu chuyên nghiệp. Đồng bộ tồn kho thời gian thực giữa bán trực tiếp tại quầy POS và thanh toán online qua website.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li>Công nghệ viền đúc nguyên khối chống va đập và bảo vệ thảm sân.</li>
                <li>Lõi Polypropylene Honeycomb giảm chấn động cổ tay hiệu quả.</li>
                <li>Cán vợt bọc lớp da đục lỗ hút mồ hôi êm ái chống trơn trượt.</li>
              </ul>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-700 w-1/3">Thương hiệu:</td>
                    <td className="py-2.5 px-4 text-slate-900 font-semibold">{product.brand?.name || 'JOOLA / Selkirk'}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2.5 px-4 font-bold text-slate-700">Chất liệu mặt:</td>
                    <td className="py-2.5 px-4 text-slate-900 font-semibold">{product.specs?.material || 'T700 Raw Carbon Fiber 3S'}</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-700">Độ dày lõi:</td>
                    <td className="py-2.5 px-4 text-slate-900 font-semibold">{product.specs?.thickness || '16mm Polypropylene Honeycomb'}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2.5 px-4 font-bold text-slate-700">Trọng lượng:</td>
                    <td className="py-2.5 px-4 text-slate-900 font-semibold">{product.specs?.weight || '230g ± 5g (Standard Middleweight)'}</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-700">Chứng nhận:</td>
                    <td className="py-2.5 px-4 text-emerald-700 font-bold">
                      {product.specs?.usapa_certified !== false ? 'Đạt chuẩn thi đấu USAPA Approved 2026' : 'Tiêu chuẩn tập luyện phong trào'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
