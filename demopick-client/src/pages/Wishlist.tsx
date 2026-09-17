import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { wishlistService } from '@/services/wishlist.service'
import { cartService } from '@/services/cart.service'
import { Product } from '@/services/shop.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  Sparkles,
  Star,
  ShoppingBag,
} from 'lucide-react'
import { toast } from 'sonner'
import { authHelpers } from '@/stores/useAuthStore'
import { useAuthModalStore } from '@/stores/useAuthModalStore'

export default function WishlistPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadWishlist = async () => {
    setIsLoading(true)
    try {
      const res = await wishlistService.getWishlist()
      setProducts(res.products || [])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadWishlist()

    const handleWishlistUpdated = () => {
      setProducts(wishlistService.getLocalWishlistProducts())
    }
    window.addEventListener('wishlist-updated', handleWishlistUpdated)
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdated)
    }
  }, [])

  const handleRemove = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await wishlistService.removeFromWishlist(productId)
    setProducts((prev) => prev.filter((p) => p.id !== productId))
    toast.success('Đã xóa khỏi danh sách yêu thích')
  }

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!authHelpers.isAuthenticated()) {
      toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.')
      useAuthModalStore.getState().openLogin()
      return
    }

    const variantId = product.variants?.[0]?.id || product.id || 1
    try {
      await cartService.addToCart(variantId, 1, product)
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`, {
        action: {
          label: 'Xem giỏ →',
          onClick: () => navigate('/cart'),
        },
      })
    } catch {
      toast.error('Lỗi khi thêm vào giỏ hàng.')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-slate-100 dark:bg-slate-850 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Sản Phẩm Yêu Thích
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Các mẫu vợt và phụ kiện bạn quan tâm được lưu trữ an toàn
              </p>
            </div>
          </div>
        </div>

        <Badge variant="outline" className="self-start sm:self-auto text-xs font-bold px-3 py-1 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20">
          {products.length} sản phẩm đã lưu
        </Badge>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-card/40 max-w-md mx-auto p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-400 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Danh sách yêu thích trống</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Hãy bấm vào biểu tượng trái tim trên các sản phẩm để lưu lại và theo dõi biến động giá.
            </p>
          </div>
          <Button onClick={() => navigate('/products')} className="gap-2 font-bold rounded-xl mt-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Khám phá sản phẩm ngay</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const firstImg =
              product.image_url ||
              (Array.isArray(product.gallery) && product.gallery[0]) ||
              'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400'

            return (
              <Card
                key={product.id}
                className="group border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden bg-card flex flex-col justify-between"
              >
                <div>
                  {/* Image wrapper */}
                  <div className="relative aspect-square overflow-hidden bg-muted/30">
                    <Link to={`/products/${product.slug || product.id}`}>
                      <img
                        src={firstImg}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleRemove(product.id, e)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
                      title="Xóa khỏi yêu thích"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {product.brand?.name && (
                      <Badge className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white border-none text-[10px] font-bold">
                        {product.brand.name}
                      </Badge>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-foreground line-clamp-2 hover:text-primary transition-colors">
                      <Link to={`/products/${product.slug || product.id}`}>
                        {product.name}
                      </Link>
                    </h3>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-emerald-600 dark:text-emerald-400">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 pt-0">
                  <Button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="w-full gap-2 font-bold rounded-xl h-10 bg-primary hover:bg-primary/90 text-primary-foreground text-xs cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Thêm vào giỏ</span>
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
