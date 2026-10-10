import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  User,
  Phone,
  FileText,
  CreditCard,
  Unlock,
  PlusCircle,
  Copy,
  Check,
  AlertTriangle,
  Wrench,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  CourtHoldItem,
  removeCourtHold,
  extendCourtHold,
} from './courtHoldTypes';

interface HeldSlotDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hold: CourtHoldItem | null;
  onRelease: (updatedHolds: CourtHoldItem[]) => void;
  onGoToPos: (hold: CourtHoldItem) => void;
}

export default function HeldSlotDetailDialog({
  open,
  onOpenChange,
  hold,
  onRelease,
  onGoToPos,
}: HeldSlotDetailDialogProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!hold || hold.expiresAt === null) {
      setSecondsLeft(999999);
      return;
    }

    const calcRemaining = () => {
      const diff = Math.max(0, Math.floor((hold.expiresAt! - Date.now()) / 1000));
      setSecondsLeft(diff);
    };

    calcRemaining();
    const interval = setInterval(calcRemaining, 1000);
    return () => clearInterval(interval);
  }, [hold]);

  if (!hold) return null;

  const isPermanent = hold.expiresAt === null;
  const isExpired = !isPermanent && secondsLeft <= 0;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleCopyPhone = () => {
    if (!hold.customerPhone) return;
    navigator.clipboard.writeText(hold.customerPhone);
    setCopied(true);
    toast.success('Đã sao chép số điện thoại khách!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReleaseSlot = () => {
    const updated = removeCourtHold(hold.id);
    toast.success(`🔓 Đã giải phóng sân ${hold.courtName} (Khung ${hold.time}) về trạng thái trống!`);
    onRelease(updated);
    onOpenChange(false);
  };

  const handleExtendHold = () => {
    const target = extendCourtHold(hold.id, 10);
    if (target) {
      toast.success(`⏱️ Đã gia hạn thêm 10 phút cho ca giữ của "${hold.customerName}"!`);
      // Re-trigger dialog refresh
      setSecondsLeft((prev) => prev + 600);
    }
  };

  const handlePosPayment = () => {
    // When receptionist proceeds to POS, release the hold so it doesn't double-hold
    const updated = removeCourtHold(hold.id);
    onRelease(updated);
    onOpenChange(false);
    onGoToPos(hold);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 font-sans shadow-2xl border border-slate-200">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                hold.holdType === 'maintenance'
                  ? 'bg-rose-100 text-rose-600'
                  : hold.holdType === 'event'
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-amber-100 text-amber-600'
              }`}
            >
              {hold.holdType === 'maintenance' ? (
                <Wrench className="w-5 h-5" />
              ) : hold.holdType === 'event' ? (
                <Trophy className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Chi Tiết Ca Giữ: {hold.courtName} ({hold.time})
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {hold.date} — Sân Pickleball DemoPick
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Status and countdown banner */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              hold.holdType === 'maintenance'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : hold.holdType === 'event'
                ? 'bg-purple-50 border-purple-200 text-purple-900'
                : isExpired
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div>
              <span className="text-[11px] font-medium block">Trạng thái khóa:</span>
              <strong className="text-sm font-bold">
                {hold.holdType === 'maintenance'
                  ? '🛠️ Khóa Bảo Trì Kỹ Thuật'
                  : hold.holdType === 'event'
                  ? '🏆 Giải Đấu / Sự Kiện CLB'
                  : isExpired
                  ? '⚠️ Hết Hạn Giữ Chỗ'
                  : '⏱️ Tạm Giữ Chờ Khách'}
              </strong>
            </div>

            {!isPermanent && (
              <div className="text-right">
                <span className="text-[10px] text-amber-800 font-semibold block">Thời gian còn lại:</span>
                <span
                  className={`text-base font-mono font-extrabold px-2 py-0.5 rounded-lg ${
                    isExpired
                      ? 'bg-rose-200 text-rose-900'
                      : secondsLeft < 120
                      ? 'bg-rose-100 text-rose-700 animate-pulse'
                      : 'bg-amber-200/80 text-amber-950'
                  }`}
                >
                  {formattedCountdown}
                </span>
              </div>
            )}
          </div>

          {/* Details list */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Khách hàng / Đơn vị:
              </span>
              <strong className="text-slate-900 font-bold text-sm">{hold.customerName}</strong>
            </div>

            {hold.customerPhone && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Số điện thoại:
                </span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                  <span>{hold.customerPhone}</span>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                    title="Sao chép SĐT"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Mục đích / Ghi chú:
              </span>
              <span className="text-right text-slate-800 font-medium max-w-[220px]">
                {hold.note || 'Không có ghi chú'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-slate-500">Giá giờ sân:</span>
              <strong className="text-emerald-700 text-sm">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(hold.price)}
              </strong>
            </div>
          </div>

          <DialogFooter className="pt-2 flex flex-col gap-2">
            <Button
              onClick={handlePosPayment}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 rounded-xl text-xs gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Nạp Vào Hóa Đơn POS & Thu Tiền Ngay</span>
            </Button>

            <div className="grid grid-cols-2 gap-2">
              {!isPermanent && (
                <Button
                  onClick={handleExtendHold}
                  variant="outline"
                  className="border-amber-300 text-amber-800 hover:bg-amber-50 font-semibold h-10 rounded-xl text-xs gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Gia Hạn (+10p)</span>
                </Button>
              )}

              <Button
                onClick={handleReleaseSlot}
                variant="outline"
                className={`border-slate-300 text-rose-600 hover:bg-rose-50 font-semibold h-10 rounded-xl text-xs gap-1.5 cursor-pointer ${
                  isPermanent ? 'col-span-2' : ''
                }`}
              >
                <Unlock className="w-3.5 h-3.5 text-rose-600" />
                <span>Mở Khóa (Giải Phóng Sân)</span>
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
