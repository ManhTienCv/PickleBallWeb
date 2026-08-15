import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orderService, Order } from '@/services/order.service'
import { notificationService } from '@/services/notification.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Package, QrCode, ShoppingBag, Edit3, Truck, ShieldCheck, CheckCircle2, Lock, AlertCircle, Clock, MapPin, Phone, Star, RotateCcw } from 'lucide-react'
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

  // Initial orders list containing simulated completed order & separated booking tickets
  useEffect(() => {
    if (apiOrders && apiOrders.length > 0) {
      setOrders(apiOrders)
    } else {
      setOrders([
        {
          id: 991,
          order_code: 'HD-98210',
          order_type: 'product',
          created_at: new Date().toISOString(),
          status: 'pending', // CHỜ DUYỆT
          payment_method: 'bank_transfer',
          total_amount: 5580000,
          shipping_address: 'Số 10 Đường Pickleball, Q. Cầu Giấy, Hà Nội',
          customer_name: 'Nguyễn Văn An',
          customer_phone: '0987654321',
          items: [
            { id: 1, item_type: 'product', item_name: 'Vợt Pickleball JOOLA Perseus 3S 16mm Carbon', quantity: 1, subtotal: 5490000 },
            { id: 2, item_type: 'product', item_name: 'Bóng Pickleball Franklin X-40 (Hộp 4 quả)', quantity: 1, subtotal: 90000 },
          ],
        },
        {
          id: 992,
          order_code: 'HD-88291',
          order_type: 'product',
          created_at: '2026-08-09T08:30:00Z',
          status: 'shipped', // ĐANG GIAO HÀNG
          payment_method: 'bank_transfer',
          total_amount: 300000,
          shipping_address: 'Số 25 Phố Lý Thường Kiệt, Q. Hoàn Kiếm, Hà Nội',
          customer_name: 'Nguyễn Văn An',
          customer_phone: '0987654321',
          tracking_number: 'SPX-VN-9821093',
          items: [
            { id: 3, item_type: 'product', item_name: 'Băng Cán Vợt Joola Tac (Lốc 2 cái)', quantity: 1, subtotal: 150000 },
            { id: 4, item_type: 'product', item_name: 'Túi Bao Vợt Pickleball Chống Nước', quantity: 1, subtotal: 150000 },
          ],
        },
        {
          id: 993,
          order_code: 'HD-77102',
          order_type: 'product',
          created_at: '2026-08-07T14:30:00Z',
          status: 'completed', // ĐÃ GIAO THÀNH CÔNG (MỚI GIẢ LẬP)
          payment_method: 'bank_transfer',
          total_amount: 6200000,
          shipping_address: 'Số 10 Đường Pickleball, Q. Cầu Giấy, Hà Nội',
          customer_name: 'Nguyễn Văn An',
          customer_phone: '0987654321',
          tracking_number: 'SPX-VN-7710200',
          completed_at: '10/08/2026 lúc 14:30',
          items: [
            { id: 5, item_type: 'product', item_name: 'Vợt Selkirk Vanguard Power Air Invikta', quantity: 1, subtotal: 6200000 },
          ],
        },
        {
          id: 994,
          order_code: 'BK-90218',
          order_type: 'booking', // VÉ ĐẶT SÂN PICKLEBALL (TÁCH BIỆT - KHÔNG SHIP)
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

  const getStatusBadge = (status: string, isBooking?: boolean) => {
    if (isBooking) {
      return (
        <Badge className="bg-emerald-600 font-semibold text-white gap-1 px-3 py-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Đã Xác Nhận Lịch Sân
        </Badge>
      )
    }

    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-emerald-600 font-semibold text-white gap-1 px-3 py-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã Giao Thành Công
          </Badge>
        )
      case 'shipped':
        return (
          <Badge className="bg-blue-600 text-white font-semibold gap-1.5 px-3 py-1">
            <Truck className="w-3.5 h-3.5" /> Đã Giao Đơn Vị Vận Chuyển
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-300 font-semibold gap-1 px-3 py-1">
            <Clock className="w-3.5 h-3.5" /> Chờ Duyệt & Chuẩn Bị Hàng
          </Badge>
        )
      case 'cancelled':
        return <Badge variant="destructive" className="font-semibold">Đã Hủy</Badge>
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
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-6 flex items-center gap-3">
        <Package className="h-7 w-7 text-[#27c372]" />
        <span>Lịch Sử Đơn Hàng & Vé Đặt Sân</span>
      </h1>

      {/* Shopee Style Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        {[
          { id: 'pending', label: '⏳ Chờ duyệt', count: pendingCount },
          { id: 'shipped', label: '🚚 Đang giao', count: shippedCount },
          { id: 'completed', label: '✅ Đã giao thành công', count: completedCount },
          { id: 'booking', label: '🎾 Vé đặt sân', count: bookingCount },
        ].map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setActiveTab(tabItem.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs transition-all ${
              activeTab === tabItem.id
                ? 'bg-slate-900 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:bg-slate-100 font-medium'
            }`}
          >
            {tabItem.label} ({tabItem.count})
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="container mx-auto py-16 px-4 text-center max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 mx-auto mb-4">
            <Package className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Không Tìm Thấy Đơn Hàng Nào</h2>
          <p className="text-slate-500 mt-2 text-xs font-normal">
            {activeTab === 'completed'
              ? 'Chưa có đơn hàng sản phẩm nào hoàn thành giao tận nơi.'
              : activeTab === 'booking'
              ? 'Bạn chưa có vé đặt sân Pickleball nào.'
              : 'Bạn chưa có đơn hàng nào ở mục này.'}
          </p>
          <Button onClick={() => navigate(activeTab === 'booking' ? '/booking' : '/products')} className="mt-6 gap-2 bg-[#27c372] text-white font-semibold rounded-xl text-xs">
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
              <Card key={order.id} className="p-6 border-slate-200 space-y-4 shadow-sm hover:shadow-md transition-all rounded-3xl bg-white">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs text-slate-400 font-normal">Mã đơn hàng:</span>
                    <div className="font-mono font-bold text-slate-900 text-base">#{order.order_code}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status, isBooking)}
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {item.item_type === 'booking' ? 'Thuê Sân' : 'Thiết bị'}
                        </Badge>
                        <span className="font-bold text-slate-800">{item.item_name}</span>
                        <span className="text-slate-400 text-xs font-normal">x{item.quantity}</span>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 🔴 CASE A: COURT BOOKING TICKET (THÔNG TIN THI ĐẤU & CHECK-IN TẠI SÂN) */}
                {isBooking ? (
                  <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/90 space-y-3 text-xs font-normal text-emerald-950">
                    <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-sm">
                        <MapPin className="w-4 h-4 text-[#27c372]" /> Thông tin vị trí & Lịch thi đấu tại sân
                      </div>
                      <Badge className="bg-emerald-600 text-white font-semibold text-[10px]">
                        Xác nhận trực tiếp
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-emerald-700">Cụm sân thi đấu: </span>
                        <span className="font-semibold text-slate-900">{order.court_address || 'Số 188 Nguyễn Văn Cừ, Q. Long Biên, Hà Nội'}</span>
                      </div>
                      <div>
                        <span className="text-emerald-700">Khung giờ đặt: </span>
                        <span className="font-semibold text-slate-900">{order.play_time || '08:00 - 10:00 (15/08/2026)'}</span>
                      </div>
                    </div>

                    {/* QR Check-in Box */}
                    <div className="pt-2 flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-200 shadow-inner">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                        <QrCode className="h-5 w-5 text-[#27c372]" />
                        <div>
                          <div>Mã QR Check-in nhận sân tại quầy:</div>
                          <div className="text-[11px] text-slate-400 font-normal">Đưa mã này cho Lễ tân khi đến sân chơi</div>
                        </div>
                      </div>
                      <code className="font-mono font-bold text-base text-[#27c372] bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                        {order.qr_checkin_code || 'PK-90218-VIP'}
                      </code>
                    </div>
                  </div>
                ) : (
                  /* 🔵 CASE B: SHOP PRODUCT ORDER (THÔNG TIN VẬN CHUYỂN GIAO HÀNG TẬN NƠI) */
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs font-normal text-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                        <Truck className="w-4 h-4 text-[#27c372]" /> Thông tin vận chuyển & Nhận hàng
                      </div>
                      {isPending && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(order)}
                          className="rounded-xl font-semibold text-[#27c372] border-[#27c372]/40 hover:bg-[#27c372]/10 h-8 gap-1 text-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa Thông Tin Giao Hàng</span>
                        </Button>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400">Người nhận: </span>
                      <span className="font-semibold text-slate-900">{order.customer_name || 'Nguyễn Văn An'} ({order.customer_phone || '0987654321'})</span>
                    </div>

                    <div>
                      <span className="text-slate-400">Địa chỉ giao: </span>
                      <span className="font-semibold text-slate-900">{order.shipping_address}</span>
                    </div>

                    {/* Notice Banners per Shipping Status */}
                    {isPending && (
                      <div className="mt-2 p-3 bg-amber-500/10 border border-amber-400/40 rounded-xl text-amber-900 text-[11px] flex items-start gap-2 font-normal">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Thông báo duyệt đơn:</strong> Vui lòng kiểm tra kỹ lại thông tin giao hàng trước khi đơn hàng được chấp nhận & giao cho đơn vị vận chuyển. Bạn có thể bấm nút "Sửa Thông Tin Giao Hàng" ở trên bất kỳ lúc nào khi đơn ở trạng thái Chờ Duyệt.
                        </div>
                      </div>
                    )}

                    {isShipped && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] flex items-start gap-2 font-normal">
                        <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Đang vận chuyển:</strong> Đơn hàng #{order.order_code} đã được giao cho đối tác giao vận ({order.tracking_number || 'SPX Express'}). Quyền sửa địa chỉ trên web đã được tự động khóa để bảo đảm hành trình.
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] flex items-start gap-2 font-normal">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Đã giao hàng thành công:</strong> Kiện hàng #{order.order_code} đã được giao đến tay người nhận vào {order.completed_at || '10/08/2026 lúc 14:30'}. Cảm ơn bạn đã tin tưởng dịch vụ của Pick!
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Actions & Total */}
                <div className="flex flex-wrap justify-between items-center pt-2 border-t border-slate-100 gap-3">
                  <span className="text-xs text-slate-500 font-normal">
                    Thanh toán: <strong className="text-slate-800 uppercase font-semibold">{order.payment_method === 'bank_transfer' ? 'VietQR Ngân Hàng' : order.payment_method}</strong>
                  </span>

                  <div className="flex items-center gap-3 ml-auto">
                    {isCompleted && (
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => toast.success('Cảm ơn bạn đã gửi đánh giá 5 sao cho sản phẩm!')} className="h-8 text-xs font-semibold text-amber-600 border-amber-300 bg-amber-50 hover:bg-amber-100 gap-1 rounded-xl">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>Đánh giá sản phẩm</span>
                        </Button>

                        <Button size="sm" variant="outline" onClick={() => navigate('/products')} className="h-8 text-xs font-semibold text-slate-700 border-slate-300 gap-1 rounded-xl">
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Mua lại</span>
                        </Button>
                      </div>
                    )}

                    <div className="text-right">
                      <span className="text-xs text-slate-400 mr-1.5 font-normal">Tổng tiền:</span>
                      <span className="text-base font-bold text-[#27c372]">
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

      {/* Edit Address Modal */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent className="max-w-md sm:rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#27c372]" />
              <span>Sửa Thông Tin Giao Hàng Đơn #{editingOrder?.order_code}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Cập nhật tên, SĐT hoặc địa chỉ người nhận trước khi hệ thống duyệt chuyển đơn đi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="font-medium text-slate-700 text-xs">Họ và tên người nhận</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nhập tên người nhận..."
                className="h-10 text-xs font-normal"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-slate-700 text-xs">Số điện thoại liên hệ</Label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Nhập số điện thoại..."
                className="h-10 text-xs font-normal"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-slate-700 text-xs">Địa chỉ nhận hàng đầy đủ</Label>
              <Input
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                className="h-10 text-xs font-normal"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium text-slate-700 text-xs">Ghi chú cho tài xế giao hàng (Không bắt buộc)</Label>
              <Input
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Giao giờ hành chính, gọi trước 5 phút..."
                className="h-10 text-xs font-normal"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditingOrder(null)} className="rounded-xl font-medium text-xs">
              Hủy bỏ
            </Button>
            <Button onClick={handleSaveAddress} className="bg-[#27c372] hover:bg-[#22c55e] text-white font-semibold rounded-xl text-xs">
              Lưu Địa Chỉ Mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
