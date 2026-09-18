import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Order, OrderItem, CatalogProduct } from "@/types/order.types";

interface OrderEditPosDialogProps {
  editingOrder: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  catalog: CatalogProduct[];
  setEditingOrder: React.Dispatch<React.SetStateAction<Order | null>>;
}

export const OrderEditPosDialog: React.FC<OrderEditPosDialogProps> = ({
  editingOrder,
  isOpen,
  onClose,
  onSave,
  catalog,
  setEditingOrder,
}) => {
  const [searchProductQuery, setSearchProductQuery] = useState("");

  const filteredCatalog = useMemo(() => {
    if (!searchProductQuery.trim()) return catalog.slice(0, 6);
    return catalog.filter(
      (p) =>
        p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchProductQuery.toLowerCase())
    );
  }, [catalog, searchProductQuery]);

  if (!editingOrder) return null;

  const handleItemQtyChange = (itemId: number, delta: number) => {
    const updated = editingOrder.items
      .map((i) => (i.id === itemId ? { ...i, qty: i.qty + delta } : i))
      .filter((i) => i.qty > 0);
    const newTotal = updated.reduce((sum, i) => sum + i.price * i.qty, 0);
    setEditingOrder({ ...editingOrder, items: updated, totalAmount: newTotal });
  };

  const handleRemoveItem = (itemId: number) => {
    const updated = editingOrder.items.filter((i) => i.id !== itemId);
    const newTotal = updated.reduce((sum, i) => sum + i.price * i.qty, 0);
    setEditingOrder({ ...editingOrder, items: updated, totalAmount: newTotal });
    toast.info("Đã xóa sản phẩm khỏi hóa đơn!");
  };

  const handleAddProduct = (prod: CatalogProduct) => {
    const existing = editingOrder.items.find((i) => i.name === prod.name);
    const updatedItems: OrderItem[] = existing
      ? editingOrder.items.map((i) => (i.name === prod.name ? { ...i, qty: i.qty + 1 } : i))
      : [...editingOrder.items, { id: Date.now(), name: prod.name, qty: 1, price: prod.price }];
    const newTotal = updatedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    setEditingOrder({ ...editingOrder, items: updatedItems, totalAmount: newTotal });
    toast.success(`Đã thêm 1x "${prod.name}"!`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-white rounded-3xl p-6 font-sans">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-bold text-slate-900">
            Chỉnh Sửa Hóa Đơn Quầy #{editingOrder.code}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Tìm kiếm sản phẩm trong kho để thêm, sửa số lượng và in lại hóa đơn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1.5">
              <Label className="font-medium text-slate-700">Tên Khách Hàng:</Label>
              <Input
                value={editingOrder.customerName}
                onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                className="text-xs h-9 font-bold rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-medium text-slate-700">Thu Ngân:</Label>
              <Input
                value={editingOrder.staffName}
                disabled
                className="text-xs h-9 font-medium bg-slate-100 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <Label className="font-bold text-slate-800 text-xs">
              Sản phẩm hiện có ({editingOrder.items.length}):
            </Label>
            <div className="border rounded-2xl divide-y max-h-44 overflow-y-auto bg-slate-50/50">
              {editingOrder.items.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">Chưa có sản phẩm nào</div>
              ) : (
                editingOrder.items.map((item) => (
                  <div key={item.id} className="p-2.5 flex items-center justify-between text-xs bg-white">
                    <span className="font-semibold text-slate-800 truncate max-w-[220px]">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded-lg bg-slate-50">
                        <button
                          onClick={() => handleItemQtyChange(item.id, -1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 font-bold">{item.qty}</span>
                        <button
                          onClick={() => handleItemQtyChange(item.id, 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-emerald-600 w-24 text-right">
                        {new Intl.NumberFormat("vi-VN").format(item.price * item.qty)}đ
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1 text-[11px] font-bold"
                        title="Xóa"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <Label className="font-bold text-slate-800 text-xs">Tìm và thêm sản phẩm:</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Gõ tên sản phẩm, dịch vụ..."
                value={searchProductQuery}
                onChange={(e) => setSearchProductQuery(e.target.value)}
                className="pl-9 text-xs h-8 bg-white"
              />
            </div>
            <div className="max-h-36 overflow-y-auto divide-y border rounded-xl bg-white text-xs">
              {filteredCatalog.map((prod) => (
                <div key={prod.id} className="p-2 flex items-center justify-between hover:bg-emerald-50/50">
                  <div className="truncate pr-2">
                    <span className="font-bold text-slate-800 block truncate">{prod.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {prod.category} • {new Intl.NumberFormat("vi-VN").format(prod.price)}đ
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddProduct(prod)}
                    className="h-6 px-2 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    + Thêm
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t text-sm font-bold">
            <span>Tổng cộng:</span>
            <span className="text-emerald-600 text-base">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(editingOrder.totalAmount)}
            </span>
          </div>

          <DialogFooter className="flex flex-row gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl font-bold border-slate-300 text-xs"
            >
              Hủy
            </Button>
            <Button
              onClick={onSave}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl gap-1.5 shadow-md text-xs"
            >
              Lưu & In Bill Mới
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
