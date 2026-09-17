import api, { ApiResponse } from '@/lib/api'
import { Product, ProductVariant } from './shop.service'
import { authHelpers } from '@/stores/useAuthStore'
import { useAuthModalStore } from '@/stores/useAuthModalStore'

export interface CartItem {
  id: number
  product_variant_id: number
  variant_id?: number
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
const pendingDeletions = new Set<number>()

/**
 * Deduplicates and standardizes cart items into a clean, uniform shape
 */
export const normalizeCart = (rawCart: any): Cart => {
  if (!rawCart) {
    return { id: 1, total_amount: 0, items: [] }
  }

  const rawItems = Array.isArray(rawCart.items) ? rawCart.items : []
  const itemMap = new Map<number, CartItem>()

  for (const item of rawItems) {
    if (!item) continue
    const vId = Number(item.product_variant_id || item.variant_id || item.variant?.id || item.id)
    if (!vId) continue

    // If item is in pending deletion, ignore it
    if (pendingDeletions.has(vId) || pendingDeletions.has(Number(item.id))) {
      continue
    }

    const qty = Number(item.quantity) || 1
    const price = Number(item.unit_price) || Number(item.variant?.price) || Number(item.product?.price) || 0

    if (itemMap.has(vId)) {
      // Merge duplicate variant entry into one
      const existing = itemMap.get(vId)!
      const newQty = existing.quantity + qty
      existing.quantity = newQty
      existing.subtotal = newQty * existing.unit_price
    } else {
      const subtotal = Number(item.subtotal) || Number(item.total_price) || (price * qty)
      const cartItem: CartItem = {
        id: Number(item.id) || vId,
        product_variant_id: vId,
        variant_id: vId,
        quantity: qty,
        unit_price: price,
        subtotal: subtotal,
        product: item.product || item.variant?.product || {
          id: item.variant?.product_id || vId,
          name: item.metadata?.product_name || 'Vợt Pickleball Cao Cấp',
          slug: 'vot-pickleball',
          price: price,
          image_url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400',
        },
        variant: item.variant || {
          id: vId,
          sku: item.metadata?.sku || `SKU-${vId}`,
          option_name: 'Phiên bản',
          option_value: item.metadata?.color || 'Tiêu chuẩn',
          price: price,
          stock_qty: 50,
          stock_quantity: 50,
        },
      }
      itemMap.set(vId, cartItem)
    }
  }

  const items = Array.from(itemMap.values())
  const total_amount = items.reduce((acc, i) => acc + i.subtotal, 0)

  return {
    id: rawCart.id || 1,
    total_amount,
    items,
  }
}

export const getLocalCart = (): Cart => {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY)
    if (raw) {
      return normalizeCart(JSON.parse(raw))
    }
  } catch {}
  return { id: 1, total_amount: 0, items: [] }
}

export const saveLocalCart = (cart: Cart, notify: boolean = true): Cart => {
  const normalized = normalizeCart(cart)
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(normalized))
    if (notify) {
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: normalized }))
      // DO NOT dispatch synthetic 'storage' event in same tab to avoid premature refetches!
    }
  } catch {}
  return normalized
}

export const cartService = {
  getLocalCart,
  saveLocalCart,
  normalizeCart,

  async getCart(): Promise<Cart> {
    const localCart = getLocalCart()
    try {
      const response = await api.get<ApiResponse<any>>('/cart')
      const serverData = response.data?.data
      if (serverData && Array.isArray(serverData.items)) {
        const serverNormalized = normalizeCart(serverData)

        // MERGE: Preserve any local items that haven't reached the server yet (in-flight additions)
        // or where the user has increased quantity locally!
        const mergedMap = new Map<number, CartItem>()

        for (const sItem of serverNormalized.items) {
          if (!pendingDeletions.has(sItem.product_variant_id) && !pendingDeletions.has(sItem.id)) {
            mergedMap.set(sItem.product_variant_id, sItem)
          }
        }

        for (const lItem of localCart.items) {
          if (pendingDeletions.has(lItem.product_variant_id) || pendingDeletions.has(lItem.id)) {
            continue
          }
          if (!mergedMap.has(lItem.product_variant_id)) {
            // Keep local item that server hasn't saved yet
            mergedMap.set(lItem.product_variant_id, lItem)
          } else {
            // If local quantity is higher than server (in-flight increment), preserve higher quantity
            const itemInMap = mergedMap.get(lItem.product_variant_id)!
            if (lItem.quantity > itemInMap.quantity) {
              itemInMap.quantity = lItem.quantity
              itemInMap.subtotal = lItem.quantity * itemInMap.unit_price
            }
          }
        }

        const mergedItems = Array.from(mergedMap.values())
        const finalCart: Cart = {
          id: serverNormalized.id,
          total_amount: mergedItems.reduce((acc, i) => acc + i.subtotal, 0),
          items: mergedItems,
        }
        saveLocalCart(finalCart, false)
        return finalCart
      }
    } catch {}
    return localCart
  },

  async addToCart(variantId: number, quantity: number = 1, productData?: any): Promise<Cart> {
    if (!authHelpers.isAuthenticated()) {
      useAuthModalStore.getState().openLogin()
      throw new Error('AUTH_REQUIRED')
    }

    const currentCart = getLocalCart()
    const targetVariantId = Number(variantId)
    pendingDeletions.delete(targetVariantId)

    const existingIndex = currentCart.items.findIndex(
      (item) => item.product_variant_id === targetVariantId || item.variant_id === targetVariantId
    )

    const updatedItems = [...currentCart.items]

    if (existingIndex >= 0) {
      const existing = updatedItems[existingIndex]
      const newQty = existing.quantity + quantity
      updatedItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        subtotal: newQty * existing.unit_price,
      }
    } else {
      const unitPrice = productData?.price ? Number(productData.price) : 5490000
      const newItem: CartItem = {
        id: Date.now(),
        product_variant_id: targetVariantId,
        variant_id: targetVariantId,
        quantity,
        unit_price: unitPrice,
        subtotal: unitPrice * quantity,
        product: productData || {
          id: targetVariantId,
          name: 'Vợt Pickleball Cao Cấp',
          slug: 'vot-pickleball',
          price: unitPrice,
          image_url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400',
        },
        variant: {
          id: targetVariantId,
          sku: `SKU-${targetVariantId}`,
          option_name: 'Phiên bản',
          option_value: 'Tiêu chuẩn',
          price: unitPrice,
          stock_qty: 50,
          stock_quantity: 50,
        },
      }
      updatedItems.push(newItem)
    }

    const optimisticCart = normalizeCart({ id: 1, items: updatedItems })
    saveLocalCart(optimisticCart, true)

    // Background sync to Laravel server
    api.post<ApiResponse<any>>('/cart/items', {
      item_type: 'product',
      variant_id: targetVariantId,
      product_variant_id: targetVariantId,
      quantity,
    }).then((response) => {
      const serverData = response.data?.data
      if (serverData && Array.isArray(serverData.items)) {
        const latestLocal = getLocalCart()
        const serverNormalized = normalizeCart(serverData)
        const combinedMap = new Map<number, CartItem>()

        for (const sItem of serverNormalized.items) {
          if (!pendingDeletions.has(sItem.product_variant_id) && !pendingDeletions.has(sItem.id)) {
            combinedMap.set(sItem.product_variant_id, sItem)
          }
        }
        for (const lItem of latestLocal.items) {
          if (!pendingDeletions.has(lItem.product_variant_id) && !pendingDeletions.has(lItem.id)) {
            if (!combinedMap.has(lItem.product_variant_id)) {
              combinedMap.set(lItem.product_variant_id, lItem)
            } else {
              const itemInMap = combinedMap.get(lItem.product_variant_id)!
              if (lItem.quantity > itemInMap.quantity) {
                itemInMap.quantity = lItem.quantity
                itemInMap.subtotal = lItem.quantity * itemInMap.unit_price
              }
            }
          }
        }
        const syncedItems = Array.from(combinedMap.values())
        const syncedCart: Cart = {
          id: serverNormalized.id,
          total_amount: syncedItems.reduce((acc, i) => acc + i.subtotal, 0),
          items: syncedItems,
        }
        saveLocalCart(syncedCart, true)
      }
    }).catch(() => {})

    return optimisticCart
  },

  async updateQuantity(itemId: number, quantity: number): Promise<Cart> {
    const currentCart = getLocalCart()
    const targetId = Number(itemId)
    const newQty = Math.max(1, quantity)

    const updatedItems = currentCart.items.map((item) => {
      if (item.id === targetId || item.product_variant_id === targetId || item.variant_id === targetId) {
        return {
          ...item,
          quantity: newQty,
          subtotal: newQty * item.unit_price,
        }
      }
      return item
    })

    const newCart = normalizeCart({ id: 1, items: updatedItems })
    saveLocalCart(newCart, true)

    // Background sync
    api.put<ApiResponse<any>>(`/cart/items/${targetId}`, {
      quantity: newQty,
    }).catch(() => {})

    return newCart
  },

  async removeItem(itemId: number): Promise<Cart> {
    const currentCart = getLocalCart()
    const targetId = Number(itemId)

    const itemToRemove = currentCart.items.find(
      (item) => item.id === targetId || item.product_variant_id === targetId || item.variant_id === targetId
    )
    if (itemToRemove) {
      pendingDeletions.add(itemToRemove.product_variant_id)
      pendingDeletions.add(itemToRemove.id)
    }

    const updatedItems = currentCart.items.filter(
      (item) => item.id !== targetId && item.product_variant_id !== targetId && item.variant_id !== targetId
    )

    const newCart = normalizeCart({ id: 1, items: updatedItems })
    saveLocalCart(newCart, true)

    // Background sync
    api.delete<ApiResponse<any>>(`/cart/items/${targetId}`)
      .then(() => {
        if (itemToRemove) {
          pendingDeletions.delete(itemToRemove.product_variant_id)
          pendingDeletions.delete(itemToRemove.id)
        }
      })
      .catch(() => {
        if (itemToRemove) {
          pendingDeletions.delete(itemToRemove.product_variant_id)
          pendingDeletions.delete(itemToRemove.id)
        }
      })

    return newCart
  },

  clearCart(): Cart {
    const emptyCart: Cart = { id: 1, total_amount: 0, items: [] }
    saveLocalCart(emptyCart, true)
    return emptyCart
  },
}
