import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { cartService } from '@/services/cart.service'
import { orderService } from '@/services/order.service'
import { notificationService } from '@/services/notification.service'
import { useCheckoutTimer } from '@/contexts/CheckoutTimerContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Edit3,
} from 'lucide-react'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const holdId = location.state?.holdId

  const { formattedTime, isActive, isExpired, startTimer, resetTimer } = useCheckoutTimer()

  const [step, setStep] = useState<'info' | 'qr'>('info')
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'momo' | 'cash'>('bank_transfer')
  const [customerName, setCustomerName] = useState('Nguyễn Văn An')
  const [customerPhone, setCustomerPhone] = useState('0987654321')
  const [shippingAddress, setShippingAddress] = useState('Số 10 Đường Pickleball, Q. Cầu Giấy, Hà Nội')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dialog states
  const [showConfirmOrderModal, setShowConfirmOrderModal] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
  })

  // Start timer on mount if not active
  useEffect(() => {
    startTimer()
  }, [startTimer])

  const cartTotal = cart?.total_amount || 0

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Đã chép ${label} vào bộ nhớ tạm!`)
  }

  // Handle proceed to step 2 or submit
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!shippingAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ nhận hàng')
      return
    }
    if (paymentMethod === 'bank_transfer') {
      setStep('qr')
    } else {
      setShowConfirmOrderModal(true)
    }
  }

  // Confirm final checkout submit
  const executeCheckoutSubmit = async () => {
    setIsSubmitting(true)
    try {
      const result = await orderService.checkout({
        payment_method: paymentMethod,
        hold_id: holdId,
        shipping_address: shippingAddress,
        note,
      })

      const orderCode = result.order_code || `HD-${Math.floor(10000 + Math.random() * 90000)}`

      // Trigger email notice simulation
      notificationService.sendOrderPlacedNotice({
        orderCode,
        customerName,
        customerPhone,
        shippingAddress,
        totalAmount: cartTotal,
      })

      toast.success('Đặt hàng thành công!')
      navigate(`/order-success/${orderCode}`, { state: { result, orderCode, shippingAddress, customerName, customerPhone } })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Thanh toán không thành công. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
      setShowConfirmOrderModal(false)
    }
  }

  const handleExitToCart = () => {
    resetTimer()
    navigate('/cart')
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-4xl font-sans">
      {/* 20-Minute Countdown Sticky Bar */}
      <div className="mb-6 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 border border-amber-400/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 animate-pulse text-amber-600" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <span>Thời gian giữ đơn & hoàn tất thanh toán</span>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[11px] font-bold">20 phút</Badge>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Vui lòng hoàn tất thanh toán trước khi thời gian đếm ngược kết thúc. Quá 20 phút đơn sẽ tự hủy.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-amber-300 shadow-inner">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">Thời gian còn lại:</span>
          <span className="font-mono text-xl font-black text-emerald-600 tracking-wider">{formattedTime}</span>
        </div>
      </div>

      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
          <CreditCard className="h-7 w-7 text-[#27c372]" />
          {step === 'info' ? 'Xác Nhận Thông Tin Đơn Hàng' : 'Thanh Toán Quét Mã VietQR'}
        </h1>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExitModal(true)}
          className="rounded-full text-slate-600 border-slate-300 font-bold hover:bg-slate-100 gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay về Giỏ hàng</span>
        </Button>
      </div>

      {step === 'info' ? (
        /* STEP 1: FILL SHIPPING INFO & CHOOSE PAYMENT METHOD */
        <form onSubmit={handleProceedToPayment} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Contact & Delivery Info */}
            <Card className="p-6 border-slate-200 space-y-4 rounded-2xl shadow-sm">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#27c372]" />
                Thông Tin Nhận Hàng & Liên Hệ
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cName" className="font-bold text-xs text-slate-700">Họ và tên người nhận *</Label>
                  <Input
                    id="cName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="rounded-xl font-medium"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cPhone" className="font-bold text-xs text-slate-700">Số điện thoại nhận hàng *</Label>
                  <Input
                    id="cPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" className="font-bold text-xs text-slate-700">Địa chỉ giao hàng chi tiết *</Label>
                <Input
                  id="address"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
                  className="rounded-xl font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note" className="font-bold text-xs text-slate-700">Ghi chú giao hàng (không bắt buộc)</Label>
                <Input
                  id="note"
                  placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao 15 phút..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="rounded-xl font-medium"
                />
              </div>
            </Card>

            {/* Payment Method Selection */}
            <Card className="p-6 border-slate-200 space-y-4 rounded-2xl shadow-sm">
              <h3 className="font-extrabold text-lg text-slate-900">Phương Thức Thanh Toán</h3>

              <RadioGroup
                value={paymentMethod}
                onValueChange={(val: any) => setPaymentMethod(val)}
                className="space-y-3"
              >
                <div className={`flex items-center space-x-3 rounded-2xl border p-4 transition-all cursor-pointer ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-[#27c372] bg-[#27c372]/5 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <RadioGroupItem value="bank_transfer" id="bank" />
                  <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                    <QrCode className="h-6 w-6 text-[#27c372]" />
                    <div>
                      <div className="font-extrabold text-slate-900">Chuyển khoản Ngân hàng qua Mã VietQR (VietinBank)</div>
                      <div className="text-xs text-slate-500 font-medium">Mở App ngân hàng quét mã QR tự động điền chính xác số tiền & nội dung</div>
                    </div>
                  </Label>
                </div>

                <div className={`flex items-center space-x-3 rounded-2xl border p-4 transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'border-[#27c372] bg-[#27c372]/5 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Banknote className="h-6 w-6 text-amber-600" />
                    <div>
                      <div className="font-extrabold text-slate-900">Thanh toán khi nhận hàng (COD) / Tại quầy sân</div>
                      <div className="text-xs text-slate-500 font-medium">Thanh toán tiền mặt cho nhân viên giao hàng hoặc thu ngân</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </Card>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#27c372] hover:bg-[#22c55e] text-white font-black rounded-2xl h-14 text-base gap-2 shadow-lg shadow-[#27c372]/20"
            >
              <span>{paymentMethod === 'bank_transfer' ? 'Tiếp Tục Quét Mã VietQR App' : 'Xác Nhận Đặt Hàng Ngay'}</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Sidebar Order Summary */}
          <div>
            <Card className="p-6 border-slate-200 bg-slate-50/70 space-y-4 rounded-2xl sticky top-24">
              <h3 className="font-extrabold text-lg text-slate-900 pb-3 border-b border-slate-200">Đơn Hàng Tóm Tắt</h3>

              {holdId && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1 font-semibold">
                  <span className="font-black text-amber-900">✓ Đang giữ lịch Thuê Sân</span>
                  <p>Mã đặt lịch: #{holdId}</p>
                </div>
              )}

              {cart && cart.items.length > 0 && (
                <div className="space-y-2 text-xs">
                  <div className="font-extrabold text-slate-800">Sản phẩm trong giỏ ({cart.items.length}):</div>
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-slate-600 font-medium">
                      <span className="truncate pr-2">{item.product?.name} x{item.quantity}</span>
                      <span className="font-bold text-slate-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-black text-slate-900">Tổng thanh toán:</span>
                <span className="text-xl font-black text-[#27c372]">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}
                </span>
              </div>
            </Card>
          </div>
        </form>
      ) : (
        /* STEP 2: VIETQR APP PAYMENT SCREEN */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6 sm:p-8 border-slate-200 rounded-3xl shadow-md text-center space-y-6 bg-white">
              <Badge className="bg-[#27c372]/15 text-[#16a34a] border-[#27c372]/30 px-3.5 py-1 font-extrabold text-xs rounded-full">
                📲 Chuyển Khoản Nhanh Qua App Ngân Hàng
              </Badge>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Quét Mã QR Chuyển Khoản Tự Động
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto">
                Mở ứng dụng Ngân hàng (MBBank, Vietcombank, Techcombank, VPBank,...) để quét mã bên dưới. Số tiền và nội dung chuyển khoản đã được mã hóa chính xác.
              </p>

              {/* VietQR Code Image Box */}
              <div className="relative inline-block bg-slate-50 p-6 rounded-3xl border-2 border-slate-200/90 shadow-inner group">
                <img
                  src={`https://img.vietqr.io/image/ICB-102888888888-compact2.png?amount=${cartTotal}&addInfo=HD${Math.floor(10000 + Math.random() * 90000)}&accountName=NGUYEN%20MANH%20TIEN`}
                  alt="Mã QR Thanh Toán VietQR"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto rounded-xl"
                  onError={(e: any) => {
                    // Fallback to stylized SVG QR mockup if network blocked
                    e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=NGUYEN_MANH_TIEN_VIETINBANK'
                  }}
                />
                <div className="mt-3 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 py-1 px-3 rounded-full inline-flex items-center gap-1.5 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#27c372]" /> Tự động xác thực giao dịch VietinBank
                </div>
              </div>

              {/* Transfer Details Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-3 text-xs sm:text-sm font-semibold">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Ngân hàng thụ hưởng:</span>
                  <span className="font-extrabold text-slate-900">VietinBank (Ngân hàng TMCP Công Thương Việt Nam)</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-[#27c372] font-mono">102888888888</span>
                    <button
                      onClick={() => copyToClipboard('102888888888', 'Số tài khoản')}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <span className="font-extrabold text-slate-900">NGUYEN MANH TIEN</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số tiền thanh toán:</span>
                  <span className="font-black text-[#27c372] text-base">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('info')}
                  className="rounded-2xl font-extrabold border-slate-300 gap-1.5 flex-1"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Sửa Thông Tin / Đổi PTTT</span>
                </Button>

                <Button
                  onClick={() => setShowConfirmOrderModal(true)}
                  className="bg-[#27c372] hover:bg-[#22c55e] text-white font-black rounded-2xl gap-1.5 flex-1 shadow-lg shadow-[#27c372]/20"
                >
                  <span>Xác Nhận Đã Quét Mã & Thanh Toán</span>
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 border-slate-200 bg-slate-50/70 space-y-4 rounded-3xl">
              <h3 className="font-extrabold text-base text-slate-900 pb-2 border-b border-slate-200">
                Thông Tin Giao Hàng Đã Điền
              </h3>

              <div className="space-y-2 text-xs font-semibold text-slate-700">
                <div>
                  <span className="text-slate-400 font-medium">Người nhận: </span>
                  <span className="font-bold text-slate-900">{customerName} ({customerPhone})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Địa chỉ: </span>
                  <span>{shippingAddress}</span>
                </div>
                {note && (
                  <div>
                    <span className="text-slate-400 font-medium">Ghi chú: </span>
                    <span className="italic">{note}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-1 font-semibold">
                <div className="font-black flex items-center gap-1.5 text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-[#27c372]" /> Quyền lợi chỉnh sửa thông tin đơn hàng
                </div>
                <p className="text-[11px] leading-relaxed">
                  Sau khi hoàn tất đặt hàng, đơn sẽ ở trạng thái <strong>CHỜ DUYỆT</strong>. Bạn có thể tự do chỉnh sửa địa chỉ nhận hàng tại mục "Đơn Hàng Của Tôi" trước khi đơn được giao cho đơn vị vận chuyển.
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* MODAL 1: CONFIRM ORDER SUBMISSION ("Thực hiện điều này... Bạn chắc chắn chứ?") */}
      <Dialog open={showConfirmOrderModal} onOpenChange={setShowConfirmOrderModal}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 font-sans">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-[#27c372]" />
              Xác Nhận Thực Hiện Đặt Hàng?
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-xs leading-relaxed font-medium">
              Thực hiện điều này... Bạn có chắc chắn thông tin nhận hàng <strong>"{shippingAddress}"</strong> và hình thức thanh toán đã hoàn toàn chính xác chứ?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-row gap-3 justify-end pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setShowConfirmOrderModal(false)}
              className="rounded-xl font-extrabold border-slate-300"
            >
              Hủy / Xem lại
            </Button>
            <Button
              onClick={executeCheckoutSubmit}
              disabled={isSubmitting}
              className="bg-[#27c372] hover:bg-[#22c55e] text-white font-black rounded-xl gap-2 shadow-md"
            >
              {isSubmitting ? 'Đang tạo đơn...' : 'Đồng Ý Đặt Hàng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: CONFIRM EXIT TO CART ("Rời khỏi thanh toán?") */}
      <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 font-sans">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Xác Nhận Quay Về Giỏ Hàng?
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-xs leading-relaxed font-medium">
              Thực hiện điều này... Nếu bạn rời khỏi trang thanh toán về Giỏ hàng, bộ đếm ngược 20 phút sẽ bị <strong>hủy và tính lại từ đầu</strong> ở lượt thanh toán sau. Bạn có chắc chắn muốn rời đi?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-row gap-3 justify-end pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setShowExitModal(false)}
              className="rounded-xl font-extrabold border-slate-300"
            >
              Ở lại tiếp tục
            </Button>

            <Button
              onClick={handleExitToCart}
              variant="destructive"
              className="rounded-xl font-black gap-1.5"
            >
              Quay về Giỏ hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: 20-MINUTE TIMER EXPIRED ALERT */}
      <Dialog open={isExpired}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 text-center space-y-4 font-sans" onPointerDownOutside={(e) => e.preventDefault()}>
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-black text-slate-900">
              Hết Hạn Thời Gian Thanh Toán!
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-xs leading-relaxed font-semibold">
              Thời gian thanh toán 20 phút cho lượt đặt hàng này đã kết thúc. Vui lòng thực hiện lại quá trình đặt hàng và thanh toán.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              onClick={handleExitToCart}
              className="w-full bg-[#27c372] hover:bg-[#22c55e] text-white font-black rounded-xl h-12 shadow-md"
            >
              Thực Hiện Lại Đặt Hàng (Về Giỏ Hàng)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
