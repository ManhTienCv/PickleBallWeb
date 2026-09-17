import React, { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartService, CartItem } from '@/services/cart.service'
import { useCheckoutTimer } from '@/contexts/CheckoutTimerContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ShoppingCart, Trash2, ArrowRight, ArrowLeft, ShoppingBag, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import { authHelpers } from '@/stores/useAuthStore'
import { useAuthModalStore } from '@/stores/useAuthModalStore'

export default function CartPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { startTimer, resetTimer } = useCheckoutTimer()

  useEffect(() => {
    // Exiting checkout flow to cart resets the 20-minute timer per requirements
    resetTimer()
  }, [resetTimer])

  const handleProceedToCheckout = () => {
    if (!authHelpers.isAuthenticated()) {
      toast.info('Vui lòng đăng nhập để tiếp tục thanh toán đơn hàng.')
      useAuthModalStore.getState().openLogin()
      return
    }
    startTimer()
    navigate('/checkout')
  }

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    initialData: () => cartService.getLocalCart(),
  })

  useEffect(() => {
    const handleCartUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<any>
      const freshCart = customEvent.detail || cartService.getLocalCart()
      queryClient.setQueryData(['cart'], freshCart)
    }
    const handleStorage = () => {
      const freshCart = cartService.getLocalCart()
      queryClient.setQueryData(['cart'], freshCart)
    }
    window.addEventListener('cart-updated', handleCartUpdated)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdated)
      window.removeEventListener('storage', handleStorage)
    }
  }, [queryClient])

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      cartService.updateQuantity(itemId, quantity),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart)
    },
  })

  const removeMutation = useMutation({
    mutationFn: (itemId: number) => cartService.removeItem(itemId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart)
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  const items = cart?.items || []
  const totalAmount = cart?.total_amount || 0

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4 text-center max-w-md">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto mb-4">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Giỏ hàng trống</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Bạn chưa có thiết bị hay phụ kiện nào trong giỏ hàng.
        </p>
        <Button onClick={() => navigate('/products')} className="mt-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Khám phá sản phẩm ngay</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-8 flex items-center gap-3">
        <ShoppingCart className="h-8 w-8 text-primary" />
        Giỏ Hàng Của Bạn
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item: CartItem) => {
            const variantProduct = (item.variant as any)?.product
            const displayName = item.product?.name || variantProduct?.name || (item as any).metadata?.product_name || 'Vợt Pickleball'
            const displaySlug = item.product?.slug || variantProduct?.slug || 'vot-pickleball'
            const displayImage = item.product?.image_url || variantProduct?.image_url || '/images/pickleball_paddle_joola.jpg'

            return (
              <Card key={item.product_variant_id || item.variant_id || item.id} className="p-4 flex items-center gap-4 border-slate-200 dark:border-border bg-white dark:bg-card">
                <img
                  src={displayImage}
                  alt={displayName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/pickleball_paddle_joola.jpg'
                  }}
                  className="h-20 w-20 object-cover rounded-lg bg-slate-100 dark:bg-slate-850 border border-slate-100 dark:border-border"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    <Link to={`/products/${displaySlug}`} className="hover:text-primary">
                      {displayName}
                    </Link>
                  </h4>
                {item.variant && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.variant.option_name}: {item.variant.option_value}
                  </p>
                )}
                <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-1 text-sm">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unit_price)}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border border-slate-200 dark:border-border rounded-lg bg-white dark:bg-slate-900/60">
                <button
                  onClick={() =>
                    item.quantity > 1
                      ? updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                      : removeMutation.mutate(item.id)
                  }
                  className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-l-lg"
                >
                  -
                </button>
                <span className="px-3 py-1 font-semibold text-sm text-slate-900 dark:text-slate-100">{item.quantity}</span>
                <button
                  onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                  className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-r-lg"
                >
                  +
                </button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMutation.mutate(item.id)}
                className="text-slate-400 dark:text-slate-500 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              </Card>
            )
          })}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-6 border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-200 dark:border-border">Tóm Tắt Đơn Hàng</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Tạm tính ({items.length} sản phẩm):</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Miễn phí</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-border flex justify-between items-baseline">
              <span className="font-bold text-slate-900 dark:text-slate-100">Tổng thanh toán:</span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-200 font-semibold">
              <Ticket className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Có mã giảm giá hoặc voucher ưu đãi? Bạn có thể nhập và áp dụng tại bước thanh toán kế tiếp!</span>
            </div>

            <Button
              size="lg"
              onClick={handleProceedToCheckout}
              className="w-full gap-2 font-bold mt-2"
            >
              <span>Tiến Hành Đặt Hàng</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
