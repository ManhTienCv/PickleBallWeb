import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom'
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
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  RefreshCw,
  Wallet,
  Receipt,
  Download,
  Info,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'

export default function VietQrPaymentPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  const rawOrderId = searchParams.get('orderId') || ''
  const orderCode = rawOrderId.split('_')[0]
  const amountParam = Number(searchParams.get('amount')) || 0

  // Chi tiết đơn từ router state hoặc searchParams
  const stateData = (location.state as any) || {}
  const [order, setOrder] = useState<any>(null)
  const [totalAmount, setTotalAmount] = useState<number>(amountParam || stateData.amount || 0)

  // Cấu hình ngân hàng VietQR
  const [bankSetting, setBankSetting] = useState({
    bankId: 'ICB',
    bankName: 'VietinBank (Ngân Hàng Công Thương)',
    accountNo: '102888888888',
    accountName: 'NGUYEN MANH TIEN',
    enabled: true,
  })

  const hasCourtBooking = Boolean(
    stateData?.holdId ||
    stateData?.slotIds?.length ||
    order?.items?.some((it: any) => it.itemType === 'booking_slot' || it.item_type === 'booking_slot' || it.item_type === 'booking' || it.name?.includes('ca sân') || it.name?.includes('Sân')) ||
    order?.slot_ids?.length ||
    localStorage.getItem('demopick_current_hold')
  )

  // Đếm ngược 15 phút bảo lưu đơn hàng & tồn kho
  const [timeLeft, setTimeLeft] = useState(() => {
    try {
      const saved = localStorage.getItem(`vietqr_timer_${orderCode}`)
      if (saved) {
        const remaining = Math.max(0, Math.floor((Number(saved) - Date.now()) / 1000))
        if (remaining > 0) return remaining
      }
    } catch {}
    const expiry = Date.now() + 15 * 60 * 1000
    localStorage.setItem(`vietqr_timer_${orderCode}`, String(expiry))
    return 15 * 60 // 15 phút
  })

  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isLoadingOrder, setIsLoadingOrder] = useState(true)

  // Load cấu hình VietQR và thông tin đơn hàng
  useEffect(() => {
    orderService.getVietQrSetting().then((setting) => {
      if (setting) {
        setBankSetting(setting)
      }
    })

    if (orderCode) {
      orderService
        .getOrderByCode(orderCode)
        .then((ord) => {
          if (ord) {
            setOrder(ord)
            if (ord.total_amount && ord.total_amount > 0) {
              setTotalAmount(ord.total_amount)
            }
          }
        })
        .finally(() => setIsLoadingOrder(false))
    } else {
      setIsLoadingOrder(false)
    }
  }, [orderCode])

  // Timer interval đếm ngược 15 phút
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          localStorage.removeItem(`vietqr_timer_${orderCode}`)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [orderCode, timeLeft])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  // Tạo URL VietQR QuickLink Napas 24/7 theo chuẩn VietQR API
  const vietQrUrl = useMemo(() => {
    const encodedName = encodeURIComponent(bankSetting.accountName)
    const validAmount = totalAmount || 0
    return `https://img.vietqr.io/image/${bankSetting.bankId}-${bankSetting.accountNo}-compact2.png?amount=${validAmount}&addInfo=${orderCode}&accountName=${encodedName}`
  }, [bankSetting, totalAmount, orderCode])

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success(`Đã sao chép ${label}!`)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Khách hàng bấm: "Tôi đã chuyển khoản thành công"
  const handleConfirmPayment = async () => {
    if (!orderCode) {
      toast.error('Không tìm thấy mã đơn hàng!')
      return
    }

    setIsConfirming(true)
    try {
      toast.loading('Đang ghi nhận giao dịch và phát hành vận đơn GHN...', { id: 'vietqr-confirm' })

      // 1. Gọi backend API POST /api/orders/{id}/confirm-payment
      const confirmedOrder = await orderService.confirmPayment(orderCode)

      // 2. Đồng bộ trạng thái đơn hàng phía Client & Admin
      try {
        // Cập nhật client orders
        const savedClient = localStorage.getItem('demopick_orders_client')
        if (savedClient) {
          const clientOrders = JSON.parse(savedClient)
          const foundSlots: number[] = []
          const updated = clientOrders.map((o: any) => {
            if (o.order_code === orderCode || o.code === orderCode) {
              if (Array.isArray(o.slot_ids)) foundSlots.push(...o.slot_ids)
              if (Array.isArray(o.items)) {
                o.items.forEach((it: any) => {
                  if (it.slot_ids && Array.isArray(it.slot_ids)) foundSlots.push(...it.slot_ids)
                  if ((it.item_type === 'booking' || it.item_type === 'booking_slot') && it.id) foundSlots.push(it.id)
                })
              }
              return {
                ...o,
                payment_status: 'completed',
                status: 'shipping',
                tracking_code: confirmedOrder.tracking_code || `GHN-${orderCode.replace(/[^0-9]/g, '')}`,
              }
            }
            return o
          })
          localStorage.setItem('demopick_orders_client', JSON.stringify(updated))

          // Lấy thêm từ confirmedOrder hoặc state nếu có
          if (Array.isArray(confirmedOrder?.items)) {
            confirmedOrder.items.forEach((it: any) => {
              if ((it.itemType === 'booking_slot' || it.item_type === 'booking_slot') && (it.productId || it.product_id)) {
                foundSlots.push(Number(it.productId || it.product_id))
              }
            })
          }
          if (Array.isArray(stateData?.slotIds)) {
            foundSlots.push(...stateData.slotIds)
          }

          if (foundSlots.length > 0) {
            const rawBooked = localStorage.getItem('demopick_booked_slots')
            const currentBooked: string[] = rawBooked ? JSON.parse(rawBooked) : []
            foundSlots.forEach((sid) => {
              if (!currentBooked.includes(String(sid))) currentBooked.push(String(sid))
            })
            localStorage.setItem('demopick_booked_slots', JSON.stringify(currentBooked))
          }
        }

        // Cập nhật admin orders
        const savedAdmin = localStorage.getItem('demopick_orders_admin')
        if (savedAdmin) {
          const adminOrders = JSON.parse(savedAdmin)
          const updatedAdmin = adminOrders.map((o: any) => {
            if (o.code === orderCode || o.order_code === orderCode) {
              return {
                ...o,
                payment_status: 'completed',
                status: 'ĐANG_GIAO_HÀNG',
                paymentMethod: 'VietQR Napas 24/7',
                trackingCode: confirmedOrder.tracking_code || `GHN-${orderCode.replace(/[^0-9]/g, '')}`,
              }
            }
            return o
          })
          localStorage.setItem('demopick_orders_admin', JSON.stringify(updatedAdmin))
        }

        // Ghi nhận vào payment transactions admin
        const savedTxs = localStorage.getItem('demopick_payment_transactions')
        const currentTxs = savedTxs ? JSON.parse(savedTxs) : []
        const newTx = {
          id: 'TX-' + Date.now(),
          orderCode,
          customerName: order?.customer_name || stateData.customerName || 'Khách hàng DemoPick',
          amount: totalAmount,
          bankName: bankSetting.bankName,
          transferContent: orderCode,
          status: 'CONFIRMED_AUTO',
          createdAt: new Date().toLocaleString('vi-VN'),
        }
        localStorage.setItem('demopick_payment_transactions', JSON.stringify([newTx, ...currentTxs]))

        // Thêm vào nhật ký đối soát bank statements
        const savedStatements = localStorage.getItem('demopick_bank_statements')
        const currentStatements = savedStatements ? JSON.parse(savedStatements) : []
        const newStatement = {
          id: 'BS-' + Math.floor(1000 + Math.random() * 9000),
          time: new Date().toLocaleString('vi-VN'),
          bankName: bankSetting.bankName,
          orderCode,
          amount: totalAmount,
          transferContent: orderCode,
          matchStatus: 'MATCHED',
        }
        localStorage.setItem('demopick_bank_statements', JSON.stringify([newStatement, ...currentStatements]))

        window.dispatchEvent(new Event('storage'))
      } catch (err) {
        console.warn('Lỗi khi đồng bộ local storage:', err)
      }

      // Xóa timer session
      localStorage.removeItem(`vietqr_timer_${orderCode}`)

      toast.dismiss('vietqr-confirm')
      toast.success('Xác nhận chuyển khoản thành công! Hóa đơn điện tử và mã vận đơn GHN đã được tạo.')

      // Chuyển sang trang Order Success với chi tiết đơn
      setTimeout(() => {
        navigate(`/order-success/${orderCode}`, {
          state: {
            orderCode,
            amount: totalAmount,
            paymentMethod: 'vietqr',
            paymentStatus: 'completed',
            orderStatus: 'shipping',
            trackingCode: confirmedOrder.tracking_code || `GHN-${orderCode.replace(/[^0-9]/g, '')}`,
            customerName: order?.customer_name || stateData.customerName,
            customerPhone: order?.customer_phone || stateData.customerPhone,
            shippingAddress: order?.shipping_address || stateData.shippingAddress,
          },
          replace: true,
        })
      }, 700)
    } catch (error: any) {
      toast.dismiss('vietqr-confirm')
      toast.error(error.message || 'Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng thử lại.')
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            to={hasCourtBooking ? "/booking" : "/checkout"}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            {hasCourtBooking ? (
              <>
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Quay lại Lịch đặt sân</span>
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại trang Đặt hàng</span>
              </>
            )}
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              Cổng Napas VietQR 24/7 Sẵn Sàng
            </span>
          </div>
        </div>

        {/* 15-Minute Countdown Banner */}
        <div
          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
            timeLeft <= 120
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
              : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                timeLeft <= 120
                  ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300'
                  : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>Thời gian bảo lưu đơn hàng & tồn kho:</span>
                <span
                  className={`font-mono text-sm font-black px-2 py-0.5 rounded-lg ${
                    timeLeft <= 120
                      ? 'bg-rose-600 text-white'
                      : 'bg-emerald-700 text-white dark:bg-emerald-600'
                  }`}
                >
                  {formattedTime}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Vui lòng hoàn tất chuyển khoản trước khi đồng hồ đếm ngược kết thúc để đơn hàng tự động kích hoạt.
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="self-start sm:self-center border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900 text-xs font-mono font-bold"
          >
            Đơn #{orderCode || 'N/A'}
          </Badge>
        </div>

        {/* MAIN PAYMENT GRID: 2 COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI (5 COLS): MÃ QR VIETQR NAPAS CHUYÊN NGHIỆP */}
          <Card className="lg:col-span-5 p-6 bg-white dark:bg-card border-slate-200 dark:border-border rounded-3xl shadow-sm text-center space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  Mã QR Chuẩn VietQR Napas
                </h3>
              </div>
              <Badge className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 text-[10px] font-bold">
                Tự Điền Tiền 100%
              </Badge>
            </div>

            {/* Container Khung QR Code */}
            <div className="relative mx-auto max-w-[280px] p-4 bg-gradient-to-b from-slate-50 to-emerald-50/30 dark:from-slate-900 dark:to-emerald-950/20 rounded-2xl border-2 border-emerald-500/30 shadow-inner">
              <div className="bg-white p-2 rounded-xl shadow-xs">
                <img
                  src={vietQrUrl}
                  alt={`VietQR ${orderCode}`}
                  className="w-full h-auto aspect-square object-contain rounded-lg"
                  loading="eager"
                />
              </div>

              {/* Tag VietQR Napas 24/7 chân ảnh */}
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                <span className="text-emerald-600">●</span>
                <span>Napas 24/7</span>
                <span className="text-slate-300">|</span>
                <span>VietQR Động</span>
              </div>
            </div>

            {/* Hướng dẫn quét */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-left border border-slate-100 dark:border-border text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cách thức thanh toán nhanh:</span>
              </div>
              <ol className="list-decimal list-inside text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pl-1">
                <li>Mở app ngân hàng bất kỳ (VCB, MB, Techcom, TPB...)</li>
                <li>Chọn <strong>Quét mã QR</strong> và lia camera vào mã trên</li>
                <li>Hệ thống tự động điền số tiền và mã đơn hàng chính xác</li>
              </ol>
            </div>
          </Card>

          {/* CỘT PHẢI (7 COLS): BẢNG THÔNG TIN CHI TIẾT KÈM NÚT SAO CHÉP 1 CHẠM */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-6 bg-white dark:bg-card border-slate-200 dark:border-border rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    Thông Tin Chuyển Khoản Thủ Công
                  </h3>
                </div>
                <Badge variant="outline" className="text-xs font-semibold">
                  Sao chép 1 chạm
                </Badge>
              </div>

              {/* Bảng chi tiết 4 trường dữ liệu trọng tâm */}
              <div className="space-y-3 text-xs">
                {/* 1. Ngân hàng thụ hưởng */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-border flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                      Ngân hàng thụ hưởng:
                    </span>
                    <strong className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {bankSetting.bankName}
                    </strong>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(bankSetting.bankName, 'bank', 'Tên ngân hàng')}
                    className="h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 shrink-0"
                  >
                    {copiedKey === 'bank' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* 2. Số tài khoản ngân hàng */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-border flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                      Số tài khoản thụ hưởng:
                    </span>
                    <strong className="text-base font-mono font-black text-emerald-700 dark:text-emerald-400 tracking-wider">
                      {bankSetting.accountNo}
                    </strong>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(bankSetting.accountNo, 'accNo', 'Số tài khoản')}
                    className="h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 shrink-0"
                  >
                    {copiedKey === 'accNo' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* 3. Tên người thụ hưởng */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-border flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                      Tên chủ tài khoản:
                    </span>
                    <strong className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase">
                      {bankSetting.accountName}
                    </strong>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(bankSetting.accountName, 'accName', 'Tên chủ tài khoản')}
                    className="h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 shrink-0"
                  >
                    {copiedKey === 'accName' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* 4. Số tiền cần thanh toán */}
                <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 block">
                      Số tiền thanh toán:
                    </span>
                    <strong className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                      {new Intl.NumberFormat('vi-VN').format(totalAmount)} đ
                    </strong>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(String(totalAmount), 'amount', 'Số tiền')}
                    className="h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 shrink-0 border-emerald-300 text-emerald-800 dark:text-emerald-300"
                  >
                    {copiedKey === 'amount' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* 5. Nội dung chuyển khoản (bắt buộc) */}
                <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                        Nội dung chuyển khoản (Bắt buộc):
                      </span>
                    </div>
                    <strong className="text-base font-mono font-black text-amber-900 dark:text-amber-200 tracking-wider">
                      {orderCode}
                    </strong>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                      * Giữ nguyên mã này để hệ thống tự động nhận diện thanh toán
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(orderCode, 'code', 'Nội dung chuyển khoản')}
                    className="h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 shrink-0 border-amber-300 text-amber-900 dark:text-amber-200"
                  >
                    {copiedKey === 'code' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-700" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* ACTION BUTTON: "Tôi đã chuyển khoản thành công" */}
              <div className="pt-3 space-y-3">
                {timeLeft <= 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>Phiên giao dịch đã hết hạn (15 phút). Tồn kho và ca sân có thể đã được giải phóng.</span>
                    </div>
                    <Link to="/booking" className="underline font-bold shrink-0 hover:text-red-800">Đặt lại</Link>
                  </div>
                )}
                <Button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isConfirming || timeLeft <= 0}
                  className={`w-full h-12 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
                    timeLeft <= 0
                      ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white shadow-md shadow-emerald-600/20'
                  }`}
                >
                  {isConfirming ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang xác nhận với hệ thống...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-100" />
                      <span>Tôi đã chuyển khoản thành công</span>
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Bảo mật giao dịch đa tầng & Phát hành hóa đơn điện tử tự động</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
