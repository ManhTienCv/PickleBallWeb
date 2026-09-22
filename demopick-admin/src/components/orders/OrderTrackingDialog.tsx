import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Phone, FastForward, Zap, MapPin } from "lucide-react";
import { ShippingOrderInfo } from "@/services/shipping.service";

interface OrderTrackingDialogProps {
  trackingInfo: ShippingOrderInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onAdvanceStage: (trackingNumber: string) => void;
  onCompleteStage: (trackingNumber: string) => void;
}

export const OrderTrackingDialog: React.FC<OrderTrackingDialogProps> = ({
  trackingInfo,
  isOpen,
  onClose,
  onAdvanceStage,
  onCompleteStage,
}) => {
  if (!trackingInfo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white rounded-3xl p-6 font-sans shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="space-y-4">
          <DialogHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <Badge className="bg-blue-50 text-blue-800 border border-blue-200 font-bold px-3 py-1">
                {trackingInfo.carrier} Express
              </Badge>
              <span className="text-xs text-slate-500 font-mono font-bold">
                #{trackingInfo.trackingNumber}
              </span>
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Hành Trình Giao Hàng Thời Gian Thực
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Đơn hàng #{trackingInfo.orderCode} • Người nhận: {trackingInfo.receiverName}
            </DialogDescription>
          </DialogHeader>

          {/* SHIPPER INFO CARD */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-900 text-sm">
                  {trackingInfo.shipperName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm">{trackingInfo.shipperName}</div>
                  <div className="text-[11px] text-slate-300">Tài xế giao hàng ({trackingInfo.carrier})</div>
                </div>
              </div>
              <a
                href={`tel:${trackingInfo.shipperPhone}`}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Gọi Shipper</span>
              </a>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/80 text-[11px] text-slate-300">
              <div>SĐT: <b className="text-white">{trackingInfo.shipperPhone}</b></div>
              <div>Biển số xe: <b className="text-white">{trackingInfo.shipperPlate}</b></div>
            </div>
          </div>

          {/* STEP ADVANCE BUTTON */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <FastForward className="w-4 h-4 text-amber-600" />
                <span>Cập nhật tiến trình giao hàng:</span>
              </span>
              <span className="text-[11px] font-bold text-amber-700">
                Bước {trackingInfo.currentStage} / 5
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                disabled={trackingInfo.isCompleted}
                onClick={() => onAdvanceStage(trackingInfo.trackingNumber)}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl h-8 gap-1.5 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {trackingInfo.isCompleted
                    ? "Đã giao thành công 100%"
                    : `⚡ Chuyển sang Bước ${trackingInfo.currentStage + 1}`}
                </span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCompleteStage(trackingInfo.trackingNumber)}
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
              {trackingInfo.timeline.map((event, idx) => {
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
              onClick={onClose}
              className="w-full rounded-xl font-bold border-slate-300 text-xs"
            >
              Đóng Cửa Sổ
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
