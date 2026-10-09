import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Ticket } from 'lucide-react'
import type { Voucher, AppliedVoucherResult } from '@/services/voucher.service'

interface VoucherPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableVouchers: Voucher[]
  combinedSubtotal: number
  appliedVoucher: AppliedVoucherResult | null
  isApplyingVoucher: boolean
  onApplyVoucher: (code: string) => void
  onClose: () => void
}

export const VoucherPickerModal: React.FC<VoucherPickerModalProps> = ({
  open,
  onOpenChange,
  availableVouchers,
  combinedSubtotal,
  appliedVoucher,
  isApplyingVoucher,
  onApplyVoucher,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-card rounded-3xl p-6 font-sans border-border text-card-foreground">
        <DialogHeader className="space-y-1 pb-2 border-b border-slate-100 dark:border-border">
          <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-amber-500" />
            <span>Kho Mã Giảm Giá &amp; Ưu Đãi</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Chọn mã ưu đãi phù hợp nhất với giá trị đơn hàng của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto py-2 pr-1">
          {availableVouchers.map((v) => {
            const isEligible = combinedSubtotal >= v.min_order_amount
            const isCurrent = appliedVoucher?.code === v.code

            return (
              <div
                key={v.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${isCurrent
                  ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30'
                  : isEligible
                    ? 'border-slate-200 dark:border-border hover:border-primary/50 bg-card'
                    : 'border-slate-200/60 dark:border-border/40 opacity-60 bg-muted/20'
                  }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 uppercase">
                      {v.code}
                    </span>
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {v.title}
                    </span>
                  </div>
                  {v.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {v.description}
                    </p>
                  )}
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
                    Đơn tối thiểu: <b>{new Intl.NumberFormat('vi-VN').format(v.min_order_amount)}đ</b>
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  disabled={!isEligible || isCurrent || isApplyingVoucher}
                  onClick={() => onApplyVoucher(v.code)}
                  className={`rounded-xl text-xs font-bold shrink-0 h-8 px-3 ${isCurrent
                    ? 'bg-emerald-600 text-white'
                    : isEligible
                      ? 'bg-primary hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground'
                    }`}
                >
                  {isCurrent ? 'Đang dùng' : isEligible ? 'Áp dụng' : 'Chưa đủ ĐK'}
                </Button>
              </div>
            )
          })}
        </div>

        <DialogFooter className="pt-2 border-t border-slate-100 dark:border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full rounded-xl font-bold"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
