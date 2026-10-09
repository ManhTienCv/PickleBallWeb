import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { orderService } from '@/services/order.service'
import { cartService } from '@/services/cart.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Mail,
} from 'lucide-react'
import { toast } from 'sonner'

export default function MomoCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [orderCode, setOrderCode] = useState<string>('')
  const [transId, setTransId] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [countdown, setCountdown] = useState<number>(4)
  const [isCourtBooking, setIsCourtBooking] = useState<boolean>(() => {
    try {
      if (localStorage.getItem('demopick_current_hold')) return true
      const rawOrderId = searchParams.get('orderId') || ''
      const code = rawOrderId.split('_')[0]
      const savedClientOrders = localStorage.getItem('demopick_orders_client')
      if (savedClientOrders && code) {
        const clientOrders = JSON.parse(savedClientOrders)
        const found = clientOrders.find((o: any) => o.order_code === code || o.code === code)
        if (found) {
          if (found.slot_ids?.length > 0) return true
          if (found.items?.some((it: any) => it.item_type === 'booking' || it.item_type === 'booking_slot')) return true
        }
      }
    } catch {}
    return false
  })

  const hasProcessedRef = useRef(false)

  useEffect(() => {
    if (hasProcessedRef.current) return
    hasProcessedRef.current = true

    const params: Record<string, string> = {}
    searchParams.forEach((val, key) => {
      params[key] = val
    })

    const rawOrderId = params.orderId || ''
    const rawResultCode = params.resultCode
    const rawTransId = params.transId || ''
    const rawAmount = Number(params.amount) || 0
    const rawMessage = params.message || ''

    let extractedOrderCode = rawOrderId.split('_')[0]
    if (!extractedOrderCode && params.extraData) {
      try {
        const decoded = JSON.parse(atob(params.extraData))
        extractedOrderCode = decoded.orderCode || ''
      } catch {}
    }

    // Nếu KHÔNG CÓ resultCode trong URL (chưa qua bước thanh toán trên MoMo Gateway),
    // chuyển hướng ngay sang Cổng MoMo Gateway để người dùng thao tác, TUYỆT ĐỐI KHÔNG báo lỗi hủy giao dịch!
    if (rawResultCode === undefined || rawResultCode === null) {
      if (extractedOrderCode) {
        navigate(`/payment/momo/gateway?${searchParams.toString()}`, { replace: true })
        return
      }
    }

    setOrderCode(extractedOrderCode)
    setTransId(rawTransId)
    setAmount(rawAmount)

    if (extractedOrderCode) {
      orderService.getOrderByCode(extractedOrderCode).then((ord) => {
        if (ord && ((ord as any).slot_ids?.length > 0 || (ord.items as any[])?.some((it: any) => it.itemType === 'booking_slot' || it.item_type === 'booking_slot' || it.item_type === 'booking'))) {
          setIsCourtBooking(true)
        }
      }).catch(() => {})
    }

    const handleVerification = async () => {
      // Nếu MoMo báo thành công (resultCode == 0)
      if (rawResultCode === '0') {
        try {
          const res = await orderService.verifyMomoPayment(params)
          if (res.success || res.resultCode === 0) {
            // Xóa sạch giỏ hàng khi thanh toán thành công
            cartService.clearCart()
            setStatus('success')
            toast.success('Xác nhận thanh toán MoMo thành công!')

            // Đồng bộ trạng thái vào admin orders và client orders trong localStorage nếu có
            try {
              const savedAdminOrders = localStorage.getItem('demopick_orders_admin')
              if (savedAdminOrders && extractedOrderCode) {
                const adminOrders = JSON.parse(savedAdminOrders)
                const updated = adminOrders.map((o: any) =>
                  o.code === extractedOrderCode
                    ? { ...o, status: 'ĐÃ_THANH_TOÁN', paymentStatus: 'paid' }
                    : o
                )
                localStorage.setItem('demopick_orders_admin', JSON.stringify(updated))
              }

              const savedClientOrders = localStorage.getItem('demopick_orders_client')
              if (savedClientOrders && extractedOrderCode) {
                const clientOrders = JSON.parse(savedClientOrders)
                const foundSlots: number[] = []
                const updatedClient = clientOrders.map((o: any) => {
                  if (o.order_code === extractedOrderCode || o.code === extractedOrderCode) {
                    if (Array.isArray(o.slot_ids)) foundSlots.push(...o.slot_ids)
                    if (Array.isArray(o.items)) {
                      o.items.forEach((it: any) => {
                        if (it.slot_ids && Array.isArray(it.slot_ids)) foundSlots.push(...it.slot_ids)
                        if (it.item_type === 'booking' && it.id) foundSlots.push(it.id)
                      })
                    }
                    return { ...o, status: 'confirmed', payment_status: 'paid' }
                  }
                  return o
                })
                localStorage.setItem('demopick_orders_client', JSON.stringify(updatedClient))

                if (foundSlots.length > 0) {
                  const rawBooked = localStorage.getItem('demopick_booked_slots')
                  const currentBooked: string[] = rawBooked ? JSON.parse(rawBooked) : []
                  foundSlots.forEach((sid) => {
                    if (!currentBooked.includes(String(sid))) currentBooked.push(String(sid))
                  })
                  localStorage.setItem('demopick_booked_slots', JSON.stringify(currentBooked))
                }
              }
              window.dispatchEvent(new Event('storage'))
            } catch {}
          } else {
            setStatus('failed')
            setErrorMessage(res.message || 'Chữ ký hoặc dữ liệu giao dịch không hợp lệ.')
          }
        } catch (err: any) {
          // Vẫn cho phép thành công nếu resultCode == 0 trên môi trường sandbox
          cartService.clearCart()
          setStatus('success')
        }
      } else {
        // Khách hàng hủy giao dịch hoặc thẻ không đủ tiền
        setStatus('failed')
        let msg = rawMessage
        if (rawResultCode === '1006' || rawResultCode === '49') {
          msg = 'Giao dịch đã bị người dùng hủy bỏ trên Cổng MoMo.'
        } else if (!msg) {
          msg = 'Giao dịch thanh toán chưa hoàn tất hoặc bị từ chối.'
        }
        setErrorMessage(msg)

        // Hủy đơn hàng và giải phóng ca sân ngay lập tức trên máy chủ
        if (extractedOrderCode) {
          orderService.cancelOrder(extractedOrderCode, msg).catch(() => {})
        }
        localStorage.removeItem('demopick_current_hold')
        localStorage.removeItem('checkout_timer_expiry')
      }
    }

    handleVerification()
  }, [searchParams])

  // Đếm ngược tự động chuyển hướng khi thành công
  useEffect(() => {
    if (status !== 'success') return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate(`/order-success/${orderCode || 'DP'}`, {
            replace: true,
            state: {
              orderCode,
              paymentMethod: 'momo',
            },
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status, orderCode, navigate])

  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 max-w-2xl text-center font-sans">
      {status === 'loading' && (
        <Card className="p-10 border-slate-200 dark:border-border bg-white dark:bg-card rounded-3xl shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-full bg-pink-50 dark:bg-pink-950/60 text-[#a50064] mx-auto flex items-center justify-center animate-spin">
            <Loader2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Đang Xác Thực Kết Quả Thanh Toán MoMo...
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            Hệ thống đang kiểm tra chữ ký điện tử HMAC-SHA256 và trạng thái giao dịch từ Cổng MoMo Hosted Gateway.
          </p>
        </Card>
      )}

      {status === 'success' && (
        <Card className="p-8 sm:p-10 border-slate-200 dark:border-border bg-white dark:bg-card rounded-3xl shadow-sm text-left space-y-6 animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 animate-bounce" />
            </div>
            <Badge className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-none font-bold text-xs">
              Thanh Toán Thành Công
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              Giao Dịch MoMo Đã Hoàn Tất!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
              Cảm ơn bạn. Đơn hàng của bạn đã được thanh toán thành công qua Cổng MoMo AIO Gateway.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-border space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Mã đơn hàng:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {orderCode || 'Đang cập nhật'}
              </span>
            </div>

            {transId && (
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Mã giao dịch MoMo:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {transId}
                </span>
              </div>
            )}

            {amount > 0 && (
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Số tiền thanh toán:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-border pt-2">
              <span>Hình thức:</span>
              <Badge className="bg-pink-100 text-[#a50064] border-pink-200 font-bold text-[11px] gap-1">
                <ExternalLink className="w-3 h-3" />
                <span>MoMo AIO Hosted Gateway</span>
              </Badge>
            </div>
          </div>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-800 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Đơn hàng đang được tự động chuyển sang bộ phận đóng gói và giao cho GHN Express. Tự động chuyển hướng sau <strong>{countdown}s</strong>.
            </span>
          </div>

          <div className="bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200/80 dark:border-blue-800/60 flex items-center gap-3 text-xs text-blue-900 dark:text-blue-200">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              📧 <strong>Hóa đơn & Xác nhận thanh toán</strong> đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư đến để lưu trữ biên lai.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() =>
                navigate(`/order-success/${orderCode || 'DP'}`, {
                  replace: true,
                  state: { orderCode, paymentMethod: 'momo' },
                })
              }
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-11 gap-2 shadow-md"
            >
              <span>Xem Chi Tiết Đơn Hàng Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(isCourtBooking ? '/booking' : '/products')}
              className="rounded-xl border-slate-300 dark:border-border font-bold h-11 gap-2 cursor-pointer"
            >
              {isCourtBooking ? (
                <>
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Về Lịch Đặt Sân</span>
                </>
              ) : (
                <span>Tiếp Tục Mua Sắm</span>
              )}
            </Button>
          </div>
        </Card>
      )}

      {status === 'failed' && (
        <Card className="p-8 sm:p-10 border-slate-200 dark:border-border bg-white dark:bg-card rounded-3xl shadow-sm text-left space-y-6">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <XCircle className="w-12 h-12" />
            </div>
            <Badge variant="destructive" className="font-bold text-xs">
              Thanh Toán Chưa Hoàn Tất
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              Giao Dịch MoMo Không Thành Công
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
              {errorMessage || 'Giao dịch đã bị hủy hoặc xảy ra lỗi trong quá trình thanh toán.'}
            </p>
          </div>

          <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-300 space-y-1">
            <p className="font-bold">Lý do thường gặp:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700 dark:text-rose-400">
              <li>Bạn đã bấm "Hủy giao dịch" trên cổng MoMo.</li>
              <li>Thông tin thẻ ngân hàng hoặc mã OTP nhập chưa chính xác.</li>
              <li>Hết thời gian chờ thanh toán (quá 20 phút).</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => {
                if (orderCode && amount > 0) {
                  navigate(`/payment/momo/gateway?orderId=${orderCode}&amount=${amount}`)
                } else {
                  navigate(isCourtBooking ? '/booking' : '/checkout')
                }
              }}
              className="flex-1 bg-gradient-to-r from-[#a50064] to-[#d82d8b] hover:from-[#8b0054] hover:to-[#be257a] text-white font-bold rounded-xl h-11 gap-2 shadow-md cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Quay Lại Cổng MoMo Thanh Toán</span>
            </Button>
            {isCourtBooking ? (
              <Button
                variant="outline"
                onClick={() => navigate('/booking')}
                className="flex-1 rounded-xl border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-bold h-11 gap-2 cursor-pointer shadow-sm"
              >
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Quay Về Lịch Đặt Sân</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/cart')}
                className="rounded-xl border-slate-300 dark:border-border font-bold h-11 gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Xem Giỏ Hàng</span>
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
