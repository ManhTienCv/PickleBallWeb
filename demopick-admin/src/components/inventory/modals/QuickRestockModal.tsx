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
import { PlusCircle } from "lucide-react";
import { formatNumberWithDots } from "@/lib/utils";
import type { InventoryProduct } from "@/pages/Inventory";

interface QuickRestockModalProps {
  product: InventoryProduct | null;
  isOpen: boolean;
  onClose: () => void;
  restockQty: number | string;
  setRestockQty: (v: number | string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const QuickRestockModal: React.FC<QuickRestockModalProps> = ({
  product,
  isOpen,
  onClose,
  restockQty,
  setRestockQty,
  onSubmit,
}) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-slate-200 font-sans shadow-2xl">
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <DialogHeader>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
              <PlusCircle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              Nhập Bổ Sung Tồn Kho
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-normal">
              Cập nhật số lượng mặt hàng: <strong className="font-medium text-slate-800">{product.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 text-emerald-900 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span>Tồn kho hiện tại:</span>
              <strong className="text-sm font-bold text-emerald-700">{formatNumberWithDots(product.stock)} đơn vị</strong>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-emerald-200/50">
              <span>Tồn sau khi nhập:</span>
              <strong className="text-sm font-bold text-slate-900">
                {formatNumberWithDots(product.stock + (Number(restockQty) || 0))} đơn vị
              </strong>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-slate-800 text-xs">Số Lượng Nhập Thêm Vào Kho (*):</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={formatNumberWithDots(restockQty)}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setRestockQty(val === "" ? "" : Number(val));
              }}
              className="font-bold text-base text-emerald-700 h-10 rounded-xl border-slate-200"
              required
            />

            {/* Quick Add Presets */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400 font-medium">Nhập nhanh:</span>
              {[5, 10, 24, 50, 100].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setRestockQty(qty)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    restockQty === qty
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  +{qty}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 px-4 rounded-xl text-xs font-medium border-slate-300"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              className="h-9 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-emerald-500/20"
            >
              Xác Nhận Nhập Kho
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
