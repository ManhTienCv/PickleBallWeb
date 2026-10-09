import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import type { InventoryProduct } from "@/pages/Inventory";

interface ProductPreviewModalProps {
  product: InventoryProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white max-h-[85vh] overflow-y-auto p-6 rounded-3xl border border-slate-200 font-sans">
        <div className="space-y-5 text-xs">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200 font-normal">
                {product.category}
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-normal">Hãng: {product.brand}</Badge>
            </div>
            <DialogTitle className="text-lg font-semibold text-slate-900 mt-1">
              {product.name}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <img src={product.image} alt={product.name} className="w-full h-52 rounded-2xl object-cover border" />
              <div className="flex gap-2 overflow-x-auto">
                {product.gallery?.map((g, idx) => (
                  <img key={idx} src={g} alt="" className="w-12 h-12 rounded-lg object-cover border shrink-0" />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-400 text-[11px] block">Giá bán niêm yết:</span>
                <span className="text-xl font-semibold text-emerald-700">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
                <div className="font-medium text-slate-900">Tình trạng tồn kho:</div>
                <p className="text-emerald-700 font-semibold text-sm">
                  {product.stock > 0 ? `Còn hàng (${product.stock} sản phẩm)` : "Hết hàng"}
                </p>
              </div>

              {product.highlights?.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-medium text-slate-900">Đặc điểm nổi bật:</div>
                  <ul className="space-y-1 text-slate-600 font-normal">
                    {product.highlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {product.specs?.length > 0 && (
            <div className="space-y-2 pt-3 border-t">
              <h4 className="font-medium text-slate-900 text-sm">Thông số kỹ thuật chi tiết</h4>
              <div className="border rounded-xl overflow-hidden divide-y">
                {product.specs.map((s, idx) => (
                  <div key={idx} className="grid grid-cols-12 p-2.5 bg-slate-50/50">
                    <span className="col-span-5 font-medium text-slate-700">{s.label}</span>
                    <span className="col-span-7 font-normal text-slate-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.description && (
            <div className="space-y-2 pt-3 border-t">
              <h4 className="font-medium text-slate-900 text-sm">Bài viết mô tả sản phẩm</h4>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border font-normal">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
