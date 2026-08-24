import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orderService } from '@/services/order.service'
import { notificationService } from '@/services/notification.service'
import { shopService } from '@/services/shop.service'
import { cartService } from '@/services/cart.service'
import { shippingService, ShippingOrderInfo } from '@/services/shipping.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Package,
  QrCode,
  ShoppingBag,
  Edit3,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  Star,
  RotateCcw,
  Camera,
  X,
  Check,
  Navigation,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function OrdersPage() {
  const navigate = useNavigate()

  const { data: apiOrders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: orderService.getOrders,
  })

  const [orders, setOrders] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'pending' | 'shipped' | 'completed' | 'booking'>('pending')
  const [editingOrder, setEditingOrder] = useState<any | null>(null)
  const [editAddress, setEditAddress] = useState('')
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editNote, setEditNote] = useState('')

  // Live Tracking Modal on Client
  const [clientTrackingInfo, setClientTrackingInfo] = useState<ShippingOrderInfo | null>(null)

  // Order Review System States
  const [reviewedOrders, setReviewedOrders] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('demopick_reviewed_orders')
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })
  const [reviewingOrder, setReviewingOrder] = useState<any | null>(null)
  const [orderRating, setOrderRating] = useState(5)
  const [orderHoverRating, setOrderHoverRating] = useState(0)
  const [orderComment, setOrderComment] = useState('')
  const [orderImages, setOrderImages] = useState<string[]>([])
  const orderFileInputRef = useRef<HTMLInputElement>(null)

  // Initial orders list containing simulated completed order & separated booking tickets
  const loadOrdersData = () => {
    try {
      const savedAdmin = localStorage.getItem('demopick_orders_admin')
      if (savedAdmin) {
        const adminOrders = JSON.parse(savedAdmin)
        const mappedOrders = adminOrders.map((o: any) => ({
          id: o.code,
          order_code: o.code,
          order_type: o.type === 'Đặt Sân Online' ? 'product' : 'retail',
          created_at: o.createdAt || new Date().toISOString(),
          status: o.status.toLowerCase(),
          payment_method: o.paymentMethod === 'Tiền mặt' || o.paymentMethod === 'COD' ? 'cash' : 'bank_transfer',
          total_amount: o.totalAmount,
          shipping_address: o.shippingAddress || 'Số 10 Đường Pickleball, Q. Cầu Giấy, Hà Nội',
          shipping_carrier: o.shippingCarrier || 'GHN',
          tracking_number: o.trackingNumber,
          customer_name: o.customerName,
          customer_phone: o.customerPhone,
          items: o.items.map((it: any) => ({
            id: it.id,
            item_type: 'product',
            item_name: it.name,
            quantity: it.qty,
            subtotal: it.price * it.qty,
          })),
        }))

        // Append mock booking ticket
        mappedOrders.push({
          id: 'BK-90218',
          order_code: 'BK-90218',
          order_type: 'booking',
          created_at: '2026-08-11T10:15:00Z',
          status: 'completed',
          payment_method: 'bank_transfer',
          total_amount: 360000,
          court_name: 'Sân VIP 1 (Thảm USAPA)',
          court_address: 'Số 188 Nguyễn Văn Cừ, Q. Long Biên, Hà Nội',
          play_time: '08:00 - 10:00 (Ngày 15/08/2026)',
          qr_checkin_code: 'PK-90218-VIP',
          items: [
            { id: 6, item_type: 'booking', item_name: 'Thuê Sân VIP 1 (08:00 - 10:00, 15/08)', quantity: 1, subtotal: 360000 },
          ],
        })

        setOrders(mappedOrders)
        return
      }
    } catch {
      // ignore
    }

    if (apiOrders && apiOrders.length > 0) {
      setOrders(apiOrders)
    } else {
      setOrders([
        {
          id: 991,
          order_code: 'HD-88291',
          order_type: 'product',
          created_at: new Date().toISOString(),
          status: 'pending',
          payment_method: 'bank_transfer',
          total_amount: 5580000,
          shipping_address: 'Số 10 Đường Pickleball, Q. Cầu Giấy, Hà Nội',
          shipping_carrier: 'GHN',
          customer_name: 'Nguyễn Văn An',
          customer_phone: '0987654321',
          items: [
            { id: 1, item_type: 'product', item_name: 'Vợt Pickleball JOOLA Perseus 3S 16mm Carbon', quantity: 1, subtotal: 5490000 },
            { id: 2, item_type: 'product', item_name: 'Bóng Pickleball Franklin X-40 (Hộp 4 quả)', quantity: 1, subtotal: 90000 },
          ],
        },
        {
          id: 992,
          order_code: 'HD-88295',
          order_type: 'product',
          created_at: '2026-08-09T08:15:00Z',
          status: 'shipped',
          payment_method: 'bank_transfer',
          total_amount: 5580000,
          shipping_address: 'Số 25 Phố Lý Thường Kiệt, Q. Hoàn Kiếm, Hà Nội',
          shipping_carrier: 'GHN',
          customer_name: 'Trần Văn Cường',
          customer_phone: '0912345678',
          tracking_number: 'GHN-VN-882910',
          items: [
            { id: 10, item_type: 'product', item_name: 'Vợt JOOLA Perseus 16mm + Hộp 4 Bóng Franklin X-40', quantity: 1, subtotal: 5580000 },
          ],
        },
        {
          id: 993,
          order_code: 'HD-77102',
          order_type: 'product',
          created_at: '2026-08-07T14:30:00Z',
          status: 'completed',
          payment_method: 'cash',
          total_amount: 2850000,
          shipping_address: 'Toà nhà Bitexco, Số 2 Hải Triều, Bến Nghé, Quận 1, TP.HCM',
          shipping_carrier: 'GHTK',
          customer_name: 'Lê Minh Tuấn',
          customer_phone: '0908889999',
          tracking_number: 'GHTK-SGN-44912',
          completed_at: '09/08/2026 lúc 16:30',
          items: [
            { id: 11, item_type: 'product', item_name: 'Vợt Pickleball Franklin Carbon Pro 14mm', quantity: 1, subtotal: 2850000 },
          ],
        },
        {
          id: 994,
          order_code: 'BK-90218',
          order_type: 'booking',
          created_at: '2026-08-11T10:15:00Z',
          status: 'completed',
          payment_method: 'bank_transfer',
          total_amount: 360000,
          court_name: 'Sân VIP 1 (Thảm USAPA)',
          court_address: 'Số 188 Nguyễn Văn Cừ, Q. Long Biên, Hà Nội',
          play_time: '08:00 - 10:00 (Ngày 15/08/2026)',
          qr_checkin_code: 'PK-90218-VIP',
          items: [
            { id: 6, item_type: 'booking', item_name: 'Thuê Sân VIP 1 (08:00 - 10:00, 15/08)', quantity: 1, subtotal: 360000 },
          ],
        },
      ])
    }
  }

  useEffect(() => {
    loadOrdersData()
    const handleStorageChange = () => {
      loadOrdersData()
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiOrders])

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'pending') return order.status === 'pending'
    if (activeTab === 'shipped') return order.status === 'shipped'
    if (activeTab === 'completed') return order.status === 'completed' && order.order_type !== 'booking'
    if (activeTab === 'booking') return order.order_type === 'booking' || order.items?.some((i: any) => i.item_type === 'booking')
    return true
  })

  const openEditModal = (order: any) => {
    setEditingOrder(order)
    setEditAddress(order.shipping_address || 'Số 10 Đường Pickleball, Q. Cầu Giấy, Hà Nội')
    setEditName(order.customer_name || 'Nguyễn Văn An')
    setEditPhone(order.customer_phone || '0987654321')
    setEditNote(order.note || '')
  }

  const handleOpenClientTracking = (order: any) => {
    const key = order.tracking_number || order.order_code
    let info = shippingService.getShippingInfo(key)
    if (!info) {
      const itemsText = order.items?.map((i: any) => `${i.quantity}x ${i.item_name}`).join(', ') || 'Thiết bị Pickleball'
      info = shippingService.createShippingOrder({
        orderCode: order.order_code,
        carrier: order.shipping_carrier || 'GHN',
        receiverName: order.customer_name || 'Nguyễn Văn An',
        receiverAddress: order.shipping_address || 'Số 25 Phố Lý Thường Kiệt, Q. Hoàn Kiếm, Hà Nội',
        receiverPhone: order.customer_phone || '0987654321',
        itemsSummary: itemsText,
      })
      if (order.status === 'completed') {
        info = shippingService.setTrackingStage(info.trackingNumber, 5)
      } else if (order.status === 'shipped') {
        info = shippingService.setTrackingStage(info.trackingNumber, 4)
      }
    }
    setClientTrackingInfo(info)
  }

  const handleSaveAddress = () => {
    if (!editingOrder) return
    if (!editAddress.trim() || !editName.trim() || !editPhone.trim()) {
      toast.error('Vui lòng điền đầy đủ tên, số điện thoại và địa chỉ giao hàng')
      return
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === editingOrder.id
          ? {
              ...o,
              shipping_address: editAddress,
              customer_name: editName,
              customer_phone: editPhone,
              note: editNote,
            }
          : o
      )
    )

    notificationService.sendAddressUpdatedNotice({
      orderCode: editingOrder.order_code,
      customerName: editName,
      customerPhone: editPhone,
      shippingAddress: editAddress,
      totalAmount: editingOrder.total_amount,
    })

    setEditingOrder(null)
  }

  const handleOpenReviewModal = (order: any) => {
    setReviewingOrder(order)
    setOrderRating(5)
    setOrderHoverRating(0)
    setOrderComment('')
    setOrderImages([])
  }

  const handleOrderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (orderImages.length + files.length > 3) {
      toast.error('Bạn chỉ có thể đính kèm tối đa 3 ảnh')
      return
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setOrderImages((prev) => [...prev, event.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })

    if (orderFileInputRef.current) {
      orderFileInputRef.current.value = ''
    }
  }

  const handleRemoveOrderImage = (indexToRemove: number) => {
    setOrderImages(orderImages.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSubmitOrderReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderComment.trim()) {
      toast.error('Vui lòng nhập nhận xét đánh giá sản phẩm')
      return
    }

    if (reviewingOrder) {
      reviewingOrder.items?.forEach((item: any) => {
        if (item.item_type !== 'booking') {
          shopService.addReview(item.id || 1, {
            productId: item.id || 1,
            userName: reviewingOrder.customer_name || 'Nguyễn Văn An',
            rating: orderRating,
            comment: orderComment.trim(),
            variantPurchased: item.item_name,
            isVerifiedPurchase: true,
            images: orderImages.length > 0 ? orderImages : undefined,
          })
        }
      })

      const updatedReviewed = { ...reviewedOrders, [reviewingOrder.order_code]: true }
      setReviewedOrders(updatedReviewed)
      localStorage.setItem('demopick_reviewed_orders', JSON.stringify(updatedReviewed))

      toast.success(`Đã gửi đánh giá kèm hình ảnh cho đơn hàng #${reviewingOrder.order_code}!`)
      setReviewingOrder(null)
    }
  }

  const handleReorder = async (order: any) => {
    try {
      for (const item of order.items || []) {
        if (item.item_type !== 'booking') {
          await cartService.addToCart(item.id || 1, item.quantity || 1)
        }
      }
      toast.success(`Đã thêm lại các sản phẩm trong đơn #${order.order_code} vào giỏ hàng!`)
      navigate('/cart')
    } catch {
      navigate('/products')
    }
  }

  const getStatusBadge = (status: string, isBooking?: boolean, carrier?: string) => {
    if (isBooking) {
      return (
        <Badge className="bg-emerald-600 font-bold text-white gap-1 px-3 py-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Đã Xác Nhận Lịch Sân
        </Badge>
      )
    }

    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-emerald-600 font-bold text-white gap-1 px-3 py-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã Giao Thành Công
          </Badge>
        )
      case 'shipped':
        return (
          <Badge className="bg-blue-600 text-white font-bold gap-1.5 px-3 py-1">
            <Truck className="w-3.5 h-3.5" /> Đang Giao ({carrier || 'GHN'} Express)
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-300 font-bold gap-1 px-3 py-1">
            <Clock className="w-3.5 h-3.5" /> Chờ Duyệt & Đóng Gói
          </Badge>
        )
      case 'cancelled':
        return <Badge variant="destructive" className="font-bold">Đã Hủy</Badge>
      default:
        return <Badge variant="secondary" className="font-medium">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    )
  }

  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const shippedCount = orders.filter((o) => o.status === 'shipped').length
  const completedCount = orders.filter((o) => o.status === 'completed' && o.order_type !== 'booking').length
  const bookingCount = orders.filter((o) => o.order_type === 'booking' || o.items?.some((i: any) => i.item_type === 'booking')).length

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-4xl font-sans">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
        <Package className="h-7 w-7 text-[#27c372]" />
        <span>Lịch Sử Đơn Hàng & Hành Trình Giao Hàng</span>
      </h1>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 bg-white dark:bg-card p-2 rounded-2xl border border-slate-200 dark:border-border shadow-sm">
        {[
          { id: 'pending', label: 'Chờ đóng gói', count: pendingCount },
          { id: 'shipped', label: 'Đang giao hàng', count: shippedCount },
          { id: 'completed', label: 'Đã nhận hàng', count: completedCount },
          { id: 'booking', label: 'Vé đặt sân', count: bookingCount },
        ].map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setActiveTab(tabItem.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors duration-150 cursor-pointer border ${
              activeTab === tabItem.id
                ? 'bg-slate-900 dark:bg-emerald-600 border-slate-900 dark:border-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent'
            }`}
          >
            {tabItem.label} ({tabItem.count})
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="container mx-auto py-16 px-4 text-center max-w-md bg-white dark:bg-card rounded-3xl border border-slate-200 dark:border-border p-8 shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto mb-4">
            <Package className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Không Tìm Thấy Đơn Hàng Nào</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs font-normal">
            {activeTab === 'completed'
              ? 'Chưa có đơn hàng sản phẩm nào hoàn thành giao tận nơi.'
              : activeTab === 'booking'
              ? 'Bạn chưa có vé đặt sân Pickleball nào.'
              : 'Bạn chưa có đơn hàng nào ở mục này.'}
          </p>
          <Button
            onClick={() => navigate(activeTab === 'booking' ? '/booking' : '/products')}
            className="mt-6 gap-2 bg-[#27c372] text-white font-bold rounded-xl text-xs"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{activeTab === 'booking' ? 'Đặt sân Pickleball ngay' : 'Khám phá Cửa hàng ngay'}</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order: any) => {
            const isBooking = order.order_type === 'booking' || order.items?.some((i: any) => i.item_type === 'booking')
            const isPending = order.status === 'pending'
            const isShipped = order.status === 'shipped'
            const isCompleted = order.status === 'completed' && !isBooking

            return (
              <Card key={order.id} className="p-6 border-slate-200 dark:border-border space-y-4 shadow-sm hover:shadow-md transition-all rounded-3xl bg-white dark:bg-card">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-border pb-4">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mã đơn hàng:</span>
                    <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-base">#{order.order_code}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status, isBooking, order.shipping_carrier)}
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50 dark:border-border/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold border-border">
                          {item.item_type === 'booking' ? 'Thuê Sân' : 'Thiết bị'}
                        </Badge>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.item_name}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">x{item.quantity}</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* COURT BOOKING TICKET */}
                {isBooking ? (
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200/90 dark:border-emerald-800 space-y-3 text-xs text-emerald-950 dark:text-emerald-200">
                    <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300 text-sm">
                        <MapPin className="w-4 h-4 text-[#27c372]" /> Thông tin vị trí & Lịch thi đấu tại sân
                      </div>
                      <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                        Xác nhận trực tiếp
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-emerald-700 dark:text-emerald-400">Cụm sân thi đấu: </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{order.court_address || 'Số 188 Nguyễn Văn Cừ, Q. Long Biên, Hà Nội'}</span>
                      </div>
                      <div>
                        <span className="text-emerald-700 dark:text-emerald-400">Khung giờ đặt: </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{order.play_time || '08:00 - 10:00 (15/08/2026)'}</span>
                      </div>
                    </div>

                    {/* QR Check-in Box */}
                    <div className="pt-2 flex items-center justify-between bg-white dark:bg-card p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-inner">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <QrCode className="h-5 w-5 text-[#27c372]" />
                        <div>
                          <div>Mã QR Check-in nhận sân tại quầy:</div>
                          <div className="text-[11px] text-slate-400 font-normal">Đưa mã này cho Lễ tân khi đến sân chơi</div>
                        </div>
                      </div>
                      <code className="font-mono font-black text-base text-[#27c372] bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        {order.qr_checkin_code || 'PK-90218-VIP'}
                      </code>
                    </div>
                  </div>
                ) : (
                  /* PRODUCT ORDER: SHIPPING & RECEIVER DETAILS */
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/80 dark:border-border space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-sm">
                        <Truck className="w-4 h-4 text-[#27c372]" /> Thông tin vận chuyển & Nhận hàng
                      </div>
                      <div className="flex items-center gap-2">
                        {(isShipped || isCompleted) && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenClientTracking(order)}
                            className="h-7 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs gap-1 shadow-sm"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Tra Cứu Hành Trình</span>
                          </Button>
                        )}
                        {isPending && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(order)}
                            className="rounded-xl font-bold text-[#27c372] border-[#27c372]/40 hover:bg-[#27c372]/10 h-7 gap-1 text-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa Địa Chỉ</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Người nhận: </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {order.customer_name || 'Nguyễn Văn An'} ({order.customer_phone || '0987654321'})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Đối tác giao: </span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          {order.shipping_carrier || 'GHN'} Express {order.tracking_number && `(#${order.tracking_number})`}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Địa chỉ nhận hàng: </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{order.shipping_address}</span>
                    </div>

                    {/* Shipping status banner */}
                    {isPending && (
                      <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-[11px] flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Đơn hàng đang chờ xử lý:</strong> Nhân viên kho đang chuẩn bị và đóng gói sản phẩm. Đơn vị vận chuyển sẽ tiếp nhận kiện hàng sớm.
                        </div>
                      </div>
                    )}

                    {isShipped && (
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-900 dark:text-blue-200 text-[11px] flex items-start gap-2">
                        <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Đang vận chuyển:</strong> Đơn hàng #{order.order_code} đã được giao cho Shipper {order.shipping_carrier || 'GHN'}. Bấm nút <strong>"Tra Cứu Hành Trình"</strong> ở trên để theo dõi vị trí kiện hàng.
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 text-[11px] flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Đã nhận hàng thành công:</strong> Kiện hàng #{order.order_code} đã được giao đến tay bạn. Bạn có thể bấm <strong>"Đánh giá sản phẩm"</strong> bên dưới để chia sẻ cảm nhận!
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Actions & Total */}
                <div className="flex flex-wrap justify-between items-center pt-2 border-t border-slate-100 dark:border-border gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Thanh toán: <strong className="text-slate-800 dark:text-slate-200 uppercase font-bold">{order.payment_method === 'bank_transfer' ? 'VietQR Ngân Hàng' : 'Thu tiền khi nhận (COD)'}</strong>
                  </span>

                  <div className="flex items-center gap-3 ml-auto">
                    {isCompleted && (
                      <div className="flex items-center gap-2">
                        {reviewedOrders[order.order_code] ? (
                          <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs font-bold gap-1 py-1.5 px-3 rounded-xl">
                            <Check className="w-3.5 h-3.5" /> Đã Đánh Giá 5★
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenReviewModal(order)}
                            className="h-8 text-xs font-bold text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 gap-1.5 rounded-xl shadow-sm cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>Đánh giá 5★</span>
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReorder(order)}
                          className="h-8 text-xs font-bold text-slate-700 dark:text-slate-300 border-slate-300 dark:border-border hover:bg-slate-50 dark:hover:bg-slate-800 gap-1.5 rounded-xl shadow-sm cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                          <span>Mua lại</span>
                        </Button>
                      </div>
                    )}

                    <div className="text-right">
                      <span className="text-xs text-slate-400 mr-1.5">Tổng tiền:</span>
                      <span className="text-base font-black text-[#27c372]">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* CLIENT LIVE TRACKING TIMELINE MODAL */}
      <Dialog open={!!clientTrackingInfo} onOpenChange={() => setClientTrackingInfo(null)}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-card rounded-3xl p-6 font-sans shadow-2xl border border-slate-200 dark:border-border max-h-[90vh] overflow-y-auto text-card-foreground">
          {clientTrackingInfo && (
            <div className="space-y-4">
              <DialogHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold px-3 py-1">
                    {clientTrackingInfo.carrier} Express
                  </Badge>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
                    #{clientTrackingInfo.trackingNumber}
                  </span>
                </div>
                <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100">
                  Theo Dõi Hành Trình Đơn Hàng
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Đơn hàng #{clientTrackingInfo.orderCode} • Người nhận: {clientTrackingInfo.receiverName}
                </DialogDescription>
              </DialogHeader>

              {/* Shipper Contact Card */}
              <div className="p-3.5 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white rounded-2xl space-y-2 shadow-md border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-900 text-sm">
                      {clientTrackingInfo.shipperName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{clientTrackingInfo.shipperName}</div>
                      <div className="text-[11px] text-slate-300">Shipper phụ trách giao đơn</div>
                    </div>
                  </div>
                  <a
                    href={`tel:${clientTrackingInfo.shipperPhone}`}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Gọi Tài Xế</span>
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/80 text-[11px] text-slate-300">
                  <div>SĐT: <b className="text-white">{clientTrackingInfo.shipperPhone}</b></div>
                  <div>Biển số: <b className="text-white">{clientTrackingInfo.shipperPlate}</b></div>
                </div>
              </div>

              {/* Timeline List */}
              <div className="space-y-3 pt-2">
                <Label className="font-bold text-slate-800 dark:text-slate-200 text-xs">Chi tiết tiến trình bưu phẩm:</Label>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                  {clientTrackingInfo.timeline.map((event, idx) => {
                    const isLatest = idx === 0
                    return (
                      <div key={idx} className="relative space-y-1">
                        <div
                          className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isLatest
                              ? 'bg-emerald-600 border-white dark:border-card ring-4 ring-emerald-100 dark:ring-emerald-950'
                              : 'bg-slate-300 dark:bg-slate-600 border-white dark:border-card'
                          }`}
                        >
                          {isLatest && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isLatest ? 'text-emerald-700 dark:text-emerald-400 font-black' : 'text-slate-800 dark:text-slate-200'}`}>
                            {event.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{event.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{event.description}</p>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setClientTrackingInfo(null)}
                  className="w-full rounded-xl font-bold border-slate-300 dark:border-border text-xs"
                >
                  Đóng
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Address Modal */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent className="max-w-md sm:rounded-3xl p-6 bg-white dark:bg-card border border-slate-200 dark:border-border shadow-2xl text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#27c372]" />
              <span>Sửa Thông Tin Giao Hàng Đơn #{editingOrder?.order_code}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Cập nhật tên, SĐT hoặc địa chỉ người nhận trước khi hệ thống duyệt chuyển đơn đi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 dark:text-slate-300 text-xs">Họ và tên người nhận</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nhập tên người nhận..."
                className="h-10 text-xs font-medium rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 dark:text-slate-300 text-xs">Số điện thoại liên hệ</Label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Nhập số điện thoại..."
                className="h-10 text-xs font-medium rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 dark:text-slate-300 text-xs">Địa chỉ nhận hàng đầy đủ</Label>
              <Input
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                className="h-10 text-xs font-medium rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 dark:text-slate-300 text-xs">Ghi chú cho tài xế giao hàng</Label>
              <Input
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Giao giờ hành chính, gọi trước 5 phút..."
                className="h-10 text-xs font-medium rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditingOrder(null)} className="rounded-xl font-bold text-xs border-border">
              Hủy bỏ
            </Button>
            <Button onClick={handleSaveAddress} className="bg-[#27c372] hover:bg-[#22c55e] text-white font-bold rounded-xl text-xs">
              Lưu Địa Chỉ Mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Modal Dialog for Completed Orders */}
      <Dialog open={!!reviewingOrder} onOpenChange={() => setReviewingOrder(null)}>
        <DialogContent className="max-w-md sm:rounded-3xl p-6 bg-white dark:bg-card border border-slate-200 dark:border-border shadow-2xl text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span>Đánh Giá Đơn Hàng #{reviewingOrder?.order_code}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Chia sẻ cảm nhận về thiết bị sau khi nhận hàng để giúp cộng đồng người chơi
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitOrderReview} className="space-y-4 py-2 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-border space-y-1.5">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Sản phẩm đánh giá:</div>
              {reviewingOrder?.items?.map((item: any) => (
                <div key={item.id} className="font-bold text-slate-900 dark:text-slate-100 text-xs flex justify-between">
                  <span>{item.item_name}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">x{item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Interactive Stars */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">Chất lượng sản phẩm:</Label>
              <div className="flex items-center gap-1 text-amber-400 cursor-pointer pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onMouseEnter={() => setOrderHoverRating(star)}
                    onMouseLeave={() => setOrderHoverRating(0)}
                    onClick={() => setOrderRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        (orderHoverRating || orderRating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs text-slate-600 dark:text-slate-400 font-bold ml-2">
                  {orderRating === 5
                    ? '⭐ Rất Hài Lòng (5/5)'
                    : orderRating === 4
                    ? '⭐ Tốt (4/5)'
                    : orderRating === 3
                    ? '⭐ Bình Thường (3/5)'
                    : '⭐ Chưa Hài Lòng'}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">Nhận xét chi tiết:</Label>
              <Textarea
                placeholder="Cảm giác cầm nắm, bề mặt vợt, độ nảy bóng, thời gian giao hàng..."
                value={orderComment}
                onChange={(e) => setOrderComment(e.target.value)}
                rows={3}
                className="text-xs rounded-xl font-medium"
                required
              />
            </div>

            {/* Real photo attachments */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-border">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Hình ảnh mở hộp / thực tế (Tối đa 3 ảnh):</span>
                </Label>
                <span className="text-[11px] text-slate-400">{orderImages.length}/3 ảnh</span>
              </div>

              <input
                type="file"
                ref={orderFileInputRef}
                onChange={handleOrderImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-2.5">
                {orderImages.map((imgSrc, idx) => (
                  <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-border group">
                    <img src={imgSrc} alt={`Order upload ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveOrderImage(idx)}
                      className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {orderImages.length < 3 && (
                  <button
                    type="button"
                    onClick={() => orderFileInputRef.current?.click()}
                    className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-600 bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50/50 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all text-[9px] font-bold gap-0.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Thêm ảnh</span>
                  </button>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100 dark:border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setReviewingOrder(null)} className="rounded-xl text-xs font-bold border-border">
                Hủy Bỏ
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs">
                Gửi Đánh Giá Ngay
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
