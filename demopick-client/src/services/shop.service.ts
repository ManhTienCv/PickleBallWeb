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
  option_name?: string
  option_value?: string
  price: number
  stock_quantity?: number
  stock_qty?: number
  color?: string
  color_name?: string
  color_hex?: string
  weight?: string
  grip_size?: string
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
  short_description?: string
  price: number
  sale_price?: number
  base_price?: number
  image_url: string
  gallery?: string[]
  category?: Category
  brand?: Brand
  variants: ProductVariant[]
  in_stock: boolean
  specs?: TechnicalSpecs
  rating_avg?: number
  reviews_count?: number
  item_type?: 'product' | 'rental' | 'drink_food'
}

export interface ProductQueryParams {
  category_id?: number
  brand_id?: number
  search?: string
  sort?: string
  page?: number
}

// Key for synced products in localStorage between POS & Web
const SYNCED_PRODUCTS_KEY = 'demopick_synced_products_v3'
const REVIEWS_STORAGE_PREFIX = 'demopick_product_reviews_'

export { DEFAULT_CLIENT_PRODUCTS } from '@/data/mockProducts'
import { DEFAULT_CLIENT_PRODUCTS } from '@/data/mockProducts'

export const shopService = {
  async getCategories(): Promise<Category[]> {
    return [
      { id: 1, name: 'Vợt Pickleball', slug: 'vot-pickleball' },
      { id: 2, name: 'Bóng Pickleball', slug: 'bong-pickleball' },
      { id: 3, name: 'Phụ kiện & Bao vợt', slug: 'phu-kien-bao-vot' },
      { id: 4, name: 'Quần áo & Trang phục', slug: 'quan-ao-trang-phuc' },
      { id: 5, name: 'Đồ uống & Đồ ăn', slug: 'do-uong-do-an' },
    ]
  },

  async getBrands(): Promise<Brand[]> {
    return [
      { id: 1, name: 'JOOLA', slug: 'joola' },
      { id: 2, name: 'Selkirk', slug: 'selkirk' },
      { id: 3, name: 'CRBN', slug: 'crbn' },
      { id: 4, name: 'Franklin', slug: 'franklin' },
      { id: 5, name: 'Six Zero', slug: 'six-zero' },
      { id: 6, name: 'Engage', slug: 'engage' },
      { id: 7, name: 'Gearbox', slug: 'gearbox' },
      { id: 8, name: 'Diadem', slug: 'diadem' },
      { id: 9, name: 'Paddletek', slug: 'paddletek' },
      { id: 10, name: 'ProXR', slug: 'proxr' },
      { id: 11, name: 'Dura', slug: 'dura' },
      { id: 12, name: 'Onix', slug: 'onix' },
      { id: 13, name: 'Babolat', slug: 'babolat' },
      { id: 14, name: 'Wilson', slug: 'wilson' },
      { id: 15, name: 'Pocari', slug: 'pocari' },
      { id: 16, name: 'Revive', slug: 'revive' },
      { id: 17, name: 'Red Bull', slug: 'red-bull' },
      { id: 18, name: 'LaVie', slug: 'lavie' },
      { id: 19, name: 'DEMOPICK', slug: 'demopick' },
    ]
  },

  async getProducts(params?: ProductQueryParams): Promise<{ items: Product[]; meta?: ApiResponse['meta'] }> {
    let items = DEFAULT_CLIENT_PRODUCTS

    // Check if local synced products exist (updated by Admin / POS)
    const syncedRaw = localStorage.getItem(SYNCED_PRODUCTS_KEY)
    if (syncedRaw) {
      try {
        const syncedList: Product[] = JSON.parse(syncedRaw)
        if (Array.isArray(syncedList) && syncedList.length > 0) {
          const syncedIds = new Set(syncedList.map((i) => i.id))
          const nonSynced = items.filter((s) => !syncedIds.has(s.id))
          items = [...syncedList, ...nonSynced]
        }
      } catch {
        // fallback to items
      }
    }

    if (params?.category_id) {
      items = items.filter((p) => p.category?.id === params.category_id)
    }
    if (params?.search) {
      const q = params.search.toLowerCase()
      items = items.filter((p) => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q))
    }

    return {
      items,
      meta: {
        total: items.length,
        current_page: 1,
        last_page: 1,
        per_page: 20,
      },
    }
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const syncedRaw = localStorage.getItem(SYNCED_PRODUCTS_KEY)
    if (syncedRaw) {
      try {
        const syncedList: Product[] = JSON.parse(syncedRaw)
        const found = syncedList.find((s) => s && (s.slug === slug || String(s.id) === slug))
        if (found) return found
      } catch {}
    }
    const found = DEFAULT_CLIENT_PRODUCTS.find((p) => p.slug === slug || String(p.id) === slug)
    return found || DEFAULT_CLIENT_PRODUCTS[0]
  },

  // ── Product Reviews System (5-Star Ratings & Real Photos via MySQL API) ───────────
  async getProductReviews(productId: number): Promise<ProductReview[]> {
    try {
      const response = await api.get<ApiResponse<{ reviews: any[]; average_rating: number; total_reviews: number }>>(
        `/products/${productId}/reviews`
      )
      const data = response.data?.data
      if (data && Array.isArray(data.reviews) && data.reviews.length > 0) {
        const mapped: ProductReview[] = data.reviews.map((r: any) => ({
          id: String(r.id),
          productId: Number(r.productId || productId),
          userName: r.userName || 'Khách hàng DemoPick',
          userAvatar: r.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          rating: Number(r.rating) || 5,
          comment: r.comment || '',
          createdAt: r.createdAt || new Date().toLocaleDateString('vi-VN'),
          variantPurchased: r.variantPurchased,
          isVerifiedPurchase: Boolean(r.isVerifiedPurchase),
          likes: Number(r.likes) || 0,
          images: Array.isArray(r.images) ? r.images : [],
        }))
        localStorage.setItem(`${REVIEWS_STORAGE_PREFIX}${productId}`, JSON.stringify(mapped))
        return mapped
      }
    } catch (err) {
      console.warn('Backend reviews API offline, using cached fallback:', err)
    }

    const key = `${REVIEWS_STORAGE_PREFIX}${productId}`
    const raw = localStorage.getItem(key)
    if (raw) {
      try {
        return JSON.parse(raw)
      } catch {}
    }

    return []
  },

  async addReview(
    productId: number,
    review: Omit<ProductReview, 'id' | 'createdAt' | 'likes'>
  ): Promise<ProductReview> {
    try {
      const response = await api.post<ApiResponse<any>>(`/products/${productId}/reviews`, {
        rating: review.rating,
        comment: review.comment,
        user_name: review.userName,
        variant_purchased: review.variantPurchased,
        images: review.images,
      })
      const r = response.data?.data
      if (r) {
        const newRev: ProductReview = {
          id: String(r.id),
          productId: Number(r.productId || productId),
          userName: r.userName || review.userName,
          userAvatar: r.userAvatar || review.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          rating: Number(r.rating) || review.rating,
          comment: r.comment || review.comment,
          createdAt: r.createdAt || new Date().toLocaleDateString('vi-VN'),
          variantPurchased: r.variantPurchased || review.variantPurchased,
          isVerifiedPurchase: Boolean(r.isVerifiedPurchase),
          likes: Number(r.likes) || 0,
          images: r.images || review.images,
        }
        const cachedRaw = localStorage.getItem(`${REVIEWS_STORAGE_PREFIX}${productId}`)
        const existing: ProductReview[] = cachedRaw ? JSON.parse(cachedRaw) : []
        localStorage.setItem(`${REVIEWS_STORAGE_PREFIX}${productId}`, JSON.stringify([newRev, ...existing]))
        return newRev
      }
    } catch (err) {
      console.warn('Could not post review to backend, using local storage fallback:', err)
    }

    const key = `${REVIEWS_STORAGE_PREFIX}${productId}`
    const raw = localStorage.getItem(key)
    const existing: ProductReview[] = raw ? JSON.parse(raw) : []
    const fallbackRev: ProductReview = {
      ...review,
      id: `rev-${productId}-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      likes: 0,
    }
    localStorage.setItem(key, JSON.stringify([fallbackRev, ...existing]))
    return fallbackRev
  },

  async likeReview(productId: number, reviewId: string): Promise<void> {
    try {
      const numericId = parseInt(reviewId.replace(/\D/g, ''), 10)
      if (numericId && !isNaN(numericId)) {
        await api.post(`/reviews/${numericId}/like`)
      }
    } catch (err) {
      console.warn('Failed to like review on backend:', err)
    }

    const key = `${REVIEWS_STORAGE_PREFIX}${productId}`
    const raw = localStorage.getItem(key)
    if (raw) {
      try {
        const reviews: ProductReview[] = JSON.parse(raw)
        const updated = reviews.map((r) => (r.id === reviewId ? { ...r, likes: r.likes + 1 } : r))
        localStorage.setItem(key, JSON.stringify(updated))
      } catch {}
    }
  },
}
