import React, { useState } from 'react'
import { Court, TimeSlot } from '@/services/booking.service'
import { Badge } from '@/components/ui/badge'
import { Check, Lock, Clock, ZoomIn, ZoomOut, Maximize2, PlayCircle, History, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BookingGridProps {
  courts: Court[]
  slots: TimeSlot[]
  selectedSlotIds: number[]
  onToggleSlot: (slotId: number) => void
}

export default function BookingGrid({ courts: apiCourts, slots, selectedSlotIds, onToggleSlot }: BookingGridProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100) // 60% - 160%

  // Fallback to exclusive Pickleball courts if api is returning mock or empty
  const pickleballCourts: Court[] = apiCourts.length > 0 ? apiCourts : [
    { id: 1, name: 'Sân Pickleball A1', court_number: 'A1', type: 'Pickleball Standard Indoor', hourly_rate: 140000, peak_hourly_rate: 180000, status: 'active' },
    { id: 2, name: 'Sân Pickleball A2', court_number: 'A2', type: 'Pickleball Standard Indoor', hourly_rate: 140000, peak_hourly_rate: 180000, status: 'active' },
    { id: 3, name: 'Sân Pickleball B1', court_number: 'B1', type: 'Pickleball Standard Outdoor', hourly_rate: 140000, peak_hourly_rate: 180000, status: 'active' },
    { id: 4, name: 'Sân Pickleball B2', court_number: 'B2', type: 'Pickleball Standard Outdoor', hourly_rate: 140000, peak_hourly_rate: 180000, status: 'active' },
    { id: 5, name: 'Sân Pickleball VIP C1', court_number: 'C1', type: 'Pickleball Premium VIP', hourly_rate: 180000, peak_hourly_rate: 220000, status: 'active' },
    { id: 6, name: 'Sân Pickleball VIP C2', court_number: 'C2', type: 'Pickleball Premium VIP', hourly_rate: 180000, peak_hourly_rate: 220000, status: 'active' },
  ]

  // Default time headers if slots not yet fetched
  const timeHeaders = slots.length > 0
    ? Array.from(new Set(slots.map((s) => s.start_time.substring(0, 5)))).sort()
    : ["05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"]

  const getSlot = (courtId: number, startTime: string) => {
    return slots.find(
      (s) => s.court_id === courtId && s.start_time.substring(0, 5) === startTime
    )
  }

  // Smooth sizing calculations
  const colWidthPx = Math.round(95 * (zoomLevel / 100))
  const slotFontSizePx = (11.5 * (zoomLevel / 100)).toFixed(1)
  const slotPaddingPx = Math.max(4, Math.round(8 * (zoomLevel / 100)))

  return (
    <div className="space-y-4">
      {/* Zoom Control Header for Customer Portal */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase">Tỷ lệ xem lịch sân:</span>
          <div className="flex items-center gap-2 border border-slate-200 px-3 py-1.5 rounded-xl bg-slate-50">
            <ZoomOut
              onClick={() => setZoomLevel((prev) => Math.max(60, prev - 10))}
              className="h-4 w-4 text-slate-500 cursor-pointer hover:text-slate-900 transition-colors"
            />

            <input
              type="range"
              min="60"
              max="160"
              step="2"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-28 accent-primary h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              title="Kéo trượt để phóng to / thu nhỏ mịn màng"
            />

            <ZoomIn
              onClick={() => setZoomLevel((prev) => Math.min(160, prev + 10))}
              className="h-4 w-4 text-slate-500 cursor-pointer hover:text-slate-900 transition-colors"
            />

            <span className="text-xs font-mono font-bold text-slate-700 min-w-[36px] text-center">
              {zoomLevel}%
            </span>

            <button
              onClick={() => setZoomLevel(100)}
              className="text-[10px] text-slate-500 hover:text-primary font-bold ml-1 hover:underline"
            >
              100%
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          💡 Nhấn nút <strong className="text-emerald-600">+ Chọn</strong> ở các ô ca sân bên dưới để đặt chỗ
        </div>
      </div>

      {/* Grid Table */}
      <div className="relative overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
              {/* Sticky Fixed Left Header */}
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
                {/* Sticky Fixed Left Column Cell */}
                <td className="py-4 px-4 font-bold text-slate-900 sticky left-0 bg-white border-r border-slate-200 z-20 shadow-md min-w-[210px] w-[210px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-sm font-bold text-slate-900 truncate">{court.name}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-normal pl-4 truncate">{court.type}</div>
                </td>

                {timeHeaders.map((time) => {
                  const slot = getSlot(court.id, time)
                  const slotId = slot ? slot.id : (court.id * 100 + parseInt(time.split(":")[0]))
                  const isSelected = selectedSlotIds.includes(slotId)
                  const isAvailable = !slot || slot.status === 'available'
                  const isPeak = parseInt(time.split(":")[0]) >= 17
                  const price = slot ? slot.price : (isPeak ? court.peak_hourly_rate : court.hourly_rate)

                  const formattedPrice = new Intl.NumberFormat('vi-VN', {
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(price)

                  return (
                    <td
                      key={time}
                      style={{ minWidth: `${colWidthPx}px`, transition: "min-width 0.2s ease-out" }}
                      className="p-1.5 border-r border-slate-100"
                    >
                      <button
                        disabled={!isAvailable}
                        onClick={() => onToggleSlot(slotId)}
                        style={{
                          paddingTop: `${slotPaddingPx}px`,
                          paddingBottom: `${slotPaddingPx}px`,
                          fontSize: `${slotFontSizePx}px`,
                          transition: "all 0.2s ease-out",
                        }}
                        className={`w-full px-1 rounded-lg font-bold flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-primary text-white ring-2 ring-primary ring-offset-1 shadow-md scale-105'
                            : isAvailable
                            ? isPeak
                              ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:border-primary hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:border-primary hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        }`}
                      >
                        {isSelected ? (
                          <div className="flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" />
                            <span>Đã chọn</span>
                          </div>
                        ) : isAvailable ? (
                          <div className="flex items-center gap-1">
                            <Plus className="h-3 w-3 text-emerald-600" />
                            <span>Chọn</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 opacity-60">
                            <Lock className="h-3 w-3" />
                            <span>Đã kín</span>
                          </div>
                        )}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
