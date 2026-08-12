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
}

export interface TechnicalSpecs {
  material?: string
  thickness?: string
  weight?: string
  usapa_certified?: boolean
  origin?: string
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  sale_price?: number
  image_url: string
  category?: Category
  brand?: Brand
  variants: ProductVariant[]
  in_stock: boolean
  specs?: TechnicalSpecs
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
}
