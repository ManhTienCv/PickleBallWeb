import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { cartService } from '@/services/cart.service'
import { orderService } from '@/services/order.service'
import { notificationService } from '@/services/notification.service'
import { shippingService, AVAILABLE_CARRIERS, ShippingCarrier } from '@/services/shipping.service'
import { addressService, UserAddress } from '@/services/address.service'
import MapLocationPicker, { SelectedLocationResult } from '@/components/MapLocationPicker'
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
  Truck,
  MapPin,
  Sparkles,
  Home,
  Building,
} from 'lucide-react'
import { toast } from 'sonner'

const PROVINCES = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Bình Dương',
  'Đồng Nai',
  'Quảng Ninh',
  'Khánh Hòa (Nha Trang)',
  'Tỉnh thành khác',
]

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const holdId = location.state?.holdId

  const { formattedTime, startTimer, resetTimer } = useCheckoutTimer()

  const [step, setStep] = useState<'info' | 'qr'>('info')
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cash'>('bank_transfer')
  
  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  const [customerName, setCustomerName] = useState('Nguyễn Văn An')
  const [customerPhone, setCustomerPhone] = useState('0987654321')
  const [selectedProvince, setSelectedProvince] = useState('Hà Nội')
  const [streetAddress, setStreetAddress] = useState('Số 10 Đường Pickleball, Phường Dịch Vọng')
  const [selectedCarrier, setSelectedCarrier] = useState<ShippingCarrier>('GHN')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Map Picker in Checkout Modal
  const [showMapPickerModal, setShowMapPickerModal] = useState(false)

  // Dialog states
  const [showConfirmOrderModal, setShowConfirmOrderModal] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
  })

  // Start timer & load addresses on mount
  useEffect(() => {
    startTimer()
    const addrs = addressService.getSavedAddresses()
    setSavedAddresses(addrs)
    const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0]
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id)
      setCustomerName(defaultAddr.recipientName)
      setCustomerPhone(defaultAddr.phone)
      setStreetAddress(defaultAddr.streetAddress)
      setSelectedProvince(defaultAddr.city)
    }
  }, [startTimer])

  const handleSelectSavedAddress = (addr: UserAddress) => {
    setSelectedAddressId(addr.id)
    setCustomerName(addr.recipientName)
    setCustomerPhone(addr.phone)
    setStreetAddress(addr.streetAddress)
    setSelectedProvince(addr.city)
    toast.info(`Đã chọn địa chỉ: ${addr.label === 'home' ? 'Nhà riêng' : addr.label === 'office' ? 'Văn phòng' : 'Sân bóng'}`)
  }

  const handleMapLocationConfirmed = (res: SelectedLocationResult) => {
    setStreetAddress(`${res.street}${res.district ? `, ${res.district}` : ''}`)
    setSelectedProvince(res.city)
    setSelectedAddressId(null)
    setShowMapPickerModal(false)
    toast.success('Đã cập nhật vị trí giao hàng từ Bản đồ!')
  }

  const cartTotal = cart?.total_amount || 0
  const fullShippingAddress = `${streetAddress}, ${selectedProvince}`

  // Calculate dynamic shipping fee
  const { fee: shippingFee, isFreeship } = shippingService.calculateShippingFee(
    selectedProvince,
    650,
    selectedCarrier,
    cartTotal
  )

  const grandTotal = cartTotal + shippingFee

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Đã chép ${label} vào bộ nhớ tạm!`)
  }

  // Handle proceed to step 2 or submit
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!streetAddress.trim()) {
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
        shipping_address: fullShippingAddress,
        note,
      })

      const orderCode = result.order_code || `HD-${Math.floor(10000 + Math.random() * 90000)}`

      // 1. Create simulated shipping registry entry
      const itemsSummary =
        cart?.items?.map((i) => `${i.quantity}x ${i.product?.name || 'Sản phẩm'}`).join(', ') ||
        'Thiết bị Pickleball'
      shippingService.createShippingOrder({
        orderCode,
        carrier: selectedCarrier,
        receiverName: customerName,
        receiverAddress: fullShippingAddress,
        receiverPhone: customerPhone,
        itemsSummary,
        shippingFee,
        codAmount: paymentMethod === 'cash' ? grandTotal : 0,
        paymentMethod: paymentMethod === 'cash' ? 'COD' : 'VietQR',
      })

      // 2. Sync to Admin Order List
      try {
        const savedAdminOrders = localStorage.getItem('demopick_orders_admin')
        const adminOrders = savedAdminOrders ? JSON.parse(savedAdminOrders) : []
        const now = new Date()
        const dateStr = now.toISOString().split('T')[0]
        const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

        const newAdminOrder = {
          code: orderCode,
          customerName,
          customerPhone,
          staffName: 'Hệ thống Tự Động Online',
          type: 'Đặt Sân Online',
          totalAmount: grandTotal,
          paymentMethod: paymentMethod === 'cash' ? 'COD' : 'VietQR',
          status: 'PENDING',
          createdAt: `${dateStr} ${timeStr}`,
          dateStr,
          shippingAddress: fullShippingAddress,
          shippingCarrier: selectedCarrier,
          shippingFee,
          items:
            cart?.items?.map((item, idx) => ({
              id: idx + 1,
              name: item.product?.name || 'Sản phẩm Pickleball',
              qty: item.quantity,
              price: item.product?.price || item.subtotal,
            })) || [{ id: 1, name: 'Thiết bị Pickleball', qty: 1, price: grandTotal }],
        }

        localStorage.setItem('demopick_orders_admin', JSON.stringify([newAdminOrder, ...adminOrders]))
        window.dispatchEvent(new Event('storage'))
      } catch (err) {
        console.error('Failed to sync to admin orders:', err)
      }

      // Trigger email notice simulation
      notificationService.sendOrderPlacedNotice({
        orderCode,
        customerName,
        customerPhone,
        shippingAddress: fullShippingAddress,
        totalAmount: grandTotal,
      })

      toast.success('Đặt hàng thành công!')
      navigate(`/order-success/${orderCode}`, {
        state: { result, orderCode, shippingAddress: fullShippingAddress, customerName, customerPhone },
      })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Thanh toán không thành công. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
      setShowConfirmOrderModal(false)
    }
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
              Vui lòng hoàn tất thanh toán trước khi thời gian đếm ngược kết thúc.
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
          {step === 'info' ? 'Xác Nhận Đơn Hàng & Vận Chuyển' : 'Thanh Toán Quét Mã VietQR'}
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
            {/* SAVED ADDRESS SELECTOR CHIPS */}
            {savedAddresses.length > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Chọn nhanh từ Sổ Địa Chỉ:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMapPickerModal(true)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ghim Vị Trí Trên Bản Đồ</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{addr.label === 'home' ? 'Nhà riêng' : addr.label === 'office' ? 'Văn phòng' : 'Sân bóng'}</span>
                        {addr.isDefault && <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-normal">Mặc định</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Customer Contact & Delivery Info */}
            <Card className="p-6 border-slate-200 space-y-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#27c372]" />
                  Thông Tin Người Nhận & Địa Chỉ Giao Hàng
                </h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowMapPickerModal(true)}
                  className="h-8 px-3 rounded-xl border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Mở Bản Đồ</span>
                </Button>
              </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-bold text-xs text-slate-700">Tỉnh / Thành phố *</Label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="font-bold text-xs text-slate-700">Địa chỉ cụ thể (Số nhà, tên đường, quận) *</Label>
                  <Input
                    id="address"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Ví dụ: Số 10 Đường Pickleball, Q. Cầu Giấy"
                    className="rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note" className="font-bold text-xs text-slate-700">Ghi chú giao hàng (Không bắt buộc)</Label>
                <Input
                  id="note"
                  placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao 15 phút..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="rounded-xl font-medium"
                />
              </div>
            </Card>

            {/* Carrier Selection */}
            <Card className="p-6 border-slate-200 space-y-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[#27c372]" />
                  Đối Tác Vận Chuyển Giao Hàng
                </h3>
                {isFreeship && (
                  <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold text-xs gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Freeship Đơn &gt; 1 Triệu</span>
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AVAILABLE_CARRIERS.map((c) => {
                  const isSelected = selectedCarrier === c.id
                  const { fee, isFreeship: carrierFreeship } = shippingService.calculateShippingFee(
                    selectedProvince,
                    650,
                    c.id,
                    cartTotal
                  )

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCarrier(c.id)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer space-y-1.5 relative ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs">{c.name}</span>
                        <Badge className={`${c.badgeColor} font-bold text-[10px]`}>{c.shortName}</Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">{c.tagline}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                        <span className="text-slate-500">TG: <b className="text-slate-700">{c.estimatedTime}</b></span>
                        <span className="font-black text-emerald-700">
                          {carrierFreeship ? 'Miễn phí (0đ)' : `${new Intl.NumberFormat('vi-VN').format(fee)} đ`}
                        </span>
                      </div>
                    </div>
                  )
                })}
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
                <div
                  className={`flex items-center space-x-3 rounded-2xl border p-4 transition-all cursor-pointer ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-[#27c372] bg-[#27c372]/5 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <RadioGroupItem value="bank_transfer" id="bank" />
                  <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                    <QrCode className="h-6 w-6 text-[#27c372]" />
                    <div>
                      <div className="font-extrabold text-slate-900">Chuyển khoản Ngân hàng qua Mã VietQR (VietinBank)</div>
                      <div className="text-xs text-slate-500 font-medium">
                        Mở App ngân hàng quét mã QR tự động điền chính xác số tiền & nội dung
                      </div>
                    </div>
                  </Label>
                </div>

                <div
                  className={`flex items-center space-x-3 rounded-2xl border p-4 transition-all cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'border-[#27c372] bg-[#27c372]/5 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Banknote className="h-6 w-6 text-amber-600" />
                    <div>
                      <div className="font-extrabold text-slate-900">Thanh toán khi nhận hàng (Thu COD Shipper)</div>
                      <div className="text-xs text-slate-500 font-medium">
                        Thanh toán tiền mặt cho Shipper {selectedCarrier} khi nhận được kiện hàng
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </Card>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#27c372] hover:bg-[#22c55e] text-white font-black rounded-2xl h-14 text-base gap-2 shadow-lg shadow-[#27c372]/20 cursor-pointer"
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
                      <span className="truncate pr-2">
                        {item.product?.name} x{item.quantity}
                      </span>
                      <span className="font-bold text-slate-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Shipping fee breakdown */}
              <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tiền hàng:</span>
                  <span className="font-semibold text-slate-800">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 items-center">
                  <span>Phí ship ({selectedCarrier}):</span>
                  <span className="font-bold text-emerald-700">
                    {isFreeship ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Miễn phí (Freeship)
                      </span>
                    ) : (
                      `${new Intl.NumberFormat('vi-VN').format(shippingFee)} đ`
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-black text-slate-900">Tổng thanh toán:</span>
                <span className="text-xl font-black text-[#27c372]">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(grandTotal)}
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
                Mở ứng dụng Ngân hàng để quét mã bên dưới. Số tiền và nội dung chuyển khoản đã được mã hóa chính xác.
              </p>

              {/* VietQR Code Image Box */}
              <div className="relative inline-block bg-slate-50 p-6 rounded-3xl border-2 border-slate-200/90 shadow-inner group">
                <img
                  src={`https://img.vietqr.io/image/ICB-102888888888-compact2.png?amount=${grandTotal}&addInfo=HD${Math.floor(10000 + Math.random() * 90000)}&accountName=DEMOPICK%20PICKLEBALL`}
                  alt="Mã QR Thanh Toán VietQR"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto rounded-xl"
                  onError={(e: any) => {
                    e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=DEMOPICK_VIETINBANK'
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
                  <span className="font-extrabold text-slate-900">VietinBank (Công Thương)</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-slate-900 text-sm sm:text-base">102888888888</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('102888888888', 'Số tài khoản')}
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                      title="Sao chép STK"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <span className="font-extrabold text-slate-900">DEMOPICK PICKLEBALL CLUB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số tiền thanh toán:</span>
                  <span className="font-black text-emerald-600 text-base sm:text-lg">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(grandTotal)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={executeCheckoutSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-[#27c372] hover:bg-[#22c55e] text-white font-black rounded-2xl h-12 text-sm gap-2 shadow-lg shadow-[#27c372]/20 cursor-pointer"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{isSubmitting ? 'Đang xác thực thanh toán...' : 'Tôi Đã Chuyển Khoản Xong'}</span>
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 border-slate-200 rounded-3xl bg-slate-50/80 space-y-4 text-xs font-medium">
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wide">Chi tiết vận đơn</h3>
              <div className="space-y-1.5 text-slate-700">
                <div>Người nhận: <strong className="text-slate-900">{customerName}</strong></div>
                <div>Điện thoại: <strong className="text-slate-900">{customerPhone}</strong></div>
                <div>Địa chỉ: <strong className="text-slate-900">{fullShippingAddress}</strong></div>
                <div>Đối tác giao: <strong className="text-emerald-700">{selectedCarrier} Express</strong></div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* MAP PICKER MODAL IN CHECKOUT */}
      <Dialog open={showMapPickerModal} onOpenChange={setShowMapPickerModal}>
        <DialogContent className="sm:max-w-4xl max-w-[95vw] w-full sm:rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-2xl font-sans max-h-[92vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>Ghim Vị Trí Nhận Hàng Trên Bản Đồ</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Chọn toạ độ GPS chính xác để Shipper giao hàng tận cửa
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <MapLocationPicker
              initialAddress={fullShippingAddress}
              onSelectLocation={handleMapLocationConfirmed}
              onCancel={() => setShowMapPickerModal(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm COD Modal */}
      <Dialog open={showConfirmOrderModal} onOpenChange={setShowConfirmOrderModal}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 font-sans">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-black text-slate-900">
              Xác Nhận Đặt Hàng (Thu Tiền COD)
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-xs leading-relaxed font-medium">
              Bạn đang chọn hình thức thanh toán khi nhận hàng. Đơn hàng sẽ được chuyển tới bộ phận đóng gói và bàn giao cho Shipper <strong className="text-slate-900">{selectedCarrier}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-slate-50 rounded-2xl border text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Người nhận:</span>
              <span className="font-bold text-slate-900">{customerName} ({customerPhone})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Địa chỉ giao:</span>
              <span className="font-semibold text-slate-800">{fullShippingAddress}</span>
            </div>
            <div className="flex justify-between border-t pt-1 mt-1">
              <span className="text-slate-500">Tổng thanh toán COD:</span>
              <span className="font-black text-emerald-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(grandTotal)}</span>
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-3 justify-end pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setShowConfirmOrderModal(false)}
              className="rounded-xl font-bold border-slate-300"
            >
              Hủy
            </Button>
            <Button
              onClick={executeCheckoutSubmit}
              disabled={isSubmitting}
              className="bg-[#27c372] hover:bg-[#22c55e] text-white font-black rounded-xl shadow-md"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Hàng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit Modal */}
      <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 font-sans">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Quay Lại Giỏ Hàng?</span>
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-xs font-medium">
              Thời gian giữ đơn 20 phút sẽ bị hủy bỏ nếu bạn rời khỏi trang thanh toán.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-3 justify-end pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowExitModal(false)} className="rounded-xl font-bold">
              Ở Lại Tiếp Tục
            </Button>
            <Button onClick={() => { resetTimer(); navigate('/cart') }} variant="destructive" className="rounded-xl font-bold">
              Rời Khỏi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
