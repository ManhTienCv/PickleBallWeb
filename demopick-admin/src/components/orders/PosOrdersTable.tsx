import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/order.types";

interface PosOrdersTableProps {
  orders: Order[];
  totalCount: number;
  onViewOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
}

export const PosOrdersTable: React.FC<PosOrdersTableProps> = ({
  orders,
  totalCount,
  onViewOrder,
  onEditOrder,
  onPrintReceipt,
}) => {
  return (
    <Card className="p-6 border-slate-200/90 bg-white shadow-sm space-y-4 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-bold text-slate-900 text-base">Lịch Sử Hóa Đơn Bán Hàng & Thu Lễ Tân Tại Quầy</h3>
        <Badge variant="secondary" className="px-3 py-1 font-bold text-xs">
          {totalCount} Hóa Đơn POS
        </Badge>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
        <table className="w-full text-left border-collapse text-xs min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-200 font-semibold text-slate-500 uppercase bg-[#FAF8F5] tracking-wider text-[11px]">
              <th className="py-3.5 px-4">MÃ HĐ</th>
              <th className="py-3.5 px-4">PHÂN LOẠI</th>
              <th className="py-3.5 px-4">KHÁCH HÀNG</th>
              <th className="py-3.5 px-4">THU NGÂN</th>
              <th className="py-3.5 px-4">PTTT</th>
              <th className="py-3.5 px-4">TỔNG TIỀN</th>
              <th className="py-3.5 px-4">TRẠNG THÁI</th>
              <th className="py-3.5 px-4 text-right">TÁC VỤ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                  Không có hóa đơn nào phù hợp.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-slate-900">{order.code}</td>
                  <td className="py-4 px-4">
                    {order.posCategory === "court_service" ? (
                      <div className="space-y-0.5">
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                          Tiền sân & Dịch vụ
                        </Badge>
                        {order.courtInfo && (
                          <p className="text-[10px] text-slate-500 font-medium">{order.courtInfo.courtName}</p>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 font-bold text-[10px]">
                        Bán lẻ sản phẩm
                      </Badge>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">{order.customerName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{order.createdAt}</div>
                  </td>
                  <td className="py-4 px-4 font-bold text-emerald-800">{order.staffName}</td>
                  <td className="py-4 px-4 font-bold text-slate-700 uppercase">{order.paymentMethod}</td>
                  <td className="py-4 px-4 font-bold text-emerald-600 text-sm">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalAmount)}
                  </td>
                  <td className="py-4 px-4">
                    {order.status === "PAID" ? (
                      <Badge className="bg-emerald-600 font-bold text-white">Đã thanh toán</Badge>
                    ) : (
                      <Badge variant="destructive" className="font-bold">
                        Đã hoàn tiền
                      </Badge>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewOrder(order)}
                        className="h-7 px-2.5 text-[11px] font-bold rounded-lg border-slate-300"
                      >
                        Xem
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditOrder(order)}
                        className="h-7 px-2.5 text-[11px] text-amber-700 border-amber-300 hover:bg-amber-50 font-bold rounded-lg"
                      >
                        Sửa Đơn
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onPrintReceipt(order)}
                        className="h-7 px-2.5 text-[11px] font-bold rounded-lg border-slate-300"
                      >
                        In Bill
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
