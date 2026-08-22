import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Receipt,
  Printer,
  RefreshCw,
  CheckCircle2,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Plus,
  Truck,
  Globe,
  Clock,
  MapPin,
  Phone,
  X,
  Package,
  QrCode,
  ShieldCheck,
  Send,
  Navigation,
  Check,
  FastForward,
  Zap,
} from "lucide-react";
import { notificationService } from "@/services/notification.service";
import {
  shippingService,
  AVAILABLE_CARRIERS,
  ShippingCarrier,
  ShippingOrderInfo,
} from "@/services/shipping.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface OrderItem {
  id: number;
  name: string;
  qty: number;
  price: number;
}

interface Order {
  code: string;
  customerName: string;
  customerPhone?: string;
  staffName: string;
  type: "POS Quầy" | "Đặt Sân Online";
  posCategory?: "retail" | "court_service";
  courtInfo?: {
    courtName: string;
    duration: string;
    timeRange: string;
  };
  totalAmount: number;
  paymentMethod: "Tiền mặt" | "VietQR" | "MoMo" | "COD";
  status: "PAID" | "PENDING" | "SHIPPED" | "COMPLETED" | "REFUNDED";
  createdAt: string;
  dateStr: string;
  items: OrderItem[];
  editNote?: string;
  shippingAddress?: string;
  shippingCarrier?: ShippingCarrier;
  trackingNumber?: string;
  shippingFee?: number;
  codAmount?: number;
  deliveryNote?: string;
}

const mockOrders: Order[] = [
  {
    code: "HD-88291",
    customerName: "Nguyễn Văn An",
    customerPhone: "0987654321",
    staffName: "Hệ thống Tự Động Online",
    type: "Đặt Sân Online",
    totalAmount: 5580000,
    paymentMethod: "VietQR",
    status: "PENDING",
    createdAt: "2026-08-09 08:30",
    dateStr: "2026-08-09",
    shippingAddress: "Số 10 Đường Pickleball, Q. Cầu Giấy, Hà Nội",
    items: [
      { id: 1, name: "Vợt Pickleball JOOLA Perseus 3S 16mm Carbon", qty: 1, price: 5490000 },
      { id: 2, name: "Bóng Pickleball Franklin X-40 (Hộp 4 quả)", qty: 1, price: 90000 },
    ],
  },
  {
    code: "HD-88295",
    customerName: "Trần Văn Cường",
    customerPhone: "0912345678",
    staffName: "Hệ thống Tự Động Online",
    type: "Đặt Sân Online",
    totalAmount: 5580000,
    paymentMethod: "VietQR",
    status: "SHIPPED",
    createdAt: "2026-08-09 08:15",
    dateStr: "2026-08-09",
    shippingAddress: "Số 25 Phố Lý Thường Kiệt, Q. Hoàn Kiếm, Hà Nội",
    shippingCarrier: "GHN",
    trackingNumber: "GHN-VN-882910",
    items: [{ id: 10, name: "Vợt JOOLA Perseus 16mm + Hộp 4 Bóng Franklin X-40", qty: 1, price: 5580000 }],
  },
  {
    code: "HD-77102",
    customerName: "Lê Minh Tuấn",
    customerPhone: "0908889999",
    staffName: "Hệ thống Tự Động Online",
    type: "Đặt Sân Online",
    totalAmount: 2850000,
    paymentMethod: "COD",
    status: "COMPLETED",
    createdAt: "2026-08-07 14:30",
    dateStr: "2026-08-07",
    shippingAddress: "Toà nhà Bitexco, Số 2 Hải Triều, Bến Nghé, Quận 1, TP.HCM",
    shippingCarrier: "GHTK",
    trackingNumber: "GHTK-SGN-44912",
    items: [{ id: 11, name: "Vợt Pickleball Franklin Carbon Pro 14mm", qty: 1, price: 2850000 }],
  },
  {
    code: "HD-88292",
    customerName: "Trần Thị Bích",
    customerPhone: "0909123456",
    staffName: "Phạm Văn Đức (Ca Sáng)",
    type: "POS Quầy",
    posCategory: "retail",
    totalAmount: 5580000,
    paymentMethod: "Tiền mặt",
    status: "PAID",
    createdAt: "2026-08-09 09:15",
    dateStr: "2026-08-09",
    items: [
      { id: 2, name: "Vợt Pickleball JOOLA Perseus 16mm", qty: 1, price: 5490000 },
      { id: 3, name: "Nước Suối Aquafina 500ml", qty: 3, price: 30000 },
    ],
  },
  {
    code: "HD-88296",
    customerName: "Đặng Văn Lâm",
    customerPhone: "0918889999",
    staffName: "Phạm Văn Đức (Ca Sáng)",
    type: "POS Quầy",
    posCategory: "court_service",
    courtInfo: {
      courtName: "Sân 01 (VIP Indoor)",
      duration: "1.5 giờ",
      timeRange: "17:00 - 18:30",
    },
    totalAmount: 320000,
    paymentMethod: "VietQR",
    status: "PAID",
    createdAt: "2026-08-09 09:30",
    dateStr: "2026-08-09",
    items: [
      { id: 20, name: "Tiền thuê Sân 01 (17:00 - 18:30 / 1.5h)", qty: 1, price: 270000 },
      { id: 21, name: "Nước Điện Giải Pocari Sweat 500ml", qty: 2, price: 25000 },
    ],
  },
  {
    code: "HD-88293",
    customerName: "Lê Hoàng Long",
    customerPhone: "0977889900",
    staffName: "Hệ thống Tự Động Online",
    type: "Đặt Sân Online",
    totalAmount: 180000,
    paymentMethod: "MoMo",
    status: "REFUNDED",
    createdAt: "2026-08-09 07:00",
    dateStr: "2026-08-09",
    shippingAddress: "Khách hủy sân 2 (06:00 - 08:00)",
    items: [{ id: 4, name: "Đặt Sân 2 (06:00 - 08:00) - [Đã Hủy Hoàn 100%]", qty: 1, price: 180000 }],
  },
  {
    code: "HD-88294",
    customerName: "Phạm Quốc Bảo",
    customerPhone: "0933445566",
    staffName: "Nguyễn Thị Hương (Ca Chiều)",
    type: "POS Quầy",
    posCategory: "court_service",
    courtInfo: {
      courtName: "Sân 03 (Standard)",
      duration: "2.0 giờ",
      timeRange: "18:00 - 20:00",
    },
    totalAmount: 460000,
    paymentMethod: "VietQR",
    status: "PAID",
    createdAt: "2026-08-09 10:00",
    dateStr: "2026-08-09",
    items: [
      { id: 5, name: "Tiền thuê Sân 03 (18:00 - 20:00 / 2h)", qty: 1, price: 320000 },
      { id: 6, name: "Bóng Pickleball Franklin X-40 (Hộp 4 quả)", qty: 1, price: 90000 },
      { id: 7, name: "Băng Cán Vợt JOOLA Pro Grip", qty: 2, price: 25000 },
    ],
  },
];

const masterCatalog = [
  { id: 201, name: "Vợt Pickleball JOOLA Perseus 3S 16mm Carbon", price: 5490000, category: "Vợt" },
  { id: 202, name: "Vợt Pickleball Franklin Carbon Pro 14mm", price: 2850000, category: "Vợt" },
  { id: 203, name: "Vợt Pickleball CRBN 1X Power Series 16mm", price: 5800000, category: "Vợt" },
  { id: 204, name: "Vợt Pickleball Selkirk Vanguard Power Air", price: 6200000, category: "Vợt" },
  { id: 205, name: "Bóng Pickleball Franklin X-40 (Hộp 4 quả)", price: 180000, category: "Bóng" },
  { id: 206, name: "Hộp 12 Bóng Franklin X-40 Outdoor", price: 420000, category: "Bóng" },
  { id: 207, name: "Quả bóng thi đấu Franklin X-40 Single", price: 45000, category: "Bóng" },
  { id: 208, name: "Băng Cán Vợt JOOLA Pro Grip Chống Trượt", price: 35000, category: "Phụ kiện" },
  { id: 209, name: "Bao vợt Pickleball cao cấp chống sốc", price: 250000, category: "Phụ kiện" },
  { id: 210, name: "Nước Suối Aquafina 500ml", price: 15000, category: "Đồ uống" },
  { id: 211, name: "Nước Điện Giải Pocari Sweat 500ml", price: 25000, category: "Đồ uống" },
  { id: 212, name: "Nước Tăng Lực Revive Chanh Muối 500ml", price: 20000, category: "Đồ uống" },
  { id: 213, name: "Nước Bò Húc Red Bull Thái", price: 25000, category: "Đồ uống" },
  { id: 214, name: "Xúc Xích Nướng CP Phô Mai", price: 20000, category: "Đồ ăn" },
  { id: 215, name: "Bánh Mì Nóng Giòn Pa-tê Trứng", price: 35000, category: "Đồ ăn" },
  { id: 216, name: "Dịch Vụ Thuê Vợt Thi Đấu (1 ca)", price: 50000, category: "Dịch vụ" },
  { id: 217, name: "Dịch Vụ Thuê Máy Bắn Bóng (1 giờ)", price: 120000, category: "Dịch vụ" },
  { id: 218, name: "Phí Thêm Giờ Chơi Sân (30 phút)", price: 90000, category: "Dịch vụ sân" },
];

export default function Orders() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"online" | "pos">("online");
  const [posSubFilter, setPosSubFilter] = useState<"court_service" | "retail">("court_service");
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "pos") {
      setViewMode("pos");
      setStatusFilter("PAID");
    } else if (tab === "online") {
      setViewMode("online");
      setStatusFilter("PENDING");
    }
  }, [searchParams]);

  const [search, setSearch] = useState("");
  const [datePeriod, setDatePeriod] = useState("today");
  const [customDate, setCustomDate] = useState("2026-08-09");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [ordersList, setOrdersList] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem("demopick_orders_admin");
      return saved ? JSON.parse(saved) : mockOrders;
    } catch {
      return mockOrders;
    }
  });

  useEffect(() => {
    localStorage.setItem("demopick_orders_admin", JSON.stringify(ordersList));
  }, [ordersList]);

  // Sync orders in realtime when updated via localStorage in client app
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "demopick_orders_admin" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setOrdersList(parsed);
          }
        } catch { }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [printReceiptOrder, setPrintReceiptOrder] = useState<Order | null>(null);

  // LOGISTICS MODAL STATES
  const [createShippingModalOrder, setCreateShippingModalOrder] = useState<Order | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<ShippingCarrier>("GHN");
  const [shippingWeightGram, setShippingWeightGram] = useState(650);
  const [customDeliveryNote, setCustomDeliveryNote] = useState("Cho xem hàng, không thử / Hàng thể thao cao cấp");

  const [printShippingLabelInfo, setPrintShippingLabelInfo] = useState<ShippingOrderInfo | null>(null);
  const [trackingModalInfo, setTrackingModalInfo] = useState<ShippingOrderInfo | null>(null);

  const [searchProductQuery, setSearchProductQuery] = useState("");

  // EXECUTE CREATE MOCK SHIPPING ORDER
  const handleCreateShippingSubmit = () => {
    if (!createShippingModalOrder) return;

    const itemsText = createShippingModalOrder.items.map((i) => `${i.qty}x ${i.name}`).join(", ");
    const { fee } = shippingService.calculateShippingFee(
      createShippingModalOrder.shippingAddress || "Hà Nội",
      shippingWeightGram,
      selectedCarrier,
      createShippingModalOrder.totalAmount
    );

    const shippingInfo = shippingService.createShippingOrder({
      orderCode: createShippingModalOrder.code,
      carrier: selectedCarrier,
      receiverName: createShippingModalOrder.customerName,
      receiverAddress: createShippingModalOrder.shippingAddress || "Số 10 Đường Pickleball, Q. Cầu Giấy, Hà Nội",
      receiverPhone: createShippingModalOrder.customerPhone || "0987654321",
      itemsSummary: itemsText,
      weightGram: shippingWeightGram,
      shippingFee: fee,
      codAmount: createShippingModalOrder.paymentMethod === "COD" ? createShippingModalOrder.totalAmount : 0,
      paymentMethod: createShippingModalOrder.paymentMethod,
      deliveryNote: customDeliveryNote,
    });

    const updatedOrders = ordersList.map((o) =>
      o.code === createShippingModalOrder.code
        ? {
            ...o,
            status: "SHIPPED" as const,
            shippingCarrier: selectedCarrier,
            trackingNumber: shippingInfo.trackingNumber,
            shippingFee: fee,
          }
        : o
    );
    setOrdersList(updatedOrders);

    notificationService.sendOrderShippedNotice({
      orderCode: createShippingModalOrder.code,
      customerName: createShippingModalOrder.customerName,
      shippingAddress: createShippingModalOrder.shippingAddress || "Số 10 Đường Pickleball, Q. Cầu Giấy, Hà Nội",
      totalAmount: createShippingModalOrder.totalAmount,
    });

    toast.success(`Đã tạo vận đơn ${selectedCarrier} thành công! Mã: ${shippingInfo.trackingNumber}`);
    setCreateShippingModalOrder(null);
    setPrintShippingLabelInfo(shippingInfo);
  };

  // ADVANCE TRACKING STAGE SIMULATION
  const handleAdvanceTracking = (trackingNumber: string) => {
    const updated = shippingService.advanceTrackingStage(trackingNumber);
    if (updated) {
      setTrackingModalInfo({ ...updated });
      if (updated.isCompleted) {
        setOrdersList((prev) =>
          prev.map((o) =>
            o.trackingNumber === trackingNumber || o.code === updated.orderCode
              ? { ...o, status: "COMPLETED" }
              : o
          )
        );
        toast.success(`Đơn hàng #${updated.orderCode} đã được giao thành công!`);
      } else {
        toast.info(`Đã chuyển bước: ${updated.timeline[0]?.title}`);
      }
    }
  };

  const handleOpenTrackingModal = (order: Order) => {
    const key = order.trackingNumber || order.code;
    let info = shippingService.getShippingInfo(key);
    if (!info) {
      const itemsText = order.items.map((i) => `${i.qty}x ${i.name}`).join(", ");
      info = shippingService.createShippingOrder({
        orderCode: order.code,
        carrier: order.shippingCarrier || "GHN",
        receiverName: order.customerName,
        receiverAddress: order.shippingAddress || "Số 25 Phố Lý Thường Kiệt, Q. Hoàn Kiếm, Hà Nội",
        receiverPhone: order.customerPhone || "0987654321",
        itemsSummary: itemsText,
        weightGram: 650,
        codAmount: order.paymentMethod === "COD" ? order.totalAmount : 0,
        paymentMethod: order.paymentMethod,
      });
      if (order.status === "COMPLETED") {
        info = shippingService.setTrackingStage(info.trackingNumber, 5);
      } else if (order.status === "SHIPPED") {
        info = shippingService.setTrackingStage(info.trackingNumber, 3);
      }
    }
    setTrackingModalInfo(info);
  };

  const handleOpenPrintShippingLabel = (order: Order) => {
    const key = order.trackingNumber || order.code;
    let info = shippingService.getShippingInfo(key);
    if (!info) {
      const itemsText = order.items.map((i) => `${i.qty}x ${i.name}`).join(", ");
      info = shippingService.createShippingOrder({
        orderCode: order.code,
        carrier: order.shippingCarrier || "GHN",
        receiverName: order.customerName,
        receiverAddress: order.shippingAddress || "Số 25 Phố Lý Thường Kiệt, Q. Hoàn Kiếm, Hà Nội",
        receiverPhone: order.customerPhone || "0987654321",
        itemsSummary: itemsText,
      });
    }
    setPrintShippingLabelInfo(info);
  };

  const filteredCatalog = useMemo(() => {
    if (!searchProductQuery.trim()) return masterCatalog.slice(0, 6);
    return masterCatalog.filter(
      (p) =>
        p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchProductQuery.toLowerCase())
    );
  }, [searchProductQuery]);

  const filteredOrders = ordersList.filter((order) => {
    const isModeMatch = viewMode === "online" ? order.type === "Đặt Sân Online" : order.type === "POS Quầy";
    let matchesPosSub = true;
    if (viewMode === "pos") {
      matchesPosSub = order.posCategory === posSubFilter;
    }
    const matchesStatus = order.status === statusFilter;
    const matchesSearch =
      order.code.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.staffName.toLowerCase().includes(search.toLowerCase()) ||
      (order.courtInfo?.courtName && order.courtInfo.courtName.toLowerCase().includes(search.toLowerCase())) ||
      (order.shippingAddress && order.shippingAddress.toLowerCase().includes(search.toLowerCase())) ||
      (order.trackingNumber && order.trackingNumber.toLowerCase().includes(search.toLowerCase()));

    let matchesDate = true;
    if (datePeriod === "today") matchesDate = order.dateStr === "2026-08-09";
    else if (datePeriod === "yesterday") matchesDate = order.dateStr === "2026-08-08";
    else if (datePeriod === "custom") matchesDate = order.dateStr === customDate;

    return isModeMatch && matchesPosSub && matchesStatus && matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePrint = (order: Order) => setPrintReceiptOrder(order);
  const handleOpenEdit = (order: Order) => {
    setEditingOrder(JSON.parse(JSON.stringify(order)));
    setSearchProductQuery("");
  };

  const handleItemQtyChange = (itemId: number, delta: number) => {
    if (!editingOrder) return;
    const updatedItems = editingOrder.items
      .map((item) => {
        if (item.id === itemId) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as OrderItem[];
    const newTotal = updatedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    setEditingOrder({ ...editingOrder, items: updatedItems, totalAmount: newTotal });
  };

  const handleRemoveItem = (itemId: number) => {
    if (!editingOrder) return;
    const updatedItems = editingOrder.items.filter((i) => i.id !== itemId);
    const newTotal = updatedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    setEditingOrder({ ...editingOrder, items: updatedItems, totalAmount: newTotal });
  };

  const handleSaveEditAndReprint = () => {
    if (!editingOrder) return;
    const updatedList = ordersList.map((o) => (o.code === editingOrder.code ? editingOrder : o));
    setOrdersList(updatedList);
    toast.success(`Đã cập nhật chỉnh sửa đơn hàng #${editingOrder.code}!`);
    setPrintReceiptOrder(editingOrder);
    setEditingOrder(null);
  };

  return (
    <AppLayout
      title={viewMode === "online" ? "Quản Lý Đơn Hàng Online & Vận Chuyển 3PL" : "Quản Lý Hóa Đơn Bán Hàng POS Quầy"}
    >
      <div className="space-y-6 font-sans">
        {/* TOP FILTER & CONTROLS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1">
                <span>Xem theo lịch:</span>
              </div>
              {[
                { id: "today", label: "Hôm nay (Ca trực)" },
                { id: "yesterday", label: "Hôm qua" },
                { id: "7days", label: "Tất cả các ngày" },
                { id: "custom", label: "Chọn ngày cụ thể" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setDatePeriod(p.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 border ${
                    datePeriod === p.id
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent"
                  }`}
                >
                  {p.label}
                </button>
              ))}
              {datePeriod === "custom" && (
                <Input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-36 text-xs h-8 font-bold border-slate-300 rounded-lg"
                />
              )}
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={
                  viewMode === "online"
                    ? "Tìm mã HD, mã vận đơn, người nhận, địa chỉ..."
                    : "Tìm mã HD, khách hàng, tên thu ngân, tên sân..."
                }
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 text-xs h-9 rounded-xl border-slate-300"
              />
            </div>
          </div>

          {/* POS SUB TABS */}
          {viewMode === "pos" && (
            <div className="flex items-center gap-2 border-t pt-3 flex-wrap">
              <span className="text-xs font-bold text-slate-500 mr-1">Phân loại hóa đơn:</span>
              {[
                { id: "court_service", label: "Tiền sân & Dịch vụ" },
                { id: "retail", label: "Bán lẻ sản phẩm" },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setPosSubFilter(sub.id as any);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 border ${
                    posSubFilter === sub.id
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}

          {/* STATUS TABS */}
          <div className="flex items-center gap-2 border-t pt-3 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1">Trạng thái:</span>
            {viewMode === "online" ? (
              [
                { id: "PENDING", label: "Chờ duyệt & Đóng gói" },
                { id: "SHIPPED", label: "Đang giao hàng (3PL)" },
                { id: "COMPLETED", label: "Giao thành công" },
                { id: "REFUNDED", label: "Đã hoàn tiền / Hủy" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setStatusFilter(st.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 border ${
                    statusFilter === st.id
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  {st.label}
                </button>
              ))
            ) : (
              [
                { id: "PAID", label: "Đã thanh toán" },
                { id: "REFUNDED", label: "Đã hoàn tiền" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setStatusFilter(st.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 border ${
                    statusFilter === st.id
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  {st.label}
                </button>
              ))
            )}
          </div>
        </div>

        {/* ONLINE ORDERS TABLE */}
        {viewMode === "online" && (
          <Card className="p-6 border-slate-200/90 bg-white shadow-sm space-y-4 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Danh Sách Đơn Hàng Online & Vận Chuyển TMĐT</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tích hợp mô phỏng Giao Hàng Nhanh, GHTK, Viettel Post, GrabExpress</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 font-bold text-xs">
                  {filteredOrders.length} Đơn {statusFilter}
                </Badge>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
              <table className="w-full text-left border-collapse text-xs min-w-[840px]">
                <thead>
                  <tr className="border-b border-slate-200 font-semibold text-slate-500 uppercase bg-[#FAF8F5] tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 w-36">MÃ ĐƠN & NGÀY</th>
                    <th className="py-3.5 px-4 min-w-[180px]">NGƯỜI NHẬN & SĐT</th>
                    <th className="py-3.5 px-4 min-w-[220px]">ĐỊA CHỈ NHẬN HÀNG</th>
                    <th className="py-3.5 px-4 w-36">TỔNG TIỀN & PTTT</th>
                    <th className="py-3.5 px-4 min-w-[160px]">VẬN CHUYỂN & MÃ VẬN ĐƠN</th>
                    <th className="py-3.5 px-4 text-right min-w-[200px]">TÁC VỤ VẬN ĐƠN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                        Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order) => {
                      const isPending = order.status === "PENDING";
                      const isShipped = order.status === "SHIPPED";
                      const isCompleted = order.status === "COMPLETED";

                      return (
                        <tr key={order.code} className="hover:bg-slate-50/80 transition-colors">
                          {/* CODE & DATE */}
                          <td className="py-4 px-4">
                            <div className="font-mono font-bold text-slate-900 text-sm">#{order.code}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{order.createdAt}</div>
                          </td>

                          {/* CUSTOMER */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-900">{order.customerName}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">
                              SĐT: <span className="font-semibold text-slate-700">{order.customerPhone || "0987654321"}</span>
                            </div>
                          </td>

                          {/* ADDRESS */}
                          <td className="py-4 px-4">
                            <div className="text-xs text-slate-700 leading-snug line-clamp-2">
                              {order.shippingAddress || "Số 10 Đường Pickleball, Q. Cầu Giấy, Hà Nội"}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1">
                              {order.items.length} món: <span className="font-medium text-slate-600">{order.items[0]?.name}</span>
                              {order.items.length > 1 && ` (+${order.items.length - 1} món khác)`}
                            </div>
                          </td>

                          {/* AMOUNT */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-emerald-600 text-sm">
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalAmount)}
                            </div>
                            <div className="text-[11px] text-slate-500 font-semibold uppercase mt-0.5">
                              {order.paymentMethod === "COD" ? (
                                <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  Thu COD
                                </span>
                              ) : (
                                order.paymentMethod
                              )}
                            </div>
                          </td>

                          {/* SHIPPING STATUS & TRACKING CODE */}
                          <td className="py-4 px-4">
                            {isPending && (
                              <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-300 font-bold">
                                Chờ đóng gói
                              </Badge>
                            )}
                            {isShipped && (
                              <div className="space-y-1">
                                <Badge className="bg-blue-600 text-white font-bold inline-flex items-center gap-1">
                                  <Truck className="w-3 h-3" />
                                  <span>{order.shippingCarrier || "GHN"} Express</span>
                                </Badge>
                                <div className="text-[11px] text-slate-800 font-mono font-bold">
                                  {order.trackingNumber || "GHN-VN-882910"}
                                </div>
                              </div>
                            )}
                            {isCompleted && (
                              <div className="space-y-1">
                                <Badge className="bg-emerald-600 text-white font-bold inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Giao thành công</span>
                                </Badge>
                                <div className="text-[11px] text-slate-500 font-mono font-medium">
                                  {order.trackingNumber || "GHTK-SGN-44912"}
                                </div>
                              </div>
                            )}
                            {order.status === "REFUNDED" && (
                              <Badge variant="destructive" className="font-bold">
                                Đã hoàn tiền
                              </Badge>
                            )}
                          </td>

                          {/* ACTIONS */}
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPending && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setCreateShippingModalOrder(order);
                                    setSelectedCarrier("GHN");
                                  }}
                                  className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm gap-1.5 cursor-pointer"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Tạo Vận Đơn</span>
                                </Button>
                              )}

                              {(isShipped || isCompleted) && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleOpenTrackingModal(order)}
                                    className="h-8 px-2.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm gap-1 cursor-pointer"
                                    title="Xem tiến trình giao hàng thời gian thực"
                                  >
                                    <Navigation className="w-3.5 h-3.5" />
                                    <span>Hành trình</span>
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenPrintShippingLabel(order)}
                                    className="h-8 px-2.5 text-xs font-bold rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 gap-1 cursor-pointer"
                                    title="In tem dán thùng hàng A6"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>In Tem A6</span>
                                  </Button>
                                </>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedOrder(order)}
                                className="h-8 px-2.5 text-xs font-bold rounded-xl border-slate-300 hover:bg-slate-50 cursor-pointer"
                              >
                                Chi tiết
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* POS ORDERS TABLE */}
        {viewMode === "pos" && (
          <Card className="p-6 border-slate-200/90 bg-white shadow-sm space-y-4 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-slate-900 text-base">Lịch Sử Hóa Đơn Bán Hàng & Thu Lễ Tân Tại Quầy</h3>
              <Badge variant="secondary" className="px-3 py-1 font-bold text-xs">
                {filteredOrders.length} Hóa Đơn POS
              </Badge>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
              <table className="w-full text-left border-collapse text-xs min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-200 font-semibold text-slate-500 uppercase bg-[#FAF8F5] tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">MÃ HĐ</th>
                    <th className="py-3.5 px-4">PHÂN LOẠI</th>
                    <th className="py-3.5 px-4">KHÁCH HÀNG</th>
                    <th className="py-3.5 px-4">THU NGÂN</th>
                    <th className="py-3.5 px-4">PTTT</th>
                    <th className="py-3.5 px-4">TỔNG TIỀN</th>
                    <th className="py-3.5 px-4">TRẠNG THÁI</th>
                    <th className="py-3.5 px-4 text-right">TÁC VỤ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                        Không có hóa đơn nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order) => (
                      <tr key={order.code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-slate-900">{order.code}</td>
                        <td className="py-4 px-4">
                          {order.posCategory === "court_service" ? (
                            <div className="space-y-0.5">
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                                Tiền sân & Dịch vụ
                              </Badge>
                              {order.courtInfo && <p className="text-[10px] text-slate-500 font-medium">{order.courtInfo.courtName}</p>}
                            </div>
                          ) : (
                            <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 font-bold text-[10px]">
                              Bán lẻ sản phẩm
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900">{order.customerName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{order.createdAt}</div>
                        </td>
                        <td className="py-4 px-4 font-bold text-emerald-800">{order.staffName}</td>
                        <td className="py-4 px-4 font-bold text-slate-700 uppercase">{order.paymentMethod}</td>
                        <td className="py-4 px-4 font-bold text-emerald-600 text-sm">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalAmount)}
                        </td>
                        <td className="py-4 px-4">
                          {order.status === "PAID" ? (
                            <Badge className="bg-emerald-600 font-bold text-white">Đã thanh toán</Badge>
                          ) : (
                            <Badge variant="destructive" className="font-bold">
                              Đã hoàn tiền
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrder(order)}
                              className="h-7 px-2.5 text-[11px] font-bold rounded-lg border-slate-300"
                            >
                              Xem
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEdit(order)}
                              className="h-7 px-2.5 text-[11px] text-amber-700 border-amber-300 hover:bg-amber-50 font-bold rounded-lg"
                            >
                              Sửa Đơn
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePrint(order)}
                              className="h-7 px-2.5 text-[11px] font-bold rounded-lg border-slate-300"
                            >
                              In Bill
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* PAGINATION */}
        <div className="flex items-center justify-between pt-2 text-xs">
          <span className="text-slate-500 font-medium">
            Hiển thị {paginatedOrders.length} / {filteredOrders.length} đơn
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 rounded-xl font-bold"
            >
              Trang trước
            </Button>
            <span className="font-bold text-slate-900 px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 rounded-xl font-bold"
            >
              Trang tiếp
            </Button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL 1: CREATE SHIPPING ORDER (TẠO VẬN ĐƠN VẬN CHUYỂN GIẢ LẬP)           */}
        {/* ========================================================================= */}
        <Dialog open={!!createShippingModalOrder} onOpenChange={() => setCreateShippingModalOrder(null)}>
          <DialogContent className="sm:max-w-xl bg-white rounded-3xl p-6 font-sans shadow-2xl border border-slate-200">
            <DialogHeader className="space-y-1">
              <div className="inline-flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl text-xs font-bold w-fit">
                <Truck className="w-4 h-4" />
                <span>Xuất Kho & Đẩy Đơn Vận Chuyển 3PL</span>
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Tạo Vận Đơn Giao Hàng — Đơn #{createShippingModalOrder?.code}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Chọn đơn vị vận chuyển đối tác. Hệ thống tự động sinh mã vận đơn và lập hành trình giao hàng.
              </DialogDescription>
            </DialogHeader>

            {createShippingModalOrder && (
              <div className="space-y-4 pt-2 text-xs">
                {/* RECEIVER SUMMARY BOX */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Người nhận:</span>
                    <span className="font-bold text-slate-900">{createShippingModalOrder.customerName} ({createShippingModalOrder.customerPhone || "0987654321"})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Địa chỉ giao:</span>
                    <span className="font-semibold text-slate-800 text-right max-w-[280px]">
                      {createShippingModalOrder.shippingAddress || "Số 10 Đường Pickleball, Q. Cầu Giấy, Hà Nội"}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1.5 mt-1.5">
                    <span className="text-slate-500">Kiện hàng:</span>
                    <span className="font-medium text-slate-700">
                      {createShippingModalOrder.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                    </span>
                  </div>
                </div>

                {/* SELECT CARRIER */}
                <div className="space-y-2">
                  <Label className="font-bold text-slate-800 text-xs flex items-center justify-between">
                    <span>Chọn đối tác vận chuyển:</span>
                    <span className="text-[11px] text-emerald-700 font-semibold">Tự động kết nối Sandbox API</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {AVAILABLE_CARRIERS.map((c) => {
                      const isSelected = selectedCarrier === c.id;
                      const { fee, isFreeship } = shippingService.calculateShippingFee(
                        createShippingModalOrder.shippingAddress || "Hà Nội",
                        shippingWeightGram,
                        c.id,
                        createShippingModalOrder.totalAmount
                      );

                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCarrier(c.id)}
                          className={`p-3 rounded-2xl border-2 transition-all cursor-pointer space-y-1 relative ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-50/40 shadow-sm"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">{c.name}</span>
                            <Badge className={`${c.badgeColor} font-bold text-[10px]`}>{c.shortName}</Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight">{c.tagline}</p>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                            <span className="text-slate-500">TG giao: <b className="text-slate-700">{c.estimatedTime}</b></span>
                            <span className="font-bold text-emerald-700">
                              {isFreeship ? "Miễn phí (Freeship)" : `${new Intl.NumberFormat("vi-VN").format(fee)}đ`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* WEIGHT & DELIVERY NOTE */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="font-semibold text-slate-700 text-xs">Cân nặng gói hàng (gram):</Label>
                    <Input
                      type="number"
                      value={shippingWeightGram}
                      onChange={(e) => setShippingWeightGram(Number(e.target.value) || 500)}
                      className="text-xs h-8 font-bold rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-semibold text-slate-700 text-xs">Ghi chú giao hàng:</Label>
                    <Input
                      value={customDeliveryNote}
                      onChange={(e) => setCustomDeliveryNote(e.target.value)}
                      className="text-xs h-8 font-medium rounded-xl"
                    />
                  </div>
                </div>

                {/* COD & SUMMARY */}
                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-amber-900 text-xs block">Tiền Thu Hộ (COD):</span>
                    <span className="text-[11px] text-amber-700">
                      {createShippingModalOrder.paymentMethod === "COD"
                        ? "Khách thanh toán tiền mặt khi nhận hàng"
                        : "Khách đã thanh toán trước qua VietQR / MoMo (Thu COD = 0đ)"}
                    </span>
                  </div>
                  <span className="font-extrabold text-amber-800 text-sm">
                    {createShippingModalOrder.paymentMethod === "COD"
                      ? `${new Intl.NumberFormat("vi-VN").format(createShippingModalOrder.totalAmount)} đ`
                      : "0 đ"}
                  </span>
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-row gap-2 justify-end pt-3 border-t">
              <Button
                variant="outline"
                onClick={() => setCreateShippingModalOrder(null)}
                className="rounded-xl font-bold border-slate-300"
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreateShippingSubmit}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md gap-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>Tạo Vận Đơn Tự Động</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 2: PRINT SHIPPING LABEL A6 (IN PHIẾU GIAO HÀNG CHUẨN TMĐT A6)       */}
        {/* ========================================================================= */}
        <Dialog open={!!printShippingLabelInfo} onOpenChange={() => setPrintShippingLabelInfo(null)}>
          <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 font-sans shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {printShippingLabelInfo && (
              <div className="space-y-4">
                {/* PRINTABLE AREA */}
                <div
                  id="shipping-label-a6"
                  className="p-4 bg-white rounded-2xl border-2 border-slate-900 text-xs font-sans text-slate-900 space-y-3 shadow-xs"
                >
                  {/* LABEL HEADER */}
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2.5">
                    <div>
                      <div className="font-extrabold text-base tracking-wider text-slate-900">
                        {printShippingLabelInfo.carrier} EXPRESS
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">
                        Dịch vụ: {printShippingLabelInfo.serviceType}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                        {printShippingLabelInfo.trackingNumber}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{printShippingLabelInfo.createdAt}</div>
                    </div>
                  </div>

                  {/* BARCODE & QR SIMULATION */}
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-400">
                    <div className="space-y-1">
                      {/* CSS Barcode lines simulation */}
                      <div className="flex items-center gap-[2px] h-8 overflow-hidden">
                        {[4, 2, 6, 1, 3, 5, 2, 4, 1, 6, 2, 3, 5, 1, 4, 2, 6, 3, 1, 5, 2, 4, 6, 1, 3, 2, 5, 4, 1, 6, 3, 2, 5].map(
                          (w, i) => (
                            <div key={i} className="bg-slate-900 h-full" style={{ width: `${w}px` }} />
                          )
                        )}
                      </div>
                      <div className="font-mono text-center text-[10px] tracking-widest font-bold">
                        *{printShippingLabelInfo.trackingNumber}*
                      </div>
                    </div>
                    <div className="w-12 h-12 border border-slate-400 rounded-lg p-1 bg-white flex items-center justify-center shrink-0">
                      <QrCode className="w-10 h-10 text-slate-900" />
                    </div>
                  </div>

                  {/* SENDER & RECEIVER */}
                  <div className="grid grid-cols-2 gap-2 border-b border-slate-300 pb-2 text-[11px]">
                    <div className="space-y-0.5 pr-2 border-r border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Người gửi:</span>
                      <p className="font-bold text-slate-900">{printShippingLabelInfo.senderName}</p>
                      <p className="text-[10px] text-slate-600 leading-tight">{printShippingLabelInfo.senderAddress}</p>
                      <p className="text-[10px] font-mono text-slate-700">Hotline: {printShippingLabelInfo.senderPhone}</p>
                    </div>
                    <div className="space-y-0.5 pl-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Người nhận:</span>
                      <p className="font-bold text-slate-900">{printShippingLabelInfo.receiverName}</p>
                      <p className="text-[10px] text-slate-700 leading-tight font-semibold">
                        {printShippingLabelInfo.receiverAddress}
                      </p>
                      <p className="text-[10px] font-mono text-slate-900 font-bold">
                        ĐT: {printShippingLabelInfo.receiverPhone}
                      </p>
                    </div>
                  </div>

                  {/* ITEMS SUMMARY */}
                  <div className="border-b border-slate-300 pb-2 text-[11px] space-y-1">
                    <div className="flex justify-between font-bold text-[10px] text-slate-500 uppercase">
                      <span>Nội dung hàng hoá</span>
                      <span>Khối lượng: {printShippingLabelInfo.weightGram}g</span>
                    </div>
                    <p className="font-medium text-slate-900 leading-tight">{printShippingLabelInfo.itemsSummary}</p>
                  </div>

                  {/* COD AMOUNT & NOTES */}
                  <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Tiền thu hộ COD:</span>
                      <span className="font-extrabold text-base text-slate-900">
                        {printShippingLabelInfo.codAmount > 0
                          ? `${new Intl.NumberFormat("vi-VN").format(printShippingLabelInfo.codAmount)} đ`
                          : "ĐÃ THANH TOÁN (0đ)"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Chữ ký người nhận</span>
                      <div className="text-[9px] text-slate-400 italic mt-4">(Ký và ghi rõ họ tên)</div>
                    </div>
                  </div>

                  {/* FOOTER NOTE */}
                  <div className="text-[10px] text-slate-500 text-center leading-tight pt-1">
                    Ghi chú: {printShippingLabelInfo.deliveryNote}
                  </div>
                </div>

                <DialogFooter className="gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPrintShippingLabelInfo(null)}
                    className="flex-1 rounded-xl text-xs font-bold border-slate-300"
                  >
                    Đóng
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      window.print();
                      toast.success(`Đã xuất lệnh in tem vận đơn ${printShippingLabelInfo.trackingNumber}!`);
                      setPrintShippingLabelInfo(null);
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In Phiếu A6 (Thermal)</span>
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 3: LIVE TRACKING TIMELINE (TRA CỨU HÀNH TRÌNH SHIPPER THỜI GIAN THỰC) */}
        {/* ========================================================================= */}
        <Dialog open={!!trackingModalInfo} onOpenChange={() => setTrackingModalInfo(null)}>
          <DialogContent className="sm:max-w-lg bg-white rounded-3xl p-6 font-sans shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {trackingModalInfo && (
              <div className="space-y-4">
                <DialogHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-50 text-blue-800 border border-blue-200 font-bold px-3 py-1">
                      {trackingModalInfo.carrier} Express
                    </Badge>
                    <span className="text-xs text-slate-500 font-mono font-bold">
                      #{trackingModalInfo.trackingNumber}
                    </span>
                  </div>
                  <DialogTitle className="text-lg font-bold text-slate-900">
                    Hành Trình Giao Hàng Thời Gian Thực
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Đơn hàng #{trackingModalInfo.orderCode} • Người nhận: {trackingModalInfo.receiverName}
                  </DialogDescription>
                </DialogHeader>

                {/* SHIPPER INFO CARD */}
                <div className="p-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl space-y-2 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-900 text-sm">
                        {trackingModalInfo.shipperName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{trackingModalInfo.shipperName}</div>
                        <div className="text-[11px] text-slate-300">Tài xế giao hàng ({trackingModalInfo.carrier})</div>
                      </div>
                    </div>
                    <a
                      href={`tel:${trackingModalInfo.shipperPhone}`}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Gọi Shipper</span>
                    </a>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/80 text-[11px] text-slate-300">
                    <div>SĐT: <b className="text-white">{trackingModalInfo.shipperPhone}</b></div>
                    <div>Biển số xe: <b className="text-white">{trackingModalInfo.shipperPlate}</b></div>
                  </div>
                </div>

                {/* DEMO STEP ADVANCE BUTTON (CHO BÁO CÁO THẦY CÔ) */}
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <FastForward className="w-4 h-4 text-amber-600" />
                      <span>Giả lập chuyển bước hành trình (Báo cáo Demo):</span>
                    </span>
                    <span className="text-[11px] font-bold text-amber-700">
                      Bước {trackingModalInfo.currentStage} / 5
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      disabled={trackingModalInfo.isCompleted}
                      onClick={() => handleAdvanceTracking(trackingModalInfo.trackingNumber)}
                      className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl h-8 gap-1.5 shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>
                        {trackingModalInfo.isCompleted
                          ? "Đã giao thành công 100%"
                          : `⚡ Chuyển sang Bước ${trackingModalInfo.currentStage + 1}`}
                      </span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const res = shippingService.setTrackingStage(trackingModalInfo.trackingNumber, 5);
                        if (res) {
                          setTrackingModalInfo({ ...res });
                          setOrdersList((prev) =>
                            prev.map((o) =>
                              o.trackingNumber === trackingModalInfo.trackingNumber || o.code === res.orderCode
                                ? { ...o, status: "COMPLETED" }
                                : o
                            )
                          );
                          toast.success("Đã hoàn tất toàn bộ hành trình giao hàng!");
                        }
                      }}
                      className="text-xs font-bold rounded-xl h-8 border-amber-300 text-amber-900 hover:bg-amber-100"
                    >
                      Hoàn thành ngay
                    </Button>
                  </div>
                </div>

                {/* TIMELINE LIST */}
                <div className="space-y-3 pt-2">
                  <Label className="font-bold text-slate-800 text-xs">Nhật ký hành trình chi tiết:</Label>
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {trackingModalInfo.timeline.map((event, idx) => {
                      const isLatest = idx === 0;
                      return (
                        <div key={idx} className="relative space-y-1">
                          {/* Dot */}
                          <div
                            className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isLatest
                                ? "bg-emerald-600 border-white ring-4 ring-emerald-100"
                                : "bg-slate-300 border-white"
                            }`}
                          >
                            {isLatest && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>

                          {/* Event details */}
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${isLatest ? "text-emerald-700 font-extrabold" : "text-slate-800"}`}>
                              {event.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{event.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">{event.description}</p>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <DialogFooter className="pt-3 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setTrackingModalInfo(null)}
                    className="w-full rounded-xl font-bold border-slate-300 text-xs"
                  >
                    Đóng Cửa Sổ
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* MODAL 4: ORDER DETAIL */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-lg bg-white rounded-3xl p-6 font-sans">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-lg font-bold text-slate-900">
                Chi Tiết Hóa Đơn #{selectedOrder?.code}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Thời gian tạo: {selectedOrder?.createdAt} • Kênh: {selectedOrder?.type}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4 pt-2 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Khách hàng:</span>
                    <span className="font-bold text-slate-900">{selectedOrder.customerName}</span>
                  </div>
                  {selectedOrder.customerPhone && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Số điện thoại:</span>
                      <span className="font-medium text-slate-900">{selectedOrder.customerPhone}</span>
                    </div>
                  )}
                  {selectedOrder.shippingAddress && (
                    <div className="flex justify-between border-t pt-1.5 mt-1.5">
                      <span className="text-slate-500">Địa chỉ nhận:</span>
                      <span className="font-semibold text-slate-800 text-right max-w-[260px]">
                        {selectedOrder.shippingAddress}
                      </span>
                    </div>
                  )}
                  {selectedOrder.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mã vận đơn ({selectedOrder.shippingCarrier || "3PL"}):</span>
                      <span className="font-mono font-bold text-blue-700">{selectedOrder.trackingNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-1.5 mt-1.5">
                    <span className="text-slate-500">Phương thức thanh toán:</span>
                    <span className="font-bold text-slate-900">{selectedOrder.paymentMethod}</span>
                  </div>
                </div>

                <div className="border rounded-2xl divide-y overflow-hidden">
                  <div className="p-2.5 bg-slate-100 font-bold text-slate-700 flex justify-between">
                    <span>Mặt hàng / Dịch vụ</span>
                    <span>Thành tiền</span>
                  </div>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {new Intl.NumberFormat("vi-VN").format(item.price)}đ x {item.qty}
                        </p>
                      </div>
                      <span className="font-bold text-emerald-600">
                        {new Intl.NumberFormat("vi-VN").format(item.price * item.qty)}đ
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t text-sm font-bold">
                  <span>Tổng cộng thanh toán:</span>
                  <span className="text-emerald-600 text-base">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            )}
            <DialogFooter className="pt-3">
              <Button
                variant="outline"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl font-bold border-slate-300 text-xs"
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL 5: EDIT ORDER POS */}
        <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
          <DialogContent className="sm:max-w-xl bg-white rounded-3xl p-6 font-sans">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-lg font-bold text-slate-900">
                Chỉnh Sửa Hóa Đơn Quầy #{editingOrder?.code}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Tìm kiếm sản phẩm trong kho để thêm, sửa số lượng và in lại hóa đơn.
              </DialogDescription>
            </DialogHeader>
            {editingOrder && (
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
                          onClick={() => {
                            const existing = editingOrder.items.find((i) => i.name === prod.name);
                            let updatedItems: OrderItem[] = existing
                              ? editingOrder.items.map((i) => (i.name === prod.name ? { ...i, qty: i.qty + 1 } : i))
                              : [...editingOrder.items, { id: Date.now(), name: prod.name, qty: 1, price: prod.price }];
                            const newTotal = updatedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
                            setEditingOrder({ ...editingOrder, items: updatedItems, totalAmount: newTotal });
                            toast.success(`Đã thêm 1x "${prod.name}"!`);
                          }}
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
                    onClick={() => setEditingOrder(null)}
                    className="rounded-xl font-bold border-slate-300 text-xs"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSaveEditAndReprint}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl gap-1.5 shadow-md text-xs"
                  >
                    Lưu & In Bill Mới
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* MODAL 6: PRINT RECEIPT 80MM */}
        <Dialog open={!!printReceiptOrder} onOpenChange={() => setPrintReceiptOrder(null)}>
          <DialogContent className="max-w-sm bg-white rounded-3xl p-6 font-sans shadow-2xl border border-slate-200">
            {printReceiptOrder && (
              <div className="space-y-4">
                <div
                  id="receipt-print-area"
                  className="p-4 bg-[#FAF8F5] rounded-2xl border border-slate-200/90 text-xs font-mono text-slate-800 space-y-3"
                >
                  <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
                    <div className="font-bold text-sm text-slate-900 tracking-wider">DEMOPICK PICKLEBALL CLUB</div>
                    <div className="text-[10px] text-slate-500 font-sans">123 Đường Pickleball, Quận 7, TP.HCM</div>
                    <div className="text-[10px] text-slate-500 font-sans">Hotline: 0909 123 456</div>
                    <div className="pt-2 font-bold text-xs text-slate-900 uppercase">
                      {printReceiptOrder.posCategory === "court_service"
                        ? "PHIẾU THU TIỀN SÂN & DỊCH VỤ"
                        : "HÓA ĐƠN BÁN LẺ SẢN PHẨM"}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-800">Mã HĐ: #{printReceiptOrder.code}</div>
                    <div className="text-[10px] text-slate-500">{printReceiptOrder.createdAt}</div>
                  </div>

                  <div className="space-y-1 border-b border-dashed border-slate-300 pb-2.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Khách hàng:</span>
                      <strong className="text-slate-900">{printReceiptOrder.customerName}</strong>
                    </div>
                    {printReceiptOrder.customerPhone && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Điện thoại:</span>
                        <span>{printReceiptOrder.customerPhone}</span>
                      </div>
                    )}
                    {printReceiptOrder.courtInfo && (
                      <div className="flex justify-between border-t border-dashed pt-1 mt-1 text-emerald-800">
                        <span className="text-slate-500 font-sans">Sân thi đấu:</span>
                        <strong className="font-sans">
                          {printReceiptOrder.courtInfo.courtName} ({printReceiptOrder.courtInfo.timeRange})
                        </strong>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Thu ngân:</span>
                      <span>{printReceiptOrder.staffName}</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-b border-dashed border-slate-300 pb-2.5">
                    <div className="grid grid-cols-12 font-bold text-[10px] text-slate-500 uppercase pb-0.5">
                      <div className="col-span-6 font-sans">Mặt hàng</div>
                      <div className="col-span-2 text-center">SL</div>
                      <div className="col-span-4 text-right">T.Tiền</div>
                    </div>
                    {printReceiptOrder.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 text-[11px] items-start">
                        <div className="col-span-6 font-sans text-slate-900">{item.name}</div>
                        <div className="col-span-2 text-center font-bold">x{item.qty}</div>
                        <div className="col-span-4 text-right font-bold text-slate-900">
                          {new Intl.NumberFormat("vi-VN").format(item.price * item.qty)}đ
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 border-b border-dashed border-slate-300 pb-2.5 text-xs">
                    <div className="flex justify-between items-center font-bold text-sm pt-1 text-slate-900">
                      <span className="font-sans">TỔNG CỘNG:</span>
                      <span className="text-emerald-700">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                          printReceiptOrder.totalAmount
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 text-center space-y-1 text-[10px] text-slate-500 font-sans leading-tight">
                    <div>Cảm ơn quý khách và hẹn gặp lại!</div>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPrintReceiptOrder(null)}
                    className="flex-1 rounded-xl text-xs font-bold border-slate-300"
                  >
                    Đóng
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      window.print();
                      toast.success(`Đã in Hóa đơn #${printReceiptOrder.code}!`);
                      setPrintReceiptOrder(null);
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    In Hóa Đơn (80mm)
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
