import api, { ApiResponse } from '@/lib/api'
import { Product, ProductVariant } from './shop.service'

export interface CartItem {
  id: number
  product_variant_id: number
  quantity: number
  unit_price: number
  subtotal: number
  product: Product
  variant: ProductVariant
}

export interface Cart {
  id: number
  total_amount: number
  items: CartItem[]
}

export const cartService = {
  async getCart(): Promise<Cart> {
    const response = await api.get<ApiResponse<Cart>>('/cart')
    return response.data.data
  },

  async addToCart(variantId: number, quantity: number = 1): Promise<Cart> {
    const response = await api.post<ApiResponse<Cart>>('/cart/items', {
      product_variant_id: variantId,
      quantity,
    })
    return response.data.data
  },

  async updateQuantity(itemId: number, quantity: number): Promise<Cart> {
    const response = await api.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, {
      quantity,
    })
    return response.data.data
  },

  async removeItem(itemId: number): Promise<Cart> {
    const response = await api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`)
    return response.data.data
  },
}
