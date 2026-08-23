import api, { ApiResponse } from '@/lib/api'

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  icon?: string
}

export interface Brand {
  id: number
  name: string
  slug: string
  logo_url?: string
}

export interface ProductVariant {
  id: number
  sku: string
  option_name: string
  option_value: string
  price: number
  stock_quantity: number
  color_name?: string
  color_hex?: string
  image_url?: string
  thickness?: string // e.g. "14mm" | "16mm"
  size?: string // e.g. "S" | "M" | "L" | "XL" | "XXL"
}

export interface TechnicalSpecs {
  material?: string
  thickness?: string
  weight?: string
  usapa_certified?: boolean
  origin?: string
}

export interface ProductReview {
  id: string
  productId: number
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  createdAt: string
  variantPurchased?: string
  isVerifiedPurchase: boolean
  likes: number
  images?: string[]
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  sale_price?: number
  image_url: string
  gallery?: string[]
  category?: Category
  brand?: Brand
  variants: ProductVariant[]
  in_stock: boolean
  specs?: TechnicalSpecs
  rating_avg?: number
  reviews_count?: number
}

export interface ProductQueryParams {
  category_id?: number
  brand_id?: number
  search?: string
  sort?: string
  page?: number
}

// Key for synced products in localStorage between POS & Web
const SYNCED_PRODUCTS_KEY = 'demopick_synced_products'
const REVIEWS_STORAGE_PREFIX = 'demopick_product_reviews_'

export const DEFAULT_CLIENT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Vợt JOOLA Perseus 3S Carbon 16mm Ben Johns Edition',
    slug: 'vot-joola-perseus-3s',
    price: 5490000,
    sale_price: 5990000,
    image_url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600',
    description: 'Vợt thi đấu đỉnh cao của tay vợt số 1 thế giới Ben Johns với công nghệ Carbon T700 Charged, lõi Propulsion Core trợ lực tối đa.',
    category: { id: 1, name: 'Vợt Pickleball', slug: 'vot-pickleball' },
    brand: { id: 1, name: 'JOOLA', slug: 'joola' },
    in_stock: true,
    variants: [
      { id: 101, sku: 'JOO-PER-3S-16MM', option_name: 'Độ dày', option_value: '16mm', price: 5490000, stock_quantity: 15 },
      { id: 102, sku: 'JOO-PER-3S-14MM', option_name: 'Độ dày', option_value: '14mm', price: 5490000, stock_quantity: 10 },
    ],
    specs: {
      material: 'Raw Carbon T700 Charged',
      thickness: '16mm & 14mm',
      weight: '225g - 235g',
      usapa_certified: true,
      origin: 'Mỹ / Nhập khẩu chính hãng',
    },
  },
  {
    id: 2,
    name: 'Vợt Selkirk Vanguard Power Air Invikta Pro',
    slug: 'vot-selkirk-vanguard',
    price: 6200000,
    sale_price: 6800000,
    image_url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=600',
    description: 'Dòng vợt cao cấp không viền Air Dynamic Throttle tăng tốc độ vung vợt, màng ProSpin+ NextGen tạo xoáy bóng tối đa.',
    category: { id: 1, name: 'Vợt Pickleball', slug: 'vot-pickleball' },
    brand: { id: 2, name: 'Selkirk', slug: 'selkirk' },
    in_stock: true,
    variants: [
      { id: 201, sku: 'SEL-POW-AIR-STD', option_name: 'Quy cách', option_value: 'Tiêu chuẩn', price: 6200000, stock_quantity: 12 },
    ],
    specs: {
      material: 'QuadFlex 4 Layer Hybrid Face',
      thickness: '13mm Aerodynamic',
      weight: '220g - 230g',
      usapa_certified: true,
      origin: 'USA Made',
    },
  },
  {
    id: 3,
    name: 'Vợt CRBN 1X Power Series 14mm Raw Carbon',
    slug: 'vot-crbn-1x-power',
    price: 4850000,
    sale_price: 5200000,
    image_url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=600',
    description: 'Bề mặt Toray T700 Raw Carbon nhám tự nhiên siêu bám bóng, hỗ trợ lực xoáy bóng và smash uy lực vùng cuối sân.',
    category: { id: 1, name: 'Vợt Pickleball', slug: 'vot-pickleball' },
    brand: { id: 3, name: 'CRBN', slug: 'crbn' },
    in_stock: true,
    variants: [
      { id: 301, sku: 'CRBN-1X-14MM', option_name: 'Độ dày', option_value: '14mm', price: 4850000, stock_quantity: 18 },
      { id: 302, sku: 'CRBN-1X-16MM', option_name: 'Độ dày', option_value: '16mm', price: 4850000, stock_quantity: 20 },
    ],
    specs: {
      material: 'Toray T700 Carbon Fiber',
      thickness: '14mm & 16mm',
      weight: '225g',
      usapa_certified: true,
      origin: 'USA Design',
    },
  },
  {
    id: 4,
    name: 'Vợt Franklin Signature Pro Carbon 16mm',
    slug: 'vot-franklin-signature-pro',
    price: 3450000,
    sale_price: 3800000,
    image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600',
    description: 'Vợt chính thức của giải thi đấu US Open Pickleball Championships, điểm ngọt lớn, kiểm soát bóng êm ái.',
    category: { id: 1, name: 'Vợt Pickleball', slug: 'vot-pickleball' },
    brand: { id: 4, name: 'Franklin', slug: 'franklin' },
    in_stock: true,
    variants: [
      { id: 401, sku: 'FRA-SIG-16MM', option_name: 'Độ dày', option_value: '16mm', price: 3450000, stock_quantity: 25 },
    ],
    specs: {
      material: 'Carbon Fiber Surface + MaxGrit',
      thickness: '16mm Polypropylene Core',
      weight: '215g - 225g',
      usapa_certified: true,
      origin: 'Chính hãng',
    },
  },
  {
    id: 5,
    name: 'Hộp 12 Bóng Franklin X-40 Outdoor USAPA Approved',
    slug: 'bong-franklin-x40',
    price: 420000,
    sale_price: 460000,
    image_url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&q=80&w=600',
    description: 'Bóng thi đấu ngoài trời chuẩn 40 lỗ đục khí động học, độ nảy đồng đều và độ bền cao không lo nứt vỡ.',
    category: { id: 2, name: 'Bóng Pickleball', slug: 'bong-pickleball' },
    brand: { id: 4, name: 'Franklin', slug: 'franklin' },
    in_stock: true,
    variants: [
      { id: 501, sku: 'FRA-X40-12PACK', option_name: 'Quy cách', option_value: 'Hộp 12 Quả', price: 420000, stock_quantity: 50 },
    ],
  },
  {
    id: 6,
    name: 'Bao Vợt Pickleball Chống Sốc JOOLA Tour Pro Backpack',
    slug: 'bao-vot-joola-tour-pro',
    price: 1650000,
    sale_price: 1850000,
    image_url: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&q=80&w=600',
    description: 'Balo đựng vợt chuyên nghiệp có ngăn cách nhiệt bảo vệ 4 cây vợt, ngăn thông gió đựng giày và móc treo sân tiện lợi.',
    category: { id: 3, name: 'Phụ kiện & Bao vợt', slug: 'phu-kien-bao-vot' },
    brand: { id: 1, name: 'JOOLA', slug: 'joola' },
    in_stock: true,
    variants: [
      { id: 601, sku: 'JOO-BAG-TOUR', option_name: 'Màu sắc', option_value: 'Đen / Xám', price: 1650000, stock_quantity: 30 },
    ],
  },
  {
    id: 7,
    name: 'Set 3 Cuộn Quấn Cán Chống Trơn Wilson Pro Overgrip',
    slug: 'cuon-quan-can-wilson-pro',
    price: 125000,
    sale_price: 140000,
    image_url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&q=80&w=600',
    description: 'Bọc tay cầm siêu thấm hút mồ hôi, bề mặt mỏng êm ái tạo độ bám chắc chắn khi vận động cường độ cao.',
    category: { id: 3, name: 'Phụ kiện & Bao vợt', slug: 'phu-kien-bao-vot' },
    brand: { id: 2, name: 'Wilson', slug: 'wilson' },
    in_stock: true,
    variants: [
      { id: 701, sku: 'WIL-GRIP-3PK', option_name: 'Màu sắc', option_value: 'Trắng', price: 125000, stock_quantity: 80 },
    ],
  },
  {
    id: 8,
    name: 'Áo Thi Đấu Pickleball Dry-Fit Unisex Thấm Hút Mồ Hôi',
    slug: 'ao-thi-dau-dryfit-unisex',
    price: 350000,
    sale_price: 390000,
    image_url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=600',
    description: 'Chất liệu vải mè thể thao co giãn 4 chiều, công nghệ thoát nhiệt QuickDry giúp cơ thể luôn khô thoáng suốt trận đấu.',
    category: { id: 4, name: 'Quần áo & Trang phục', slug: 'quan-ao-trang-phuc' },
    brand: { id: 1, name: 'DEMOPICK', slug: 'demopick' },
    in_stock: true,
    variants: [
      { id: 801, sku: 'APP-SHIRT-M', option_name: 'Size', option_value: 'M (55-65kg)', price: 350000, stock_quantity: 40 },
      { id: 802, sku: 'APP-SHIRT-L', option_name: 'Size', option_value: 'L (65-75kg)', price: 350000, stock_quantity: 50 },
    ],
  },
]

export const shopService = {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get<ApiResponse<Category[]>>('/categories')
      return response.data.data || []
    } catch {
      return [
        { id: 1, name: 'Vợt Pickleball', slug: 'vot-pickleball' },
        { id: 2, name: 'Bóng Pickleball', slug: 'bong-pickleball' },
        { id: 3, name: 'Phụ kiện & Bao vợt', slug: 'phu-kien-bao-vot' },
        { id: 4, name: 'Quần áo & Trang phục', slug: 'quan-ao-trang-phuc' },
      ]
    }
  },

  async getBrands(): Promise<Brand[]> {
    try {
      const response = await api.get<ApiResponse<Brand[]>>('/brands')
      return response.data.data || []
    } catch {
      return [
        { id: 1, name: 'JOOLA', slug: 'joola' },
        { id: 2, name: 'Selkirk', slug: 'selkirk' },
        { id: 3, name: 'CRBN', slug: 'crbn' },
        { id: 4, name: 'Franklin', slug: 'franklin' },
      ]
    }
  },

  async getProducts(params?: ProductQueryParams): Promise<{ items: Product[]; meta?: ApiResponse['meta'] }> {
    try {
      const response = await api.get<ApiResponse<Product[]>>('/products', { params })
      let items = response.data.data

      // Check if local synced products exist (updated by Admin / POS)
      const syncedRaw = localStorage.getItem(SYNCED_PRODUCTS_KEY)
      if (syncedRaw) {
        try {
          const syncedList: Product[] = JSON.parse(syncedRaw)
          const syncedIds = new Set((items || []).map((i) => i.id))
          const newItems = syncedList.filter((s) => s && s.id && !syncedIds.has(s.id))
          items = [...newItems, ...(items || [])].map((item) => {
            if (!item) return item
            const match = syncedList.find((s) => s && (s.id === item.id || s.slug === item.slug))
            return match ? { ...item, ...match } : item
          }).filter(Boolean)
        } catch {
          // fallback to items
        }
      }

      if (!items || items.length === 0) {
        items = DEFAULT_CLIENT_PRODUCTS
      }

      return {
        items,
        meta: response.data.meta,
      }
    } catch {
      // Fallback local mock if offline
      const syncedRaw = localStorage.getItem(SYNCED_PRODUCTS_KEY)
      if (syncedRaw) {
        try {
          const parsed = JSON.parse(syncedRaw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return { items: parsed }
          }
        } catch {
          // ignore
        }
      }
      return { items: DEFAULT_CLIENT_PRODUCTS }
    }
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const syncedRaw = localStorage.getItem(SYNCED_PRODUCTS_KEY)
    let syncedProduct: Product | undefined
    if (syncedRaw) {
      try {
        const syncedList: Product[] = JSON.parse(syncedRaw)
        syncedProduct = syncedList.find((s) => s && (s.slug === slug || String(s.id) === slug))
      } catch {
        // fallback
      }
    }

    try {
      const response = await api.get<ApiResponse<Product>>(`/products/${slug}`)
      let product = response.data.data
      if (syncedProduct) {
        product = { ...product, ...syncedProduct }
      }
      if (!product) {
        const found = DEFAULT_CLIENT_PRODUCTS.find((p) => p.slug === slug || String(p.id) === slug)
        if (found) return found
      }
      return product
    } catch (err) {
      if (syncedProduct) {
        return syncedProduct
      }
      const found = DEFAULT_CLIENT_PRODUCTS.find((p) => p.slug === slug || String(p.id) === slug)
      if (found) return found
      return DEFAULT_CLIENT_PRODUCTS[0]
    }
  },

  // ── Product Reviews System (5-Star Ratings & Real Photos) ───────────
  getProductReviews(productId: number): ProductReview[] {
    const key = `${REVIEWS_STORAGE_PREFIX}${productId}`
    const raw = localStorage.getItem(key)
    if (raw) {
      try {
        return JSON.parse(raw)
      } catch {}
    }

    // Default Seed Reviews per product with real photo evidence
    const defaultReviews: ProductReview[] = [
      {
        id: `rev-${productId}-1`,
        productId,
        userName: 'Trần Văn Mạnh',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        rating: 5,
        comment:
          'Vợt đánh cực kỳ đầm tay! Mặt nhám Carbon T700 tạo độ xoáy bóng rất gắt, dink bóng ở vùng Non-Volley Zone (Kitchen) kiểm soát cực kỳ chuẩn xác. Bóc hộp nguyên seal xịn sò.',
        createdAt: '16/08/2026',
        variantPurchased: '16mm - Đen Carbon',
        isVerifiedPurchase: true,
        likes: 12,
        images: [
          'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400',
          'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
        ],
      },
      {
        id: `rev-${productId}-2`,
        productId,
        userName: 'Nguyễn Bích Ngọc',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        rating: 5,
        comment:
          'Giao hàng siêu nhanh trong 2h tại Hà Nội. Màu hồng phấn bên ngoài đẹp hơn cả trên ảnh! Cầm nhẹ và cán vợt bọc êm tay không bị mỏi khi chơi 2 trận liên tục.',
        createdAt: '14/08/2026',
        variantPurchased: '14mm - Hồng Pastel',
        isVerifiedPurchase: true,
        likes: 8,
        images: [
          'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400',
        ],
      },
      {
        id: `rev-${productId}-3`,
        productId,
        userName: 'Lê Hoàng Long',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        rating: 4,
        comment:
          'Chất lượng hoàn thiện tuyệt vời, viền bảo vệ chắc chắn. Bản 16mm giảm chấn động cổ tay rất tốt. Đã giới thiệu cho cả CLB mua cùng.',
        createdAt: '10/08/2026',
        variantPurchased: '16mm - Xanh Neon',
        isVerifiedPurchase: true,
        likes: 5,
      },
    ]

    localStorage.setItem(key, JSON.stringify(defaultReviews))
    return defaultReviews
  },

  addReview(
    productId: number,
    review: Omit<ProductReview, 'id' | 'createdAt' | 'likes'>
  ): ProductReview {
    const reviews = this.getProductReviews(productId)
    const newRev: ProductReview = {
      ...review,
      id: `rev-${productId}-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      likes: 0,
    }
    const updated = [newRev, ...reviews]
    localStorage.setItem(`${REVIEWS_STORAGE_PREFIX}${productId}`, JSON.stringify(updated))
    return newRev
  },

  likeReview(productId: number, reviewId: string): void {
    const reviews = this.getProductReviews(productId)
    const updated = reviews.map((r) => (r.id === reviewId ? { ...r, likes: r.likes + 1 } : r))
    localStorage.setItem(`${REVIEWS_STORAGE_PREFIX}${productId}`, JSON.stringify(updated))
  },
}

