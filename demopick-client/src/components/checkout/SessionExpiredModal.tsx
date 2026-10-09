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
import { Clock } from 'lucide-react'

interface SessionExpiredModalProps {
  open: boolean
  hasCourtBooking: boolean
  onReturn: () => void
  onExtend: () => void
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  open,
  hasCourtBooking,
  onReturn,
  onExtend,
}) => {
  return (
    <Dialog open={open} onOpenChange={() => { }}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-card rounded-3xl p-6 font-sans border-border text-card-foreground">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <Clock className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            <span>Thời Gian Giữ Đơn Đã Hết Hạn</span>
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 text-xs font-medium">
            {hasCourtBooking
              ? 'Phiên giữ chỗ ca sân 15 phút của bạn đã kết thúc. Vui lòng quay lại màn hình chọn sân để đặt lại ca mới.'
              : 'Phiên giữ sản phẩm & lịch sân 20 phút của bạn đã kết thúc. Bạn có muốn gia hạn thêm 20 phút để tiếp tục thanh toán không?'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-3 justify-end pt-4 border-t border-slate-100 dark:border-border">
          <Button
            variant="outline"
            onClick={onReturn}
            className="rounded-xl font-bold border-slate-300 dark:border-border cursor-pointer"
          >
            {hasCourtBooking ? 'Về Lịch Đặt Sân' : 'Về Giỏ Hàng'}
          </Button>
          <Button
            onClick={onExtend}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
          >
            Gia Hạn Thêm 20 Phút
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
