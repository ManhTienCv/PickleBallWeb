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

interface StaffCounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffModalTab: "restock" | "new_item";
  setStaffModalTab: (tab: "restock" | "new_item") => void;
  roleBaseProducts: InventoryProduct[];
  selectedStaffProductId: number | null;
  setSelectedStaffProductId: (id: number) => void;
  staffRestockQty: number | string;
  setStaffRestockQty: (qty: number | string) => void;
  onRestockSubmit: (e: React.FormEvent) => void;
  newStaffItemName: string;
  setNewStaffItemName: (v: string) => void;
  newStaffItemCategory: string;
  setNewStaffItemCategory: (v: string) => void;
  newStaffItemBrand: string;
  setNewStaffItemBrand: (v: string) => void;
  newStaffItemPrice: number | string;
  setNewStaffItemPrice: (v: number | string) => void;
  newStaffItemStock: number | string;
  setNewStaffItemStock: (v: number | string) => void;
  onCreateItemSubmit: (e: React.FormEvent) => void;
}

export const StaffCounterModal: React.FC<StaffCounterModalProps> = ({
  isOpen,
  onClose,
  staffModalTab,
  setStaffModalTab,
  roleBaseProducts,
  selectedStaffProductId,
  setSelectedStaffProductId,
  staffRestockQty,
  setStaffRestockQty,
  onRestockSubmit,
  newStaffItemName,
  setNewStaffItemName,
  newStaffItemCategory,
  setNewStaffItemCategory,
  newStaffItemBrand,
  setNewStaffItemBrand,
  newStaffItemPrice,
  setNewStaffItemPrice,
  newStaffItemStock,
  setNewStaffItemStock,
  onCreateItemSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-slate-200 font-sans shadow-2xl">
        <DialogHeader>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
            <PlusCircle className="h-5 w-5" />
          </div>
          <DialogTitle className="text-base font-bold text-slate-900">
            Quản Lý Hàng Hóa Quầy Lễ Tân
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-normal">
            Bổ sung số lượng tồn kho hoặc thêm món mới phục vụ tại quầy.
          </DialogDescription>
        </DialogHeader>

        {/* TAB SWITCHER */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setStaffModalTab("restock")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              staffModalTab === "restock"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Bổ sung số lượng
          </button>
          <button
            type="button"
            onClick={() => setStaffModalTab("new_item")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              staffModalTab === "new_item"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            + Thêm món quầy mới
          </button>
        </div>

        {staffModalTab === "restock" ? (
          <form onSubmit={onRestockSubmit} className="space-y-4 text-xs pt-1">
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800 text-xs">Chọn Mặt Hàng Cần Nhập Thêm (*):</Label>
              <select
                value={selectedStaffProductId || ""}
                onChange={(e) => setSelectedStaffProductId(Number(e.target.value))}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                required
              >
                {roleBaseProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Hiện có: {p.stock}) — {p.category}
                  </option>
                ))}
              </select>
            </div>

            {(() => {
              const target = roleBaseProducts.find((p) => p.id === Number(selectedStaffProductId));
              if (!target) return null;
              return (
                <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 text-emerald-900 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span>Tồn kho hiện tại:</span>
                    <strong className="text-sm font-bold text-emerald-700">{target.stock} đơn vị</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-emerald-200/50">
                    <span>Tồn sau khi nhập:</span>
                    <strong className="text-sm font-bold text-slate-900">
                      {target.stock + (Number(staffRestockQty) || 0)} đơn vị
                    </strong>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-2">
              <Label className="font-semibold text-slate-800 text-xs">Số Lượng Nhập Thêm Vào Kho (*):</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={formatNumberWithDots(staffRestockQty)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setStaffRestockQty(raw === "" ? "" : Number(raw));
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
                    onClick={() => setStaffRestockQty(qty)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      staffRestockQty === qty
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
        ) : (
          <form onSubmit={onCreateItemSubmit} className="space-y-3.5 text-xs pt-1">
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-800 text-xs">Tên Món Hàng Quầy (*):</Label>
              <Input
                value={newStaffItemName}
                onChange={(e) => setNewStaffItemName(e.target.value)}
                placeholder="Ví dụ: Nước dừa tươi, Bánh sừng bò, Thuê khăn tắm..."
                className="h-10 text-xs font-normal rounded-xl border-slate-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-800 text-xs">Phân Loại:</Label>
                <select
                  value={newStaffItemCategory}
                  onChange={(e) => setNewStaffItemCategory(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="Đồ uống & Đồ ăn">Đồ uống & Đồ ăn</option>
                  <option value="Thiết bị & Dịch vụ cho thuê">Thiết bị cho thuê</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-800 text-xs">Hãng / Nguồn Cung:</Label>
                <Input
                  value={newStaffItemBrand}
                  onChange={(e) => setNewStaffItemBrand(e.target.value)}
                  placeholder="Quầy sân / Nhà cung cấp"
                  className="h-10 text-xs font-normal rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-800 text-xs">Giá Bán Tại Quầy (đ):</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatNumberWithDots(newStaffItemPrice)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setNewStaffItemPrice(raw === "" ? "" : Number(raw));
                  }}
                  className="h-10 text-xs font-bold text-slate-900 rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-800 text-xs">Số Lượng Nhập Ban Đầu:</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatNumberWithDots(newStaffItemStock)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setNewStaffItemStock(raw === "" ? "" : Number(raw));
                  }}
                  className="h-10 text-xs font-bold text-emerald-700 rounded-xl border-slate-200"
                  required
                />
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
                Tạo Món & Nhập Kho
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
