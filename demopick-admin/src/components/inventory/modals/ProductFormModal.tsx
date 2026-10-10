import React, { useRef } from "react";
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
import {
  ShoppingBag,
  Store,
  Upload,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatNumberWithDots } from "@/lib/utils";
import type { InventoryProduct, CategoryItem, BrandItem } from "@/pages/Inventory";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: InventoryProduct | null;
  categories: CategoryItem[];
  brands: BrandItem[];
  formProductType: "online" | "pos";
  setFormProductType: (t: "online" | "pos") => void;
  formName: string;
  setFormName: (v: string) => void;
  formCategory: string;
  setFormCategory: (v: string) => void;
  formBrand: string;
  setFormBrand: (v: string) => void;
  formPrice: number | string;
  setFormPrice: (v: number | string) => void;
  formOriginalPrice: number | string;
  setFormOriginalPrice: (v: number | string) => void;
  formStock: number | string;
  setFormStock: (v: number | string) => void;
  formImage: string;
  setFormImage: (v: string) => void;
  formGallery: string[];
  setFormGallery: React.Dispatch<React.SetStateAction<string[]>>;
  formHighlights: string[];
  setFormHighlights: React.Dispatch<React.SetStateAction<string[]>>;
  formSpecs: { label: string; value: string }[];
  setFormSpecs: React.Dispatch<React.SetStateAction<{ label: string; value: string }[]>>;
  formDescription: string;
  setFormDescription: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  editingProduct,
  categories,
  brands,
  formProductType,
  setFormProductType,
  formName,
  setFormName,
  formCategory,
  setFormCategory,
  formBrand,
  setFormBrand,
  formPrice,
  setFormPrice,
  formOriginalPrice,
  setFormOriginalPrice,
  formStock,
  setFormStock,
  formImage,
  setFormImage,
  formGallery,
  setFormGallery,
  formHighlights,
  setFormHighlights,
  formSpecs,
  setFormSpecs,
  formDescription,
  setFormDescription,
  onSubmit,
}) => {
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const posCoverInputRef = useRef<HTMLInputElement | null>(null);

  // Helper nén ảnh client-side qua Canvas để tránh tràn quota dung lượng của localStorage
  const compressImageFile = (file: File, maxWidth = 800, quality = 0.75): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", quality));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh tối đa 5MB!");
      return;
    }
    const dataUrl = await compressImageFile(file);
    if (dataUrl) {
      setFormImage(dataUrl);
      toast.success("Đã tải ảnh đại diện lên thành công (đã tối ưu dung lượng)!");
    }
    e.target.value = "";
  };

  const handleCoverDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng tải tệp hình ảnh!");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh tối đa 5MB!");
      return;
    }
    const dataUrl = await compressImageFile(file);
    if (dataUrl) {
      setFormImage(dataUrl);
      toast.success("Đã tải ảnh đại diện lên thành công (đã tối ưu dung lượng)!");
    }
  };

  const handleGalleryFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Ảnh "${file.name}" vượt quá kích thước 5MB!`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const compressed = await Promise.all(validFiles.map((f) => compressImageFile(f)));
    const validUrls = compressed.filter(Boolean);
    if (validUrls.length > 0) {
      setFormGallery((prev) => [...prev, ...validUrls]);
      toast.success(`Đã thêm ${validUrls.length} ảnh vào bộ sưu tập (đã tối ưu dung lượng)!`);
    }

    e.target.value = "";
  };

  const handleGalleryDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`Tệp "${file.name}" không phải hình ảnh!`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Ảnh "${file.name}" vượt quá kích thước 5MB!`);
        return false;
      }
      return true;
    });

    const compressed = await Promise.all(validFiles.map((f) => compressImageFile(f)));
    const validUrls = compressed.filter(Boolean);
    if (validUrls.length > 0) {
      setFormGallery((prev) => [...prev, ...validUrls]);
      toast.success(`Đã thêm ${validUrls.length} ảnh vào bộ sưu tập (đã tối ưu dung lượng)!`);
    }
  };

  const handleRemoveGalleryImage = (idx: number) =>
    setFormGallery((prev) => prev.filter((_, i) => i !== idx));

  // Add/Remove Highlights & Specs Handlers
  const handleAddHighlight = () => setFormHighlights([...formHighlights, ""]);
  const handleUpdateHighlight = (idx: number, val: string) => {
    const updated = [...formHighlights];
    updated[idx] = val;
    setFormHighlights(updated);
  };
  const handleRemoveHighlight = (idx: number) =>
    setFormHighlights(formHighlights.filter((_, i) => i !== idx));

  const handleAddSpec = () => setFormSpecs([...formSpecs, { label: "", value: "" }]);
  const handleUpdateSpec = (idx: number, field: "label" | "value", val: string) => {
    const updated = [...formSpecs];
    updated[idx][field] = val;
    setFormSpecs(updated);
  };
  const handleRemoveSpec = (idx: number) => setFormSpecs(formSpecs.filter((_, i) => i !== idx));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto p-6 rounded-3xl border border-slate-200 font-sans shadow-2xl">
        <form onSubmit={onSubmit} className="space-y-5 text-xs">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-semibold text-slate-900">
                  {editingProduct ? "Chỉnh Sửa Mặt Hàng Kho" : "Thêm Mặt Hàng Mới Vào Kho"}
                </DialogTitle>
                <DialogDescription className="font-normal text-slate-500 text-xs mt-0.5">
                  Hệ thống sẽ đồng bộ thông tin và tồn kho ngay lập tức giữa Website & Quầy POS.
                </DialogDescription>
              </div>
            </div>

            {/* FORM TAB SWITCHER */}
            <div className="flex items-center gap-2 pt-3">
              <button
                type="button"
                onClick={() => {
                  setFormProductType("online");
                  if (!editingProduct && formCategory === "Đồ uống & Đồ ăn") {
                    setFormCategory(categories[0]?.name || "Vợt Pickleball");
                    setFormPrice("");
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer ${formProductType === "online"
                    ? "bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 font-normal"
                  }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Sản Phẩm Đăng Bán Online & Quầy (Vợt, bóng, phụ kiện...)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormProductType("pos");
                  if (!editingProduct && (formCategory === "Vợt Pickleball" || !formCategory)) {
                    setFormCategory("Đồ uống & Đồ ăn");
                    setFormPrice(20000);
                    setFormStock(24);
                    setFormImage("/images/pocari_sweat_500ml.jpg");
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer ${formProductType === "pos"
                    ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 font-normal"
                  }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Dịch Vụ Bán Tại Quầy (Đồ uống, thuê sân...)</span>
              </button>
            </div>
          </DialogHeader>

          {/* TAB CONTENT: ONLINE PRODUCTS */}
          {formProductType === "online" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="font-semibold text-slate-800">Tên Sản Phẩm (*):</Label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ví dụ: Vợt JOOLA Perseus 3S Carbon 16mm"
                    className="font-normal text-xs h-10 border-slate-200 rounded-xl"
                    required
                  />
                </div>

                {/* DYNAMIC CATEGORY DROPDOWN */}
                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-800">Danh Mục Sản Phẩm:</Label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white font-normal focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DYNAMIC BRAND DROPDOWN */}
                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-800">Hãng Sản Xuất / Thương Hiệu:</Label>
                  <select
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white font-normal focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.name}>
                        {brand.name} ({brand.origin})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-800">Giá Bán Niêm Yết (VNĐ) (*):</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatNumberWithDots(formPrice)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setFormPrice(raw === "" ? "" : Number(raw));
                    }}
                    placeholder="5.490.000"
                    className="font-normal text-xs h-10 border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-800">Giá Gốc / Giá Gạch (VNĐ):</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatNumberWithDots(formOriginalPrice)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setFormOriginalPrice(raw === "" ? "" : Number(raw));
                    }}
                    placeholder="5.990.000"
                    className="font-normal text-xs h-10 border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-800">Số Lượng Tồn Kho Ban Đầu (*):</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatNumberWithDots(formStock)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setFormStock(raw === "" ? "" : Number(raw));
                    }}
                    placeholder="15"
                    className="font-normal text-xs h-10 border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* 3. HÌNH ẢNH SẢN PHẨM (TẢI LÊN) */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <h4 className="text-emerald-700 font-bold text-xs uppercase tracking-wider">
                  3. HÌNH ẢNH SẢN PHẨM (TẢI LÊN)
                </h4>

                {/* ẢNH ĐẠI DIỆN CHÍNH (COVER IMAGE) */}
                <div className="space-y-2">
                  <Label className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                    ẢNH ĐẠI DIỆN CHÍNH (COVER IMAGE) *
                  </Label>

                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleCoverFileChange}
                    className="hidden"
                  />

                  <div
                    onClick={() => coverInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleCoverDrop}
                    className="border-2 border-dashed border-emerald-200/90 hover:border-emerald-500 bg-emerald-50/10 hover:bg-emerald-50/30 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all text-center relative group"
                  >
                    {formImage ? (
                      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-left">
                          <img
                            src={formImage}
                            alt="Ảnh đại diện"
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-emerald-200 shadow-sm"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">
                              Ảnh đại diện đã được tải lên
                            </span>
                            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng hiển thị trực quan
                            </span>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Nhấp chuột vào đây hoặc nút bên phải để đổi ảnh khác
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              coverInputRef.current?.click();
                            }}
                            className="text-xs h-8 rounded-xl border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-semibold cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                            Tải ảnh khác
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormImage("");
                            }}
                            className="text-xs h-8 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl border border-emerald-200/80 bg-white flex items-center justify-center text-emerald-600 shadow-sm mb-2 group-hover:scale-105 transition-transform">
                          <Upload className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="font-bold text-slate-800 text-xs sm:text-sm">
                          Bấm vào đây để tải ảnh đại diện lên *
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Hỗ trợ PNG, JPG, JPEG, WEBP (Tối đa 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* BỘ SƯU TẬP ẢNH CHI TIẾT (GALLERY) */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                      BỘ SƯU TẬP ẢNH CHI TIẾT (GALLERY)
                    </Label>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="text-emerald-700 hover:text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      + Tải thêm ảnh chi tiết
                    </button>
                  </div>

                  <input
                    ref={galleryInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleGalleryFilesChange}
                    className="hidden"
                  />

                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleGalleryDrop}
                    className="flex flex-wrap items-center gap-3 pt-1"
                  >
                    {/* Box + Thêm ảnh */}
                    <div
                      onClick={() => galleryInputRef.current?.click()}
                      className="w-24 h-24 border-2 border-dashed border-emerald-200/90 hover:border-emerald-500 bg-emerald-50/10 hover:bg-emerald-50/40 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all shrink-0 group"
                    >
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 mb-1 transition-colors" />
                      <span className="text-[11px] font-medium text-slate-600 group-hover:text-emerald-700 transition-colors">
                        + Thêm ảnh
                      </span>
                    </div>

                    {/* Danh sách ảnh trong Gallery */}
                    {formGallery.map((g, idx) => (
                      <div
                        key={idx}
                        className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group shrink-0"
                      >
                        <img
                          src={g}
                          alt={`Ảnh chi tiết ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-1.5 right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 shadow-md transition-all hover:scale-110 cursor-pointer"
                          title="Xóa ảnh này"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* HIGHLIGHTS */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold text-slate-800">Đặc Điểm Nổi Bật (Highlights):</Label>
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="text-[11px] text-emerald-700 hover:underline font-medium cursor-pointer"
                  >
                    + Thêm dòng nổi bật
                  </button>
                </div>
                {formHighlights.map((hl, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={hl}
                      onChange={(e) => handleUpdateHighlight(idx, e.target.value)}
                      placeholder="Ví dụ: Cảm biến Carbon T700 3S xoáy bóng 33%..."
                      className="text-xs h-8 border-slate-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(idx)}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* SPECS */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold text-slate-800">Thông Số Kỹ Thuật (Specs):</Label>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="text-[11px] text-emerald-700 hover:underline font-medium cursor-pointer"
                  >
                    + Thêm thông số
                  </button>
                </div>
                {formSpecs.map((spec, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={spec.label}
                      onChange={(e) => handleUpdateSpec(idx, "label", e.target.value)}
                      placeholder="Tên thông số (vd: Mặt vợt)"
                      className="text-xs h-8 w-1/3 border-slate-200 rounded-xl"
                    />
                    <Input
                      value={spec.value}
                      onChange={(e) => handleUpdateSpec(idx, "value", e.target.value)}
                      placeholder="Giá trị (vd: Carbon Fiber T700 3S)"
                      className="text-xs h-8 w-2/3 border-slate-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <Label className="font-semibold text-slate-800">Bài Viết Giới Thiệu & Mô Tả Chi Tiết:</Label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Nhập nội dung bài viết chi tiết để khách hàng xem trên trang Web..."
                  className="w-full h-24 p-3 border border-slate-200 rounded-xl text-xs font-normal focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB CONTENT: POS ONLY */}
          {formProductType === "pos" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="font-semibold text-slate-800">Tên Mặt Hàng / Dịch Vụ (*):</Label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ví dụ: Băng Quấn Cán Vợt Wilson Pro"
                    className="font-normal text-xs h-10 border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-800">Phân Loại Dịch Vụ:</Label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white font-normal cursor-pointer"
                  >
                    <option value="Đồ uống & Đồ ăn">Đồ uống & Đồ ăn</option>
                    <option value="Phụ kiện & Bao vợt">Phụ kiện & Bao vợt</option>
                    <option value="Bóng Pickleball">Bóng Pickleball</option>
                    <option value="Thuê vợt & máy">Thuê vợt & máy tập</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-800">Giá Bán Lễ Tân (VNĐ) (*):</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatNumberWithDots(formPrice)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setFormPrice(raw === "" ? "" : Number(raw));
                    }}
                    placeholder="20.000"
                    className="font-normal text-xs h-10 border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-800">Số Lượng Tồn Sẵn Tại Quầy (*):</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatNumberWithDots(formStock)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setFormStock(raw === "" ? "" : Number(raw));
                    }}
                    placeholder="100"
                    className="font-normal text-xs h-10 border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-800">Ghi Chú Đơn Vị Tính / Quy Cách:</Label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ghi chú quy cách đóng gói (Lốc 6 chai, chai 500ml...)"
                  className="w-full h-20 p-3 border border-slate-200 rounded-xl text-xs font-normal focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* HÌNH ẢNH MẶT HÀNG / ĐỒ UỐNG / DỊCH VỤ QUẦY (TẢI LÊN) */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                    HÌNH ẢNH MÓN / ĐỒ UỐNG / DỊCH VỤ QUẦY (TẢI LÊN) *
                  </Label>
                  <span className="text-[11px] text-blue-600 font-medium">
                    Hiển thị trực quan tại máy bán hàng POS
                  </span>
                </div>

                <input
                  ref={posCoverInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleCoverFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => posCoverInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleCoverDrop}
                  className="border-2 border-dashed border-blue-200/90 hover:border-blue-400 bg-blue-50/10 hover:bg-blue-50/30 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center relative group"
                >
                  {formImage ? (
                    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 text-left">
                        <img
                          src={formImage}
                          alt="Ảnh quầy POS"
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-blue-200 shadow-sm"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            Ảnh mặt hàng quầy đã được chọn
                          </span>
                          <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng bán tại quầy POS
                          </span>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Bấm chuột vào đây hoặc nút bên phải để đổi ảnh
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            posCoverInputRef.current?.click();
                          }}
                          className="text-xs h-8 rounded-xl border-blue-200 hover:bg-blue-50 text-blue-600 font-semibold cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                          Tải ảnh khác
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormImage("");
                          }}
                          className="text-xs h-8 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-11 h-11 rounded-2xl border border-blue-200/80 bg-white flex items-center justify-center text-blue-500 shadow-sm mb-2 group-hover:scale-105 transition-transform">
                        <Upload className="w-5 h-5 text-blue-500" />
                      </div>
                      <p className="font-bold text-slate-800 text-xs sm:text-sm">
                        Bấm vào đây để tải ảnh đồ uống / món ăn lên *
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Hỗ trợ PNG, JPG, JPEG, WEBP (Tối đa 5MB)
                      </p>
                    </>
                  )}
                </div>

                {/* GỢI Ý CHỌN NHANH ẢNH MẪU ĐỒ UỐNG / ĐỒ ĂN CÓ SẴN */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Hoặc chọn nhanh ảnh mẫu đồ uống / đồ ăn phổ biến:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "Pocari Sweat", url: "/images/pocari_sweat_500ml.jpg", icon: "" },
                      { name: "Revive chanh", url: "/images/revive_lemon_drink.jpg", icon: "" },
                      { name: "Bò húc", url: "/images/red_bull_can.jpg", icon: "" },
                      { name: "Nước LaVie", url: "/images/water_bottle_lavie.jpg", icon: "" },
                      { name: "Cà phê Cold Brew", url: "/images/cold_brew_coffee.jpg", icon: "" },
                      { name: "Trà chanh đá", url: "/images/iced_lemon_tea.jpg", icon: "" },
                      { name: "Dừa tươi", url: "/images/fresh_coconut.jpg", icon: "" },
                      { name: "Bánh Snickers", url: "/images/snickers_bar.jpg", icon: "" },
                      { name: "Thanh Granola", url: "/images/protein_granola_bar.jpg", icon: "" },
                      { name: "Chuối Dole", url: "/images/dole_banana.jpg", icon: "" },
                      { name: "Bóng Pickleball", url: "/images/pickleball_balls_yellow.jpg", icon: "" },
                      { name: "Băng quấn cán", url: "/images/pickleball_overgrip_tape.jpg", icon: "" },
                    ].map((item) => (
                      <button
                        key={item.url}
                        type="button"
                        onClick={() => {
                          setFormImage(item.url);
                          toast.success(`Đã áp dụng ảnh mẫu "${item.name}"!`);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${formImage === item.url
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                          }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODAL FOOTER */}
          <DialogFooter className="pt-4 border-t border-slate-100 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="font-normal text-xs h-10 px-5 rounded-xl border-slate-300 cursor-pointer"
            >
              Hủy bỏ
            </Button>

            <Button
              type="submit"
              className={`font-medium text-xs h-10 px-7 rounded-xl text-white shadow-md cursor-pointer ${formProductType === "online"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
                }`}
            >
              {editingProduct ? "Lưu Cập Nhật Mặt Hàng" : "Thêm Mặt Hàng Vào Kho"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
