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
import { Tag } from "lucide-react";
import type { BrandItem } from "@/pages/Inventory";

interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBrand: BrandItem | null;
  brandName: string;
  setBrandName: (v: string) => void;
  brandOrigin: string;
  setBrandOrigin: (v: string) => void;
  brandDesc: string;
  setBrandDesc: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const BrandFormModal: React.FC<BrandFormModalProps> = ({
  isOpen,
  onClose,
  editingBrand,
  brandName,
  setBrandName,
  brandOrigin,
  setBrandOrigin,
  brandDesc,
  setBrandDesc,
  onSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-slate-200 font-sans shadow-2xl">
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <DialogHeader>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
              <Tag className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              {editingBrand ? "Chỉnh Sửa Thương Hiệu" : "Thêm Hãng / Thương Hiệu Mới"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-normal">
              Hãng mới sẽ xuất hiện trong Form thêm sản phẩm & Cột bộ lọc đa chọn thương hiệu trên Web.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800 text-xs">Tên Hãng / Thương Hiệu (*):</Label>
              <Input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Ví dụ: Diadem, Babolat, Wilson, Adidas..."
                className="h-10 text-xs font-normal rounded-xl border-slate-200"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800 text-xs">Quốc Gia / Xuất Xứ:</Label>
              <Input
                value={brandOrigin}
                onChange={(e) => setBrandOrigin(e.target.value)}
                placeholder="Ví dụ: Mỹ (USA), Đức, Pháp, Nhật Bản..."
                className="h-10 text-xs font-normal rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800 text-xs">Mô Tả Thương Hiệu:</Label>
              <textarea
                value={brandDesc}
                onChange={(e) => setBrandDesc(e.target.value)}
                placeholder="Thông tin giới thiệu về thương hiệu này..."
                className="w-full h-20 p-3 border border-slate-200 rounded-xl text-xs font-normal focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 px-4 rounded-xl text-xs font-normal"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="h-9 px-5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs"
            >
              {editingBrand ? "Lưu Cập Nhật" : "Tạo Hãng Mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
