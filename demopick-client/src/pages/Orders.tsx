import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { orderService, Order } from '@/services/order.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Package, Clock, QrCode, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function OrdersPage() {
  const navigate = useNavigate()

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: orderService.getOrders,
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4 text-center max-w-md">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 mx-auto mb-4">
          <Package className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Chưa Có Đơn Hàng Nào</h2>
        <p className="text-slate-500 mt-2 text-sm">
          Bạn chưa đặt thuê sân hay mua thiết bị thể thao nào.
        </p>
        <Button onClick={() => navigate('/booking')} className="mt-6 gap-2">
          <ShoppingBag className="h-4 w-4" />
          <span>Đặt sân Pickleball ngay</span>
        </Button>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-600">Hoàn thành</Badge>
      case 'confirmed':
        return <Badge className="bg-blue-600">Đã xác nhận</Badge>
      case 'pending':
        return <Badge variant="outline" className="text-amber-600 border-amber-400">Chờ thanh toán</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Đã hủy</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8 flex items-center gap-3">
        <Package className="h-8 w-8 text-primary" />
        Lịch Sử Đơn Hàng & Thuê Sân
      </h1>

      <div className="space-y-4">
        {orders.map((order: Order) => (
          <Card key={order.id} className="p-6 border-slate-200 space-y-4 shadow-sm hover:border-primary/30 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-slate-400">Mã đơn hàng:</span>
                <div className="font-mono font-bold text-slate-900 text-lg">#{order.order_code}</div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(order.status)}
                <span className="text-xs text-slate-400">
                  {new Date(order.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm py-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {item.item_type === 'booking' ? 'Thuê Sân' : 'Thiết bị'}
                    </Badge>
                    <span className="font-semibold text-slate-800">{item.item_name}</span>
                    <span className="text-slate-400 text-xs">x{item.quantity}</span>
                  </div>
                  <span className="font-medium text-slate-900">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Check-in QR Code if booking */}
            {order.qr_checkin_code && (
              <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <QrCode className="h-4 w-4 text-primary" />
                  <span>Mã Check-in QR tại sân:</span>
                </div>
                <code className="font-mono font-bold text-primary bg-white px-2 py-1 rounded border border-slate-200">
                  {order.qr_checkin_code}
                </code>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Phương thức: <strong className="text-slate-700 uppercase">{order.payment_method}</strong>
              </span>
              <div className="text-right">
                <span className="text-xs text-slate-400 mr-2">Tổng thanh toán:</span>
                <span className="text-lg font-bold text-emerald-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
