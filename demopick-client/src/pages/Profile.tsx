import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/auth.service'
import { addressService, UserAddress, AddressLabelType } from '@/services/address.service'
import MapLocationPicker, { SelectedLocationResult } from '@/components/MapLocationPicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  User,
  ShieldCheck,
  Mail,
  KeyRound,
  CheckCircle2,
  MapPin,
  Home,
  Building,
  Plus,
  Trash2,
  Edit2,
  Star,
  Sparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function Profile() {
  const navigate = useNavigate()
  const { user, isAuthenticated, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile')

  // Profile fields
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [isSaving, setIsSaving] = useState(false)

  // Email Change with OTP Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpStep, setOtpStep] = useState<'input_email' | 'input_otp'>('input_email')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  // Address Book State
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
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

  const reloadAddresses = () => {
    setAddresses(addressService.getSavedAddresses())
  }

  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate('/', { replace: true })
      import('@/stores/useAuthModalStore').then(({ useAuthModalStore }) => {
        useAuthModalStore.getState().openLogin()
      })
      return
    }
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
    }
    reloadAddresses()
  }, [user, isAuthenticated, navigate])

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleUpdateBasicProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const updated = await authService.updateProfile({ name, phone })
      updateUser(updated)
      toast.success('Đã cập nhật thông tin cá nhân!')
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenEmailModal = () => {
    setNewEmail('')
    setOtpCode('')
    setOtpStep('input_email')
    setDemoOtpHint(null)
    setCountdown(0)
    setIsEmailModalOpen(true)
  }

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Vui lòng nhập địa chỉ email hợp lệ.')
      return
    }
    if (user && newEmail.toLowerCase() === user.email.toLowerCase()) {
      toast.error('Địa chỉ email mới phải khác với email hiện tại.')
      return
    }

    setIsSendingOtp(true)
    try {
      const res = await authService.sendEmailOtp(newEmail)
      setOtpStep('input_otp')
      setCountdown(60)
      if (res.otp) {
        setDemoOtpHint(res.otp)
        toast.success(`Mã OTP xác thực đã được gửi tới ${newEmail}!`, {
          description: `Mã OTP mẫu của bạn là: ${res.otp}`,
          duration: 6000,
        })
      } else {
        toast.success(`Mã OTP xác thực đã được gửi tới ${newEmail}! Vui lòng kiểm tra hòm thư.`)
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể gửi mã OTP. Vui lòng thử lại.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error('Vui lòng nhập đúng mã OTP gồm 6 chữ số.')
      return
    }

    setIsVerifyingOtp(true)
    try {
      const updatedUser = await authService.verifyEmailOtp(newEmail, otpCode.trim())
      updateUser(updatedUser)
      toast.success(`Đã đổi địa chỉ Email thành công sang "${newEmail}"!`)
      setIsEmailModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.')
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  // Address Modal Helpers
  const handleOpenAddAddress = () => {
    setEditingAddressId(null)
    setAddrLabel('home')
    setAddrRecipient(name || 'Nguyễn Văn An')
    setAddrPhone(phone || '0987654321')
    setAddrStreet('')
    setAddrDistrict('')
    setAddrCity('Hà Nội')
    setAddrIsDefault(addresses.length === 0)
    setAddrLat(21.0285)
    setAddrLng(105.8542)
    setShowMapPickerInModal(false)
    setIsAddressModalOpen(true)
  }

  const handleOpenEditAddress = (addr: UserAddress) => {
    setEditingAddressId(addr.id)
    setAddrLabel(addr.label)
    setAddrRecipient(addr.recipientName)
    setAddrPhone(addr.phone)
    setAddrStreet(addr.streetAddress)
    setAddrDistrict(addr.district || '')
    setAddrCity(addr.city)
    setAddrIsDefault(addr.isDefault)
    setAddrLat(addr.lat)
    setAddrLng(addr.lng)
    setShowMapPickerInModal(false)
    setIsAddressModalOpen(true)
  }

  const handleSaveAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addrRecipient.trim() || !addrPhone.trim() || !addrStreet.trim()) {
      toast.error('Vui lòng điền đầy đủ tên, số điện thoại và địa chỉ')
      return
    }

    if (editingAddressId) {
      addressService.updateAddress(editingAddressId, {
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

    reloadAddresses()
    setIsAddressModalOpen(false)
  }

  const handleDeleteAddress = (id: string) => {
    addressService.deleteAddress(id)
    reloadAddresses()
    toast.success('Đã xóa địa chỉ khỏi Sổ địa chỉ')
  }

  const handleSetDefault = (id: string) => {
    addressService.setDefaultAddress(id)
    reloadAddresses()
    toast.success('Đã đặt làm địa chỉ giao hàng mặc định!')
  }

  const handleMapLocationSelected = (result: SelectedLocationResult) => {
    setAddrStreet(result.street)
    setAddrDistrict(result.district)
    setAddrCity(result.city)
    setAddrLat(result.lat)
    setAddrLng(result.lng)
    setShowMapPickerInModal(false)
    toast.success('Đã lấy địa chỉ từ Bản đồ!')
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-4xl font-sans space-y-6">
      {/* Top Tab Bar */}
      <div className="flex items-center gap-2 bg-white dark:bg-card p-2 rounded-2xl border border-slate-200 dark:border-border shadow-sm">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Hồ Sơ & Bảo Mật</span>
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'addresses'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4 text-[#27c372]" />
          <span>Sổ Địa Chỉ Nhận Hàng ({addresses.length})</span>
        </button>
      </div>

      {/* TAB 1: BASIC PROFILE */}
      {activeTab === 'profile' && (
        <Card className="shadow-sm border-slate-200 dark:border-border bg-white dark:bg-card rounded-3xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 shadow-sm">
                <User className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Hồ Sơ Cá Nhân</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Cập nhật thông tin và quản lý tài khoản của bạn
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleUpdateBasicProfile}>
            <CardContent className="space-y-5">
              {/* EMAIL ROW WITH CHANGE EMAIL BUTTON */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Địa chỉ Email
                  </Label>
                  <button
                    type="button"
                    onClick={handleOpenEmailModal}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Đổi Email (Xác thực OTP)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="email"
                      value={user?.email || 'customer@demopick.vn'}
                      disabled
                      className="bg-[#FAF8F5] dark:bg-slate-900/60 border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 font-medium text-xs h-10 rounded-xl"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Đã xác thực
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOpenEmailModal}
                    className="h-10 px-3.5 rounded-xl border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0"
                  >
                    Thay đổi
                  </Button>
                </div>
              </div>

              {/* NAME FIELD */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Họ và tên
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-10 rounded-xl border-slate-200 dark:border-border text-xs font-medium focus:border-emerald-500"
                />
              </div>

              {/* PHONE FIELD */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Số điện thoại liên hệ
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="h-10 rounded-xl border-slate-200 dark:border-border text-xs font-medium focus:border-emerald-500"
                />
              </div>

              {/* SECURITY BADGE */}
              <div className="pt-1">
                <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 bg-[#FAF8F5] dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-border">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Tài khoản được bảo mật xác thực 2 lớp với Sanctum Bearer Token & Email OTP.</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button
                type="submit"
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 text-xs"
                disabled={isSaving}
              >
                {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* TAB 2: ADDRESS BOOK & MAPS */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sổ Địa Chỉ Nhận Hàng</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lưu nhiều địa chỉ để tự động điền nhanh khi mua hàng & giao hỏa tốc
              </p>
            </div>
            <Button
              onClick={handleOpenAddAddress}
              className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Địa Chỉ Mới</span>
            </Button>
          </div>

          <div className="space-y-3">
            {addresses.map((addr) => {
              return (
                <Card
                  key={addr.id}
                  className={`p-4 rounded-2xl border-2 transition-all bg-white dark:bg-card space-y-2 ${
                    addr.isDefault ? 'border-emerald-500/80 shadow-sm' : 'border-slate-200 dark:border-border'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                        {addr.label === 'home'
                          ? 'Nhà riêng'
                          : addr.label === 'office'
                          ? 'Văn phòng Công ty'
                          : addr.label === 'court'
                          ? 'Sân Pickleball'
                          : 'Địa chỉ khác'}
                      </span>
                      {addr.isDefault && (
                        <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold text-[10px]">
                          Mặc định
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEditAddress(addr)}
                        className="h-7 px-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg text-xs"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      {!addr.isDefault && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="h-7 px-2 text-slate-400 hover:text-red-600 rounded-lg text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="text-xs space-y-0.5 text-slate-600 dark:text-slate-400">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                      {addr.recipientName} <span className="font-normal text-slate-500 dark:text-slate-400">• {addr.phone}</span>
                    </div>
                    <p className="leading-snug">{addr.streetAddress}, {addr.district && `${addr.district}, `}{addr.city}</p>
                  </div>

                  {!addr.isDefault && (
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-border text-xs">
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold text-[11px] hover:underline cursor-pointer"
                      >
                        Thiết lập làm mặc định
                      </button>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* MODAL ADD / EDIT ADDRESS WITH MAP INTEGRATION */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="sm:max-w-4xl max-w-[95vw] w-full sm:rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-border bg-white dark:bg-card shadow-2xl font-sans max-h-[92vh] overflow-y-auto overflow-x-hidden text-card-foreground">
          <DialogHeader className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl text-xs font-bold w-fit">
              <MapPin className="w-3.5 h-3.5" />
              <span>Định Vị Vận Chuyển Số</span>
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {editingAddressId ? 'Chỉnh Sửa Địa Chỉ' : 'Thêm Địa Chỉ Nhận Hàng Mới'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Điền thông tin hoặc chọn trực tiếp vị trí trên Bản đồ tương tác
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
                  className="h-10 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm shrink-0 gap-1.5"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Mở Bản Đồ</span>
                </Button>
              </div>

              {/* Label type */}
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">Loại địa chỉ:</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'home', label: 'Nhà riêng' },
                    { id: 'office', label: 'Văn phòng' },
                    { id: 'court', label: 'Sân bóng' },
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setAddrLabel(t.id as any)}
                      className={`p-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
                        addrLabel === t.id
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shadow-sm'
                          : 'border-slate-200 dark:border-border text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{t.label}</span>
                    </button>
                  ))}
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
                  onClick={() => setIsAddressModalOpen(false)}
                  className="rounded-xl text-xs sm:text-sm font-bold h-11 px-5 border-border"
                >
                  Hủy Bỏ
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm h-11 px-6 shadow-md"
                >
                  Lưu Địa Chỉ
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* EMAIL OTP DIALOG */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-md sm:rounded-3xl p-6 border border-slate-200 dark:border-border bg-white dark:bg-card shadow-2xl font-sans text-card-foreground">
          <DialogHeader className="text-center sm:text-left space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Đổi Địa Chỉ Email
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Xác thực mã OTP 6 chữ số để bảo đảm an toàn tài khoản
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {otpStep === 'input_email' ? (
            <form onSubmit={handleSendOtp} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="newEmailInput" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Nhập địa chỉ Email mới
                </Label>
                <Input
                  id="newEmailInput"
                  type="email"
                  placeholder="name@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  {isSendingOtp ? 'Đang gửi mã...' : 'Gửi Mã Xác Thực OTP'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="otpInput" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Nhập mã OTP (6 số) gửi tới {newEmail}
                </Label>
                <Input
                  id="otpInput"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                  className="h-11 text-center font-mono font-bold text-lg tracking-widest rounded-xl"
                />
                {demoOtpHint && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    💡 Mã OTP demo: <strong>{demoOtpHint}</strong>
                  </p>
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  {isVerifyingOtp ? 'Đang xác thực...' : 'Xác Nhận & Đổi Email'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
