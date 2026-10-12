import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  QrCode,
  Printer,
  Copy,
  Check,
  Calendar,
  Clock,
  MapPin,
  User,
  Sparkles,
  ShieldCheck,
  Ticket,
  Ban,
  Phone,
} from 'lucide-react'
import { toast } from 'sonner'
import Barcode from '@/components/Barcode'

export interface CheckinTicketData {
  orderCode: string
  ticketCode: string
  courtName: string
  playDate?: string
  playTime: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  totalAmount?: number
  isPaid?: boolean
  isCancelled?: boolean
}

interface CheckinTicketModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: CheckinTicketData | null
}

export const CheckinTicketModal: React.FC<CheckinTicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
}) => {
  const [copied, setCopied] = useState(false)

  if (!ticket) return null

  const effectiveTicketCode = ticket.ticketCode || `PK-${ticket.orderCode.replace(/\D/g, '').slice(-5) || '90218'}-VIP`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`DEMOPICK-CHECKIN:${effectiveTicketCode}`)}`

  const handleCopyTicketCode = () => {
    navigator.clipboard.writeText(effectiveTicketCode)
    setCopied(true)
    toast.success(`Đã sao chép mã vé check-in: ${effectiveTicketCode}`)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  const formatVND = (amount: number = 0) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border-2 border-emerald-500/20 shadow-2xl bg-slate-50 dark:bg-slate-950">
        <DialogHeader className="sr-only">
          <DialogTitle>Vé Điện Tử Check-In Sân Tự Phục Vụ</DialogTitle>
        </DialogHeader>

        {/* PRINTABLE TICKET CONTAINER */}
        <div id="demopick-printable-ticket" className="p-6 space-y-5">
          {/* Ticket Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 -mx-6 -mt-6 p-6 text-white rounded-b-2xl shadow-md relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none">
              <Ticket className="w-32 h-32" />
            </div>

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-white text-sm">
                  DP
                </div>
                <div>
                  <div className="font-extrabold text-base tracking-wide leading-tight">DEMOPICK ARENA</div>
                  <div className="text-[10px] text-emerald-100 uppercase tracking-wider font-semibold">Self-Service Boarding Pass</div>
                </div>
              </div>

              {ticket.isCancelled ? (
                <Badge className="bg-rose-500/90 text-white font-black text-[10px] px-2.5 py-0.5 border-none shadow-sm gap-1">
                  <Ban className="w-3 h-3" /> ĐÃ HỦY
                </Badge>
              ) : (
                <Badge className="bg-white/25 backdrop-blur-md text-white font-black text-[10px] px-2.5 py-0.5 border border-white/40 shadow-sm gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> SẴN SÀNG CHECK-IN
                </Badge>
              )}
            </div>

            <div className="relative z-10 pt-1">
              <span className="text-[11px] text-emerald-100 uppercase font-bold tracking-wider">Mã vé điện tử:</span>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="font-mono font-black text-2xl tracking-wider text-white drop-shadow-sm">
                  {effectiveTicketCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTicketCode}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                  title="Sao chép mã vé"
                >
                  {copied ? <Check className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Ticket Information Section */}
          <div className="bg-white dark:bg-card p-4 rounded-2xl border border-slate-200/80 dark:border-border shadow-xs space-y-3 text-xs">
            <div className="flex items-start justify-between pb-2.5 border-b border-slate-100 dark:border-border">
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Sân thi đấu</span>
                <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{ticket.courtName || 'Cụm sân Pickleball tiêu chuẩn'}</span>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Đơn hàng</span>
                <div className="font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                  #{ticket.orderCode}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-2.5 border-b border-slate-100 dark:border-border">
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" /> Khung giờ chơi
                </span>
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {ticket.playTime}
                </div>
              </div>

              <div className="space-y-0.5 text-right">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold flex items-center justify-end gap-1">
                  <User className="w-3 h-3 text-emerald-600" /> Khách hàng
                </span>
                <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                  {ticket.customerName || 'Khách đặt sân'}
                </div>
                {ticket.customerPhone && (
                  <div className="text-[11px] text-slate-500 font-medium">
                    {ticket.customerPhone}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Trạng thái thanh toán:</span>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 font-bold text-[10px]">
                {ticket.isPaid ? '✓ ĐÃ THANH TOÁN TOÀN BỘ' : 'CHỜ THANH TOÁN'}
              </Badge>
            </div>
          </div>

          {/* SCANNABLE CODES: QR CODE + VECTOR BARCODE */}
          <div className="bg-white dark:bg-card p-5 rounded-2xl border-2 border-dashed border-emerald-500/30 dark:border-emerald-500/20 shadow-sm text-center space-y-4">
            {/* Visual QR Code (ZXing Optical Scanner) */}
            <div className="inline-block p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <img
                src={qrUrl}
                alt={`Mã QR Check-in ${effectiveTicketCode}`}
                className="w-40 h-40 object-contain mx-auto"
              />
              <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono">
                <QrCode className="w-3 h-3 text-emerald-600" />
                <span>Chuẩn quét ZXing QR</span>
              </div>
            </div>

            {/* Visual Code-128 Barcode (Laser Barcode Scanner) */}
            <div className="pt-2 border-t border-slate-100 dark:border-border/60">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                Mã vạch Code-128 (Máy quét quang học / Laser tại quầy)
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 inline-block shadow-xs max-w-full overflow-hidden">
                <Barcode
                  value={effectiveTicketCode}
                  format="CODE128"
                  width={1.6}
                  height={42}
                  fontSize={12}
                  lineColor="#0f172a"
                  background="#ffffff"
                  className="mx-auto"
                />
              </div>
            </div>

            <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2 text-left">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Xuất trình mã QR tại cửa quét tự động hoặc đưa mã vạch cho Lễ tân tại quầy để nhận sân thi đấu ngay lập tức.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="flex-1 h-10 border-slate-300 dark:border-border font-bold text-xs gap-1.5 rounded-xl shadow-xs hover:bg-slate-100 dark:hover:bg-muted"
            >
              <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span>In vé / Lưu PDF</span>
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Đóng vé
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CheckinTicketModal
