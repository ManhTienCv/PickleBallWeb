import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { Order } from "@/types/order.types";

interface OrderDetailDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onDispatchGHN: (order: Order) => void;
}

export const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
  order,
  isOpen,
  onClose,
  onDispatchGHN,
}) => {
  if (!order) return null;

  const canDispatchGHN =
    !order.trackingNumber &&
    order.status !== "CANCELLED" &&
    order.status !== "REFUNDED" &&
    order.status !== "COMPLETED" &&
    order.type !== "POS Quầy";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white rounded-3xl p-6 font-sans">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-bold text-slate-900">
            Chi Tiết Hóa Đơn #{order.code}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Thời gian tạo: {order.createdAt} • Kênh: {order.type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Khách hàng:</span>
              <span className="font-bold text-slate-900">{order.customerName}</span>
            </div>
            {order.customerPhone && (
              <div className="flex justify-between">
                <span className="text-slate-500">Số điện thoại:</span>
                <span className="font-medium text-slate-900">{order.customerPhone}</span>
              </div>
            )}
            {order.shippingAddress && (
              <div className="flex justify-between border-t pt-1.5 mt-1.5">
                <span className="text-slate-500">Địa chỉ nhận:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[260px]">
                  {order.shippingAddress}
                </span>
              </div>
            )}
            {order.trackingNumber && (
              <div className="flex justify-between">
                <span className="text-slate-500">Mã vận đơn ({order.shippingCarrier || "3PL"}):</span>
                <span className="font-mono font-bold text-blue-700">{order.trackingNumber}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-1.5 mt-1.5">
              <span className="text-slate-500">Phương thức thanh toán:</span>
              <span className="font-bold text-slate-900">{order.paymentMethod}</span>
            </div>
          </div>

          <div className="border rounded-2xl divide-y overflow-hidden">
            <div className="p-2.5 bg-slate-100 font-bold text-slate-700 flex justify-between">
              <span>Mặt hàng / Dịch vụ</span>
              <span>Thành tiền</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="p-2.5 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {new Intl.NumberFormat("vi-VN").format(item.price)}đ x {item.qty}
                  </p>
                </div>
                <span className="font-bold text-emerald-600">
                  {new Intl.NumberFormat("vi-VN").format(item.price * item.qty)}đ
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2 border-t text-sm font-bold">
            <span>Tổng cộng thanh toán:</span>
            <span className="text-emerald-600 text-base">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalAmount)}
            </span>
          </div>
        </div>

        <DialogFooter className="pt-3 flex flex-row items-center justify-between gap-2">
          {canDispatchGHN ? (
            <Button
              size="sm"
              onClick={() => {
                onDispatchGHN(order);
                onClose();
              }}
              className="h-9 px-3 text-xs bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-sm gap-1.5 cursor-pointer"
              title="1-Click bàn giao xuất kho sang GHN Express"
            >
              <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
              <span>1-Click Giao GHN Express</span>
            </Button>
          ) : (
            <div />
          )}
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl font-bold border-slate-300 text-xs h-9 px-4"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
