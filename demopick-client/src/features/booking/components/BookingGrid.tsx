import React, { useState } from 'react'
import { Court, TimeSlot, BookingGridProps } from '../types/booking.types'
import { Check, Lock, Clock, ZoomIn, ZoomOut, PlayCircle, History, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { MOCK_COURTS } from '../data/mockBookingData'

export function BookingGrid({ courts: apiCourts, slots, selectedSlotIds, onToggleSlot, selectedDate }: BookingGridProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100) // 60% - 160%

  // Real-time calculation helper to check if a slot is past relative to actual local time
  // Một ca (vd 08:00) diễn ra từ 08:00 đến 09:00. Ca chỉ "Quá giờ" khi thời gian hiện tại đã vượt qua giờ kết thúc (sau 09:00).
  const isSlotExpired = (timeStr: string, date?: Date) => {
    if (!date) return false
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (targetDate < today) return true
    if (targetDate > today) return false

    const [startH, startM] = timeStr.split(':').map((v) => parseInt(v, 10))
    const slotEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH + 1, startM || 0, 0)
    return now >= slotEndTime
  }

  // 60-minute Cut-off buffer: Khóa giữ chỗ online cho ca đang diễn ra hoặc ca sắp bắt đầu trong ≤ 60 phút để ưu tiên POS
  const isSlotCutOff = (timeStr: string, date?: Date) => {
    if (!date) return false
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (targetDate.getTime() !== today.getTime()) return false

    const [startH, startM] = timeStr.split(':').map((v) => parseInt(v, 10))
    const slotStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH, startM || 0, 0)
    const slotEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH + 1, startM || 0, 0)

    // Nếu ca đang diễn ra (hiện tại nằm giữa giờ bắt đầu và giờ kết thúc) -> chỉ phục vụ tại quầy
    if (now >= slotStartTime && now < slotEndTime) return true

    // Nếu ca sắp bắt đầu trong vòng 60 phút tới (0 < diffMinutes <= 60) -> ưu tiên khách tại quầy
    const diffMinutes = (slotStartTime.getTime() - now.getTime()) / (1000 * 60)
    return diffMinutes > 0 && diffMinutes <= 60
  }

  // Fallback to exclusive Pickleball courts if api is returning mock or empty
  const pickleballCourts: Court[] = apiCourts.length > 0 ? apiCourts : MOCK_COURTS

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
      <div className="flex items-center justify-between bg-white dark:bg-card p-3.5 rounded-2xl border border-slate-200 dark:border-border shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Tỷ lệ xem lịch sân:</span>
          <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/80">
            <ZoomOut
              onClick={() => setZoomLevel((prev) => Math.max(60, prev - 10))}
              className="h-4 w-4 text-slate-600 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
            />

            <input
              type="range"
              min="60"
              max="160"
              step="2"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-28 accent-emerald-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              title="Kéo trượt để phóng to / thu nhỏ mịn màng"
            />

            <ZoomIn
              onClick={() => setZoomLevel((prev) => Math.min(160, prev + 10))}
              className="h-4 w-4 text-slate-600 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
            />

            <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-slate-100 min-w-[36px] text-center">
              {zoomLevel}%
            </span>

            <button
              onClick={() => setZoomLevel(100)}
              className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline font-bold ml-1 cursor-pointer"
            >
              100%
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 font-medium hidden sm:block">
          💡 Nhấn nút <strong className="text-emerald-600 dark:text-emerald-400 font-bold">+ Chọn</strong> ở các ô ca sân bên dưới để đặt chỗ
        </div>
      </div>

      {/* Grid Table */}
      <div className="relative overflow-x-auto rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-sm isolate">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-border text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {/* Sticky Fixed Left Header */}
              <th className="py-3.5 px-4 min-w-[210px] w-[210px] sticky left-0 bg-slate-100 dark:bg-slate-900 border-r border-slate-300 dark:border-border z-20 shadow-md">
                Tên Sân Pickleball / Giờ
              </th>
              {timeHeaders.map((time) => (
                <th
                  key={time}
                  style={{ minWidth: `${colWidthPx}px`, transition: "min-width 0.2s ease-out" }}
                  className="py-3.5 px-2 text-center border-r border-slate-200 dark:border-border font-extrabold text-slate-800 dark:text-slate-200"
                >
                  {time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-border text-sm">
            {pickleballCourts.map((court) => {
              const numStr = (court?.court_number || court?.name || '').toUpperCase()
              const dotColor = numStr.includes('A')
                ? 'bg-emerald-500'
                : numStr.includes('B')
                ? 'bg-blue-500'
                : numStr.includes('C')
                ? 'bg-amber-500'
                : numStr.includes('D')
                ? 'bg-purple-500'
                : 'bg-teal-500'

              return (
              <tr key={court.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                {/* Sticky Fixed Left Column Cell */}
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 sticky left-0 bg-white dark:bg-card border-r border-slate-200 dark:border-border z-20 shadow-md min-w-[210px] w-[210px]">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{court.name}</span>
                  </div>
                </td>

                {timeHeaders.map((time) => {
                  const slot = getSlot(court.id, time)
                  const slotId = slot ? slot.id : (court.id * 100 + parseInt(time.split(":")[0]))
                  const isSelected = selectedSlotIds.includes(slotId)
                  const isExpired = isSlotExpired(time, selectedDate)
                  const isCutOff = isSlotCutOff(time, selectedDate) || Boolean(slot?.is_cut_off)
                  const isInUse = slot?.status === 'in_use'
                  const isHeld = slot?.status === 'held'
                  const isBooked = slot?.status === 'booked' || slot?.status === 'locked'
                  const isAvailable = (!slot || slot.status === 'available') && !isExpired && !isCutOff && !isInUse && !isHeld && !isBooked

                  return (
                    <td
                      key={time}
                      style={{ minWidth: `${colWidthPx}px`, transition: "min-width 0.2s ease-out" }}
                      className="p-1.5 border-r border-slate-100 dark:border-border"
                    >
                      <button
                        onClick={() => {
                          if (isAvailable) {
                            onToggleSlot(slotId)
                            return
                          }
                          if (isCutOff) {
                            toast.warning(
                              `Ca ${time} (${court.name}) đang diễn ra hoặc sắp bắt đầu trong ≤ 60 phút. Khung giờ này ưu tiên phục vụ trực tiếp tại quầy lễ tân hoặc Hotline 0987.654.321!`,
                              { duration: 6000 }
                            )
                            return
                          }
                          if (isExpired) {
                            toast.info(`Khung giờ ${time} (${court.name}) đã qua thời gian thi đấu hôm nay.`)
                            return
                          }
                          if (isInUse) {
                            toast.info(`Sân ${court.name} ở ca ${time} hiện đang có người chơi thực tế.`)
                            return
                          }
                          if (isHeld) {
                            toast.info(`Khung giờ ${time} (${court.name}) đang được một khách hàng khác tạm giữ trong 10 phút.`)
                            return
                          }
                          if (isBooked) {
                            toast.info(`Khung giờ ${time} (${court.name}) đã được khách đặt thành công trước đó.`)
                            return
                          }
                        }}
                        style={{
                          paddingTop: `${slotPaddingPx}px`,
                          paddingBottom: `${slotPaddingPx}px`,
                          fontSize: `${slotFontSizePx}px`,
                        }}
                        className={`w-full px-1 rounded-xl font-bold flex flex-col items-center justify-center cursor-pointer transition-colors duration-150 group border ${
                          isExpired
                            ? 'bg-slate-100/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-slate-700/80'
                            : isSelected
                            ? 'bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-500 shadow-md font-bold'
                            : isInUse
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700'
                            : isCutOff
                            ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 hover:bg-amber-500/20 shadow-xs'
                            : isHeld
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                            : isBooked
                            ? 'bg-slate-200/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                            : isAvailable
                            ? 'bg-[#FAF8F5] dark:bg-[#F7F5F0] text-slate-900 dark:text-slate-900 border-slate-300 dark:border-slate-200 hover:bg-white dark:hover:bg-white hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-700 shadow-sm dark:shadow-md'
                            : 'bg-slate-200/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isExpired ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-600 dark:text-slate-400 shrink-0" />
                            <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">Quá giờ</span>
                          </div>
                        ) : isSelected ? (
                          <div className="flex items-center justify-center gap-1 py-1">
                            <Check className="h-3.5 w-3.5 text-white" />
                            <span className="font-extrabold text-white text-[11px]">Đã chọn</span>
                          </div>
                        ) : isInUse ? (
                          <div className="flex items-center gap-1 animate-pulse" title="Sân hiện đang có người chơi thực tế">
                            <PlayCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">Đang chơi</span>
                          </div>
                        ) : isCutOff ? (
                          <div className="flex items-center gap-1" title="Khung giờ đang diễn ra hoặc sắp bắt đầu trong ≤ 60 phút. Bấm để xem thông tin liên hệ quầy lễ tân.">
                            <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">Tại quầy</span>
                          </div>
                        ) : isHeld ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-amber-700 dark:text-amber-400 shrink-0" />
                            <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold">Tạm giữ</span>
                          </div>
                        ) : isBooked ? (
                          <div className="flex items-center gap-1 opacity-90">
                            <Lock className="h-3 w-3 text-slate-600 dark:text-slate-400 shrink-0" />
                            <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">Đã kín</span>
                          </div>
                        ) : isAvailable ? (
                          <div className="flex items-center justify-center gap-1 py-1">
                            <Plus className="h-3 w-3 text-emerald-700 dark:text-emerald-700 font-extrabold group-hover:scale-110 transition-transform" />
                            <span className="font-extrabold text-slate-900 dark:text-slate-900 group-hover:text-emerald-700 dark:group-hover:text-emerald-700 text-[11px]">
                              Chọn
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 opacity-90">
                            <Lock className="h-3 w-3 text-slate-600 dark:text-slate-400 shrink-0" />
                            <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">Đã kín</span>
                          </div>
                        )}
                      </button>
                    </td>
                  )
                })}
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default BookingGrid

