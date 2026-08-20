import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { adminService, TimeSlot } from "@/services/admin.service";
import { format, addDays, isSameDay, nextSaturday, nextSunday } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarIcon,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize2,
  PlayCircle,
  History,
  ShoppingCart,
  PlusCircle,
  ArrowRight,
  CreditCard,
  Building,
  Sun,
  Crown,
  Layers,
  Activity,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function CourtMap() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [selectedCluster, setSelectedCluster] = useState<"all" | "indoor" | "outdoor" | "vip">("all");
  const [policyOpen, setPolicyOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  // Selected slot modal for staff quick action
  const [slotClickData, setSlotClickData] = useState<{ courtName: string; time: string; status: string; price: number } | null>(null);

  // Pickleball Exclusive Courts
  const allPickleballCourts = [
    { id: 1, name: "Sân Pickleball A1", cluster: "indoor", type: "Pickleball Standard Indoor", hourly_rate: 140000, peak_hourly_rate: 180000 },
    { id: 2, name: "Sân Pickleball A2", cluster: "indoor", type: "Pickleball Standard Indoor", hourly_rate: 140000, peak_hourly_rate: 180000 },
    { id: 3, name: "Sân Pickleball B1", cluster: "outdoor", type: "Pickleball Standard Outdoor", hourly_rate: 140000, peak_hourly_rate: 180000 },
    { id: 4, name: "Sân Pickleball B2", cluster: "outdoor", type: "Pickleball Standard Outdoor", hourly_rate: 140000, peak_hourly_rate: 180000 },
    { id: 5, name: "Sân Pickleball VIP C1", cluster: "vip", type: "Pickleball Premium VIP", hourly_rate: 180000, peak_hourly_rate: 220000 },
    { id: 6, name: "Sân Pickleball VIP C2", cluster: "vip", type: "Pickleball Premium VIP", hourly_rate: 180000, peak_hourly_rate: 220000 },
  ];

  const pickleballCourts = allPickleballCourts.filter(
    (c) => selectedCluster === "all" || c.cluster === selectedCluster
  );

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["admin-slots", dateStr],
    queryFn: () => adminService.getSlots(dateStr),
  });

  const timeHeaders = [
    "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
  ];

  const getSlotDetailedStatus = (courtId: number, timeStr: string) => {
    const hour = parseInt(timeStr.split(":")[0]);
    if (hour < 7) return "expired";
    if (hour === 8 && courtId === 1) return "in_use";
    if (hour === 9 && courtId === 2) return "held";
    if ((hour === 10 || hour === 18) && (courtId === 1 || courtId === 5)) return "booked";
    return "available";
  };

  const handleSimulateConflict = () => {
    toast.error("⚠️ CẢNH BÁO XUNG ĐỘT TRÙNG LỊCH: Khung giờ 17:00 - Sân Pickleball A1 vừa được giữ bởi Khách A. Lệnh giữ chỗ trùng lặp bị khóa Pessimistic Lock ngăn chặn!", {
      duration: 5000,
    });
  };

  const handleSlotClick = (courtName: string, time: string, status: string, price: number) => {
    if (status === "expired") {
      toast.info("Khung giờ này đã quá thời gian thi đấu.");
      return;
    }
    setSlotClickData({ courtName, time, status, price });
  };

  const handleAttemptHoldSlot = () => {
    if (!slotClickData) return;

    if (slotClickData.status === "in_use" || slotClickData.status === "booked" || slotClickData.status === "held") {
      toast.error(`⚠️ KHÔNG THỂ GIỮ SÂN: Khung giờ ${slotClickData.time} tại ${slotClickData.courtName} hiện ${slotClickData.status === "in_use" ? "ĐANG CÓ KHÁCH CHƠI" : "ĐÃ ĐẶT TRƯỚC"}. Vui lòng chọn khung giờ trống khác!`, {
        duration: 5000,
      });
      return;
    }

    toast.success(`✅ Đã khóa giữ chỗ thành công cho Khách tại ${slotClickData.courtName} (Khung giờ ${slotClickData.time})!`);
    setSlotClickData(null);
  };

  const handleGoToPosPayment = () => {
    if (!slotClickData) return;
    const params = new URLSearchParams({
      courtName: slotClickData.courtName,
      price: slotClickData.price.toString(),
      time: slotClickData.time,
    });
    setSlotClickData(null);
    navigate(`/pos?${params.toString()}`);
  };

  // Quick date jump helpers
  const handleSelectQuickDate = (type: "today" | "tomorrow" | "sat" | "sun") => {
    const now = new Date();
    if (type === "today") setSelectedDate(now);
    else if (type === "tomorrow") setSelectedDate(addDays(now, 1));
    else if (type === "sat") setSelectedDate(nextSaturday(now));
    else if (type === "sun") setSelectedDate(nextSunday(now));
  };

  // Smooth cell sizing calculations
  const colWidthPx = Math.round(90 * (zoomLevel / 100));
  const slotFontSizePx = (11.5 * (zoomLevel / 100)).toFixed(1);
  const slotPaddingPx = Math.max(4, Math.round(8 * (zoomLevel / 100)));

  // Calculate daily stats for visible courts
  const totalSlotsCount = pickleballCourts.length * timeHeaders.length;
  let bookedSlotsCount = 0;
  let inUseSlotsCount = 0;
  let heldSlotsCount = 0;
  let availableSlotsCount = 0;

  pickleballCourts.forEach((court) => {
    timeHeaders.forEach((t) => {
      const st = getSlotDetailedStatus(court.id, t);
      if (st === "booked") bookedSlotsCount++;
      else if (st === "in_use") inUseSlotsCount++;
      else if (st === "held") heldSlotsCount++;
      else if (st === "available") availableSlotsCount++;
    });
  });

  const occupiedSlotsCount = bookedSlotsCount + inUseSlotsCount + heldSlotsCount;
  const occupancyRate = Math.round((occupiedSlotsCount / totalSlotsCount) * 100);

  return (
    <AppLayout
      title="Sơ Đồ Sân & Lịch Trình Đặt Khung Giờ Pickleball"
      subtitle="Quản lý trực quan toàn bộ lịch thi đấu, tỷ lệ lấp đầy sân và đối soát ca giờ thời gian thực"
      headerRight={
        <div className="flex items-center gap-2">
          <Button onClick={() => setPolicyOpen(true)} variant="outline" size="sm" className="bg-white border-slate-300 gap-1.5 text-xs font-semibold rounded-xl">
            <Info className="h-3.5 w-3.5 text-emerald-600" />
            <span>Chính sách Hủy & Hoàn tiền</span>
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white border-slate-300 font-semibold gap-2 rounded-xl text-xs">
                <CalendarIcon className="h-4 w-4 text-emerald-600" />
                <span>{format(selectedDate, "EEEE, dd/MM/yyyy", { locale: vi })}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) || date > addDays(new Date(), 30)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      }
    >
      <div className="space-y-6 font-sans">
        {/* 🟢 BỘ LỌC NHANH NGÀY & CỤM SÂN (GỢI Ý 3 NÂNG CẤP) */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Quick Date Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">Chọn ngày nhanh:</span>
              <button
                type="button"
                onClick={() => handleSelectQuickDate("today")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isSameDay(selectedDate, new Date())
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-[#FAF8F5] text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                Hôm Nay ({format(new Date(), "dd/MM")})
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickDate("tomorrow")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isSameDay(selectedDate, addDays(new Date(), 1))
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-[#FAF8F5] text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                Ngày Mai ({format(addDays(new Date(), 1), "dd/MM")})
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickDate("sat")}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#FAF8F5] text-slate-700 hover:bg-slate-100 border border-slate-200/80 shrink-0"
              >
                Thứ 7 Tuần Này
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickDate("sun")}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#FAF8F5] text-slate-700 hover:bg-slate-100 border border-slate-200/80 shrink-0"
              >
                Chủ Nhật
              </button>
            </div>

            {/* Quick Cluster Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-t sm:border-t-0 pt-2 sm:pt-0">
              <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">Cụm sân:</span>
              <button
                type="button"
                onClick={() => setSelectedCluster("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1 ${
                  selectedCluster === "all"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tất cả (6 Sân)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCluster("indoor")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1 ${
                  selectedCluster === "indoor"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Trong Nhà (A1, A2)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCluster("outdoor")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1 ${
                  selectedCluster === "outdoor"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Ngoài Trời (B1, B2)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCluster("vip")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1 ${
                  selectedCluster === "vip"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Sân VIP (C1, C2)</span>
              </button>
            </div>
          </div>

          {/* DAILY OCCUPANCY METRICS STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
            <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-medium block">Tổng Ca Sân Trong Ngày:</span>
              <strong className="text-base text-slate-900">{totalSlotsCount} Khung Giờ</strong>
            </div>

            <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/70">
              <span className="text-[11px] text-emerald-700 font-medium block">Đã Đặt & Đang Chơi:</span>
              <strong className="text-base text-emerald-800">{occupiedSlotsCount} Ca Sân</strong>
            </div>

            <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200/70">
              <span className="text-[11px] text-blue-700 font-medium block">Còn Trống Sẵn Sàng:</span>
              <strong className="text-base text-blue-800">{availableSlotsCount} Khung Giờ</strong>
            </div>

            <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-300 font-medium block">Tỷ Lệ Lấp Đầy:</span>
                <strong className="text-base text-emerald-400 font-extrabold">{occupancyRate}%</strong>
              </div>
              <Activity className="w-6 h-6 text-emerald-400 opacity-80" />
            </div>
          </div>
        </div>

        {/* Navigation & Controls Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            {[
              { id: "day", label: "Theo Ngày" },
              { id: "week", label: "Theo Tuần (7 Ngày)" },
              { id: "month", label: "Theo Tháng" },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === v.id ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 font-medium"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Interactive Zoom Control Bar */}
          <div className="flex items-center gap-2 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-inner">
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.max(60, prev - 10))}
              disabled={zoomLevel <= 60}
              className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Thu nhỏ (-10%)"
            >
              <ZoomOut className="h-4 w-4 text-slate-700" />
            </button>

            <input
              type="range"
              min={60}
              max={160}
              step={5}
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-28 accent-[#27c372] cursor-pointer touch-none"
              title={`Tỷ lệ thu phóng hiện tại: ${zoomLevel}%`}
            />

            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.min(160, prev + 10))}
              disabled={zoomLevel >= 160}
              className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Phóng to (+10%)"
            >
              <ZoomIn className="h-4 w-4 text-slate-700" />
            </button>

            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="font-mono font-bold text-slate-800 hover:text-[#27c372] bg-white border border-slate-200 px-2 py-0.5 rounded-lg hover:border-[#27c372] active:scale-95 transition-all cursor-pointer text-xs ml-1 shadow-sm"
              title="Nhấn để đặt lại tỉ lệ chuẩn 100%"
            >
              {zoomLevel}%
            </button>
          </div>

          {/* Status Legends */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span>Trống (Sẵn sàng)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              <span>Tạm giữ (10p)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-800" />
              <span>Đã đặt trước</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-blue-600" />
              <span>Đang chơi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-slate-300" />
              <span className="text-slate-500">Đã quá giờ</span>
            </div>
          </div>
        </div>

        {/* View Mode Content Switcher */}
        {viewMode === "day" && (
          <div className="relative overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3.5 px-4 min-w-[210px] w-[210px] sticky left-0 bg-slate-100 border-r border-slate-300 z-20 shadow-md">
                    Tên Sân Pickleball / Giờ
                  </th>
                  {timeHeaders.map((time) => (
                    <th
                      key={time}
                      style={{ minWidth: `${colWidthPx}px`, transition: "min-width 0.2s ease-out" }}
                      className="py-3.5 px-2 text-center border-r border-slate-200 font-extrabold"
                    >
                      {time}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {pickleballCourts.map((court) => (
                  <tr key={court.id} className="hover:bg-slate-50/60">
                    <td className="py-4 px-4 font-bold text-slate-900 sticky left-0 bg-white border-r border-slate-200 z-20 shadow-md min-w-[210px] w-[210px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-sm font-bold text-slate-900 truncate">{court.name}</span>
                      </div>
                      <div className="text-xs text-slate-500 font-normal pl-4 truncate">{court.type}</div>
                    </td>

                    {timeHeaders.map((time) => {
                      const status = getSlotDetailedStatus(court.id, time);
                      const isPeak = parseInt(time.split(":")[0]) >= 17;
                      const price = isPeak ? court.peak_hourly_rate : court.hourly_rate;
                      const formattedPrice = new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(price);

                      return (
                        <td
                          key={time}
                          style={{ minWidth: `${colWidthPx}px`, transition: "min-width 0.2s ease-out" }}
                          className="p-1.5 border-r border-slate-100 cursor-pointer"
                          onClick={() => handleSlotClick(court.name, time, status, price)}
                        >
                          <div
                            style={{
                              paddingTop: `${slotPaddingPx}px`,
                              paddingBottom: `${slotPaddingPx}px`,
                              fontSize: `${slotFontSizePx}px`,
                              transition: "all 0.2s ease-out",
                            }}
                            className={`w-full px-1 rounded-xl font-bold flex flex-col items-center justify-center transition-transform active:scale-95 ${
                              status === "expired"
                                ? "bg-slate-100 text-slate-400 line-through border border-slate-200"
                                : status === "in_use"
                                  ? "bg-blue-600 text-white shadow-md animate-pulse border border-blue-700"
                                  : status === "held"
                                    ? "bg-amber-500 text-white shadow-sm"
                                    : status === "booked"
                                      ? "bg-emerald-700 text-white shadow-sm"
                                      : isPeak
                                        ? "bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100"
                                        : "bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100"
                            }`}
                          >
                            {status === "expired" ? (
                              <div className="flex items-center gap-1 opacity-70">
                                <History className="h-3 w-3" />
                                <span>Quá giờ</span>
                              </div>
                            ) : status === "in_use" ? (
                              <div className="flex items-center gap-1">
                                <PlayCircle className="h-3.5 w-3.5" />
                                <span>Đang chơi</span>
                              </div>
                            ) : status === "held" ? (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Tạm giữ</span>
                              </div>
                            ) : status === "booked" ? (
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Đã đặt</span>
                              </div>
                            ) : (
                              <>
                                <span>{formattedPrice}đ</span>
                                {isPeak && <span className="text-[9px] text-amber-600 font-normal">Cao điểm</span>}
                              </>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Tương Tác Nhanh Cho Lễ Tân Khi Bấm Khung Giờ Sân */}
        <Dialog open={!!slotClickData} onOpenChange={() => setSlotClickData(null)}>
          <DialogContent className="max-w-md bg-white rounded-3xl p-6 font-sans">
            {slotClickData && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-emerald-600" />
                    {slotClickData.courtName} - Khung {slotClickData.time}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Tùy chọn thanh toán tiền sân, bán nước uống, đồ ăn hoặc đặt sân tại quầy Lễ tân
                  </DialogDescription>
                </DialogHeader>

                <div className="p-3.5 bg-[#FAF8F5] rounded-2xl space-y-2 text-xs border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Trạng thái khung giờ:</span>
                    <Badge className={slotClickData.status === "in_use" ? "bg-blue-600 font-bold" : slotClickData.status === "booked" ? "bg-emerald-700 font-bold" : "bg-emerald-500 font-bold"}>
                      {slotClickData.status === "in_use" ? "Đang chơi" : slotClickData.status === "booked" ? "Đã đặt trước" : "Sẵn sàng (Trống)"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Giá giờ sân:</span>
                    <strong className="text-emerald-700 text-sm">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(slotClickData.price)} / giờ
                    </strong>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <Button
                    onClick={handleGoToPosPayment}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 rounded-xl text-xs gap-2 shadow-md shadow-emerald-500/20"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Nạp Sân Này Vào Hóa Đơn POS & Thu Tiền</span>
                  </Button>

                  <Button
                    onClick={handleAttemptHoldSlot}
                    variant="outline"
                    className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold h-10 rounded-xl text-xs gap-2"
                  >
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>Khóa Giữ Chỗ Tạm Thời (10 Phút)</span>
                  </Button>

                  <Button
                    onClick={handleSimulateConflict}
                    variant="ghost"
                    className="w-full text-rose-600 hover:bg-rose-50 font-normal text-xs gap-1.5 h-9"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Thử nghiệm xung đột đặt trùng lịch (Pessimistic Lock)</span>
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog Chính sách Hủy Sân & Hoàn Tiền */}
        <Dialog open={policyOpen} onOpenChange={setPolicyOpen}>
          <DialogContent className="max-w-lg bg-white rounded-3xl p-6 font-sans">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-600" />
                Chính Sách Hủy Sân & Hoàn Tiền Tự Động
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Quy định đảm bảo quyền lợi vận động viên và năng lực vận hành cụm sân DemoPick
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs text-slate-600 pt-2 leading-relaxed">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 space-y-1">
                <strong className="text-emerald-900 font-bold block">1. Hủy trước 24 giờ thi đấu:</strong>
                <p>Hoàn tiền 100% về tài khoản hoặc quy đổi thành Voucher đặt sân cho lần tiếp theo.</p>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-1">
                <strong className="text-amber-900 font-bold block">2. Hủy từ 12 - 24 giờ trước giờ thi đấu:</strong>
                <p>Hoàn tiền 50% giá trị đặt sân hoặc hỗ trợ dời lịch sang khung giờ khác nếu còn sân trống.</p>
              </div>

              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200/80 space-y-1">
                <strong className="text-rose-900 font-bold block">3. Hủy dưới 12 giờ hoặc vắng mặt (No-show):</strong>
                <p>Không áp dụng hoàn tiền để đảm bảo quyền lợi giữ sân của hệ thống.</p>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button onClick={() => setPolicyOpen(false)} className="w-full bg-slate-900 text-white rounded-xl text-xs">
                Đã hiểu quy định
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
