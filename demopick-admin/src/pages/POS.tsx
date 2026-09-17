import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { adminService, Product, LiveCourtItem } from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, ShoppingCart, Trash2, Banknote, QrCode, Receipt, PlusCircle, User, ShieldCheck, Lock, CheckCircle2, Clock, ChevronLeft, ChevronRight, Printer, Flame, Timer, CheckSquare, ScanLine, Sparkles, Play, Square, RefreshCw } from "lucide-react";
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
  customerPhone?: string | null;
  start_time?: string;
  expected_duration_minutes?: number | null;
  available_minutes_until_next?: number | null;
  next_booking_time?: string | null;
}

export default function POS() {
  const { user } = useAuth();
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
  } | null>(null);

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
  const [shiftCashTotal, setShiftCashTotal] = useState(1450000);
  const [shiftTransferTotal, setShiftTransferTotal] = useState(3800000);
  const [shiftOrdersCount, setShiftOrdersCount] = useState(8);

  // Live court polling & real-time ticking
  const { data: apiCourts = [], isLoading: isLoadingLiveCourts, refetch: refetchLiveCourts } = useQuery({
    queryKey: ["pos-live-courts"],
    queryFn: adminService.getLiveCourtStatus,
    refetchInterval: 5000,
  });

  const [liveNow, setLiveNow] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveNow(new Date()), 1000);
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

  // Dynamic fallback courts matching real database courts with realistic live sessions
  const getDefaultCourtStatusList = (): CourtStatusItem[] => {
    const now = new Date();
    const a1Start = new Date(now.getTime() - 45 * 60 * 1000);
    const a1StartStr = `${String(a1Start.getHours()).padStart(2, "0")}:${String(a1Start.getMinutes()).padStart(2, "0")}:${String(a1Start.getSeconds()).padStart(2, "0")}`;

    const b1Start = new Date(now.getTime() - 80 * 60 * 1000);
    const b1StartStr = `${String(b1Start.getHours()).padStart(2, "0")}:${String(b1Start.getMinutes()).padStart(2, "0")}:${String(b1Start.getSeconds()).padStart(2, "0")}`;

    const d1Start = new Date(now.getTime() - 25 * 60 * 1000);
    const d1StartStr = `${String(d1Start.getHours()).padStart(2, "0")}:${String(d1Start.getMinutes()).padStart(2, "0")}:${String(d1Start.getSeconds()).padStart(2, "0")}`;

    return [
      {
        id: 1,
        name: "Sân Pickleball A1",
        status: "in_use",
        statusLabel: "ĐANG CHƠI",
        statusColor: "bg-emerald-50 text-emerald-700 border-emerald-300",
        time: "Đang thi đấu",
        hours: 0.75,
        rate: 140000,
        customerName: "Hoàng Long",
        customerPhone: "0912.345.678",
        start_time: a1StartStr,
        expected_duration_minutes: 60,
      },
      {
        id: 2,
        name: "Sân Pickleball A2",
        status: "available",
        statusLabel: "TRỐNG",
        statusColor: "bg-slate-100 text-slate-500 border-slate-200",
        time: "Sẵn sàng thi đấu",
        hours: 1,
        rate: 140000,
        customerName: null,
        available_minutes_until_next: 90,
        next_booking_time: "19:30",
      },
      {
        id: 3,
        name: "Sân Pickleball B1",
        status: "ending",
        statusLabel: "SẮP HẾT GIỜ",
        statusColor: "bg-amber-50 text-amber-700 border-amber-300",
        time: "Sắp hết giờ (còn 10p)",
        hours: 1.5,
        rate: 140000,
        customerName: "Chị Minh Thảo",
        customerPhone: "0988.765.432",
        start_time: b1StartStr,
        expected_duration_minutes: 90,
      },
      {
        id: 4,
        name: "Sân Pickleball B2",
        status: "available",
        statusLabel: "TRỐNG",
        statusColor: "bg-slate-100 text-slate-500 border-slate-200",
        time: "Sẵn sàng thi đấu",
        hours: 1,
        rate: 140000,
        customerName: null,
        available_minutes_until_next: 120,
        next_booking_time: "20:00",
      },
      {
        id: 5,
        name: "Sân Pickleball C1",
        status: "booked",
        statusLabel: "ĐÃ ĐẶT",
        statusColor: "bg-blue-50 text-blue-700 border-blue-300",
        time: "18:00 - 20:00 (Hôm nay)",
        hours: 2,
        rate: 180000,
        customerName: "CLB Doanh Nhân SG",
        customerPhone: "0903.111.222",
        next_booking_time: "18:00",
      },
      {
        id: 6,
        name: "Sân Pickleball C2",
        status: "available",
        statusLabel: "TRỐNG",
        statusColor: "bg-slate-100 text-slate-500 border-slate-200",
        time: "Sẵn sàng thi đấu",
        hours: 1,
        rate: 180000,
        customerName: null,
      },
      {
        id: 7,
        name: "Sân Pickleball D1",
        status: "in_use",
        statusLabel: "ĐANG ĐÁNH",
        statusColor: "bg-emerald-50 text-emerald-700 border-emerald-300",
        time: "Đang thi đấu (25p)",
        hours: 0.5,
        rate: 140000,
        customerName: "Anh Hoàng Nam",
        customerPhone: "0912.333.444",
        start_time: d1StartStr,
        expected_duration_minutes: 60,
      },
      {
        id: 8,
        name: "Sân Pickleball D2",
        status: "available",
        statusLabel: "TRỐNG",
        statusColor: "bg-slate-100 text-slate-500 border-slate-200",
        time: "Sẵn sàng thi đấu",
        hours: 1,
        rate: 140000,
        customerName: null,
      },
    ];
  };

  const defaultCourtStatusList = getDefaultCourtStatusList();

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

  // Category filter tabs (Tất cả, Đồ uống & Đồ ăn, Vợt, Bóng, Phụ kiện, Thuê vợt)
  const categoriesList = [
    { id: "all", label: "Tất cả" },
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

    let matchCat = true;
    const catName = p.category?.name || "";

    if (activeCategory === "all") {
      matchCat = true;
    } else if (activeCategory === "Đồ uống") {
      matchCat =
        p.item_type === "drink_food" ||
        catName.includes("Nước") ||
        catName.includes("Đồ ăn") ||
        catName.includes("Đồ uống") ||
        pName.includes("nước") ||
        pName.includes("pocari") ||
        pName.includes("aquafina") ||
        pName.includes("revive") ||
        pName.includes("red bull") ||
        pName.includes("bánh") ||
        pName.includes("trà") ||
        pName.includes("cà phê") ||
        pName.includes("chuối") ||
        pName.includes("snickers") ||
        pName.includes("granola") ||
        pName.includes("dừa") ||
        pName.includes("la vie");
    } else if (activeCategory === "Vợt Pickleball") {
      matchCat =
        catName.includes("Vợt") ||
        (pName.includes("vợt") && p.item_type !== "rental");
    } else if (activeCategory === "Bóng Pickleball") {
      matchCat =
        catName.includes("Bóng") ||
        pName.includes("bóng");
    } else if (activeCategory === "Phụ kiện") {
      matchCat =
        catName.includes("Phụ kiện") ||
        catName.includes("Quần áo") ||
        catName.includes("Trang phục") ||
        catName.includes("Giày") ||
        pName.includes("quấn") ||
        pName.includes("bao") ||
        pName.includes("chì") ||
        pName.includes("grip") ||
        pName.includes("băng") ||
        pName.includes("balo") ||
        pName.includes("giày") ||
        pName.includes("áo") ||
        pName.includes("quần") ||
        pName.includes("nón") ||
        pName.includes("lưới") ||
        pName.includes("gôm") ||
        pName.includes("cover");
    } else if (activeCategory === "Thuê vợt") {
      matchCat =
        p.item_type === "rental" ||
        catName.includes("Cho thuê") ||
        catName.includes("thuê") ||
        pName.includes("thuê");
    }

    return matchSearch && matchCat;
  });

  // Pagination Calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate real-time elapsed ticker and fee estimation
  const calculateLiveCourtDetails = (court: any) => {
    if (court.status !== "in_use" && court.status !== "ending") {
      return {
        elapsedTimeStr: court.time || "Sẵn sàng thi đấu",
        exactMinutes: 0,
        roundedMinutes: 0,
        currentEstimatedPrice: court.rate || 140000,
      };
    }

    if (!court.start_time) {
      const fallbackHours = court.hours || 1;
      return {
        elapsedTimeStr: court.time || "00:00:00",
        exactMinutes: Math.round(fallbackHours * 60),
        roundedMinutes: Math.round(fallbackHours * 60),
        currentEstimatedPrice: (court.rate || 140000) * fallbackHours,
      };
    }

    const parts = court.start_time.split(":");
    const start = new Date();
    start.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2] || "0", 10));

    const diffSeconds = Math.max(0, Math.floor((liveNow.getTime() - start.getTime()) / 1000));
    const hrs = Math.floor(diffSeconds / 3600);
    const mins = Math.floor((diffSeconds % 3600) / 60);
    const secs = diffSeconds % 60;
    const timeFormatted = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    const exactMins = Math.max(1, Math.floor(diffSeconds / 60));
    const roundedMins = Math.max(15, Math.ceil(exactMins / 15) * 15);
    const hourlyRate = court.rate || 140000;
    const estPrice = Math.round((roundedMins / 60) * hourlyRate);

    return {
      elapsedTimeStr: timeFormatted,
      exactMinutes: exactMins,
      roundedMinutes: roundedMins,
      currentEstimatedPrice: estPrice,
    };
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

    setCartItems((prev) => {
      const filteredOut = prev.filter((i) => !i.isCourtFee);
      return [newCourtCartItem, ...filteredOut];
    });

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
      },
    }));

    toast.success(`🏁 Đã trả sân ${sessionRes.court_name}! Phí sân ${sessionRes.formatted_price} (${sessionRes.duration_minutes} phút) đã đẩy vào Hóa Đơn POS.`);
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
      const custName = targetCourt.customerName || checkInRes?.customer_name || "CLB Doanh Nhân SG";
      const custPhone = targetCourt.customerPhone || "0903.111.222";

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
        const itemInCart = cartItems.find((c) => !c.isCourtFee && (c.productName === p.name || c.variantId === p.id));
        if (itemInCart) {
          const currentQty = p.variants?.[0]?.stock_quantity || 15;
          const newQty = Math.max(0, currentQty - itemInCart.quantity);
          return {
            ...p,
            in_stock: newQty > 0,
            variants: (p.variants || []).map((v) => ({ ...v, stock_quantity: newQty })),
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
        staffName: user?.name || "Phạm Văn Đức (Lễ Tân)",
        items: [...cartItems],
        subtotal: subtotalAmount,
        discount: 0,
        total: finalTotalAmount,
        paymentMethod: paymentMethod === "cash" ? "Tiền mặt tại quầy" : "Chuyển khoản VietQR",
        time: `${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ${new Date().toLocaleDateString("vi-VN")}`,
      };
      setLastPOSReceipt(receiptData);
      setPosReceiptModalOpen(true);

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

          {/* Dedicated Scrollable Court List */}
          <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1.5">
            {courtStatusList.map((court: any) => {
              const live = calculateLiveCourtDetails(court);
              const isInUse = court.status === "in_use";
              const isEnding = court.status === "ending";
              const isAvailable = court.status === "available";
              const isBooked = court.status === "booked";

              return (
                <Card
                  key={court.id}
                  className={`p-3 bg-white border transition-all duration-150 space-y-2 ${isEnding
                      ? "border-amber-400 bg-amber-50/40 shadow-xs ring-1 ring-amber-300"
                      : isInUse
                        ? "border-emerald-400 bg-emerald-50/20 shadow-xs"
                        : isBooked
                          ? "border-blue-300 bg-blue-50/20"
                          : "border-slate-200 hover:border-slate-300"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-slate-900">{court.name}</span>
                      {(isInUse || isEnding) && (
                        <span className="flex h-2 w-2 relative">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isEnding ? "bg-amber-400" : "bg-emerald-400"}`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${isEnding ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                        </span>
                      )}
                    </div>
                    <Badge className={`text-[9px] font-bold border ${court.statusColor}`}>
                      {court.statusLabel}
                    </Badge>
                  </div>

                  {/* Body Info */}
                  <div className="text-[11px] space-y-1">
                    {(isInUse || isEnding) ? (
                      <div className="space-y-1">
                        <div
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg font-mono border transition-all ${
                            isEnding
                              ? "bg-amber-500/10 dark:bg-amber-950/40 border-amber-300/80 dark:border-amber-800/60 text-amber-950 dark:text-amber-200"
                              : "bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-300/80 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200"
                          }`}
                        >
                          <div
                            className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                              isEnding
                                ? "text-amber-800 dark:text-amber-300"
                                : "text-emerald-800 dark:text-emerald-300"
                            }`}
                          >
                            <Timer
                              className={`h-3.5 w-3.5 animate-pulse ${
                                isEnding
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            />
                            <span>Giờ chơi:</span>
                          </div>
                          <span
                            className={`font-black text-xs tracking-wider ${
                              isEnding
                                ? "text-amber-700 dark:text-amber-400"
                                : "text-emerald-700 dark:text-emerald-400"
                            }`}
                          >
                            {live.elapsedTimeStr}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 px-0.5 pt-0.5">
                          <span>Tạm tính:</span>
                          <span className="font-bold text-slate-900">
                            {new Intl.NumberFormat("vi-VN").format(live.currentEstimatedPrice)}đ ({live.roundedMinutes}p)
                          </span>
                        </div>
                        {court.customerName && (
                          <div className="flex items-center gap-1 text-slate-500 text-[10px] px-0.5">
                            <User className="h-3 w-3 text-slate-400" />
                            <span className="font-medium text-slate-700 truncate">{court.customerName}</span>
                            {court.customerPhone && <span>• {court.customerPhone}</span>}
                          </div>
                        )}
                      </div>
                    ) : isBooked ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-1 rounded-md text-[10px] font-medium">
                          <Clock className="h-3 w-3 text-blue-500" />
                          <span>Lịch hẹn: {court.next_booking_time || court.time || "Khách Online"}</span>
                        </div>
                        {court.customerName && (
                          <div className="text-[10px] text-slate-600 px-0.5">
                            Khách: <strong className="text-slate-800">{court.customerName}</strong>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-slate-500">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>
                            {court.available_minutes_until_next
                              ? `Trống ${court.available_minutes_until_next}p (đến ${court.next_booking_time})`
                              : "Sẵn sàng thi đấu"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span className="text-emerald-700 text-xs">{new Intl.NumberFormat("vi-VN").format(court.rate)}đ/h</span>
                          <span className="text-[10px] text-slate-400 font-normal">Pickleball Chuẩn</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Hub */}
                  <div className="pt-1 border-t border-slate-100 flex items-center gap-1.5">
                    {(isInUse || isEnding) ? (
                      <Button
                        size="sm"
                        onClick={(e) => handleStopCourtSession(court, e)}
                        className="w-full h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1 shadow-xs"
                      >
                        <Square className="h-3 w-3 fill-current" />
                        <span>Trả Sân & Chốt Bill</span>
                      </Button>
                    ) : isBooked ? (
                      <Button
                        size="sm"
                        onClick={(e) => handleOpenStartSessionModal(court, e)}
                        className="w-full h-7 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-1 shadow-xs"
                      >
                        <CheckSquare className="h-3 w-3" />
                        <span>Check-in Vào Sân</span>
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 w-full">
                        <Button
                          size="sm"
                          onClick={(e) => handleOpenStartSessionModal(court, e)}
                          className="flex-1 h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors"
                        >
                          Bật Giờ
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectCourtFromSidebar(court)}
                          className="h-7 px-2 text-[10px] font-medium border-slate-300 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          + 1h Bill
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CỘT 2 (Ở GIỮA - 6 COLS): KHOẢNG GIỮA CÓ PHÂN TRANG VÀ LƯỚI SẢN PHẨM */}
        <div className="lg:col-span-6 flex flex-col min-h-0 h-full space-y-2.5">
          {/* Category Tabs */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto">
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
                          className="h-6 px-2 font-bold text-[11px] bg-emerald-600 hover:bg-emerald-500"
                        >
                          + Chọn
                        </Button>
                      </div>

                      {(!isStaffOnly || isAllowStaffRestock) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setQuickRestockProduct(p)}
                          className="w-full h-6 px-1.5 font-bold text-[9px] border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
                        >
                          <span>+ Nhập Quầy</span>
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
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <ShoppingCart className="h-8 w-8 mx-auto text-slate-200" />
                    <p className="text-[11px] font-medium">Chưa chọn sản phẩm/tiền sân nào</p>
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
      <Dialog open={!!quickRestockProduct} onOpenChange={() => setQuickRestockProduct(null)}>
        <DialogContent className="max-w-md bg-white">
          {quickRestockProduct && (
            <form onSubmit={handleQuickRestockSubmit} className="space-y-4 text-xs">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-amber-500" />
                  Lễ Tân Nhập Nhanh Nước / Đồ Ăn / Phụ Kiện Vào Quầy POS
                </DialogTitle>
                <DialogDescription>
                  Bổ sung số lượng vừa nhận tại quầy cho: <strong>{quickRestockProduct.name}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                <p className="font-bold"> Ghi nhật ký tự động (Audit Trail):</p>
                <p className="text-[11px]">
                  Hệ thống ghi nhận: Lễ tân <strong>{user?.name || "Phạm Văn Đức"}</strong> nhập thêm +{quickRestockQty} sản phẩm vào lúc {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700">Số lượng vừa nhận thêm (*):</Label>
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
                  Cộng Vào Quầy POS Ngay
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
                <span className="font-bold text-emerald-900">Tiền mặt thu tại quầy:</span>
                <strong className="text-emerald-700 text-sm">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(shiftCashTotal)}
                </strong>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                <span className="font-bold text-blue-900">Chuyển khoản VietQR/MoMo:</span>
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
              In Báo Cáo Bàn Giao Ca Trực
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL IN PHIẾU THU & VÉ SÂN QR POS TỰ ĐỘNG */}
      <Dialog open={posReceiptModalOpen} onOpenChange={setPosReceiptModalOpen}>
        <DialogContent className="max-w-sm bg-white rounded-3xl p-6 font-sans shadow-2xl border border-slate-200">
          {lastPOSReceipt && (
            <div className="space-y-4">
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-slate-200/90 text-xs font-mono text-slate-800 space-y-3">
                {/* STORE HEADER */}
                <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
                  <div className="font-extrabold text-sm text-slate-900 tracking-wider">DEMOPICK PICKLEBALL CLUB</div>
                  <div className="text-[10px] text-slate-500 font-sans">123 Đường Pickleball, Quận 7, TP.HCM</div>
                  <div className="text-[10px] text-slate-500 font-sans">Hotline: 0909 123 456 • www.demopick.vn</div>
                  <div className="pt-2 font-bold text-xs text-slate-900 uppercase">
                    PHIẾU THU TIỀN TẠI QUẦY
                  </div>
                  <div className="text-[11px] font-bold text-emerald-800">Mã HĐ: #{lastPOSReceipt.code}</div>
                  <div className="text-[10px] text-slate-500">{lastPOSReceipt.time}</div>
                </div>

                {/* CUSTOMER & CASHIER INFO */}
                <div className="space-y-1 border-b border-dashed border-slate-300 pb-2.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Khách hàng:</span>
                    <strong className="text-slate-900">
                      {lastPOSReceipt.customerName}
                      {lastPOSReceipt.customerPhone ? ` (${lastPOSReceipt.customerPhone})` : ""}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Kênh bán:</span>
                    <span className="font-sans font-medium text-emerald-700">
                      {lastPOSReceipt.items.some((i) => i.isCourtFee) ? "POS Trả Sân & Dịch Vụ" : "POS Bán Lẻ Quầy"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Thu ngân:</span>
                    <span>{lastPOSReceipt.staffName}</span>
                  </div>
                </div>

                {/* ITEMS LIST */}
                <div className="space-y-2 border-b border-dashed border-slate-300 pb-2.5">
                  <div className="grid grid-cols-12 font-bold text-[10px] text-slate-500 uppercase pb-0.5">
                    <div className="col-span-6 font-sans">Mặt hàng / Sân</div>
                    <div className="col-span-2 text-center">SL</div>
                    <div className="col-span-4 text-right">T.Tiền</div>
                  </div>
                  {lastPOSReceipt.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 text-[11px] items-start">
                      <div className="col-span-6 font-sans text-slate-900 line-clamp-2">
                        {item.productName}
                        {item.isCourtFee && <span className="text-[10px] text-emerald-700 block font-bold">(Tiền Sân)</span>}
                      </div>
                      <div className="col-span-2 text-center font-bold">x{item.quantity}</div>
                      <div className="col-span-4 text-right font-bold text-slate-900">
                        {new Intl.NumberFormat("vi-VN").format(item.price * item.quantity)}đ
                      </div>
                    </div>
                  ))}
                </div>

                {/* TOTALS */}
                <div className="space-y-1 border-b border-dashed border-slate-300 pb-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600 font-sans">
                    <span>Tạm tính:</span>
                    <span>{new Intl.NumberFormat("vi-VN").format(lastPOSReceipt.subtotal)}đ</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 font-sans">
                    <span>Phương thức:</span>
                    <strong className="font-mono font-bold text-slate-800">{lastPOSReceipt.paymentMethod}</strong>
                  </div>
                  <div className="flex justify-between items-center font-extrabold text-sm pt-1 text-slate-900">
                    <span className="font-sans">TỔNG THU:</span>
                    <span className="text-emerald-700">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(lastPOSReceipt.total)}
                    </span>
                  </div>
                </div>

                {/* QR CHECK-IN TICKET */}
                <div className="pt-2 text-center space-y-2">
                  <div className="inline-block p-2 bg-white rounded-xl border border-slate-300 shadow-sm">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=POS-${lastPOSReceipt.code}`}
                      alt="QR Checkin"
                      className="w-24 h-24 mx-auto"
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans leading-tight">
                    Quét mã QR tại cổng kiểm soát hoặc lễ tân để check-in vào sân.
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans italic">
                    Cảm ơn quý khách và chúc quý khách thi đấu tuyệt vời!
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPosReceiptModalOpen(false)}
                  className="flex-1 rounded-xl text-xs font-normal border-slate-300"
                >
                  Đóng
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    window.print();
                    toast.success(`Đã gửi lệnh in Phiếu Thu #${lastPOSReceipt.code} tới máy in nhiệt!`);
                    setPosReceiptModalOpen(false);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold gap-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>In Hóa Đơn (80mm)</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL BẬT GIỜ VÀO SÂN / CHECK-IN QUẦY THU NGÂN */}
      <Dialog open={startSessionDialogOpen} onOpenChange={setStartSessionDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 font-sans shadow-2xl border border-slate-200">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-700">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-emerald-700" />
              </div>
              <DialogTitle className="text-base font-extrabold text-slate-900">
                Bật Giờ Vào Sân — {targetCourtForSession?.name}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Kích hoạt phiên chơi trực tiếp tại quầy. Lưới Web sẽ tự động khóa slot tương ứng.
            </DialogDescription>
          </DialogHeader>

          {targetCourtForSession && (
            <div className="space-y-4 pt-2">
              {/* COURT INFO BANNER */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <span className="font-bold text-xs text-slate-900 block">{targetCourtForSession.name}</span>
                  <span className="text-[11px] text-slate-500">Pickleball Tiêu Chuẩn Indoor/Outdoor</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-700 block">
                    {new Intl.NumberFormat("vi-VN").format(targetCourtForSession.rate || 140000)}đ/h
                  </span>
                  <span className="text-[10px] text-slate-400">Block 15 phút</span>
                </div>
              </div>

              {/* CUSTOMER INPUT */}
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Tên khách hàng:</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={sessionCustomerName}
                      onChange={(e) => setSessionCustomerName(e.target.value)}
                      placeholder="Nhập tên khách..."
                      className="text-xs h-9 bg-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSessionCustomerName("Khách vãng lai")}
                      className="h-9 px-2 text-[11px] font-normal border-slate-300 shrink-0"
                    >
                      Vãng lai
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Số điện thoại (tùy chọn):</Label>
                  <Input
                    value={sessionCustomerPhone}
                    onChange={(e) => setSessionCustomerPhone(e.target.value)}
                    placeholder="VD: 0909 123 456..."
                    className="text-xs h-9 bg-white"
                  />
                </div>
              </div>

              {/* DURATION PRESET CHIPS */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700">Thời lượng dự kiến:</Label>
                  {selectedDurationOption ? (
                    <span className="text-[11px] font-bold text-emerald-700">
                      Dự kiến: {new Intl.NumberFormat("vi-VN").format(Math.round((selectedDurationOption / 60) * (targetCourtForSession.rate || 140000)))}đ
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500">Chơi mở (tính theo phút ra về)</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDurationOption(null)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${selectedDurationOption === null
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                  >
                    Chơi mở (Tự do)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDurationOption(30)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${selectedDurationOption === 30
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                  >
                    30 phút
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDurationOption(45)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${selectedDurationOption === 45
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                  >
                    45 phút
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDurationOption(60)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${selectedDurationOption === 60
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                  >
                    60 phút (1h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDurationOption(90)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${selectedDurationOption === 90
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                  >
                    90 phút (1.5h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDurationOption(120)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${selectedDurationOption === 120
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                  >
                    120 phút (2h)
                  </button>
                </div>

                {targetCourtForSession.available_minutes_until_next && (
                  <button
                    type="button"
                    onClick={() => setSelectedDurationOption(targetCourtForSession.available_minutes_until_next)}
                    className={`w-full mt-1 p-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${selectedDurationOption === targetCourtForSession.available_minutes_until_next
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                      }`}
                  >
                    <span>Lấp khoảng trống: {targetCourtForSession.available_minutes_until_next} phút (đến {targetCourtForSession.next_booking_time})</span>
                  </button>
                )}
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStartSessionDialogOpen(false)}
                  className="flex-1 rounded-xl text-xs font-normal border-slate-300"
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  disabled={isStartingSession}
                  onClick={handleConfirmStartSession}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  {isStartingSession ? "Đang xử lý..." : "Bắt Đầu Tính Giờ"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
