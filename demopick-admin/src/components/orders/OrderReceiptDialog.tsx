import React from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Order } from "@/types/order.types";

interface OrderReceiptDialogProps {
  receiptOrder: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderReceiptDialog: React.FC<OrderReceiptDialogProps> = ({
  receiptOrder,
  isOpen,
  onClose,
}) => {
  if (!receiptOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-white rounded-3xl p-6 font-sans shadow-2xl border border-slate-200">
        <div className="space-y-4">
          <div
            id="receipt-print-area"
            className="p-4 bg-[#FAF8F5] rounded-2xl border border-slate-200/90 text-xs font-mono text-slate-800 space-y-3"
          >
            <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
              <div className="font-bold text-sm text-slate-900 tracking-wider">DEMOPICK PICKLEBALL CLUB</div>
              <div className="text-[10px] text-slate-500 font-sans">123 Đường Pickleball, Quận 7, TP.HCM</div>
              <div className="text-[10px] text-slate-500 font-sans">Hotline: 0909 123 456</div>
              <div className="pt-2 font-bold text-xs text-slate-900 uppercase">
                {receiptOrder.posCategory === "court_service"
                  ? "PHIẾU THU TIỀN SÂN & DỊCH VỤ"
                  : "HÓA ĐƠN BÁN LẺ SẢN PHẨM"}
              </div>
              <div className="text-[11px] font-bold text-emerald-800">Mã HĐ: #{receiptOrder.code}</div>
              <div className="text-[10px] text-slate-500">{receiptOrder.createdAt}</div>
            </div>

            <div className="space-y-1 border-b border-dashed border-slate-300 pb-2.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Khách hàng:</span>
                <strong className="text-slate-900">{receiptOrder.customerName}</strong>
              </div>
              {receiptOrder.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Điện thoại:</span>
                  <span>{receiptOrder.customerPhone}</span>
                </div>
              )}
              {receiptOrder.courtInfo && (
                <div className="flex justify-between border-t border-dashed pt-1 mt-1 text-emerald-800">
                  <span className="text-slate-500 font-sans">Sân thi đấu:</span>
                  <strong className="font-sans">
                    {receiptOrder.courtInfo.courtName} ({receiptOrder.courtInfo.timeRange})
                  </strong>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Thu ngân:</span>
                <span>{receiptOrder.staffName}</span>
              </div>
            </div>

            <div className="space-y-2 border-b border-dashed border-slate-300 pb-2.5">
              <div className="grid grid-cols-12 font-bold text-[10px] text-slate-500 uppercase pb-0.5">
                <div className="col-span-6 font-sans">Mặt hàng</div>
                <div className="col-span-2 text-center">SL</div>
                <div className="col-span-4 text-right">T.Tiền</div>
              </div>
              {receiptOrder.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-[11px] items-start">
                  <div className="col-span-6 font-sans text-slate-900">{item.name}</div>
                  <div className="col-span-2 text-center font-bold">x{item.qty}</div>
                  <div className="col-span-4 text-right font-bold text-slate-900">
                    {new Intl.NumberFormat("vi-VN").format(item.price * item.qty)}đ
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1 border-b border-dashed border-slate-300 pb-2.5 text-xs">
              <div className="flex justify-between items-center font-bold text-sm pt-1 text-slate-900">
                <span className="font-sans">TỔNG CỘNG:</span>
                <span className="text-emerald-700">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                    receiptOrder.totalAmount
                  )}
                </span>
              </div>
            </div>

            <div className="pt-2 text-center space-y-1 text-[10px] text-slate-500 font-sans leading-tight">
              <div>Cảm ơn quý khách và hẹn gặp lại!</div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl text-xs font-bold border-slate-300"
            >
              Đóng
            </Button>
            <Button
              type="button"
              onClick={() => {
                window.print();
                toast.success(`Đã in Hóa đơn #${receiptOrder.code}!`);
                onClose();
              }}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md"
            >
              In Hóa Đơn (80mm)
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
