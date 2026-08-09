import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { shopService, Category, Brand } from '@/services/shop.service'
import { cartService } from '@/services/cart.service'
import ProductCard from '@/components/ProductCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search, Filter, ShoppingBag, Truck, ShieldCheck, Zap, RefreshCw, Sparkles, Award
} from 'lucide-react'
import { toast } from 'sonner'

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('newest')

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: shopService.getCategories,
  })

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: shopService.getBrands,
  })

  const { data: productData, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, selectedBrand, searchQuery],
    queryFn: () =>
      shopService.getProducts({
        category_id: selectedCategory !== 'all' ? Number(selectedCategory) : undefined,
        brand_id: selectedBrand !== 'all' ? Number(selectedBrand) : undefined,
        search: searchQuery || undefined,
      }),
  })

  const rawProducts = productData?.items || []

  // Sort products
  const products = [...rawProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    return b.id - a.id
  })

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
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Store Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white py-12 px-4 relative overflow-hidden mb-8">
        <div className="container mx-auto max-w-6xl space-y-4 relative z-10">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-bold gap-1.5 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Cửa Hàng Thiết Bị Chính Hãng 2026
          </Badge>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Bộ Sưu Tập Vợt Pickleball & Phụ Kiện Chuẩn USAPA
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Phân phối chính hãng các thương hiệu hàng đầu JOOLA, Selkirk, CRBN, Franklin. Cam kết 100% chính hãng, bảo hành 12 tháng & miễn phí vận chuyển.
          </p>

          {/* Quick Commitments Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-xs text-slate-200">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Miễn phí giao đơn từ 500K</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Cam kết chính hãng 100%</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Giao siêu tốc 2H Hà Nội</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Đổi trả 7 ngày linh hoạt</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-6">
        {/* Search & Category Filter Chips */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm tên vợt JOOLA, bóng Franklin, băng quấn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-xs h-10 border-slate-200"
              />
            </div>

            {/* Select Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-[160px] bg-slate-50 text-xs h-10 border-slate-200 font-semibold">
                  <SelectValue placeholder="Thương hiệu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thương hiệu</SelectItem>
                  {brands.map((b: Brand) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] bg-slate-50 text-xs h-10 border-slate-200 font-semibold">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Sản phẩm mới nhất</SelectItem>
                  <SelectItem value="price-low">Giá: Thấp đến Cao</SelectItem>
                  <SelectItem value="price-high">Giá: Cao đến Thấp</SelectItem>
                </SelectContent>
              </Select>

              {(selectedCategory !== 'all' || selectedBrand !== 'all' || searchQuery) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedBrand('all')
                    setSearchQuery('')
                  }}
                  className="text-xs h-10 font-bold border-slate-300 text-slate-600 hover:text-red-600"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 shrink-0 uppercase tracking-wider">Danh mục:</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tất cả sản phẩm
            </button>
            {categories.map((c: Category) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(String(c.id))}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedCategory === String(c.id)
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-900">Không tìm thấy sản phẩm phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1">Vui lòng chọn từ khóa hoặc bộ lọc danh mục khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
