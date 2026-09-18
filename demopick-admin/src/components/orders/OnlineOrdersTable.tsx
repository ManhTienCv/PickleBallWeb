import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Zap, Navigation, Printer, Eye } from "lucide-react";
import { Order, OrderStatus } from "@/types/order.types";

interface OnlineOrdersTableProps {
  orders: Order[];
  onUpdateStatus: (orderCode: string, newStatus: OrderStatus) => void;
  onDispatchGHN: (order: Order) => void;
  onOpenTrackingModal: (order: Order) => void;
  onOpenPrintShippingLabel: (order: Order) => void;
  onSelectOrder: (order: Order) => void;
  isOrderPaid: (order: Order) => boolean;
}

export const OnlineOrdersTable: React.FC<OnlineOrdersTableProps> = ({
  orders,
  onUpdateStatus,
  onDispatchGHN,
  onOpenTrackingModal,
  onOpenPrintShippingLabel,
  onSelectOrder,
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
                const isShipped = order.status === "SHIPPED" || order.status === "SHIPPING";
                const isCompleted = order.status === "COMPLETED";
                const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
                const canDispatchGHN = !order.trackingNumber && !isCancelled && !isCompleted && !isShipped;

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

                    {/* 6. TRẠNG THÁI */}
                    <td className="py-4 px-4 align-top">
                      <div className="relative inline-block w-36">
                        <select
                          value={
                            order.status === "REFUNDED" || order.status === "CANCELLED"
                              ? "CANCELLED"
                              : order.status === "SHIPPED"
                              ? "SHIPPING"
                              : isPending
                              ? "PENDING"
                              : order.status
                          }
                          onChange={(e) => onUpdateStatus(order.code, e.target.value as OrderStatus)}
                          className={`w-full py-1.5 px-3 rounded-full text-xs font-bold border transition-colors cursor-pointer appearance-none text-center ${
                            isCancelled
                              ? "bg-rose-50 text-rose-600 border-rose-200"
                              : isCompleted
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isShipped
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          <option value="PENDING">Chờ xử lý</option>
                          <option value="READY_TO_PICK">Chờ lấy hàng</option>
                          <option value="PICKING">Đang lấy hàng</option>
                          <option value="SHIPPING">Đang giao</option>
                          <option value="COMPLETED">Thành công</option>
                          <option value="RETURNED">Hoàn hàng</option>
                          <option value="CANCELLED">Hủy đơn hàng</option>
                        </select>
                      </div>
                    </td>

                    {/* 7. TÁC VỤ */}
                    <td className="py-4 px-4 text-right align-top whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {canDispatchGHN && (
                          <Button
                            size="sm"
                            onClick={() => onDispatchGHN(order)}
                            className="h-8 px-2.5 text-xs bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-sm gap-1.5 cursor-pointer"
                            title="1-Click bàn giao xuất kho sang GHN Express"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                            <span>1-Click GHN</span>
                          </Button>
                        )}

                        {(isShipped || isCompleted || order.trackingNumber) && (
                          <>
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
