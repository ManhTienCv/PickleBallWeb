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

interface ConfirmOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerName: string
  customerPhone: string
  fullShippingAddress: string
  grandTotal: number
  isSubmitting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmOrderModal: React.FC<ConfirmOrderModalProps> = ({
  open,
  onOpenChange,
  customerName,
  customerPhone,
  fullShippingAddress,
  grandTotal,
  isSubmitting,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-card rounded-3xl p-6 font-sans border-border text-card-foreground">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100">
            Xác Nhận Đặt Hàng (Thu Tiền COD)
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium">
            Bạn đang chọn hình thức thanh toán khi nhận hàng. Đơn hàng sẽ được chuyển tới bộ phận đóng gói và bàn giao cho Shipper <strong className="text-slate-900 dark:text-slate-100">GHN Express</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-border text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Người nhận:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{customerName} ({customerPhone})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Địa chỉ giao:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{fullShippingAddress}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 dark:border-border pt-1 mt-1">
            <span className="text-slate-500 dark:text-slate-400">Tổng thanh toán COD:</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(grandTotal)}
            </span>
          </div>
        </div>

        <DialogFooter className="flex flex-row gap-3 justify-end pt-4 border-t border-slate-100 dark:border-border">
          <Button
            variant="outline"
            onClick={onCancel}
            className="rounded-xl font-bold border-slate-300 dark:border-border"
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Hàng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
