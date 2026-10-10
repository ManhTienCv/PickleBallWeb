import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { adminService, TimeSlot, DEFAULT_ADMIN_COURTS } from "@/services/admin.service";
import { format, addDays, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarIcon,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Info,
  ZoomIn,
  ZoomOut,
  PlayCircle,
  History,
  CreditCard,
  Building,
  Sun,
  Crown,
  Layers,
  Activity,
  Sparkles,
  Wrench,
  Trophy,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import {
  CourtHoldItem,
  SelectedSlotItem,
  getCourtHolds,
  cleanExpiredHolds,
} from "@/components/court-map/courtHoldTypes";
import HoldSlotDialog from "@/components/court-map/HoldSlotDialog";
import HeldSlotDetailDialog from "@/components/court-map/HeldSlotDetailDialog";
import MultiSlotToolbar from "@/components/court-map/MultiSlotToolbar";

export default function CourtMap() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [selectedCluster, setSelectedCluster] = useState<"all" | "indoor" | "outdoor" | "vip" | "d">("all");
  const [policyOpen, setPolicyOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  // Multi-select & Court Hold Management State
  const [courtHolds, setCourtHolds] = useState<CourtHoldItem[]>(() => getCourtHolds());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlotItem[]>([]);
  const [holdDialogOpen, setHoldDialogOpen] = useState<boolean>(false);
  const [slotsForHoldModal, setSlotsForHoldModal] = useState<SelectedSlotItem[]>([]);
  const [heldSlotDetail, setHeldSlotDetail] = useState<CourtHoldItem | null>(null);

  // Auto clean-up timer: check and purge expired holds every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const { active, expired } = cleanExpiredHolds();
      if (expired.length > 0) {
        setCourtHolds(active);
        expired.forEach((exp) => {
          toast.info(
            `⏳ Ca giữ sân ${exp.courtName} (${exp.time}) của khách "${exp.customerName}" đã hết hạn ${exp.durationMinutes} phút và được tự động giải phóng!`,
            { duration: 5000 }
          );
        });
      }
    }, 3000);

    const handleHoldsUpdate = (e: any) => {
      if (e?.detail) {
        setCourtHolds(e.detail);
      } else {
        setCourtHolds(getCourtHolds());
      }
    };

    window.addEventListener("court_holds_updated", handleHoldsUpdate);
    return () => {
      clearInterval(timer);
      window.removeEventListener("court_holds_updated", handleHoldsUpdate);
    };
  }, []);

  // Fetch real courts from database
  const { data: dbCourts = [] } = useQuery({
    queryKey: ["admin-courts"],
    queryFn: adminService.getCourts,
  });

  const allPickleballCourts = useMemo(() => {
    const rawList = dbCourts && dbCourts.length > 0 ? dbCourts : DEFAULT_ADMIN_COURTS;
    return rawList.map((c: any) => {
      let cluster: "indoor" | "outdoor" | "vip" | "d" = "indoor";
      if (c.name?.includes("3") || c.name?.includes("4") || c.name?.includes("B")) {
        cluster = "outdoor";
      } else if (c.name?.includes("5") || c.name?.includes("6") || c.name?.includes("C") || c.name?.includes("VIP")) {
        cluster = "vip";
      } else if (c.name?.includes("7") || c.name?.includes("8") || c.name?.includes("D") || c.code?.includes("D")) {
        cluster = "d";
      }
      return {
        id: c.id,
        name: c.name,
        cluster,
        type:
          c.type ||
          (cluster === "vip"
            ? "Tiêu Chuẩn Pro VIP"
            : cluster === "outdoor"
            ? "Pickleball Ngoài Trời"
            : cluster === "d"
            ? "Tiêu Chuẩn Pro"
            : "Pickleball Trong Nhà"),
        hourly_rate: Number(c.hourly_rate) || 140000,
        peak_hourly_rate: Number(c.peak_hourly_rate) || 180000,
      };
    });
  }, [dbCourts]);

  const pickleballCourts = allPickleballCourts.filter(
    (c) => selectedCluster === "all" || c.cluster === selectedCluster
  );

  const { data: slots = [] } = useQuery({
    queryKey: ["admin-slots", dateStr],
    queryFn: () => adminService.getSlots(dateStr),
  });

  const timeHeaders = [
    "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00",
  ];

  // Real-time calculation helper to check if a slot is past relative to actual local time
  const isSlotExpired = (timeStr: string, date?: Date) => {
    if (!date) return false;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (targetDate < today) return true;
    if (targetDate > today) return false;

    const slotHour = parseInt(timeStr.split(":")[0], 10);
    const currentHour = now.getHours();
    return slotHour <= currentHour;
  };

  const getSlotDetailedStatus = (courtId: number, timeStr: string) => {
    // 1. Check local held/locked slots first (Immediate Zero-Latency)
    const localHold = courtHolds.find(
      (h) => h.courtId === courtId && h.time === timeStr && h.date === dateStr
    );
    if (localHold) {
      if (localHold.holdType === "maintenance") return "maintenance";
      if (localHold.holdType === "event") return "event";
      return "held";
    }

    // 2. Check real API slots if returned from backend
    if (slots && slots.length > 0) {
      const match = slots.find(
        (s: any) =>
          (s.court_id === courtId || s.courtId === courtId) &&
          (s.start_time || s.startTime)?.startsWith(timeStr.split(":")[0])
      );
      if (match) {
        if (match.status === "in_use") return "in_use";
        if (match.status === "booked") return "booked";
        if (match.status === "held") return "held";
        if (match.status === "locked") return "locked";
      }
    }

    // 3. Real-time expiration based on selected date
    if (isSlotExpired(timeStr, selectedDate)) {
      return "expired";
    }

    return "available";
  };

  const handleSimulateConflict = () => {
    toast.error(
      "⚠️ CẢNH BÁO XUNG ĐỘT TRÙNG LỊCH: Khung giờ vừa chọn đang được giữ bởi người khác. Lệnh giữ chỗ trùng lặp bị khóa Pessimistic Lock ngăn chặn!",
      { duration: 5000 }
    );
  };

  const handleSlotClick = (courtId: number, courtName: string, time: string, status: string, price: number) => {
    if (status === "expired") {
      toast.info("Khung giờ này đã quá thời gian thi đấu.");
      return;
    }

    // Check if slot has an active local hold
    const existingHold = courtHolds.find(
      (h) => h.courtId === courtId && h.time === time && h.date === dateStr
    );
    if (existingHold) {
      setHeldSlotDetail(existingHold);
      return;
    }

    if (status === "in_use") {
      toast.info(`Sân ${courtName} (Khung ${time}) hiện đang có khách thi đấu.`);
      return;
    }

    if (status === "booked") {
      toast.info(`Khung giờ ${time} tại ${courtName} đã được khách đặt trước.`);
      return;
    }

    // In Multi-select mode: toggle slot
    if (isMultiSelectMode) {
      const exists = selectedSlots.some((s) => s.courtId === courtId && s.time === time);
      if (exists) {
        setSelectedSlots((prev) => prev.filter((s) => !(s.courtId === courtId && s.time === time)));
      } else {
        setSelectedSlots((prev) => [...prev, { courtId, courtName, time, price, date: dateStr }]);
      }
      return;
    }

    // Single-click mode: Open Hold & Book Dialog
    setSlotsForHoldModal([{ courtId, courtName, time, price, date: dateStr }]);
    setHoldDialogOpen(true);
  };

  const handleGoToPosFromSlot = (slot: SelectedSlotItem, customerName?: string, customerPhone?: string) => {
    const params = new URLSearchParams({
      courtName: slot.courtName,
      price: slot.price.toString(),
      time: slot.time,
    });
    if (customerName) params.set("customerName", customerName);
    if (customerPhone) params.set("customerPhone", customerPhone);
    navigate(`/pos?${params.toString()}`);
  };

  const handleBatchGoToPos = () => {
    if (selectedSlots.length === 0) return;
    const first = selectedSlots[0];
    const totalAmount = selectedSlots.reduce((sum, s) => sum + s.price, 0);
    const timesSummary = selectedSlots.map((s) => `${s.courtName} (${s.time})`).join(", ");
    const params = new URLSearchParams({
      courtName: `${selectedSlots.length} Khung Sân [${timesSummary}]`,
      price: totalAmount.toString(),
      time: first.time,
    });
    setSelectedSlots([]);
    navigate(`/pos?${params.toString()}`);
  };

  // Generate 7 consecutive upcoming days starting from Today (No duplicate dates)
  const quickDaysList = Array.from({ length: 7 }, (_, idx) => {
    const d = addDays(new Date(), idx);
    let label = "";
    if (idx === 0) {
      label = `Hôm Nay (${format(d, "dd/MM")})`;
    } else if (idx === 1) {
      label = `Ngày Mai (${format(d, "dd/MM")})`;
    } else {
      const dayName = format(d, "EEEE", { locale: vi });
      const capitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      label = `${capitalized} (${format(d, "dd/MM")})`;
    }
    return { date: d, label };
  });

  // Smooth cell sizing calculations
  const colWidthPx = Math.round(92 * (zoomLevel / 100));
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
      else if (st === "held" || st === "maintenance" || st === "event") heldSlotsCount++;
      else if (st === "available") availableSlotsCount++;
    });
  });

  const occupiedSlotsCount = bookedSlotsCount + inUseSlotsCount + heldSlotsCount;
  const occupancyRate = Math.round((occupiedSlotsCount / totalSlotsCount) * 100);

  return (
    <AppLayout
      title="Sơ Đồ Sân & Lịch Trình Đặt Khung Giờ Pickleball"
      headerRight={
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setPolicyOpen(true)}
            variant="outline"
            size="sm"
            className="bg-white border-slate-300 gap-1.5 text-xs font-semibold rounded-xl cursor-pointer"
          >
            <Info className="h-3.5 w-3.5 text-emerald-600" />
            <span>Chính sách Hủy & Hoàn tiền</span>
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white border-slate-300 font-semibold gap-2 rounded-xl text-xs cursor-pointer"
              >
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
        {/* 🟢 BỘ LỌC NHANH NGÀY & CỤM SÂN */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Quick Date Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
              <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">Chọn ngày nhanh:</span>
              {quickDaysList.map((item, idx) => {
                const isSelected = isSameDay(selectedDate, item.date);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(item.date)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors duration-150 shrink-0 cursor-pointer border ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-[#FAF8F5] text-slate-700 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Cluster Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-t sm:border-t-0 pt-2 sm:pt-0">
              <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">Cụm sân:</span>
              <button
                type="button"
                onClick={() => setSelectedCluster("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-150 shrink-0 flex items-center gap-1 border cursor-pointer ${
                  selectedCluster === "all"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tất cả ({allPickleballCourts.length} Sân)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCluster("indoor")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-150 shrink-0 flex items-center gap-1 border cursor-pointer ${
                  selectedCluster === "indoor"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Cụm Trong Nhà (Sân 1, 2)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCluster("outdoor")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-150 shrink-0 flex items-center gap-1 border cursor-pointer ${
                  selectedCluster === "outdoor"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Cụm Ngoài Trời (Sân 3, 4)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCluster("vip")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-150 shrink-0 flex items-center gap-1 border cursor-pointer ${
                  selectedCluster === "vip"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Cụm VIP Pro (Sân 5, 6)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCluster("d")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-150 shrink-0 flex items-center gap-1 border cursor-pointer ${
                  selectedCluster === "d"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cụm Mở Rộng D (Sân 7, 8)</span>
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

            <div className="p-3 bg-emerald-50/90 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-700 font-medium block">Tỷ Lệ Lấp Đầy:</span>
                <strong className="text-base text-emerald-900 font-extrabold">{occupancyRate}%</strong>
              </div>
              <Activity className="w-6 h-6 text-emerald-600 opacity-90" />
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors duration-150 border cursor-pointer ${
                  viewMode === v.id
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20"
                    : "text-slate-600 hover:bg-slate-100 border-transparent font-medium"
                }`}
              >
                {v.label}
              </button>
            ))}

            {/* Multi-Select Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setIsMultiSelectMode((prev) => !prev);
                setSelectedSlots([]);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                isMultiSelectMode
                  ? "bg-amber-500 text-white border-amber-500 shadow-sm ring-2 ring-amber-300"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
              }`}
              title="Nhấn để chọn và giữ nhiều ca sân cùng lúc"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isMultiSelectMode ? "Chế độ chọn nhiều (BẬT)" : "Chọn nhiều ca sân"}</span>
              {selectedSlots.length > 0 && (
                <span className="bg-white text-amber-900 rounded-full text-[10px] px-1.5 py-0.2 font-extrabold ml-0.5">
                  {selectedSlots.length}
                </span>
              )}
            </button>
          </div>

          {/* Interactive Zoom Control Bar */}
          <div className="flex items-center gap-2 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-inner">
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.max(60, prev - 10))}
              disabled={zoomLevel <= 60}
              className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
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
              className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Phóng to (+10%)"
            >
              <ZoomIn className="h-4 w-4 text-slate-700" />
            </button>

            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="font-mono font-bold text-slate-800 hover:text-[#27c372] bg-white border border-slate-200 px-2 py-0.5 rounded-lg hover:border-[#27c372] transition-colors cursor-pointer text-xs ml-1 shadow-sm"
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
              <span>Tạm giữ (10-30p)</span>
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
              <span className="h-3 w-3 rounded-full bg-rose-500" />
              <span>Bảo trì / Sự kiện</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-slate-400" />
              <span className="text-slate-700 font-bold">Đã quá giờ</span>
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
                {pickleballCourts.map((court) => {
                  const cName = court?.name || "Sân Pickleball";
                  const dotColor = cName.includes("A")
                    ? "bg-emerald-500"
                    : cName.includes("B")
                    ? "bg-blue-500"
                    : cName.includes("C")
                    ? "bg-amber-500"
                    : "bg-purple-500";

                  return (
                    <tr key={court.id} className="hover:bg-slate-50/60">
                      <td className="py-4 px-4 font-bold text-slate-900 sticky left-0 bg-white border-r border-slate-200 z-20 shadow-md min-w-[210px] w-[210px]">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />
                          <span className="text-sm font-bold text-slate-900 truncate">{cName}</span>
                        </div>
                      </td>

                      {timeHeaders.map((time) => {
                        const status = getSlotDetailedStatus(court.id, time);
                        const isPeak = parseInt(time.split(":")[0]) >= 17;
                        const price = isPeak ? court.peak_hourly_rate || 180000 : court.hourly_rate || 140000;
                        const formattedPrice = `${Math.round(price / 1000)}k VND`;

                        const isSelected = selectedSlots.some((s) => s.courtId === court.id && s.time === time);
                        const activeHold = courtHolds.find(
                          (h) => h.courtId === court.id && h.time === time && h.date === dateStr
                        );

                        return (
                          <td
                            key={time}
                            style={{ minWidth: `${colWidthPx}px`, transition: "min-width 0.2s ease-out" }}
                            className="p-1.5 border-r border-slate-100 cursor-pointer select-none"
                            onClick={() => handleSlotClick(court.id, cName, time, status, price)}
                          >
                            <div
                              style={{
                                paddingTop: `${slotPaddingPx}px`,
                                paddingBottom: `${slotPaddingPx}px`,
                                fontSize: `${slotFontSizePx}px`,
                              }}
                              className={`w-full px-1 rounded-xl font-bold flex items-center justify-center transition-all duration-150 border ${
                                isSelected
                                  ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400 border-emerald-600 scale-[1.02]"
                                  : status === "expired"
                                  ? "bg-slate-100/90 text-slate-700 border-slate-300"
                                  : status === "in_use"
                                  ? "bg-blue-600 text-white shadow-sm border-blue-600"
                                  : status === "held"
                                  ? "bg-amber-500 text-white shadow-sm border-amber-500 hover:bg-amber-600"
                                  : status === "maintenance"
                                  ? "bg-rose-500 text-white shadow-sm border-rose-500 hover:bg-rose-600"
                                  : status === "event"
                                  ? "bg-purple-600 text-white shadow-sm border-purple-600 hover:bg-purple-700"
                                  : status === "booked"
                                  ? "bg-emerald-700 text-white shadow-sm border-emerald-700"
                                  : isPeak
                                  ? "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:border-amber-400"
                                  : "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400"
                              }`}
                            >
                              {isSelected ? (
                                <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                                  <span>Đã chọn</span>
                                </div>
                              ) : status === "expired" ? (
                                <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                                  <History className="h-3 w-3 text-slate-600 shrink-0" />
                                  <span className="whitespace-nowrap font-bold text-slate-700 text-[11px]">Quá giờ</span>
                                </div>
                              ) : status === "in_use" ? (
                                <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                                  <PlayCircle className="h-3.5 w-3.5 shrink-0" />
                                  <span className="whitespace-nowrap">Đang chơi</span>
                                </div>
                              ) : status === "held" ? (
                                <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                                  <Clock className="h-3 w-3 shrink-0 animate-pulse" />
                                  <span className="whitespace-nowrap truncate max-w-[80px]">
                                    {activeHold ? `Giữ: ${activeHold.customerName.slice(0, 8)}` : "Tạm giữ"}
                                  </span>
                                </div>
                              ) : status === "maintenance" ? (
                                <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                                  <Wrench className="h-3 w-3 shrink-0" />
                                  <span className="whitespace-nowrap">Bảo trì</span>
                                </div>
                              ) : status === "event" ? (
                                <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                                  <Trophy className="h-3 w-3 shrink-0" />
                                  <span className="whitespace-nowrap">Sự kiện</span>
                                </div>
                              ) : status === "booked" ? (
                                <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                                  <span className="whitespace-nowrap">Đã đặt</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                                  <span>{formattedPrice}</span>
                                  {isPeak && <span className="text-[9px] text-amber-700 font-normal">Cao điểm</span>}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Dialog Khóa Giữ Sân (Đơn lẻ & Hàng loạt có đầy đủ Who, What, Duration) */}
        <HoldSlotDialog
          open={holdDialogOpen}
          onOpenChange={setHoldDialogOpen}
          slots={slotsForHoldModal}
          onSuccess={(updated) => {
            setCourtHolds(updated);
            setSelectedSlots([]);
          }}
          onGoToPos={(firstSlot, custName, custPhone) => {
            handleGoToPosFromSlot(firstSlot, custName, custPhone);
          }}
        />

        {/* Dialog Chi Tiết Ca Đang Giữ (Xem khách nào, SĐT, đếm ngược, Gia hạn, Giải phóng, Nạp POS) */}
        <HeldSlotDetailDialog
          open={!!heldSlotDetail}
          onOpenChange={(open) => !open && setHeldSlotDetail(null)}
          hold={heldSlotDetail}
          onRelease={(updated) => {
            setCourtHolds(updated);
            setHeldSlotDetail(null);
          }}
          onGoToPos={(hold) => {
            handleGoToPosFromSlot(
              {
                courtId: hold.courtId,
                courtName: hold.courtName,
                time: hold.time,
                price: hold.price,
                date: hold.date,
              },
              hold.customerName,
              hold.customerPhone
            );
          }}
        />

        {/* Floating Toolbar khi chọn nhiều ca sân */}
        <MultiSlotToolbar
          selectedSlots={selectedSlots}
          onClear={() => setSelectedSlots([])}
          onOpenHoldDialog={() => {
            setSlotsForHoldModal(selectedSlots);
            setHoldDialogOpen(true);
          }}
          onGoToPos={handleBatchGoToPos}
        />

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
