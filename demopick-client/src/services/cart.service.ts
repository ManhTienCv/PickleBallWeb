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

const LOCAL_CART_KEY = 'demopick_local_cart'

const getLocalCart = (): Cart => {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      const total_amount = (parsed.items || []).reduce((acc: number, item: any) => acc + (item.subtotal || 0), 0)
      return { id: 1, total_amount, items: parsed.items || [] }
    }
  } catch {}
  return { id: 1, total_amount: 0, items: [] }
}

const saveLocalCart = (cart: Cart): Cart => {
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart))
    window.dispatchEvent(new Event('storage'))
  } catch {}
  return cart
}

export const cartService = {
  async getCart(): Promise<Cart> {
    try {
      const response = await api.get<ApiResponse<Cart>>('/cart')
      if (response.data?.data?.items) {
        return response.data.data
      }
    } catch {}
    return getLocalCart()
  },

  async addToCart(variantId: number, quantity: number = 1, productData?: any): Promise<Cart> {
    try {
      const response = await api.post<ApiResponse<Cart>>('/cart/items', {
        product_variant_id: variantId,
        quantity,
      })
      if (response.data?.data) {
        return response.data.data
      }
    } catch {}

    // Fallback LocalStorage logic for Demo / Offline mode
    const currentCart = getLocalCart()
    const existingIndex = currentCart.items.findIndex(
      (item) => item.product_variant_id === variantId || item.id === variantId
    )

    let updatedItems = [...currentCart.items]

    if (existingIndex >= 0) {
      const existing = updatedItems[existingIndex]
      const newQty = existing.quantity + quantity
      const subtotal = newQty * existing.unit_price
      updatedItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        subtotal,
      }
    } else {
      const unitPrice = productData?.price ? Number(productData.price) : 5490000
      const newItem: CartItem = {
        id: Date.now(),
        product_variant_id: variantId,
        quantity,
        unit_price: unitPrice,
        subtotal: unitPrice * quantity,
        product: productData || {
          id: Date.now(),
          name: 'Vợt Pickleball Cao Cấp',
          slug: 'vot-pickleball',
          price: unitPrice,
          image_url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400',
        },
        variant: {
          id: variantId,
          sku: 'SKU-DEMO',
          option_name: 'Quy cách',
          option_value: 'Mặc định',
          price: unitPrice,
          stock_quantity: 50,
        },
      }
      updatedItems.push(newItem)
    }

    const total_amount = updatedItems.reduce((acc, i) => acc + i.subtotal, 0)
    const newCart = { id: 1, total_amount, items: updatedItems }
    return saveLocalCart(newCart)
  },

  async updateQuantity(itemId: number, quantity: number): Promise<Cart> {
    try {
      const response = await api.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, {
        quantity,
      })
      if (response.data?.data) {
        return response.data.data
      }
    } catch {}

    const currentCart = getLocalCart()
    const updatedItems = currentCart.items.map((item) => {
      if (item.id === itemId || item.product_variant_id === itemId) {
        const newQty = Math.max(1, quantity)
        return {
          ...item,
          quantity: newQty,
          subtotal: newQty * item.unit_price,
        }
      }
      return item
    })
    const total_amount = updatedItems.reduce((acc, i) => acc + i.subtotal, 0)
    const newCart = { id: 1, total_amount, items: updatedItems }
    return saveLocalCart(newCart)
  },

  async removeItem(itemId: number): Promise<Cart> {
    try {
      const response = await api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`)
      if (response.data?.data) {
        return response.data.data
      }
    } catch {}

    const currentCart = getLocalCart()
    const updatedItems = currentCart.items.filter(
      (item) => item.id !== itemId && item.product_variant_id !== itemId
    )
    const total_amount = updatedItems.reduce((acc, i) => acc + i.subtotal, 0)
    const newCart = { id: 1, total_amount, items: updatedItems }
    return saveLocalCart(newCart)
  },
}
