import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Lock,
  CreditCard,
  X,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { SelectedSlotItem } from './courtHoldTypes';

interface MultiSlotToolbarProps {
  selectedSlots: SelectedSlotItem[];
  onClear: () => void;
  onOpenHoldDialog: () => void;
  onGoToPos: () => void;
}

export default function MultiSlotToolbar({
  selectedSlots,
  onClear,
  onOpenHoldDialog,
  onGoToPos,
}: MultiSlotToolbarProps) {
  if (selectedSlots.length === 0) return null;

  const totalAmount = selectedSlots.reduce((sum, s) => sum + s.price, 0);

  // Group by court for clean summary
  const grouped: Record<string, string[]> = {};
  selectedSlots.forEach((s) => {
    if (!grouped[s.courtName]) grouped[s.courtName] = [];
    grouped[s.courtName].push(s.time);
  });

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-3xl bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Info left */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Đã chọn:</span>
              <Badge className="bg-emerald-600 text-white font-extrabold text-xs px-2 py-0.5 rounded-md">
                {selectedSlots.length} Khung Giờ
              </Badge>
              <span className="text-slate-400 text-xs hidden sm:inline">|</span>
              <strong className="text-sm font-extrabold text-emerald-400">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
              </strong>
            </div>

            <p className="text-[11px] text-slate-400 truncate max-w-sm">
              {Object.entries(grouped)
                .map(([cName, times]) => `${cName} (${times.join(', ')})`)
                .join(' • ')}
            </p>
          </div>
        </div>

        {/* Action buttons right */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onClear}
            className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold h-9 px-2.5 rounded-xl cursor-pointer"
          >
            <X className="w-4 h-4 mr-1" />
            <span>Bỏ chọn</span>
          </Button>

          <Button
            type="button"
            onClick={onOpenHoldDialog}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold h-9 px-3.5 rounded-xl gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Khóa Giữ {selectedSlots.length} Ca</span>
          </Button>

          <Button
            type="button"
            onClick={onGoToPos}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-9 px-3.5 rounded-xl gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Nạp Vào POS</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
