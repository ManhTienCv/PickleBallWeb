import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Sparkles, Home, Building2, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import MapLocationPicker, { SelectedLocationResult } from '@/components/MapLocationPicker'
import { addressService, UserAddress, AddressLabelType } from '@/services/address.service'

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  editingAddress: UserAddress | null
  defaultRecipientName?: string
  defaultPhone?: string
  isFirstAddress?: boolean
  onSaved: () => void
}

export default function AddressModal({
  isOpen,
  onClose,
  editingAddress,
  defaultRecipientName = '',
  defaultPhone = '',
  isFirstAddress = false,
  onSaved,
}: AddressModalProps) {
  const [addrLabel, setAddrLabel] = useState<AddressLabelType>('home')
  const [addrRecipient, setAddrRecipient] = useState('')
  const [addrPhone, setAddrPhone] = useState('')
  const [addrStreet, setAddrStreet] = useState('')
  const [addrDistrict, setAddrDistrict] = useState('')
  const [addrCity, setAddrCity] = useState('Hà Nội')
  const [addrIsDefault, setAddrIsDefault] = useState(false)
  const [addrLat, setAddrLat] = useState<number | undefined>(undefined)
  const [addrLng, setAddrLng] = useState<number | undefined>(undefined)
  const [showMapPickerInModal, setShowMapPickerInModal] = useState(false)

  useEffect(() => {
    if (editingAddress) {
      setAddrLabel(editingAddress.label)
      setAddrRecipient(editingAddress.recipientName)
      setAddrPhone(editingAddress.phone)
      setAddrStreet(editingAddress.streetAddress)
      setAddrDistrict(editingAddress.district || '')
      setAddrCity(editingAddress.city)
      setAddrIsDefault(editingAddress.isDefault)
      setAddrLat(editingAddress.lat)
      setAddrLng(editingAddress.lng)
      setShowMapPickerInModal(false)
    } else {
      setAddrLabel('home')
      setAddrRecipient(defaultRecipientName)
      setAddrPhone(defaultPhone)
      setAddrStreet('')
      setAddrDistrict('')
      setAddrCity('Hà Nội')
      setAddrIsDefault(isFirstAddress)
      setAddrLat(21.0285)
      setAddrLng(105.8542)
      setShowMapPickerInModal(false)
    }
  }, [editingAddress, isOpen, defaultRecipientName, defaultPhone, isFirstAddress])

  const handleMapLocationSelected = (result: SelectedLocationResult) => {
    setAddrStreet(result.street)
    setAddrDistrict(result.district)
    setAddrCity(result.city)
    setAddrLat(result.lat)
    setAddrLng(result.lng)
    setShowMapPickerInModal(false)
    toast.success('Đã lấy địa chỉ từ Bản đồ!')
  }

  const handleSaveAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addrRecipient.trim() || !addrPhone.trim() || !addrStreet.trim()) {
      toast.error('Vui lòng điền đầy đủ tên, số điện thoại và địa chỉ')
      return
    }

    if (editingAddress) {
      addressService.updateAddress(editingAddress.id, {
        label: addrLabel,
        recipientName: addrRecipient,
        phone: addrPhone,
        streetAddress: addrStreet,
        district: addrDistrict,
        city: addrCity,
        isDefault: addrIsDefault,
        lat: addrLat,
        lng: addrLng,
      })
      toast.success('Đã cập nhật địa chỉ thành công!')
    } else {
      addressService.addAddress({
        label: addrLabel,
        recipientName: addrRecipient,
        phone: addrPhone,
        streetAddress: addrStreet,
        district: addrDistrict,
        city: addrCity,
        isDefault: addrIsDefault,
        lat: addrLat,
        lng: addrLng,
      })
      toast.success('Đã thêm địa chỉ mới vào Sổ địa chỉ!')
    }

    onSaved()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-w-[95vw] w-full sm:rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-border bg-white dark:bg-card shadow-2xl font-sans max-h-[92vh] overflow-y-auto overflow-x-hidden text-card-foreground">
        <DialogHeader className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl text-xs font-bold w-fit">
            <MapPin className="w-3.5 h-3.5" />
            <span>Định Vị Vận Chuyển Số</span>
          </div>
          <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100">
            {editingAddress ? 'Chỉnh Sửa Địa Chỉ Nhận Hàng' : 'Thêm Địa Chỉ Nhận Hàng Mới'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Điền biểu mẫu hoặc chọn trực tiếp vị trí trên Bản đồ GPS tương tác
          </DialogDescription>
        </DialogHeader>

        {showMapPickerInModal ? (
          <div className="py-2">
            <MapLocationPicker
              initialLat={addrLat || 21.0533}
              initialLng={addrLng || 105.7525}
              initialAddress={addrStreet ? `${addrStreet}, ${addrCity}` : undefined}
              onSelectLocation={handleMapLocationSelected}
              onCancel={() => setShowMapPickerInModal(false)}
            />
          </div>
        ) : (
          <form onSubmit={handleSaveAddressSubmit} className="space-y-4 py-2 text-sm">
            {/* Button to open map */}
            <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-300/60 dark:border-emerald-700/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="font-bold text-emerald-950 dark:text-emerald-100 text-sm block flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Chọn vị trí trực tiếp qua Bản đồ OpenStreetMap
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Kéo ghim định vị toạ độ GPS để lấy tên đường & số nhà tự động
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setShowMapPickerInModal(true)}
                className="h-10 px-4 bg-[#27c372] hover:bg-[#22c55e] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm shrink-0 gap-1.5 cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>Mở Bản Đồ</span>
              </Button>
            </div>

            {/* Label type selector */}
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">Loại địa chỉ:</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'home', label: 'Nhà riêng', icon: Home },
                  { id: 'office', label: 'Văn phòng', icon: Building2 },
                  { id: 'court', label: 'Sân bóng', icon: Trophy },
                ].map((t) => {
                  const IconComponent = t.icon
                  const isSelected = addrLabel === t.id
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setAddrLabel(t.id as any)}
                      className={`p-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shadow-sm'
                        : 'border-slate-200 dark:border-border text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">Tên người nhận *</Label>
                <Input
                  value={addrRecipient}
                  onChange={(e) => setAddrRecipient(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="h-10 sm:h-11 text-sm rounded-xl font-medium"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">Số điện thoại *</Label>
                <Input
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  placeholder="Ví dụ: 0987654321"
                  className="h-10 sm:h-11 text-sm rounded-xl font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">Tỉnh / Thành phố *</Label>
                <select
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  className="w-full h-10 sm:h-11 px-3 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                  <option value="Bình Dương">Bình Dương</option>
                  <option value="Tỉnh thành khác">Tỉnh thành khác</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">Quận / Huyện</Label>
                <Input
                  value={addrDistrict}
                  onChange={(e) => setAddrDistrict(e.target.value)}
                  placeholder="Ví dụ: Quận Cầu Giấy"
                  className="h-10 sm:h-11 text-sm rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">Số nhà, tên đường, khu đô thị *</Label>
              <Input
                value={addrStreet}
                onChange={(e) => setAddrStreet(e.target.value)}
                placeholder="Ví dụ: Số 10 Đường Pickleball, Phường Dịch Vọng"
                className="h-10 sm:h-11 text-sm rounded-xl font-medium"
                required
              />
            </div>

            {/* Set default checkbox */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="defCheck"
                checked={addrIsDefault}
                onChange={(e) => setAddrIsDefault(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <Label htmlFor="defCheck" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Đặt làm địa chỉ giao hàng mặc định
              </Label>
            </div>

            <DialogFooter className="gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl text-xs sm:text-sm font-bold h-11 px-5 border-border"
              >
                Hủy Bỏ
              </Button>
              <Button
                type="submit"
                className="bg-[#27c372] hover:bg-[#22c55e] text-white font-bold rounded-xl text-xs sm:text-sm h-11 px-6 shadow-md"
              >
                Lưu Địa Chỉ
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
