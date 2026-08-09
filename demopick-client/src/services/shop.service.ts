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
}

export interface ProductQueryParams {
  category_id?: number
  brand_id?: number
  search?: string
  sort?: string
  page?: number
}

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
    const response = await api.get<ApiResponse<Product[]>>('/products', { params })
    return {
      items: response.data.data,
      meta: response.data.meta,
    }
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const response = await api.get<ApiResponse<Product>>(`/products/${slug}`)
    return response.data.data
  },
}
