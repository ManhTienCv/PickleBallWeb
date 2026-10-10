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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Lock,
  Clock,
  User,
  Phone,
  FileText,
  Wrench,
  Trophy,
  CreditCard,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  SelectedSlotItem,
  HoldType,
  CourtHoldItem,
  addCourtHolds,
} from './courtHoldTypes';

interface HoldSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slots: SelectedSlotItem[];
  onSuccess: (newHolds: CourtHoldItem[]) => void;
  onGoToPos: (firstSlot: SelectedSlotItem, customerName?: string, customerPhone?: string) => void;
}

export default function HoldSlotDialog({
  open,
  onOpenChange,
  slots,
  onSuccess,
  onGoToPos,
}: HoldSlotDialogProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [holdType, setHoldType] = useState<HoldType>('customer_hold');
  const [durationMinutes, setDurationMinutes] = useState<number>(10);
  const [note, setNote] = useState('');

  // Reset form when opened with new slots
  useEffect(() => {
    if (open) {
      setCustomerName('');
      setCustomerPhone('');
      setHoldType('customer_hold');
      setDurationMinutes(10);
      setNote('');
    }
  }, [open, slots]);

  if (!slots || slots.length === 0) return null;

  const totalAmount = slots.reduce((sum, s) => sum + s.price, 0);
  const isMulti = slots.length > 1;

  const handleTypeChange = (type: HoldType) => {
    setHoldType(type);
    if (type === 'maintenance') {
      if (!customerName || customerName === '') setCustomerName('Ban Quản Trị / Kỹ Thuật');
      if (!note) setNote('Bảo trì mặt sân / Lưới / Hệ thống chiếu sáng');
      setDurationMinutes(0); // permanent until released
    } else if (type === 'event') {
      if (!note) setNote('Giải đấu nội bộ / Sự kiện giao lưu CLB');
      setDurationMinutes(0);
    } else {
      if (customerName === 'Ban Quản Trị / Kỹ Thuật') setCustomerName('');
      if (note.includes('Bảo trì')) setNote('');
      setDurationMinutes(10);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error('Vui lòng nhập tên người giữ sân / đơn vị đặt chỗ!');
      return;
    }

    const newHoldEntries = slots.map((s) => ({
      courtId: s.courtId,
      courtName: s.courtName,
      date: s.date,
      time: s.time,
      price: s.price,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      note: note.trim() || (holdType === 'customer_hold' ? 'Khách hẹn thanh toán / cọc tiền' : 'Khóa quản trị'),
      holdType,
      durationMinutes,
      staffName: 'Lễ tân ca trực',
    }));

    const updated = addCourtHolds(newHoldEntries);

    const durationText = durationMinutes > 0 ? `${durationMinutes} phút` : 'Cả ngày (Khóa cố định)';
    toast.success(
      `🔒 Đã khóa giữ thành công ${slots.length} ca sân cho "${customerName.trim()}" (Thời hạn: ${durationText})!`,
      { duration: 4000 }
    );

    onSuccess(updated);
    onOpenChange(false);
  };

  const handleQuickPos = () => {
    onGoToPos(slots[0], customerName.trim() || undefined, customerPhone.trim() || undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white rounded-3xl p-6 font-sans shadow-2xl border border-slate-200">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {isMulti ? `Khóa Giữ Chỗ Hàng Loạt (${slots.length} Ca Sân)` : `Khóa Giữ Sân: ${slots[0]?.courtName}`}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Lưu lại thông tin khách, số điện thoại và thời hạn giữ chỗ để tránh xung đột lịch
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Slot summary card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Ngày: {slots[0]?.date}
              </span>
              <span className="text-emerald-700 font-extrabold text-sm">
                Tổng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/60 max-h-24 overflow-y-auto">
              {slots.map((s, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-white border-slate-200 text-slate-800 text-[11px] font-medium px-2 py-0.5 rounded-lg"
                >
                  {s.courtName} — <strong className="text-emerald-700 ml-1">{s.time}</strong>
                </Badge>
              ))}
            </div>
          </div>

          {/* Hold Type Radio Buttons */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Loại hình khóa giữ sân</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('customer_hold')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  holdType === 'customer_hold'
                    ? 'bg-amber-50/80 border-amber-400 text-amber-950 shadow-sm ring-1 ring-amber-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Khách Hẹn</span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">Giữ tạm 10 - 30p chờ cọc</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('event')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  holdType === 'event'
                    ? 'bg-purple-50/80 border-purple-400 text-purple-950 shadow-sm ring-1 ring-purple-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Trophy className="w-3.5 h-3.5 text-purple-600" />
                  <span>Giải Đấu / CLB</span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">Khóa cố định sự kiện</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('maintenance')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  holdType === 'maintenance'
                    ? 'bg-rose-50/80 border-rose-400 text-rose-950 shadow-sm ring-1 ring-rose-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Wrench className="w-3.5 h-3.5 text-rose-600" />
                  <span>Bảo Trì Kỹ Thuật</span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">Hỏng lưới / Sửa đèn</span>
              </button>
            </div>
          </div>

          {/* Customer / Entity Info (WHO) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tên khách hàng / Đơn vị <span className="text-rose-500">*</span></span>
              </Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="vd: Anh Tuấn, CLB Ba Đình..."
                className="h-9 text-xs rounded-xl border-slate-200"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Số điện thoại liên hệ</span>
              </Label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="09xx xxx xxx"
                className="h-9 text-xs rounded-xl border-slate-200"
              />
            </div>
          </div>

          {/* Duration Presets (HOW LONG) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Thời hạn tự động giữ chỗ (Sau thời gian này sẽ tự giải phóng)</span>
              </span>
              <span className="text-amber-700 font-extrabold text-[11px]">
                {durationMinutes === 0 ? 'Khóa cố định' : `${durationMinutes} phút`}
              </span>
            </Label>

            <div className="grid grid-cols-5 gap-1.5">
              {[
                { val: 10, label: '10 phút' },
                { val: 15, label: '15 phút' },
                { val: 30, label: '30 phút' },
                { val: 60, label: '1 giờ' },
                { val: 0, label: 'Cố định' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setDurationMinutes(opt.val)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    durationMinutes === opt.val
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-[#FAF8F5] text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note / Purpose (WHAT / WHY) */}
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Mục đích / Ghi chú</span>
            </Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="vd: Khách hẹn 10 phút sau ghé quầy cọc tiền, hoặc Giữ cho khách VIP"
              className="h-9 text-xs rounded-xl border-slate-200"
            />
          </div>

          <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleQuickPos}
              className="w-full sm:w-auto border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold rounded-xl h-10 gap-1.5"
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Nạp Luôn Vào POS Thu Tiền</span>
            </Button>

            <Button
              type="submit"
              className="w-full sm:flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl h-10 gap-2 shadow-md shadow-amber-500/20"
            >
              <Lock className="w-4 h-4" />
              <span>Xác Nhận Khóa Giữ {slots.length} Sân</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
