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

interface PosQuickRestockModalProps {
  product: { name: string } | null;
  onClose: () => void;
  quickRestockQty: number;
  setQuickRestockQty: (qty: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  staffName?: string;
}

export default function PosQuickRestockModal({
  product,
  onClose,
  quickRestockQty,
  setQuickRestockQty,
  onSubmit,
  staffName = "Nhân Viên Lễ Tân",
}: PosQuickRestockModalProps) {
  if (!product) return null;

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white">
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-amber-500" />
              Lễ Tân Nhập Nhanh Nước / Đồ Ăn / Phụ Kiện Vào Quầy POS
            </DialogTitle>
            <DialogDescription>
              Bổ sung số lượng vừa nhận tại quầy cho: <strong>{product.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
            <p className="font-bold">Ghi nhật ký tự động (Audit Trail):</p>
            <p className="text-[11px]">
              Hệ thống ghi nhận: Lễ tân <strong>{staffName}</strong> nhập thêm +{quickRestockQty} sản phẩm vào lúc {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="font-bold text-slate-700">Số lượng vừa nhận thêm (*):</Label>
            <Input
              type="number"
              min={1}
              value={quickRestockQty}
              onChange={(e) => setQuickRestockQty(Number(e.target.value))}
              className="font-bold text-base text-emerald-600"
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="submit" className="w-full font-bold bg-emerald-600 hover:bg-emerald-500">
              Cộng Vào Quầy POS Ngay
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
