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
import { Receipt } from "lucide-react";
import { toast } from "sonner";

interface PosShiftReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffName: string;
  shiftOrdersCount: number;
  shiftCashTotal: number;
  shiftTransferTotal: number;
  shiftTotalSum: number;
}

export default function PosShiftReportModal({
  open,
  onOpenChange,
  staffName,
  shiftOrdersCount,
  shiftCashTotal,
  shiftTransferTotal,
  shiftTotalSum,
}: PosShiftReportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-600" />
            Báo Cáo Bàn Giao Ca Trực Lễ Tân
          </DialogTitle>
          <DialogDescription>
            Thống kê tổng tiền thu trong ca trực của nhân viên: <strong>{staffName || "Nhân Viên Lễ Tân"}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-xs pt-2">
          <div className="p-3 bg-slate-50 rounded-xl border space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Nhân viên trực ca:</span>
              <strong className="text-slate-900">{staffName || "Phạm Văn Đức"}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Thời gian ca:</span>
              <strong className="text-slate-900">Hôm nay ({new Date().toLocaleDateString("vi-VN")})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tổng số hóa đơn xuất:</span>
              <strong className="text-emerald-700 font-bold">{shiftOrdersCount} Hóa đơn</strong>
            </div>
          </div>

          <div className="space-y-2 border-t pt-2">
            <div className="flex justify-between items-center p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="font-bold text-emerald-900">Tiền mặt thu tại quầy:</span>
              <strong className="text-emerald-700 text-sm">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(shiftCashTotal)}
              </strong>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-blue-50 rounded-lg border border-blue-200">
              <span className="font-bold text-blue-900">Chuyển khoản VietQR/MoMo:</span>
              <strong className="text-blue-700 text-sm">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(shiftTransferTotal)}
              </strong>
            </div>
          </div>

          <div className="p-3 bg-slate-900 text-white rounded-xl flex justify-between items-center">
            <span className="font-bold">Tổng doanh thu ca:</span>
            <strong className="text-lg font-black text-emerald-400">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(shiftTotalSum)}
            </strong>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            onClick={() => {
              toast.success("Đã gửi lệnh in Báo cáo bàn giao ca trực tới máy in quầy!");
              onOpenChange(false);
            }}
            className="w-full font-bold bg-emerald-600 hover:bg-emerald-500"
          >
            In Báo Cáo Bàn Giao Ca Trực
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
