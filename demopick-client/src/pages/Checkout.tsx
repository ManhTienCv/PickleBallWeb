import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { cartService } from '@/services/cart.service'
import { orderService } from '@/services/order.service'
import { notificationService } from '@/services/notification.service'
import { shippingService, GHNProvince, GHNDistrict, GHNWard } from '@/services/shipping.service'
import { addressService, UserAddress } from '@/services/address.service'
import MapLocationPicker, { SelectedLocationResult } from '@/components/MapLocationPicker'
import { useCheckoutTimer } from '@/contexts/CheckoutTimerContext'
import { authHelpers } from '@/stores/useAuthStore'
import { useAuthModalStore } from '@/stores/useAuthModalStore'
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
  Banknote,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Clock,
  AlertTriangle,
  Truck,
  MapPin,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const holdId = location.state?.holdId

  const { formattedTime, startTimer, resetTimer } = useCheckoutTimer()

  useEffect(() => {
    if (!authHelpers.isAuthenticated()) {
      navigate('/cart', { replace: true })
      useAuthModalStore.getState().openLogin()
      toast.info('Vui lòng đăng nhập để tiến hành thanh toán đơn hàng.')
    }
  }, [navigate])

  const currentUser = authHelpers.getUser()
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'cod'>('momo')
  
  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`Đã sao chép ${fieldName}!`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const [customerName, setCustomerName] = useState(currentUser?.name || 'Nguyễn Văn An')
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '0987654321')

  // GHN 3-tier Administrative Data
  const [provinces, setProvinces] = useState<GHNProvince[]>([])
  const [districts, setDistricts] = useState<GHNDistrict[]>([])
  const [wards, setWards] = useState<GHNWard[]>([])
  const [selectedProvinceId, setSelectedProvinceId] = useState<number>(201)
  const [selectedProvinceName, setSelectedProvinceName] = useState('Hà Nội')
  const [selectedDistrictId, setSelectedDistrictId] = useState<number>(1485)
  const [selectedDistrictName, setSelectedDistrictName] = useState('Quận Cầu Giấy')
  const [selectedWardCode, setSelectedWardCode] = useState('1A0307')
  const [selectedWardName, setSelectedWardName] = useState('Phường Dịch Vọng')

  const [streetAddress, setStreetAddress] = useState('Số 10 Đường Pickleball')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Realtime GHN calculated fee
  const [ghnShippingFee, setGhnShippingFee] = useState(28000)
  const [expectedDeliveryTime, setExpectedDeliveryTime] = useState('1 - 2 ngày')

  // Map Picker in Checkout Modal
  const [showMapPickerModal, setShowMapPickerModal] = useState(false)

  // Dialog states
  const [showConfirmOrderModal, setShowConfirmOrderModal] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
  })

  // 1. Initial load: Start countdown timer & fetch provinces
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
    }
    shippingService.getGHNProvinces().then((provs) => {
      setProvinces(provs)
      if (provs && provs.length > 0) {
        const hanoi = provs.find((p) => p.ProvinceName.includes('Hà Nội')) || provs[0]
        setSelectedProvinceId(hanoi.ProvinceID)
        setSelectedProvinceName(hanoi.ProvinceName)
      }
    })
  }, [startTimer])

  // 2. Load Districts when Province changes
  useEffect(() => {
    if (!selectedProvinceId) return
    shippingService.getGHNDistricts(selectedProvinceId).then((dists) => {
      setDistricts(dists || [])
      if (dists && dists.length > 0) {
        setSelectedDistrictId(dists[0].DistrictID)
        setSelectedDistrictName(dists[0].DistrictName)
      } else {
        setSelectedDistrictId(0)
        setSelectedDistrictName('')
        setWards([])
        setSelectedWardCode('')
        setSelectedWardName('')
      }
    })
  }, [selectedProvinceId])

  // 3. Load Wards when District changes
  useEffect(() => {
    if (!selectedDistrictId) return
    shippingService.getGHNWards(selectedDistrictId).then((wds) => {
      setWards(wds || [])
      if (wds && wds.length > 0) {
        setSelectedWardCode(wds[0].WardCode)
        setSelectedWardName(wds[0].WardName)
      } else {
        setSelectedWardCode('')
        setSelectedWardName('')
      }
    })
  }, [selectedDistrictId])

  // 4. Calculate GHN Shipping Fee when District & Ward change
  useEffect(() => {
    if (!selectedDistrictId || !selectedWardCode) return
    shippingService
      .calculateGHNFee({
        toDistrictId: selectedDistrictId,
        toWardCode: selectedWardCode,
        weightGram: 700,
        insuranceValue: cart?.total_amount || 0,
      })
      .then((res) => {
        setGhnShippingFee(res.shippingFee)
        setExpectedDeliveryTime(res.expectedDeliveryTime)
      })
  }, [selectedDistrictId, selectedWardCode, cart?.total_amount])

  const cartTotal = cart?.total_amount || 0
  const isFreeship = cartTotal >= 1000000
  const effectiveShippingFee = isFreeship ? 0 : ghnShippingFee
  const grandTotal = cartTotal + effectiveShippingFee

  const fullShippingAddress = `${streetAddress}, ${selectedWardName ? `${selectedWardName}, ` : ''}${selectedDistrictName ? `${selectedDistrictName}, ` : ''}${selectedProvinceName}`

  const handleSelectSavedAddress = (addr: UserAddress) => {
    setSelectedAddressId(addr.id)
    setCustomerName(addr.recipientName)
    setCustomerPhone(addr.phone)
    setStreetAddress(addr.streetAddress)
    toast.info(`Đã chọn địa chỉ: ${addr.label === 'home' ? 'Nhà riêng' : addr.label === 'office' ? 'Văn phòng' : 'Sân bóng'}`)
  }

  const handleMapLocationConfirmed = (res: SelectedLocationResult) => {
    setStreetAddress(`${res.street}${res.district ? `, ${res.district}` : ''}`)
    setSelectedAddressId(null)
    setShowMapPickerModal(false)
    toast.success('Đã cập nhật vị trí giao hàng từ Bản đồ!')
  }

  // Handle proceed to payment or confirm COD
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName.trim() || !customerPhone.trim() || !streetAddress.trim()) {
      toast.error('Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng')
      return
    }
    if (paymentMethod === 'cod') {
      setShowConfirmOrderModal(true)
    } else {
      executeCheckoutSubmit()
    }
  }

  // Final Order Creation → Server-Side Price Protection → Hosted Gateway Redirect
  const executeCheckoutSubmit = async () => {
    setIsSubmitting(true)
    try {
      const orderItems =
        cart?.items?.map((it) => ({
          id: it.id,
          product_id: it.product?.id || it.id,
          name: it.product?.name || 'Sản phẩm Pickleball',
          quantity: it.quantity,
          price: it.unit_price || it.product?.price || (it.quantity > 0 ? Math.round(it.subtotal / it.quantity) : it.subtotal),
        })) || [{ id: 1, name: 'Thiết bị Pickleball DemoPick', quantity: 1, price: cartTotal || 550000 }]

      // 1. Gửi request tạo đơn hàng lên Fullstack Server
      const result = await orderService.createOrder({
        shippingName: customerName,
        shippingPhone: customerPhone,
        shippingAddress: fullShippingAddress,
        ghnProvinceId: selectedProvinceId,
        ghnDistrictId: selectedDistrictId,
        ghnWardCode: selectedWardCode,
        paymentMethod,
        items: orderItems,
      })

      const orderCode = result.orderCode || `HD-${Math.floor(10000 + Math.random() * 90000)}`

      // 2. Đồng bộ vận đơn nội bộ sang Shipping Service
      shippingService.createShippingOrder({
        orderCode,
        carrier: 'GHN',
        receiverName: customerName,
        receiverAddress: fullShippingAddress,
        receiverPhone: customerPhone,
        itemsSummary: orderItems.map((i) => `${i.quantity}x ${i.name}`).join(', '),
        shippingFee: effectiveShippingFee,
        codAmount: paymentMethod === 'cod' ? grandTotal : 0,
        paymentMethod: paymentMethod === 'cod' ? 'COD' : 'Cổng MoMo / VietQR Hosted',
      })

      // 3. Đồng bộ sang Admin Panel
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
          type: 'Đặt Sân & Thiết Bị',
          totalAmount: grandTotal,
          paymentMethod: paymentMethod === 'cod' ? 'COD' : 'Cổng Online',
          status: paymentMethod === 'cod' ? 'PENDING' : 'CHỜ_THANH_TOÁN',
          createdAt: `${dateStr} ${timeStr}`,
          dateStr,
          shippingAddress: fullShippingAddress,
          shippingCarrier: 'GHN Express',
          shippingFee: effectiveShippingFee,
          ghn_district_id: selectedDistrictId,
          ghn_ward_code: selectedWardCode,
          items: orderItems.map((item, idx) => ({
            id: idx + 1,
            name: item.name,
            qty: item.quantity,
            price: item.price,
          })),
        }

        localStorage.setItem('demopick_orders_admin', JSON.stringify([newAdminOrder, ...adminOrders]))
        window.dispatchEvent(new Event('storage'))
      } catch (err) {
        console.error('Failed to sync to admin orders:', err)
      }

      // Thông báo qua Notification Service
      notificationService.sendOrderPlacedNotice({
        orderCode,
        customerName,
        customerPhone,
        shippingAddress: fullShippingAddress,
        totalAmount: grandTotal,
      })

      // 4. ĐIỀU HƯỚNG BẢO MẬT: Hosted Payment Gateway
      if (paymentMethod === 'momo' && result.payUrl) {
        toast.success('Đang chuyển hướng sang Cổng thanh toán chính thức...')
        setTimeout(() => {
          window.location.href = result.payUrl!
        }, 1200)
        return
      }

      // Đơn hàng COD hoàn tất
      toast.success('Đặt hàng thành công!')
      navigate(`/order-success/${orderCode}`, {
        state: { result, orderCode, shippingAddress: fullShippingAddress, customerName, customerPhone, paymentMethod },
      })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
      setShowConfirmOrderModal(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-6xl xl:max-w-7xl font-sans">
      {/* Sticky Countdown Header */}
      <div className="bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 animate-pulse text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Thời gian giữ đơn & hoàn tất thanh toán</span>
              <Badge className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700 text-[11px] font-bold">20 phút</Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Vui lòng hoàn tất thanh toán trước khi thời gian đếm ngược kết thúc.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-card px-4 py-2 rounded-xl border border-amber-300 dark:border-amber-700 shadow-inner shrink-0 self-start sm:self-auto">
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Thời gian còn lại:</span>
          <span className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-wider">{formattedTime}</span>
        </div>
      </div>

      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-border">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <CreditCard className="h-7 w-7 text-[#27c372]" />
          <span>Xác Nhận Đơn Hàng & Vận Chuyển GHN Express</span>
        </h1>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExitModal(true)}
          className="rounded-full text-slate-600 dark:text-slate-300 border-slate-300 dark:border-border font-bold hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay về Giỏ hàng</span>
        </Button>
      </div>

      {/* Main Checkout Form */}
      <form onSubmit={handleProceedToPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Customer Contact & Delivery Info */}
            <Card className="p-6 border-slate-200 dark:border-border bg-white dark:bg-card space-y-5 rounded-3xl shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                      Thông Tin Nhận Hàng
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                      Điền thông tin để nhân viên giao hàng liên hệ nhanh chóng
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowMapPickerModal(true)}
                  className="h-8.5 px-3 rounded-xl border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-bold text-xs gap-1.5 shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ghim Vị Trí Bản Đồ</span>
                </Button>
              </div>

              {/* SAVED ADDRESS SELECTOR CHIPS */}
              {savedAddresses.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap bg-[#FAF8F5] dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-border">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    Sổ địa chỉ:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shadow-xs'
                              : 'border-slate-200 dark:border-border bg-white dark:bg-card text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>{addr.label === 'home' ? 'Nhà riêng' : addr.label === 'office' ? 'Văn phòng' : 'Sân bóng'}</span>
                          {addr.isDefault && (
                            <span className="text-[9px] bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-1.5 py-0.2 rounded font-normal">
                              Mặc định
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Row 1: Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cName" className="font-bold text-xs text-slate-700 dark:text-slate-300">
                    Họ và tên người nhận <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="cName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="rounded-xl font-medium h-11"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cPhone" className="font-bold text-xs text-slate-700 dark:text-slate-300">
                    Số điện thoại nhận hàng <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="cPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="rounded-xl font-medium h-11"
                    required
                  />
                </div>
              </div>

              {/* Row 2: GHN 3-Tier Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-bold text-xs text-slate-700 dark:text-slate-300">
                    1. Tỉnh / Thành phố <span className="text-rose-500">*</span>
                  </Label>
                  <select
                    value={selectedProvinceId || ''}
                    onChange={(e) => {
                      const pId = Number(e.target.value)
                      setSelectedProvinceId(pId)
                      const pObj = provinces.find((p) => p.ProvinceID === pId)
                      if (pObj) setSelectedProvinceName(pObj.ProvinceName)
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {provinces.map((prov) => (
                      <option key={prov.ProvinceID} value={prov.ProvinceID}>
                        {prov.ProvinceName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-xs text-slate-700 dark:text-slate-300">
                    2. Quận / Huyện <span className="text-rose-500">*</span>
                  </Label>
                  <select
                    value={selectedDistrictId || ''}
                    onChange={(e) => {
                      const dId = Number(e.target.value)
                      setSelectedDistrictId(dId)
                      const dObj = districts.find((d) => d.DistrictID === dId)
                      if (dObj) setSelectedDistrictName(dObj.DistrictName)
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {districts.map((dist) => (
                      <option key={dist.DistrictID} value={dist.DistrictID}>
                        {dist.DistrictName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-xs text-slate-700 dark:text-slate-300">
                    3. Phường / Xã <span className="text-rose-500">*</span>
                  </Label>
                  <select
                    value={selectedWardCode || ''}
                    onChange={(e) => {
                      const wCode = e.target.value
                      setSelectedWardCode(wCode)
                      const wObj = wards.find((w) => w.WardCode === wCode)
                      if (wObj) setSelectedWardName(wObj.WardName)
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {wards.map((ward) => (
                      <option key={ward.WardCode} value={ward.WardCode}>
                        {ward.WardName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Street Address */}
              <div className="space-y-1.5">
                <Label htmlFor="address" className="font-bold text-xs text-slate-700 dark:text-slate-300">
                  Địa chỉ chi tiết (Số nhà, tên ngõ/đường) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="address"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Ví dụ: Số 10 Đường Pickleball, Tòa nhà SportHub..."
                  className="rounded-xl font-medium h-11"
                  required
                />
              </div>

              {/* Row 3: Note */}
              <div className="space-y-1.5">
                <Label htmlFor="note" className="font-bold text-xs text-slate-700 dark:text-slate-300">
                  Ghi chú giao hàng (Không bắt buộc)
                </Label>
                <Input
                  id="note"
                  placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao 15 phút..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="rounded-xl font-medium h-11"
                />
              </div>
            </Card>

            {/* GHN Express Logistics Info Card */}
            <Card className="p-6 border-slate-200 dark:border-border bg-white dark:bg-card space-y-4 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[#27c372]" />
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                    Đối Tác Giao Hàng: GHN Express
                  </h3>
                </div>
                {isFreeship && (
                  <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold text-xs gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Freeship Đơn &gt; 1 Triệu</span>
                  </Badge>
                )}
              </div>

              <div className="p-4 rounded-2xl border-2 border-emerald-600/30 bg-emerald-50/40 dark:bg-emerald-950/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    Dịch vụ GHN TMĐT Tiêu Chuẩn
                  </span>
                  <Badge className="bg-orange-50 text-orange-700 border-orange-200 font-bold text-xs">GHN Express</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Mạng lưới phủ sóng 100% xã phường toàn quốc. Theo dõi hành trình thời gian thực sau khi xuất kho.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    Thời gian dự kiến: <b className="text-slate-900 dark:text-slate-100">{expectedDeliveryTime}</b>
                  </span>
                  <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                    {isFreeship ? 'Miễn phí (0đ)' : `${new Intl.NumberFormat('vi-VN').format(ghnShippingFee)} đ`}
                  </span>
                </div>
              </div>
            </Card>

            {/* Payment Method Selection - HOSTED GATEWAY & COD */}
            <Card className="p-6 border-slate-200 dark:border-border bg-white dark:bg-card space-y-4 rounded-3xl shadow-sm">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-border">
                Phương Thức Thanh Toán Bảo Mật
              </h3>

              <RadioGroup
                value={paymentMethod}
                onValueChange={(val: any) => setPaymentMethod(val)}
                className="space-y-3"
              >
                {/* Option 1: MoMo AIO Hosted Gateway (QR Code & ATM Napas Card) */}
                <div
                  className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                    paymentMethod === 'momo'
                      ? 'border-[#a50064] bg-pink-50/20 dark:bg-pink-950/20 shadow-xs ring-1 ring-[#a50064]/20'
                      : 'border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  onClick={() => setPaymentMethod('momo')}
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="momo" id="momo-method" />
                    <Label htmlFor="momo-method" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950/50 flex items-center justify-center shrink-0 border border-pink-200">
                        <ExternalLink className="h-5 w-5 text-[#a50064] dark:text-pink-400" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                          <span>Cổng MoMo All-In-One (AIO Gateway v2)</span>
                          <Badge className="bg-pink-100 text-[#a50064] dark:bg-pink-900/60 dark:text-pink-200 border-none text-[10px] font-bold">
                            Chuyển hướng Gateway
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Chuyển hướng tới Hosted Payment Page của MoMo. Hỗ trợ quét mã QR MoMo hoặc <b>nhập số thẻ ATM nội địa Napas</b> trực tiếp.
                        </div>
                      </div>
                    </Label>
                  </div>

                  {paymentMethod === 'momo' && (
                    <div className="mt-4 pt-3.5 border-t border-pink-200/70 dark:border-pink-900/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-black text-[#a50064] dark:text-pink-400">
                          <CreditCard className="w-4 h-4" />
                          <span>Thông tin thẻ ATM Sandbox để thử nghiệm thanh toán nhập chay:</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] border-pink-300 text-[#a50064]">
                          Sandbox Test Mode
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white dark:bg-slate-900/80 p-3.5 rounded-xl border border-pink-100 dark:border-pink-950 text-xs">
                        <div className="space-y-1">
                          <span className="text-[11px] text-slate-400 font-semibold block">Ngân hàng thụ hưởng:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">NCB (Ngân Hàng Quốc Dân)</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400 font-semibold">Số thẻ ATM:</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopy('9704198526191432198', 'Số thẻ')
                              }}
                              className="text-[10px] text-pink-600 hover:text-pink-700 flex items-center gap-1 font-bold cursor-pointer"
                            >
                              {copiedField === 'Số thẻ' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedField === 'Số thẻ' ? 'Đã chép' : 'Sao chép'}</span>
                            </button>
                          </div>
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tracking-wider">
                            9704 1985 2619 1432 198
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400 font-semibold">Tên chủ thẻ:</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopy('NGUYEN VAN A', 'Tên chủ thẻ')
                              }}
                              className="text-[10px] text-pink-600 hover:text-pink-700 flex items-center gap-1 font-bold cursor-pointer"
                            >
                              {copiedField === 'Tên chủ thẻ' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedField === 'Tên chủ thẻ' ? 'Đã chép' : 'Sao chép'}</span>
                            </button>
                          </div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">NGUYEN VAN A</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <span className="text-[11px] text-slate-400 font-semibold block">Ngày phát hành:</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">07/15</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[11px] text-slate-400 font-semibold block">Mã OTP:</span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">000000</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic leading-relaxed">
                        💡 <b>Cách nhập</b>: Sau khi bấm nút bên phải, hệ thống sẽ mở Cổng MoMo chính thức. Chọn phương thức <b>Thẻ ATM</b> &rarr; chọn <b>NCB</b> &rarr; điền Số thẻ, Tên chủ thẻ và Ngày phát hành ở trên &rarr; Nhập OTP <b>000000</b> để hoàn tất.
                      </p>
                    </div>
                  )}
                </div>

                {/* Option 2: Cash On Delivery (COD) */}
                <div
                  className={`flex items-center space-x-3 rounded-2xl border p-4 transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-[#27c372] bg-[#27c372]/5 dark:bg-emerald-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <RadioGroupItem value="cod" id="cod-method" />
                  <Label htmlFor="cod-method" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center shrink-0 border border-amber-200">
                      <Banknote className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                        Thanh toán khi nhận hàng (Thu tiền mặt COD)
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Thanh toán tiền mặt cho Shipper GHN Express khi kiện hàng được giao tới.
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </Card>
          </div>

          {/* Sidebar Order Summary (Right Column) */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-28 space-y-4">
            <Card className="p-6 border-slate-200 dark:border-border bg-white dark:bg-card space-y-4 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
                  Tóm Tắt Đơn Hàng
                </h3>
                <Badge variant="outline" className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {cart?.items?.length || 0} sản phẩm
                </Badge>
              </div>

              {holdId && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-200 space-y-1 font-semibold">
                  <span className="font-black text-amber-900 dark:text-amber-100">✓ Đang giữ lịch Thuê Sân</span>
                  <p>Mã đặt lịch: #{holdId}</p>
                </div>
              )}

              {cart && cart.items.length > 0 && (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center gap-3 text-xs font-medium">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={item.product?.name}>
                          {item.product?.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Số lượng: <b className="text-slate-700 dark:text-slate-300">{item.quantity}</b>
                        </p>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Shipping fee breakdown */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-border text-xs">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="whitespace-nowrap">Tiền hàng:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="whitespace-nowrap">Phí ship (GHN Express):</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {isFreeship ? (
                      <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                        Miễn phí (Freeship)
                      </span>
                    ) : (
                      `${new Intl.NumberFormat('vi-VN').format(effectiveShippingFee)} đ`
                    )}
                  </span>
                </div>
              </div>

              {/* Grand Total Row */}
              <div className="pt-3 border-t border-slate-200 dark:border-border space-y-1">
                <div className="flex justify-between items-center gap-3">
                  <span className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    Tổng thanh toán:
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(grandTotal)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 text-right">Đã bao gồm thuế VAT & phí dịch vụ</p>
              </div>

              {/* Action Button inside sticky sidebar */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className={`w-full text-white font-bold rounded-2xl h-12 text-sm sm:text-base gap-2 shadow-lg cursor-pointer transition-all ${
                  paymentMethod === 'momo'
                    ? 'bg-[#a50064] hover:bg-[#8e0056] shadow-pink-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                }`}
              >
                <span>
                  {isSubmitting
                    ? 'Đang tạo phiên Cổng MoMo...'
                    : paymentMethod === 'momo'
                    ? 'Thanh Toán MoMo AIO Gateway'
                    : 'Xác Nhận Đặt Hàng COD'}
                </span>
                <ArrowRight className="h-4.5 w-4.5" />
              </Button>

              <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-border">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Bảo mật SSL</span>
                </div>
                <div>•</div>
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Giao toàn quốc</span>
                </div>
              </div>
            </Card>
          </div>
        </form>

      {/* MAP PICKER MODAL IN CHECKOUT */}
      <Dialog open={showMapPickerModal} onOpenChange={setShowMapPickerModal}>
        <DialogContent className="sm:max-w-4xl max-w-[95vw] w-full sm:rounded-3xl p-6 sm:p-8 bg-white dark:bg-card border border-slate-200 dark:border-border shadow-2xl font-sans max-h-[92vh] overflow-y-auto overflow-x-hidden text-card-foreground">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Ghim Vị Trí Nhận Hàng Trên Bản Đồ</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
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
        <DialogContent className="sm:max-w-md bg-white dark:bg-card rounded-3xl p-6 font-sans border-border text-card-foreground">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100">
              Xác Nhận Đặt Hàng (Thu Tiền COD)
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium">
              Bạn đang chọn hình thức thanh toán khi nhận hàng. Đơn hàng sẽ được chuyển tới bộ phận đóng gói và bàn giao cho Shipper <strong className="text-slate-900 dark:text-slate-100">GHN Express</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-border text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Người nhận:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{customerName} ({customerPhone})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Địa chỉ giao:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{fullShippingAddress}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-border pt-1 mt-1">
              <span className="text-slate-500 dark:text-slate-400">Tổng thanh toán COD:</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(grandTotal)}</span>
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-3 justify-end pt-4 border-t border-slate-100 dark:border-border">
            <Button
              variant="outline"
              onClick={() => setShowConfirmOrderModal(false)}
              className="rounded-xl font-bold border-slate-300 dark:border-border"
            >
              Hủy
            </Button>
            <Button
              onClick={executeCheckoutSubmit}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Hàng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit Modal */}
      <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-card rounded-3xl p-6 font-sans border-border text-card-foreground">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Quay Lại Giỏ Hàng?</span>
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 text-xs font-medium">
              Thời gian giữ đơn 20 phút sẽ bị hủy bỏ nếu bạn rời khỏi trang thanh toán.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-3 justify-end pt-4 border-t border-slate-100 dark:border-border">
            <Button variant="outline" onClick={() => setShowExitModal(false)} className="rounded-xl font-bold border-slate-300 dark:border-border">
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
