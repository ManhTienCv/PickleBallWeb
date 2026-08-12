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
import { Package, QrCode, ShoppingBag, Edit3, Truck, ShieldCheck, CheckCircle2, Lock, AlertCircle, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function OrdersPage() {
  const navigate = useNavigate()

  const { data: apiOrders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: orderService.getOrders,
  })

  const [orders, setOrders] = useState<any[]>([])
  const [editingOrder, setEditingOrder] = useState<any | null>(null)
  const [editAddress, setEditAddress] = useState('')
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editNote, setEditNote] = useState('')

  // Sync API orders or provide rich mock order items for demonstration
  useEffect(() => {
    if (apiOrders && apiOrders.length > 0) {
      setOrders(apiOrders)
    } else {
      // Default rich interactive orders for customer
      setOrders([
        {
          id: 991,
          order_code: 'HD-98210',
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
          created_at: '2026-08-09T08:30:00Z',
          status: 'shipped', // ĐÃ GIAO ĐƠN VỊ VẬN CHUYỂN
          payment_method: 'momo',
          total_amount: 360000,
          shipping_address: 'Số 25 Phố Lý Thường Kiệt, Q. Hoàn Kiếm, Hà Nội',
          customer_name: 'Nguyễn Văn An',
          customer_phone: '0987654321',
          tracking_number: 'SPX-VN-9821093',
          items: [
            { id: 3, item_type: 'booking', item_name: 'Đặt Sân VIP 1 (08:00 - 10:00)', quantity: 1, subtotal: 360000 },
          ],
        },
      ])
    }
  }, [apiOrders])

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-600 font-extrabold text-white">Hoàn Thành</Badge>
      case 'shipped':
        return (
          <Badge className="bg-blue-600 text-white font-extrabold gap-1.5 px-3 py-1">
            <Truck className="w-3.5 h-3.5" /> Đã Giao Đơn Vị Vận Chuyển
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-300 font-extrabold gap-1 px-3 py-1">
            <Clock className="w-3.5 h-3.5" /> Chờ Duyệt & Chuẩn Bị Hàng
          </Badge>
        )
      case 'cancelled':
        return <Badge variant="destructive" className="font-extrabold">Đã Hủy</Badge>
      default:
        return <Badge variant="secondary" className="font-bold">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-4xl font-sans">
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-8 flex items-center gap-3">
        <Package className="h-8 w-8 text-[#27c372]" />
        Lịch Sử Đơn Hàng & Quản Lý Nhận Hàng
      </h1>

      {orders.length === 0 ? (
        <div className="container mx-auto py-16 px-4 text-center max-w-md">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 mx-auto mb-4">
            <Package className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Chưa Có Đơn Hàng Nào</h2>
          <p className="text-slate-500 mt-2 text-sm">
            Bạn chưa đặt thuê sân hay mua thiết bị thể thao nào.
          </p>
          <Button onClick={() => navigate('/booking')} className="mt-6 gap-2 bg-[#27c372] text-white font-bold rounded-xl">
            <ShoppingBag className="h-4 w-4" />
            <span>Đặt sân Pickleball ngay</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => {
            const isPending = order.status === 'pending'
            const isShipped = order.status === 'shipped'

            return (
              <Card key={order.id} className="p-6 border-slate-200 space-y-4 shadow-sm hover:shadow-md transition-all rounded-3xl bg-white">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Mã đơn hàng:</span>
                    <div className="font-mono font-black text-slate-900 text-lg">#{order.order_code}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {item.item_type === 'booking' ? 'Thuê Sân' : 'Thiết bị'}
                        </Badge>
                        <span className="font-extrabold text-slate-800">{item.item_name}</span>
                        <span className="text-slate-400 text-xs font-bold">x{item.quantity}</span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping & Recipient Info Box */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs font-semibold text-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-sm">
                      <Truck className="w-4 h-4 text-[#27c372]" /> Thông tin vận chuyển & Nhận hàng
                    </div>
                    {isPending && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(order)}
                        className="rounded-xl font-extrabold text-[#27c372] border-[#27c372]/40 hover:bg-[#27c372]/10 h-8 gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa Thông Tin Giao Hàng</span>
                      </Button>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium">Người nhận: </span>
                    <span className="font-bold text-slate-900">{order.customer_name || 'Nguyễn Văn An'} ({order.customer_phone || '0987654321'})</span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium">Địa chỉ giao: </span>
                    <span className="font-bold text-slate-900">{order.shipping_address}</span>
                  </div>

                  {/* Dynamic Shopee Style Notice Banner */}
                  {isPending && (
                    <div className="mt-2 p-3 bg-amber-500/10 border border-amber-400/40 rounded-xl text-amber-900 text-[11px] flex items-start gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Thông báo duyệt đơn:</strong> Vui lòng kiểm tra kỹ lại thông tin giao hàng trước khi đơn hàng được chấp nhận & giao cho đơn vị vận chuyển. Bạn có thể bấm nút "Sửa Thông Tin Giao Hàng" ở trên bất kỳ lúc nào khi đơn ở trạng thái Chờ Duyệt.
                      </div>
                    </div>
                  )}

                  {isShipped && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] flex items-start gap-2 font-medium">
                      <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Đã bàn giao đơn vị vận chuyển:</strong> Đơn hàng #{order.order_code} đã được bàn giao cho đối tác giao vận ({order.tracking_number || 'SPX Express'}). Quyền sửa thông tin địa chỉ trên web đã được tự động khóa để bảo đảm hành trình.
                      </div>
                    </div>
                  )}
                </div>

                {/* QR Checkin if booking */}
                {order.qr_checkin_code && (
                  <div className="bg-emerald-50/70 p-3 rounded-2xl flex items-center justify-between border border-emerald-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                      <QrCode className="h-4 w-4 text-[#27c372]" />
                      <span>Mã Check-in QR tại sân:</span>
                    </div>
                    <code className="font-mono font-black text-[#27c372] bg-white px-3 py-1 rounded-xl border border-emerald-200">
                      {order.qr_checkin_code}
                    </code>
                  </div>
                )}

                {/* Footer Total */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">
                    Thanh toán: <strong className="text-slate-800 uppercase font-extrabold">{order.payment_method}</strong>
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 mr-2 font-medium">Tổng tiền:</span>
                    <span className="text-lg font-black text-[#27c372]">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* EDIT SHIPPING ADDRESS MODAL */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 font-sans">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#27c372]" />
              Chỉnh Sửa Thông Tin Giao Hàng (Shopee Style)
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-xs leading-relaxed font-medium">
              Bạn có thể cập nhật tên người nhận, số điện thoại và địa chỉ giao mới. Đơn hàng #{editingOrder?.order_code} vẫn đang trong thời gian <strong>CHỜ DUYỆT</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="eName" className="font-bold text-xs text-slate-700">Tên người nhận</Label>
                <Input
                  id="eName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="rounded-xl font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ePhone" className="font-bold text-xs text-slate-700">Số điện thoại nhận</Label>
                <Input
                  id="ePhone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="eAddress" className="font-bold text-xs text-slate-700">Địa chỉ giao hàng mới</Label>
              <Input
                id="eAddress"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="rounded-xl font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="eNote" className="font-bold text-xs text-slate-700">Ghi chú cho shipper (nếu có)</Label>
              <Input
                id="eNote"
                placeholder="Ví dụ: Đổi sang giao vào buổi chiều..."
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                className="rounded-xl font-medium"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-3 justify-end pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setEditingOrder(null)}
              className="rounded-xl font-extrabold border-slate-300"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveAddress}
              className="bg-[#27c372] hover:bg-[#22c55e] text-white font-black rounded-xl gap-1.5 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu Thay Đổi</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
