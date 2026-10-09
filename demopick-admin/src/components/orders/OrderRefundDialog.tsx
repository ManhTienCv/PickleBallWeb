import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RotateCcw, CheckCircle2, RefreshCw } from "lucide-react";
import { Order } from "@/types/order.types";

interface OrderRefundDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  transId: string;
  onTransIdChange: (val: string) => void;
  note: string;
  onNoteChange: (val: string) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function OrderRefundDialog({
  order,
  isOpen,
  onClose,
  transId,
  onTransIdChange,
  note,
  onNoteChange,
  onConfirm,
  isLoading,
}: OrderRefundDialogProps) {
  if (!order) return null;

  const formattedAmount = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(order.totalAmount);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-6 rounded-2xl bg-white shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2.5 text-amber-600">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Xác Nhận Hoàn Tiền Đơn #{order.code}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Khách hàng: <span className="font-semibold text-slate-800">{order.customerName}</span> ({order.customerPhone})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Box tóm tắt tiền hoàn */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Số tiền cần hoàn:</span>
              <span className="text-sm font-extrabold text-rose-600 font-mono">
                {formattedAmount}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Phương thức gốc:</span>
              <span className="font-bold text-slate-800">{order.paymentMethod || "Online"}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="refund-trans-id" className="text-xs font-bold text-slate-700">
              Mã giao dịch đối soát (Bank / MoMo) <span className="text-rose-500">*</span>:
            </Label>
            <Input
              id="refund-trans-id"
              value={transId}
              onChange={(e) => onTransIdChange(e.target.value)}
              placeholder="Nhập mã FT... hoặc mã chuyển tiền"
              className="h-10 text-xs rounded-xl font-mono border-slate-200 focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-400">
              Mã này sẽ được lưu vào lịch sử đối soát hóa đơn của hệ thống.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="refund-note" className="text-xs font-bold text-slate-700">
              Ghi chú hoàn tiền:
            </Label>
            <Textarea
              id="refund-note"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Ghi chú nội bộ cho kế toán..."
              className="min-h-[70px] text-xs rounded-xl border-slate-200 focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl text-xs font-semibold"
          >
            Đóng
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading || !transId.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Xác Nhận Đã Hoàn Tiền</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
