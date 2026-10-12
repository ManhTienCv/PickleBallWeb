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
  Clock,
  MapPin,
  User,
  Sparkles,
  ShieldCheck,
  Ticket,
  Ban,
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
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`PICKLEBALL-CHECKIN:${effectiveTicketCode}`)}`

  const handleCopyTicketCode = () => {
    navigator.clipboard.writeText(effectiveTicketCode)
    setCopied(true)
    toast.success(`Đã sao chép mã vé check-in: ${effectiveTicketCode}`)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[420px] w-[92vw] max-h-[88vh] overflow-y-auto p-0 rounded-3xl border border-emerald-500/30 shadow-2xl bg-slate-50 dark:bg-slate-950">
        <DialogHeader className="sr-only">
          <DialogTitle>Vé Điện Tử Check-In Sân Tự Phục Vụ</DialogTitle>
        </DialogHeader>

        {/* PRINTABLE TICKET CONTAINER */}
        <div id="demopick-printable-ticket" className="p-4 sm:p-5 space-y-3.5">
          {/* Ticket Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 -mx-4 -mt-4 sm:-mx-5 sm:-mt-5 p-4 sm:p-4.5 text-white rounded-b-2xl shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-15 pointer-events-none">
              <Ticket className="w-24 h-24" />
            </div>

            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center p-1">
                  <img src="/pickleball-logo.svg" alt="Pickleball" className="w-5 h-5 object-contain invert brightness-0" />
                </div>
                <div>
                  <div className="font-extrabold text-sm tracking-wide leading-tight">PICKLEBALL ARENA</div>
                  <div className="text-[9.5px] text-emerald-100 uppercase tracking-wider font-semibold">Self-Service Pass</div>
                </div>
              </div>

              {ticket.isCancelled ? (
                <Badge className="bg-rose-500/90 text-white font-black text-[9.5px] px-2 py-0 border-none shadow-xs gap-1">
                  <Ban className="w-2.5 h-2.5" /> ĐÃ HỦY
                </Badge>
              ) : (
                <Badge className="bg-white/20 backdrop-blur-md text-white font-black text-[9.5px] px-2 py-0 border border-white/30 shadow-xs gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" /> SẴN SÀNG CHECK-IN
                </Badge>
              )}
            </div>

            <div className="relative z-10 pt-0.5 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-emerald-100 uppercase font-bold tracking-wider">Mã vé điện tử:</span>
                <div className="font-mono font-black text-xl tracking-wider text-white drop-shadow-xs">
                  {effectiveTicketCode}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyTicketCode}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                title="Sao chép mã vé"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Ticket Information Section */}
          <div className="bg-white dark:bg-card p-3 rounded-2xl border border-slate-200/80 dark:border-border shadow-2xs space-y-2 text-xs">
            <div className="flex items-start justify-between pb-2 border-b border-slate-100 dark:border-border">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Sân thi đấu</span>
                <div className="font-extrabold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate max-w-[200px]">{ticket.courtName || 'Sân Pickleball Tiêu Chuẩn'}</span>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Đơn hàng</span>
                <div className="font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                  #{ticket.orderCode}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100 dark:border-border">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-emerald-600" /> Khung giờ chơi
                </span>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                  {ticket.playTime}
                </div>
              </div>

              <div className="space-y-0.5 text-right">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold flex items-center justify-end gap-1">
                  <User className="w-2.5 h-2.5 text-emerald-600" /> Khách hàng
                </span>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-[11px] truncate">
                  {ticket.customerName || 'Khách đặt sân'}
                </div>
                {ticket.customerPhone && (
                  <div className="text-[10px] text-slate-500 font-medium">
                    {ticket.customerPhone}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="text-slate-500 text-[10.5px]">Trạng thái:</span>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 font-bold text-[9.5px] px-2 py-0">
                {ticket.isPaid ? '✓ ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
              </Badge>
            </div>
          </div>

          {/* SCANNABLE CODES: QR CODE + VECTOR BARCODE */}
          <div className="bg-white dark:bg-card p-3 rounded-2xl border-2 border-dashed border-emerald-500/30 dark:border-emerald-500/20 shadow-2xs text-center space-y-2.5">
            {/* Visual QR Code (ZXing Optical Scanner) */}
            <div className="inline-block p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <img
                src={qrUrl}
                alt={`Mã QR Check-in ${effectiveTicketCode}`}
                className="w-28 h-28 object-contain mx-auto"
              />
              <div className="mt-0.5 flex items-center justify-center gap-1 text-[9.5px] text-slate-400 font-mono">
                <QrCode className="w-2.5 h-2.5 text-emerald-600" />
                <span>Chuẩn quét ZXing QR</span>
              </div>
            </div>

            {/* Visual Code-128 Barcode (Laser Barcode Scanner) */}
            <div className="pt-2 border-t border-slate-100 dark:border-border/60">
              <div className="text-[9.5px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                Mã vạch Code-128 (Máy quét Laser tại quầy)
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200 inline-block shadow-2xs max-w-full overflow-hidden">
                <Barcode
                  value={effectiveTicketCode}
                  format="CODE128"
                  width={1.3}
                  height={32}
                  fontSize={11}
                  lineColor="#0f172a"
                  background="#ffffff"
                  className="mx-auto"
                />
              </div>
            </div>

            <div className="p-2 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-lg text-[10px] text-emerald-800 dark:text-emerald-300 flex items-start gap-1.5 text-left">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Xuất trình mã QR tại cửa quét tự động hoặc đưa mã vạch cho Lễ tân tại quầy để nhận sân thi đấu ngay lập tức.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-0.5">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="flex-1 h-8.5 border-slate-300 dark:border-border font-bold text-xs gap-1.5 rounded-xl shadow-2xs hover:bg-slate-100 dark:hover:bg-muted cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span>In vé / Lưu PDF</span>
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 h-8.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer"
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
