import React, { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ShoppingBag, CalendarDays, Truck, MapPin, ShieldCheck, ArrowRight, Receipt } from 'lucide-react'
import OrderReceiptModal from '@/components/OrderReceiptModal'

export default function OrderSuccess() {
  const { code } = useParams<{ code: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const state = location.state || {}
  const { customerName, customerPhone, shippingAddress, paymentMethod } = state

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 max-w-2xl text-center font-sans">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto mb-4 animate-in zoom-in-50">
        <CheckCircle2 className="h-12 w-12" />
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
        Đặt Hàng Thành Công!
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
        Cảm ơn bạn đã tin tưởng dịch vụ của DemoPick. Mã đơn hàng của bạn là{' '}
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{code}</span>
      </p>

      {/* Clean Order & Logistics Summary Card */}
      <Card className="mt-8 p-6 border-slate-200 dark:border-border bg-white dark:bg-card text-left space-y-5 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-3">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#27c372]" />
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              Vận Chuyển Qua GHN Express
            </span>
          </div>
          <Badge className="bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200 dark:border-orange-800 font-bold text-xs">
            GHN Tiêu Chuẩn
          </Badge>
        </div>

        <div className="space-y-3 text-xs sm:text-sm">
          {customerName && (
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Người nhận hàng:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {customerName} {customerPhone ? `(${customerPhone})` : ''}
              </span>
            </div>
          )}

          {shippingAddress && (
            <div className="flex justify-between items-start text-slate-600 dark:text-slate-400 gap-4">
              <span className="shrink-0 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Địa chỉ giao:
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-100 text-right">
                {shippingAddress}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-border pt-2.5">
            <span>Phương thức thanh toán:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {paymentMethod === 'cod'
                ? 'Thanh toán tiền mặt khi nhận hàng (COD)'
                : 'Cổng thanh toán Trực tuyến (MoMo / VietQR Hosted)'}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span>Trạng thái đơn hàng:</span>
            <Badge className="bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-bold text-xs">
              Đang chuẩn bị hàng
            </Badge>
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Đơn hàng đã được ghi nhận trên hệ thống vận chuyển GHN. Bạn có thể tra cứu hành trình theo thời gian thực bất cứ lúc nào trong mục <strong>Đơn hàng của tôi</strong>.
          </span>
        </div>
      </Card>

      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <Button
          variant="outline"
          onClick={() => setIsReceiptOpen(true)}
          className="gap-2 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100 font-bold rounded-2xl h-11"
        >
          <Receipt className="h-4 w-4 text-[#27c372]" />
          <span>Xem & In Biên Nhận</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`/orders`)}
          className="gap-2 border-slate-300 dark:border-border font-bold rounded-2xl h-11"
        >
          <CalendarDays className="h-4 w-4" />
          <span>Quản lý đơn hàng của tôi</span>
        </Button>
        <Button
          onClick={() => navigate('/products')}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl h-11"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Tiếp tục mua sắm</span>
        </Button>
      </div>

      {/* Order Receipt Modal */}
      <OrderReceiptModal
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        order={{
          id: 1,
          order_code: code || '',
          total_amount: state.totalAmount || 0,
          payment_method: paymentMethod || 'momo',
          payment_status: paymentMethod === 'cod' ? 'unpaid' : 'paid',
          status: 'pending',
          created_at: new Date().toISOString(),
          customer_name: customerName,
          customer_phone: customerPhone,
          shipping_address: shippingAddress,
          items: state.items || [],
        }}
      />
    </div>
  )
}
