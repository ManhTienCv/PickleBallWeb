import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { toast } from "sonner";

export interface POSReceiptData {
  code: string;
  customerName: string;
  customerPhone?: string;
  staffName: string;
  items: {
    variantId: number;
    productName: string;
    variantName: string;
    price: number;
    quantity: number;
    isCourtFee?: boolean;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  time: string;
}

interface PosReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: POSReceiptData | null;
}

export default function PosReceiptModal({
  open,
  onOpenChange,
  receipt,
}: PosReceiptModalProps) {
  if (!receipt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-white rounded-3xl p-6 font-sans shadow-2xl border border-slate-200">
        <div className="space-y-4">
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-slate-200/90 text-xs font-mono text-slate-800 space-y-3">
            {/* STORE HEADER */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
              <div className="font-extrabold text-sm text-slate-900 tracking-wider">DEMOPICK PICKLEBALL CLUB</div>
              <div className="text-[10px] text-slate-500 font-sans">123 Đường Pickleball, Quận 7, TP.HCM</div>
              <div className="text-[10px] text-slate-500 font-sans">Hotline: 0909 123 456 • www.demopick.vn</div>
              <div className="pt-2 font-bold text-xs text-slate-900 uppercase">
                PHIẾU THU TIỀN TẠI QUẦY
              </div>
              <div className="text-[11px] font-bold text-emerald-800">Mã HĐ: #{receipt.code}</div>
              <div className="text-[10px] text-slate-500">{receipt.time}</div>
            </div>

            {/* CUSTOMER & CASHIER INFO */}
            <div className="space-y-1 border-b border-dashed border-slate-300 pb-2.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Khách hàng:</span>
                <strong className="text-slate-900">
                  {receipt.customerName}
                  {receipt.customerPhone ? ` (${receipt.customerPhone})` : ""}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Kênh bán:</span>
                <span className="font-sans font-medium text-emerald-700">
                  {receipt.items.some((i) => i.isCourtFee) ? "POS Trả Sân & Dịch Vụ" : "POS Bán Lẻ Quầy"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Thu ngân:</span>
                <span>{receipt.staffName}</span>
              </div>
            </div>

            {/* ITEMS LIST */}
            <div className="space-y-2 border-b border-dashed border-slate-300 pb-2.5">
              <div className="grid grid-cols-12 font-bold text-[10px] text-slate-500 uppercase pb-0.5">
                <div className="col-span-6 font-sans">Mặt hàng / Sân</div>
                <div className="col-span-2 text-center">SL</div>
                <div className="col-span-4 text-right">T.Tiền</div>
              </div>
              {receipt.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-[11px] items-start">
                  <div className="col-span-6 font-sans text-slate-900 line-clamp-2">
                    {item.productName}
                    {item.isCourtFee && <span className="text-[10px] text-emerald-700 block font-bold">(Tiền Sân)</span>}
                  </div>
                  <div className="col-span-2 text-center font-bold">x{item.quantity}</div>
                  <div className="col-span-4 text-right font-bold text-slate-900">
                    {new Intl.NumberFormat("vi-VN").format(item.price * item.quantity)}đ
                  </div>
                </div>
              ))}
            </div>

            {/* TOTALS */}
            <div className="space-y-1 border-b border-dashed border-slate-300 pb-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600 font-sans">
                <span>Tạm tính:</span>
                <span>{new Intl.NumberFormat("vi-VN").format(receipt.subtotal)}đ</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 font-sans">
                <span>Phương thức:</span>
                <strong className="font-mono font-bold text-slate-800">{receipt.paymentMethod}</strong>
              </div>
              <div className="flex justify-between items-center font-extrabold text-sm pt-1 text-slate-900">
                <span className="font-sans">TỔNG THU:</span>
                <span className="text-emerald-700">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(receipt.total)}
                </span>
              </div>
            </div>

            {/* QR CHECK-IN TICKET */}
            <div className="pt-2 text-center space-y-2">
              <div className="inline-block p-2 bg-white rounded-xl border border-slate-300 shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=POS-${receipt.code}`}
                  alt="QR Checkin"
                  className="w-24 h-24 mx-auto"
                />
              </div>
              <div className="text-[10px] text-slate-500 font-sans leading-tight">
                Quét mã QR tại cổng kiểm soát hoặc lễ tân để check-in vào sân.
              </div>
              <div className="text-[10px] text-slate-400 font-sans italic">
                Cảm ơn quý khách và chúc quý khách thi đấu tuyệt vời!
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl text-xs font-normal border-slate-300"
            >
              Đóng
            </Button>
            <Button
              type="button"
              onClick={() => {
                window.print();
                toast.success(`Đã gửi lệnh in Phiếu Thu #${receipt.code} tới máy in nhiệt!`);
                onOpenChange(false);
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>In Hóa Đơn (80mm)</span>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
