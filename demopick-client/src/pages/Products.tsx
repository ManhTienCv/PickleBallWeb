import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { shopService, Category, Brand, Product } from '@/services/shop.service'
import { cartService } from '@/services/cart.service'
import ProductCard from '@/components/ProductCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Truck,
  ShieldCheck,
  Zap,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  SlidersHorizontal,
  X,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'

export default function Products() {
  const navigate = useNavigate()

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<string>('all') // 'all', 'under-1m', '1m-3m', '3m-5m', 'above-5m'
  const [inStockOnly, setInStockOnly] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('featured')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 9

  // Sort Dropdown Open state for custom UI matching Image 2
  const [sortDropdownOpen, setSortDropdownOpen] = useState<boolean>(false)

  // Fetch Categories & Brands
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: shopService.getCategories,
  })

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: shopService.getBrands,
  })

  // Fetch Products
  const { data: productData, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, searchQuery],
    queryFn: () =>
      shopService.getProducts({
        category_id: selectedCategory !== 'all' ? Number(selectedCategory) : undefined,
        search: searchQuery || undefined,
      }),
  })

  const rawProducts = productData?.items || []

  // Dynamic Category Tabs List
  const [categoryTabs, setCategoryTabs] = useState<{ id: string; label: string }[]>([
    { id: 'all', label: 'Tất cả' },
    { id: 'Vợt Pickleball', label: 'Vợt Pickleball' },
    { id: 'Bóng Pickleball', label: 'Bóng Pickleball' },
    { id: 'Phụ kiện & Bao vợt', label: 'Phụ kiện & Bao vợt' },
    { id: 'Quần áo & Trang phục', label: 'Quần áo & Trang phục' },
  ])

  // Dynamic Available Brands List for Checkboxes
  const [allBrandNames, setAllBrandNames] = useState<string[]>([
    'JOOLA',
    'Selkirk',
    'CRBN',
    'Franklin',
    'Gamma',
    'Head',
    'Diadem',
    'Babolat',
  ])

  // Sync Categories & Brands from Admin storage in Realtime
  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const catRaw = localStorage.getItem('demopick_synced_categories') || localStorage.getItem('demopick_categories')
        if (catRaw) {
          const parsed = JSON.parse(catRaw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const tabs = [
              { id: 'all', label: 'Tất cả' },
              ...parsed
                .filter((c: any) => !c.name?.includes('Đồ uống') && !c.name?.includes('Thuê'))
                .map((c: any) => ({
                  id: c.name,
                  label: c.name,
                })),
            ]
            setCategoryTabs(tabs)
          }
        }

        const brandRaw = localStorage.getItem('demopick_synced_brands') || localStorage.getItem('demopick_brands')
        if (brandRaw) {
          const parsed = JSON.parse(brandRaw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAllBrandNames(parsed.map((b: any) => b.name))
          }
        }
      } catch {}
    }

    syncFromStorage()
    window.addEventListener('storage', syncFromStorage)
    return () => window.removeEventListener('storage', syncFromStorage)
  }, [])

  // Filter Products Logic
  const filteredProducts = rawProducts.filter((p: Product) => {
    if (!p) return false

    // Category Filter
    if (selectedCategory !== 'all') {
      const matchCat =
        String(p.category?.id) === selectedCategory ||
        p.category?.name?.toLowerCase().includes(selectedCategory.toLowerCase())
      if (!matchCat) return false
    }

    // Brand Checkboxes Filter (Tích nhiều thương hiệu cùng lúc)
    if (selectedBrands.length > 0) {
      const pNameLower = (p.name || '').toLowerCase()
      const pBrandLower = (p.brand?.name || '').toLowerCase()
      const matchBrand = selectedBrands.some((b) => {
        const bLower = b.toLowerCase()
        return pBrandLower === bLower || pNameLower.includes(bLower)
      })
      if (!matchBrand) return false
    }

    // Price Range Filter
    const price = Number(p.price) || 0
    if (priceRange === 'under-1m' && price >= 1000000) return false
    if (priceRange === '1m-3m' && (price < 1000000 || price > 3000000)) return false
    if (priceRange === '3m-5m' && (price < 3000000 || price > 5000000)) return false
    if (priceRange === 'above-5m' && price <= 5000000) return false

    // In-Stock Filter
    if (inStockOnly && !p.in_stock) return false

    // Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const matchName = p.name?.toLowerCase().includes(query)
      const matchBrand = p.brand?.name?.toLowerCase().includes(query)
      const matchDesc = p.description?.toLowerCase().includes(query)
      if (!matchName && !matchBrand && !matchDesc) return false
    }

    return true
  })

  // Sort Products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = Number(a.price) || 0
    const priceB = Number(b.price) || 0
    if (sortBy === 'price-low') return priceA - priceB
    if (sortBy === 'price-high') return priceB - priceA
    if (sortBy === 'rating') return (b.id % 5) - (a.id % 5) // rating mock
    if (sortBy === 'newest') return b.id - a.id
    return 0 // 'featured'
  })

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, selectedBrands, priceRange, inStockOnly, searchQuery, sortBy])

  // Pagination Calculation
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }

  const handleAddToCart = async (product: Product) => {
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

  const sortOptions = [
    { id: 'featured', label: 'Nổi bật' },
    { id: 'price-low', label: 'Giá thấp đến cao' },
    { id: 'price-high', label: 'Giá cao đến thấp' },
    { id: 'rating', label: 'Đánh giá cao' },
    { id: 'newest', label: 'Mới nhất' },
  ]

  const currentSortLabel =
    sortOptions.find((o) => o.id === sortBy)?.label || 'Nổi bật'

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-background font-sans pb-16">
      {/* 🟢 TOP SECTION: STORE HERO BANNER */}
      <div className="container mx-auto max-w-7xl px-3 sm:px-6 mt-2 mb-8">
        <div className="bg-white dark:bg-card rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-border shadow-sm space-y-4">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Cửa Hàng Dụng Cụ Pickleball Chính Hãng
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-normal">
              Phân phối chính hãng các thương hiệu hàng đầu JOOLA, Selkirk, CRBN, Franklin. Cam kết 100% chính hãng, bảo hành 12 tháng & miễn phí vận chuyển.
            </p>

            {/* Quick Commitments Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200/80 dark:border-border text-xs font-medium text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Miễn phí giao đơn từ 500K</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Cam kết chính hãng 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Giao siêu tốc 2H Hà Nội</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Đổi trả 7 ngày linh hoạt</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 MAIN BODY: CHUẨN FORM KIỂU DÁNG ECOMMERCE NHƯ 2 ẢNH ĐẦU */}
      <div className="container mx-auto max-w-7xl px-3 sm:px-6 space-y-6">
        {/* Breadcrumb & Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300 font-medium">
            <Link to="/" className="hover:text-slate-800 dark:hover:text-white transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">Sản phẩm</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Tất cả sản phẩm Vợt & Phụ kiện
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal">
            Khám phá bộ sưu tập vợt thi đấu, bóng và phụ kiện chính hãng chuyên nghiệp
          </p>
        </div>

        {/* Category Pills (Hàng Nút Pill Ngang Có Animation Trôi Sang Tương Tự Navbar) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none relative">
          {categoryTabs.map((tab) => {
            const isActive = selectedCategory === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className="relative px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 shrink-0 select-none flex items-center justify-center cursor-pointer"
              >
                {isActive && (
                  <motion.div
                    layoutId="category-pill-sliding-capsule"
                    transition={{
                      type: 'spring',
                      stiffness: 280,
                      damping: 26,
                      mass: 0.8,
                    }}
                    className="absolute inset-0 bg-slate-900 dark:bg-emerald-600 rounded-full shadow-md z-0"
                  />
                )}
                {!isActive && (
                  <div className="absolute inset-0 bg-white dark:bg-card border border-slate-200/90 dark:border-border rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors z-0" />
                )}
                <span
                  className={`relative z-10 transition-colors duration-200 ${
                    isActive ? 'text-white font-semibold' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* 🟢 2-COLUMN LAYOUT: SIDEBAR TRÁI + GRID SẢN PHẨM PHẢI */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start pt-2">
          {/* ========================================================= */}
          {/* LEFT SIDEBAR FILTERS (CHUẨN FORM MẪU ẢNH 1 & ẢNH 2) */}
          {/* ========================================================= */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search Box in Sidebar */}
            <div className="bg-white dark:bg-card p-4 rounded-2xl border border-slate-200/90 dark:border-border shadow-sm">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm h-11 rounded-xl border-slate-200 dark:border-border bg-[#FAF8F5]/80 dark:bg-slate-900/70 text-foreground font-normal"
                />
              </div>
            </div>

            {/* BRAND FILTER CARD WITH CHECKBOXES */}
            <div className="bg-white dark:bg-card p-5 rounded-2xl border border-slate-200/90 dark:border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base tracking-tight">
                  Thương hiệu
                </h3>
                {selectedBrands.length > 0 && (
                  <button
                    onClick={() => setSelectedBrands([])}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold"
                  >
                    Bỏ chọn ({selectedBrands.length})
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {allBrandNames.map((b) => {
                  const isChecked = selectedBrands.includes(b)
                  return (
                    <label
                      key={b}
                      onClick={(e) => {
                        e.preventDefault()
                        handleBrandToggle(b)
                      }}
                      className="flex items-center gap-3 text-sm text-slate-700 hover:text-slate-900 cursor-pointer select-none group py-1"
                    >
                      <div
                        className={`w-5 h-5 min-w-[20px] min-h-[20px] rounded-md border-2 transition-all flex items-center justify-center ${
                          isChecked
                            ? 'bg-slate-900 dark:bg-emerald-600 border-slate-900 dark:border-emerald-600 text-white shadow-xs'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-card group-hover:border-slate-500'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </div>
                      <span
                        className={`text-sm transition-colors ${
                          isChecked ? 'font-semibold text-slate-900 dark:text-slate-100' : 'font-normal text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {b}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* PRICE RANGE FILTER CARD */}
            <div className="bg-white dark:bg-card p-5 rounded-2xl border border-slate-200/90 dark:border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base tracking-tight">
                  Khoảng giá
                </h3>
                {priceRange !== 'all' && (
                  <button
                    onClick={() => setPriceRange('all')}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold"
                  >
                    Xóa
                  </button>
                )}
              </div>

              <div className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                {[
                  { id: 'under-1m', label: 'Dưới 1 triệu' },
                  { id: '1m-3m', label: '1 - 3 triệu' },
                  { id: '3m-5m', label: '3 - 5 triệu' },
                  { id: 'above-5m', label: 'Trên 5 triệu' },
                ].map((item) => {
                  const isSelected = priceRange === item.id
                  return (
                    <label
                      key={item.id}
                      onClick={(e) => {
                        e.preventDefault()
                        setPriceRange(isSelected ? 'all' : item.id)
                      }}
                      className="flex items-center gap-3 cursor-pointer select-none group py-1"
                    >
                      <div
                        className={`w-5 h-5 min-w-[20px] min-h-[20px] rounded-full border-2 transition-all flex items-center justify-center ${
                          isSelected
                            ? 'border-emerald-600 bg-white dark:bg-card'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-card group-hover:border-slate-500'
                        }`}
                      >
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                      </div>
                      <span
                        className={`text-sm transition-colors ${
                          isSelected ? 'font-semibold text-slate-900 dark:text-slate-100' : 'font-normal text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.label}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* AVAILABILITY / IN-STOCK FILTER */}
            <div className="bg-white dark:bg-card p-5 rounded-2xl border border-slate-200/90 dark:border-border shadow-sm space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base tracking-tight">
                Tình trạng
              </h3>

              <label
                onClick={(e) => {
                  e.preventDefault()
                  setInStockOnly(!inStockOnly)
                }}
                className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none group py-1"
              >
                <div
                  className={`w-5 h-5 min-w-[20px] min-h-[20px] rounded-md border-2 transition-all flex items-center justify-center ${
                    inStockOnly
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-card group-hover:border-slate-500'
                  }`}
                >
                  {inStockOnly && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </div>
                <span
                  className={`text-sm transition-colors ${
                    inStockOnly ? 'font-semibold text-slate-900 dark:text-slate-100' : 'font-normal text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Còn hàng sẵn kho
                </span>
              </label>
            </div>

            {/* Clear All Filters Button */}
            {(selectedBrands.length > 0 || priceRange !== 'all' || inStockOnly || searchQuery || selectedCategory !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory('all')
                  setSelectedBrands([])
                  setPriceRange('all')
                  setInStockOnly(false)
                  setSearchQuery('')
                }}
                className="w-full h-11 text-sm font-medium rounded-xl border-slate-300 dark:border-border text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Xóa tất cả bộ lọc</span>
              </Button>
            )}
          </div>

          {/* ========================================================= */}
          {/* RIGHT PRODUCT GRID (CHUẨN FORM MẪU ẢNH 1 & ẢNH 2) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Bar: Results Count + Sort Dropdown */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
              <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                Hiển thị{' '}
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {sortedProducts.length === 0
                    ? 0
                    : `${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(
                        currentPage * itemsPerPage,
                        sortedProducts.length
                      )}`}
                </span>{' '}
                / <span className="font-bold text-slate-900 dark:text-slate-100">{sortedProducts.length}</span> sản phẩm
              </div>

              {/* Custom Sort Dropdown (Khớp 100% Ảnh 2) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="h-11 px-4 min-w-[180px] bg-white dark:bg-card border border-slate-200/90 dark:border-border rounded-2xl text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between gap-3 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>{currentSortLabel}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {sortDropdownOpen && (
                  <div className="absolute right-0 top-13 w-52 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl shadow-xl z-30 py-2 overflow-hidden text-card-foreground">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSortBy(opt.id)
                          setSortDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          sortBy === opt.id
                            ? 'bg-slate-700 dark:bg-emerald-600 text-white font-medium'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-normal'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Cards Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-80 rounded-2xl bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-card rounded-3xl border border-dashed border-slate-300 dark:border-border space-y-3">
                <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Không tìm thấy sản phẩm phù hợp
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-normal">
                  Vui lòng thử chọn thương hiệu khác, xóa bộ lọc giá hoặc gõ từ khóa tìm kiếm mới.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedBrands([])
                    setPriceRange('all')
                    setInStockOnly(false)
                    setSearchQuery('')
                  }}
                  className="rounded-xl text-sm font-medium mt-2"
                >
                  Làm mới bộ lọc
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}

            {/* 🟢 PAGINATION (CHUẨN FORM MẪU ẢNH 1) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <button
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                    window.scrollTo({ top: 400, behavior: 'smooth' })
                  }}
                  disabled={currentPage === 1}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-slate-600 dark:text-slate-300 text-sm font-normal hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white transition-all"
                >
                  &lt; Trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page)
                      window.scrollTo({ top: 400, behavior: 'smooth' })
                    }}
                    className={`w-10 h-10 rounded-xl text-sm transition-all flex items-center justify-center ${
                      currentPage === page
                        ? 'bg-slate-900 dark:bg-emerald-600 text-white font-semibold shadow-sm'
                        : 'bg-white dark:bg-card border border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-normal'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    window.scrollTo({ top: 400, behavior: 'smooth' })
                  }}
                  disabled={currentPage === totalPages}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-slate-600 dark:text-slate-300 text-sm font-normal hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white transition-all"
                >
                  Sau &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
