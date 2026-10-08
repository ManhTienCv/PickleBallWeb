import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, Truck, Clock, Receipt } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Order } from '@/services/order.service'

interface OrderHistoryTabProps {
  orders: Order[]
  isLoadingOrders: boolean
  onViewReceipt: (order: Order) => void
}

export default function OrderHistoryTab({
  orders,
  isLoadingOrders,
  onViewReceipt,
}: OrderHistoryTabProps) {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-card p-6 rounded-3xl border border-slate-200/80 dark:border-border shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#27c372]" />
            <span>Lịch Sử Đơn Hàng & Thuê Sân</span>
          </h2>
        </div>

        <Badge variant="outline" className="text-xs font-bold px-3 py-1.5 rounded-xl border-slate-300 dark:border-slate-700">
          {orders.length} Đơn Hàng Đã Ghi Nhận
        </Badge>
      </div>

      {isLoadingOrders ? (
        <div className="py-12 text-center text-slate-500">Đang tải lịch sử đơn hàng...</div>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl border-slate-200/80 dark:border-border space-y-3 bg-white dark:bg-card">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Bạn chưa có đơn hàng nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Khám phá các sản phẩm vợt, bóng thi đấu và đặt sân chơi Pickleball ngay hôm nay!
          </p>
          <Button
            onClick={() => navigate('/products')}
            className="bg-[#27c372] hover:bg-[#22c55e] text-white font-bold rounded-2xl text-xs px-5 h-10 mt-2"
          >
            Mua Sắm Ngay
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const isPaid = ord.payment_status === 'paid'
            const isCompleted = ord.status === 'completed'

            return (
              <Card key={ord.id} className="p-6 rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold shrink-0">
                      <Truck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                          #{ord.order_code}
                        </span>
                        <Badge
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${isCompleted
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300'
                            }`}
                        >
                          {isCompleted ? 'Hoàn tất giao hàng' : 'Đang xử lý / Đã tiếp nhận'}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> Ngày tạo: {ord.created_at}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Tổng thanh toán:</span>
                    <span className="text-base sm:text-lg font-black text-[#27c372]">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ord.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {ord.items?.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-[10px]">
                          {it.quantity}x
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {it.item_name}
                        </span>
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                          it.subtotal != null && !isNaN(Number(it.subtotal)) && Number(it.subtotal) > 0
                            ? Number(it.subtotal)
                            : it.price != null && !isNaN(Number(it.price))
                            ? Number(it.price) * (it.quantity || 1)
                            : (ord.total_amount || 0)
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-border text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span>Phương thức:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{ord.payment_method}</span>
                    <span className="text-slate-300">•</span>
                    <Badge className={`text-[10px] font-bold ${isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {isPaid ? '✓ Đã thanh toán' : 'Chờ thu tiền (COD)'}
                    </Badge>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewReceipt(ord)}
                    className="h-8 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/40 dark:hover:border-emerald-800 transition-all flex items-center gap-1.5"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Xem Biên Nhận</span>
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
