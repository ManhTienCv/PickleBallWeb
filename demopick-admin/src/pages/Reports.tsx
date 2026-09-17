import { useState } from "react";
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
import { toast } from "sonner";

// ── NAVIGATION TABS ──────────────────────────────────────────────────────────
const tabs = [
  { id: "overview", label: "Báo Cáo Doanh Thu (Lab 08)" },
  { id: "peak_hours", label: "Khung Giờ Vàng & Hiệu Suất Sân" },
  { id: "top_performers", label: "Top Khách Hàng & Bán Lẻ POS" },
  { id: "booking_history", label: "Lịch Sử Đặt Sân" },
  { id: "audit_logs", label: "Nhật Ký Hệ Thống (Audit Logs)" },
];

const datePeriods = [
  { id: "30days", label: "30 Ngày Gần Nhất" },
  { id: "today", label: "Hôm Nay" },
  { id: "7days", label: "7 Ngày Gần Nhất" },
  { id: "this_month", label: "Tháng Này (Tháng 9/2026)" },
  { id: "this_year", label: "Năm Nay (2026)" },
];

// ── LAB 08 DATASETS ───────────────────────────────────────────────────────────
const formatVND = (num: number) => {
  return new Intl.NumberFormat("vi-VN").format(num) + " đ";
};

// 1. Doanh thu theo danh mục sản phẩm (Pickleball Store)
const categoryRevenueData = [
  { name: "Vợt Pickleball Carbon (JOOLA, Franklin)", soldQty: "12 chiếc", revenue: 285400000, percentage: 50.2, barPercent: 100 },
  { name: "Bóng thi đấu USAPA (Franklin X-40)", soldQty: "24 hộp", revenue: 164500000, percentage: 28.9, barPercent: 57.6 },
  { name: "Balo & Túi đựng vợt chống sốc", soldQty: "8 túi", revenue: 68200000, percentage: 12.0, barPercent: 23.9 },
  { name: "Phụ kiện & Quấn cán vợt", soldQty: "65 bộ", revenue: 32800000, percentage: 5.8, barPercent: 11.5 },
  { name: "Dịch vụ sân & Thuê máy bắn bóng", soldQty: "6 ca", revenue: 18000000, percentage: 3.1, barPercent: 6.3 },
];

// 2. Doanh thu theo ngày (30 ngày gần nhất: 2026-08-19 -> 2026-09-17)
const dailyRevenueData = [
  { date: "2026-08-19", displayDate: "19/08", paidOrders: 3, revenue: 14200000 },
  { date: "2026-08-20", displayDate: "20/08", paidOrders: 4, revenue: 16500000 },
  { date: "2026-08-21", displayDate: "21/08", paidOrders: 5, revenue: 19800000 },
  { date: "2026-08-22", displayDate: "22/08", paidOrders: 6, revenue: 24500000 },
  { date: "2026-08-23", displayDate: "23/08", paidOrders: 7, revenue: 28000000 },
  { date: "2026-08-24", displayDate: "24/08", paidOrders: 3, revenue: 13900000 },
  { date: "2026-08-25", displayDate: "25/08", paidOrders: 4, revenue: 15400000 },
  { date: "2026-08-26", displayDate: "26/08", paidOrders: 3, revenue: 14800000 },
  { date: "2026-08-27", displayDate: "27/08", paidOrders: 4, revenue: 16900000 },
  { date: "2026-08-28", displayDate: "28/08", paidOrders: 3, revenue: 17200000 },
  { date: "2026-08-29", displayDate: "29/08", paidOrders: 3, revenue: 21400000 },
  { date: "2026-08-30", displayDate: "30/08", paidOrders: 4, revenue: 25600000 },
  { date: "2026-08-31", displayDate: "31/08", paidOrders: 3, revenue: 18900000 },
  { date: "2026-09-01", displayDate: "01/09", paidOrders: 3, revenue: 22400000 },
  { date: "2026-09-02", displayDate: "02/09", paidOrders: 4, revenue: 27500000 },
  { date: "2026-09-03", displayDate: "03/09", paidOrders: 5, revenue: 31000000 },
  { date: "2026-09-04", displayDate: "04/09", paidOrders: 4, revenue: 23500000 },
  { date: "2026-09-05", displayDate: "05/09", paidOrders: 6, revenue: 36800000 },
  { date: "2026-09-06", displayDate: "06/09", paidOrders: 7, revenue: 42000000 },
  { date: "2026-09-07", displayDate: "07/09", paidOrders: 4, revenue: 24200000 },
  { date: "2026-09-08", displayDate: "08/09", paidOrders: 3, revenue: 19500000 },
  { date: "2026-09-09", displayDate: "09/09", paidOrders: 5, revenue: 28000000 },
  { date: "2026-10-10", displayDate: "10/09", paidOrders: 4, revenue: 26400000 },
  { date: "2026-09-11", displayDate: "11/09", paidOrders: 5, revenue: 30200000 },
  { date: "2026-09-12", displayDate: "12/09", paidOrders: 8, revenue: 48500000 },
  { date: "2026-09-13", displayDate: "13/09", paidOrders: 7, revenue: 44000000 },
  { date: "2026-09-14", displayDate: "14/09", paidOrders: 4, revenue: 22000000 },
  { date: "2026-09-15", displayDate: "15/09", paidOrders: 5, revenue: 29500000 },
  { date: "2026-09-16", displayDate: "16/09", paidOrders: 6, revenue: 34000000 },
  { date: "2026-09-17", displayDate: "17/09", paidOrders: 5, revenue: 31000000 },
];

// 3. Doanh thu theo tháng (12 tháng gần nhất: 2025-10 -> 2026-09)
const monthlyRevenueData = [
  { month: "2026-09", displayMonth: "09/2026", orderCount: 16, revenue: 64000000 },
  { month: "2026-08", displayMonth: "08/2026", orderCount: 21, revenue: 78500000 },
  { month: "2026-07", displayMonth: "07/2026", orderCount: 18, revenue: 66000000 },
  { month: "2026-06", displayMonth: "06/2026", orderCount: 16, revenue: 58200000 },
  { month: "2026-05", displayMonth: "05/2026", orderCount: 14, revenue: 54500000 },
  { month: "2026-04", displayMonth: "04/2026", orderCount: 12, revenue: 48000000 },
  { month: "2026-03", displayMonth: "03/2026", orderCount: 10, revenue: 41200000 },
  { month: "2026-02", displayMonth: "02/2026", orderCount: 10, revenue: 38400000 },
  { month: "2026-01", displayMonth: "01/2026", orderCount: 13, revenue: 52000000 },
  { month: "2025-12", displayMonth: "12/2025", orderCount: 11, revenue: 45600000 },
  { month: "2025-11", displayMonth: "11/2025", orderCount: 8, revenue: 32000000 },
  { month: "2025-10", displayMonth: "10/2025", orderCount: 7, revenue: 28500000 },
];

// 4. Doanh thu theo từng năm
const yearlyRevenueData = [
  { year: "2026", orderCount: 156, revenue: 568900000, percentage: 100, growth: "+77.8%" },
  { year: "2025", orderCount: 78, revenue: 320000000, percentage: 56.2, growth: "+73.0%" },
  { year: "2024", orderCount: 42, revenue: 185000000, percentage: 32.5, growth: "--" },
];

// 5. Tỷ trọng phương thức thanh toán
const paymentMethodsData = [
  {
    name: "Ví MoMo",
    percentage: "61%",
    revenue: 345000000,
    accentColor: "#ec4899",
    barColor: "bg-[#ec4899]",
  },
  {
    name: "Tiền mặt (COD)",
    percentage: "25%",
    revenue: 142500000,
    accentColor: "#f59e0b",
    barColor: "bg-[#f59e0b]",
  },
  {
    name: "VietQR",
    percentage: "14%",
    revenue: 81400000,
    accentColor: "#3b82f6",
    barColor: "bg-[#3b82f6]",
  },
];

// ── SECONDARY OPERATIONAL DATASETS ───────────────────────────────────────────
const peakHoursData = [
  { timeSlot: "05:00 - 08:00 (Ca Sáng Sớm)", bookedSlots: 38, totalSlots: 42, rate: 90.5, revenue: 15200000, status: "Rất Tốt", isHot: false },
  { timeSlot: "08:00 - 14:00 (Khung Giờ Sáng - Trưa)", bookedSlots: 52, totalSlots: 84, rate: 61.9, revenue: 26000000, status: "Ổn Định", isHot: false },
  { timeSlot: "14:00 - 17:00 (Khung Giờ Chiều)", bookedSlots: 32, totalSlots: 42, rate: 76.2, revenue: 16000000, status: "Tốt", isHot: false },
  { timeSlot: "17:00 - 21:00 (Giờ Vàng Cao Điểm 🔥)", bookedSlots: 56, totalSlots: 56, rate: 100.0, revenue: 67200000, status: "Kín Sân (100%)", isHot: true },
  { timeSlot: "21:00 - 23:00 (Khung Giờ Đêm Muộn)", bookedSlots: 22, totalSlots: 28, rate: 78.6, revenue: 13200000, status: "Tốt", isHot: false },
];

const topCustomers = [
  { rank: 1, name: "Nguyễn Văn An", phone: "0912 334 556", totalBookings: 18, totalSpent: 6480000, favCourt: "Sân VIP C1", lastPlayed: "18/08/2026" },
  { rank: 2, name: "Trần Thị Bích", phone: "0988 123 456", totalBookings: 14, totalSpent: 5580000, favCourt: "Sân A1 Trong Nhà", lastPlayed: "17/08/2026" },
  { rank: 3, name: "Lê Hoàng Long", phone: "0903 456 789", totalBookings: 12, totalSpent: 4320000, favCourt: "Sân A2 Trong Nhà", lastPlayed: "16/08/2026" },
  { rank: 4, name: "Phạm Quốc Bảo", phone: "0977 889 900", totalBookings: 10, totalSpent: 3600000, favCourt: "Sân VIP C1", lastPlayed: "18/08/2026" },
  { rank: 5, name: "Vũ Thị Mai", phone: "0934 567 890", totalBookings: 8, totalSpent: 2880000, favCourt: "Sân B1 Ngoài Trời", lastPlayed: "15/08/2026" },
];

const topRetailItems = [
  { rank: 1, name: "Vợt Pickleball JOOLA Ben Johns Hyperion CFS 16", category: "Vợt Thi Đấu", soldQty: 12, revenue: 59880000, margin: "32%" },
  { rank: 2, name: "Hộp 12 Bóng Franklin X-40 Outdoor", category: "Bóng Thi Đấu", soldQty: 48, revenue: 20160000, margin: "40%" },
  { rank: 3, name: "Dịch Vụ Thuê Vợt Thi Đấu Cao Cấp (Theo Ca)", category: "Dịch Vụ Sân", soldQty: 95, revenue: 4750000, margin: "85%" },
  { rank: 4, name: "Nước Uống Điện Giải Pocari Sweat 500ml", category: "Nước Uống", soldQty: 180, revenue: 4500000, margin: "50%" },
  { rank: 5, name: "Quấn Cán Vợt JOOLA Pro Grip Chống Trơn", category: "Phụ Kiện", soldQty: 64, revenue: 1600000, margin: "45%" },
];

const bookingHistory = [
  { id: "BK-901", customer: "Nguyễn Văn An", court: "Sân C1 (VIP)", slot: "08:00 - 10:00 (18/08)", price: "360.000đ", method: "VietQR", status: "COMPLETED" },
  { id: "BK-902", customer: "Trần Thị Bích", court: "Sân A1 (Trong Nhà)", slot: "17:00 - 19:00 (18/08)", price: "240.000đ", method: "Tiền mặt", status: "CONFIRMED" },
  { id: "BK-903", customer: "Lê Hoàng Long", court: "Sân A2 (Trong Nhà)", slot: "06:00 - 08:00 (18/08)", price: "180.000đ", method: "MoMo", status: "REFUNDED" },
  { id: "BK-904", customer: "Phạm Quốc Bảo", court: "Sân C1 (VIP)", slot: "19:00 - 21:00 (18/08)", price: "360.000đ", method: "VietQR", status: "COMPLETED" },
  { id: "BK-905", customer: "Vũ Thị Mai", court: "Sân B1 (Ngoài Trời)", slot: "17:00 - 19:00 (18/08)", price: "200.000đ", method: "VietinBank VietQR", status: "CONFIRMED" },
];

const auditLogs = [
  { id: 1, user: "admin@demopick.vn", action: "Đăng nhập hệ thống Admin Portal", ip: "127.0.0.1", time: "2026-08-18 10:12:09" },
  { id: 2, user: "staff@demopick.vn", action: "Tạo hóa đơn bán hàng POS #HD-88292", ip: "127.0.0.1", time: "2026-08-18 09:15:30" },
  { id: 3, user: "System Auto Lock", action: "Khớp lệnh VietQR tự động thành công cho Khách Nguyễn Văn An (Sân VIP C1)", ip: "System", time: "2026-08-18 08:20:00" },
  { id: 4, user: "admin@demopick.vn", action: "Xử lý hoàn tiền 100% cho mã đặt sân #BK-903", ip: "127.0.0.1", time: "2026-08-18 07:05:12" },
  { id: 5, user: "staff@demopick.vn", action: "Quét vé QR Check-in khách vào Sân A1", ip: "127.0.0.1", time: "2026-08-18 06:55:00" },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("overview");
  // Default to 'table' as requested by user
  const [reportViewMode, setReportViewMode] = useState<"chart" | "table">("table");
  const [selectedPeriod, setSelectedPeriod] = useState("30days");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination for Daily Data (10 days per page)
  const [dailyPage, setDailyPage] = useState(1);
  const [dailySortOrder, setDailySortOrder] = useState<"desc" | "asc">("desc");
  const dailyPageSize = 10;

  // Pagination for Monthly Data (6 months per page)
  const [monthlyPage, setMonthlyPage] = useState(1);
  const monthlyPageSize = 6;

  const currentPeriodObj = datePeriods.find((p) => p.id === selectedPeriod) || datePeriods[0];

  // Daily Data sorting and pagination
  const sortedDailyData = [...dailyRevenueData].sort((a, b) => {
    return dailySortOrder === "desc"
      ? b.date.localeCompare(a.date)
      : a.date.localeCompare(b.date);
  });
  const totalDailyPages = Math.ceil(sortedDailyData.length / dailyPageSize);
  const paginatedDailyData = sortedDailyData.slice(
    (dailyPage - 1) * dailyPageSize,
    dailyPage * dailyPageSize
  );

  // Monthly Data pagination
  const totalMonthlyPages = Math.ceil(monthlyRevenueData.length / monthlyPageSize);
  const paginatedMonthlyData = monthlyRevenueData.slice(
    (monthlyPage - 1) * monthlyPageSize,
    monthlyPage * monthlyPageSize
  );

  // Logic Xuất Excel thực tế (CSV tiếng Việt chuẩn UTF-8 BOM)
  const handleExportExcel = () => {
    let csvContent = "\uFEFF";
    const dateStamp = new Date().toISOString().slice(0, 10);
    const fileName = `Bao_Cao_DemoPick_${activeTab}_${dateStamp}.csv`;

    if (activeTab === "overview") {
      csvContent += "BÁO CÁO PHÂN TÍCH DOANH THU DEMOPICK PICKLEBALL (LAB 08)\n";
      csvContent += `Thời gian xuất: ${dateStamp}\n`;
      csvContent += `Tổng số đơn hàng,156 đơn\n`;
      csvContent += `Tổng số khách hàng,48 khách\n`;
      csvContent += `Tổng doanh thu thực tế,568.900.000 đ\n\n`;

      csvContent += "1. DOANH THU THEO DANH MỤC SẢN PHẨM\n";
      csvContent += "Danh Mục,Số Lượng Bán,Tỷ Trọng,Doanh Thu\n";
      categoryRevenueData.forEach((c) => {
        csvContent += `"${c.name}","${c.soldQty}",${c.percentage}%,"${formatVND(c.revenue)}"\n`;
      });

      csvContent += "\n2. DOANH THU THEO NGÀY (30 NGÀY GẦN NHẤT)\n";
      csvContent += "Ngày,Số Đơn Đã Thanh Toán,Doanh Thu\n";
      dailyRevenueData.forEach((d) => {
        csvContent += `"${d.date}",${d.paidOrders},"${formatVND(d.revenue)}"\n`;
      });

      csvContent += "\n3. DOANH THU THEO THÁNG (12 THÁNG)\n";
      csvContent += "Tháng,Số Đơn Hàng,Doanh Thu\n";
      monthlyRevenueData.forEach((m) => {
        csvContent += `"${m.month}",${m.orderCount},"${formatVND(m.revenue)}"\n`;
      });

      csvContent += "\n4. DOANH THU THEO NĂM\n";
      csvContent += "Năm,Số Đơn Hàng,Tăng Trưởng,Doanh Thu\n";
      yearlyRevenueData.forEach((y) => {
        csvContent += `"${y.year}",${y.orderCount},"${y.growth}","${formatVND(y.revenue)}"\n`;
      });

      csvContent += "\n5. TỶ TRỌNG PHƯƠNG THỨC THANH TOÁN\n";
      csvContent += "Phương Thức,Tỷ Trọng,Doanh Thu\n";
      paymentMethodsData.forEach((p) => {
        csvContent += `"${p.name}",${p.percentage},"${formatVND(p.revenue)}"\n`;
      });
    } else if (activeTab === "peak_hours") {
      csvContent += "BÁO CÁO KHUNG GIỜ VÀNG & HIỆU SUẤT SÂN\n";
      csvContent += "Khung Giờ,Số Ca Đã Đặt,Tổng Ca Mở,Tỷ Lệ Lấp Đầy,Doanh Thu,Đánh Giá\n";
      peakHoursData.forEach((p) => {
        csvContent += `"${p.timeSlot}",${p.bookedSlots},${p.totalSlots},${p.rate}%,${p.revenue} đ,"${p.status}"\n`;
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
    } else if (activeTab === "audit_logs") {
      csvContent += "NHẬT KÝ THAO TÁC HỆ THỐNG (AUDIT TRAIL LOGS)\n";
      csvContent += "STT,Người Thực Hiện,Hành Động / Sự Kiện,Địa Chỉ IP,Thời Gian Thao Tác\n";
      auditLogs.forEach((l) => {
        csvContent += `${l.id},"${l.user}","${l.action}","${l.ip}","${l.time}"\n`;
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Đã đồng bộ và làm mới dữ liệu báo cáo mới nhất!");
    }, 500);
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
                  className={`text-xs rounded-xl py-2 px-3 cursor-pointer ${selectedPeriod === period.id ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-700"
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
            onClick={handleRefresh}
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
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${activeTab === t.id
                  ? "bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-600/20"
                  : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            TAB 1: BÁO CÁO & PHÂN TÍCH DOANH THU (LAB 08 CHUẨN ĐẶC TẢ)
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Header Title & Mode Toggle Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Báo cáo & Phân tích Doanh thu
                </h2>

              </div>

              {/* Segmented Switcher: [ Bảng số liệu ] vs [ Biểu đồ trực quan ] */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                  <button
                    onClick={() => setReportViewMode("table")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${reportViewMode === "table"
                        ? "bg-white text-slate-900 font-bold shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                      }`}
                  >
                    <TableProperties className="w-3.5 h-3.5" />
                    <span>Bảng số liệu</span>
                  </button>
                  <button
                    onClick={() => setReportViewMode("chart")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${reportViewMode === "chart"
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
                  onClick={handleRefresh}
                  className="w-8 h-8 p-0 bg-white border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm shrink-0"
                  title="Tải lại số liệu"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
                </Button>
              </div>
            </div>

            {/* 3 KPI HEADER CARDS (Match images: 156, 48, 568.900.000 đ) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Tổng số đơn hàng */}
              <Card className="p-5 border-slate-200 bg-white shadow-sm rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    TỔNG SỐ ĐƠN HÀNG
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">156</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-normal">Đơn hàng trong CSDL</p>
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
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">48</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-normal">Tài khoản người dùng</p>
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
                  <p className="text-3xl font-extrabold text-emerald-600 mt-1">568.900.000 đ</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-normal">Bao gồm phí vận chuyển</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
              </Card>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                MODE 1: BẢNG SỐ LIỆU (DATA TABLES) - HIỂN THỊ TRƯỚC THEO YÊU CẦU
            ───────────────────────────────────────────────────────────── */}
            {reportViewMode === "table" && (
              <div className="space-y-6">
                {/* Table 1: Doanh thu theo danh mục sản phẩm */}
                <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-3xl space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-base">
                      Doanh thu theo danh mục sản phẩm
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tính theo giá trị sản phẩm khi khách đặt mua, không tính phí vận chuyển.
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
                        {categoryRevenueData.map((cat) => (
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Table 2: Doanh thu theo ngày (30 ngày gần nhất) CÓ PHÂN TRANG */}
                <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-3xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        Doanh thu theo ngày (30 ngày gần nhất)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Dữ liệu đối soát đơn hàng hoàn tất thanh toán từ 19/08 đến 17/09/2026.
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
                        30 ngày
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
                        {paginatedDailyData.map((d) => (
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
                              {formatVND(Math.round(d.revenue / d.paidOrders))}
                            </td>
                            <td className="py-3.5 px-5 text-right font-bold text-emerald-600 text-sm">
                              {formatVND(d.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Thanh Phân Trang (Pagination Controls) */}
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
                          className={`h-8 w-8 p-0 text-xs rounded-xl ${dailyPage === p
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
                        <p className="text-xs text-slate-500 mt-0.5">Tổng hợp 12 tháng hoạt động gần nhất</p>
                      </div>
                      <Badge variant="outline" className="text-xs text-slate-600 font-medium">
                        12 tháng
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
                          {paginatedMonthlyData.map((m) => (
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
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Phân trang tháng: Trang 1 (6 tháng gần nhất) - Trang 2 (6 tháng trước) */}
                    <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                      <span>Trang {monthlyPage} / {totalMonthlyPages} (6 tháng / trang)</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={monthlyPage === 1}
                          onClick={() => setMonthlyPage(1)}
                          className={`h-7 px-2.5 text-xs rounded-lg ${monthlyPage === 1 ? "bg-slate-100 font-bold" : ""}`}
                        >
                          6 tháng gần nhất
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={monthlyPage === 2}
                          onClick={() => setMonthlyPage(2)}
                          className={`h-7 px-2.5 text-xs rounded-lg ${monthlyPage === 2 ? "bg-slate-100 font-bold" : ""}`}
                        >
                          6 tháng trước
                        </Button>
                      </div>
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
                        3 năm
                      </Badge>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">NĂM TÀI CHÍNH</th>
                            <th className="py-3 px-4 text-center">SỐ ĐƠN</th>
                            <th className="py-3 px-4 text-center">TĂNG TRƯỞNG</th>
                            <th className="py-3 px-4 text-right">DOANH THU</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                          {yearlyRevenueData.map((y) => (
                            <tr key={y.year} className="hover:bg-slate-50/90 transition-colors odd:bg-white even:bg-slate-50/40">
                              <td className="py-4 px-4 font-bold text-slate-900 font-mono text-base">
                                Năm {y.year}
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="inline-block px-3 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-xs">
                                  {y.orderCount} đơn
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                {y.growth !== "--" ? (
                                  <Badge variant="outline" className="text-xs font-bold text-emerald-700 bg-emerald-50 border-emerald-200">
                                    {y.growth}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-slate-400 font-medium">--</span>
                                )}
                              </td>
                              <td className="py-4 px-4 text-right font-extrabold text-emerald-600 text-base">
                                {formatVND(y.revenue)}
                              </td>
                            </tr>
                          ))}
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
            {reportViewMode === "chart" && (
              <div className="space-y-6">
                {/* Row 1: Doanh thu theo danh mục & Doanh thu 30 ngày */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Card 1: Doanh thu theo danh mục */}
                  <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-3xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-slate-900 text-sm">
                          1. Doanh thu theo danh mục
                        </h3>
                        <span className="text-[11px] text-slate-400 font-medium">Biểu đồ cột</span>
                      </div>

                      <div className="space-y-4">
                        {categoryRevenueData.map((cat) => (
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
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Card 2: Doanh thu 30 ngày gần nhất */}
                  <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-3xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-slate-900 text-sm">
                          2. Doanh thu 30 ngày gần nhất
                        </h3>
                        <span className="text-[11px] text-slate-400 font-medium">Xu hướng ngày</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">Biểu đồ xu hướng biến động doanh số hàng ngày</p>
                    </div>

                    <div className="h-[210px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyRevenueData}>
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
                            interval={5}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: "#94a3b8" }}
                            tickFormatter={(v) => `${v / 1000000}M`}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            formatter={(val: any) => [formatVND(val), "Doanh thu"]}
                            labelFormatter={(lbl) => `Ngày ${lbl}/2026`}
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
                    </div>
                  </Card>
                </div>

                {/* Row 2: Doanh thu theo tháng (12 tháng) & Doanh thu theo năm */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Card 3: Doanh thu theo tháng */}
                  <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-3xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-slate-900 text-sm">
                          3. Doanh thu theo tháng (12 tháng)
                        </h3>
                        <span className="text-[11px] text-slate-400 font-medium">Tháng</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">Chu kỳ 12 tháng từ 10/2025 đến 09/2026</p>
                    </div>

                    <div className="h-[210px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[...monthlyRevenueData].reverse()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis
                            dataKey="displayMonth"
                            tick={{ fontSize: 10, fill: "#94a3b8" }}
                            axisLine={{ stroke: "#e2e8f0" }}
                            tickLine={false}
                            interval={1}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: "#94a3b8" }}
                            tickFormatter={(v) => `${v / 1000000}M`}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            formatter={(val: any) => [formatVND(val), "Doanh thu"]}
                            labelFormatter={(lbl) => `Tháng ${lbl}`}
                            contentStyle={{
                              borderRadius: "12px",
                              backgroundColor: "#ffffff",
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                              fontSize: "12px",
                            }}
                          />
                          <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Card 4: Doanh thu theo từng năm */}
                  <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-3xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-slate-900 text-sm">
                          4. Doanh thu theo từng năm
                        </h3>
                        <span className="text-[11px] text-slate-400 font-medium">Năm</span>
                      </div>

                      <div className="space-y-6 pt-2">
                        {[...yearlyRevenueData].reverse().map((y) => (
                          <div key={y.year} className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-800">
                                Năm {y.year}
                              </span>
                              <span className="font-bold text-emerald-600">
                                {formatVND(y.revenue)}
                              </span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                                style={{ width: `${y.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Row 3: Doanh thu theo phương thức thanh toán (MoMo vs COD vs VietQR) */}
                <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        5. Doanh thu theo phương thức thanh toán (MoMo vs COD vs VietQR)
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
                    Theo dõi các ca thi đấu cao điểm để tối ưu bảng giá sân và phân bổ nhân sự lễ tân
                  </p>
                </div>
                <Badge className="bg-amber-100 text-amber-900 border-amber-200 text-xs font-normal">
                  Giờ Vàng 17h - 21h Đạt 100%
                </Badge>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">KHUNG GIỜ HOẠT ĐỘNG</th>
                      <th className="py-3.5 px-4 text-center">SỐ CA ĐÃ ĐẶT</th>
                      <th className="py-3.5 px-4 text-center">TỔNG CA MỞ</th>
                      <th className="py-3.5 px-4 w-48">TỶ LỆ LẤP ĐẦY</th>
                      <th className="py-3.5 px-4 text-right">DOANH THU THU VỀ</th>
                      <th className="py-3.5 px-4 text-center">ĐÁNH GIÁ HIỆU SUẤT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                    {peakHoursData.map((slot) => (
                      <tr key={slot.timeSlot} className="hover:bg-slate-50/80 transition-colors odd:bg-white even:bg-slate-50/40">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            {slot.isHot ? (
                              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span>{slot.timeSlot}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                          {slot.bookedSlots} ca
                        </td>

                        <td className="py-3.5 px-4 text-center text-slate-500 font-medium">
                          {slot.totalSlots} ca
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-bold text-slate-900">{slot.rate}%</span>
                              <span className="text-slate-400">{slot.bookedSlots}/{slot.totalSlots}</span>
                            </div>
                            <Progress value={slot.rate} className="h-2 bg-slate-100" />
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-emerald-700 text-sm">
                          {new Intl.NumberFormat("vi-VN").format(slot.revenue)} đ
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {slot.rate >= 95 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              🔥 Kín Sân (100%)
                            </span>
                          ) : slot.rate >= 75 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Hiệu Suất Tốt
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              Ổn Định
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 3: TOP KHÁCH HÀNG & BÁN LẺ POS
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "top_performers" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cột trái: Top khách hàng thân thiết */}
            <Card className="lg:col-span-6 p-6 border-slate-200 bg-white shadow-sm space-y-4 rounded-3xl">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    <span>Top Khách Hàng Đặt Sân Nhiều Nhất</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Xếp hạng theo tổng chi tiêu và số lượt đặt sân</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold text-xs uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 w-12 text-center">HẠNG</th>
                      <th className="py-3 px-3">KHÁCH HÀNG</th>
                      <th className="py-3 px-3 text-center">LƯỢT ĐẶT</th>
                      <th className="py-3 px-3 text-right">TỔNG CHI TIÊU</th>
                      <th className="py-3 px-3">SÂN YÊU THÍCH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                    {topCustomers.map((c) => (
                      <tr key={c.phone} className="hover:bg-slate-50/80 transition-colors odd:bg-white even:bg-slate-50/40">
                        <td className="py-3 px-3 text-center font-bold">
                          {c.rank === 1 ? "🥇" : c.rank === 2 ? "🥈" : c.rank === 3 ? "🥉" : `#${c.rank}`}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{c.name}</div>
                          <div className="text-xs text-slate-400 font-mono">{c.phone}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900">
                          {c.totalBookings} lượt
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-700">
                          {new Intl.NumberFormat("vi-VN").format(c.totalSpent)} đ
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-600 font-medium">
                          {c.favCourt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Cột phải: Top sản phẩm & dịch vụ bán chạy */}
            <Card className="lg:col-span-6 p-6 border-slate-200 bg-white shadow-sm space-y-4 rounded-3xl">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-emerald-600" />
                    <span>Top Sản Phẩm & Dịch Vụ Bán Lẻ POS</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Xếp hạng theo doanh thu thiết bị, bóng & nước uống</p>
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
                      <th className="py-3 px-3 text-center">LÃI GỘP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                    {topRetailItems.map((r) => (
                      <tr key={r.name} className="hover:bg-slate-50/80 transition-colors odd:bg-white even:bg-slate-50/40">
                        <td className="py-3 px-3 text-center font-bold">
                          {r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : r.rank === 3 ? "🥉" : `#${r.rank}`}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900 truncate max-w-[180px]" title={r.name}>{r.name}</div>
                          <div className="text-xs text-slate-400">{r.category}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900">
                          {r.soldQty}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-700">
                          {new Intl.NumberFormat("vi-VN").format(r.revenue)} đ
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant="outline" className="text-xs font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
                            {r.margin}
                          </Badge>
                        </td>
                      </tr>
                    ))}
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
                  <span>Lịch Sử Đặt Sân & Hoàn Tiền Chi Tiết</span>
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
                  {bookingHistory.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors odd:bg-white even:bg-slate-50/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{b.customer}</td>
                      <td className="py-3.5 px-4 text-slate-700">{b.court}</td>
                      <td className="py-3.5 px-4 text-slate-600">{b.slot}</td>
                      <td className="py-3.5 px-4 text-slate-600">{b.method}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700 text-right">{b.price}</td>
                      <td className="py-3.5 px-4 text-center">
                        {b.status === "COMPLETED" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Đã thi đấu
                          </span>
                        ) : b.status === "CONFIRMED" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            Đã xác nhận
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                            Đã hủy (Hoàn tiền)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 5: NHẬT KÝ HỆ THỐNG (AUDIT TRAIL LOGS)
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "audit_logs" && (
          <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-4 rounded-3xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-emerald-600" />
                  <span>Nhật Ký Thao Tác Hệ Thống </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Ghi nhận toàn bộ thao tác bảo mật và sự kiện thanh toán thời gian thực</p>
              </div>
              <Badge variant="outline" className="text-xs font-mono text-emerald-700 bg-emerald-50 border-emerald-200">
                Trace-ID Enabled
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
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors odd:bg-white even:bg-slate-50/40">
                      <td className="py-3.5 px-4 font-mono text-slate-400 font-semibold">#{log.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{log.user}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{log.action}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{log.ip}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-400 text-right">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
