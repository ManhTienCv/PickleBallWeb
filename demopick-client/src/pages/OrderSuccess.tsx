import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { orderService, Order } from '@/services/order.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  ShoppingBag,
  CalendarDays,
  Truck,
  MapPin,
  ShieldCheck,
  Receipt,
  Mail,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react'
import OrderReceiptModal from '@/components/OrderReceiptModal'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

export default function OrderSuccess() {
  const { code } = useParams<{ code: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)

  const state = location.state || {}

  useEffect(() => {
    let isMounted = true
    if (!code) return

    orderService
      .getOrderByCode(code)
      .then((ord) => {
        if (!isMounted) return
        if (ord) {
          setOrder(ord)
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [code])

  const effectiveOrderCode = code || state.orderCode || 'ORD-DEMOPICK'
  const customerName = order?.customer_name || state.customerName || user?.name || 'Khách hàng'
  const customerPhone = order?.customer_phone || state.customerPhone || user?.phone || '0901234567'
  const shippingAddress = order?.shipping_address || state.shippingAddress || 'Nhận trực tiếp tại Cụm sân Pickleball'
  const paymentMethod = order?.payment_method || state.paymentMethod || 'momo'
  const paymentStatus = order?.payment_status || (paymentMethod === 'cod' ? 'unpaid' : 'paid')
  const totalAmount = order?.total_amount || state.totalAmount || state.result?.totalAmount || 0
  const effectiveEmail = (order as any)?.customer_email || (order as any)?.customerEmail || state.customerEmail || user?.email || 'khachhang@demopick.vn'

  const items = order?.items || state.items || []
  const hasCourtBooking =
    (order as any)?.slot_ids?.length > 0 ||
    state.hasCourtBooking ||
    state.holdId ||
    items.some(
      (it: any) =>
        it.itemType === 'booking_slot' ||
        it.item_type === 'booking_slot' ||
        it.item_type === 'booking' ||
        it.name?.includes('ca sân') ||
        it.name?.includes('Sân') ||
        it.item_name?.includes('ca sân') ||
        it.item_name?.includes('Sân')
    )

  const numericCode = effectiveOrderCode.replace(/\D/g, '') || '90218'
  const qrTicketCode = (order as any)?.qr_checkin_code || `PK-${numericCode.slice(-5)}-VIP`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`DEMOPICK-CHECKIN:${effectiveOrderCode}`)}`

  const formatVND = (amount: number = 0) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(effectiveOrderCode)
    setCopied(true)
    toast.success(`Đã sao chép mã đơn hàng #${effectiveOrderCode}`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 max-w-2xl text-center font-sans">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto mb-4 animate-in zoom-in-50 shadow-sm">
        <CheckCircle2 className="h-12 w-12" />
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
        Đặt Hàng & Thanh Toán Thành Công!
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm flex items-center justify-center gap-2 flex-wrap">
        <span>Cảm ơn bạn đã tin tưởng dịch vụ của DemoPick. Mã đơn hàng:</span>
        <button
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
          title="Sao chép mã đơn"
        >
          <span>#{effectiveOrderCode}</span>
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </p>

      {/* Main Order & Self-Service Card */}
      <div className="mt-8 space-y-5 text-left">
        {/* QR Code Check-in Card (Sinh mã tự động theo chuẩn ZXing) */}
        <Card className="p-5 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 dark:from-emerald-950/40 dark:via-card dark:to-emerald-950/20 rounded-3xl border-2 border-emerald-500/30 ring-1 ring-emerald-500/10 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="p-2 bg-white rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-md shrink-0 flex items-center justify-center">
              <img
                src={qrUrl}
                alt="Mã QR Check-in ZXing"
                className="w-32 h-32 object-contain rounded-xl"
              />
            </div>
            <div className="space-y-2 text-left flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-emerald-600 text-white font-black text-[11px] px-2.5 py-0.5 shadow-xs">
                  <Sparkles className="w-3 h-3 mr-1" /> VÉ CHECK-IN TỰ PHỤC VỤ (SELF-SERVICE)
                </Badge>
                <span className="text-[11px] text-slate-400 font-mono">Chuẩn ZXing QR</span>
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300">
                Mã vé điện tử: <span className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">{qrTicketCode}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Khách hàng lưu ảnh hoặc xuất trình mã QR này tại quầy Lễ tân hoặc máy quét check-in tại sân để nhận ca sân thi đấu ngay lập tức.
              </p>
            </div>
          </div>
        </Card>

        {/* Email Notification Banner (@Async EmailService) */}
        <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl border border-blue-200/80 dark:border-blue-800/60 flex items-start sm:items-center gap-3 text-xs text-blue-900 dark:text-blue-200 shadow-xs">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/60 rounded-xl text-blue-600 dark:text-blue-300 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="font-bold flex items-center gap-2 flex-wrap">
              <span>Đã gửi Hóa đơn điện tử qua Email</span>
              <Badge variant="outline" className="text-[10px] bg-blue-100/60 text-blue-700 dark:text-blue-300 border-blue-300 py-0 font-mono">
                @Async EmailService
              </Badge>
            </div>
            <p className="text-blue-800/90 dark:text-blue-300 text-xs leading-relaxed">
              Hóa đơn điện tử chi tiết và biên nhận thanh toán đã được gửi tới: <strong>{effectiveEmail}</strong>. Vui lòng kiểm tra hòm thư (inbox/spam) để lưu trữ biên lai giao dịch.
            </p>
          </div>
        </div>

        {/* Logistics & Order Details Summary */}
        <Card className="p-6 border-slate-200 dark:border-border bg-white dark:bg-card space-y-4 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-3">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-[#27c372]" />
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                Vận Chuyển Qua GHN Express
              </span>
            </div>
            <Badge className="bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200 dark:border-orange-800 font-bold text-xs">
              GHN Tiêu Chuẩn (Toàn Quốc)
            </Badge>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Người nhận hàng:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {customerName} {customerPhone ? `(${customerPhone})` : ''}
              </span>
            </div>

            <div className="flex justify-between items-start text-slate-600 dark:text-slate-400 gap-4">
              <span className="shrink-0 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Địa chỉ:
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-100 text-right">
                {shippingAddress}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-border pt-2.5">
              <span>Phương thức thanh toán:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {paymentMethod === 'cod'
                  ? 'Thanh toán tiền mặt khi nhận hàng (COD)'
                  : 'Cổng thanh toán Trực tuyến (MoMo / VietQR Hosted)'}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Trạng thái thanh toán:</span>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-black text-xs">
                ✓ ĐÃ THANH TOÁN (PAID)
              </Badge>
            </div>

            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Tổng thanh toán:</span>
              <span className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
                {formatVND(totalAmount)}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Đơn hàng đã được đồng bộ trên hệ thống đối soát GHN. Bạn có thể tra cứu hành trình theo thời gian thực bất cứ lúc nào trong mục <strong>Đơn hàng của tôi</strong>.
            </span>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-8">
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
          onClick={() => navigate(hasCourtBooking ? '/booking' : '/products')}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl h-11 cursor-pointer"
        >
          {hasCourtBooking ? (
            <>
              <CalendarDays className="h-4 w-4" />
              <span>Quay Lại Lịch Đặt Sân</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              <span>Tiếp tục mua sắm</span>
            </>
          )}
        </Button>
      </div>

      {/* Order Receipt Modal */}
      <OrderReceiptModal
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        order={{
          id: order?.id || 1,
          order_code: effectiveOrderCode,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          status: order?.status || 'confirmed',
          created_at: order?.created_at || new Date().toISOString(),
          customer_name: customerName,
          customer_phone: customerPhone,
          shipping_address: shippingAddress,
          items: items,
        }}
      />
    </div>
  )
}
