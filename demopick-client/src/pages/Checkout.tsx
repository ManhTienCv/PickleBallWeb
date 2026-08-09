import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { cartService } from '@/services/cart.service'
import { orderService } from '@/services/order.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CreditCard, QrCode, Banknote, ShieldCheck, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const holdId = location.state?.holdId

  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'bank_transfer' | 'cash'>('bank_transfer')
  const [shippingAddress, setShippingAddress] = useState('Số 10 Đường Pickleball, Q. Cầu Giấy, Hà Nội')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
  })

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await orderService.checkout({
        payment_method: paymentMethod,
        hold_id: holdId,
        shipping_address: shippingAddress,
        note,
      })

      toast.success('Đặt hàng thành công!')
      navigate(`/order-success/${result.order_code}`, { state: { result } })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Thanh toán không thành công. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const cartTotal = cart?.total_amount || 0

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8 flex items-center gap-3">
        <CreditCard className="h-8 w-8 text-primary" />
        Xác Nhận Đơn Hàng & Thanh Toán
      </h1>

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <Card className="p-6 border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Thông Tin Giao Hàng & Liên Hệ
            </h3>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ nhận hàng (đối với thiết bị vật lý)</Label>
              <Input
                id="address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú đơn hàng (nếu có)</Label>
              <Input
                id="note"
                placeholder="Ghi chú về thời gian nhận hoặc yêu cầu thêm..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </Card>

          {/* Payment Method Selector */}
          <Card className="p-6 border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Phương Thức Thanh Toán</h3>

            <RadioGroup
              value={paymentMethod}
              onValueChange={(val: any) => setPaymentMethod(val)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 rounded-lg border border-slate-200 p-4 hover:border-primary cursor-pointer">
                <RadioGroupItem value="bank_transfer" id="bank" />
                <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                  <QrCode className="h-6 w-6 text-emerald-600" />
                  <div>
                    <div className="font-semibold text-slate-900">Chuyển khoản Ngân hàng (VietQR)</div>
                    <div className="text-xs text-slate-500">Quét mã QR tự động xác thực thanh toán</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border border-slate-200 p-4 hover:border-primary cursor-pointer">
                <RadioGroupItem value="momo" id="momo" />
                <Label htmlFor="momo" className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="h-6 w-6 rounded bg-pink-600 text-white flex items-center justify-center font-bold text-xs">
                    M
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Ví Điện Tử MoMo</div>
                    <div className="text-xs text-slate-500">Thanh toán tức thì qua cổng MoMo Sandbox</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border border-slate-200 p-4 hover:border-primary cursor-pointer">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                  <Banknote className="h-6 w-6 text-amber-600" />
                  <div>
                    <div className="font-semibold text-slate-900">Thanh toán tại sân (Chỉ áp dụng với thuê sân)</div>
                    <div className="text-xs text-slate-500">Thanh toán trực tiếp khi đến sân chơi</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <Card className="p-6 border-slate-200 bg-slate-50/50 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 pb-3 border-b border-slate-200">Đơn Hàng Tóm Tắt</h3>

            {holdId && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1">
                <span className="font-bold">✓ Đang thanh toán dịch vụ Thuê Sân</span>
                <p>Mã tạm giữ sân: #{holdId}</p>
              </div>
            )}

            {cart && cart.items.length > 0 && (
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-slate-700">Thiết bị trong giỏ ({cart.items.length}):</div>
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-slate-600">
                    <span className="truncate pr-2">{item.product?.name} x{item.quantity}</span>
                    <span className="font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-slate-900">Tổng cộng:</span>
              <span className="text-xl font-extrabold text-emerald-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}
              </span>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full gap-2 font-bold mt-4"
            >
              <span>{isSubmitting ? 'Đang khởi tạo đơn...' : 'Xác Nhận & Thanh Toán'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        </div>
      </form>
    </div>
  )
}
