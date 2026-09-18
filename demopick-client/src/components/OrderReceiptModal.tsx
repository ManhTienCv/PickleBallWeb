import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Printer,
  Copy,
  Check,
  Truck,
  QrCode,
  ShieldCheck,
  Store,
  Clock,
  Phone,
  MapPin,
  X,
  Receipt,
  FileCheck2,
} from 'lucide-react'
import { Order, orderService } from '@/services/order.service'
import { toast } from 'sonner'
import PickleballLogo from '@/components/PickleballLogo'

interface OrderReceiptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
}

export default function OrderReceiptModal({
  open,
  onOpenChange,
  order: initialOrder,
}: OrderReceiptModalProps) {
  const [copied, setCopied] = useState(false)
  const [enrichedOrder, setEnrichedOrder] = useState<Order | null>(initialOrder)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Sync and enrich order data from backend API whenever modal opens or order changes
  useEffect(() => {
    let isMounted = true

    if (!open || !initialOrder) {
      setEnrichedOrder(initialOrder)
      return
    }

    setEnrichedOrder(initialOrder)

    if (initialOrder.order_code) {
      setIsLoadingDetails(true)
      orderService
        .getOrderByCode(initialOrder.order_code)
        .then((fresh) => {
          if (!isMounted) return
          if (fresh) {
            setEnrichedOrder((prev) => ({
              ...(prev || initialOrder),
              ...fresh,
              // Keep existing items if fresh items is empty
              items: fresh.items && fresh.items.length > 0 ? fresh.items : (prev?.items || initialOrder.items || []),
            }))
          }
        })
        .catch(() => {
          // ignore error, initial order is used as fallback
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingDetails(false)
          }
        })
    }

    return () => {
      isMounted = false
    }
  }, [open, initialOrder])

  if (!enrichedOrder) return null

  const order = enrichedOrder

  const formatVND = (amount: any = 0) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount) || 0)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.order_code)
    setCopied(true)
    toast.success(`Đã sao chép mã đơn hàng #${order.order_code}`)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  const isPaid =
    order.payment_status === 'paid' ||
    order.payment_method === 'momo' ||
    order.payment_method === 'VietQR'

  // Calculate items subtotal
  const itemsSubtotal =
    order.items?.reduce((sum, item) => sum + (item.subtotal || item.price * (item.quantity || 1) || 0), 0) ||
    order.total_amount

  const shippingFee =
    order.shipping_fee !== undefined
      ? order.shipping_fee
      : Math.max(0, order.total_amount - itemsSubtotal)

  // Format created date
  let formattedDate = order.created_at
  try {
    const d = new Date(order.created_at)
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    }
  } catch {
    // keep raw
  }

  // Payment method label
  const getPaymentMethodLabel = (method: string = '') => {
    const m = method.toLowerCase()
    if (m.includes('momo')) return 'Cổng MoMo Hosted Gateway'
    if (m.includes('vietqr') || m.includes('bank')) return 'Chuyển khoản Ngân hàng (VietQR)'
    if (m.includes('cod') || m.includes('tiền mặt')) return 'Thanh toán tiền mặt khi nhận hàng (COD)'
    return method || 'Trực tuyến'
  }

  // QR Code URL for electronic verification
  const qrVerificationUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`DEMOPICK-ORDER:${order.order_code}`)}`

  return (
    <>
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #demopick-order-receipt, #demopick-order-receipt * {
            visibility: visible !important;
          }
          #demopick-order-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 800px !important;
            margin: 0 auto !important;
            padding: 24px !important;
            background: #ffffff !important;
            color: #000000 !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          hideCloseButton
          className="sm:max-w-2xl max-w-[95vw] w-full sm:rounded-3xl p-0 border border-slate-200 dark:border-border bg-slate-50 dark:bg-card shadow-2xl font-sans max-h-[92vh] flex flex-col overflow-hidden text-card-foreground [&>button:last-child]:hidden"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Biên Nhận Đơn Hàng #{order.order_code}</DialogTitle>
            <DialogDescription>Hóa đơn điện tử & biên nhận thanh toán chính thức PickleBall</DialogDescription>
          </DialogHeader>

          {/* Modal Header Actions (No print) */}
          <div className="no-print flex items-center justify-between px-6 py-4 bg-white dark:bg-card border-b border-slate-100 dark:border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Biên Nhận Thanh Toán & Đơn Hàng
                </h3>
                <p className="text-[11px] text-slate-400">Hóa đơn điện tử chính thức hệ thống PickleBall</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-8 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800 gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span>In Biên Nhận</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Scrollable Receipt Area */}
          <div className="overflow-y-auto p-4 sm:p-6 flex-1">
            {/* The printable paper card */}
            <div
              id="demopick-order-receipt"
              className="bg-white dark:bg-card text-slate-900 dark:text-slate-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-border shadow-sm space-y-6 relative overflow-hidden"
            >
              {/* Paper Watermark / Header Pattern */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#27c372] via-emerald-400 to-[#1da85f]" />

              {/* Header: Brand & Invoice Meta */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-border pb-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <PickleballLogo size={32} />
                    <span className="font-black text-xl tracking-tight text-slate-900 dark:text-slate-100">
                      PickleBall<span className="text-[#27c372]">WEB</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                    Hệ thống Thể thao & Cụm sân Pickleball hàng đầu Việt Nam
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Hotline: 1900 6868 • Website: demopick.vn
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#27c372] text-[11px] font-extrabold uppercase tracking-wider">
                    E-Receipt • Hóa đơn bán lẻ
                  </span>
                  <div className="flex items-center sm:justify-end gap-1.5 pt-1">
                    <span className="text-xs text-slate-400">Số biên nhận:</span>
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                      #{order.order_code}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      title="Sao chép mã"
                      className="no-print text-slate-400 hover:text-emerald-600 transition-colors p-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Ngày lập: {formattedDate}
                  </p>
                </div>
              </div>

              {/* Status Stamp & Verification Alert */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${isPaid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'}`}>
                    {isPaid ? <FileCheck2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Trạng thái thanh toán:</span>
                      <Badge className={`text-[10px] font-black ${isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'}`}>
                        {isPaid ? '✓ ĐÃ THANH TOÁN (PAID)' : 'CHỜ THU TIỀN TẬN NƠI (COD)'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isPaid
                        ? 'Giao dịch đã được đối soát và xác nhận an toàn bởi MoMo AIO Gateway.'
                        : 'Quý khách vui lòng chuẩn bị tiền mặt khi nhận hàng.'}
                    </p>
                  </div>
                </div>

                {order.trans_id && (
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block text-[10px]">Mã giao dịch MoMo:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {order.trans_id}
                    </span>
                  </div>
                )}
              </div>

              {/* Customer & Shipping Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/30 border border-slate-100 dark:border-border/60">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                    <Store className="w-3.5 h-3.5 text-emerald-600" /> Thông Tin Khách Hàng
                  </div>
                  <div className="space-y-1 pl-5 text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Họ và tên:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {order.customer_name || order.shipping_name || 'Khách hàng DemoPick'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Điện thoại:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {order.customer_phone || order.shipping_phone || 'Chưa cập nhật'}
                      </span>
                    </div>
                    <div className="flex justify-between items-start gap-2 pt-0.5">
                      <span className="text-slate-400 shrink-0">Địa chỉ:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                        {order.shipping_address || 'Nhận tại quầy / Cụm sân DemoPick'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/30 border border-slate-100 dark:border-border/60">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" /> Vận Chuyển & Thanh Toán
                  </div>
                  <div className="space-y-1 pl-5 text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Đơn vị giao hàng:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {order.shipping_carrier || 'GHN Express (Giao Hàng Nhanh)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kênh thanh toán:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {getPaymentMethodLabel(order.payment_method)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tiến độ đơn:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {order.status === 'completed'
                          ? 'Đã hoàn tất'
                          : order.status === 'confirmed'
                          ? 'Đã xác nhận & Đang đóng gói'
                          : 'Đang xử lý / Tiếp nhận'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List Table */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-emerald-600" /> Danh mục sản phẩm & Dịch vụ
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-border overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-border">
                        <th className="py-2.5 px-3 w-10 text-center">#</th>
                        <th className="py-2.5 px-3">Tên sản phẩm / Dịch vụ</th>
                        <th className="py-2.5 px-3 text-center w-16">SL</th>
                        <th className="py-2.5 px-3 text-right w-28">Đơn giá</th>
                        <th className="py-2.5 px-3 text-right w-32">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-border/60">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => {
                          const qty = item.quantity && item.quantity > 0 ? item.quantity : 1
                          const unitPrice = item.price || (item.subtotal ? Math.round(item.subtotal / qty) : 0)
                          const itemSubtotal = item.subtotal || unitPrice * qty
                          return (
                            <tr key={item.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                                {idx + 1}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                  {item.item_name}
                                </div>
                                {item.item_type === 'booking' && (
                                  <span className="text-[10px] text-emerald-600 font-bold">
                                    • Khung giờ thi đấu tại sân
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                                {qty}
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400 font-medium">
                                {formatVND(unitPrice)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                                {formatVND(itemSubtotal)}
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400">
                            Không có sản phẩm nào trong biên nhận này.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-3 border-t border-dashed border-slate-200 dark:border-border">
                {/* Left: QR Verification & Guarantee */}
                <div className="flex items-center gap-3.5 max-w-sm">
                  <div className="p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0 flex items-center justify-center min-w-[80px] min-h-[80px]">
                    <img
                      src={qrVerificationUrl}
                      alt="QR Verification"
                      className="w-20 h-20 object-contain rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <QrCode className="w-10 h-10 text-slate-400 hidden only:block" />
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Xác thực điện tử chuẩn USAPA</span>
                    </div>
                    <p className="leading-tight">
                      Quét mã QR để đối soát thông tin đơn hàng, tra cứu bảo hành hoặc làm thủ tục check-in tại sân.
                    </p>
                  </div>
                </div>

                {/* Right: Totals summary */}
                <div className="w-full sm:w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Tạm tính tiền hàng:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {formatVND(itemsSubtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Phí vận chuyển (GHN):</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {shippingFee > 0 ? formatVND(shippingFee) : 'Miễn phí'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-border flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Tổng thanh toán:
                    </span>
                    <span className="font-black text-xl text-[#27c372]">
                      {formatVND(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thank you note */}
              <div className="text-center pt-4 border-t border-slate-100 dark:border-border/60 text-xs text-slate-400 italic">
                Cảm ơn bạn đã lựa chọn và đồng hành cùng PickleBall WEB. Chúc bạn có những trận đấu đỉnh cao và ngập tràn niềm vui!
              </div>
            </div>
          </div>

          {/* Modal Footer (No print) */}
          <div className="no-print flex items-center justify-between px-6 py-4 bg-white dark:bg-card border-t border-slate-100 dark:border-border">
            <span className="text-xs text-slate-400">
              Mã tra cứu: <code className="font-bold text-slate-700 dark:text-slate-300">#{order.order_code}</code>
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Đã chép mã' : 'Sao chép mã'}
              </Button>
              <Button
                size="sm"
                onClick={handlePrint}
                className="bg-[#27c372] hover:bg-[#20a861] text-white font-bold rounded-xl text-xs gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Hóa Đơn / Biên Nhận</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
