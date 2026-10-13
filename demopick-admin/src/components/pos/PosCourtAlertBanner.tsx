import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { calculateLiveCourtDetails } from "./PosLiveCourtCard";
import type { CourtStatusItem } from "@/pages/POS";

interface PosCourtAlertBannerProps {
  courtStatusList: CourtStatusItem[];
  onExtendDuration: (court: CourtStatusItem, extraMinutes: number, e?: React.MouseEvent) => void;
}

export const PosCourtAlertBanner: React.FC<PosCourtAlertBannerProps> = ({
  courtStatusList,
  onExtendDuration,
}) => {
  // Cô lập timer 10s tại riêng banner cảnh báo này, không gây re-render root POS page
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const alertCourts = courtStatusList
    .map((c) => ({ court: c, live: calculateLiveCourtDetails(c, now) }))
    .filter(
      ({ court, live }) =>
        (court.status === "in_use" || court.status === "ending") &&
        (live.isNearEnding || live.isOvertime)
    );

  if (alertCourts.length === 0) return null;

  return (
    <div className="bg-amber-500/15 border border-amber-400 text-amber-950 rounded-xl p-2.5 text-[11px] space-y-1.5 shrink-0 shadow-xs animate-in fade-in duration-200">
      <div className="font-bold flex items-center justify-between text-amber-900">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 animate-bounce" />
          <span>Cảnh báo thời gian ca ({alertCourts.length} sân)</span>
        </div>
        <Badge variant="outline" className="text-[9px] bg-white border-amber-300 text-amber-800">
          Cần chú ý
        </Badge>
      </div>
      <div className="space-y-1">
        {alertCourts.map(({ court, live }) => (
          <div
            key={court.id}
            className="flex items-center justify-between text-[11px] bg-white/90 p-1.5 rounded-lg border border-amber-200"
          >
            <span className="truncate pr-1">
              <strong>{court.name}</strong>:{" "}
              {live.isOvertime ? (
                <span className="text-rose-600 font-bold">
                  Quá giờ +{live.overtimeMinutes}p!
                </span>
              ) : (
                <span className="text-amber-700 font-bold">
                  Còn {live.remainingMinutes}p
                </span>
              )}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => onExtendDuration(court, 15, e)}
                className="px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 text-[10px] font-bold cursor-pointer"
                title="Gia hạn nhanh 15 phút"
              >
                +15p
              </button>
              <button
                type="button"
                onClick={(e) => onExtendDuration(court, 30, e)}
                className="px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 text-[10px] font-bold cursor-pointer"
                title="Gia hạn nhanh 30 phút"
              >
                +30p
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default PosCourtAlertBanner;
