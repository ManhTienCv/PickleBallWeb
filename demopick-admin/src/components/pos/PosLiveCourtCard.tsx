import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Timer, User, Coffee, Clock, Square, CheckSquare } from "lucide-react";
import type { CourtStatusItem, CartItem } from "@/pages/POS";

export interface LiveCourtCalculation {
  elapsedTimeStr: string;
  exactMinutes: number;
  roundedMinutes: number;
  currentEstimatedPrice: number;
  expectedMinutes: number | null;
  remainingMinutes: number | null;
  isNearEnding: boolean;
  isOvertime: boolean;
  overtimeMinutes: number;
}

export function calculateLiveCourtDetails(court: CourtStatusItem | any, now: Date = new Date()): LiveCourtCalculation {
  if (court.status !== "in_use" && court.status !== "ending") {
    return {
      elapsedTimeStr: court.time || "Sẵn sàng thi đấu",
      exactMinutes: 0,
      roundedMinutes: 0,
      currentEstimatedPrice: court.rate || 140000,
      expectedMinutes: null,
      remainingMinutes: null,
      isNearEnding: false,
      isOvertime: false,
      overtimeMinutes: 0,
    };
  }

  if (!court.start_time) {
    const fallbackHours = court.hours || 1;
    const exactMinutes = Math.round(fallbackHours * 60);
    const expectedMinutes = court.expected_duration_minutes || exactMinutes;
    const remainingMinutes = expectedMinutes - exactMinutes;
    return {
      elapsedTimeStr: court.time || "00:00:00",
      exactMinutes,
      roundedMinutes: exactMinutes,
      currentEstimatedPrice: (court.rate || 140000) * fallbackHours,
      expectedMinutes,
      remainingMinutes,
      isNearEnding: false,
      isOvertime: false,
      overtimeMinutes: 0,
    };
  }

  let start: Date;
  if (court.start_time.includes("T") || (court.start_time.includes("-") && court.start_time.includes(":"))) {
    start = new Date(court.start_time);
  } else {
    const parts = court.start_time.split(":");
    start = new Date(now);
    start.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2] || "0", 10), 0);
    // Midnight rollover protection
    if (start.getTime() > now.getTime()) {
      start.setDate(start.getDate() - 1);
    }
  }

  if (isNaN(start.getTime())) {
    start = new Date(now.getTime() - (court.hours || 1) * 3600 * 1000);
  }

  const diffSeconds = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 1000));
  const hrs = Math.floor(diffSeconds / 3600);
  const mins = Math.floor((diffSeconds % 3600) / 60);
  const secs = diffSeconds % 60;
  const timeFormatted = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const exactMins = Math.max(1, Math.floor(diffSeconds / 60));
  const roundedMins = Math.max(15, Math.ceil(exactMins / 15) * 15);
  const hourlyRate = court.rate || 140000;
  const estPrice = Math.round((roundedMins / 60) * hourlyRate);

  // Duration limit calculation:
  const expectedMinutes: number | null = court.expected_duration_minutes || (court.hours ? Math.round(court.hours * 60) : 60);
  const remainingMinutes = expectedMinutes ? expectedMinutes - exactMins : null;
  const isNearEnding = remainingMinutes !== null && remainingMinutes <= 10 && remainingMinutes > 0;
  const isOvertime = remainingMinutes !== null && remainingMinutes <= 0;
  const overtimeMinutes = isOvertime && remainingMinutes !== null ? Math.abs(remainingMinutes) : 0;

  return {
    elapsedTimeStr: timeFormatted,
    exactMinutes: exactMins,
    roundedMinutes: roundedMins,
    currentEstimatedPrice: estPrice,
    expectedMinutes,
    remainingMinutes,
    isNearEnding,
    isOvertime,
    overtimeMinutes,
  };
}

interface PosLiveCourtCardProps {
  court: CourtStatusItem;
  activeServingCourtId: number | null;
  courtTabItems: CartItem[];
  onStopSession: (court: CourtStatusItem, e?: React.MouseEvent) => void;
  onToggleServe: (courtId: number, e?: React.MouseEvent) => void;
  onCourtTabQty: (courtId: number, variantId: number, delta: number) => void;
  onExtendDuration: (court: CourtStatusItem, extraMinutes: number, e?: React.MouseEvent) => void;
  onStartSession: (court: CourtStatusItem, e?: React.MouseEvent) => void;
  onSelectCourt: (court: CourtStatusItem) => void;
}

export const PosLiveCourtCard: React.FC<PosLiveCourtCardProps> = React.memo(({
  court,
  activeServingCourtId,
  courtTabItems,
  onStopSession,
  onToggleServe,
  onCourtTabQty,
  onExtendDuration,
  onStartSession,
  onSelectCourt,
}) => {
  const isSessionRunning = court.status === "in_use" || court.status === "ending";
  const [now, setNow] = useState<Date>(() => new Date());

  // Cô lập ticker 1s chỉ chạy riêng trên card này khi sân đang được sử dụng
  useEffect(() => {
    if (!isSessionRunning) return;
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [isSessionRunning, court.start_time]);

  const live = calculateLiveCourtDetails(court, now);
  const isInUse = court.status === "in_use";
  const isEnding = court.status === "ending" || live.isNearEnding;
  const isOvertime = live.isOvertime;
  const isBooked = court.status === "booked";

  const cardBorder = isOvertime
    ? "border-rose-400 bg-rose-50/40 shadow-xs ring-1 ring-rose-300"
    : isEnding
      ? "border-amber-400 bg-amber-50/40 shadow-xs ring-1 ring-amber-300"
      : isInUse
        ? "border-emerald-400 bg-emerald-50/20 shadow-xs"
        : isBooked
          ? "border-blue-300 bg-blue-50/20"
          : "border-slate-200 hover:border-slate-300";

  let displayStatusLabel = court.statusLabel;
  let displayStatusColor = court.statusColor;

  if (isOvertime) {
    displayStatusLabel = `QUÁ GIỜ (+${live.overtimeMinutes}p)`;
    displayStatusColor = "bg-rose-50 text-rose-700 border-rose-300 animate-pulse";
  } else if (isEnding) {
    displayStatusLabel = `SẮP HẾT GIỜ (Còn ${live.remainingMinutes}p)`;
    displayStatusColor = "bg-amber-50 text-amber-700 border-amber-300 animate-pulse";
  } else if (isInUse && live.remainingMinutes !== null) {
    displayStatusLabel = `ĐANG CHƠI (Còn ${live.remainingMinutes}p)`;
    displayStatusColor = "bg-emerald-50 text-emerald-700 border-emerald-300";
  }

  return (
    <Card className={`p-3 bg-white border transition-all duration-150 space-y-2 ${cardBorder}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-xs text-slate-900">{court.name}</span>
          {isSessionRunning && (
            <span className="flex h-2 w-2 relative">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isOvertime ? "bg-rose-400" : isEnding ? "bg-amber-400" : "bg-emerald-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isOvertime ? "bg-rose-500" : isEnding ? "bg-amber-500" : "bg-emerald-500"
                }`}
              />
            </span>
          )}
        </div>
        <Badge className={`text-[9px] font-bold border ${displayStatusColor}`}>
          {displayStatusLabel}
        </Badge>
      </div>

      {/* Body Info */}
      <div className="text-[11px] space-y-1.5">
        {isSessionRunning ? (
          <div className="space-y-1.5">
            <div
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg font-mono border transition-all ${
                isOvertime
                  ? "bg-rose-500/10 dark:bg-rose-950/40 border-rose-300/80 dark:border-rose-800/60 text-rose-950 dark:text-rose-200"
                  : isEnding
                    ? "bg-amber-500/10 dark:bg-amber-950/40 border-amber-300/80 dark:border-amber-800/60 text-amber-950 dark:text-amber-200"
                    : "bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-300/80 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200"
              }`}
            >
              <div
                className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                  isOvertime
                    ? "text-rose-800 dark:text-rose-300"
                    : isEnding
                      ? "text-amber-800 dark:text-amber-300"
                      : "text-emerald-800 dark:text-emerald-300"
                }`}
              >
                <Timer
                  className={`h-3.5 w-3.5 animate-pulse ${
                    isOvertime
                      ? "text-rose-600 dark:text-rose-400"
                      : isEnding
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                  }`}
                />
                <span>{isOvertime ? "Quá giờ:" : isEnding ? "Sắp hết:" : "Giờ chơi:"}</span>
              </div>
              <span
                className={`font-black text-xs tracking-wider ${
                  isOvertime
                    ? "text-rose-700 dark:text-rose-400"
                    : isEnding
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-emerald-700 dark:text-emerald-400"
                }`}
              >
                {live.elapsedTimeStr}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 px-0.5 pt-0.5">
              <span>Tạm tính tiền sân:</span>
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

            {/* Court Tab Items (Nước/Món đã gọi trong lúc chơi) */}
            {courtTabItems && courtTabItems.length > 0 && (
              <div className="bg-amber-50/90 border border-amber-200 rounded-lg p-2 text-[10px] space-y-1">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span className="flex items-center gap-1">
                    <Coffee className="h-3.5 w-3.5 text-amber-600" />
                    Đã gọi {courtTabItems.reduce((a, b) => a + b.quantity, 0)} món:
                  </span>
                  <span>
                    {new Intl.NumberFormat("vi-VN").format(
                      courtTabItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
                    )}đ
                  </span>
                </div>
                <div className="text-slate-600 space-y-1 max-h-20 overflow-y-auto pr-0.5">
                  {courtTabItems.map((tabItem) => (
                    <div key={tabItem.variantId} className="flex items-center justify-between bg-white/70 px-1.5 py-0.5 rounded border border-amber-100">
                      <span className="truncate pr-1">• {tabItem.quantity}x {tabItem.productName}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-slate-500 font-medium">
                          {new Intl.NumberFormat("vi-VN").format(tabItem.price * tabItem.quantity)}đ
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCourtTabQty(court.id, tabItem.variantId, -1);
                          }}
                          className="text-rose-500 hover:text-rose-700 font-bold px-1 rounded hover:bg-rose-50 cursor-pointer"
                          title="Giảm 1 món"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCourtTabQty(court.id, tabItem.variantId, 1);
                          }}
                          className="text-emerald-600 hover:text-emerald-800 font-bold px-1 rounded hover:bg-emerald-50 cursor-pointer"
                          title="Thêm 1 món"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
                {court.available_minutes_until_next && court.next_booking_time
                  ? `Trống ${court.available_minutes_until_next}p (đến ${court.next_booking_time})`
                  : "Sẵn sàng đón khách"}
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
      <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
        {isSessionRunning ? (
          <>
            <div className="flex items-center gap-1.5 w-full">
              <Button
                size="sm"
                onClick={(e) => onStopSession(court, e)}
                className="flex-1 h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1 shadow-xs cursor-pointer"
              >
                <Square className="h-3 w-3 fill-current" />
                <span>Trả Sân & Chốt Bill</span>
              </Button>
              <Button
                size="sm"
                variant={activeServingCourtId === court.id ? "default" : "outline"}
                onClick={(e) => onToggleServe(court.id, e)}
                className={`h-7 px-2 text-[10px] font-bold rounded-lg shadow-xs transition-colors cursor-pointer ${
                  activeServingCourtId === court.id
                    ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600 animate-pulse"
                    : "bg-white hover:bg-amber-50 border-amber-300 text-amber-800"
                }`}
                title="Chọn đồ uống/thực phẩm nạp vào sân này"
              >
                <Coffee className="h-3 w-3 mr-0.5" />
                <span>{activeServingCourtId === court.id ? "Đang nạp" : "+ Nước"}</span>
              </Button>
            </div>

            {/* Thanh gia hạn giờ chơi */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 px-1.5 py-1 rounded-md border border-slate-200">
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                Gia hạn:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => onExtendDuration(court, 15, e)}
                  className="px-1.5 py-0.5 bg-white hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded border border-slate-200 font-bold transition-colors cursor-pointer"
                  title="Thêm 15 phút"
                >
                  +15p
                </button>
                <button
                  type="button"
                  onClick={(e) => onExtendDuration(court, 30, e)}
                  className="px-1.5 py-0.5 bg-white hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded border border-slate-200 font-bold transition-colors cursor-pointer"
                  title="Thêm 30 phút"
                >
                  +30p
                </button>
                <button
                  type="button"
                  onClick={(e) => onExtendDuration(court, 60, e)}
                  className="px-1.5 py-0.5 bg-white hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded border border-slate-200 font-bold transition-colors cursor-pointer"
                  title="Thêm 1 tiếng"
                >
                  +1h
                </button>
              </div>
            </div>
          </>
        ) : isBooked ? (
          <Button
            size="sm"
            onClick={(e) => onStartSession(court, e)}
            className="w-full h-7 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-1 shadow-xs cursor-pointer"
          >
            <CheckSquare className="h-3 w-3" />
            <span>Check-in Vào Sân</span>
          </Button>
        ) : (
          <div className="flex items-center gap-1.5 w-full">
            <Button
              size="sm"
              onClick={(e) => onStartSession(court, e)}
              className="flex-1 h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Bật Giờ
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelectCourt(court)}
              className="h-7 px-2 text-[10px] font-bold bg-white hover:bg-emerald-50 border-slate-300 text-slate-700 hover:text-emerald-700 rounded-lg shadow-xs cursor-pointer"
            >
              + 1h Bill
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
});
