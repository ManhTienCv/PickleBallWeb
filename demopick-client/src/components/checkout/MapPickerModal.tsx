import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { MapPin } from 'lucide-react'
import MapLocationPicker, { SelectedLocationResult } from '@/components/MapLocationPicker'

interface MapPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialAddress: string
  onSelectLocation: (result: SelectedLocationResult) => void
  onCancel: () => void
}

export const MapPickerModal: React.FC<MapPickerModalProps> = ({
  open,
  onOpenChange,
  initialAddress,
  onSelectLocation,
  onCancel,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-w-[95vw] w-full sm:rounded-3xl p-6 sm:p-8 bg-white dark:bg-card border border-slate-200 dark:border-border shadow-2xl font-sans max-h-[92vh] overflow-y-auto overflow-x-hidden text-card-foreground">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Ghim Vị Trí Nhận Hàng Trên Bản Đồ</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Chọn toạ độ GPS chính xác để Shipper giao hàng tận cửa
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <MapLocationPicker
            initialAddress={initialAddress}
            onSelectLocation={onSelectLocation}
            onCancel={onCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
