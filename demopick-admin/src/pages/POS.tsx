import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { adminService, Product, LiveCourtItem, DEFAULT_ADMIN_COURTS, DEFAULT_ADMIN_LIVE_COURTS } from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Search, ShoppingCart, Trash2, Banknote, QrCode, Receipt, PlusCircle, User, ShieldCheck, Lock, CheckCircle2, Clock, ChevronLeft, ChevronRight, Flame, Timer, CheckSquare, ScanLine, Sparkles, Play, Square, RefreshCw, Coffee, AlertTriangle, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import PosReceiptModal from "@/components/pos/PosReceiptModal";
import PosShiftReportModal from "@/components/pos/PosShiftReportModal";
import PosQuickRestockModal from "@/components/pos/PosQuickRestockModal";
import PosStartSessionModal from "@/components/pos/PosStartSessionModal";
import { PosLiveCourtCard, calculateLiveCourtDetails } from "@/components/pos/PosLiveCourtCard";

export interface CartItem {
  variantId: number;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  isCourtFee?: boolean;
}

export interface CourtStatusItem {
  id: number;
  name: string;
  status: "in_use" | "ending" | "available" | "booked";
  statusLabel: string;
  statusColor: string;
  time: string;
  hours: number;
  rate: number;
  customerName: string | null;
  customerPhone?: string | null;
  start_time?: string;
  expected_duration_minutes?: number | null;
  available_minutes_until_next?: number | null;
  next_booking_time?: string | null;
}

export default function POS() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStaffOnly = user?.roles?.includes("staff") && !user?.roles?.includes("admin") && !user?.roles?.includes("super_admin");
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Đồ uống");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer">("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shiftReportOpen, setShiftReportOpen] = useState(false);
  const [posReceiptModalOpen, setPosReceiptModalOpen] = useState(false);
  const [lastPOSReceipt, setLastPOSReceipt] = useState<{
    code: string;
    customerName: string;
    customerPhone?: string;
    staffName: string;
    items: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: string;
    time: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem("demopick_last_pos_receipt");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Pagination for Product Grid
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6; // 6 products per page (2 rows x 3 cols) for perfect screen fit

  // Retail Customer Manual Input (Tên và SĐT khách mua trực tiếp)
  const [retailCustomerName, setRetailCustomerName] = useState<string>("Khách vãng lai");
  const [retailCustomerPhone, setRetailCustomerPhone] = useState<string>("");

  // Court Customer Info (Tự động trích xuất khi bấm chọn sân)
  const [courtCustomer, setCourtCustomer] = useState<{
    name: string;
    phone?: string;
    courtName?: string;
  } | null>(null);

  const hasCourtFee = cartItems.some((i) => i.isCourtFee);

  // Quick Restock State for Staff
  const [quickRestockProduct, setQuickRestockProduct] = useState<Product | null>(null);
  const [quickRestockQty, setQuickRestockQty] = useState(20);

  // Current shift sales summary state
  const [shiftCashTotal, setShiftCashTotal] = useState(0);
  const [shiftTransferTotal, setShiftTransferTotal] = useState(0);
  const [shiftOrdersCount, setShiftOrdersCount] = useState(0);

  // Live court polling & real-time ticking
  const { data: apiCourts = [], isLoading: isLoadingLiveCourts, refetch: refetchLiveCourts } = useQuery({
    queryKey: ["pos-live-courts"],
    queryFn: adminService.getLiveCourtStatus,
    refetchInterval: 5000,
  });

  const { data: rawCourts = [] } = useQuery({
    queryKey: ["pos-base-courts"],
    queryFn: adminService.getCourts,
  });

  // Timer nhẹ nhàng 10s chỉ dùng để cập nhật banner cảnh báo quá giờ/sắp hết ca, không làm re-render toàn trang
  const [, setAlertTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setAlertTick((t) => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  // Quick QR Check-in State
  const [qrCodeInput, setQrCodeInput] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Start Court Session Dialog State
  const [startSessionDialogOpen, setStartSessionDialogOpen] = useState(false);
  const [targetCourtForSession, setTargetCourtForSession] = useState<any>(null);
  const [sessionCustomerName, setSessionCustomerName] = useState("Khách vãng lai");
  const [sessionCustomerPhone, setSessionCustomerPhone] = useState("");
  const [selectedDurationOption, setSelectedDurationOption] = useState<number | null>(null);
  const [isStartingSession, setIsStartingSession] = useState(false);

  // Local session state overrides to provide immediate, zero-latency reactive UI
  const [localCourtOverrides, setLocalCourtOverrides] = useState<Record<number, Partial<CourtStatusItem>>>({});

  // Court Tab Orders (Ghi nợ nước/đồ ăn vào từng sân đang chơi)
  const [courtTabOrders, setCourtTabOrders] = useState<Record<number, CartItem[]>>(() => {
    const saved = localStorage.getItem("demopick_pos_court_tab_orders");
    return saved ? JSON.parse(saved) : {};
  });

  // Active serving court (Sân đang được chọn để nạp đồ uống/đồ ăn)
  const [activeServingCourtId, setActiveServingCourtId] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem("demopick_pos_court_tab_orders", JSON.stringify(courtTabOrders));
  }, [courtTabOrders]);

  // Dynamic fallback courts matching real database courts
  const defaultCourtStatusList = useMemo((): CourtStatusItem[] => {
    const list = (rawCourts && rawCourts.length > 0) ? rawCourts : DEFAULT_ADMIN_COURTS;
    return list.map((c) => ({
      id: c.id,
      name: c.name,
      status: "available",
      statusLabel: "TRỐNG",
      statusColor: "bg-slate-100 text-slate-500 border-slate-200",
      time: "Sẵn sàng thi đấu",
      hours: 1,
      rate: Number(c.hourly_rate) || 140000,
      customerName: null,
    }));
  }, [rawCourts]);

  // Merge API live courts with formatting
  const baseCourtList = apiCourts && apiCourts.length > 0
    ? apiCourts.map((c: any) => {
      let statusColor = "bg-slate-100 text-slate-600 border-slate-200";
      let statusLabel = c.status_label || "TRỐNG";
      if (c.status === "in_use") {
        statusColor = "bg-emerald-50 text-emerald-700 border-emerald-300";
        statusLabel = "ĐANG CHƠI";
      }
      if (c.status === "ending") {
        statusColor = "bg-amber-50 text-amber-700 border-amber-300";
        statusLabel = "SẮP HẾT GIỜ";
      }
      if (c.status === "booked") {
        statusColor = "bg-blue-50 text-blue-700 border-blue-300";
        statusLabel = "ĐÃ ĐẶT";
      }

      return {
        ...c,
        statusColor,
        statusLabel,
        rate: c.hourly_rate || (c.id === 5 || c.id === 6 ? 180000 : 140000),
        hours: c.duration_minutes ? c.duration_minutes / 60 : (c.hours || 1),
        customerName: c.customer_name ?? c.customerName,
        customerPhone: c.customer_phone ?? c.customerPhone,
        start_time: c.start_time,
      };
    })
    : defaultCourtStatusList;

  // Apply real-time local court overrides (Bật Giờ, Trả Sân, Check-in)
  const courtStatusList = baseCourtList.map((c: any) => {
    if (localCourtOverrides[c.id]) {
      return { ...c, ...localCourtOverrides[c.id] };
    }
    return c;
  });


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

  // Category filter tabs (Đồ uống & Đồ ăn, Vợt, Bóng, Phụ kiện, Thuê vợt)
  const categoriesList = [
    { id: "Đồ uống", label: "Đồ uống & Đồ ăn" },
    { id: "Vợt Pickleball", label: "Vợt Pickleball" },
    { id: "Bóng Pickleball", label: "Bóng Pickleball" },
    { id: "Phụ kiện", label: "Phụ kiện & Trang phục" },
    { id: "Thuê vợt", label: "Thuê vợt & Máy tập" },
  ];

  const filteredProducts = (products || []).filter((p) => {
    if (!p) return false;
    const pName = (p.name || "").toLowerCase();
    const pSlug = (p.slug || "").toLowerCase();
    const sQuery = (search || "").toLowerCase();

    const matchSearch = pName.includes(sQuery) || pSlug.includes(sQuery);
    if (!matchSearch) return false;

    const catId = p.category?.id || (p as any).categoryId || (p as any).category_id;
    const catName = (p.category?.name || "").toLowerCase();
    const catSlug = (p.category?.slug || "").toLowerCase();
    const itemType = p.item_type || (p as any).itemType || "";

    const isDrinkFood =
      itemType === "drink_food" ||
      catId === 5 ||
      catId === 7 ||
      catSlug === "do-uong-do-an" ||
      catSlug.includes("do-uong") ||
      catName.includes("đồ uống") ||
      catName.includes("đồ ăn") ||
      catName.includes("giải khát") ||
      pSlug.includes("pocari") ||
      pSlug.includes("revive") ||
      pSlug.includes("lavie") ||
      pSlug.includes("red-bull") ||
      pSlug.includes("dua") ||
      pSlug.includes("tra-chanh") ||
      pSlug.includes("coffee") ||
      pSlug.includes("granola") ||
      pSlug.includes("snickers") ||
      pSlug.includes("dole") ||
      pSlug.includes("banana");

    const isRental =
      itemType === "rental" ||
      catId === 6 ||
      catSlug.includes("thue") ||
      catName.includes("thuê") ||
      catName.includes("cho thuê") ||
      pSlug.includes("thue-");

    if (activeCategory === "all") {
      return true;
    } else if (activeCategory === "Đồ uống") {
      return isDrinkFood;
    } else if (activeCategory === "Thuê vợt") {
      return isRental;
    } else if (activeCategory === "Vợt Pickleball") {
      return (
        !isDrinkFood &&
        !isRental &&
        (catId === 1 ||
          catSlug.includes("vot") ||
          (catName.includes("vợt") && !catName.includes("bao vợt")) ||
          pSlug.startsWith("vot-") ||
          pSlug.includes("paddle"))
      );
    } else if (activeCategory === "Bóng Pickleball") {
      return (
        !isDrinkFood &&
        !isRental &&
        (catId === 2 ||
          catSlug.includes("bong") ||
          catName.includes("bóng") ||
          pSlug.startsWith("bong-") ||
          pSlug.includes("hop-"))
      );
    } else if (activeCategory === "Phụ kiện") {
      return (
        !isDrinkFood &&
        !isRental &&
        (catId === 3 ||
          catId === 4 ||
          catSlug.includes("phu-kien") ||
          catSlug.includes("quan-ao") ||
          catName.includes("phụ kiện") ||
          catName.includes("bao vợt") ||
          catName.includes("quần áo") ||
          catName.includes("trang phục") ||
          catName.includes("giày"))
      );
    }

    return true;
  });

  // Pagination Calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );



  const handleExtendCourtDuration = (court: any, extraMinutes: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const live = calculateLiveCourtDetails(court);
    const currentBase = court.expected_duration_minutes || live.exactMinutes || (court.hours ? Math.round(court.hours * 60) : 60);
    const newExpected = currentBase + extraMinutes;

    setLocalCourtOverrides((prev) => ({
      ...prev,
      [court.id]: {
        ...court,
        status: "in_use",
        statusLabel: "ĐANG CHƠI",
        statusColor: "bg-emerald-50 text-emerald-700 border-emerald-300",
        expected_duration_minutes: newExpected,
        hours: newExpected / 60,
      },
    }));

    toast.success(`⏱️ Đã gia hạn thêm +${extraMinutes} phút cho "${court.name}"! Tổng thời lượng: ${newExpected} phút.`);
  };

  const handleToggleServeCourt = (courtId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeServingCourtId === courtId) {
      setActiveServingCourtId(null);
      toast.info("Đã thoát chế độ gọi đồ cho sân, quay về bán lẻ quầy.");
    } else {
      setActiveServingCourtId(courtId);
      const court = courtStatusList.find((c) => c.id === courtId);
      toast.success(`👉 Đang chọn đồ uống/thực phẩm nạp vào "${court?.name || 'Sân'}". Bấm vào bất kỳ món nào ở giữa để thêm.`);
    }
  };

  const handleCourtTabItemQuantity = (courtId: number, variantId: number, delta: number) => {
    setCourtTabOrders((prev) => {
      const currentCourtTab = prev[courtId] || [];
      const updated = currentCourtTab
        .map((item) => {
          if (item.variantId === variantId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
      return {
        ...prev,
        [courtId]: updated,
      };
    });
  };

  const handleOpenStartSessionModal = (court: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTargetCourtForSession(court);
    setSessionCustomerName("Khách vãng lai");
    setSessionCustomerPhone("");
    setSelectedDurationOption(null);
    setStartSessionDialogOpen(true);
  };

  const handleConfirmStartSession = async () => {
    if (!targetCourtForSession) return;
    setIsStartingSession(true);
    const hourlyRate = targetCourtForSession.rate || (targetCourtForSession.id >= 5 ? 180000 : 140000);
    const customerName = sessionCustomerName.trim() || "Khách vãng lai";
    const customerPhone = sessionCustomerPhone.trim();

    try {
      await adminService.startCourtSession(targetCourtForSession.id, {
        customer_name: customerName,
        customer_phone: customerPhone,
        duration_minutes: selectedDurationOption || undefined,
        hourly_rate: hourlyRate,
      });
    } catch {
      // offline / mock fallback
    } finally {
      const now = new Date();
      const startTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

      setLocalCourtOverrides((prev) => ({
        ...prev,
        [targetCourtForSession.id]: {
          status: "in_use",
          statusLabel: "ĐANG CHƠI",
          statusColor: "bg-emerald-50 text-emerald-700 border-emerald-300",
          start_time: startTimeStr,
          customer_name: customerName,
          customerName: customerName,
          customer_phone: customerPhone,
          customerPhone: customerPhone,
          expected_duration_minutes: selectedDurationOption,
          rate: hourlyRate,
          time: "Vừa bắt đầu",
        },
      }));

      toast.success(`Đã bật giờ vào sân "${targetCourtForSession.name}" cho ${customerName}! Đồng hồ tính giờ đã bắt đầu chạy.`);
      setStartSessionDialogOpen(false);
      setIsStartingSession(false);
    }
  };

  const handleStopCourtSession = async (court: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const live = calculateLiveCourtDetails(court);
    let sessionRes: any = null;

    try {
      sessionRes = await adminService.stopCourtSession(court.id);
    } catch {
      // Offline fallback calculation
    }

    if (!sessionRes || !sessionRes.court_name) {
      const durationMins = live.exactMinutes || Math.round((court.hours || 1) * 60);
      const roundedMins = Math.max(15, Math.ceil(durationMins / 15) * 15);
      const rate = court.rate || (court.id >= 5 ? 180000 : 140000);
      const fee = Math.round((roundedMins / 60) * rate);
      sessionRes = {
        court_name: court.name,
        duration_minutes: roundedMins,
        total_price: fee,
        formatted_price: `${new Intl.NumberFormat("vi-VN").format(fee)}đ`,
        time_range: `${live.elapsedTimeStr} (${roundedMins} phút)`,
      };
    }

    const newCourtCartItem: CartItem = {
      variantId: Date.now() + Math.floor(Math.random() * 1000),
      productName: `Tiền Sân: ${sessionRes.court_name} (${sessionRes.duration_minutes}p)`,
      variantName: `Khung ${sessionRes.time_range} | ${court.customerName || court.customer_name || "Khách vãng lai"}`,
      price: sessionRes.total_price,
      quantity: 1,
      isCourtFee: true,
    };

    // LẤY TẤT CẢ MÓN NƯỚC/BÁNH MÀ SÂN NÀY ĐÃ GỌI TRONG LÚC CHƠI
    const tabItems = courtTabOrders[court.id] || [];

    setCartItems((prev) => {
      const filteredOut = prev.filter((i) => !i.isCourtFee);
      return [newCourtCartItem, ...tabItems, ...filteredOut];
    });

    // Xóa tab nợ của sân này sau khi đã gom vào giỏ thanh toán
    setCourtTabOrders((prev) => {
      const copy = { ...prev };
      delete copy[court.id];
      return copy;
    });

    if (activeServingCourtId === court.id) {
      setActiveServingCourtId(null);
    }

    if (court.customerName || court.customer_name) {
      setCourtCustomer({
        name: court.customerName || court.customer_name,
        phone: court.customerPhone || court.customer_phone || "",
        courtName: court.name,
      });
    }

    // Reset this court to available
    setLocalCourtOverrides((prev) => ({
      ...prev,
      [court.id]: {
        status: "available",
        statusLabel: "TRỐNG",
        statusColor: "bg-slate-100 text-slate-500 border-slate-200",
        start_time: undefined,
        customer_name: null,
        customerName: null,
        customer_phone: null,
        customerPhone: null,
        time: "Sẵn sàng thi đấu",
        expected_duration_minutes: null,
      },
    }));

    const tabCount = tabItems.reduce((acc, it) => acc + it.quantity, 0);
    const tabSummary = tabCount > 0 ? ` + ${tabCount} món nước/dịch vụ` : "";
    toast.success(`🏁 Đã trả sân ${sessionRes.court_name}! Phí sân ${sessionRes.formatted_price}${tabSummary} đã đẩy vào Hóa Đơn POS.`);
  };

  const handleQuickCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = qrCodeInput.trim();
    if (!code) {
      toast.error("Vui lòng nhập hoặc quét mã QR check-in");
      return;
    }

    setIsCheckingIn(true);
    let checkInRes: any = null;
    try {
      checkInRes = await adminService.scanCheckIn(code);
    } catch {
      // Fallback
    }

    // Find booked court (e.g. Sân C1 VIP) or activate
    const targetCourt = courtStatusList.find((c) => c.status === "booked") || courtStatusList.find((c) => c.id === 5);
    if (targetCourt) {
      const now = new Date();
      const startTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      const custName = targetCourt.customerName || checkInRes?.customer_name || "Khách Check-in";
      const custPhone = targetCourt.customerPhone || checkInRes?.customer_phone || "";

      setLocalCourtOverrides((prev) => ({
        ...prev,
        [targetCourt.id]: {
          status: "in_use",
          statusLabel: "ĐANG CHƠI",
          statusColor: "bg-emerald-50 text-emerald-700 border-emerald-300",
          start_time: startTimeStr,
          customer_name: custName,
          customerName: custName,
          customer_phone: custPhone,
          customerPhone: custPhone,
          time: "Vừa check-in",
        },
      }));
      toast.success(`✅ Check-in thành công cho mã #${code}! ${targetCourt.name} đã được kích hoạt giờ chơi.`);
    } else {
      toast.success(`✅ Check-in thành công cho mã #${code}! Khách đã vào sân.`);
    }
    setQrCodeInput("");
    setIsCheckingIn(false);
  };

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
      setCourtCustomer({
        name: court.customerName,
        phone: court.customerPhone || "",
        courtName: court.name,
      });
      toast.success(`Đã chọn ${court.name} của khách "${court.customerName}" - Đã khóa ô nhập khách thủ công!`);
    } else {
      setCourtCustomer({
        name: `Khách ${court.name}`,
        phone: "",
        courtName: court.name,
      });
      toast.success(`Đã thêm Tiền ${court.name} (${court.hours}h) vào Hóa Đơn!`);
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
        toast.info(`Mặt hàng "${product.name}" đã hết! Bấm " Nhập Quầy" để bổ sung lốc mới.`);
      } else {
        toast.error(`Sản phẩm cao cấp "${product.name}" đã hết kho. Vui lòng liên hệ Admin cộng kho tổng.`);
      }
      return;
    }

    // Nạp vào Tab món của Sân nếu đang kích hoạt chế độ nạp đồ cho sân
    if (activeServingCourtId !== null) {
      const targetCourt = courtStatusList.find((c) => c.id === activeServingCourtId);
      const courtName = targetCourt?.name || `Sân #${activeServingCourtId}`;

      setCourtTabOrders((prev) => {
        const currentCourtTab = prev[activeServingCourtId] || [];
        const existing = currentCourtTab.find((item) => item.variantId === variant.id);
        let updated: CartItem[];
        if (existing) {
          updated = currentCourtTab.map((item) =>
            item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          updated = [
            ...currentCourtTab,
            {
              variantId: variant.id,
              productName: product.name,
              variantName: `${variant.option_name}: ${variant.option_value}`,
              price: variant.price,
              quantity: 1,
            },
          ];
        }
        return {
          ...prev,
          [activeServingCourtId]: updated,
        };
      });

      toast.success(`🥤 Đã thêm 1x "${product.name}" vào tab phục vụ của ${courtName}!`);
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
  const discountAmount = 0;
  const finalTotalAmount = subtotalAmount;

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

      // Deduct stock quantity for purchased POS items & sync with Web store
      const syncedRaw = localStorage.getItem("demopick_synced_products_v3");
      let currentProductsList = products;
      if (syncedRaw) {
        try { currentProductsList = JSON.parse(syncedRaw); } catch { }
      }
      const updatedProducts = currentProductsList.map((p) => {
        let hasModified = false;
        const updatedVariants = (p.variants || []).map((v) => {
          const matchedCartItem = cartItems.find(
            (c) => !c.isCourtFee && (c.variantId === v.id || c.productName.toLowerCase() === p.name.toLowerCase())
          );
          if (matchedCartItem) {
            hasModified = true;
            const currentQty = v.stock_quantity ?? 15;
            const newQty = Math.max(0, currentQty - matchedCartItem.quantity);
            return { ...v, stock_quantity: newQty };
          }
          return v;
        });

        if (hasModified) {
          const totalStock = updatedVariants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
          return {
            ...p,
            in_stock: totalStock > 0,
            variants: updatedVariants,
          };
        }
        return p;
      });
      setProductsState(updatedProducts);
      localStorage.setItem("demopick_synced_products_v3", JSON.stringify(updatedProducts));
      window.dispatchEvent(new Event("storage"));

      const hasCourt = cartItems.some((i) => i.isCourtFee);
      const finalCustomerName = hasCourt
        ? (courtCustomer?.name || "Khách Đặt Sân")
        : (retailCustomerName.trim() || "Khách vãng lai");
      const finalCustomerPhone = hasCourt
        ? (courtCustomer?.phone || "")
        : retailCustomerPhone.trim();

      const receiptData = {
        code: newOrderCode,
        customerName: finalCustomerName,
        customerPhone: finalCustomerPhone,
        staffName: user?.name || "Lễ tân quầy",
        items: [...cartItems],
        subtotal: subtotalAmount,
        discount: 0,
        total: finalTotalAmount,
        paymentMethod: paymentMethod === "cash" ? "Tiền mặt tại quầy" : "Chuyển khoản VietQR",
        time: `${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ${new Date().toLocaleDateString("vi-VN")}`,
      };
      setLastPOSReceipt(receiptData);
      localStorage.setItem("demopick_last_pos_receipt", JSON.stringify(receiptData));
      setPosReceiptModalOpen(true);

      // Persist POS order to system orders list
      try {
        const todayStr = new Date().toISOString().split("T")[0];
        const timeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
        const courtFeeItem = cartItems.find((i) => i.isCourtFee);
        const newPosOrder = {
          code: newOrderCode,
          customerName: finalCustomerName,
          customerPhone: finalCustomerPhone,
          staffName: user?.name || "Lễ tân quầy",
          type: "POS Quầy",
          posCategory: hasCourt ? "court_service" : "retail",
          totalAmount: finalTotalAmount,
          paymentMethod: paymentMethod === "cash" ? "Tiền mặt" : "VietQR",
          status: "PAID",
          createdAt: `${todayStr} ${timeStr}`,
          dateStr: todayStr,
          shippingAddress: hasCourt ? "Sân thi đấu tại chỗ" : "Mua hàng trực tiếp tại quầy",
          courtInfo: hasCourt ? {
            courtName: courtCustomer?.courtName || courtFeeItem?.productName?.replace("Tiền Sân: ", "") || "Sân Pickleball",
            timeRange: courtFeeItem?.variantName || "Giờ thi đấu",
          } : undefined,
          items: cartItems.map((c, idx) => ({
            id: c.variantId || idx + 1,
            name: c.productName + (c.variantName ? ` (${c.variantName})` : ""),
            qty: c.quantity,
            price: c.price,
          })),
        };
        const savedOrdersRaw = localStorage.getItem("demopick_orders_admin");
        const existingOrders = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : [];
        const updatedOrders = [newPosOrder, ...(Array.isArray(existingOrders) ? existingOrders : [])];
        localStorage.setItem("demopick_orders_admin", JSON.stringify(updatedOrders));
        window.dispatchEvent(new Event("storage"));
      } catch {}

      toast.success(`Thanh toán hóa đơn #${newOrderCode} (${new Intl.NumberFormat("vi-VN").format(finalTotalAmount)}đ) thành công! Tồn kho POS & Web đã đồng bộ tự động.`, {
        duration: 5000,
      });
      setCartItems([]);
      setCourtCustomer(null);
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
    localStorage.setItem("demopick_synced_products_v3", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
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
      noScroll
      title="Bán Hàng POS Quầy Lễ Tân"
      actions={
        <div className="flex items-center gap-2">
          {lastPOSReceipt && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPosReceiptModalOpen(true)}
              className="h-8 text-xs font-bold bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50 rounded-xl gap-1.5 shadow-2xs"
            >
              <Receipt className="h-3.5 w-3.5 text-emerald-600" />
              <span>In Lại Bill Vừa Thu (#{lastPOSReceipt.code})</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/orders?tab=pos")}
            className="h-8 text-xs font-bold bg-white text-slate-700 border-slate-300 hover:bg-slate-50 rounded-xl gap-1.5 shadow-2xs"
          >
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>Lịch Sử Hóa Đơn POS</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setShiftReportOpen(true)}
            className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 shadow-xs"
          >
            <Banknote className="h-3.5 w-3.5" />
            <span>Báo Cáo Ca</span>
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0 h-full overflow-hidden">
        {/* CỘT 1 (BÊN TRÁI PHÍA NGOÀI - 3 COLS): DANH SÁCH SÂN TRẠNG THÁI THỜI GIAN THỰC (CUỘN RIÊNG TẠI ĐÂY) */}
        <div className="lg:col-span-3 flex flex-col min-h-0 h-full space-y-2">
          <div className="flex items-center justify-between shrink-0">
            <h3 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-1.5">
              DANH SÁCH SÂN
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => refetchLiveCourts()}
                title="Làm mới trạng thái sân"
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
              <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                {courtStatusList.length} Sân Pickleball
              </Badge>
            </div>
          </div>

          {/* Quick QR Check-in Box */}
          <form onSubmit={handleQuickCheckIn} className="flex items-center gap-1.5 shrink-0 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative flex-1">
              <ScanLine className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Quét mã QR / Đơn online..."
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value)}
                className="pl-8 text-[11px] h-7 bg-slate-50 border-slate-200"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={isCheckingIn || !qrCodeInput.trim()}
              className="h-7 px-2.5 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shrink-0 gap-1 shadow-xs"
            >
              <span>Vào sân</span>
            </Button>
          </form>

          {/* Cảnh báo thời gian sân sắp hết giờ / quá giờ */}
          {(() => {
            const alertCourts = courtStatusList
              .map((c) => ({ court: c, live: calculateLiveCourtDetails(c) }))
              .filter(({ court, live }) => (court.status === "in_use" || court.status === "ending") && (live.isNearEnding || live.isOvertime));

            if (alertCourts.length === 0) return null;

            return (
              <div className="bg-amber-500/15 border border-amber-400 text-amber-950 rounded-xl p-2.5 text-[11px] space-y-1.5 shrink-0 shadow-xs">
                <div className="font-bold flex items-center justify-between text-amber-900">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600 animate-bounce" />
                    <span>Cảnh báo thời gian ca ({alertCourts.length} sân)</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] bg-white border-amber-300 text-amber-800">
                    Cần chú ý
                  </Badge>
                </div>
                <div className="space-y-1">
                  {alertCourts.map(({ court, live }) => (
                    <div key={court.id} className="flex items-center justify-between text-[11px] bg-white/90 p-1.5 rounded-lg border border-amber-200">
                      <span className="truncate pr-1">
                        <strong>{court.name}</strong>: {live.isOvertime ? (
                          <span className="text-rose-600 font-bold">Quá giờ +{live.overtimeMinutes}p!</span>
                        ) : (
                          <span className="text-amber-700 font-bold">Còn {live.remainingMinutes}p</span>
                        )}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleExtendCourtDuration(court, 15, e)}
                          className="px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 text-[10px] font-bold"
                          title="Gia hạn nhanh 15 phút"
                        >
                          +15p
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleExtendCourtDuration(court, 30, e)}
                          className="px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 text-[10px] font-bold"
                          title="Gia hạn nhanh 30 phút"
                        >
                          +30p
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Dedicated Scrollable Court List */}
          <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1.5">
            {courtStatusList.map((court: any) => (
              <PosLiveCourtCard
                key={court.id}
                court={court}
                activeServingCourtId={activeServingCourtId}
                courtTabItems={courtTabOrders[court.id] || []}
                onStopSession={handleStopCourtSession}
                onToggleServe={handleToggleServeCourt}
                onCourtTabQty={handleCourtTabItemQuantity}
                onExtendDuration={handleExtendCourtDuration}
                onStartSession={handleOpenStartSessionModal}
                onSelectCourt={handleSelectCourtFromSidebar}
              />
            ))}
          </div>
        </div>

        {/* CỘT 2 (Ở GIỮA - 6 COLS): KHOẢNG GIỮA CÓ PHÂN TRANG VÀ LƯỚI SẢN PHẨM */}
        <div className="lg:col-span-6 flex flex-col min-h-0 h-full space-y-2.5">
          {/* Active Serving Court Banner */}
          {activeServingCourtId !== null && (
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3.5 py-2 rounded-xl shadow-xs flex items-center justify-between shrink-0 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs">
                <Coffee className="h-4 w-4 shrink-0 animate-bounce" />
                <div>
                  <span className="font-semibold text-amber-100">Đang nạp đồ cho: </span>
                  <span className="font-extrabold text-white underline underline-offset-2">
                    {courtStatusList.find((c) => c.id === activeServingCourtId)?.name || `Sân #${activeServingCourtId}`}
                  </span>
                  {courtTabOrders[activeServingCourtId]?.length ? (
                    <span className="ml-2 text-amber-100 font-medium text-[11px]">
                      (Đã nạp {courtTabOrders[activeServingCourtId].reduce((a, b) => a + b.quantity, 0)} món • {new Intl.NumberFormat("vi-VN").format(courtTabOrders[activeServingCourtId].reduce((a, b) => a + b.price * b.quantity, 0))}đ)
                    </span>
                  ) : (
                    <span className="ml-2 text-amber-100 text-[11px] italic">(Chưa có món nào)</span>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setActiveServingCourtId(null)}
                className="h-6 px-2.5 text-[10px] font-bold bg-white text-amber-900 hover:bg-amber-50 rounded-lg shadow-xs"
              >
                X Về bán lẻ
              </Button>
            </div>
          )}

          {/* Category Tabs */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {categoriesList.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors duration-150 border ${activeCategory === cat.id
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm shrink-0">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm đồ uống, đồ ăn nhẹ, vợt, bóng, phụ kiện, thuê sân..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 text-xs h-8 bg-slate-50 border-slate-200"
              />
            </div>
          </div>

          {/* PRODUCT CONTAINER: GRID CARDS (INDEPENDENT SCROLLABLE) */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 items-start">
              {paginatedProducts.map((p) => {
                const stock = p.variants?.[0]?.stock_quantity || 0;
                const isAllowStaffRestock =
                  p.item_type === "drink_food" ||
                  p.category?.name?.includes("Nước") ||
                  p.category?.name?.includes("Đồ ăn") ||
                  p.category?.name?.includes("Bóng") ||
                  p.category?.name?.includes("Phụ kiện") ||
                  p.name.toLowerCase().includes("nước") ||
                  p.name.toLowerCase().includes("bóng") ||
                  p.name.toLowerCase().includes("quấn");

                return (
                  <Card
                    key={p.id}
                    className="p-2.5 border-slate-200 hover:border-emerald-500 hover:shadow-md transition-colors bg-white flex flex-col justify-between h-[230px]"
                  >
                    <div className="space-y-1.5">
                      <div className="h-28 bg-slate-50 rounded-xl overflow-hidden relative flex items-center justify-center p-2 border border-slate-100">
                        <img src={p.image_url || ""} alt={p.name} className="max-h-full max-w-full object-contain" />
                        <span className={`absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${stock > 0 ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
                          Tồn: {stock}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-2">{p.name}</h4>
                    </div>

                    <div className="pt-2 mt-auto border-t space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-emerald-600 text-xs">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p.price)}
                        </span>

                        <Button
                          size="sm"
                          disabled={stock <= 0}
                          onClick={() => handleAddToCart(p, 0)}
                          className={`h-6 px-2 font-bold text-[11px] ${
                            activeServingCourtId !== null
                              ? "bg-amber-600 hover:bg-amber-500 text-white"
                              : "bg-emerald-600 hover:bg-emerald-500"
                          }`}
                        >
                          {activeServingCourtId !== null ? "+ Nạp Sân" : "+ Chọn"}
                        </Button>
                      </div>

                      {(!isStaffOnly || isAllowStaffRestock) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setQuickRestockProduct(p)}
                          className="w-full h-6 px-1.5 font-bold text-[9px] border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
                        >
                          <span>Nhập Quầy</span>
                        </Button>
                      ) : (
                        <div className="w-full h-6 flex items-center justify-center text-[9px] font-bold text-slate-400 bg-slate-100 rounded border border-slate-200">
                          <span>Khai báo/Giá: Admin</span>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* PAGINATION FOOTER CONTROL BAR */}
          <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-sm text-xs font-bold shrink-0">
            <span className="text-slate-500 font-semibold text-[11px]">
              Hiển thị {paginatedProducts.length}/{filteredProducts.length} mặt hàng
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="h-7 px-2.5 bg-white hover:bg-slate-50 border-slate-300 text-slate-700 text-xs font-bold gap-1 shadow-2xs"
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
                className="h-7 px-2.5 bg-white hover:bg-slate-50 border-slate-300 text-slate-700 text-xs font-bold gap-1 shadow-2xs"
              >
                <span>Trang sau</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* CỘT 3 (BÊN PHẢI - 3 COLS): HÓA ĐƠN POS TICKET CHUẨN */}
        <div className="lg:col-span-3 flex flex-col min-h-0 h-full">
          <Card className="p-3.5 border-slate-200 bg-white shadow-sm flex flex-col min-h-0 h-full justify-between">
            <div className="flex flex-col min-h-0 flex-1 space-y-2.5 overflow-hidden">
              <div className="flex items-center justify-between border-b pb-2 shrink-0">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  Hóa đơn
                </h3>
                <span className="text-xs font-mono text-slate-400">Mã: #HD8829</span>
              </div>

              {/* Customer Info Box (Dynamic: Retail Manual Inputs vs Auto Court Info) */}
              <div className="shrink-0">
                {hasCourtFee ? (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-blue-900 truncate">
                        <User className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{courtCustomer?.name || "Khách Đặt Sân"}</span>
                      </div>
                      <Badge className="bg-blue-600 text-white text-[9px] font-bold shrink-0">
                        Theo {courtCustomer?.courtName || "Sân"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-blue-700 pt-0.5">
                      <span>{courtCustomer?.phone ? `SĐT: ${courtCustomer.phone}` : "Khách theo lịch đặt sân"}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCartItems((prev) => prev.filter((i) => !i.isCourtFee));
                          setCourtCustomer(null);
                          toast.info("Đã xóa tiền sân, mở lại ô nhập tên & SĐT cho khách bán lẻ.");
                        }}
                        className="text-[10px] text-red-600 hover:underline font-semibold"
                      >
                        Hủy gộp sân
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
                        <User className="h-3.5 w-3.5 text-emerald-600" />
                        Thông tin khách mua lẻ
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setRetailCustomerName("Khách vãng lai");
                          setRetailCustomerPhone("");
                        }}
                        className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-full transition-colors"
                      >
                        Khách lẻ
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <Input
                        value={retailCustomerName}
                        onChange={(e) => setRetailCustomerName(e.target.value)}
                        placeholder="Tên khách (VD: Anh Nam)"
                        className="h-7 text-xs bg-white border-slate-200"
                      />
                      <Input
                        value={retailCustomerPhone}
                        onChange={(e) => setRetailCustomerPhone(e.target.value)}
                        placeholder="SĐT (VD: 0912 345 678)"
                        className="h-7 text-xs bg-white border-slate-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Items List - Scrollable */}
              <div className="divide-y divide-slate-100 flex-1 min-h-0 overflow-y-auto pr-1 text-xs">
                {cartItems.length === 0 ? (
                  <div className="py-6 text-center space-y-3">
                    <div className="space-y-1">
                      <ShoppingCart className="h-7 w-7 mx-auto text-slate-200" />
                      <p className="text-[11px] font-medium text-slate-400">Chưa chọn sản phẩm / tiền sân nào</p>
                    </div>

                    {lastPOSReceipt && (
                      <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-2.5 text-left space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Vừa thanh toán thành công
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold">#{lastPOSReceipt.code}</span>
                        </div>
                        <div className="text-[11px] text-slate-700 space-y-0.5">
                          <div className="font-bold truncate">{lastPOSReceipt.customerName}</div>
                          <div className="flex justify-between font-medium">
                            <span className="text-slate-500">{lastPOSReceipt.items.length} mục hàng</span>
                            <span className="text-emerald-700 font-bold">
                              {new Intl.NumberFormat("vi-VN").format(lastPOSReceipt.total)}đ
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          type="button"
                          onClick={() => setPosReceiptModalOpen(true)}
                          className="w-full h-7 text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg gap-1.5 shadow-xs"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          <span>In Lại Hóa Đơn Cho Khách</span>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.variantId} className="py-1.5 flex items-center justify-between gap-1">
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
            </div>

            {/* Calculations & Totals */}
            <div className="pt-2 border-t space-y-2 text-xs shrink-0">
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-bold text-slate-800">{new Intl.NumberFormat("vi-VN").format(subtotalAmount)}đ</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-black text-emerald-600 pt-1.5 border-t">
                <span>Tổng thanh toán:</span>
                <span className="text-base">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(finalTotalAmount)}</span>
              </div>

              {/* Payment Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  size="sm"
                  type="button"
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("cash")}
                  className={`h-8 font-bold text-xs ${paymentMethod === "cash" ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm" : ""}`}
                >
                  <Banknote className="h-3.5 w-3.5 mr-1" /> Tiền mặt
                </Button>

                <Button
                  size="sm"
                  type="button"
                  variant={paymentMethod === "bank_transfer" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("bank_transfer")}
                  className={`h-8 font-bold text-xs ${paymentMethod === "bank_transfer" ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm" : ""}`}
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
      <PosQuickRestockModal
        product={quickRestockProduct}
        onClose={() => setQuickRestockProduct(null)}
        quickRestockQty={quickRestockQty}
        setQuickRestockQty={setQuickRestockQty}
        onSubmit={handleQuickRestockSubmit}
        staffName={user?.name}
      />

      {/* Modal Báo Cáo Bàn Giao Ca Trực */}
      <PosShiftReportModal
        open={shiftReportOpen}
        onOpenChange={setShiftReportOpen}
        staffName={user?.name || "Nhân Viên Lễ Tân"}
        shiftOrdersCount={shiftOrdersCount}
        shiftCashTotal={shiftCashTotal}
        shiftTransferTotal={shiftTransferTotal}
        shiftTotalSum={shiftTotalSum}
      />

      {/* MODAL IN PHIẾU THU & VÉ SÂN QR POS TỰ ĐỘNG */}
      <PosReceiptModal
        open={posReceiptModalOpen}
        onOpenChange={setPosReceiptModalOpen}
        receipt={lastPOSReceipt}
      />

      {/* MODAL BẬT GIỜ VÀO SÂN / CHECK-IN QUẦY THU NGÂN */}
      <PosStartSessionModal
        open={startSessionDialogOpen}
        onOpenChange={setStartSessionDialogOpen}
        targetCourt={targetCourtForSession}
        customerName={sessionCustomerName}
        onCustomerNameChange={setSessionCustomerName}
        customerPhone={sessionCustomerPhone}
        onCustomerPhoneChange={setSessionCustomerPhone}
        selectedDurationOption={selectedDurationOption}
        onSelectDurationOption={setSelectedDurationOption}
        isStartingSession={isStartingSession}
        onConfirm={handleConfirmStartSession}
      />
    </AppLayout>
  );
}
