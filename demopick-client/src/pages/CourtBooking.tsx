import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { bookingService, Hold } from '@/services/booking.service'
import BookingGrid from '@/components/BookingGrid'
import HoldTimerToast from '@/components/HoldTimerToast'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { format, addDays } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, CalendarDays, ShieldAlert, ArrowRight, Info, Award, RefreshCw, Tag, MapPin, Phone, Clock, Navigation, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function CourtBooking() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([])
  const [currentHold, setCurrentHold] = useState<Hold | null>(null)
  const [isHolding, setIsHolding] = useState(false)
  const [policyOpen, setPolicyOpen] = useState(false)
  const [rankPolicyOpen, setRankPolicyOpen] = useState(false)

  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  const { data: courts = [] } = useQuery({
    queryKey: ['courts'],
    queryFn: bookingService.getCourts,
  })

  const { data: slots = [], isLoading, refetch } = useQuery({
    queryKey: ['slots', dateStr],
    queryFn: () => bookingService.getSlots(dateStr),
  })

  const handleToggleSlot = (slotId: number) => {
    setSelectedSlotIds((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    )
  }

  const handleHoldSlots = async () => {
    if (selectedSlotIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 khung giờ sân.')
      return
    }

    setIsHolding(true)
    try {
      const hold = await bookingService.createHold(selectedSlotIds)
      setCurrentHold(hold)
      toast.success(`Đã tạm giữ ${selectedSlotIds.length} khung giờ trong 10 phút!`)
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-8 w-8 text-primary" />
            Đặt Thuê Sân Pickleball Online
          </h1>
          <p className="text-slate-500 mt-1">
            Chọn khung giờ trực quan, tạm giữ sân tức thì trong 10 phút để hoàn tất thanh toán
          </p>
        </div>

        {/* Date & Policy Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => setPolicyOpen(true)}
            variant="outline"
            size="sm"
            className="bg-white border-slate-300 gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5 text-primary" />
            <span>Chính Sách Hủy & Hoàn Tiền</span>
          </Button>

          <Button
            onClick={() => setRankPolicyOpen(true)}
            variant="outline"
            size="sm"
            className="bg-white border-slate-300 gap-1.5 text-xs font-semibold"
          >
            <Award className="h-3.5 w-3.5 text-amber-500" />
            <span>Chính Sách Hạng Hội Viên</span>
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-start text-left font-normal bg-white">
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
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
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="bg-emerald-600 text-white px-4 py-3 flex items-center justify-between font-bold">
            <div className="flex items-center gap-2 text-sm sm:text-base tracking-tight">
              <Tag className="h-4.5 w-4.5" />
              <span>Bảng Giá Thuê Sân Pickleball DemoPick ONE</span>
            </div>
            <Badge className="bg-emerald-700/80 text-white font-semibold text-xs border border-emerald-400/30">
              Tiêu chuẩn USAPA
            </Badge>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-extrabold uppercase bg-slate-50">
                  <th className="py-2.5 px-4 text-xs sm:text-sm">Khung giờ</th>
                  <th className="py-2.5 px-4 text-emerald-700 font-bold text-xs sm:text-sm">Thứ 2 – Thứ 6</th>
                  <th className="py-2.5 px-4 text-emerald-700 font-bold text-xs sm:text-sm">Thứ 7 – Chủ Nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 text-slate-900 font-semibold text-xs sm:text-sm">06:00 – 09:00</td>
                  <td className="py-2.5 px-4 text-emerald-600 font-bold text-sm sm:text-base">140K/h</td>
                  <td className="py-2.5 px-4 text-emerald-600 font-bold text-sm sm:text-base">180K/h</td>
                </tr>
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 text-slate-900 font-semibold text-xs sm:text-sm">09:00 – 17:00</td>
                  <td className="py-2.5 px-4 text-emerald-600 font-bold text-sm sm:text-base">140K/h</td>
                  <td className="py-2.5 px-4 text-emerald-600 font-bold text-sm sm:text-base">180K/h</td>
                </tr>
                <tr className="bg-amber-50/60 hover:bg-amber-50 transition-colors border-l-4 border-amber-500">
                  <td className="py-2.5 px-4 font-bold text-amber-950 flex items-center gap-1.5 text-xs sm:text-sm">
                    <span>17:00 – 22:00</span>
                    <Badge className="bg-amber-600 text-white font-bold text-[10px] px-1.5 py-0.5">Cao điểm</Badge>
                  </td>
                  <td className="py-2.5 px-4 text-amber-700 font-extrabold text-sm sm:text-base">180K/h</td>
                  <td className="py-2.5 px-4 text-amber-700 font-extrabold text-sm sm:text-base">220K/h</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-3 text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1.5 px-1 pt-2 border-t border-slate-100">
              <Info className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Giá đã bao gồm thuê sân thảm USAPA, lưới & đèn LED chiếu sáng ban đêm.</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Khung Địa Chỉ & Vị Trí Cụm Sân */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between font-bold text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-emerald-400" />
              <span>Vị Trí & Liên Hệ Cụm Sân</span>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/30">
              Cụm 6 Sân
            </Badge>
          </div>

          <div className="p-4 space-y-3 text-xs sm:text-sm text-slate-700 flex-1 flex flex-col justify-between">
            <div className="space-y-2.5">
              {/* Address */}
              <div className="flex items-start gap-2">
                <MapPin className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">Địa chỉ cụm sân:</div>
                  <div className="text-slate-600 text-xs sm:text-sm font-medium">Số 188 Nguyễn Văn Cừ, Q. Long Biên, Hà Nội</div>
                </div>
              </div>

              {/* Opening Hours & Hotline */}
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>Mở cửa: <strong>05:00 – 23:00</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  <span>Hotline: <strong className="text-emerald-600">0988.123.456</strong></span>
                </div>
              </div>

              {/* Amenities */}
              <div className="pt-2 border-t border-slate-100">
                <div className="font-bold text-slate-900 mb-1.5 flex items-center gap-1 text-xs sm:text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Tiện ích có sẵn tại sân:</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-1">🚗 Đỗ ô tô / Xe máy Free</div>
                  <div className="flex items-center gap-1">🚿 Phòng tắm nóng lạnh</div>
                  <div className="flex items-center gap-1">💡 Đèn LED thi đấu ban đêm</div>
                  <div className="flex items-center gap-1">📶 Wi-Fi 6 tốc độ cao</div>
                </div>
              </div>
            </div>

            {/* Google Maps & Navigation Action */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2">
              <a
                href="https://maps.google.com/?q=188+Nguyen+Van+Cu+Long+Bien+Hanoi"
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-center py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <Navigation className="h-4 w-4 text-primary" />
                <span>Chỉ đường Maps</span>
              </a>
              <a
                href="tel:0988123456"
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
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
        <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-emerald-500" />
            <span>Giờ thường (Trống)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-amber-500" />
            <span>Giờ cao điểm (17h-22h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-primary" />
            <span>Đang chọn</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-slate-300" />
            <span>Đã đặt / Đang giữ</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 font-medium">
          <Info className="h-4 w-4 text-primary shrink-0" />
          <span>Thời gian khoá sân tự động: 10 phút sau khi bấm Tạm giữ</span>
        </div>
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
      ) : (
        <BookingGrid
          courts={courts}
          slots={slots}
          selectedSlotIds={selectedSlotIds}
          onToggleSlot={handleToggleSlot}
        />
      )}

      {/* Selected Action Footer */}
      {selectedSlotIds.length > 0 && !currentHold && (
        <div className="sticky bottom-6 mt-8 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-primary/30 animate-in slide-in-from-bottom-4">
          <div>
            <div className="font-semibold text-base">
              Đã chọn <span className="text-primary font-bold">{selectedSlotIds.length}</span> khung giờ sân
            </div>
            <div className="text-xs text-slate-400">
              Nhấn "Tạm giữ sân" để giữ chỗ trong 10 phút
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleHoldSlots}
            disabled={isHolding}
            className="gap-2 bg-primary hover:bg-primary/90 text-white font-bold"
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
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Quy Định Hủy Sân & Hoàn Tiền Trực Tuyến
            </DialogTitle>
            <DialogDescription>
              Hệ thống tự động xử lý hoàn tiền về VietQR / MoMo theo mốc thời gian khách hàng thực hiện hủy
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs pt-2">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <div className="font-bold text-emerald-900 flex items-center justify-between">
                <span>Hủy trước giờ chơi ≥ 2 tiếng:</span>
                <Badge className="bg-emerald-600">Hoàn tiền 100%</Badge>
              </div>
              <p className="text-emerald-700">Tự động hoàn 100% tiền sân về tài khoản ngân hàng / ví MoMo của bạn trong 15 phút.</p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <div className="font-bold text-amber-900 flex items-center justify-between">
                <span>Hủy trước giờ chơi từ 1 - 2 tiếng:</span>
                <Badge className="bg-amber-600">Hoàn tiền 50%</Badge>
              </div>
              <p className="text-amber-700">Bạn được hoàn lại 50% tổng số tiền đã thanh toán, 50% còn lại là phí hủy ca muộn.</p>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
              <div className="font-bold text-red-900 flex items-center justify-between">
                <span>Hủy dưới 1 tiếng trước giờ chơi:</span>
                <Badge variant="destructive">Không hoàn tiền (0%)</Badge>
              </div>
              <p className="text-red-700">Khấu trừ 100% chi phí giữ sân do quá cận giờ thi đấu không thể mở ca lại cho hội viên khác.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rank Policy Dialog */}
      <Dialog open={rankPolicyOpen} onOpenChange={setRankPolicyOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Quy Định Hạng Thành Viên & Ưu Đãi Giảm Giá
            </DialogTitle>
            <DialogDescription>
              Tự động nâng hạng dựa trên tổng chi tiêu tích lũy đặt sân & mua phụ kiện tại DemoPick ONE
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs pt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>🥉 Hạng Bạc (Silver):</span>
                <Badge variant="outline" className="font-bold">Chi tiêu ≥ 0đ</Badge>
              </div>
              <p className="text-slate-600">Tự động cấp khi tạo tài khoản. Tích lũy 1% giá trị đơn hàng đổi voucher giảm giá.</p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <div className="font-bold text-amber-900 flex items-center justify-between">
                <span>🥇 Hạng Vàng (Gold):</span>
                <Badge className="bg-amber-600 font-bold">Chi tiêu ≥ 5.000.000đ</Badge>
              </div>
              <p className="text-amber-800">Tự động <strong>Giảm 10%</strong> tổng hóa đơn đặt sân & mua phụ kiện tại quầy POS.</p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <div className="font-bold text-emerald-900 flex items-center justify-between">
                <span>💎 VIP Kim Cương (Diamond):</span>
                <Badge className="bg-emerald-600 font-bold">Chi tiêu ≥ 15.000.000đ</Badge>
              </div>
              <p className="text-emerald-800">
                Tự động <strong>Giảm 15%</strong> tiền sân, ưu tiên giữ trước khung giờ vàng (17h-21h) & tặng 2 nước uống miễn phí/buổi.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
