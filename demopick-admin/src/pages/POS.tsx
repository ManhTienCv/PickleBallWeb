import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { adminService, Product } from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, ShoppingCart, Trash2, Banknote, QrCode, Receipt, PlusCircle, User, ShieldCheck, Lock, CheckCircle2, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface CartItem {
  variantId: number;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  isCourtFee?: boolean;
}

interface CourtStatusItem {
  id: number;
  name: string;
  status: "in_use" | "ending" | "available" | "booked";
  statusLabel: string;
  statusColor: string;
  time: string;
  hours: number;
  rate: number;
  customerName: string | null;
  customerRank: string | null;
  discountPercent: number;
}

export default function POS() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Tất cả");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer">("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shiftReportOpen, setShiftReportOpen] = useState(false);

  // Pagination for Product Grid
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6; // 6 products per page (2 rows x 3 cols) for perfect screen fit

  // Selected customer info for membership discount
  const [selectedCustomer, setSelectedCustomer] = useState<{
    name: string;
    rank: string;
    discountPercent: number;
  } | null>({
    name: "Nguyễn Văn A",
    rank: "Hạng VIP Diamond",
    discountPercent: 15,
  });

  // Quick Restock State for Staff
  const [quickRestockProduct, setQuickRestockProduct] = useState<Product | null>(null);
  const [quickRestockQty, setQuickRestockQty] = useState(20);

  // Current shift sales summary state
  const [shiftCashTotal, setShiftCashTotal] = useState(1450000);
  const [shiftTransferTotal, setShiftTransferTotal] = useState(3800000);
  const [shiftOrdersCount, setShiftOrdersCount] = useState(8);

  // Vertical Left Court Status List (Matches Ảnh 2)
  const courtStatusList: CourtStatusItem[] = [
    {
      id: 1,
      name: "Sân 01",
      status: "in_use",
      statusLabel: "ĐANG CHƠI",
      statusColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      time: "08:00 - 09:30 (1.5h)",
      hours: 1.5,
      rate: 140000,
      customerName: "Nguyễn Văn A",
      customerRank: "Hạng VIP Diamond",
      discountPercent: 15,
    },
    {
      id: 2,
      name: "Sân 02",
      status: "ending",
      statusLabel: "SẮP HẾT GIỜ",
      statusColor: "bg-amber-100 text-amber-800 border-amber-300",
      time: "09:00 - 10:00 (15p còn lại)",
      hours: 1,
      rate: 140000,
      customerName: "Trần Thị B",
      customerRank: "Hạng Vàng",
      discountPercent: 10,
    },
    {
      id: 3,
      name: "Sân 03",
      status: "in_use",
      statusLabel: "ĐANG CHƠI",
      statusColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      time: "08:30 - 10:30 (2h)",
      hours: 2,
      rate: 140000,
      customerName: "Lê Minh C",
      customerRank: "Thành viên Bạc",
      discountPercent: 1,
    },
    {
      id: 4,
      name: "Sân 04",
      status: "available",
      statusLabel: "TRỐNG",
      statusColor: "bg-slate-100 text-slate-500 border-slate-200",
      time: "Sẵn sàng thi đấu",
      hours: 1,
      rate: 140000,
      customerName: null,
      customerRank: null,
      discountPercent: 0,
    },
    {
      id: 5,
      name: "Sân VIP C1",
      status: "booked",
      statusLabel: "ĐÃ ĐẶT TỚI",
      statusColor: "bg-blue-100 text-blue-800 border-blue-300",
      time: "Khung 10:00 - 12:00 (2h)",
      hours: 2,
      rate: 180000,
      customerName: "Phạm Quốc D",
      customerRank: "Hạng VIP Diamond",
      discountPercent: 15,
    },
    {
      id: 6,
      name: "Sân VIP C2",
      status: "available",
      statusLabel: "TRỐNG",
      statusColor: "bg-slate-100 text-slate-500 border-slate-200",
      time: "Sẵn sàng thi đấu",
      hours: 1,
      rate: 180000,
      customerName: null,
      customerRank: null,
      discountPercent: 0,
    },
  ];

  const { data: initialProducts = [] } = useQuery({
    queryKey: ["admin-pos-products"],
    queryFn: adminService.getProducts,
  });

  const [productsState, setProductsState] = useState<Product[]>([]);
  const products = productsState.length > 0 ? productsState : initialProducts;

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, search]);

  // URL query params auto-add court fee from CourtMap page
  useEffect(() => {
    const paramCourtName = searchParams.get("courtName");
    const paramPrice = searchParams.get("price");
    const paramTime = searchParams.get("time");

    if (paramCourtName && paramPrice) {
      const priceNum = Number(paramPrice);
      const newCourtCartItem: CartItem = {
        variantId: Date.now(),
        productName: `Tiền Sân: ${paramCourtName}`,
        variantName: `Khung ${paramTime || "08:00"} (1 Giờ)`,
        price: priceNum,
        quantity: 1,
        isCourtFee: true,
      };
      setCartItems((prev) => [newCourtCartItem, ...prev]);
      toast.success(`Đã tự động thêm Tiền Sân "${paramCourtName}" vào hóa đơn POS!`);
    }
  }, [searchParams]);

  // Category filter tabs (Matching Ảnh 2)
  const categoriesList = [
    { id: "Tất cả", label: "🌟 Tất cả" },
    { id: "Nước uống", label: "🥤 Đồ uống & Đồ ăn" },
    { id: "Thuê vợt", label: "⏱️ Thuê vợt & máy" },
    { id: "Phụ kiện", label: "🎒 Phụ kiện & Vợt bán" },
  ];

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());

    let matchCat = true;
    if (activeCategory === "Nước uống") {
      matchCat =
        p.item_type === "drink_food" ||
        p.category?.name?.includes("Nước") ||
        p.name.toLowerCase().includes("nước") ||
        p.name.toLowerCase().includes("bánh") ||
        p.name.toLowerCase().includes("cà phê") ||
        p.name.toLowerCase().includes("coca");
    } else if (activeCategory === "Thuê vợt") {
      matchCat =
        p.item_type === "rental" ||
        p.category?.name?.includes("Cho thuê") ||
        p.name.toLowerCase().includes("thuê");
    } else if (activeCategory === "Phụ kiện") {
      matchCat =
        p.category?.name?.includes("Phụ kiện") ||
        p.name.toLowerCase().includes("vợt") ||
        p.name.toLowerCase().includes("bóng") ||
        p.name.toLowerCase().includes("băng");
    }

    return matchSearch && matchCat;
  });

  // Pagination Calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectCourtFromSidebar = (court: CourtStatusItem) => {
    const feeAmount = court.rate * court.hours;

    const newCourtCartItem: CartItem = {
      variantId: Date.now() + Math.floor(Math.random() * 1000),
      productName: `Tiền ${court.name} (${court.hours}h)`,
      variantName: `${court.time} | Giá: ${new Intl.NumberFormat("vi-VN").format(court.rate)}đ/h`,
      price: feeAmount,
      quantity: 1,
      isCourtFee: true,
    };

    setCartItems((prev) => {
      const filteredOutOtherCourts = prev.filter((i) => !i.isCourtFee);
      return [newCourtCartItem, ...filteredOutOtherCourts];
    });

    if (court.customerName) {
      setSelectedCustomer({
        name: court.customerName,
        rank: court.customerRank || "Thành viên",
        discountPercent: court.discountPercent,
      });
      toast.success(`Đã chọn ${court.name} của khách ${court.customerName} (${court.customerRank}) vào Hóa Đơn!`);
    } else {
      toast.success(`Đã thêm Tiền ${court.name} (${court.hours}h = ${new Intl.NumberFormat("vi-VN").format(feeAmount)}đ) vào Hóa Đơn!`);
    }
  };

  const handleAddToCart = (product: Product, variantIndex: number = 0) => {
    if (!product.variants || product.variants.length === 0) {
      toast.error("Sản phẩm chưa có biến thể khả dụng");
      return;
    }

    const variant = product.variants[variantIndex];
    if (variant.stock_quantity <= 0) {
      if (product.item_type === "drink_food" || product.category?.name?.includes("Nước")) {
        toast.info(`Mặt hàng "${product.name}" đã hết! Bấm "+ Nhập Quầy" để bổ sung lốc mới.`);
      } else {
        toast.error(`Sản phẩm cao cấp "${product.name}" đã hết kho. Vui lòng liên hệ Admin cộng kho tổng.`);
      }
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.variantId === variant.id);
      if (existing) {
        return prev.map((item) =>
          item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          variantId: variant.id,
          productName: product.name,
          variantName: `${variant.option_name}: ${variant.option_value}`,
          price: variant.price,
          quantity: 1,
        },
      ];
    });
  };

  const handleQuantityChange = (variantId: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.variantId === variantId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (variantId: number) => {
    setCartItems((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  // Calculations
  const subtotalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Calculate discount on court fee if customer has membership rank
  const courtFeeItem = cartItems.find((i) => i.isCourtFee);
  const courtFeeAmount = courtFeeItem ? courtFeeItem.price * courtFeeItem.quantity : 0;
  const discountAmount = selectedCustomer ? (courtFeeAmount * selectedCustomer.discountPercent) / 100 : 0;
  const finalTotalAmount = Math.max(0, subtotalAmount - discountAmount);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Hóa đơn POS hiện đang trống.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newOrderCode = "HD-" + Math.floor(10000 + Math.random() * 90000);

      if (paymentMethod === "cash") {
        setShiftCashTotal((prev) => prev + finalTotalAmount);
      } else {
        setShiftTransferTotal((prev) => prev + finalTotalAmount);
      }
      setShiftOrdersCount((prev) => prev + 1);

      toast.success(`Thanh toán hóa đơn #${newOrderCode} (${new Intl.NumberFormat("vi-VN").format(finalTotalAmount)}đ) thành công! Đã in bill quầy.`, {
        duration: 5000,
      });
      setCartItems([]);
    }, 600);
  };

  const handleQuickRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRestockProduct) return;

    const addNum = Number(quickRestockQty);
    if (addNum <= 0) return;

    const updated = products.map((p) => {
      if (p.id === quickRestockProduct.id) {
        const updatedVariants = p.variants.map((v) => ({
          ...v,
          stock_quantity: v.stock_quantity + addNum,
        }));
        return { ...p, in_stock: true, variants: updatedVariants };
      }
      return p;
    });

    setProductsState(updated);
    const nowTimeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    toast.success(
      `Lễ tân ${user?.name || "Phạm Văn Đức"} đã nhập thêm +${addNum} "${quickRestockProduct.name}" vào quầy POS lúc ${nowTimeStr}! Nhật ký hệ thống đã được ghi nhận.`,
      { duration: 5000 }
    );
    setQuickRestockProduct(null);
  };

  const shiftTotalSum = shiftCashTotal + shiftTransferTotal;

  return (
    <AppLayout
      title="Bán Hàng POS Quầy Lễ Tân"
      subtitle="Bảng trạng thái sân theo thời gian thực & Phân hệ thanh toán quầy chuẩn xác"
      headerRight={
        <Button
          onClick={() => setShiftReportOpen(true)}
          className="gap-2 bg-emerald-700 hover:bg-emerald-600 font-bold text-white shadow-sm"
        >
          <Receipt className="h-4 w-4" />
          <span>Doanh Thu Ca Hiện Tại: {new Intl.NumberFormat("vi-VN").format(shiftTotalSum)}đ</span>
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CỘT 1 (BÊN TRÁI PHÍA NGOÀI - 3 COLS): DANH SÁCH SÂN TRẠNG THÁI THỜI GIAN THỰC (Chuẩn Ảnh 2) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-1.5">
              DANH SÁCH SÂN
            </h3>
            <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
              6 Sân Pickleball
            </Badge>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {courtStatusList.map((court) => (
              <Card
                key={court.id}
                onClick={() => handleSelectCourtFromSidebar(court)}
                className="p-3 bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">{court.name}</span>
                  <Badge className={`text-[9px] font-bold border ${court.statusColor}`}>
                    {court.statusLabel}
                  </Badge>
                </div>

                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>{court.time}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-slate-700 pt-0.5">
                    <span className="text-emerald-700">{new Intl.NumberFormat("vi-VN").format(court.rate)}đ/h</span>
                    {court.customerName && (
                      <span className="text-[10px] text-slate-500 font-normal truncate max-w-[110px]">
                        👤 {court.customerName}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CỘT 2 (Ở GIỮA - 6 COLS): KHOẢNG ĐỎ CÓ THANH CUỘN & PHÂN TRANG CHUYỂN TRANG */}
        <div className="lg:col-span-6 space-y-3">
          {/* Category Tabs (Chuẩn Thiết Kế Ảnh 2) */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {categoriesList.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm đồ uống, đồ ăn nhẹ, thuê vợt, phụ kiện..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 text-xs h-8 bg-slate-50 border-slate-200"
              />
            </div>
          </div>

          {/* PRODUCT CONTAINER: SCROLLABLE & PAGINATED CONTAINER */}
          <div className="max-h-[calc(100vh-270px)] overflow-y-auto pr-1 space-y-3 flex flex-col justify-between">
            {/* Product Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {paginatedProducts.map((p) => {
                const stock = p.variants?.[0]?.stock_quantity || 0;
                const isAllowStaffRestock =
                  p.item_type === "drink_food" ||
                  p.category?.name?.includes("Nước") ||
                  p.category?.name?.includes("Đồ ăn");

                return (
                  <Card
                    key={p.id}
                    className="p-3 border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all bg-white flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden relative flex items-center justify-center p-2 border border-slate-100">
                        <img src={p.image_url || ""} alt={p.name} className="max-h-full max-w-full object-contain" />
                        <span className={`absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${stock > 0 ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
                          Tồn: {stock}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-2">{p.name}</h4>
                    </div>

                    <div className="pt-2 mt-2 border-t space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-emerald-600 text-xs">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p.price)}
                        </span>

                        <Button
                          size="sm"
                          disabled={stock <= 0}
                          onClick={() => handleAddToCart(p, 0)}
                          className="h-6 px-2 font-bold text-[11px] bg-emerald-600 hover:bg-emerald-500"
                        >
                          + Chọn
                        </Button>
                      </div>

                      {isAllowStaffRestock ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setQuickRestockProduct(p)}
                          className="w-full h-6 px-1.5 font-bold text-[9px] border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 gap-1"
                        >
                          <PlusCircle className="h-3 w-3 text-amber-600" />
                          <span>+ Nhập Quầy</span>
                        </Button>
                      ) : (
                        <div className="w-full h-6 flex items-center justify-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 rounded border border-slate-200">
                          <Lock className="h-3 w-3 text-slate-400" />
                          <span>🔒 Khai báo/Giá: Admin</span>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* PAGINATION FOOTER CONTROL BAR */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm text-xs font-bold mt-2">
              <span className="text-slate-500 font-semibold text-[11px]">
                Hiển thị {paginatedProducts.length}/{filteredProducts.length} mặt hàng
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

        {/* CỘT 3 (BÊN PHẢI - 3 COLS): HÓA ĐƠN POS TICKET CHUẨN (Chuẩn Ảnh 2) */}
        <div className="lg:col-span-3 space-y-3">
          <Card className="p-4 border-slate-200 bg-white shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                Hóa đơn
              </h3>
              <span className="text-xs font-mono text-slate-400">Mã: #HD8829</span>
            </div>

            {/* Customer Info Box (Chuẩn Ảnh 2) */}
            {selectedCustomer && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-0.5 text-xs">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{selectedCustomer.name}</span>
                  <Badge className="bg-emerald-700 text-[9px]">{selectedCustomer.rank}</Badge>
                </div>
                {selectedCustomer.discountPercent > 0 && (
                  <p className="text-[10px] text-emerald-700 font-semibold pl-5">
                    Ưu đãi: Giảm {selectedCustomer.discountPercent}% tiền sân
                  </p>
                )}
              </div>
            )}

            {/* Cart Items List */}
            <div className="divide-y divide-slate-100 max-h-[260px] overflow-y-auto pr-1 text-xs">
              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <ShoppingCart className="h-8 w-8 mx-auto text-slate-200" />
                  <p className="text-[11px] font-medium">Chưa chọn sản phẩm/tiền sân nào</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.variantId} className="py-2 flex items-center justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 truncate">{item.productName}</div>
                      <div className="text-[10px] text-slate-400">{item.variantName}</div>
                      <div className="text-emerald-600 font-bold">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <div className="flex items-center border rounded bg-slate-50">
                        <button
                          onClick={() => handleQuantityChange(item.variantId, -1)}
                          className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-200 font-bold text-[10px]"
                        >
                          -
                        </button>
                        <span className="px-1.5 font-bold text-slate-900 text-[11px]">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.variantId, 1)}
                          className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-200 font-bold text-[10px]"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveFromCart(item.variantId)}
                        className="text-slate-400 hover:text-red-500 p-0.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Totals (Matching Ảnh 2) */}
            <div className="pt-2 border-t space-y-2 text-xs">
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-bold text-slate-800">{new Intl.NumberFormat("vi-VN").format(subtotalAmount)}đ</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Giảm giá thành viên ({selectedCustomer?.discountPercent}%):</span>
                    <span>-{new Intl.NumberFormat("vi-VN").format(discountAmount)}đ</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-sm font-black text-emerald-600 pt-1.5 border-t">
                <span>Tổng tiền:</span>
                <span className="text-base">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(finalTotalAmount)}</span>
              </div>

              {/* Payment Buttons (Matching Ảnh 2) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  size="sm"
                  type="button"
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("cash")}
                  className={`h-8 font-bold text-xs ${paymentMethod === "cash" ? "bg-slate-900 text-white" : ""}`}
                >
                  <Banknote className="h-3.5 w-3.5 mr-1" /> Tiền mặt
                </Button>

                <Button
                  size="sm"
                  type="button"
                  variant={paymentMethod === "bank_transfer" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("bank_transfer")}
                  className={`h-8 font-bold text-xs ${paymentMethod === "bank_transfer" ? "bg-emerald-600 text-white border-emerald-600" : ""}`}
                >
                  <QrCode className="h-3.5 w-3.5 mr-1" /> Chuyển khoản
                </Button>
              </div>

              <Button
                size="lg"
                disabled={cartItems.length === 0 || isSubmitting}
                onClick={handleCheckout}
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 font-extrabold text-xs shadow-md mt-1"
              >
                {isSubmitting ? "Đang Thanh Toán..." : "Thanh toán & In hóa đơn"}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Lễ Tân Nhập Nhanh Quầy (Nước) */}
      <Dialog open={!!quickRestockProduct} onOpenChange={() => setQuickRestockProduct(null)}>
        <DialogContent className="max-w-md bg-white">
          {quickRestockProduct && (
            <form onSubmit={handleQuickRestockSubmit} className="space-y-4 text-xs">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-amber-500" />
                  Lễ Tân Nhập Nhanh Nước / Đồ Ăn Vào Quầy POS
                </DialogTitle>
                <DialogDescription>
                  Bổ sung số lượng vừa nhận tại quầy cho: <strong>{quickRestockProduct.name}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                <p className="font-bold">⚡ Ghi nhật ký tự động (Audit Trail):</p>
                <p className="text-[11px]">
                  Hệ thống ghi nhận: Lễ tân <strong>{user?.name || "Phạm Văn Đức"}</strong> nhập thêm +{quickRestockQty} lốc nước vào lúc {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700">Số lượng lốc/chai vừa nhận thêm (*):</Label>
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
                  Cộng Vào Quầy POS Ngay 🚀
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Báo Cáo Bàn Giao Ca Trực */}
      <Dialog open={shiftReportOpen} onOpenChange={setShiftReportOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" />
              Báo Cáo Bàn Giao Ca Trực Lễ Tân
            </DialogTitle>
            <DialogDescription>
              Thống kê tổng tiền thu trong ca trực của nhân viên: <strong>{user?.name || "Nhân Viên Lễ Tân"}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Nhân viên trực ca:</span>
                <strong className="text-slate-900">{user?.name || "Phạm Văn Đức"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian ca:</span>
                <strong className="text-slate-900">Hôm nay ({new Date().toLocaleDateString("vi-VN")})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng số hóa đơn xuất:</span>
                <strong className="text-emerald-700 font-bold">{shiftOrdersCount} Hóa đơn</strong>
              </div>
            </div>

            <div className="space-y-2 border-t pt-2">
              <div className="flex justify-between items-center p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="font-bold text-emerald-900">💵 Tiền mặt thu tại quầy:</span>
                <strong className="text-emerald-700 text-sm">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(shiftCashTotal)}
                </strong>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                <span className="font-bold text-blue-900">💳 Chuyển khoản VietQR/MoMo:</span>
                <strong className="text-blue-700 text-sm">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(shiftTransferTotal)}
                </strong>
              </div>
            </div>

            <div className="p-3 bg-slate-900 text-white rounded-xl flex justify-between items-center">
              <span className="font-bold">Tổng doanh thu ca:</span>
              <strong className="text-lg font-black text-emerald-400">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(shiftTotalSum)}
              </strong>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              onClick={() => {
                toast.success("Đã gửi lệnh in Báo cáo bàn giao ca trực tới máy in quầy!");
                setShiftReportOpen(false);
              }}
              className="w-full font-bold bg-emerald-600 hover:bg-emerald-500"
            >
              In Báo Cáo Bàn Giao Ca Trực 🖨️
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
