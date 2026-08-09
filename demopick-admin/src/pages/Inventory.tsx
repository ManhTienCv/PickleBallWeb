import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { adminService, Product } from "@/services/admin.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Package,
  CheckCircle2,
  AlertTriangle,
  Plus,
  PackagePlus,
  History,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Coffee,
  Clock,
  ShieldCheck,
  Lock,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface InventoryLog {
  id: number;
  productName: string;
  sku: string;
  type: "in" | "out";
  changeQty: number;
  stockAfter: number;
  note: string;
  time: string;
}

const initialLogs: InventoryLog[] = [
  {
    id: 1,
    productName: "Nước Điện Giải Pocari Sweat 500ml",
    sku: "POC-500ML",
    type: "in",
    changeQty: 100,
    stockAfter: 120,
    note: "Lễ tân [Phạm Văn Đức] nhập bổ sung 100 chai Pocari Sweat vào lúc 10:15",
    time: "10:15 - 09/02/2026",
  },
  {
    id: 2,
    productName: "Dịch Vụ Cho Thuê Vợt Tập JOOLA (30k/giờ)",
    sku: "RENT-PAD-01",
    type: "in",
    changeQty: 20,
    stockAfter: 20,
    note: "Khai báo dịch vụ cố định cho thuê vợt theo giờ",
    time: "08:30 - 09/02/2026",
  },
  {
    id: 3,
    productName: "Vợt JOOLA Perseus 3S Carbon 16mm",
    sku: "JOO-PER3S-BLU-16MM",
    type: "in",
    changeQty: 15,
    stockAfter: 25,
    note: "Admin [Chủ Sân] nhập kho lô hàng mới từ hãng JOOLA",
    time: "14:30 - 08/02/2026",
  },
];

export default function Inventory() {
  const { user } = useAuth();
  const isStaffOnly = user?.roles?.includes("staff") && !user?.roles?.includes("admin") && !user?.roles?.includes("super_admin");

  const [search, setSearch] = useState("");
  const [activeTabCat, setActiveTabCat] = useState("Tất cả");

  // Dialog states
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [restockOpen, setRestockOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockActionType, setRestockActionType] = useState<"in" | "out">("in");
  const [restockQty, setRestockQty] = useState(20);
  const [restockNote, setRestockNote] = useState("Lễ tân nhập bổ sung lốc nước mới nhận tại quầy");

  // Form New Product
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("Nước & Đồ ăn");
  const [newProductItemType, setNewProductItemType] = useState<"product" | "drink_food" | "rental">("drink_food");
  const [newProductPrice, setNewProductPrice] = useState(20000);
  const [newProductSku, setNewProductSku] = useState("BEV-DRINK-01");
  const [newProductStock, setNewProductStock] = useState(50);
  const [newProductImage, setNewProductImage] = useState(
    "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600"
  );

  // Queries & local states
  const { data: initialProducts = [] } = useQuery({
    queryKey: ["admin-inventory-products"],
    queryFn: adminService.getProducts,
  });

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(initialLogs);

  const displayProducts = productsList.length > 0 ? productsList : initialProducts;

  const filteredProducts = displayProducts.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());

    let matchCat = true;
    if (activeTabCat === "Vợt") {
      matchCat = p.name.toLowerCase().includes("vợt") || p.category?.name?.includes("Vợt");
    } else if (activeTabCat === "Bóng") {
      matchCat = p.name.toLowerCase().includes("bóng") || p.category?.name?.includes("Bóng");
    } else if (activeTabCat === "Nước & Đồ ăn") {
      matchCat =
        p.item_type === "drink_food" ||
        p.category?.name?.includes("Nước") ||
        p.name.toLowerCase().includes("nước") ||
        p.name.toLowerCase().includes("bánh");
    } else if (activeTabCat === "Cho thuê đồ") {
      matchCat =
        p.item_type === "rental" ||
        p.category?.name?.includes("Cho thuê") ||
        p.name.toLowerCase().includes("thuê");
    } else if (activeTabCat === "Phụ kiện") {
      matchCat =
        p.category?.name?.includes("Phụ kiện") ||
        (!p.name.toLowerCase().includes("vợt") &&
          !p.name.toLowerCase().includes("bóng") &&
          p.item_type !== "drink_food" &&
          p.item_type !== "rental");
    }

    return matchSearch && matchCat;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStaffOnly) {
      toast.error("🔒 Quyền khai báo mặt hàng mới dành riêng cho Admin/Chủ Sân.");
      return;
    }
    if (!newProductName.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm / dịch vụ.");
      return;
    }

    const createdProduct: Product = {
      id: Date.now(),
      name: newProductName,
      slug: newProductName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-"),
      price: Number(newProductPrice),
      base_price: Number(newProductPrice),
      image_url: newProductImage || "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400",
      short_description: `${newProductCategory} - Phục vụ tại cụm sân Pickleball`,
      in_stock: Number(newProductStock) > 0,
      item_type: newProductItemType,
      category: { name: newProductCategory },
      variants: [
        {
          id: Date.now() + 1,
          sku: newProductSku || "SKU-GENERIC",
          color: "Mặc định",
          weight: "Tiêu chuẩn",
          option_name: newProductItemType === "rental" ? "Thời lượng" : "Quy cách",
          option_value: newProductItemType === "rental" ? "Theo Giờ" : "Tiêu chuẩn",
          price: Number(newProductPrice),
          stock_quantity: Number(newProductStock),
        },
      ],
    };

    setProductsList([createdProduct, ...displayProducts]);

    const newLog: InventoryLog = {
      id: Date.now(),
      productName: newProductName,
      sku: newProductSku || "SKU-GENERIC",
      type: "in",
      changeQty: Number(newProductStock),
      stockAfter: Number(newProductStock),
      note: `Admin [Chủ Sân] khai báo mặt hàng mới (${newProductCategory})`,
      time: new Date().toLocaleTimeString("vi-VN") + " - " + new Date().toLocaleDateString("vi-VN"),
    };
    setInventoryLogs([newLog, ...inventoryLogs]);

    toast.success(`Khai báo thành công: "${newProductName}"!`);
    setAddProductOpen(false);
    setNewProductName("");
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const isAllowStaff =
      selectedProduct.item_type === "drink_food" ||
      selectedProduct.category?.name?.includes("Nước") ||
      selectedProduct.category?.name?.includes("Đồ ăn");

    if (isStaffOnly && !isAllowStaff) {
      toast.error("🔒 Sản phẩm cao cấp giá trị lớn chỉ Admin/Chủ Sân mới có quyền cộng nhập kho.");
      return;
    }

    const changeNum = Number(restockQty);
    if (changeNum <= 0) {
      toast.error("Số lượng thao tác phải lớn hơn 0");
      return;
    }

    let finalStockAfter = 0;

    const updatedList = displayProducts.map((p) => {
      if (p.id === selectedProduct.id) {
        const updatedVariants = p.variants.map((v) => {
          const currentQty = v.stock_quantity;
          const newQty =
            restockActionType === "in" ? currentQty + changeNum : Math.max(0, currentQty - changeNum);
          finalStockAfter = newQty;
          return { ...v, stock_quantity: newQty };
        });
        return {
          ...p,
          in_stock: finalStockAfter > 0,
          variants: updatedVariants,
        };
      }
      return p;
    });

    setProductsList(updatedList);

    const nowTimeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    const logItem: InventoryLog = {
      id: Date.now(),
      productName: selectedProduct.name,
      sku: selectedProduct.variants?.[0]?.sku || selectedProduct.slug,
      type: restockActionType,
      changeQty: changeNum,
      stockAfter: finalStockAfter,
      note: isStaffOnly
        ? `Lễ tân [${user?.name || "Phạm Văn Đức"}] nhập bổ sung ${changeNum} ${selectedProduct.name} lúc ${nowTimeStr}`
        : restockNote || "Admin nhập kho thiết bị",
      time: nowTimeStr + " - " + new Date().toLocaleDateString("vi-VN"),
    };

    setInventoryLogs([logItem, ...inventoryLogs]);
    toast.success(
      `Đã ${restockActionType === "in" ? "cộng nhập kho" : "trừ xuất hủy"} thành công ${changeNum} đơn vị "${selectedProduct.name}"!`
    );
    setRestockOpen(false);
    setSelectedProduct(null);
  };

  return (
    <AppLayout
      title="Trung Tâm Quản Lý Kho & Phân Quyền Nhập Quầy"
      subtitle="Quản lý toàn bộ Thiết bị bán, Nước giải khát & Dịch vụ Cho thuê đồ cố định theo giờ"
      headerRight={
        isStaffOnly ? (
          <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold p-2 gap-1.5 text-xs">
            <Lock className="h-3.5 w-3.5 text-amber-600" />
            <span>🔒 Khai báo hàng mới: Dành riêng Admin</span>
          </Badge>
        ) : (
          <Button onClick={() => setAddProductOpen(true)} className="gap-2 font-bold bg-emerald-600 hover:bg-emerald-500">
            <Plus className="h-4 w-4" />
            <span>Thêm Hàng / Cho Thuê Đồ Mới</span>
          </Button>
        )
      }
    >
      <div className="space-y-6">
        {/* Smart Permission Alert Banner */}
        <Card className="p-4 bg-emerald-950 text-white border-emerald-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-emerald-300">
                Phương Án Phân Quyền Thông Minh (Smart Inventory Permission)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                <strong className="text-amber-300">Lễ Tân Quầy:</strong> Được tự do bấm nút <span className="text-emerald-400 font-bold">+ Nhập Quầy Nước/Bóng</span> để bán hàng liên tục cho khách. <strong className="text-red-300">Admin/Chủ Sân:</strong> Độc quyền khai báo sản phẩm mới & niêm yết giá vợt cao cấp.
              </p>
            </div>
          </div>
        </Card>

        {/* Upper Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase">Tổng Mặt Hàng & Dịch Vụ</p>
              <p className="text-xl font-black text-slate-900">{displayProducts.length} Mục</p>
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase">Tồn Kho Khả Dụng</p>
              <p className="text-xl font-black text-emerald-600">
                {displayProducts.reduce(
                  (total, p) => total + (p.variants?.reduce((s, v) => s + v.stock_quantity, 0) || 0),
                  0
                )}{" "}
                đơn vị
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase">Cảnh Báo Sắp Hết Hàng</p>
              <p className="text-xl font-black text-amber-600">
                {displayProducts.filter((p) => (p.variants?.[0]?.stock_quantity || 0) <= 5).length} Mục
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <History className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase">Lần Thao Tác Kho</p>
              <p className="text-xl font-black text-slate-900">{inventoryLogs.length} Giao dịch</p>
            </div>
          </Card>
        </div>

        {/* MAIN LAYOUT: Split 2 Halves (Cột Trái: Danh Mục Sản Phẩm | Cột Phải: Nhật Ký Kho & Thao Tác) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* NỬA 1 (BÊN TRÁI - 7 COLS): DANH MỤC & SẢN PHẨM */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tìm theo tên sản phẩm, mã SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 text-xs h-9"
                />
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {["Tất cả", "Nước & Đồ ăn", "Bóng", "Cho thuê đồ", "Vợt", "Phụ kiện"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTabCat(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      activeTabCat === cat
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.map((product) => {
                const stock = product.variants?.[0]?.stock_quantity || 0;
                const isAllowStaffRestock =
                  product.item_type === "drink_food" ||
                  product.category?.name?.includes("Nước") ||
                  product.category?.name?.includes("Đồ ăn");

                return (
                  <Card key={product.id} className="p-3.5 bg-white border-slate-200 hover:border-emerald-500 shadow-sm transition-all space-y-3 flex flex-col justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 border relative">
                        <img src={product.image_url || ""} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-700">
                          {product.category?.name || "Mặt hàng"}
                        </Badge>
                        <h4 className="font-bold text-xs text-slate-900 truncate">{product.name}</h4>
                        <p className="text-[11px] font-bold text-emerald-600">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 text-[11px]">Tồn kho:</span>
                        <strong className={`font-extrabold ${stock > 5 ? "text-emerald-700" : "text-amber-600"}`}>
                          {stock}
                        </strong>
                      </div>

                      {isAllowStaffRestock ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProduct(product);
                            setRestockActionType("in");
                            setRestockOpen(true);
                          }}
                          className="h-7 px-2 font-bold text-[11px] border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 gap-1"
                        >
                          <PlusCircle className="h-3 w-3 text-amber-600" />
                          <span>+ Nhập Quầy Nước/Bóng</span>
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-red-600 border-red-200 bg-red-50">
                          🔒 Khai báo / Giá: Admin
                        </Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* NỬA 2 (BÊN PHẢI - 5 COLS): NHẬT KÝ KIỂM KÊ VÀ GHI NHẬN HỆ THỐNG */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-4 bg-white border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <History className="h-4 w-4 text-emerald-600" />
                  Nhật Ký Thao Tác Kho & Lễ Tân Nhập Quầy
                </h3>
                <Badge variant="secondary" className="text-[10px]">Thời Gian Thực</Badge>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {inventoryLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span className="truncate max-w-[200px]">{log.productName}</span>
                      <Badge className={log.type === "in" ? "bg-emerald-600 text-[10px]" : "bg-red-600 text-[10px]"}>
                        {log.type === "in" ? `+${log.changeQty}` : `-${log.changeQty}`}
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-[11px] font-medium">{log.note}</p>
                    <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                      <span>Mã: {log.sku}</span>
                      <span>{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Modal Khai Báo Sản Phẩm Mới (Dành Cho Admin) */}
        <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
          <DialogContent className="max-w-md bg-white">
            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <PackagePlus className="h-5 w-5 text-emerald-600" />
                  Khai Báo Mặt Hàng / Cho Thuê Đồ Mới
                </DialogTitle>
                <DialogDescription>
                  Chỉ duy nhất Admin/Chủ Sân có quyền niêm yết sản phẩm mới và cài đặt giá
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="font-bold text-slate-700">Tên mặt hàng / dịch vụ (*):</Label>
                  <Input
                    placeholder="VD: Hộp 12 Bóng Franklin, Nước giải khát..."
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Danh mục:</Label>
                    <select
                      value={newProductCategory}
                      onChange={(e) => setNewProductCategory(e.target.value)}
                      className="w-full h-9 px-2 border rounded-lg font-semibold bg-white"
                    >
                      <option value="Nước & Đồ ăn">Nước & Đồ ăn</option>
                      <option value="Cho thuê đồ">Cho thuê đồ</option>
                      <option value="Bóng">Bóng Pickleball</option>
                      <option value="Vợt">Vợt Pickleball</option>
                      <option value="Phụ kiện">Phụ kiện</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Giá niêm yết (VNĐ):</Label>
                    <Input
                      type="number"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Mã SKU:</Label>
                    <Input
                      value={newProductSku}
                      onChange={(e) => setNewProductSku(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Số lượng khởi tạo (*):</Label>
                    <Input
                      type="number"
                      value={newProductStock}
                      onChange={(e) => setNewProductStock(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="submit" className="w-full font-bold bg-emerald-600 hover:bg-emerald-500">
                  Lưu Khai Báo Sản Phẩm Mới 🚀
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Thao Tác Nhập Quầy Nước / Bóng */}
        <Dialog open={restockOpen} onOpenChange={setRestockOpen}>
          <DialogContent className="max-w-md bg-white">
            {selectedProduct && (
              <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-amber-500" />
                    Lễ Tân Nhập Bổ Sung Quầy: {selectedProduct.name}
                  </DialogTitle>
                  <DialogDescription>
                    Ghi nhận trực tiếp khi shipper giao lốc nước uống hoặc bóng lẻ tại quầy
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Số lượng lốc/chai nhập thêm (*):</Label>
                    <Input
                      type="number"
                      min={1}
                      value={restockQty}
                      onChange={(e) => setRestockQty(Number(e.target.value))}
                      className="font-bold text-base text-emerald-600"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Ghi chú (Ghi nhật ký):</Label>
                    <Input
                      value={restockNote}
                      onChange={(e) => setRestockNote(e.target.value)}
                    />
                  </div>
                </div>

                <DialogFooter className="pt-2">
                  <Button type="submit" className="w-full font-bold bg-emerald-600 hover:bg-emerald-500">
                    Xác Nhận & Ghi Nhật Ký Nhập Quầy 🚀
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
