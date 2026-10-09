import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { orderService } from '@/services/order.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ShieldCheck,
  Clock,
  Copy,
  Check,
  ArrowLeft,
  QrCode,
  Smartphone,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  Building2,
  ExternalLink,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'

export default function MomoGatewayPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const rawOrderId = searchParams.get('orderId') || ''
  const orderCode = rawOrderId.split('_')[0]
  const amount = Number(searchParams.get('amount')) || 0

  const [timeLeft, setTimeLeft] = useState(600) // 10 phút
  const [copied, setCopied] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCourtBooking, setIsCourtBooking] = useState<boolean>(() => {
    try {
      if (localStorage.getItem('demopick_current_hold')) return true
      const savedClientOrders = localStorage.getItem('demopick_orders_client')
      if (savedClientOrders && orderCode) {
        const clientOrders = JSON.parse(savedClientOrders)
        const found = clientOrders.find((o: any) => o.order_code === orderCode || o.code === orderCode)
        if (found) {
          if (found.slot_ids?.length > 0) return true
          if (found.items?.some((it: any) => it.item_type === 'booking' || it.item_type === 'booking_slot')) return true
        }
      }
    } catch {}
    return false
  })

  useEffect(() => {
    if (orderCode) {
      orderService.getOrderByCode(orderCode).then((ord) => {
        if (ord && ((ord as any).slot_ids?.length > 0 || (ord.items as any[])?.some((it: any) => it.itemType === 'booking_slot' || it.item_type === 'booking_slot' || it.item_type === 'booking'))) {
          setIsCourtBooking(true)
        }
      }).catch(() => {})
    }
  }, [orderCode])

  // Đếm ngược 10 phút
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Đã sao chép mã đơn hàng!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Xử lý Giả lập Thanh toán Thành công (Sandbox)
  const handleSimulateSuccess = async () => {
    setIsProcessing(true)
    const transId = 'MOMO_' + Date.now()
    try {
      toast.loading('Đang xử lý giao dịch qua cổng MoMo Sandbox...', { id: 'momo-proc' })
      // Gọi verify payment lên backend Spring Boot
      await orderService.verifyMomoPayment({
        orderId: orderCode,
        resultCode: 0,
        amount: amount,
        transId: transId,
        message: 'Successful.',
      })
      toast.dismiss('momo-proc')
      toast.success('Giao dịch MoMo được duyệt thành công!')

      // Điều hướng về trang kết quả MoMo Callback
      setTimeout(() => {
        navigate(
          `/payment/momo/callback?partnerCode=MOMOBKUN20180529&orderId=${orderCode}&amount=${amount}&resultCode=0&message=Successful&transId=${transId}`,
          { replace: true }
        )
      }, 500)
    } catch (err) {
      toast.dismiss('momo-proc')
      // Fallback redirect
      navigate(
        `/payment/momo/callback?partnerCode=MOMOBKUN20180529&orderId=${orderCode}&amount=${amount}&resultCode=0&message=Successful&transId=${transId}`,
        { replace: true }
      )
    } finally {
      setIsProcessing(false)
    }
  }

  // Xử lý Hủy Giao dịch
  const handleCancelPayment = async () => {
    if (confirm('Bạn có chắc chắn muốn hủy giao dịch thanh toán MoMo này? Ca sân (nếu có) sẽ được giải phóng ngay lập tức.')) {
      setIsProcessing(true)
      try {
        if (orderCode) {
          await orderService.cancelOrder(orderCode, 'Người dùng hủy thanh toán trên cổng MoMo')
        }
      } catch (err) {
        console.warn('Lỗi khi hủy đơn hàng:', err)
      } finally {
        localStorage.removeItem('demopick_current_hold')
        localStorage.removeItem('checkout_timer_expiry')
        navigate(
          `/payment/momo/callback?partnerCode=MOMOBKUN20180529&orderId=${orderCode}&amount=${amount}&resultCode=1006&message=Giao+d%E1%BB%8Bch+%C4%91%C3%A3+b%E1%BB%8B+h%E1%BB%A7y+b%E1%BB%9Fi+ng%C6%B0%E1%BB%9Di+d%C3%B9ng`,
          { replace: true }
        )
      }
    }
  }

  // Dữ liệu mã QR MoMo
  const qrData = `2|99|0987654321|${orderCode}|${amount}|0|0|${amount}|DEMOPICK`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    qrData
  )}`

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Gateway Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#a50064] to-[#d82d8b] text-white flex items-center justify-center font-black text-xl shadow-md">
              MoMo
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg text-slate-900 dark:text-slate-100">
                  CỔNG THANH TOÁN MOMO
                </h1>
                <Badge className="bg-pink-100 dark:bg-pink-950/80 text-[#a50064] dark:text-pink-300 border-pink-200 text-[10px] font-bold">
                  SANDBOX TEST
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thanh toán trực tuyến bảo mật tiêu chuẩn quốc tế PCI DSS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-pink-50 dark:bg-pink-950/40 text-[#a50064] dark:text-pink-300 px-4 py-2 rounded-xl border border-pink-200/80 dark:border-pink-900 text-xs font-bold">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>Đơn hết hạn sau:</span>
            <span className="font-mono text-sm tracking-wider font-extrabold">{formattedTime}</span>
          </div>
        </div>

        {/* Main Gateway Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái: Thông tin đơn hàng (5 cột) */}
          <Card className="lg:col-span-5 p-6 border-slate-200 dark:border-border bg-white dark:bg-card rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="border-b border-slate-100 dark:border-border pb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Đơn vị thụ hưởng
                </span>
                <div className="flex items-center gap-2 mt-1.5 text-slate-800 dark:text-slate-200 font-bold text-sm">
                  <Building2 className="w-4 h-4 text-[#a50064]" />
                  <span>DEMOPICK SPORTS & PICKLEBALL</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Số tiền cần thanh toán
                </span>
                <div className="text-3xl font-black text-[#a50064] dark:text-pink-400 mt-1">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                    amount
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-border space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Mã đơn hàng:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {orderCode || 'Đang cập nhật'}
                    </span>
                    <button
                      onClick={() => copyToClipboard(orderCode)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
                      title="Sao chép mã"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Nội dung chuyển:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                    DEMOPICK {orderCode}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Cổng thanh toán:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    MoMo QR / Ví MoMo
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-pink-50/60 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/50 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-5 h-5 text-[#a50064] shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  Mọi thông tin giao dịch được mã hóa đầu cuối với khóa bảo mật 256-bit. Vui lòng không chia sẻ mã OTP hoặc thông tin bảo mật cho bất kỳ ai.
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => navigate(isCourtBooking ? '/booking' : '/checkout')}
              className="w-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold gap-1.5 h-9"
            >
              {isCourtBooking ? (
                <>
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Quay lại Lịch đặt sân</span>
                </>
              ) : (
                <>
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại trang Đặt hàng</span>
                </>
              )}
            </Button>
          </Card>

          {/* Cột phải: Quét mã QR & Hộp Điều Khiển Giả Lập Sandbox (7 cột) */}
          <Card className="lg:col-span-7 p-6 sm:p-8 border-slate-200 dark:border-border bg-white dark:bg-card rounded-2xl shadow-sm space-y-6">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-[#a50064]" />
                <span>Quét Mã QR Để Thanh Toán</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sử dụng ứng dụng MoMo trên điện thoại hoặc chọn nút giả lập bên dưới để tiếp tục
              </p>
            </div>

            {/* Khung Mã QR */}
            <div className="flex justify-center">
              <div className="relative p-4 bg-white rounded-3xl border-2 border-dashed border-pink-300 shadow-inner inline-block">
                <img
                  src={qrCodeUrl}
                  alt="Mã QR Thanh Toán MoMo"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#a50064] to-[#d82d8b] text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white">
                    MoMo
                  </div>
                </div>
              </div>
            </div>

            {/* Hướng dẫn 3 bước */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600 dark:text-slate-400">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="font-black text-[#a50064] block mb-0.5">Bước 1</span>
                <span>Mở App MoMo</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="font-black text-[#a50064] block mb-0.5">Bước 2</span>
                <span>Chọn "Quét Mã"</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="font-black text-[#a50064] block mb-0.5">Bước 3</span>
                <span>Xác nhận tiền</span>
              </div>
            </div>

            {/* BẢNG ĐIỀU KHIỂN GIẢ LẬP SANDBOX (DEVELOPMENT SIMULATOR) */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-50/80 via-white to-pink-50/40 dark:from-pink-950/40 dark:via-card dark:to-pink-950/20 border-2 border-pink-200 dark:border-pink-900/60 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#a50064] animate-spin" />
                <h3 className="font-black text-sm text-[#a50064] dark:text-pink-300">
                  Bảng Điều Khiển Kiểm Thử MoMo Sandbox
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Trong môi trường thử nghiệm cục bộ, bạn có thể bấm nút dưới đây để mô phỏng hoàn tất thanh toán thành công hoặc hủy giao dịch:
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSimulateSuccess}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-[#a50064] to-[#d82d8b] hover:from-[#8b0054] hover:to-[#be257a] text-white font-black rounded-xl h-12 shadow-lg shadow-pink-500/20 gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  <span>Xác Nhận Đã Thanh Toán (Thành Công)</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCancelPayment}
                  disabled={isProcessing}
                  className="rounded-xl border-rose-300 hover:bg-rose-50 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold h-12 gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Hủy Giao Dịch</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
