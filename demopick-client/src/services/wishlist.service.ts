import api, { ApiResponse } from '@/lib/api'
import { Product } from '@/services/shop.service'

const WISHLIST_STORAGE_KEY = 'demopick_wishlist_ids'
const WISHLIST_ITEMS_KEY = 'demopick_wishlist_items'

export const wishlistService = {
  getLocalWishlistIds(): number[] {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  getLocalWishlistProducts(): Product[] {
    try {
      const raw = localStorage.getItem(WISHLIST_ITEMS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  isInWishlist(productId: number): boolean {
    const ids = this.getLocalWishlistIds()
    return ids.includes(productId)
  },

  async getWishlist(): Promise<{ products: Product[]; count: number }> {
    try {
      const res = await api.get<ApiResponse<{ count: number; products: Product[] }>>('/wishlist')
      if (res.data?.data) {
        const prods = res.data.data.products || []
        const ids = prods.map((p) => p.id)
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids))
        localStorage.setItem(WISHLIST_ITEMS_KEY, JSON.stringify(prods))
        return { products: prods, count: prods.length }
      }
    } catch (err) {
      console.warn('Backend wishlist API unreachable, using local storage:', err)
    }

    const prods = this.getLocalWishlistProducts()
    return { products: prods, count: prods.length }
  },

  async toggleWishlist(product: Product): Promise<{ in_wishlist: boolean; count: number; message: string }> {
    let inWishlist = false
    let message = ''

    try {
      const res = await api.post<ApiResponse<{ in_wishlist: boolean; count: number; product_id: number }>>(
        `/wishlist/${product.id}/toggle`
      )
      if (res.data?.data) {
        inWishlist = res.data.data.in_wishlist
        message = res.data.message || (inWishlist ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích')
      }
    } catch (err) {
      console.warn('Backend wishlist toggle offline, fallback local:', err)
      const currentIds = this.getLocalWishlistIds()
      inWishlist = !currentIds.includes(product.id)
      message = inWishlist ? `Đã lưu '${product.name}' vào yêu thích!` : `Đã bỏ '${product.name}' khỏi yêu thích.`
    }

    // Sync local storage
    const currentIds = this.getLocalWishlistIds()
    const currentProds = this.getLocalWishlistProducts()

    let newIds: number[]
    let newProds: Product[]

    if (inWishlist) {
      newIds = Array.from(new Set([...currentIds, product.id]))
      newProds = [product, ...currentProds.filter((p) => p.id !== product.id)]
    } else {
      newIds = currentIds.filter((id) => id !== product.id)
      newProds = currentProds.filter((p) => p.id !== product.id)
    }

    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(newIds))
    localStorage.setItem(WISHLIST_ITEMS_KEY, JSON.stringify(newProds))

    window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { count: newIds.length, ids: newIds } }))

    return { in_wishlist: inWishlist, count: newIds.length, message }
  },

  async removeFromWishlist(productId: number): Promise<void> {
    try {
      await api.delete(`/wishlist/${productId}`)
    } catch (err) {
      console.warn('Backend remove wishlist offline:', err)
    }

    const currentIds = this.getLocalWishlistIds().filter((id) => id !== productId)
    const currentProds = this.getLocalWishlistProducts().filter((p) => p.id !== productId)

    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(currentIds))
    localStorage.setItem(WISHLIST_ITEMS_KEY, JSON.stringify(currentProds))

    window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { count: currentIds.length, ids: currentIds } }))
  },
}
