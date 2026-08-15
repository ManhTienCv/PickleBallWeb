import { useState, useEffect } from "react";
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
  Lock,
  AlertCircle,
  MapPin,
  Phone,
} from "lucide-react";
import { notificationService } from "@/services/notification.service";
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
  totalAmount: number;
  paymentMethod: "Tiền mặt" | "VietQR" | "MoMo";
  status: "PAID" | "PENDING" | "SHIPPED" | "REFUNDED";
  createdAt: string;
  dateStr: string;
  items: OrderItem[];
  editNote?: string;
  shippingAddress?: string;
  trackingNumber?: string;
}

const mockOrders: Order[] = [
  {
    code: "HD-88291",
    customerName: "Nguyễn Văn An (VIP)",
    customerPhone: "0987654321",
    staffName: "Hệ thống Tự Động Online",
    type: "Đặt Sân Online",
    totalAmount: 360000,
    paymentMethod: "VietQR",
    status: "PENDING", // Chờ duyệt
    createdAt: "2026-08-09 08:30",
    dateStr: "2026-08-09",
    shippingAddress: "Số 10 Đường Pickleball, Q. Cầu Giấy, Hà Nội",
    items: [{ id: 1, name: "Vợt Pickleball JOOLA Perseus 3S 16mm Carbon", qty: 1, price: 360000 }],
  },
  {
    code: "HD-88295",
    customerName: "Trần Văn Cường",
    customerPhone: "0912345678",
    staffName: "Hệ thống Tự Động Online",
    type: "Đặt Sân Online",
    totalAmount: 5580000,
    paymentMethod: "VietQR",
    status: "SHIPPED", // Đã giao DVVC
    createdAt: "2026-08-09 08:15",
    dateStr: "2026-08-09",
    shippingAddress: "Số 25 Phố Lý Thường Kiệt, Q. Hoàn Kiếm, Hà Nội",
    trackingNumber: "SPX-VN-9821093",
    items: [{ id: 10, name: "Vợt JOOLA Perseus 16mm + Hộp 4 Bóng Franklin X-40", qty: 1, price: 5580000 }],
  },
  {
    code: "HD-88292",
    customerName: "Trần Thị Bích (Gold)",
    customerPhone: "0909123456",
    staffName: "Phạm Văn Đức (Ca Sáng)",
    type: "POS Quầy",
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
    customerName: "Phạm Quốc Bảo (VIP)",
    customerPhone: "0933445566",
    staffName: "Nguyễn Thị Hương (Ca Chiều)",
    type: "POS Quầy",
    totalAmount: 140000,
    paymentMethod: "VietQR",
    status: "PAID",
    createdAt: "2026-08-09 10:00",
    dateStr: "2026-08-09",
    items: [
      { id: 5, name: "Bóng Pickleball Franklin X-40 (Hộp 4 quả)", qty: 1, price: 90000 },
      { id: 6, name: "Băng Cán Vợt JOOLA Pro Grip", qty: 2, price: 25000 },
    ],
  },
  {
    code: "HD-88285",
    customerName: "Vũ Thị Mai (Gold)",
    customerPhone: "0944556677",
    staffName: "Phạm Văn Đức (Ca Sáng)",
    type: "POS Quầy",
    totalAmount: 420000,
    paymentMethod: "Tiền mặt",
    status: "PAID",
    createdAt: "2026-08-08 16:45",
    dateStr: "2026-08-08",
    items: [{ id: 7, name: "Hộp 12 Bóng Franklin X-40 Outdoor", qty: 1, price: 420000 }],
  },
];

const availableAddons = [
  { id: 101, name: "Nước Suối Aquafina 500ml", price: 10000 },
  { id: 102, name: "Nước Điện Giải Pocari Sweat", price: 25000 },
  { id: 103, name: "Băng Cán Vợt JOOLA Pro Grip", price: 25000 },
  { id: 104, name: "Bóng Pickleball Franklin X-40 Single", price: 35000 },
];

export default function Orders() {
  const [searchParams] = useSearchParams();

  // Distinct Form Mode state: "online" vs "pos"
  const [viewMode, setViewMode] = useState<"online" | "pos">("online");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "pos") setViewMode("pos");
    else if (tab === "online") setViewMode("online");
  }, [searchParams]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [datePeriod, setDatePeriod] = useState("today");
  const [customDate, setCustomDate] = useState("2026-08-09");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [ordersList, setOrdersList] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [printReceiptOrder, setPrintReceiptOrder] = useState<Order | null>(null);
  const [shippingConfirmOrder, setShippingConfirmOrder] = useState<Order | null>(null);

  const executeShipOrder = (order: Order) => {
    setOrdersList((prev) =>
      prev.map((o) => (o.code === order.code ? { ...o, status: "SHIPPED" } : o))
    );

    notificationService.sendOrderShippedNotice({
      orderCode: order.code,
      customerName: order.customerName,
      shippingAddress: order.shippingAddress || "Số 10 Đường Pickleball, Q. Cầu Giấy, Hà Nội",
      totalAmount: order.totalAmount,
    });

    setShippingConfirmOrder(null);
  };

  // Filter logic separated by viewMode
  const filteredOrders = ordersList.filter((order) => {
    const isModeMatch = viewMode === "online" ? order.type === "Đặt Sân Online" : order.type === "POS Quầy";
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      order.code.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.staffName.toLowerCase().includes(search.toLowerCase()) ||
      (order.shippingAddress && order.shippingAddress.toLowerCase().includes(search.toLowerCase()));

    let matchesDate = true;
    if (datePeriod === "today") {
      matchesDate = order.dateStr === "2026-08-09";
    } else if (datePeriod === "yesterday") {
      matchesDate = order.dateStr === "2026-08-08";
    } else if (datePeriod === "custom") {
      matchesDate = order.dateStr === customDate;
    }

    return isModeMatch && matchesStatus && matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalFilteredRevenue = filteredOrders
    .filter((o) => o.status === "PAID" || o.status === "SHIPPED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const handlePrint = (order: Order) => {
    setPrintReceiptOrder(order);
  };

  const handleOpenEdit = (order: Order) => {
    setEditingOrder(JSON.parse(JSON.stringify(order)));
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

  const handleAddItemToEditingOrder = (addon: { id: number; name: string; price: number }) => {
    if (!editingOrder) return;
    const existing = editingOrder.items.find((i) => i.name === addon.name);
    let updatedItems: OrderItem[];
    if (existing) {
      updatedItems = editingOrder.items.map((i) =>
        i.name === addon.name ? { ...i, qty: i.qty + 1 } : i
      );
    } else {
      updatedItems = [...editingOrder.items, { id: Date.now(), name: addon.name, qty: 1, price: addon.price }];
    }

    const newTotal = updatedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    setEditingOrder({ ...editingOrder, items: updatedItems, totalAmount: newTotal });
  };

  const handleSaveEditAndReprint = () => {
    if (!editingOrder) return;
    const updatedList = ordersList.map((o) => (o.code === editingOrder.code ? editingOrder : o));
    setOrdersList(updatedList);
    toast.success(`Đã cập nhật chỉnh sửa đơn hàng & in lại Bill #${editingOrder.code}!`);
    setPrintReceiptOrder(editingOrder);
    setEditingOrder(null);
  };

  return (
    <AppLayout
      title={viewMode === "online" ? "Quản Lý Đơn Hàng Online & Vận Chuyển" : "Quản Lý Hóa Đơn Bán Hàng POS Quầy"}
    >
      <div className="space-y-6 font-sans">
        {/* Date Filter & Search Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1">
                <Calendar className="h-4 w-4 text-[#27c372]" />
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${datePeriod === p.id ? "bg-[#27c372] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                placeholder={viewMode === "online" ? "Tìm mã HD, tên người nhận, địa chỉ giao..." : "Tìm mã HD, khách hàng, tên thu ngân..."}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 text-xs h-9 rounded-xl border-slate-300"
              />
            </div>
          </div>

          {/* Sub-Status Filters tailored for viewMode */}
          <div className="flex items-center gap-2 border-t pt-3 flex-wrap">
            <span className="text-xs font-extrabold text-slate-400 mr-2 uppercase tracking-wide">Trạng thái:</span>
            {viewMode === "online" ? (
              [
                { id: "all", label: "Tất cả đơn online" },
                { id: "PENDING", label: "Chờ duyệt (Khách được sửa địa chỉ)" },
                { id: "SHIPPED", label: "Đã giao DVVC (Đã khóa địa chỉ)" },
                { id: "REFUNDED", label: "Đã hoàn tiền (Hủy)" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setStatusFilter(st.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === st.id ? "bg-[#27c372] text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium"
                    }`}
                >
                  {st.label}
                </button>
              ))
            ) : (
              [
                { id: "all", label: "Tất cả hóa đơn quầy" },
                { id: "PAID", label: "Đã thanh toán" },
                { id: "REFUNDED", label: "Đã hoàn tiền (Hủy)" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setStatusFilter(st.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === st.id ? "bg-[#27c372] text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium"
                    }`}
                >
                  {st.label}
                </button>
              ))
            )}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* FORM 1: ONLINE ORDERS & SHIPPING MANAGEMENT TABLE */}
        {/* ---------------------------------------------------- */}
        {viewMode === "online" && (
          <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-4 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[#27c372]" />
                  Danh Sách Đơn Hàng Online & Trạng Thái Vận Chuyển
                </h3>

              </div>
              <Badge className="bg-[#27c372]/15 text-[#16a34a] border border-[#27c372]/30 px-3 py-1 font-bold text-xs">
                {filteredOrders.length} Đơn Đặt Online
              </Badge>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 font-extrabold text-slate-700 uppercase bg-slate-50">
                    <th className="py-3.5 px-4">Mã Đơn Online</th>
                    <th className="py-3.5 px-4">Khách Hàng & SĐT</th>
                    <th className="py-3.5 px-4">Địa Chỉ Giao Hàng Chi Tiết</th>
                    <th className="py-3.5 px-4">Tổng Tiền & PTTT</th>
                    <th className="py-3.5 px-4">Trạng Thái Vận Chuyển</th>
                    <th className="py-3.5 px-4 text-right">Tác Vụ Duyệt Đơn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                        Không có đơn hàng Online nào trong bộ lọc đã chọn
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order) => (
                      <tr key={order.code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-mono font-black text-slate-900 text-sm">#{order.code}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{order.createdAt}</div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900">{order.customerName}</div>
                          <div className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-[#27c372]" /> {order.customerPhone || "0987654321"}
                          </div>
                        </td>

                        <td className="py-4 px-4 max-w-xs">
                          <div className="flex items-start gap-1.5 text-xs text-slate-700 font-bold leading-snug">
                            <MapPin className="w-3.5 h-3.5 text-[#27c372] shrink-0 mt-0.5" />
                            <span>{order.shippingAddress || "Số 10 Đường Pickleball, Q. Cầu Giấy, Hà Nội"}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-black text-[#27c372] text-sm">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalAmount)}
                          </div>
                          <div className="text-[11px] text-slate-500 font-extrabold uppercase">{order.paymentMethod}</div>
                        </td>

                        <td className="py-4 px-4">
                          {order.status === "PENDING" && (
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-300 font-extrabold gap-1">
                                <Clock className="w-3 h-3" /> Chờ duyệt
                              </Badge>

                            </div>
                          )}
                          {order.status === "SHIPPED" && (
                            <div className="space-y-1">
                              <Badge className="bg-blue-600 font-extrabold gap-1">
                                <Truck className="w-3 h-3" /> Đã Giao DVVC
                              </Badge>
                              <div className="text-[10px] text-slate-400 font-mono">{order.trackingNumber || "SPX-VN-9821093"}</div>
                            </div>
                          )}
                          {order.status === "PAID" && (
                            <Badge className="bg-emerald-600 font-bold gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Đã Thanh Toán
                            </Badge>
                          )}
                          {order.status === "REFUNDED" && (
                            <Badge variant="destructive" className="font-bold">Đã Hủy Hoàn Tiền</Badge>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2.5">
                            {order.status !== "SHIPPED" && order.status !== "REFUNDED" && (
                              <Button
                                size="sm"
                                onClick={() => setShippingConfirmOrder(order)}
                                className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium gap-1.5 rounded-xl shadow-sm"
                              >
                                <Truck className="h-3.5 w-3.5" /> Giao DVVC
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrder(order)}
                              className="h-8 px-3 text-xs font-medium rounded-xl border-slate-300 hover:bg-slate-100"
                            >
                              <Eye className="h-3.5 w-3.5" /> Xem
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

        {/* ---------------------------------------------------- */}
        {/* FORM 2: DIRECT POS COUNTER BILLING TABLE */}
        {/* ---------------------------------------------------- */}
        {viewMode === "pos" && (
          <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-4 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-slate-900" />
                  Lịch Sử Hóa Đơn Bán Hàng & Thu Lễ Tân Tại Quầy
                </h3>
              </div>
              <Badge variant="secondary" className="px-3 py-1 font-bold text-xs">
                {filteredOrders.length} Hóa Đơn POS
              </Badge>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 font-extrabold text-slate-700 uppercase bg-slate-50">
                    <th className="py-3.5 px-4">Mã Hóa Đơn</th>
                    <th className="py-3.5 px-4">Khách Hàng Mua</th>
                    <th className="py-3.5 px-4">Thu Ngân Ca Trực</th>
                    <th className="py-3.5 px-4">Phương Thức</th>
                    <th className="py-3.5 px-4">Tổng Tiền</th>
                    <th className="py-3.5 px-4">Trạng Thái</th>
                    <th className="py-3.5 px-4 text-right">Tác Vụ POS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                        Không có hóa đơn bán hàng tại quầy nào
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order) => (
                      <tr key={order.code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 font-mono font-black text-slate-900">{order.code}</td>

                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900">{order.customerName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{order.createdAt}</div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-[#27c372] shrink-0" />
                            <span>{order.staffName}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Giao dịch quầy trực tiếp</div>
                        </td>

                        <td className="py-4 px-4 font-extrabold text-slate-700 uppercase">{order.paymentMethod}</td>

                        <td className="py-4 px-4 font-black text-emerald-600 text-sm">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalAmount)}
                        </td>

                        <td className="py-4 px-4">
                          {order.status === "PAID" ? (
                            <Badge className="bg-emerald-600 gap-1 font-bold">
                              <CheckCircle2 className="h-3 w-3" /> Đã thanh toán
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1 font-bold">
                              <RefreshCw className="h-3 w-3" /> Đã hoàn tiền
                            </Badge>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)} className="h-7 px-2.5 text-[11px] gap-1 font-medium rounded-lg border-slate-300">
                              <Eye className="h-3.5 w-3.5" /> Xem
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleOpenEdit(order)} className="h-7 px-2.5 text-[11px] gap-1 text-amber-700 border-amber-300 hover:bg-amber-50 font-medium rounded-lg">
                              <Edit3 className="h-3.5 w-3.5" /> Sửa Đơn
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handlePrint(order)} className="h-7 px-2.5 text-[11px] gap-1 font-medium rounded-lg border-slate-300">
                              <Printer className="h-3.5 w-3.5" /> In Bill
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

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-2 text-xs">
          <span className="text-slate-500 font-medium">
            Hiển thị {paginatedOrders.length} / {filteredOrders.length} {viewMode === "online" ? "đơn online" : "hóa đơn quầy"}
          </span>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 gap-1 font-bold text-xs rounded-xl"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Trang trước
            </Button>
            <span className="font-bold text-slate-900 px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 gap-1 font-bold text-xs rounded-xl"
            >
              Trang tiếp <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* MODALS: VIEW DETAILS, EDIT POS ORDER, PRINT BILL, SHIP CONFIRM */}
        {/* ---------------------------------------------------- */}

        {/* VIEW ORDER DETAILS MODAL */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-lg bg-white rounded-3xl p-6 font-sans">
            {selectedOrder && (
              <div className="space-y-4">
                <DialogHeader className="border-b pb-3">
                  <DialogTitle className="text-lg font-semibold text-slate-900 flex items-center justify-between">
                    <span>Chi Tiết Đơn #{selectedOrder.code}</span>
                    <Badge className={selectedOrder.type === "Đặt Sân Online" ? "bg-[#27c372] font-medium" : "bg-slate-900 font-medium"}>
                      {selectedOrder.type}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 font-medium">
                    Thời gian tạo: {selectedOrder.createdAt}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border font-normal">
                    <div>
                      <span className="text-slate-400">Khách hàng: </span>
                      <span className="text-slate-800 font-medium">{selectedOrder.customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Số điện thoại: </span>
                      <span className="text-slate-800 font-medium">{selectedOrder.customerPhone || "0987654321"}</span>
                    </div>
                  </div>

                  {selectedOrder.shippingAddress && (
                    <div className="bg-slate-50 p-3 rounded-2xl border font-normal">
                      <span className="text-slate-400">Địa chỉ giao hàng: </span>
                      <span className="text-slate-800 font-medium">{selectedOrder.shippingAddress}</span>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2">
                    <Label className="font-medium text-slate-700">Danh mục sản phẩm / dịch vụ:</Label>
                    <div className="border rounded-2xl divide-y overflow-hidden">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 text-xs">
                          <span className="font-medium text-slate-800">{item.name} x{item.qty}</span>
                          <span className="font-semibold text-[#27c372]">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price * item.qty)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t text-sm font-medium">
                    <span className="text-slate-700">Tổng tiền thanh toán:</span>
                    <span className="text-[#27c372] text-base font-semibold">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>

                <DialogFooter className="pt-3">
                  <Button onClick={() => setSelectedOrder(null)} className="w-full font-medium rounded-xl bg-slate-900 text-white">
                    Đóng Màn Hình
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* EDIT POS ORDER MODAL */}
        <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
          <DialogContent className="max-w-xl bg-white rounded-3xl p-6 font-sans">
            {editingOrder && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-amber-500" />
                    Chỉnh Sửa Hóa Đơn Quầy #{editingOrder.code}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 font-medium">
                    Thay đổi thông tin khách hàng, số lượng sản phẩm & in lại Bill quầy trực tiếp
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1.5">
                    <Label className="font-medium text-slate-700">Tên Khách Hàng:</Label>
                    <Input
                      value={editingOrder.customerName}
                      onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                      className="text-xs h-9 font-medium rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-medium text-slate-700">Thu Ngân Phụ Trách:</Label>
                    <Input value={editingOrder.staffName} disabled className="text-xs h-9 font-medium bg-slate-100 rounded-xl" />
                  </div>
                </div>

                {/* Edit Items */}
                <div className="space-y-2 pt-2">
                  <Label className="font-medium text-slate-700 text-xs">Sản phẩm trong hóa đơn:</Label>
                  <div className="border rounded-2xl divide-y max-h-48 overflow-y-auto">
                    {editingOrder.items.map((item) => (
                      <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800 truncate max-w-[180px]">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() => handleItemQtyChange(item.id, -1)}
                              className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-medium"
                            >
                              -
                            </button>
                            <span className="px-2 font-semibold">{item.qty}</span>
                            <button
                              onClick={() => handleItemQtyChange(item.id, 1)}
                              className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-medium"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-semibold text-emerald-600 w-20 text-right">
                            {new Intl.NumberFormat("vi-VN").format(item.price * item.qty)}đ
                          </span>
                          <button onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Fast Addons */}
                <div className="space-y-2">
                  <Label className="font-medium text-slate-700 text-xs">+ Thêm nhanh sản phẩm phụ kiện:</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableAddons.map((ad) => (
                      <button
                        key={ad.id}
                        onClick={() => handleAddItemToEditingOrder(ad)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-[#16a34a] border border-slate-200 rounded-xl text-[11px] font-medium transition-all flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-[#27c372]" />
                        <span>{ad.name} ({new Intl.NumberFormat("vi-VN").format(ad.price)}đ)</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t text-sm font-medium">
                  <span className="text-slate-700">Tổng tiền mới:</span>
                  <span className="text-[#27c372] text-base font-semibold">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(editingOrder.totalAmount)}
                  </span>
                </div>

                <DialogFooter className="flex flex-row gap-3 justify-end pt-3">
                  <Button variant="outline" onClick={() => setEditingOrder(null)} className="rounded-xl font-medium border-slate-300">
                    Hủy
                  </Button>
                  <Button onClick={handleSaveEditAndReprint} className="bg-[#27c372] hover:bg-[#22c55e] text-white font-medium rounded-xl gap-1.5 shadow-md">
                    <Printer className="w-4 h-4" />
                    Lưu & In Bill Mới
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* PRINT RECEIPT MODAL */}
        <Dialog open={!!printReceiptOrder} onOpenChange={() => setPrintReceiptOrder(null)}>
          <DialogContent className="max-w-xs bg-white rounded-3xl p-6 font-mono text-xs">
            {printReceiptOrder && (
              <div className="space-y-3">
                <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
                  <h3 className="font-semibold text-sm uppercase">PICKLEBALL ONE CENTER</h3>
                  <p className="text-[10px] text-slate-500">Số 10 Đường Pickleball, Cầu Giấy, Hà Nội</p>
                  <div className="font-medium text-xs pt-1">HÓA ĐƠN BÁN HÀNG QUẦY</div>
                  <div className="text-[11px] font-medium">Mã HD: #{printReceiptOrder.code}</div>
                  <div className="text-[10px] text-slate-500">{printReceiptOrder.createdAt}</div>
                </div>

                <div className="space-y-1 border-b border-dashed border-slate-300 pb-2 text-[11px]">
                  <div>Khách hàng: <span className="font-medium">{printReceiptOrder.customerName}</span></div>
                  <div>Thu ngân: <span className="font-medium">{printReceiptOrder.staffName}</span></div>
                </div>

                <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2">
                  {printReceiptOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-0.5 text-[11px]">
                      <span className="truncate max-w-[120px]">{item.name}</span>
                      <span>x{item.qty}</span>
                      <span className="font-medium">{new Intl.NumberFormat("vi-VN").format(item.price * item.qty)}đ</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between font-semibold text-sm pt-1">
                  <span>TỔNG CỘNG:</span>
                  <span>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(printReceiptOrder.totalAmount)}</span>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    onClick={() => {
                      toast.success(`Đã gửi lệnh in Bill #${printReceiptOrder.code} tới máy in nhiệt!`);
                      setPrintReceiptOrder(null);
                    }}
                    className="w-full font-medium bg-slate-900 text-white rounded-xl"
                  >
                    In Phiếu Bán Hàng
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* CONFIRM SHIPPING HANDOFF MODAL */}
        <Dialog open={!!shippingConfirmOrder} onOpenChange={() => setShippingConfirmOrder(null)}>
          <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 font-sans">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Xác Nhận Giao Cho Đơn Vị Vận Chuyển?
              </DialogTitle>
              <DialogDescription className="text-slate-600 text-xs leading-relaxed font-medium">
                Thực hiện điều này... Bạn có chắc chắn muốn chuyển đơn hàng Online <span className="font-semibold text-slate-900">#{shippingConfirmOrder?.code}</span> sang trạng thái <span className="font-semibold text-slate-900">ĐÃ GIAO ĐƠN VỊ VẬN CHUYỂN</span> chứ?
                <br />
                <span className="text-blue-700 font-medium block mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                  Tự động gửi email/thông báo hành trình và khóa quyền sửa địa chỉ của người mua trên web.
                </span>
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex flex-row gap-3 justify-end pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setShippingConfirmOrder(null)}
                className="rounded-xl font-extrabold border-slate-300"
              >
                Hủy
              </Button>
              <Button
                onClick={() => shippingConfirmOrder && executeShipOrder(shippingConfirmOrder)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl gap-1.5 shadow-md"
              >
                <Truck className="w-4 h-4" />
                <span>Xác Nhận Giao DVVC</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
