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
import { Clock } from "lucide-react";

export interface TargetCourtSession {
  id: number;
  name: string;
  rate?: number;
  available_minutes_until_next?: number | null;
  next_booking_time?: string | null;
}

interface PosStartSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetCourt: TargetCourtSession | null;
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (phone: string) => void;
  selectedDurationOption: number | null;
  onSelectDurationOption: (duration: number | null) => void;
  isStartingSession: boolean;
  onConfirm: () => void;
}

export default function PosStartSessionModal({
  open,
  onOpenChange,
  targetCourt,
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
  selectedDurationOption,
  onSelectDurationOption,
  isStartingSession,
  onConfirm,
}: PosStartSessionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 font-sans shadow-2xl border border-slate-200">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-700">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-emerald-700" />
            </div>
            <DialogTitle className="text-base font-extrabold text-slate-900">
              Bật Giờ Vào Sân — {targetCourt?.name}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Kích hoạt phiên chơi trực tiếp tại quầy. Lưới Web sẽ tự động khóa slot tương ứng.
          </DialogDescription>
        </DialogHeader>

        {targetCourt && (
          <div className="space-y-4 pt-2">
            {/* COURT INFO BANNER */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div>
                <span className="font-bold text-xs text-slate-900 block">{targetCourt.name}</span>
                <span className="text-[11px] text-slate-500">Pickleball Tiêu Chuẩn Indoor/Outdoor</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-emerald-700 block">
                  {new Intl.NumberFormat("vi-VN").format(targetCourt.rate || 140000)}đ/h
                </span>
                <span className="text-[10px] text-slate-400">Block 15 phút</span>
              </div>
            </div>

            {/* CUSTOMER INPUT */}
            <div className="space-y-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Tên khách hàng:</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={customerName}
                    onChange={(e) => onCustomerNameChange(e.target.value)}
                    placeholder="Nhập tên khách..."
                    className="text-xs h-9 bg-white"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onCustomerNameChange("Khách vãng lai")}
                    className="h-9 px-2 text-[11px] font-normal border-slate-300 shrink-0"
                  >
                    Vãng lai
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Số điện thoại (tùy chọn):</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => onCustomerPhoneChange(e.target.value)}
                  placeholder="VD: 0909 123 456..."
                  className="text-xs h-9 bg-white"
                />
              </div>
            </div>

            {/* DURATION PRESET CHIPS */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700">Thời lượng dự kiến:</Label>
                {selectedDurationOption ? (
                  <span className="text-[11px] font-bold text-emerald-700">
                    Dự kiến: {new Intl.NumberFormat("vi-VN").format(Math.round((selectedDurationOption / 60) * (targetCourt.rate || 140000)))}đ
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-500">Chơi mở (tính theo phút ra về)</span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onSelectDurationOption(null)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${selectedDurationOption === null
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                >
                  Chơi mở (Tự do)
                </button>
                <button
                  type="button"
                  onClick={() => onSelectDurationOption(30)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${selectedDurationOption === 30
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                >
                  30 phút
                </button>
                <button
                  type="button"
                  onClick={() => onSelectDurationOption(45)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${selectedDurationOption === 45
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                >
                  45 phút
                </button>
                <button
                  type="button"
                  onClick={() => onSelectDurationOption(60)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${selectedDurationOption === 60
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                >
                  60 phút (1h)
                </button>
                <button
                  type="button"
                  onClick={() => onSelectDurationOption(90)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${selectedDurationOption === 90
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                >
                  90 phút (1.5h)
                </button>
                <button
                  type="button"
                  onClick={() => onSelectDurationOption(120)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${selectedDurationOption === 120
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                >
                  120 phút (2h)
                </button>
              </div>

              {targetCourt.available_minutes_until_next && (
                <button
                  type="button"
                  onClick={() => onSelectDurationOption(targetCourt.available_minutes_until_next!)}
                  className={`w-full mt-1 p-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${selectedDurationOption === targetCourt.available_minutes_until_next
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                    }`}
                >
                  <span>Lấp khoảng trống: {targetCourt.available_minutes_until_next} phút (đến {targetCourt.next_booking_time})</span>
                </button>
              )}
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-xl text-xs font-normal border-slate-300"
              >
                Hủy
              </Button>
              <Button
                type="button"
                disabled={isStartingSession}
                onClick={onConfirm}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                {isStartingSession ? "Đang xử lý..." : "Bắt Đầu Tính Giờ"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
