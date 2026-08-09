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

  const currentPrice = selectedVariant ? selectedVariant.price : product.price
  const isOutOfStock = selectedVariant ? selectedVariant.stock_quantity <= 0 : !product.in_stock
  const isRacket = product.name.toLowerCase().includes('vợt')

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

              {/* Rating & Sold count */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-current" />
                  ))}
                  <span className="ml-1.5 font-bold text-slate-900 text-sm">4.9</span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-medium">142 Đánh giá</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-medium">Đã bán 350+</span>
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
                        className={`px-3.5 py-2 rounded-xl text-xs border font-semibold transition-all ${
                          selectedVariant?.id === variant.id
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold ring-2 ring-emerald-600/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {variant.option_name}: {variant.option_value}
                        <span className="ml-1.5 text-[11px] text-slate-500 font-mono">
                          (Tồn: {variant.stock_quantity})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 pt-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Số lượng:</label>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-l-xl font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 font-bold text-slate-900 text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-r-xl font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <Button
                size="lg"
                className="w-full gap-2 text-sm font-bold h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>{isOutOfStock ? 'Hết Hàng Rất Tiếc' : 'Thêm Vào Giỏ Hàng Ngay'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Section: Mô tả / Thông số kỹ thuật / Đánh giá */}
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
              Thông Số Kỹ Thuật
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`text-sm font-bold pb-2 transition-colors border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Đánh Giá Khách Hàng (142)
            </button>
          </div>

          {activeTab === 'desc' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              <p>
                Sản phẩm <strong>{product.name}</strong> được sản xuất với công nghệ hiện đại tiêu chuẩn thi đấu quốc tế USAPA. Mặt vật liệu carbon nhám nguyên chất gia tăng khả năng bám xoáy bóng tối đa và đầm tay trong từng cú dink hoặc đập smash.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li>Công nghệ viền đúc nguyên khối chống va đập và bảo vệ thảm sân.</li>
                <li>Lõi Polypropylene Honeycomb 16mm giảm chấn động cổ tay hiệu quả.</li>
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
                    <td className="py-2.5 px-4 text-slate-900 font-semibold">T700 Raw Carbon Fiber</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-700">Độ dày lõi:</td>
                    <td className="py-2.5 px-4 text-slate-900 font-semibold">14mm / 16mm Reactive Polymer</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2.5 px-4 font-bold text-slate-700">Trọng lượng:</td>
                    <td className="py-2.5 px-4 text-slate-900 font-semibold">7.8 oz - 8.2 oz (Middleweight)</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-700">Chứng nhận:</td>
                    <td className="py-2.5 px-4 text-emerald-700 font-bold">Đạt chuẩn thi đấu USAPA Approved 2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {[
                { name: 'Nguyễn Văn Minh', date: '05/02/2026', comment: 'Vợt cầm rất đầm tay, mặt carbon bám bóng đỉnh cao. Giao hàng Hà Nội chỉ trong 2 tiếng!' },
                { name: 'Trần Hải Đăng', date: '01/02/2026', comment: 'Shop đóng gói hộp xốp cẩn thận, tặng kèm bao vợt. Đánh thử ở sân VIP Long Biên rất đã.' },
              ].map((rev, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{rev.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{rev.date}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
