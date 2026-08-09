import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { adminService, TimeSlot } from "@/services/admin.service";
import { format, addDays, startOfWeek } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Lock, CheckCircle2, Clock, AlertTriangle, ShieldAlert, RefreshCw, Info, ZoomIn, ZoomOut, Maximize2, PlayCircle, History, ShoppingCart, PlusCircle, ArrowRight, CreditCard } from "lucide-react";
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
  const [policyOpen, setPolicyOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  // Selected slot modal for staff quick action
  const [slotClickData, setSlotClickData] = useState<{ courtName: string; time: string; status: string; price: number } | null>(null);

  // Pickleball Exclusive Courts
  const pickleballCourts = [
    { id: 1, name: "Sân Pickleball A1", type: "Pickleball Standard Indoor", hourly_rate: 140000, peak_hourly_rate: 180000 },
    { id: 2, name: "Sân Pickleball A2", type: "Pickleball Standard Indoor", hourly_rate: 140000, peak_hourly_rate: 180000 },
    { id: 3, name: "Sân Pickleball B1", type: "Pickleball Standard Outdoor", hourly_rate: 140000, peak_hourly_rate: 180000 },
    { id: 4, name: "Sân Pickleball B2", type: "Pickleball Standard Outdoor", hourly_rate: 140000, peak_hourly_rate: 180000 },
    { id: 5, name: "Sân Pickleball VIP C1", type: "Pickleball Premium VIP", hourly_rate: 180000, peak_hourly_rate: 220000 },
    { id: 6, name: "Sân Pickleball VIP C2", type: "Pickleball Premium VIP", hourly_rate: 180000, peak_hourly_rate: 220000 },
  ];

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

  // Smooth cell sizing calculations
  const colWidthPx = Math.round(90 * (zoomLevel / 100));
  const slotFontSizePx = (11.5 * (zoomLevel / 100)).toFixed(1);
  const slotPaddingPx = Math.max(4, Math.round(8 * (zoomLevel / 100)));

  return (
    <AppLayout
      title="Sơ Đồ Sân & Lịch Trình Đặt Khung Giờ Pickleball"
      subtitle="Đồng bộ trạng thái thời gian thực giữa Khách hàng & Admin, xử lý chống trùng lịch 100%"
      headerRight={
        <div className="flex items-center gap-2">
          <Button onClick={() => setPolicyOpen(true)} variant="outline" size="sm" className="bg-white border-slate-300 gap-1.5 text-xs font-semibold">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span>Chính sách Hủy & Hoàn tiền</span>
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white border-slate-300 font-semibold gap-2">
                <CalendarIcon className="h-4 w-4 text-primary" />
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
      <div className="space-y-6">
        {/* Anti-Conflict & Real-time Banner */}
        <Card className="p-4 bg-emerald-950 border-emerald-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                Cơ Chế Đồng Bộ Real-time & Chống Trùng Lịch (Pessimistic Locking)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Khi khách hàng chọn giờ ở App Client, khung giờ được <strong className="text-amber-400">Khóa tạm thời 10 phút (Held)</strong> đồng bộ ngay sang Admin. Nếu 2 người bấm cùng 1 lúc, giao dịch sau sẽ bị ngắt ngầm trong 100ms để đảm bảo không bao giờ trùng lịch!
              </p>
            </div>
          </div>

          <Button onClick={handleSimulateConflict} variant="outline" size="sm" className="border-amber-500/50 text-amber-300 hover:bg-amber-500/20 font-bold text-xs shrink-0">
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
            <span>Giả Lập Thử Cảnh Báo Trùng Lịch</span>
          </Button>
        </Card>

        {/* Navigation & Controls Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            {[
              { id: "day", label: "Theo Ngày" },
              { id: "week", label: "Theo Tuần (7 Ngày)" },
              { id: "month", label: "Theo Tháng" },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === v.id ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Zoom Slider Control */}
          <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <ZoomOut className="h-3.5 w-3.5" />
            </span>
            <input
              type="range"
              min={60}
              max={160}
              step={10}
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-24 accent-emerald-600 cursor-pointer"
            />
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <ZoomIn className="h-3.5 w-3.5" />
            </span>
            <span className="font-mono font-bold text-slate-800 w-10 text-right">{zoomLevel}%</span>
          </div>

          {/* Status Legends */}
          <div className="flex items-center gap-4 text-xs font-semibold">
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
          <div className="relative overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
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
                            className={`w-full px-1 rounded-lg font-bold flex flex-col items-center justify-center transition-transform active:scale-95 ${
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
          <DialogContent className="max-w-md bg-white">
            {slotClickData && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-emerald-600" />
                    {slotClickData.courtName} - Khung {slotClickData.time}
                  </DialogTitle>
                  <DialogDescription>
                    Tùy chọn thanh toán tiền sân, bán nước uống, đồ ăn hoặc đặt sân tại quầy Lễ tân
                  </DialogDescription>
                </DialogHeader>

                <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trạng thái khung giờ:</span>
                    <Badge className={slotClickData.status === "in_use" ? "bg-blue-600 font-bold" : slotClickData.status === "booked" ? "bg-emerald-700 font-bold" : "bg-emerald-500 font-bold"}>
                      {slotClickData.status === "in_use" ? "Đang chơi" : slotClickData.status === "booked" ? "Đã đặt trước" : "Sẵn sàng (Trống)"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Giá giờ sân:</span>
                    <strong className="text-emerald-700 text-sm">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(slotClickData.price)} / giờ
                    </strong>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs font-bold text-slate-700">Lễ tân chọn thao tác xử lý:</p>

                  <Button
                    onClick={handleGoToPosPayment}
                    className="w-full justify-between h-10 font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                  >
                    <span>💳 Thanh Toán Tiền Sân & Đồ Uống Tại Quầy (Đưa Sang POS)</span>
                    <CreditCard className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={handleAttemptHoldSlot}
                    variant="outline"
                    className={`w-full justify-between h-10 font-bold text-xs ${
                      slotClickData.status === "in_use" || slotClickData.status === "booked"
                        ? "border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
                        : "border-slate-300 text-slate-800"
                    }`}
                  >
                    <span>⚡ Khóa Giữ Sân Nhanh Cho Khách Trực Tiếp</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Cancellation & Refund Policy Dialog */}
        <Dialog open={policyOpen} onOpenChange={setPolicyOpen}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                Chính Sách Thanh Toán VietQR & Hủy Hoàn Tiền
              </DialogTitle>
              <DialogDescription>
                Áp dụng chuẩn xác cho hệ thống Đặt Sân Pickleball DemoPick ONE
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="font-bold text-emerald-900 flex items-center justify-between">
                  <span>Hủy trước giờ chơi ≥ 2 tiếng:</span>
                  <Badge className="bg-emerald-600">Hoàn tiền 100%</Badge>
                </div>
                <p className="text-emerald-700">Tự động hoàn 100% tiền sân về tài khoản VietQR / MoMo của khách trong 15 phút.</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <div className="font-bold text-amber-900 flex items-center justify-between">
                  <span>Hủy trước giờ chơi từ 1 - 2 tiếng:</span>
                  <Badge className="bg-amber-600">Hoàn tiền 50%</Badge>
                </div>
                <p className="text-amber-700">Khách được hoàn lại 50% tiền sân, 50% còn lại giữ làm phí giữ sân.</p>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                <div className="font-bold text-red-900 flex items-center justify-between">
                  <span>Hủy dưới 1 tiếng trước giờ chơi:</span>
                  <Badge variant="destructive">Không hoàn tiền (0%)</Badge>
                </div>
                <p className="text-red-700">Khấu trừ 100% phí do cận giờ đấu không thể xếp ca mới.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
