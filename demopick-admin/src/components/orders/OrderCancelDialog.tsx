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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { Order } from "@/types/order.types";

interface OrderCancelDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  onReasonChange: (val: string) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function OrderCancelDialog({
  order,
  isOpen,
  onClose,
  reason,
  onReasonChange,
  onConfirm,
  isLoading,
}: OrderCancelDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl bg-white shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2.5 text-rose-600">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Xác Nhận Hủy Đơn Hàng #{order.code}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Khách hàng: <span className="font-semibold text-slate-800">{order.customerName}</span> ({order.customerPhone})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> Lưu ý quan trọng:
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Hủy đơn hàng sẽ tự động giải phóng giữ chỗ/kho hàng và gửi thông báo cập nhật trạng thái tới khách hàng.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cancel-reason" className="text-xs font-bold text-slate-700">
              Lý do hủy đơn hàng <span className="text-rose-500">*</span>:
            </Label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Nhập lý do hủy (VD: Khách đổi ý, hết hàng, không liên lạc được...)"
              className="min-h-[85px] text-xs rounded-xl border-slate-200 focus:ring-2 focus:ring-rose-500 resize-none"
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
            disabled={isLoading || !reason.trim()}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>Xác Nhận Hủy Đơn</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
