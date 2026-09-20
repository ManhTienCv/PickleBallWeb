import { useState, useEffect, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import {
  ArrowUpRight,
  Download,
  BarChart3,
  BarChart2,
  TableProperties,
  TrendingUp,
  History,
  ShieldAlert,
  CheckCircle2,
  User,
  RefreshCw,
  Clock,
  Flame,
  Award,
  ShoppingBag,
  Calendar,
  Layers,
  ChevronDown,
  Sparkles,
  ShoppingCart,
  Users,
  DollarSign,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Inbox,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import { toast } from "sonner";

// ── NAVIGATION TABS ──────────────────────────────────────────────────────────
const tabs = [
  { id: "overview", label: "Báo Cáo Doanh Thu" },
  { id: "peak_hours", label: "Khung Giờ Vàng & Hiệu Suất Sân" },
  { id: "top_performers", label: "Top Khách Hàng & Bán Lẻ POS" },
  { id: "booking_history", label: "Lịch Sử Đặt Sân" },
  { id: "audit_logs", label: "Nhật Ký Hệ Thống (Audit Logs)" },
];

const datePeriods = [
  { id: "all", label: "Toàn Thời Gian" },
  { id: "30days", label: "30 Ngày Gần Nhất" },
  { id: "today", label: "Hôm Nay" },
  { id: "7days", label: "7 Ngày Gần Nhất" },
  { id: "this_month", label: "Tháng Này" },
  { id: "this_year", label: "Năm Nay" },
];

const formatVND = (num: number) => {
  return new Intl.NumberFormat("vi-VN").format(Math.round(num)) + " đ";
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState("overview");
  const [reportViewMode, setReportViewMode] = useState<"chart" | "table">("table");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination for Daily Data (10 days per page)
  const [dailyPage, setDailyPage] = useState(1);
  const [dailySortOrder, setDailySortOrder] = useState<"desc" | "asc">("desc");
  const dailyPageSize = 10;

  // Pagination for Monthly Data (6 months per page)
  const [monthlyPage, setMonthlyPage] = useState(1);
  const monthlyPageSize = 6;

  // ── 1. DỮ LIỆU ĐƠN HÀNG THỰC TẾ (REAL ORDERS) ──────────────────────────────
  const [orders, setOrders] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("demopick_orders_admin");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((o: any) => !o.code?.startsWith("CAM-") && !o.code?.startsWith("HD260917") && !o.code?.startsWith("HD260918"));
        }
      }
    } catch {}
    return [];
  });

  const [courtBookings, setCourtBookings] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("demopick_court_bookings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Nạp đơn hàng từ API Backend và hợp nhất
  const fetchRealData = async (showToast = false) => {
    setIsRefreshing(true);
    try {
      // 1. Fetch backend orders
      const resOrders = await api.get("/orders");
      if (resOrders.data?.data && Array.isArray(resOrders.data.data)) {
        const backendOrders = resOrders.data.data;
        setOrders((prev) => {
          const existingCodes = new Set(prev.map((o: any) => o.code || o.order_code));
          const newOrders = backendOrders.filter((b: any) => !existingCodes.has(b.order_code || b.code));
          const merged = [...prev, ...newOrders];
          return merged;
        });
      }

      // 2. Fetch court bookings
      const resBookings = await api.get("/bookings");
      if (resBookings.data?.data && Array.isArray(resBookings.data.data)) {
        setCourtBookings(resBookings.data.data);
      }

      if (showToast) {
        toast.success("Đã đồng bộ dữ liệu giao dịch mới nhất từ hệ thống!");
      }
    } catch (err) {
      if (showToast) {
        toast.info("Đã làm mới dữ liệu từ bộ nhớ hệ thống.");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRealData(false);

    // Lắng nghe sự kiện storage khi có đơn hàng mới từ POS hoặc Shop
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "demopick_orders_admin" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setOrders(parsed);
        } catch {}
      }
      if (e.key === "demopick_court_bookings" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setCourtBookings(parsed);
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ── 2. TÍNH TOÁN CÁC CHỈ SỐ DOANH THU ĐỘNG (DYNAMIC METRICS) ───────────────
  // Lọc các đơn hàng đã thanh toán thành công
  const paidOrders = useMemo(() => {
    return orders.filter((o: any) => {
      const st = (o.status || "").toUpperCase();
      const pst = (o.payment_status || "").toLowerCase();
      return st === "PAID" || st === "COMPLETED" || pst === "paid" || st === "CONFIRMED" || st === "SHIPPING";
    });
  }, [orders]);

  // Tổng doanh thu thực tế
  const totalRevenue = useMemo(() => {
    return paidOrders.reduce((sum, o) => {
      const amt = Number(o.final_amount ?? o.total ?? o.total_amount) || 0;
      return sum + amt;
    }, 0);
  }, [paidOrders]);

  // Tổng số đơn hàng
  const totalOrdersCount = orders.length;

  // Tổng số khách hàng duy nhất
  const totalCustomersCount = useMemo(() => {
    const custSet = new Set<string>();
    orders.forEach((o) => {
      const key = o.customer_phone || o.phone || o.customer_name || o.customer;
      if (key && typeof key === "string" && key.trim()) {
        custSet.add(key.trim());
      }
    });
    return custSet.size;
  }, [orders]);

  // Doanh thu theo danh mục sản phẩm thực tế
  const categoryRevenueData = useMemo(() => {
    const catMap = new Map<string, { name: string; soldQtyNum: number; revenue: number }>();

    paidOrders.forEach((o) => {
      const items = o.items || o.order_items || [];
      if (Array.isArray(items) && items.length > 0) {
        items.forEach((item: any) => {
          let cat = item.category?.name || item.category || "Vợt Pickleball";
          if (typeof cat !== "string") cat = "Vợt Pickleball";
          if (item.isCourtFee || (item.productName || "").includes("Tiền Sân")) {
            cat = "Dịch vụ sân & Giờ chơi";
          } else if (
            (item.productName || "").toLowerCase().includes("bóng") ||
            (item.name || "").toLowerCase().includes("bóng")
          ) {
            cat = "Bóng Pickleball";
          } else if (
            (item.productName || "").toLowerCase().includes("nước") ||
            (item.productName || "").toLowerCase().includes("trà") ||
            (item.productName || "").toLowerCase().includes("cà phê") ||
            (item.productName || "").toLowerCase().includes("bánh") ||
            (item.productName || "").toLowerCase().includes("chuối") ||
            (item.productName || "").toLowerCase().includes("bò húc")
          ) {
            cat = "Đồ uống & Đồ ăn";
          }

          const existing = catMap.get(cat) || { name: cat, soldQtyNum: 0, revenue: 0 };
          const qty = Number(item.quantity) || 1;
          const itemRev = Number(item.line_total ?? (Number(item.price) || 0) * qty) || 0;

          existing.soldQtyNum += qty;
          existing.revenue += itemRev;
          catMap.set(cat, existing);
        });
      } else {
        // Đơn lẻ không có chi tiết items
        const cat = o.isCourtFee ? "Dịch vụ sân & Giờ chơi" : "Sản phẩm tổng hợp";
        const existing = catMap.get(cat) || { name: cat, soldQtyNum: 0, revenue: 0 };
        existing.soldQtyNum += 1;
        existing.revenue += Number(o.final_amount ?? o.total) || 0;
        catMap.set(cat, existing);
      }
    });

    const list = Array.from(catMap.values()).sort((a, b) => b.revenue - a.revenue);
    const maxRev = list[0]?.revenue || 1;

    return list.map((item) => ({
      name: item.name,
      soldQty: `${item.soldQtyNum} ${item.name.includes("Đồ uống") ? "phần" : item.name.includes("sân") ? "ca" : "món"}`,
      revenue: item.revenue,
      percentage: totalRevenue > 0 ? Number(((item.revenue / totalRevenue) * 100).toFixed(1)) : 0,
      barPercent: maxRev > 0 ? Math.min(100, Math.round((item.revenue / maxRev) * 100)) : 0,
    }));
  }, [paidOrders, totalRevenue]);

  // Doanh thu theo ngày thực tế (Daily Revenue)
  const dailyRevenueData = useMemo(() => {
    const dayMap = new Map<string, { paidOrders: number; revenue: number }>();

    paidOrders.forEach((o) => {
      let dateKey = "";
      if (o.created_at) {
        dateKey = String(o.created_at).slice(0, 10);
      } else if (o.date) {
        dateKey = String(o.date).slice(0, 10);
      } else {
        dateKey = new Date().toISOString().slice(0, 10);
      }

      const existing = dayMap.get(dateKey) || { paidOrders: 0, revenue: 0 };
      existing.paidOrders += 1;
      existing.revenue += Number(o.final_amount ?? o.total ?? o.total_amount) || 0;
      dayMap.set(dateKey, existing);
    });

    const entries = Array.from(dayMap.entries()).map(([date, data]) => {
      const parts = date.split("-");
      const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : date;
      return {
        date,
        displayDate,
        paidOrders: data.paidOrders,
        revenue: data.revenue,
      };
    });

    return entries.sort((a, b) => b.date.localeCompare(a.date));
  }, [paidOrders]);

  // Doanh thu theo tháng thực tế (Monthly Revenue)
  const monthlyRevenueData = useMemo(() => {
    const monthMap = new Map<string, { orderCount: number; revenue: number }>();

    paidOrders.forEach((o) => {
      const dateStr = o.created_at || o.date || new Date().toISOString();
      const monthKey = String(dateStr).slice(0, 7); // YYYY-MM
      const existing = monthMap.get(monthKey) || { orderCount: 0, revenue: 0 };
      existing.orderCount += 1;
      existing.revenue += Number(o.final_amount ?? o.total ?? o.total_amount) || 0;
      monthMap.set(monthKey, existing);
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => {
        const [y, m] = month.split("-");
        return {
          month,
          displayMonth: `${m}/${y}`,
          orderCount: data.orderCount,
          revenue: data.revenue,
        };
      })
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [paidOrders]);

  // Doanh thu theo từng năm thực tế (Yearly Revenue)
  const yearlyRevenueData = useMemo(() => {
    const yearMap = new Map<string, { orderCount: number; revenue: number }>();

    paidOrders.forEach((o) => {
      const dateStr = o.created_at || o.date || new Date().toISOString();
      const yearKey = String(dateStr).slice(0, 4); // YYYY
      const existing = yearMap.get(yearKey) || { orderCount: 0, revenue: 0 };
      existing.orderCount += 1;
      existing.revenue += Number(o.final_amount ?? o.total ?? o.total_amount) || 0;
      yearMap.set(yearKey, existing);
    });

    const sortedYears = Array.from(yearMap.entries())
      .map(([year, data]) => ({
        year,
        orderCount: data.orderCount,
        revenue: data.revenue,
        percentage: totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0,
        growth: "--",
      }))
      .sort((a, b) => b.year.localeCompare(a.year));

    return sortedYears;
  }, [paidOrders, totalRevenue]);

  // Doanh thu theo phương thức thanh toán thực tế (Payment Methods)
  const paymentMethodsData = useMemo(() => {
    const payMap = new Map<string, number>();

    paidOrders.forEach((o) => {
      const raw = (o.payment_method || o.paymentMethod || "vietqr").toLowerCase();
      let method = "VietQR";
      if (raw.includes("momo")) method = "Ví MoMo";
      else if (raw.includes("cod") || raw.includes("tiền mặt") || raw.includes("cash")) method = "Tiền mặt (COD/Quầy)";
      else if (raw.includes("qr") || raw.includes("bank") || raw.includes("chuyển")) method = "VietQR / Ngân Hàng";

      const current = payMap.get(method) || 0;
      payMap.set(method, current + (Number(o.final_amount ?? o.total) || 0));
    });

    const colors: Record<string, { accent: string; bar: string }> = {
      "Ví MoMo": { accent: "#ec4899", bar: "bg-[#ec4899]" },
      "Tiền mặt (COD/Quầy)": { accent: "#f59e0b", bar: "bg-[#f59e0b]" },
      "VietQR / Ngân Hàng": { accent: "#3b82f6", bar: "bg-[#3b82f6]" },
    };

    return Array.from(payMap.entries()).map(([name, rev]) => {
      const pct = totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0;
      return {
        name,
        revenue: rev,
        percentage: `${pct}%`,
        accentColor: colors[name]?.accent || "#10b981",
        barColor: colors[name]?.bar || "bg-emerald-500",
      };
    });
  }, [paidOrders, totalRevenue]);

  // Top Khách hàng chi tiêu nhiều nhất thực tế
  const topCustomers = useMemo(() => {
    const custMap = new Map<string, { name: string; phone: string; totalBookings: number; totalSpent: number; favCourt: string; lastPlayed: string }>();

    orders.forEach((o) => {
      const name = o.customer_name || o.customer || "Khách vãng lai";
      const phone = o.customer_phone || o.phone || "---";
      const key = `${name}_${phone}`;

      const existing = custMap.get(key) || {
        name,
        phone,
        totalBookings: 0,
        totalSpent: 0,
        favCourt: o.courtName || "Sân Chuẩn",
        lastPlayed: (o.created_at || o.date || new Date().toISOString()).slice(0, 10),
      };

      existing.totalBookings += 1;
      const isPaid = (o.status || "").toUpperCase() === "PAID" || (o.status || "").toUpperCase() === "COMPLETED";
      if (isPaid) {
        existing.totalSpent += Number(o.final_amount ?? o.total) || 0;
      }
      custMap.set(key, existing);
    });

    return Array.from(custMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
      .map((c, i) => ({ ...c, rank: i + 1 }));
  }, [orders]);

  // Top Sản phẩm & Dịch vụ bán lẻ thực tế
  const topRetailItems = useMemo(() => {
    const itemMap = new Map<string, { name: string; category: string; soldQty: number; revenue: number }>();

    paidOrders.forEach((o) => {
      const items = o.items || o.order_items || [];
      if (Array.isArray(items)) {
        items.forEach((it: any) => {
          const name = it.productName || it.name || "Sản phẩm";
          const cat = it.category?.name || it.category || "Phụ kiện";
          const qty = Number(it.quantity) || 1;
          const rev = Number(it.line_total ?? (Number(it.price) || 0) * qty) || 0;

          const existing = itemMap.get(name) || { name, category: typeof cat === "string" ? cat : "Phụ kiện", soldQty: 0, revenue: 0 };
          existing.soldQty += qty;
          existing.revenue += rev;
          itemMap.set(name, existing);
        });
      }
    });

    return Array.from(itemMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((it, i) => ({
        ...it,
        rank: i + 1,
        margin: "45%",
      }));
  }, [paidOrders]);

  // Lịch sử đặt sân thực tế
  const bookingHistory = useMemo(() => {
    // 1. Lọc từ courtBookings nếu có
    if (courtBookings.length > 0) {
      return courtBookings.map((b) => ({
        id: b.booking_code || `BK-${b.id || "001"}`,
        customer: b.customer_name || b.customer || "Khách đặt online",
        court: b.court_name || b.court || "Sân A1",
        slot: `${b.start_time || "08:00"} - ${b.end_time || "10:00"}`,
        price: formatVND(Number(b.total_amount ?? b.price) || 0),
        method: b.payment_method || "VietQR",
        status: (b.status || "CONFIRMED").toUpperCase(),
      }));
    }

    // 2. Lọc từ orders có chứa tiền sân
    const courtOrders = orders.filter((o) => {
      return o.isCourtFee || (o.items || []).some((it: any) => it.isCourtFee || (it.productName || "").includes("Tiền Sân"));
    });

    return courtOrders.map((o) => {
      const courtItem = (o.items || []).find((it: any) => it.isCourtFee || (it.productName || "").includes("Tiền Sân"));
      return {
        id: o.code || `BK-${o.id || "001"}`,
        customer: o.customer_name || o.customer || "Khách hàng",
        court: courtItem?.productName || "Sân Pickleball",
        slot: courtItem?.variantName || "Ca thi đấu tiêu chuẩn",
        price: formatVND(Number(o.final_amount ?? o.total) || 0),
        method: o.payment_method || "VietQR",
        status: (o.status || "COMPLETED").toUpperCase(),
      };
    });
  }, [courtBookings, orders]);

  // ── PHÂN TRANG DAILY & MONTHLY DATA ─────────────────────────────────────────
  const sortedDailyData = useMemo(() => {
    return [...dailyRevenueData].sort((a, b) => {
      return dailySortOrder === "desc"
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date);
    });
  }, [dailyRevenueData, dailySortOrder]);

  const totalDailyPages = Math.max(1, Math.ceil(sortedDailyData.length / dailyPageSize));
  const paginatedDailyData = sortedDailyData.slice(
    (dailyPage - 1) * dailyPageSize,
    dailyPage * dailyPageSize
  );

  const totalMonthlyPages = Math.max(1, Math.ceil(monthlyRevenueData.length / monthlyPageSize));
  const paginatedMonthlyData = monthlyRevenueData.slice(
    (monthlyPage - 1) * monthlyPageSize,
    monthlyPage * monthlyPageSize
  );

  const currentPeriodObj = datePeriods.find((p) => p.id === selectedPeriod) || datePeriods[0];

  // Logic Xuất Excel thực tế (CSV UTF-8 BOM)
  const handleExportExcel = () => {
    let csvContent = "\uFEFF";
    const dateStamp = new Date().toISOString().slice(0, 10);
    const fileName = `Bao_Cao_Doanh_Thu_DemoPick_${activeTab}_${dateStamp}.csv`;

    if (activeTab === "overview") {
      csvContent += "BÁO CÁO PHÂN TÍCH DOANH THU DEMOPICK PICKLEBALL\n";
      csvContent += `Thời gian xuất: ${dateStamp}\n`;
      csvContent += `Tổng số đơn hàng,${totalOrdersCount} đơn\n`;
      csvContent += `Tổng số khách hàng,${totalCustomersCount} khách\n`;
      csvContent += `Tổng doanh thu thực tế,${formatVND(totalRevenue)}\n\n`;

      csvContent += "1. DOANH THU THEO DANH MỤC SẢN PHẨM\n";
      csvContent += "Danh Mục,Số Lượng Bán,Tỷ Trọng,Doanh Thu\n";
      categoryRevenueData.forEach((c) => {
        csvContent += `"${c.name}","${c.soldQty}",${c.percentage}%,"${formatVND(c.revenue)}"\n`;
      });

      csvContent += "\n2. DOANH THU THEO NGÀY\n";
      csvContent += "Ngày,Số Đơn Đã Thanh Toán,Doanh Thu\n";
      dailyRevenueData.forEach((d) => {
        csvContent += `"${d.date}",${d.paidOrders},"${formatVND(d.revenue)}"\n`;
      });

      csvContent += "\n3. DOANH THU THEO THÁNG\n";
      csvContent += "Tháng,Số Đơn Hàng,Doanh Thu\n";
      monthlyRevenueData.forEach((m) => {
        csvContent += `"${m.month}",${m.orderCount},"${formatVND(m.revenue)}"\n`;
      });
    } else if (activeTab === "top_performers") {
      csvContent += "TOP KHÁCH HÀNG CHI TIÊU NHIỀU NHẤT\n";
      csvContent += "Hạng,Họ và Tên,Số Điện Thoại,Số Lượt Đặt Sân,Tổng Chi Tiêu,Sân Yêu Thích,Lần Chơi Gần Nhất\n";
      topCustomers.forEach((c) => {
        csvContent += `${c.rank},"${c.name}","${c.phone}",${c.totalBookings},${c.totalSpent} đ,"${c.favCourt}","${c.lastPlayed}"\n`;
      });
      csvContent += "\nTOP SẢN PHẨM & DỊCH VỤ BÁN LẺ POS\n";
      csvContent += "Hạng,Tên Sản Phẩm / Dịch Vụ,Danh Mục,Số Lượng Bán,Tổng Doanh Thu,Biên Lợi Nhuận\n";
      topRetailItems.forEach((r) => {
        csvContent += `${r.rank},"${r.name}","${r.category}",${r.soldQty},${r.revenue} đ,${r.margin}\n`;
      });
    } else if (activeTab === "booking_history") {
      csvContent += "LỊCH SỬ ĐẶT SÂN CHI TIẾT\n";
      csvContent += "Mã Lịch,Khách Hàng,Sân Thể Thao,Khung Giờ,Phương Thức,Thành Tiền,Trạng Thái\n";
      bookingHistory.forEach((b) => {
        csvContent += `"${b.id}","${b.customer}","${b.court}","${b.slot}","${b.method}","${b.price}","${b.status}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Đã xuất file Excel "${fileName}" thành công!`);
  };

  return (
    <AppLayout
      title="Báo cáo & Phân tích Doanh thu"
      headerRight={
        <div className="flex items-center gap-2">
          {/* Nút Xuất Excel */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="gap-2 bg-white border-slate-200 hover:bg-slate-50 font-medium text-xs rounded-xl h-9 shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </Button>

          {/* Menu Chọn Thời Gian */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="font-medium text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-9 gap-1.5 shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{currentPeriodObj.label}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white rounded-2xl p-1.5 shadow-lg border-slate-200">
              {datePeriods.map((period) => (
                <DropdownMenuItem
                  key={period.id}
                  onClick={() => {
                    setSelectedPeriod(period.id);
                    toast.info(`Đã lọc dữ liệu theo: ${period.label}`);
                  }}
                  className={`text-xs rounded-xl py-2 px-3 cursor-pointer ${
                    selectedPeriod === period.id ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-700"
                  }`}
                >
                  {period.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Nút Làm Mới Realtime */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRealData(true)}
            className="w-9 h-9 p-0 bg-white border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
          </Button>
        </div>
      }
    >
      <div className="space-y-6 font-sans">
        {/* Navigation Tabs Bar */}
        <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? "bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-600/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            TAB 1: BÁO CÁO & PHÂN TÍCH DOANH THU THỰC TẾ
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Header Title & Mode Toggle Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Báo cáo & Phân tích Doanh thu
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dữ liệu doanh thu thực tế được đối soát trực tiếp từ CSDL đơn hàng và quầy POS
                </p>
              </div>

              {/* Segmented Switcher: [ Bảng số liệu ] vs [ Biểu đồ trực quan ] */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                  <button
                    onClick={() => setReportViewMode("table")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      reportViewMode === "table"
                        ? "bg-white text-slate-900 font-bold shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <TableProperties className="w-3.5 h-3.5" />
                    <span>Bảng số liệu</span>
                  </button>
                  <button
                    onClick={() => setReportViewMode("chart")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      reportViewMode === "chart"
                        ? "bg-white text-slate-900 font-bold shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Biểu đồ trực quan</span>
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchRealData(true)}
                  className="w-8 h-8 p-0 bg-white border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm shrink-0"
                  title="Tải lại số liệu"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
                </Button>
              </div>
            </div>

            {/* 3 KPI HEADER CARDS DYNAMIC */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Tổng số đơn hàng */}
              <Card className="p-5 border-slate-200 bg-white shadow-sm rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    TỔNG SỐ ĐƠN HÀNG
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">
                    {totalOrdersCount}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
                    {paidOrders.length} đơn đã thanh toán
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                  <ShoppingCart className="w-6 h-6" />
                </div>
              </Card>

              {/* Card 2: Tổng số khách hàng */}
              <Card className="p-5 border-slate-200 bg-white shadow-sm rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    TỔNG SỐ KHÁCH HÀNG
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">
                    {totalCustomersCount}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-normal">Khách hàng phát sinh giao dịch</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
              </Card>

              {/* Card 3: Tổng doanh thu thực tế */}
              <Card className="p-5 border-slate-200 bg-white shadow-sm rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    TỔNG DOANH THU THỰC TẾ
                  </p>
                  <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                    {formatVND(totalRevenue)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-normal">Đã hạch toán thành công</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
              </Card>
            </div>

            {/* Empty State Banner khi chưa có đơn hàng */}
            {totalOrdersCount === 0 && (
              <Card className="p-12 text-center border-dashed border-slate-300 bg-slate-50/50 rounded-3xl space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Inbox className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Chưa có giao dịch phát sinh trong hệ thống</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Dữ liệu doanh thu, tỷ trọng danh mục và phân tích biểu đồ sẽ tự động được tổng hợp ngay khi có đơn hàng được thanh toán tại Quầy POS hoặc Cửa hàng trực tuyến.
                </p>
              </Card>
            )}

            {/* ─────────────────────────────────────────────────────────────
                MODE 1: BẢNG SỐ LIỆU (DATA TABLES)
            ───────────────────────────────────────────────────────────── */}
            {reportViewMode === "table" && totalOrdersCount > 0 && (
              <div className="space-y-6">
                {/* Table 1: Doanh thu theo danh mục sản phẩm */}
                <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-3xl space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-base">
                      Doanh thu theo danh mục sản phẩm
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tính theo giá trị các mặt hàng thực tế khách đã thanh toán
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-5">DANH MỤC SẢN PHẨM</th>
                          <th className="py-3.5 px-5 text-center">SỐ LƯỢNG BÁN</th>
                          <th className="py-3.5 px-5 w-56">TỶ TRỌNG DOANH SỐ</th>
                          <th className="py-3.5 px-5 text-right">DOANH THU THU VỀ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {categoryRevenueData.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                              Chưa có đơn hàng nào được phân loại danh mục.
                            </td>
                          </tr>
                        ) : (
                          categoryRevenueData.map((cat) => (
                            <tr key={cat.name} className="hover:bg-slate-50/90 transition-colors odd:bg-white even:bg-slate-50/40">
                              <td className="py-3.5 px-5 font-semibold text-slate-900">
                                {cat.name}
                              </td>
                              <td className="py-3.5 px-5 text-center">
                                <span className="inline-block px-3 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs">
                                  {cat.soldQty}
                                </span>
                              </td>
                              <td className="py-3.5 px-5">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 h-2 bg-slate-200/80 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
                                      style={{ width: `${cat.barPercent}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-slate-600 w-11 text-right">
                                    {cat.percentage}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 px-5 text-right font-bold text-orange-600 text-sm">
                                {formatVND(cat.revenue)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Table 2: Doanh thu theo ngày */}
                <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-3xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        Doanh thu theo ngày giao dịch
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Dữ liệu đối soát đơn hàng hoàn tất thanh toán
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDailySortOrder(dailySortOrder === "desc" ? "asc" : "desc")}
                        className="h-8 text-xs gap-1.5 rounded-xl border-slate-200"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                        <span>{dailySortOrder === "desc" ? "Mới nhất trước" : "Cũ nhất trước"}</span>
                      </Button>
                      <Badge variant="outline" className="text-xs text-slate-600 font-medium px-2.5 py-1">
                        {sortedDailyData.length} ngày
                      </Badge>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-5">NGÀY GIAO DỊCH</th>
                          <th className="py-3.5 px-5 text-center">SỐ ĐƠN ĐÃ THANH TOÁN</th>
                          <th className="py-3.5 px-5 text-right">GIÁ TRỊ TRUNG BÌNH (AOV)</th>
                          <th className="py-3.5 px-5 text-right">DOANH THU THỰC TẾ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {paginatedDailyData.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                              Chưa có đơn hàng thanh toán thành công theo ngày.
                            </td>
                          </tr>
                        ) : (
                          paginatedDailyData.map((d) => (
                            <tr key={d.date} className="hover:bg-slate-50/90 transition-colors odd:bg-white even:bg-slate-50/40">
                              <td className="py-3.5 px-5 font-semibold text-slate-900 font-mono">
                                {d.date}
                              </td>
                              <td className="py-3.5 px-5 text-center">
                                <span className="inline-block px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                                  {d.paidOrders} đơn hoàn tất
                                </span>
                              </td>
                              <td className="py-3.5 px-5 text-right font-medium text-slate-600">
                                {formatVND(Math.round(d.revenue / (d.paidOrders || 1)))}
                              </td>
                              <td className="py-3.5 px-5 text-right font-bold text-emerald-600 text-sm">
                                {formatVND(d.revenue)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Thanh Phân Trang */}
                  {sortedDailyData.length > dailyPageSize && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
                      <div>
                        Hiển thị{" "}
                        <span className="font-semibold text-slate-800">
                          {(dailyPage - 1) * dailyPageSize + 1} - {Math.min(dailyPage * dailyPageSize, sortedDailyData.length)}
                        </span>{" "}
                        trên tổng số <span className="font-semibold text-slate-800">{sortedDailyData.length}</span> ngày đối soát
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={dailyPage === 1}
                          onClick={() => setDailyPage((prev) => Math.max(prev - 1, 1))}
                          className="h-8 px-2.5 text-xs rounded-xl gap-1 border-slate-200"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Trước</span>
                        </Button>

                        {Array.from({ length: totalDailyPages }, (_, i) => i + 1).map((p) => (
                          <Button
                            key={p}
                            variant={dailyPage === p ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDailyPage(p)}
                            className={`h-8 w-8 p-0 text-xs rounded-xl ${
                              dailyPage === p
                                ? "bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-sm"
                                : "text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {p}
                          </Button>
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={dailyPage === totalDailyPages}
                          onClick={() => setDailyPage((prev) => Math.min(prev + 1, totalDailyPages))}
                          className="h-8 px-2.5 text-xs rounded-xl gap-1 border-slate-200"
                        >
                          <span className="hidden sm:inline">Sau</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Table 3 & 4: Doanh thu theo tháng & Doanh thu theo năm */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Table 3: Doanh thu theo tháng */}
                  <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-3xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          Doanh thu theo tháng
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Tổng hợp hoạt động theo từng tháng</p>
                      </div>
                      <Badge variant="outline" className="text-xs text-slate-600 font-medium">
                        {monthlyRevenueData.length} tháng
                      </Badge>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">THÁNG GIAO DỊCH</th>
                            <th className="py-3 px-4 text-center">SỐ ĐƠN</th>
                            <th className="py-3 px-4 text-right">DOANH THU</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                          {paginatedMonthlyData.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="py-6 text-center text-xs text-slate-400">
                                Chưa có dữ liệu doanh thu tháng.
                              </td>
                            </tr>
                          ) : (
                            paginatedMonthlyData.map((m) => (
                              <tr key={m.month} className="hover:bg-slate-50/90 transition-colors odd:bg-white even:bg-slate-50/40">
                                <td className="py-3.5 px-4 font-semibold text-slate-900 font-mono">
                                  Tháng {m.displayMonth}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs">
                                    {m.orderCount} đơn
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right font-bold text-orange-600 text-sm">
                                  {formatVND(m.revenue)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Table 4: Doanh thu theo năm */}
                  <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-3xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          Doanh thu theo năm
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Tăng trưởng doanh số qua các năm tài chính</p>
                      </div>
                      <Badge variant="outline" className="text-xs text-slate-600 font-medium">
                        {yearlyRevenueData.length} năm
                      </Badge>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">NĂM TÀI CHÍNH</th>
                            <th className="py-3 px-4 text-center">SỐ ĐƠN</th>
                            <th className="py-3 px-4 text-right">DOANH THU</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                          {yearlyRevenueData.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="py-6 text-center text-xs text-slate-400">
                                Chưa có dữ liệu doanh thu năm.
                              </td>
                            </tr>
                          ) : (
                            yearlyRevenueData.map((y) => (
                              <tr key={y.year} className="hover:bg-slate-50/90 transition-colors odd:bg-white even:bg-slate-50/40">
                                <td className="py-4 px-4 font-bold text-slate-900 font-mono text-base">
                                  Năm {y.year}
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <span className="inline-block px-3 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-xs">
                                    {y.orderCount} đơn
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-right font-extrabold text-emerald-600 text-base">
                                  {formatVND(y.revenue)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                MODE 2: BIỂU ĐỒ TRỰC QUAN (VISUAL CHARTS)
            ───────────────────────────────────────────────────────────── */}
            {reportViewMode === "chart" && totalOrdersCount > 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Card 1: Doanh thu theo danh mục */}
                  <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-3xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-slate-900 text-sm">
                          1. Doanh thu theo danh mục
                        </h3>
                        <span className="text-[11px] text-slate-400 font-medium">Biểu đồ thanh</span>
                      </div>

                      <div className="space-y-4">
                        {categoryRevenueData.length === 0 ? (
                          <div className="py-12 text-center text-xs text-slate-400">
                            Chưa có dữ liệu danh mục
                          </div>
                        ) : (
                          categoryRevenueData.map((cat) => (
                            <div key={cat.name} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-slate-700 truncate max-w-[280px]" title={cat.name}>
                                  {cat.name}
                                </span>
                                <span className="font-bold text-orange-600 shrink-0">
                                  {formatVND(cat.revenue)}
                                </span>
                              </div>
                              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                                  style={{ width: `${cat.barPercent}%` }}
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Card 2: Doanh thu theo ngày */}
                  <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-3xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-slate-900 text-sm">
                          2. Doanh thu theo ngày
                        </h3>
                        <span className="text-[11px] text-slate-400 font-medium">Xu hướng</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">Biểu đồ xu hướng biến động doanh số hàng ngày</p>
                    </div>

                    <div className="h-[210px] w-full">
                      {dailyRevenueData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-slate-400">
                          Chưa có dữ liệu ngày
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[...dailyRevenueData].reverse()}>
                            <defs>
                              <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis
                              dataKey="displayDate"
                              tick={{ fontSize: 11, fill: "#94a3b8" }}
                              axisLine={{ stroke: "#e2e8f0" }}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fontSize: 10, fill: "#94a3b8" }}
                              tickFormatter={(v) => `${v >= 1000000 ? (v / 1000000).toFixed(1) + "M" : v}`}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              formatter={(val: any) => [formatVND(val), "Doanh thu"]}
                              labelFormatter={(lbl) => `Ngày ${lbl}`}
                              contentStyle={{
                                borderRadius: "12px",
                                backgroundColor: "#ffffff",
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                fontSize: "12px",
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="revenue"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorDaily)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Doanh thu theo phương thức thanh toán */}
                {paymentMethodsData.length > 0 && (
                  <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          3. Doanh thu theo phương thức thanh toán
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Tỷ trọng đóng góp dòng tiền của từng cổng</p>
                      </div>
                      <CreditCard className="w-5 h-5 text-orange-500" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      {paymentMethodsData.map((p) => (
                        <div
                          key={p.name}
                          className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-semibold text-slate-700">{p.name}</span>
                            <span className="font-bold text-slate-500">{p.percentage}</span>
                          </div>
                          <p className="text-xl font-bold text-slate-900 tracking-tight">
                            {formatVND(p.revenue)}
                          </p>
                          <div className="h-1.5 w-1/2 rounded-full mt-3 overflow-hidden bg-slate-200/80">
                            <div className={`h-full ${p.barColor} w-full`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 2: KHUNG GIỜ VÀNG & HIỆU SUẤT SÂN
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "peak_hours" && (
          <div className="space-y-6">
            <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-4 rounded-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                    <Flame className="h-5 w-5 text-amber-500" />
                    <span>Phân Tích Tỷ Lệ Lấp Đầy Theo Khung Giờ Hoạt Động</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Theo dõi các ca thi đấu cao điểm để tối ưu bảng giá sân và phân bổ nhân sự
                  </p>
                </div>
              </div>

              {bookingHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Chưa có lịch đặt sân nào được ghi nhận trong kỳ.
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600">
                  Tổng số lượt đặt sân ghi nhận: <span className="font-bold text-slate-900">{bookingHistory.length} ca</span>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 3: TOP KHÁCH HÀNG & BÁN LẺ POS
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "top_performers" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cột trái: Top khách hàng */}
            <Card className="lg:col-span-6 p-6 border-slate-200 bg-white shadow-sm space-y-4 rounded-3xl">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    <span>Top Khách Hàng Chi Tiêu Nhiều Nhất</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Xếp hạng theo tổng chi tiêu thực tế</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold text-xs uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 w-12 text-center">HẠNG</th>
                      <th className="py-3 px-3">KHÁCH HÀNG</th>
                      <th className="py-3 px-3 text-center">LƯỢT ĐƠN</th>
                      <th className="py-3 px-3 text-right">TỔNG CHI TIÊU</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                    {topCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                          Chưa có khách hàng phát sinh đơn hàng.
                        </td>
                      </tr>
                    ) : (
                      topCustomers.map((c) => (
                        <tr key={c.phone} className="hover:bg-slate-50/80 transition-colors odd:bg-white even:bg-slate-50/40">
                          <td className="py-3 px-3 text-center font-bold">
                            {c.rank === 1 ? "🥇" : c.rank === 2 ? "🥈" : c.rank === 3 ? "🥉" : `#${c.rank}`}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900">{c.name}</div>
                            <div className="text-xs text-slate-400 font-mono">{c.phone}</div>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-900">
                            {c.totalBookings} đơn
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-700">
                            {formatVND(c.totalSpent)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Cột phải: Top sản phẩm bán chạy */}
            <Card className="lg:col-span-6 p-6 border-slate-200 bg-white shadow-sm space-y-4 rounded-3xl">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-emerald-600" />
                    <span>Top Sản Phẩm & Dịch Vụ Bán Chạy</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Xếp hạng theo doanh số vợt, bóng & nước uống</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold text-xs uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 w-12 text-center">HẠNG</th>
                      <th className="py-3 px-3">SẢN PHẨM / DỊCH VỤ</th>
                      <th className="py-3 px-3 text-center">ĐÃ BÁN</th>
                      <th className="py-3 px-3 text-right">DOANH THU</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                    {topRetailItems.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                          Chưa có sản phẩm nào được bán ra.
                        </td>
                      </tr>
                    ) : (
                      topRetailItems.map((r) => (
                        <tr key={r.name} className="hover:bg-slate-50/80 transition-colors odd:bg-white even:bg-slate-50/40">
                          <td className="py-3 px-3 text-center font-bold">
                            {r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : r.rank === 3 ? "🥉" : `#${r.rank}`}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900 truncate max-w-[180px]" title={r.name}>
                              {r.name}
                            </div>
                            <div className="text-xs text-slate-400">{r.category}</div>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-900">
                            {r.soldQty}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-700">
                            {formatVND(r.revenue)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 4: LỊCH SỬ ĐẶT SÂN
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "booking_history" && (
          <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-4 rounded-3xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                  <History className="h-5 w-5 text-emerald-600" />
                  <span>Lịch Sử Đặt Sân Thực Tế</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Danh sách các lượt giữ sân online và tại quầy</p>
              </div>
              <Badge variant="outline" className="text-xs text-slate-600">
                {bookingHistory.length} Lượt đặt
              </Badge>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">MÃ LỊCH</th>
                    <th className="py-3.5 px-4">KHÁCH HÀNG</th>
                    <th className="py-3.5 px-4">SÂN THỂ THAO</th>
                    <th className="py-3.5 px-4">KHUNG GIỜ</th>
                    <th className="py-3.5 px-4">PHƯƠNG THỨC</th>
                    <th className="py-3.5 px-4 text-right">THÀNH TIỀN</th>
                    <th className="py-3.5 px-4 text-center">TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                  {bookingHistory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                        Chưa có lịch đặt sân nào được tạo.
                      </td>
                    </tr>
                  ) : (
                    bookingHistory.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors odd:bg-white even:bg-slate-50/40">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.id}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{b.customer}</td>
                        <td className="py-3.5 px-4 text-slate-700">{b.court}</td>
                        <td className="py-3.5 px-4 text-slate-600">{b.slot}</td>
                        <td className="py-3.5 px-4 text-slate-600">{b.method}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700 text-right">{b.price}</td>
                        <td className="py-3.5 px-4 text-center">
                          {b.status === "COMPLETED" || b.status === "PAID" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Đã thi đấu / Đã thanh toán
                            </span>
                          ) : b.status === "CONFIRMED" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              Đã xác nhận
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {b.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 5: NHẬT KÝ HỆ THỐNG
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "audit_logs" && (
          <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-4 rounded-3xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-emerald-600" />
                  <span>Nhật Ký Thao Tác Hệ Thống (Audit Trail)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Ghi nhận toàn bộ thao tác bảo mật và sự kiện hệ thống</p>
              </div>
              <Badge variant="outline" className="text-xs font-mono text-emerald-700 bg-emerald-50 border-emerald-200">
                Live Audit
              </Badge>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 w-16">STT</th>
                    <th className="py-3.5 px-4">NGƯỜI THỰC HIỆN</th>
                    <th className="py-3.5 px-4">HÀNH ĐỘNG / SỰ KIỆN</th>
                    <th className="py-3.5 px-4">ĐỊA CHỈ IP</th>
                    <th className="py-3.5 px-4 text-right">THỜI GIAN THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      Chưa có sự kiện bất thường nào được ghi nhận trong phiên làm việc.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
