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
import { FolderTree } from "lucide-react";
import type { CategoryItem } from "@/pages/Inventory";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: CategoryItem | null;
  catName: string;
  setCatName: (v: string) => void;
  catIconType: CategoryItem["iconType"];
  setCatIconType: (v: CategoryItem["iconType"]) => void;
  catDesc: string;
  setCatDesc: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  editingCategory,
  catName,
  setCatName,
  catIconType,
  setCatIconType,
  catDesc,
  setCatDesc,
  onSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-slate-200 font-sans shadow-2xl">
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <DialogHeader>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
              <FolderTree className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              {editingCategory ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-normal">
              Danh mục sẽ tự động đồng bộ sang Form nhập sản phẩm & Thanh lọc sản phẩm trên Website.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800 text-xs">Tên Danh Mục (*):</Label>
              <Input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Ví dụ: Vợt Pickleball, Giày thể thao..."
                className="h-10 text-xs font-normal rounded-xl border-slate-200"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800 text-xs">Loại Biểu Tượng (Icon):</Label>
              <select
                value={catIconType}
                onChange={(e) => setCatIconType(e.target.value as CategoryItem["iconType"])}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white font-normal focus:ring-2 focus:ring-emerald-500"
              >
                <option value="trophy">🏆 Cúp Thể Thao (Vợt / Giải đấu)</option>
                <option value="circle-dot">🎾 Quả Bóng (Bóng thi đấu)</option>
                <option value="shopping-bag">🛍️ Túi Đựng / Balo (Phụ kiện)</option>
                <option value="layers">👕 Trang Phục / Quần Áo</option>
                <option value="tag">🏷️ Thẻ Nhãn / Giày Thể Thao</option>
                <option value="coffee">☕ Đồ Uống & Đồ Ăn</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800 text-xs">Mô Tả Danh Mục:</Label>
              <textarea
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Mô tả tóm tắt đặc điểm của nhóm sản phẩm này..."
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
              className="h-9 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs"
            >
              {editingCategory ? "Lưu Cập Nhật" : "Tạo Danh Mục"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
