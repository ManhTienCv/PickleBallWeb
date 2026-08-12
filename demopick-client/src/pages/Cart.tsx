import React, { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartService, CartItem } from '@/services/cart.service'
import { useCheckoutTimer } from '@/contexts/CheckoutTimerContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ShoppingCart, Trash2, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'

export default function CartPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { startTimer, resetTimer } = useCheckoutTimer()

  useEffect(() => {
    // Exiting checkout flow to cart resets the 20-minute timer per requirements
    resetTimer()
  }, [resetTimer])

  const handleProceedToCheckout = () => {
    startTimer()
    navigate('/checkout')
  }

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      cartService.updateQuantity(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (itemId: number) => cartService.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
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
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 mx-auto mb-4">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Giỏ hàng trống</h2>
        <p className="text-slate-500 mt-2 text-sm">
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
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8 flex items-center gap-3">
        <ShoppingCart className="h-8 w-8 text-primary" />
        Giỏ Hàng Của Bạn
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item: CartItem) => (
            <Card key={item.id} className="p-4 flex items-center gap-4 border-slate-200">
              <img
                src={item.product?.image_url || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=200'}
                alt={item.product?.name}
                className="h-20 w-20 object-cover rounded-lg bg-slate-100 border border-slate-100"
              />

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 truncate">
                  <Link to={`/products/${item.product?.slug}`} className="hover:text-primary">
                    {item.product?.name}
                  </Link>
                </h4>
                {item.variant && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.variant.option_name}: {item.variant.option_value}
                  </p>
                )}
                <div className="font-bold text-emerald-600 mt-1 text-sm">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unit_price)}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border border-slate-200 rounded-lg">
                <button
                  onClick={() =>
                    item.quantity > 1
                      ? updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                      : removeMutation.mutate(item.id)
                  }
                  className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-l-lg"
                >
                  -
                </button>
                <span className="px-3 py-1 font-semibold text-sm text-slate-900">{item.quantity}</span>
                <button
                  onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                  className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-r-lg"
                >
                  +
                </button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMutation.mutate(item.id)}
                className="text-slate-400 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-6 border-slate-200 bg-slate-50/50 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 pb-3 border-b border-slate-200">Tóm Tắt Đơn Hàng</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính ({items.length} sản phẩm):</span>
                <span className="font-semibold text-slate-900">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold text-emerald-600">Miễn phí</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-slate-900">Tổng thanh toán:</span>
              <span className="text-xl font-extrabold text-emerald-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
              </span>
            </div>

            <Button
              size="lg"
              onClick={handleProceedToCheckout}
              className="w-full gap-2 font-bold mt-4"
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
