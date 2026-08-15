import { useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  Sparkles,
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

  // Pagination for Product Grid in Inventory
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Dialog states
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [restockOpen, setRestockOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockActionType, setRestockActionType] = useState<"in" | "out">("in");
  const [restockQty, setRestockQty] = useState(20);
  const [restockNote, setRestockNote] = useState("Lễ tân nhập bổ sung lốc nước mới nhận tại quầy");

  // Form New Product - Clean Empty States (No pre-filled text)
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("Vợt");
  const [newProductItemType, setNewProductItemType] = useState<"product" | "drink_food" | "rental">("product");
  const [newProductPrice, setNewProductPrice] = useState<number | "">("");
  const [newProductSku, setNewProductSku] = useState("");
  const [newProductStock, setNewProductStock] = useState<number | "">("");
  const [newProductImage, setNewProductImage] = useState(
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600"
  );

  // Technical Specifications & Description Form state - Clean Empty States
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newProductMaterial, setNewProductMaterial] = useState("");
  const [newProductThickness, setNewProductThickness] = useState("");
  const [newProductWeight, setNewProductWeight] = useState("");
  const [newProductUsapa, setNewProductUsapa] = useState(true);

  // Auto Generate Unique SKU dynamically from product name & category
  const [skuSeed, setSkuSeed] = useState(() => Math.floor(1000 + Math.random() * 9000));

  useEffect(() => {
    const catCode = newProductCategory.includes('Vợt') ? 'VOT' : newProductCategory.includes('Bóng') ? 'BONG' : newProductCategory.includes('Phụ kiện') ? 'PHU' : newProductCategory.includes('Nước') ? 'BEV' : 'REN';
    if (newProductName.trim()) {
      const nameClean = newProductName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]/g, "")
        .toUpperCase();
      const prefix = nameClean.substring(0, 6) || 'ITEM';
      setNewProductSku(`${catCode}-${prefix}-${skuSeed}`);
    } else {
      setNewProductSku(`${catCode}-ITEM-${skuSeed}`);
    }
  }, [newProductName, newProductCategory, skuSeed]);

  // Queries & local states
  const { data: initialProducts = [] } = useQuery({
    queryKey: ["admin-inventory-products"],
    queryFn: adminService.getProducts,
  });

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(initialLogs);

  const displayProducts = productsList.length > 0 ? productsList : initialProducts;

  // Reset page when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTabCat]);

  const filteredProducts = displayProducts.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());

    let matchCat = true;
    if (activeTabCat === "Vợt") {
      matchCat = p.name.toLowerCase().includes("vợt") || Boolean(p.category?.name?.includes("Vợt"));
    } else if (activeTabCat === "Bóng") {
      matchCat = p.name.toLowerCase().includes("bóng") || Boolean(p.category?.name?.includes("Bóng"));
    } else if (activeTabCat === "Nước & Đồ ăn") {
      matchCat =
        p.item_type === "drink_food" ||
        Boolean(p.category?.name?.includes("Nước")) ||
        p.name.toLowerCase().includes("nước") ||
        p.name.toLowerCase().includes("bánh");
    } else if (activeTabCat === "Cho thuê đồ") {
      matchCat =
        p.item_type === "rental" ||
        Boolean(p.category?.name?.includes("Cho thuê")) ||
        p.name.toLowerCase().includes("thuê");
    } else if (activeTabCat === "Phụ kiện") {
      matchCat =
        Boolean(p.category?.name?.includes("Phụ kiện")) ||
        (!p.name.toLowerCase().includes("vợt") &&
          !p.name.toLowerCase().includes("bóng") &&
          p.item_type !== "drink_food" &&
          p.item_type !== "rental");
    }

    return matchSearch && matchCat;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm / dịch vụ.");
      return;
    }

    if (isStaffOnly && newProductCategory !== "Nước & Đồ ăn") {
      toast.error("Lễ tân chỉ được phép khai báo thêm Nước uống & Đồ ăn bán tại quầy POS. Khai báo Vợt & Thiết bị cao cấp do Admin quản lý.");
      return;
    }

    // 🟢 SMART AUTO-MERGE: nếu sản phẩm đã có sẵn, cộng dồn số lượng chứ không nhân đôi
    const existingIndex = displayProducts.findIndex(
      (p) => p.name.toLowerCase().trim() === newProductName.toLowerCase().trim()
    );

    if (existingIndex !== -1) {
      const existing = displayProducts[existingIndex];
      const addedQty = Number(newProductStock) || 1;
      const updatedList = displayProducts.map((p, idx) => {
        if (idx === existingIndex) {
          const updatedVariants = (p.variants || []).map((v) => ({
            ...v,
            stock_quantity: (v.stock_quantity || 0) + addedQty,
          }));
          const finalStock = updatedVariants[0]?.stock_quantity || addedQty;
          return {
            ...p,
            price: Number(newProductPrice) || p.price,
            in_stock: finalStock > 0,
            variants: updatedVariants,
            description: newProductDescription || p.description,
          };
        }
        return p;
      });

      adminService.adjustStock(existing.id, addedQty, 'in', 'Tự động gộp cộng dồn sản phẩm').catch(() => { });

      setProductsList(updatedList);
      localStorage.setItem("demopick_synced_products", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("storage"));

      const nowTimeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      const mergeLog: InventoryLog = {
        id: Date.now(),
        productName: existing.name,
        sku: existing.variants?.[0]?.sku || newProductSku,
        type: "in",
        changeQty: addedQty,
        stockAfter: (existing.variants?.[0]?.stock_quantity || 0) + addedQty,
        note: `Tự động gộp cộng dồn +${addedQty} sản phẩm sẵn có vào kho`,
        time: nowTimeStr + " - " + new Date().toLocaleDateString("vi-VN"),
      };
      setInventoryLogs([mergeLog, ...inventoryLogs]);

      toast.success(`Sản phẩm "${existing.name}" đã có sẵn! Đã tự động GỘP & CỘNG DỒN +${addedQty} vào tồn kho!`);
      setAddProductOpen(false);
      setNewProductName("");
      setSkuSeed(Math.floor(1000 + Math.random() * 9000));
      return;
    }

    const payload = {
      name: newProductName,
      price: Number(newProductPrice),
      short_description: newProductDescription || `${newProductCategory} - Phục vụ tại quầy POS & Web`,
      description: newProductDescription || `${newProductCategory} - Phục vụ tại quầy POS & Web`,
      image_url: newProductImage || "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400",
      sku: newProductSku || "SKU-BEV-NEW",
      stock_quantity: Number(newProductStock),
      item_type: isStaffOnly ? "drink_food" : newProductItemType,
      category: { name: newProductCategory },
      specs: {
        material: newProductMaterial,
        thickness: newProductThickness,
        weight: newProductWeight,
        usapa_certified: newProductUsapa,
        origin: "Chính Hãng 100%",
      },
    };

    // Async call API to persist in backend database
    adminService.createProduct(payload as any).then((createdApiProduct) => {
      const createdProduct: Product = {
        ...createdApiProduct,
        id: createdApiProduct.id || Date.now(),
        name: newProductName,
        price: Number(newProductPrice),
        base_price: Number(newProductPrice),
        image_url: newProductImage || createdApiProduct.image_url || "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400",
        short_description: newProductDescription || `${newProductCategory} - Phục vụ tại quầy POS & Web`,
        description: newProductDescription || `${newProductCategory} - Phục vụ tại quầy POS & Web`,
        in_stock: Number(newProductStock) > 0,
        item_type: (isStaffOnly ? "drink_food" : newProductItemType) as any,
        category: { name: newProductCategory },
        variants: [
          {
            id: Date.now() + 1,
            sku: newProductSku || "SKU-BEV-NEW",
            color: "Mặc định",
            weight: "Tiêu chuẩn",
            option_name: "Quy cách",
            option_value: "Chai/Lốc",
            price: Number(newProductPrice),
            stock_quantity: Number(newProductStock),
          },
        ],
      };

      const updated = [createdProduct, ...displayProducts];
      setProductsList(updated);
      localStorage.setItem("demopick_synced_products", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    }).catch(() => { });

    const createdProductFallback: Product = {
      id: Date.now(),
      name: newProductName,
      slug: newProductName.toLowerCase().replace(/\s+/g, "-"),
      price: Number(newProductPrice),
      base_price: Number(newProductPrice),
      image_url: newProductImage || "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400",
      short_description: newProductDescription || `${newProductCategory} - Phục vụ tại quầy POS & Web`,
      description: newProductDescription || `${newProductCategory} - Phục vụ tại quầy POS & Web`,
      in_stock: Number(newProductStock) > 0,
      item_type: (isStaffOnly ? "drink_food" : newProductItemType) as any,
      category: { name: newProductCategory },
      variants: [
        {
          id: Date.now() + 1,
          sku: newProductSku || "SKU-BEV-NEW",
          color: "Mặc định",
          weight: "Tiêu chuẩn",
          option_name: "Quy cách",
          option_value: "Chai/Lốc",
          price: Number(newProductPrice),
          stock_quantity: Number(newProductStock),
        },
      ],
    };

    const updated = [createdProductFallback, ...displayProducts];
    setProductsList(updated);
    localStorage.setItem("demopick_synced_products", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));

    const nowTimeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const newLog: InventoryLog = {
      id: Date.now(),
      productName: newProductName,
      sku: newProductSku || "SKU-BEV-NEW",
      type: "in",
      changeQty: Number(newProductStock),
      stockAfter: Number(newProductStock),
      note: isStaffOnly
        ? `Lễ tân [${user?.name || "Phạm Văn Đức"}] khai báo thêm món mới (${newProductName}) bán tại quầy POS`
        : `Admin [Chủ Sân] khai báo mặt hàng mới (${newProductCategory})`,
      time: nowTimeStr + " - " + new Date().toLocaleDateString("vi-VN"),
    };
    setInventoryLogs([newLog, ...inventoryLogs]);

    toast.success(`Đã thêm món mới & đồng bộ POS/Web thành công: "${newProductName}"!`);
    setAddProductOpen(false);
    setNewProductName("");
    setSkuSeed(Math.floor(1000 + Math.random() * 9000));
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const isAllowStaff =
      selectedProduct.item_type === "drink_food" ||
      selectedProduct.category?.name?.includes("Nước") ||
      selectedProduct.category?.name?.includes("Đồ ăn");

    if (isStaffOnly && !isAllowStaff) {
      toast.error("Sản phẩm cao cấp giá trị lớn chỉ Admin/Chủ Sân mới có quyền cộng nhập kho.");
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
    localStorage.setItem("demopick_synced_products", JSON.stringify(updatedList));
    window.dispatchEvent(new Event("storage"));

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

      headerRight={
        isStaffOnly ? (
          <Button
            onClick={() => {
              setNewProductCategory("Nước & Đồ ăn");
              setNewProductItemType("drink_food");
              setAddProductOpen(true);
            }}
            className="gap-2 font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm Nước & Đồ Ăn Mới Tại Quầy</span>
          </Button>
        ) : (
          <Button onClick={() => setAddProductOpen(true)} className="gap-2 font-bold bg-emerald-600 hover:bg-emerald-500 text-xs">
            <Plus className="h-4 w-4" />
            <span>Thêm Hàng / Cho Thuê Đồ Mới</span>
          </Button>
        )
      }
    >
      <div className="space-y-6">
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
          {/* NỬA 1 (BÊN TRÁI - 7 COLS): DANH MỤC & SẢN PHẨM CÓ THANH CUỘN BẢO VỆ */}
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeTabCat === cat
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* PRODUCT CONTAINER WITH VISIBLE SCROLLBAR & PAGINATION */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              {/* Scrollable Cards Grid Container */}
              <div className="max-h-[420px] overflow-y-auto pr-1.5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paginatedProducts.map((product) => {
                    const stock = product.variants?.[0]?.stock_quantity || 0;
                    const isAllowStaffRestock =
                      product.item_type === "drink_food" ||
                      product.category?.name?.includes("Nước") ||
                      product.category?.name?.includes("Đồ ăn");

                    const canRestock = !isStaffOnly || isAllowStaffRestock;

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

                          {canRestock ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedProduct(product);
                                setRestockActionType("in");
                                setRestockOpen(true);
                              }}
                              className="h-7 px-2 font-bold text-[11px] border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 gap-1"
                            >
                              <PlusCircle className="h-3 w-3 text-emerald-600" />
                              <span>{isStaffOnly ? "Nhập Quầy Nước/Bóng" : "+ Nhập Kho"}</span>
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-200 bg-amber-50">
                              Khai báo / Giá: Admin
                            </Badge>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* PAGINATION FOOTER CONTROL BAR IN INVENTORY */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                <span className="text-slate-500 font-semibold text-[11px]">
                  Hiển thị {paginatedProducts.length}/{filteredProducts.length} mặt hàng kho
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="h-7 px-2.5 border-slate-300 text-xs font-bold gap-1"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Trang trước</span>
                  </Button>

                  <span className="px-2 font-mono text-slate-800 text-xs font-extrabold bg-slate-100 py-1 rounded border">
                    {currentPage} / {totalPages}
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    className="h-7 px-2.5 border-slate-300 text-xs font-bold gap-1"
                  >
                    <span>Trang sau</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
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

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1.5">
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

        {/* Modal Khai Báo Sản Phẩm Mới (Cho phép Lễ tân thêm Nước/Đồ ăn) */}
        <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
          <DialogContent className="max-w-2xl bg-white max-h-[85vh] overflow-y-auto p-6 shadow-2xl sm:rounded-2xl border border-slate-200">
            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <DialogHeader>
                <DialogTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <PackagePlus className="h-5 w-5 text-emerald-600" />
                  {isStaffOnly ? "Lễ Tân Thêm Món Nước Uống & Đồ Ăn Mới" : "Khai Báo Mặt Hàng / Cho Thuê Đồ Mới"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  {isStaffOnly
                    ? "Lễ tân khai báo loại nước hoặc đồ ăn mới nhận tại quầy để bán trực tiếp trên máy POS"
                    : "Chỉ duy nhất Admin/Chủ Sân có quyền niêm yết sản phẩm thiết bị cao cấp mới"}
                </DialogDescription>
              </DialogHeader>

              {isStaffOnly && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-0.5">
                  <p className="font-bold flex items-center gap-1 text-xs">
                    <ShieldCheck className="h-4 w-4 text-amber-600" /> Quyền Lễ Tân Quầy POS:
                  </p>
                  <p className="text-xs">
                    Bạn đang thêm món mới thuộc danh mục <strong>Nước & Đồ ăn</strong> để bán tại quầy.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="font-medium text-slate-700 text-xs">Tên mặt hàng / sản phẩm mới (*):</Label>
                  <Input
                    placeholder="Nhập tên sản phẩm..."
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="h-10 text-xs font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="font-medium text-slate-700 text-xs">Danh mục sản phẩm:</Label>
                    {isStaffOnly ? (
                      <Input value="Nước & Đồ ăn" disabled className="bg-slate-100 font-medium text-slate-700 h-10 text-xs" />
                    ) : (
                      <select
                        value={newProductCategory}
                        onChange={(e) => setNewProductCategory(e.target.value)}
                        className="w-full h-10 px-3 border rounded-xl font-medium bg-white text-xs border-slate-300 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Vợt">Vợt Pickleball</option>
                        <option value="Bóng">Bóng Pickleball</option>
                        <option value="Phụ kiện">Phụ kiện & Túi đựng</option>
                        <option value="Nước & Đồ ăn">Nước & Đồ ăn</option>
                        <option value="Cho thuê đồ">⏱Cho thuê đồ</option>
                      </select>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-medium text-slate-700 text-xs">Giá bán niêm yết (VNĐ):</Label>
                    <Input
                      type="number"
                      placeholder="Nhập giá VNĐ..."
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      className="h-10 text-xs font-medium text-emerald-700"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="font-medium text-slate-700 text-xs">Mã SKU Quản Lý (Khóa tự động):</Label>
                    <Input
                      value={newProductSku}
                      disabled
                      className="h-10 text-xs font-mono bg-slate-100 font-semibold text-slate-600 border-slate-200 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-medium text-slate-700 text-xs">Số lượng kho khởi tạo (*):</Label>
                    <Input
                      type="number"
                      placeholder="Nhập số lượng kho..."
                      value={newProductStock}
                      onChange={(e) => setNewProductStock(e.target.value === "" ? "" : Number(e.target.value))}
                      className="h-10 text-xs font-medium text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-medium text-slate-700 text-xs">Mô tả sản phẩm chi tiết (Giới thiệu người mua Web):</Label>
                  <textarea
                    value={newProductDescription}
                    onChange={(e) => setNewProductDescription(e.target.value)}
                    placeholder="Nhập bài viết / mô tả giới thiệu chi tiết sản phẩm..."
                    className="w-full h-20 p-3 border rounded-xl font-medium text-xs bg-white border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* 🟢 CHỈ HIỂN THỊ THÔNG SỐ KỸ THUẬT VỚI CÁC SẢN PHẨM VỢT, BÓNG, PHỤ KIỆN */}
                {!isStaffOnly && ["Vợt", "Bóng", "Phụ kiện"].some((cat) => newProductCategory.includes(cat)) && (
                  <div className="space-y-3 pt-3 border-t border-slate-200 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Thông Số Kỹ Thuật Chi Tiết (Thiết Bị Thi Đấu Web)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="font-medium text-slate-700 text-xs">Chất liệu mặt vợt/bóng:</Label>
                        <Input
                          value={newProductMaterial}
                          onChange={(e) => setNewProductMaterial(e.target.value)}
                          placeholder="Nhập chất liệu mặt..."
                          className="h-9 text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="font-medium text-slate-700 text-xs">Độ dày lõi (mm):</Label>
                        <Input
                          value={newProductThickness}
                          onChange={(e) => setNewProductThickness(e.target.value)}
                          placeholder="Nhập độ dày lõi..."
                          className="h-9 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="font-medium text-slate-700 text-xs">Trọng lượng (gam/oz):</Label>
                        <Input
                          value={newProductWeight}
                          onChange={(e) => setNewProductWeight(e.target.value)}
                          placeholder="Nhập trọng lượng..."
                          className="h-9 text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="font-medium text-slate-700 text-xs">Chứng nhận chuẩn USAPA:</Label>
                        <select
                          value={newProductUsapa ? "true" : "false"}
                          onChange={(e) => setNewProductUsapa(e.target.value === "true")}
                          className="w-full h-9 px-2 border rounded-xl font-medium bg-white text-xs border-slate-300"
                        >
                          <option value="true">✅ Đạt chuẩn thi đấu USAPA Approved</option>
                          <option value="false">❌ Không bắt buộc USAPA</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100">
                <Button type="submit" className="w-full font-bold bg-emerald-600 hover:bg-emerald-500 h-11 text-xs rounded-xl shadow-md gap-2">
                  <PackagePlus className="w-4 h-4" />
                  <span>Lưu Khai Báo & Cho Bán POS/Web Ngay </span>
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
                    Ghi nhận trực tiếp khi shipper giao lốc nước uống hoặc đồ ăn tại quầy
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
                    Xác Nhận & Ghi Nhật Ký Nhập Quầy
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
