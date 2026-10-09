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
import { AlertTriangle } from 'lucide-react'

interface ExitCheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hasCourtBooking: boolean
  onStay: () => void
  onExit: () => void
}

export const ExitCheckoutModal: React.FC<ExitCheckoutModalProps> = ({
  open,
  onOpenChange,
  hasCourtBooking,
  onStay,
  onExit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-card rounded-3xl p-6 font-sans border-border text-card-foreground">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>{hasCourtBooking ? 'Quay Lại Lịch Đặt Sân?' : 'Quay Lại Giỏ Hàng?'}</span>
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 text-xs font-medium">
            {hasCourtBooking
              ? 'Thời gian giữ ca sân 15 phút sẽ bị hủy bỏ và giải phóng ngay lập tức nếu bạn rời khỏi trang thanh toán.'
              : 'Thời gian giữ đơn 20 phút sẽ bị hủy bỏ nếu bạn rời khỏi trang thanh toán.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-3 justify-end pt-4 border-t border-slate-100 dark:border-border">
          <Button
            variant="outline"
            onClick={onStay}
            className="rounded-xl font-bold border-slate-300 dark:border-border cursor-pointer"
          >
            Ở Lại Tiếp Tục
          </Button>
          <Button
            onClick={onExit}
            variant="destructive"
            className="rounded-xl font-bold cursor-pointer"
          >
            Rời Khỏi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
