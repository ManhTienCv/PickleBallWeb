import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import {
  ArrowUpRight,
  Download,
  BarChart3,
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
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
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

const tabs = [
  { id: "overview", label: "Tổng Quan Doanh Thu" },
  { id: "peak_hours", label: "Khung Giờ Vàng & Hiệu Suất Sân" },
  { id: "top_performers", label: "Top Khách Hàng & Bán Lẻ POS" },
  { id: "booking_history", label: "Lịch Sử Đặt Sân" },
  { id: "audit_logs", label: "Nhật Ký Hệ Thống (Audit Logs)" },
];

const datePeriods = [
  { id: "today", label: "Hôm Nay" },
  { id: "7days", label: "7 Ngày Gần Nhất" },
  { id: "30days", label: "30 Ngày Gần Nhất" },
  { id: "this_month", label: "Tháng Này (Tháng 8/2026)" },
  { id: "this_quarter", label: "Quý Này (Quý 3/2026)" },
];

// Stats according to selected period
const periodStatsMap: Record<string, { revenue: string; hours: string; posRevenue: string; avgOccupancy: string }> = {
  today: { revenue: "18.900.000đ", hours: "54 giờ", posRevenue: "3.250.000đ", avgOccupancy: "88.5%" },
  "7days": { revenue: "94.800.000đ", hours: "312 giờ", posRevenue: "14.600.000đ", avgOccupancy: "84.2%" },
  "30days": { revenue: "348.500.000đ", hours: "1.240 giờ", posRevenue: "42.800.000đ", avgOccupancy: "81.6%" },
  this_month: { revenue: "348.500.000đ", hours: "1.240 giờ", posRevenue: "42.800.000đ", avgOccupancy: "81.6%" },
  this_quarter: { revenue: "890.200.000đ", hours: "3.580 giờ", posRevenue: "115.400.000đ", avgOccupancy: "79.8%" },
};

const revenueData30Days = [
  { name: "Thứ 2", current: 8500000, previous: 7200000 },
  { name: "Thứ 3", current: 9200000, previous: 8100000 },
  { name: "Thứ 4", current: 11400000, previous: 9500000 },
  { name: "Thứ 5", current: 10800000, previous: 10100000 },
  { name: "Thứ 6", current: 14500000, previous: 12000000 },
  { name: "Thứ 7", current: 18900000, previous: 16500000 },
  { name: "Chủ Nhật", current: 21000000, previous: 18000000 },
];

const courtRevenue = [
  { name: "Sân A1 (Trong Nhà)", value: 28, color: "#10b981", amount: "97.580.000đ" },
  { name: "Sân A2 (Trong Nhà)", value: 26, color: "#3b82f6", amount: "90.610.000đ" },
  { name: "Sân B1 (Ngoài Trời)", value: 16, color: "#f59e0b", amount: "55.760.000đ" },
  { name: "Sân B2 (Ngoài Trời)", value: 14, color: "#8b5cf6", amount: "48.790.000đ" },
  { name: "Sân C1 (VIP Đèn LED)", value: 16, color: "#ec4899", amount: "55.760.000đ" },
];

// Khung giờ vàng & Hiệu suất sân
const peakHoursData = [
  { timeSlot: "05:00 - 08:00 (Ca Sáng Sớm)", bookedSlots: 38, totalSlots: 42, rate: 90.5, revenue: 15200000, status: "Rất Tốt", isHot: false },
  { timeSlot: "08:00 - 14:00 (Khung Giờ Sáng - Trưa)", bookedSlots: 52, totalSlots: 84, rate: 61.9, revenue: 26000000, status: "Ổn Định", isHot: false },
  { timeSlot: "14:00 - 17:00 (Khung Giờ Chiều)", bookedSlots: 32, totalSlots: 42, rate: 76.2, revenue: 16000000, status: "Tốt", isHot: false },
  { timeSlot: "17:00 - 21:00 (Giờ Vàng Cao Điểm 🔥)", bookedSlots: 56, totalSlots: 56, rate: 100.0, revenue: 67200000, status: "Kín Sân (100%)", isHot: true },
  { timeSlot: "21:00 - 23:00 (Khung Giờ Đêm Muộn)", bookedSlots: 22, totalSlots: 28, rate: 78.6, revenue: 13200000, status: "Tốt", isHot: false },
];

// Top Khách hàng thân thiết
const topCustomers = [
  { rank: 1, name: "Nguyễn Văn An", phone: "0912 334 556", totalBookings: 18, totalSpent: 6480000, favCourt: "Sân VIP C1", lastPlayed: "18/08/2026" },
  { rank: 2, name: "Trần Thị Bích", phone: "0988 123 456", totalBookings: 14, totalSpent: 5580000, favCourt: "Sân A1 Trong Nhà", lastPlayed: "17/08/2026" },
  { rank: 3, name: "Lê Hoàng Long", phone: "0903 456 789", totalBookings: 12, totalSpent: 4320000, favCourt: "Sân A2 Trong Nhà", lastPlayed: "16/08/2026" },
  { rank: 4, name: "Phạm Quốc Bảo", phone: "0977 889 900", totalBookings: 10, totalSpent: 3600000, favCourt: "Sân VIP C1", lastPlayed: "18/08/2026" },
  { rank: 5, name: "Vũ Thị Mai", phone: "0934 567 890", totalBookings: 8, totalSpent: 2880000, favCourt: "Sân B1 Ngoài Trời", lastPlayed: "15/08/2026" },
];

// Top Sản phẩm & Dịch vụ bán lẻ POS chạy nhất
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
  const [selectedPeriod, setSelectedPeriod] = useState("30days");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentPeriodObj = datePeriods.find((p) => p.id === selectedPeriod) || datePeriods[2];
  const currentStats = periodStatsMap[selectedPeriod] || periodStatsMap["30days"];

  // Logic Xuất Excel thực tế (Tải file CSV tiếng Việt chuẩn UTF-8 BOM)
  const handleExportExcel = () => {
    let csvContent = "\uFEFF"; // Byte Order Mark for UTF-8 Excel support
    const dateStamp = new Date().toISOString().slice(0, 10);
    const fileName = `Bao_Cao_DemoPick_${activeTab}_${dateStamp}.csv`;

    if (activeTab === "overview") {
      csvContent += "BÁO CÁO TỔNG QUAN DOANH THU DEMOPICK PICKLEBALL\n";
      csvContent += `Thời gian: ${currentPeriodObj.label}\n`;
      csvContent += `Tổng doanh thu,${currentStats.revenue}\n`;
      csvContent += `Tổng giờ đặt sân,${currentStats.hours}\n`;
      csvContent += `Doanh thu bán lẻ POS,${currentStats.posRevenue}\n`;
      csvContent += `Tỷ lệ lấp đầy bình quân,${currentStats.avgOccupancy}\n\n`;

      csvContent += "DOANH THU THEO TỪNG SÂN\n";
      csvContent += "Tên Sân,Tỷ Lệ Đóng Góp,Doanh Thu\n";
      courtRevenue.forEach((c) => {
        csvContent += `"${c.name}",${c.value}%,"${c.amount}"\n`;
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

    // Create Download Blob
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

  // Logic Làm mới dữ liệu
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Đã đồng bộ và làm mới dữ liệu báo cáo mới nhất!");
    }, 600);
  };

  return (
    <AppLayout
      title="Báo Cáo Phân Tích & Hiệu Suất Sân"
      headerRight={
        <div className="flex items-center gap-2">
          {/* Nút Xuất Excel Hoạt Động Thật */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="gap-2 bg-white border-slate-300 hover:bg-slate-50 font-medium text-xs rounded-xl h-9 shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </Button>

          {/* Menu Chọn Thời Gian Hoạt Động Thật */}
          <DropdownMenu>
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
            className="w-9 h-9 p-0 bg-white border-slate-300 hover:bg-slate-50 rounded-xl"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
          </Button>
        </div>
      }
    >
      <div className="space-y-6 font-sans">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${activeTab === t.id
                ? "bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-600/20"
                : "text-slate-600 hover:bg-slate-200/60"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            TAB 1: TỔNG QUAN DOANH THU & SÂN
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5 border-slate-200 bg-white shadow-sm rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] text-slate-500 font-medium uppercase">Tổng Doanh Thu</p>
                  <Badge variant="outline" className="text-[11px] font-medium text-emerald-600 border-emerald-200 bg-emerald-50">
                    +18.2% <ArrowUpRight className="w-3 h-3 ml-0.5 inline" />
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{currentStats.revenue}</p>
                <p className="text-[11px] text-slate-400 mt-1 font-normal">Kỳ: {currentPeriodObj.label}</p>
              </Card>

              <Card className="p-5 border-slate-200 bg-white shadow-sm rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] text-slate-500 font-medium uppercase">Tổng Giờ Đặt Sân</p>
                  <Badge variant="outline" className="text-[11px] font-medium text-blue-600 border-blue-200 bg-blue-50">
                    +12.5% <ArrowUpRight className="w-3 h-3 ml-0.5 inline" />
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-1">{currentStats.hours}</p>
                <p className="text-[11px] text-slate-400 mt-1 font-normal">Tất cả 5 cụm sân</p>
              </Card>

              <Card className="p-5 border-slate-200 bg-white shadow-sm rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] text-slate-500 font-medium uppercase">Doanh Thu Bán Lẻ POS</p>
                  <Badge variant="outline" className="text-[11px] font-medium text-amber-600 border-amber-200 bg-amber-50">
                    +24.0% <ArrowUpRight className="w-3 h-3 ml-0.5 inline" />
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-amber-600 mt-1">{currentStats.posRevenue}</p>
                <p className="text-[11px] text-slate-400 mt-1 font-normal">Vợt, bóng, nước uống & phụ kiện</p>
              </Card>

              <Card className="p-5 border-slate-200 bg-white shadow-sm rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] text-slate-500 font-medium uppercase">Tỷ Lệ Lấp Đầy Bình Quân</p>
                  <Badge variant="outline" className="text-[11px] font-medium text-purple-600 border-purple-200 bg-purple-50">
                    Cao Điểm
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-purple-600 mt-1">{currentStats.avgOccupancy}</p>
                <p className="text-[11px] text-slate-400 mt-1 font-normal">Hiệu suất hoạt động sân</p>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-8 p-6 border-slate-200 bg-white shadow-sm space-y-4 rounded-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      <span>Biểu Đồ Doanh Thu Theo Tuần</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">So sánh doanh thu thực tế tuần này với tuần trước</p>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-normal">Đơn vị: VNĐ</Badge>
                </div>

                <div className="h-[280px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData30Days}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#64748b" tickFormatter={(v) => `${v / 1000000}M`} />
                      <Tooltip formatter={(value: any) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)} />
                      <Area type="monotone" dataKey="current" name="Tuần này" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                      <Area type="monotone" dataKey="previous" name="Tuần trước" stroke="#cbd5e1" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="lg:col-span-4 p-6 border-slate-200 bg-white shadow-sm flex flex-col justify-between rounded-3xl">
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-900 text-base">Tỷ Lệ Doanh Thu Theo Sân</h3>
                  <p className="text-xs text-slate-500">Mức đóng góp doanh thu của từng sân</p>
                </div>

                <div className="h-[190px] w-full flex items-center justify-center my-1 relative">
                  {/* Center Text inside Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[10px] font-medium text-slate-400">5 Cụm Sân</span>
                    <strong className="text-sm font-bold text-slate-900">100%</strong>
                    <span className="text-[10px] text-emerald-600 font-medium">{currentStats.revenue.split(".000đ")[0]} Tr</span>
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        formatter={(value: any, name: any, item: any) => [
                          `${value}% (${item.payload.amount})`,
                          item.payload.name,
                        ]}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          fontSize: "12px",
                        }}
                      />
                      <Pie
                        data={courtRevenue}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={78}
                        dataKey="value"
                        stroke="#ffffff"
                        strokeWidth={2.5}
                        isAnimationActive={true}
                      >
                        {courtRevenue.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  {courtRevenue.map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                        <span className="text-[11px] font-medium">{c.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900 text-[11px]">{c.value}% ({c.amount})</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 2: KHUNG GIỜ VÀNG & HIỆU SUẤT SÂN (NEW POWERFUL TABLE)
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
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-[11px] border-b border-slate-200">
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
                      <tr key={slot.timeSlot} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            {slot.isHot ? (
                              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span>{slot.timeSlot}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center font-semibold text-slate-900">
                          {slot.bookedSlots} ca
                        </td>

                        <td className="py-3.5 px-4 text-center text-slate-500">
                          {slot.totalSlots} ca
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-semibold text-slate-900">{slot.rate}%</span>
                              <span className="text-slate-400">{slot.bookedSlots}/{slot.totalSlots}</span>
                            </div>
                            <Progress value={slot.rate} className="h-2 bg-slate-100" />
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-semibold text-emerald-700 text-sm">
                          {new Intl.NumberFormat("vi-VN").format(slot.revenue)} đ
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {slot.rate >= 95 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              🔥 Kín Sân (100%)
                            </span>
                          ) : slot.rate >= 75 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Hiệu Suất Tốt
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
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
            TAB 3: TOP KHÁCH HÀNG & BÁN LẺ POS (NEW POWERFUL TABLE)
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "top_performers" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* CỘT TRÁI (6 COLS): TOP KHÁCH HÀNG THÂN THIẾT */}
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
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-medium text-[11px] uppercase border-b border-slate-200">
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
                      <tr key={c.phone} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center font-bold">
                          {c.rank === 1 ? "🥇" : c.rank === 2 ? "🥈" : c.rank === 3 ? "🥉" : `#${c.rank}`}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-900">{c.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{c.phone}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-900">
                          {c.totalBookings} lượt
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-emerald-700">
                          {new Intl.NumberFormat("vi-VN").format(c.totalSpent)} đ
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-600">
                          {c.favCourt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* CỘT PHẢI (6 COLS): TOP SẢN PHẨM & DỊCH VỤ BÁN CHẠY */}
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
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-medium text-[11px] uppercase border-b border-slate-200">
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
                      <tr key={r.name} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center font-bold">
                          {r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : r.rank === 3 ? "🥉" : `#${r.rank}`}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-900 truncate max-w-[180px]" title={r.name}>{r.name}</div>
                          <div className="text-[10px] text-slate-400">{r.category}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-900">
                          {r.soldQty}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-emerald-700">
                          {new Intl.NumberFormat("vi-VN").format(r.revenue)} đ
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant="outline" className="text-[10px] font-normal text-emerald-700 bg-emerald-50 border-emerald-200">
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
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-[11px] border-b border-slate-200">
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
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900">{b.id}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">{b.customer}</td>
                      <td className="py-3.5 px-4 text-slate-700">{b.court}</td>
                      <td className="py-3.5 px-4 text-slate-600">{b.slot}</td>
                      <td className="py-3.5 px-4 text-slate-600">{b.method}</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700 text-right">{b.price}</td>
                      <td className="py-3.5 px-4 text-center">
                        {b.status === "COMPLETED" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Đã thi đấu
                          </span>
                        ) : b.status === "CONFIRMED" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            Đã xác nhận
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
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
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-[11px] border-b border-slate-200">
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
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400">#{log.id}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{log.user}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{log.action}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{log.ip}</td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-400 text-right">{log.time}</td>
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
