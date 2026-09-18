import React from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, QrCode } from "lucide-react";
import { toast } from "sonner";
import { ShippingOrderInfo } from "@/services/shipping.service";

interface OrderShippingLabelDialogProps {
  shippingLabelInfo: ShippingOrderInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderShippingLabelDialog: React.FC<OrderShippingLabelDialogProps> = ({
  shippingLabelInfo,
  isOpen,
  onClose,
}) => {
  if (!shippingLabelInfo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 font-sans shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="space-y-4">
          {/* PRINTABLE AREA */}
          <div
            id="shipping-label-a6"
            className="p-4 bg-white rounded-2xl border-2 border-slate-900 text-xs font-sans text-slate-900 space-y-3 shadow-xs"
          >
            {/* LABEL HEADER */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2.5">
              <div>
                <div className="font-extrabold text-base tracking-wider text-slate-900">
                  {shippingLabelInfo.carrier} EXPRESS
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">
                  Dịch vụ: {shippingLabelInfo.serviceType}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                  {shippingLabelInfo.trackingNumber}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{shippingLabelInfo.createdAt}</div>
              </div>
            </div>

            {/* BARCODE & QR SIMULATION */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-400">
              <div className="space-y-1">
                {/* CSS Barcode lines simulation */}
                <div className="flex items-center gap-[2px] h-8 overflow-hidden">
                  {[4, 2, 6, 1, 3, 5, 2, 4, 1, 6, 2, 3, 5, 1, 4, 2, 6, 3, 1, 5, 2, 4, 6, 1, 3, 2, 5, 4, 1, 6, 3, 2, 5].map(
                    (w, i) => (
                      <div key={i} className="bg-slate-900 h-full" style={{ width: `${w}px` }} />
                    )
                  )}
                </div>
                <div className="font-mono text-center text-[10px] tracking-widest font-bold">
                  *{shippingLabelInfo.trackingNumber}*
                </div>
              </div>
              <div className="w-12 h-12 border border-slate-400 rounded-lg p-1 bg-white flex items-center justify-center shrink-0">
                <QrCode className="w-10 h-10 text-slate-900" />
              </div>
            </div>

            {/* SENDER & RECEIVER */}
            <div className="grid grid-cols-2 gap-2 border-b border-slate-300 pb-2 text-[11px]">
              <div className="space-y-0.5 pr-2 border-r border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Người gửi:</span>
                <p className="font-bold text-slate-900">{shippingLabelInfo.senderName}</p>
                <p className="text-[10px] text-slate-600 leading-tight">{shippingLabelInfo.senderAddress}</p>
                <p className="text-[10px] font-mono text-slate-700">Hotline: {shippingLabelInfo.senderPhone}</p>
              </div>
              <div className="space-y-0.5 pl-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Người nhận:</span>
                <p className="font-bold text-slate-900">{shippingLabelInfo.receiverName}</p>
                <p className="text-[10px] text-slate-700 leading-tight font-semibold">
                  {shippingLabelInfo.receiverAddress}
                </p>
                <p className="text-[10px] font-mono text-slate-900 font-bold">
                  ĐT: {shippingLabelInfo.receiverPhone}
                </p>
              </div>
            </div>

            {/* ITEMS SUMMARY */}
            <div className="border-b border-slate-300 pb-2 text-[11px] space-y-1">
              <div className="flex justify-between font-bold text-[10px] text-slate-500 uppercase">
                <span>Nội dung hàng hoá</span>
                <span>Khối lượng: {shippingLabelInfo.weightGram}g</span>
              </div>
              <p className="font-medium text-slate-900 leading-tight">{shippingLabelInfo.itemsSummary}</p>
            </div>

            {/* COD AMOUNT & NOTES */}
            <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Tiền thu hộ COD:</span>
                <span className="font-extrabold text-base text-slate-900">
                  {shippingLabelInfo.codAmount > 0
                    ? `${new Intl.NumberFormat("vi-VN").format(shippingLabelInfo.codAmount)} đ`
                    : "ĐÃ THANH TOÁN (0đ)"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Chữ ký người nhận</span>
                <div className="text-[9px] text-slate-400 italic mt-4">(Ký và ghi rõ họ tên)</div>
              </div>
            </div>

            {/* FOOTER NOTE */}
            <div className="text-[10px] text-slate-500 text-center leading-tight pt-1">
              Ghi chú: {shippingLabelInfo.deliveryNote}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
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
                toast.success(`Đã xuất lệnh in tem vận đơn ${shippingLabelInfo.trackingNumber}!`);
                onClose();
              }}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Phiếu A6 (Thermal)</span>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
