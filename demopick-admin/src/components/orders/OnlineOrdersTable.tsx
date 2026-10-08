import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Zap, Navigation, Printer, Eye, RotateCcw, ArrowRight, CheckCircle2, XCircle, PackageCheck, AlertTriangle } from "lucide-react";
import { Order, OrderStatus } from "@/types/order.types";

interface OnlineOrdersTableProps {
  orders: Order[];
  onUpdateStatus: (orderCode: string, newStatus: OrderStatus) => void;
  onDispatchGHN: (order: Order) => void;
  onOpenTrackingModal: (order: Order) => void;
  onOpenPrintShippingLabel: (order: Order) => void;
  onSelectOrder: (order: Order) => void;
  onConfirmRefund?: (orderCode: string) => void;
  isOrderPaid: (order: Order) => boolean;
}

export const OnlineOrdersTable: React.FC<OnlineOrdersTableProps> = ({
  orders,
  onUpdateStatus,
  onDispatchGHN,
  onOpenTrackingModal,
  onOpenPrintShippingLabel,
  onSelectOrder,
  onConfirmRefund,
  isOrderPaid,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[880px]">
          <thead>
            <tr className="border-b border-slate-200 font-bold text-slate-500 uppercase bg-[#FAF8F5] tracking-wider text-[11px]">
              <th className="py-4 px-4 w-36">MÃ ĐƠN</th>
              <th className="py-4 px-4 min-w-[180px]">KHÁCH HÀNG</th>
              <th className="py-4 px-4 min-w-[140px]">THANH TOÁN</th>
              <th className="py-4 px-4 min-w-[160px]">VẬN CHUYỂN GHN</th>
              <th className="py-4 px-4 w-32">TỔNG TIỀN</th>
              <th className="py-4 px-4 min-w-[150px]">TRẠNG THÁI</th>
              <th className="py-4 px-4 text-right min-w-[180px]">TÁC VỤ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-14 text-center text-slate-400 text-sm">
                  Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isPending =
                  order.status === "PENDING" ||
                  order.status === "CHỜ_THANH_TOÁN" ||
                  order.status === "PAID" ||
                  order.status === "ĐÃ_THANH_TOÁN" ||
                  order.status === "CONFIRMED";
                const isRefundPending = order.status === "REFUND_PENDING" || order.status === "CHỜ_HOÀN_TIỀN";
                const isRefunded = order.status === "REFUNDED" || order.status === "ĐÃ_HOÀN_TIỀN";
                const isShipped = order.status === "SHIPPED" || order.status === "SHIPPING";
                const isCompleted = order.status === "COMPLETED";
                const isCancelled = order.status === "CANCELLED" || isRefunded;
                const isPaid = isOrderPaid(order);
                const isOnlinePayment =
                  order.paymentMethod === "MoMo" ||
                  order.paymentMethod === "MOMO" ||
                  order.paymentMethod === "VietQR" ||
                  order.paymentMethod === "Cổng Online";
                const isUnpaidOnline = isOnlinePayment && !isPaid;
                const canDispatchGHN = !order.trackingNumber && !isCancelled && !isCompleted && !isShipped && !isRefundPending && !isUnpaidOnline;

                return (
                  <tr key={order.code} className="hover:bg-slate-50/80 transition-colors">
                    {/* 1. MÃ ĐƠN */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-mono font-bold text-amber-700 text-xs tracking-tight">#{order.code}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{order.createdAt || order.dateStr}</div>
                    </td>

                    {/* 2. KHÁCH HÀNG */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-bold text-slate-900 text-xs">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {order.customerPhone || "Chưa có SĐT"}
                      </div>
                    </td>

                    {/* 3. THANH TOÁN */}
                    <td className="py-4 px-4 align-top">
                      <div>
                        {order.paymentMethod === "MoMo" && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                            Ví MoMo
                          </span>
                        )}
                        {order.paymentMethod === "VietQR" && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            VietQR
                          </span>
                        )}
                        {order.paymentMethod === "COD" && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Tiền mặt (COD)
                          </span>
                        )}
                        {order.paymentMethod === "Tiền mặt" && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            Tiền mặt
                          </span>
                        )}
                        {order.paymentMethod === "Cổng Online" && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            Cổng Online
                          </span>
                        )}
                      </div>

                      {/* Payment Status Dot */}
                      {isOrderPaid(order) ? (
                        <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1.5 mt-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Đã thanh toán</span>
                        </div>
                      ) : isCancelled ? (
                        <div className="text-[11px] font-semibold text-rose-500 flex items-center gap-1.5 mt-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          <span>Đã hoàn tiền</span>
                        </div>
                      ) : (
                        <div className="text-[11px] font-semibold text-amber-600 flex items-center gap-1.5 mt-1.5">
                          <span className="w-1.5 h-1.5 rounded-full border border-amber-500"></span>
                          <span>Chờ thanh toán</span>
                        </div>
                      )}
                    </td>

                    {/* 4. VẬN CHUYỂN GHN */}
                    <td className="py-4 px-4 align-top">
                      {order.trackingNumber ? (
                        <div className="space-y-1">
                          <Badge className="bg-blue-600 text-white font-bold inline-flex items-center gap-1 text-[11px] py-0.5 px-2 shadow-xs">
                            <Truck className="w-3 h-3" />
                            <span>{order.shippingCarrier || "GHN"} Express</span>
                          </Badge>
                          <div className="text-[11px] text-slate-800 font-mono font-bold">
                            {order.trackingNumber}
                          </div>
                        </div>
                      ) : isCancelled ? (
                        <span className="text-rose-500 text-xs font-medium">Đã hủy đơn</span>
                      ) : order.shippingCarrier === "GHTK" ? (
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-300 font-semibold inline-flex items-center gap-1 text-[11px] py-0.5 px-2">
                            <Truck className="w-3 h-3 text-emerald-600" />
                            <span>Chờ giao GHTK</span>
                          </Badge>
                          <div className="text-[10px] text-slate-400 font-medium">Chưa xuất vận đơn</div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-300 font-semibold inline-flex items-center gap-1 text-[11px] py-0.5 px-2">
                            <Truck className="w-3 h-3 text-amber-600" />
                            <span>Chờ giao GHN Express</span>
                          </Badge>
                          <div className="text-[10px] text-slate-400 font-medium">Chưa bàn giao</div>
                        </div>
                      )}
                    </td>

                    {/* 5. TỔNG TIỀN */}
                    <td className="py-4 px-4 align-top font-bold text-slate-900 text-sm">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalAmount)}
                    </td>

                    {/* 6. TRẠNG THÁI (Badge tĩnh - Read-only DFSM State) */}
                    <td className="py-4 px-4 align-top">
                      {isRefundPending ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          <span>Chờ hoàn tiền</span>
                        </span>
                      ) : isRefunded ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          <span>Đã hoàn tiền</span>
                        </span>
                      ) : isCancelled ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>Đã hủy</span>
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Thành công</span>
                        </span>
                      ) : isShipped ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          <span>Đang giao hàng</span>
                        </span>
                      ) : (order.status === "READY_TO_PICK" || order.status === "PICKING") ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>Chờ lấy hàng</span>
                        </span>
                      ) : order.status === "RETURNED" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          <span>Hoàn hàng</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>Chờ xử lý</span>
                        </span>
                      )}
                    </td>

                    {/* 7. TÁC VỤ (Nút chuyển tiếp tuần tự DFSM & Chống sai lỗi Poka-Yoke) */}
                    <td className="py-4 px-4 text-right align-top whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1. ĐƠN MỚI: PENDING / CONFIRMED -> Bấm [Duyệt đơn →] & [Hủy] */}
                        {isPending && (
                          <>
                            {isUnpaidOnline ? (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs"
                                title={`Khách chọn thanh toán qua ${order.paymentMethod} nhưng chưa thanh toán. Hệ thống khóa duyệt đơn để tránh mất hàng!`}
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Chờ TT {order.paymentMethod}</span>
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => onUpdateStatus(order.code, "READY_TO_PICK")}
                                className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm gap-1.5 cursor-pointer"
                                title="Duyệt đơn và chuyển kho chuẩn bị hàng"
                              >
                                <span>Duyệt đơn</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onUpdateStatus(order.code, "CANCELLED")}
                              className="h-8 px-2 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold rounded-xl gap-1 cursor-pointer"
                              title="Hủy đơn hàng này"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Hủy</span>
                            </Button>
                          </>
                        )}

                        {/* 2. KHO CHUẨN BỊ XONG: READY_TO_PICK / PICKING -> Bấm [1-Click GHN] / [Giao hàng →] & [Hủy] */}
                        {(order.status === "READY_TO_PICK" || order.status === "PICKING") && (
                          <>
                            {isUnpaidOnline ? (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs"
                                title={`Đơn hàng chưa thanh toán ${order.paymentMethod}! Hệ thống khóa xuất kho bàn giao GHN để tránh mất trắng hàng hóa.`}
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>Khóa GHN (Chưa TT)</span>
                              </span>
                            ) : canDispatchGHN ? (
                              <Button
                                size="sm"
                                onClick={() => onDispatchGHN(order)}
                                className="h-8 px-2.5 text-xs bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-sm gap-1.5 cursor-pointer"
                                title="1-Click xuất vận đơn và bàn giao GHN Express"
                              >
                                <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                                <span>1-Click GHN</span>
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => onUpdateStatus(order.code, "SHIPPING")}
                                className="h-8 px-2.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm gap-1.5 cursor-pointer"
                                title="Bàn giao shipper xuất phát giao hàng"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Giao hàng</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onUpdateStatus(order.code, "CANCELLED")}
                              className="h-8 px-2 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold rounded-xl gap-1 cursor-pointer"
                              title="Hủy đơn hàng trước khi shipper đến lấy"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Hủy</span>
                            </Button>
                          </>
                        )}

                        {/* 3. ĐANG VẬN CHUYỂN: SHIPPING / SHIPPED -> Bấm [Giao thành công ✓] | KHÓA HỦY ĐƠN */}
                        {isShipped && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => onUpdateStatus(order.code, "COMPLETED")}
                              className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm gap-1.5 cursor-pointer"
                              title="Xác nhận khách đã nhận hàng thành công"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Giao thành công</span>
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => onOpenTrackingModal(order)}
                              className="h-8 px-2 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm gap-1 cursor-pointer"
                              title="Xem tiến trình giao hàng thời gian thực"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Hành trình</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onOpenPrintShippingLabel(order)}
                              className="h-8 px-2 text-xs font-bold rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 gap-1 cursor-pointer"
                              title="In tem dán thùng hàng A6"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">In Tem</span>
                            </Button>
                          </>
                        )}

                        {/* 4. HOÀN THÀNH: COMPLETED -> Xem hành trình (nếu có vận đơn) */}
                        {isCompleted && order.trackingNumber && (
                          <Button
                            size="sm"
                            onClick={() => onOpenTrackingModal(order)}
                            className="h-8 px-2 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl shadow-xs gap-1 cursor-pointer"
                            title="Xem hành trình vận đơn đã giao"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Hành trình</span>
                          </Button>
                        )}

                        {/* 5. HOÀN TIỀN: REFUND_PENDING -> Xác nhận mã đối soát chuyển khoản */}
                        {isRefundPending && onConfirmRefund && (
                          <Button
                            size="sm"
                            onClick={() => onConfirmRefund(order.code)}
                            className="h-8 px-2.5 text-xs bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-sm gap-1.5 cursor-pointer animate-pulse"
                            title="Xác nhận đối soát hoàn tiền cho khách qua Ref Code"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Hoàn Tiền</span>
                          </Button>
                        )}

                        {/* 6. TRẢ HÀNG VỀ KHO: RETURNED -> Xác nhận nhập lại kho */}
                        {order.status === "RETURNED" && (
                          <Button
                            size="sm"
                            onClick={() => onUpdateStatus(order.code, "CANCELLED")}
                            className="h-8 px-2.5 text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-sm gap-1.5 cursor-pointer"
                            title="Xác nhận đã nhận hàng hoàn về kho"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Nhận hàng hoàn</span>
                          </Button>
                        )}

                        {/* 7. NÚT XEM CHI TIẾT ĐƠN HÀNG (LUÔN CÓ) */}
                        <Button
                          size="sm"
                          onClick={() => onSelectOrder(order)}
                          className="h-8 px-3 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
