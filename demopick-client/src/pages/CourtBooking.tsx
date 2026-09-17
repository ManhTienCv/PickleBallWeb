import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { bookingService, Hold, BookingGrid, HoldTimerToast } from '@/features/booking'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { format, addDays } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, CalendarDays, RefreshCw, Tag, MapPin, Phone, Clock, Navigation, CheckCircle2, Info, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { authHelpers } from '@/stores/useAuthStore'
import { useAuthModalStore } from '@/stores/useAuthModalStore'

export default function CourtBooking() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([])
  const [selectedCluster, setSelectedCluster] = useState<'all' | 'a' | 'b' | 'c' | 'd' | 'indoor' | 'outdoor' | 'vip'>('all')
  const [currentHold, setCurrentHold] = useState<Hold | null>(null)
  const [isHolding, setIsHolding] = useState(false)
  const [policyOpen, setPolicyOpen] = useState(false)

  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  const { data: courts = [] } = useQuery({
    queryKey: ['courts'],
    queryFn: bookingService.getCourts,
  })

  const { data: slots = [], isLoading, refetch } = useQuery({
    queryKey: ['slots', dateStr],
    queryFn: () => bookingService.getSlots(dateStr),
  })

  // Filter courts by cluster safely
  const filteredCourts = courts.filter((c) => {
    const num = (c?.court_number || c?.name || '').toUpperCase()
    if (selectedCluster === 'a' || selectedCluster === 'indoor') return num.includes('A')
    if (selectedCluster === 'b' || selectedCluster === 'outdoor') return num.includes('B')
    if (selectedCluster === 'c' || selectedCluster === 'vip') return num.includes('C')
    if (selectedCluster === 'd') return num.includes('D')
    return true
  })

  // Selected slots data with details & price calculation
  const selectedSlotsData = selectedSlotIds.map((id) => {
    const slot = slots.find((s) => s.id === id)
    const courtId = slot ? slot.court_id : Math.floor(id / 1000)
    const court = courts.find((c) => c.id === courtId)
    const timeStr = slot?.start_time ? `${slot.start_time.substring(0, 5)} - ${slot.end_time ? slot.end_time.substring(0, 5) : ''}` : `${Math.floor(id % 100)}:00`
    const isPeak = slot ? Boolean(slot.is_peak) : parseInt(timeStr.split(':')[0], 10) >= 17
    const defaultPrice = isPeak ? (court?.peak_hourly_rate || 180000) : (court?.hourly_rate || 140000)
    const price = slot?.price || defaultPrice

    return {
      id,
      courtName: court ? court.name : `Sân #${courtId}`,
      time: timeStr,
      price,
      isPeak,
    }
  })

  const estimatedTotal = selectedSlotsData.reduce((sum, item) => sum + item.price, 0)

  const handleToggleSlot = (slotId: number) => {
    setSelectedSlotIds((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    )
  }

  const handleHoldSlots = async () => {
    if (!authHelpers.isAuthenticated()) {
      toast.info('Vui lòng đăng nhập để tạm giữ khung giờ và đặt sân.')
      useAuthModalStore.getState().openLogin()
      return
    }

    if (selectedSlotIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 khung giờ sân.')
      return
    }

    setIsHolding(true)
    try {
      const hold = await bookingService.createHold(selectedSlotIds, slots)
      setCurrentHold(hold)
      toast.success(`Đã tạm giữ ${selectedSlotIds.length} khung giờ thành công trong 10 phút!`)
      refetch()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tạm giữ sân. Khung giờ có thể vừa bị giữ.')
    } finally {
      setIsHolding(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarDays className="h-8 w-8 text-primary" />
            Đặt Thuê Sân Pickleball Online
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1 font-medium text-sm">
            Chọn khung giờ trực quan, tạm giữ sân tức thì trong 10 phút để hoàn tất thanh toán
          </p>
        </div>

        {/* Date & Policy Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => setPolicyOpen(true)}
            variant="outline"
            size="sm"
            className="bg-white dark:bg-card border-slate-300 dark:border-border gap-1.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5 text-primary" />
            <span>Chính Sách Hủy & Hoàn Tiền</span>
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-start text-left font-normal bg-white dark:bg-card border-slate-300 dark:border-border text-foreground hover:bg-slate-100 dark:hover:bg-slate-800">
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-border bg-card text-card-foreground" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) || date > addDays(new Date(), 7)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 2-Column Grid Header: Left (Bảng giá 2/3) + Right (Khung địa chỉ & Vị trí 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left 2 Cols: Bảng Giá Thuê Sân */}
        <div className="lg:col-span-2 bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-border overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="bg-emerald-600 dark:bg-emerald-700 text-white px-4 py-3 flex items-center justify-between font-bold">
            <div className="flex items-center gap-2 text-sm sm:text-base tracking-tight">
              <Tag className="h-4.5 w-4.5" />
              <span>Bảng Giá Thuê Sân Pickleball</span>
            </div>
            <Badge className="bg-emerald-700/80 dark:bg-emerald-800/90 text-white font-semibold text-xs border border-emerald-400/30">
              Tiêu chuẩn USAPA
            </Badge>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 font-semibold uppercase bg-slate-50 dark:bg-slate-900/60">
                  <th className="py-2.5 px-4 text-xs sm:text-sm">Khung giờ</th>
                  <th className="py-2.5 px-4 text-emerald-700 dark:text-emerald-400 font-semibold text-xs sm:text-sm">Thứ 2 – Thứ 6</th>
                  <th className="py-2.5 px-4 text-emerald-700 dark:text-emerald-400 font-semibold text-xs sm:text-sm">Thứ 7 – Chủ Nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border text-slate-800 dark:text-slate-200">
                <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2 px-4 text-slate-700 dark:text-slate-300 font-medium text-xs sm:text-sm">06:00 – 09:00</td>
                  <td className="py-2 px-4 text-emerald-600 dark:text-emerald-400 font-medium text-xs sm:text-sm">140K/h</td>
                  <td className="py-2 px-4 text-emerald-600 dark:text-emerald-400 font-medium text-xs sm:text-sm">180K/h</td>
                </tr>
                <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2 px-4 text-slate-700 dark:text-slate-300 font-medium text-xs sm:text-sm">09:00 – 17:00</td>
                  <td className="py-2 px-4 text-emerald-600 dark:text-emerald-400 font-medium text-xs sm:text-sm">140K/h</td>
                  <td className="py-2 px-4 text-emerald-600 dark:text-emerald-400 font-medium text-xs sm:text-sm">180K/h</td>
                </tr>
                <tr className="bg-sky-50/60 dark:bg-sky-950/30 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors border-l-4 border-sky-500">
                  <td className="py-2 px-4 font-bold text-sky-950 dark:text-sky-200 flex items-center gap-1.5 text-xs sm:text-sm">
                    <span>17:00 – 22:00</span>
                    <Badge className="bg-sky-600 text-white font-bold text-[10px] px-1.5 py-0.5">Cao điểm</Badge>
                  </td>
                  <td className="py-2 px-4 text-sky-700 dark:text-sky-300 font-bold text-xs sm:text-sm">180K/h</td>
                  <td className="py-2 px-4 text-sky-700 dark:text-sky-300 font-bold text-xs sm:text-sm">220K/h</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5 px-1 pt-2 border-t border-slate-100 dark:border-border">
              <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Giá đã bao gồm thuê sân thảm USAPA, lưới & đèn LED chiếu sáng ban đêm.</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Khung Địa Chỉ & Vị Trí Cụm Sân */}
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-border overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="bg-emerald-600 dark:bg-emerald-700 text-white px-4 py-3 flex items-center justify-between font-bold text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-white" />
              <span>Thông Tin Sân</span>
            </div>
          </div>

          <div className="p-4 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex-1 flex flex-col justify-between">
            <div className="space-y-2.5">
              {/* Address */}
              <div className="flex items-start gap-2">
                <MapPin className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">Địa chỉ cụm sân:</div>
                  <div className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium">Số xx Trần Duy Hưng, Q. Cầu Giấy, Hà Nội</div>
                </div>
              </div>

              {/* Opening Hours & Hotline */}
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-border text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                  <Clock className="h-4 w-4 text-sky-500" />
                  <span>Mở cửa: <strong className="text-slate-900 dark:text-slate-100">05:00 – 23:00</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                  <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Hotline: <strong className="text-emerald-600 dark:text-emerald-400">0888888888</strong></span>
                </div>
              </div>

              {/* Amenities */}
              <div className="pt-2 border-t border-slate-100 dark:border-border">
                <div className="font-bold text-slate-900 dark:text-slate-100 mb-1.5 flex items-center gap-1 text-xs sm:text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Tiện ích có sẵn tại sân:</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <div className="flex items-center gap-1">Có sân đỗ ô tô / Xe máy</div>
                  <div className="flex items-center gap-1">Hệ thống chiếu sáng</div>
                  <div className="flex items-center gap-1">Khu vực nghỉ</div>
                  <div className="flex items-center gap-1">Wi-Fi 6 tốc độ cao</div>
                </div>
              </div>
            </div>

            {/* Google Maps & Navigation Action */}
            <div className="pt-2.5 border-t border-slate-100 dark:border-border flex items-center gap-2">
              <a
                href="https://maps.google.com/?q=Tran+Duy+Hung+Cau+Giay+Hanoi"
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-center py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <Navigation className="h-4 w-4 text-primary" />
                <span>Chỉ đường Maps</span>
              </a>
              <a
                href="tel:0888888888"
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1 transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>Gọi sân</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Legend & Info */}
      {/* Legend & Timer Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-card p-4 rounded-xl border border-slate-200 dark:border-border mb-6">
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-foreground">Khung giờ trống</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-emerald-600 ring-2 ring-emerald-400/60 shrink-0" />
            <span className="text-foreground">Đang chọn</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-foreground">Tạm giữ (10p)</span>
          </div>
          <div className="flex items-center gap-1.5" title="Khung giờ cận kề (dưới 30 phút) chỉ đặt trực tiếp tại quầy tiếp tân">
            <span className="h-3.5 w-3.5 rounded-full bg-amber-400/80 border border-amber-600 shrink-0" />
            <span className="text-foreground">Tại quầy (≤30p)</span>
          </div>
          <div className="flex items-center gap-1.5" title="Sân hiện đang có khách đang đánh thực tế">
            <span className="h-3.5 w-3.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-foreground">Đang chơi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-slate-500 dark:bg-slate-600 shrink-0" />
            <span className="text-foreground">Đã kín</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-200 font-bold">Đã quá giờ</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
          <Info className="h-4 w-4 text-primary shrink-0" />
          <span>Thời gian khoá sân tự động: 10 phút sau khi bấm Tạm giữ</span>
        </div>
      </div>

      {/* Cluster Filter Buttons */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-500 uppercase shrink-0 mr-1">Cụm sân:</span>
        {[
          { id: 'all', label: `Tất Cả (${courts.length || 8} Sân)` },
          { id: 'a', label: 'Cụm A (A1, A2)' },
          { id: 'b', label: 'Cụm B (B1, B2)' },
          { id: 'c', label: 'Cụm C (C1, C2)' },
          { id: 'd', label: 'Cụm D (D1, D2)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCluster(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0 ${
              selectedCluster === tab.id
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                : 'bg-white dark:bg-card border-slate-200 dark:border-border text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      ) : (
        <BookingGrid
          courts={filteredCourts}
          slots={slots}
          selectedSlotIds={selectedSlotIds}
          onToggleSlot={handleToggleSlot}
          selectedDate={selectedDate}
        />
      )}

      {/* Selected Action Footer */}
      {selectedSlotIds.length > 0 && !currentHold && (
        <div className="sticky bottom-6 z-40 mt-8 bg-white/95 dark:bg-card/95 backdrop-blur-md text-slate-900 dark:text-slate-100 p-4 sm:p-5 rounded-2xl shadow-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-2 border-emerald-500/30 ring-1 ring-emerald-500/10 animate-in slide-in-from-bottom-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                <span>Đã chọn</span>
                <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-lg font-mono font-black text-sm border border-emerald-200/60 dark:border-emerald-800">
                  {selectedSlotIds.length} ca sân
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Tạm tính:</span>
                <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(estimatedTotal)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 dark:text-slate-400 font-medium">
                {selectedSlotsData.slice(0, 3).map((item) => (
                  <span key={item.id} className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                    {item.courtName} ({item.time})
                  </span>
                ))}
                {selectedSlotsData.length > 3 && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">+{selectedSlotsData.length - 3} ca khác</span>
                )}
                <span className="hidden sm:inline text-slate-400">| Khóa giữ chỗ tự động trong 10 phút sau khi xác nhận</span>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleHoldSlots}
            disabled={isHolding}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 shrink-0 h-12 px-7 cursor-pointer text-sm sm:text-base"
          >
            <span>{isHolding ? 'Đang giữ sân...' : 'Tạm Giữ Sân Ngay'}</span>
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Active Hold Floating Timer Toast */}
      <HoldTimerToast
        hold={currentHold}
        onExpired={() => {
          setCurrentHold(null)
          setSelectedSlotIds([])
          toast.error('Hết thời gian giữ sân! Vui lòng chọn lại.')
          refetch()
        }}
      />

      {/* Cancellation Policy Dialog */}
      <Dialog open={policyOpen} onOpenChange={setPolicyOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-card border-border text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Quy Định Hủy Sân & Hoàn Tiền Trực Tuyến
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-300 font-medium">
              Hệ thống tự động xử lý hoàn tiền về VietQR / MoMo theo mốc thời gian khách hàng thực hiện hủy
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs pt-2">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
              <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                <span>Hủy trước giờ chơi ≥ 2 tiếng:</span>
                <Badge className="bg-emerald-600">Hoàn tiền 100%</Badge>
              </div>
              <p className="text-emerald-700 dark:text-emerald-300">Tự động hoàn 100% tiền sân về tài khoản ngân hàng / ví MoMo của bạn trong 15 phút.</p>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1">
              <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center justify-between">
                <span>Hủy trước giờ chơi từ 1 - 2 tiếng:</span>
                <Badge className="bg-amber-600">Hoàn tiền 50%</Badge>
              </div>
              <p className="text-amber-700 dark:text-amber-300">Bạn được hoàn lại 50% tổng số tiền đã thanh toán, 50% còn lại là phí hủy ca muộn.</p>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl space-y-1">
              <div className="font-bold text-red-900 dark:text-red-200 flex items-center justify-between">
                <span>Hủy dưới 1 tiếng trước giờ chơi:</span>
                <Badge variant="destructive">Không hoàn tiền (0%)</Badge>
              </div>
              <p className="text-red-700 dark:text-red-300">Khấu trừ 100% chi phí giữ sân do quá cận giờ thi đấu không thể mở ca lại cho khách hàng khác.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
