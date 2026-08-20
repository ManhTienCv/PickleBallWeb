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

export const shopService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get<ApiResponse<Category[]>>('/categories')
    return response.data.data
  },

  async getBrands(): Promise<Brand[]> {
    const response = await api.get<ApiResponse<Brand[]>>('/brands')
    return response.data.data
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

      return {
        items,
        meta: response.data.meta,
      }
    } catch {
      // Fallback local mock if offline
      const syncedRaw = localStorage.getItem(SYNCED_PRODUCTS_KEY)
      if (syncedRaw) {
        try {
          return { items: JSON.parse(syncedRaw) }
        } catch {
          // ignore
        }
      }
      return { items: [] }
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
      return product
    } catch (err) {
      if (syncedProduct) {
        return syncedProduct
      }
      throw err
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

