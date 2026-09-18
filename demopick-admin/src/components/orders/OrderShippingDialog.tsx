import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Zap } from "lucide-react";
import { Order } from "@/types/order.types";
import { shippingService, AVAILABLE_CARRIERS, ShippingCarrier } from "@/services/shipping.service";

interface OrderShippingDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  selectedCarrier: ShippingCarrier;
  setSelectedCarrier: (carrier: ShippingCarrier) => void;
  shippingWeightGram: number;
  setShippingWeightGram: (weight: number) => void;
  customDeliveryNote: string;
  setCustomDeliveryNote: (note: string) => void;
  onSubmit: () => void;
}

export const OrderShippingDialog: React.FC<OrderShippingDialogProps> = ({
  order,
  isOpen,
  onClose,
  selectedCarrier,
  setSelectedCarrier,
  shippingWeightGram,
  setShippingWeightGram,
  customDeliveryNote,
  setCustomDeliveryNote,
  onSubmit,
}) => {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-white rounded-3xl p-6 font-sans shadow-2xl border border-slate-200">
        <DialogHeader className="space-y-1">
          <div className="inline-flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl text-xs font-bold w-fit">
            <Truck className="w-4 h-4" />
            <span>Xuất Kho & Đẩy Đơn Vận Chuyển 3PL</span>
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Tạo Vận Đơn Giao Hàng — Đơn #{order.code}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Chọn đơn vị vận chuyển đối tác. Hệ thống tự động sinh mã vận đơn và lập hành trình giao hàng.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* RECEIVER SUMMARY BOX */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Người nhận:</span>
              <span className="font-bold text-slate-900">
                {order.customerName} {order.customerPhone ? `(${order.customerPhone})` : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Địa chỉ giao:</span>
              <span className="font-semibold text-slate-800 text-right max-w-[280px]">
                {order.shippingAddress || "Chưa cập nhật địa chỉ"}
              </span>
            </div>
            <div className="flex justify-between border-t pt-1.5 mt-1.5">
              <span className="text-slate-500">Kiện hàng:</span>
              <span className="font-medium text-slate-700">
                {order.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
              </span>
            </div>
          </div>

          {/* SELECT CARRIER */}
          <div className="space-y-2">
            <Label className="font-bold text-slate-800 text-xs flex items-center justify-between">
              <span>Chọn đối tác vận chuyển:</span>
              <span className="text-[11px] text-emerald-700 font-semibold">Tự động kết nối Sandbox API</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AVAILABLE_CARRIERS.map((c) => {
                const isSelected = selectedCarrier === c.id;
                const { fee, isFreeship } = shippingService.calculateShippingFee(
                  order.shippingAddress || "Hà Nội",
                  shippingWeightGram,
                  c.id,
                  order.totalAmount
                );

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCarrier(c.id)}
                    className={`p-3 rounded-2xl border-2 transition-colors cursor-pointer space-y-1 relative ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/40 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{c.name}</span>
                      <Badge className={`${c.badgeColor} font-bold text-[10px]`}>{c.shortName}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">{c.tagline}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-500">TG giao: <b className="text-slate-700">{c.estimatedTime}</b></span>
                      <span className="font-bold text-emerald-700">
                        {isFreeship ? "Miễn phí (Freeship)" : `${new Intl.NumberFormat("vi-VN").format(fee)}đ`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WEIGHT & DELIVERY NOTE */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="font-semibold text-slate-700 text-xs">Cân nặng gói hàng (gram):</Label>
              <Input
                type="number"
                value={shippingWeightGram}
                onChange={(e) => setShippingWeightGram(Number(e.target.value) || 500)}
                className="text-xs h-8 font-bold rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="font-semibold text-slate-700 text-xs">Ghi chú giao hàng:</Label>
              <Input
                value={customDeliveryNote}
                onChange={(e) => setCustomDeliveryNote(e.target.value)}
                className="text-xs h-8 font-medium rounded-xl"
              />
            </div>
          </div>

          {/* COD & SUMMARY */}
          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-amber-900 text-xs block">Tiền Thu Hộ (COD):</span>
              <span className="text-[11px] text-amber-700">
                {order.paymentMethod === "COD"
                  ? "Khách thanh toán tiền mặt khi nhận hàng"
                  : "Khách đã thanh toán trước qua VietQR / MoMo (Thu COD = 0đ)"}
              </span>
            </div>
            <span className="font-extrabold text-amber-800 text-sm">
              {order.paymentMethod === "COD"
                ? `${new Intl.NumberFormat("vi-VN").format(order.totalAmount)} đ`
                : "0 đ"}
            </span>
          </div>
        </div>

        <DialogFooter className="flex flex-row gap-2 justify-end pt-3 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl font-bold border-slate-300"
          >
            Hủy
          </Button>
          <Button
            onClick={onSubmit}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md gap-1.5"
          >
            <Zap className="w-4 h-4" />
            <span>Tạo Vận Đơn Tự Động</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
