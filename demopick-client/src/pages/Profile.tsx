import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModalStore } from '@/stores/useAuthModalStore'
import { authService } from '@/services/auth.service'
import { addressService, UserAddress, AddressLabelType } from '@/services/address.service'
import { orderService, Order } from '@/services/order.service'
import MapLocationPicker, { SelectedLocationResult } from '@/components/MapLocationPicker'
import OrderReceiptModal from '@/components/OrderReceiptModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Home,
  Building2,
  Trophy,
  Phone,
  CheckCircle2,
  Package,
  Clock,
  LogOut,
  Star,
  ShoppingBag,
  ChevronRight,
  Truck,
  Check,
  Calendar,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Receipt,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function Profile() {
  const navigate = useNavigate()
  const { user, isAuthenticated, updateUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile')

  // Profile fields
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [isSaving, setIsSaving] = useState(false)

  // Password Change Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Orders State
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)

  // Email Change with OTP Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpStep, setOtpStep] = useState<'input_email' | 'input_otp'>('input_email')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
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

  // Logout Confirm Dialog
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Order Receipt Modal
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)

  const reloadAddresses = () => {
    setAddresses(addressService.getSavedAddresses())
  }

  // Load orders
  const loadOrders = async () => {
    setIsLoadingOrders(true)
    try {
      const data = await orderService.getOrders()
      if (data && data.length > 0) {
        setOrders(data)
      } else {
        // Check orders in localStorage belonging to this user
        const adminOrdersRaw = localStorage.getItem('demopick_orders_admin')
        if (adminOrdersRaw) {
          try {
            const parsed = JSON.parse(adminOrdersRaw)
            if (Array.isArray(parsed)) {
              const userOrders = parsed.filter((o: any) => {
                const phoneMatch = user?.phone && (o.customerPhone === user.phone || o.customer_phone === user.phone || o.shippingPhone === user.phone)
                const emailMatch = user?.email && (o.customerEmail === user.email || o.customer_email === user.email || o.email === user.email)
                return phoneMatch || emailMatch
              })

              if (userOrders.length > 0) {
                const converted: Order[] = userOrders.map((o: any, idx: number) => {
                  const isPaid =
                    o.paymentStatus === 'paid' ||
                    o.status === 'ĐÃ_THANH_TOÁN' ||
                    o.status === 'confirmed' ||
                    o.paymentMethod === 'VietQR'

                  return {
                    id: idx + 1,
                    order_code: o.code || o.orderCode || o.order_code || `HD-${10000 + idx}`,
                    status:
                      o.status === 'completed' || o.status === 'ĐÃ_GIAO'
                        ? 'completed'
                        : isPaid
                        ? 'confirmed'
                        : 'pending',
                    payment_status: isPaid ? 'paid' : 'unpaid',
                    payment_method: o.paymentMethod || 'VietQR',
                    total_amount: o.totalAmount || o.grandTotal || 0,
                    created_at: o.createdAt || 'Hôm nay',
                    items:
                      o.items?.map((it: any, iIdx: number) => ({
                        id: iIdx + 1,
                        item_type: 'product',
                        item_name: it.name || it.item_name || 'Thiết bị Pickleball',
                        quantity: it.qty || it.quantity || 1,
                        unit_price: it.price || 0,
                        subtotal: (it.qty || it.quantity || 1) * (it.price || 0),
                      })) || [],
                  }
                })
                setOrders(converted)
                return
              }
            }
          } catch {}
        }
        setOrders([])
      }
    } catch {
      setOrders([])
    } finally {
      setIsLoadingOrders(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate('/', { replace: true })
      useAuthModalStore.getState().openLogin()
      return
    }
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
    }
    reloadAddresses()
    loadOrders()
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
      await authService.sendEmailOtp(newEmail)
      setOtpStep('input_otp')
      setCountdown(60)
      toast.success(`Mã OTP xác thực đã được gửi tới ${newEmail}! Vui lòng kiểm tra hòm thư.`)
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

  // Password Change Handlers
  const handleOpenPasswordModal = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setIsPasswordModalOpen(true)
  }

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại.')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự.')
      return
    }

    if (newPassword === currentPassword) {
      toast.error('Mật khẩu mới không được trùng với mật khẩu hiện tại.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không trùng khớp.')
      return
    }

    setIsChangingPassword(true)
    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      })
      toast.success('Đổi mật khẩu thành công! Tài khoản của bạn đã được cập nhật mật khẩu mới an toàn.')
      setIsPasswordModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: '' }
    let score = 0
    if (pass.length >= 6) score += 1
    if (pass.length >= 8) score += 1
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1

    if (score <= 1) return { score: 1, text: 'Yếu', color: 'bg-rose-500 text-rose-500' }
    if (score === 2) return { score: 2, text: 'Trung bình', color: 'bg-amber-500 text-amber-500' }
    return { score: 3, text: 'Rất mạnh', color: 'bg-emerald-500 text-emerald-500' }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  // Address Modal Helpers
  const handleOpenAddAddress = () => {
    setEditingAddressId(null)
    setAddrLabel('home')
    setAddrRecipient(name || '')
    setAddrPhone(phone || '')
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

  const handleLogout = async () => {
    await logout()
    setShowLogoutModal(false)
    toast.success('Đã đăng xuất khỏi tài khoản')
    navigate('/')
  }

  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0]
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-6xl xl:max-w-7xl font-sans space-y-8">

        {/* ==================== HERO PROFILE BANNER ==================== */}
        <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-card">
          {/* Vibrant Gradient Cover Background - compact and clean */}
          <div className="h-32 sm:h-40 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 relative overflow-hidden">
            {/* Pickleball Court Abstract Lines overlay */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#27c372_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#27c372]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 left-1/4 w-60 h-24 bg-teal-400/10 rounded-full blur-xl pointer-events-none" />
          </div>

          {/* Profile Details Area below banner */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-7 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-5">
              {/* Avatar + Main Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 text-center sm:text-left">
                {/* Avatar - ONLY avatar has negative top margin so it hangs neatly across the banner */}
                <div className="-mt-14 sm:-mt-16 relative shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-white dark:bg-card shadow-2xl ring-4 ring-black/5 dark:ring-white/10">
                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#27c372] via-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-3xl sm:text-4xl shadow-inner uppercase tracking-wider">
                      {userInitial}
                    </div>
                  </div>
                  {/* Online Status Dot */}
                  <span className="absolute bottom-1.5 right-1.5 w-4.5 h-4.5 rounded-full bg-emerald-500 border-3 border-white dark:border-card shadow-sm" title="Tài khoản đang hoạt động" />
                </div>

                {/* Text Details - sits cleanly 100% inside the white area */}
                <div className="space-y-2 pt-2 sm:pt-4">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                      {user?.name || 'Khách Hàng DemoPick'}
                    </h1>
                    <Badge className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                      ✓ Đã Xác Thực
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-border/50">
                      <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{user?.email || 'Chưa cập nhật email'}</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-border/50">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{user?.phone || '0867015044'}</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-border/50 text-slate-500 hidden md:flex">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Tham gia từ 2026</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Right */}
              <div className="pt-2 sm:pt-4 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setShowLogoutModal(true)}
                  className="rounded-2xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 px-4 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/30 gap-2 cursor-pointer transition-all shadow-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng Xuất</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 3 QUICK METRIC STATS CARDS ==================== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Stat 1: Orders */}
          <div
            onClick={() => setActiveTab('orders')}
            className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm flex items-center gap-4 transition-all hover:shadow-md cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#27c372]/10 text-[#27c372] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block truncate">Đơn Mua & Đặt Sân</span>
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 block">{orders.length} Đơn Hàng</span>
              <span className="text-[11px] font-semibold text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                Xem lịch sử đơn hàng <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Stat 2: Addresses */}
          <div
            onClick={() => setActiveTab('addresses')}
            className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm flex items-center gap-4 transition-all hover:shadow-md cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block truncate">Sổ Địa Chỉ Giao</span>
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 block">{addresses.length} Địa Chỉ</span>
              <span className="text-[11px] font-semibold text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate block">
                Mặc định: {defaultAddr?.label === 'home' ? 'Nhà riêng' : defaultAddr?.label === 'office' ? 'Văn phòng' : 'Sân bóng'}
              </span>
            </div>
          </div>

          {/* Stat 3: Security */}
          <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block truncate">Bảo Mật Tài Khoản</span>
              <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 block">An Toàn 100%</span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate block">Xác thực OTP & Sanctum Bearer</span>
            </div>
          </div>
        </div>

        {/* ==================== 3-TAB NAVIGATION BAR ==================== */}
        <div className="flex items-center gap-2 bg-white dark:bg-card p-2 rounded-2xl border border-slate-200/80 dark:border-border shadow-sm">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
          >
            <User className="w-4 h-4" />
            <span>Thông Tin Cá Nhân & Bảo Mật</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'addresses'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Sổ Địa Chỉ Giao Hàng</span>
            <span className={`text-[11px] px-2 py-0.2 rounded-full font-bold ${activeTab === 'addresses' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              {addresses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'orders'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
          >
            <Package className="w-4 h-4" />
            <span>Lịch Sử Đơn Hàng</span>
            <span className={`text-[11px] px-2 py-0.2 rounded-full font-bold ${activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              {orders.length}
            </span>
          </button>
        </div>

        {/* ==================== TAB 1: BASIC PROFILE & SECURITY ==================== */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Editable Profile Form */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="shadow-sm border-slate-200/80 dark:border-border bg-white dark:bg-card rounded-3xl p-6 sm:p-7">
                <div className="pb-5 border-b border-slate-100 dark:border-border mb-6">
                  <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                    <User className="w-5 h-5 text-[#27c372]" />
                    <span>Cập Nhật Thông Tin Cá Nhân</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Thông tin hiển thị khi đặt sân bóng và giao nhận đơn hàng thiết bị nhanh chóng.
                  </p>
                </div>

                <form onSubmit={handleUpdateBasicProfile} className="space-y-5">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Họ và tên của bạn <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-11 rounded-2xl border-slate-200 dark:border-border text-sm font-semibold pl-10 focus:ring-2 focus:ring-emerald-500"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Phone field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Số điện thoại nhận SMS / Zalo <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="h-11 rounded-2xl border-slate-200 dark:border-border text-sm font-semibold pl-10 focus:ring-2 focus:ring-emerald-500"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Account ID info box */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-border flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 block">Mã tài khoản khách hàng</span>
                      <span className="text-slate-500 font-mono text-[11px]">DP-ACC-{user?.id ? String(user.id).padStart(5, '0') : '01088'}</span>
                    </div>
                    <Badge className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold text-[11px]">
                      Đang hoạt động
                    </Badge>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-11 bg-[#27c372] hover:bg-[#22c55e] text-white font-black rounded-2xl shadow-lg shadow-[#27c372]/20 text-sm cursor-pointer transition-all"
                      disabled={isSaving}
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSaving ? 'Đang lưu cập nhật...' : 'Lưu Thay Đổi Thông Tin'}</span>
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Right Column: Email OTP & Security Status */}
            <div className="lg:col-span-5 space-y-6">
              {/* Email & Password Security Card */}
              <Card className="shadow-sm border-slate-200/80 dark:border-border bg-white dark:bg-card rounded-3xl p-6 sm:p-7 space-y-5">
                <div className="pb-3 border-b border-slate-100 dark:border-border">
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#27c372]" />
                    <span>Email & Mật Khẩu Đăng Nhập</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Quản lý thông tin xác thực bảo mật và bảo vệ tài khoản của bạn.
                  </p>
                </div>

                {/* Email Item */}
                <div className="space-y-2">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Địa chỉ Email:</span>
                      </span>
                      <Badge className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 text-[10px] font-extrabold gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Đã xác thực
                      </Badge>
                    </div>
                    <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 break-all">
                      {user?.email || 'Chưa cập nhật email'}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOpenEmailModal}
                    className="w-full h-10 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300/80 gap-1.5 cursor-pointer shadow-xs"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đổi Địa Chỉ Email (OTP)</span>
                  </Button>
                </div>

                {/* Password Item */}
                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-border">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-border flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mật khẩu tài khoản:</span>
                      </span>
                      <div className="font-mono text-xs font-black text-slate-900 dark:text-slate-100 tracking-widest mt-1">
                        ••••••••••••
                      </div>
                    </div>
                    <Badge className="bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 text-[10px] font-bold">
                      Đã thiết lập
                    </Badge>
                  </div>

                  <Button
                    type="button"
                    onClick={handleOpenPasswordModal}
                    className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 cursor-pointer shadow-sm transition-all"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Đổi Mật Khẩu Đăng Nhập</span>
                  </Button>
                </div>
              </Card>

              {/* Security Shield Card */}
              <Card className="shadow-sm border-slate-200/80 dark:border-border bg-white dark:bg-card rounded-3xl p-6 sm:p-7 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Bảo Vệ Tài Khoản</h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Tiêu chuẩn an ninh đa lớp DemoPick</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Mã hóa mật khẩu chuẩn Bcrypt 256-bit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Phiên làm việc bảo vệ bởi Sanctum Token</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Xác thực OTP 6 số khi thay đổi thông tin</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: ADDRESS BOOK & MAPS ==================== */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-card p-6 rounded-3xl border border-slate-200/80 dark:border-border shadow-sm">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#27c372]" />
                  <span>Sổ Địa Chỉ Giao Hàng & Ghim Bản Đồ</span>
                </h2>

              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  onClick={handleOpenAddAddress}
                  className="h-11 px-5 bg-[#27c372] hover:bg-[#22c55e] text-white font-bold rounded-2xl text-xs gap-2 shadow-md shadow-[#27c372]/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Địa Chỉ Mới</span>
                </Button>
              </div>
            </div>

            {/* Address Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {addresses.map((addr) => {
                const isHome = addr.label === 'home'
                const isOffice = addr.label === 'office'
                const isCourt = addr.label === 'court'

                return (
                  <Card
                    key={addr.id}
                    className={`p-6 rounded-3xl border-2 transition-all bg-white dark:bg-card space-y-4 relative ${addr.isDefault
                      ? 'border-emerald-500/80 shadow-md ring-2 ring-emerald-500/10'
                      : 'border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                      }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isHome
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600'
                            : isOffice
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                            }`}
                        >
                          {isHome ? (
                            <Home className="w-4.5 h-4.5" />
                          ) : isOffice ? (
                            <Building2 className="w-4.5 h-4.5" />
                          ) : (
                            <Trophy className="w-4.5 h-4.5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                              {isHome ? 'Nhà riêng' : isOffice ? 'Văn phòng Công ty' : isCourt ? 'Sân bóng Pickleball' : 'Địa chỉ khác'}
                            </span>
                            {addr.isDefault && (
                              <Badge className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 text-[10px] font-extrabold px-2 py-0.5">
                                ★ Mặc định
                              </Badge>
                            )}
                          </div>
                          {addr.lat && addr.lng && (
                            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-emerald-500" /> GPS: {addr.lat.toFixed(3)}, {addr.lng.toFixed(3)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEditAddress(addr)}
                          className="h-8 w-8 p-0 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Chỉnh sửa địa chỉ"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        {!addr.isDefault && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="Xóa địa chỉ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-border">
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                        {addr.recipientName}
                        <span className="font-normal text-slate-500 dark:text-slate-400 text-xs ml-2">
                          ({addr.phone})
                        </span>
                      </div>
                      <p className="leading-relaxed font-medium text-slate-700 dark:text-slate-300">
                        {addr.streetAddress}{addr.district ? `, ${addr.district}` : ''}, {addr.city}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-border">
                      {addr.isDefault ? (
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Địa chỉ nhận hàng ưu tiên
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(addr.id)}
                          className="text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Star className="w-3 h-3 text-slate-400" />
                          <span>Thiết lập làm mặc định</span>
                        </button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditAddress(addr)}
                        className="h-7 text-[11px] text-slate-500 hover:text-emerald-600 font-bold px-2 rounded-lg"
                      >
                        Sửa chi tiết
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: ORDER & BOOKING HISTORY ==================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-card p-6 rounded-3xl border border-slate-200/80 dark:border-border shadow-sm">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#27c372]" />
                  <span>Lịch Sử Đơn Hàng & Thuê Sân</span>
                </h2>

              </div>

              <Badge variant="outline" className="text-xs font-bold px-3 py-1.5 rounded-xl border-slate-300 dark:border-slate-700">
                {orders.length} Đơn Hàng Đã Ghi Nhận
              </Badge>
            </div>

            {isLoadingOrders ? (
              <div className="py-12 text-center text-slate-500">Đang tải lịch sử đơn hàng...</div>
            ) : orders.length === 0 ? (
              <Card className="p-12 text-center rounded-3xl border-slate-200/80 dark:border-border space-y-3 bg-white dark:bg-card">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Bạn chưa có đơn hàng nào</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Khám phá các sản phẩm vợt, bóng thi đấu và đặt sân chơi Pickleball ngay hôm nay!
                </p>
                <Button
                  onClick={() => navigate('/products')}
                  className="bg-[#27c372] hover:bg-[#22c55e] text-white font-bold rounded-2xl text-xs px-5 h-10 mt-2"
                >
                  Mua Sắm Ngay
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => {
                  const isPaid = ord.payment_status === 'paid'
                  const isCompleted = ord.status === 'completed'

                  return (
                    <Card key={ord.id} className="p-6 rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold shrink-0">
                            <Truck className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                                #{ord.order_code}
                              </span>
                              <Badge
                                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${isCompleted
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                                  : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300'
                                  }`}
                              >
                                {isCompleted ? 'Hoàn tất giao hàng' : 'Đang xử lý / Đã tiếp nhận'}
                              </Badge>
                            </div>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" /> Ngày tạo: {ord.created_at}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Tổng thanh toán:</span>
                          <span className="text-base sm:text-lg font-black text-[#27c372]">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ord.total_amount)}
                          </span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2">
                        {ord.items?.map((it) => (
                          <div key={it.id} className="flex items-center justify-between text-xs py-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-[10px]">
                                {it.quantity}x
                              </span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {it.item_name}
                              </span>
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(it.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer Info */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-border text-xs">
                        <div className="flex items-center gap-2 text-slate-500">
                          <span>Phương thức:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{ord.payment_method}</span>
                          <span className="text-slate-300">•</span>
                          <Badge className={`text-[10px] font-bold ${isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {isPaid ? '✓ Đã thanh toán' : 'Chờ thu tiền (COD)'}
                          </Badge>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReceiptOrder(ord)
                            setIsReceiptModalOpen(true)
                          }}
                          className="h-8 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/40 dark:hover:border-emerald-800 transition-all flex items-center gap-1.5"
                        >
                          <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Xem Biên Nhận</span>
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== MODAL ADD / EDIT ADDRESS WITH OPENSTREETMAP ==================== */}
        <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
          <DialogContent className="sm:max-w-4xl max-w-[95vw] w-full sm:rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-border bg-white dark:bg-card shadow-2xl font-sans max-h-[92vh] overflow-y-auto overflow-x-hidden text-card-foreground">
            <DialogHeader className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl text-xs font-bold w-fit">
                <MapPin className="w-3.5 h-3.5" />
                <span>Định Vị Vận Chuyển Số</span>
              </div>
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100">
                {editingAddressId ? 'Chỉnh Sửa Địa Chỉ Nhận Hàng' : 'Thêm Địa Chỉ Nhận Hàng Mới'}
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
                    onClick={() => setIsAddressModalOpen(false)}
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

        {/* ==================== EMAIL OTP DIALOG ==================== */}
        <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
          <DialogContent className="max-w-md sm:rounded-3xl p-6 border border-slate-200 dark:border-border bg-white dark:bg-card shadow-2xl font-sans text-card-foreground">
            <DialogHeader className="text-center sm:text-left space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100">
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
                    className="h-11 text-xs rounded-xl"
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full h-11 bg-[#27c372] hover:bg-[#22c55e] text-white font-black rounded-xl text-xs shadow-md"
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
                    className="h-12 text-center font-mono font-black text-xl tracking-widest rounded-xl"
                  />
                  {countdown > 0 ? (
                    <p className="text-[11px] text-slate-400 text-center">Gửi lại mã sau {countdown}s</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="text-[11px] text-emerald-600 font-bold hover:underline block mx-auto cursor-pointer"
                    >
                      Gửi lại mã OTP
                    </button>
                  )}
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="submit"
                    disabled={isVerifyingOtp}
                    className="w-full h-11 bg-[#27c372] hover:bg-[#22c55e] text-white font-black rounded-xl text-xs shadow-md"
                  >
                    {isVerifyingOtp ? 'Đang xác thực...' : 'Xác Nhận & Đổi Email'}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* ==================== CHANGE PASSWORD DIALOG ==================== */}
        <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
          <DialogContent className="max-w-md sm:rounded-3xl p-6 border border-slate-200 dark:border-border bg-white dark:bg-card shadow-2xl font-sans text-card-foreground">
            <DialogHeader className="text-center sm:text-left space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100">
                    Đổi Mật Khẩu Tài Khoản
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Cập nhật mật khẩu mới để tăng cường an toàn tuyệt đối
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 pt-2">
              {/* Current password */}
              <div className="space-y-1.5">
                <Label htmlFor="currPass" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Mật khẩu hiện tại <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="currPass"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                    className="h-11 rounded-xl text-xs font-medium pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div className="space-y-1.5">
                <Label htmlFor="newPass" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Mật khẩu mới <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="newPass"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    required
                    className="h-11 rounded-xl text-xs font-medium pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength meter */}
                {newPassword && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Độ bảo mật:</span>
                      <span className={`font-bold ${passwordStrength.color.split(' ')[1]}`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full transition-all ${passwordStrength.score >= 1 ? passwordStrength.color.split(' ')[0] : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 rounded-full transition-all ${passwordStrength.score >= 2 ? passwordStrength.color.split(' ')[0] : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 rounded-full transition-all ${passwordStrength.score >= 3 ? passwordStrength.color.split(' ')[0] : 'bg-transparent'}`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm new password */}
              <div className="space-y-1.5">
                <Label htmlFor="confPass" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Xác nhận lại mật khẩu mới <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confPass"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    className="h-11 rounded-xl text-xs font-medium pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="text-[11px] pt-0.5">
                    {newPassword === confirmPassword ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Mật khẩu xác nhận trùng khớp
                      </span>
                    ) : (
                      <span className="text-rose-500 font-bold">
                        Mật khẩu xác nhận chưa trùng khớp
                      </span>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter className="pt-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="rounded-xl text-xs font-bold h-11 px-4 border-slate-200 dark:border-border"
                >
                  Hủy Bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isChangingPassword || !currentPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="bg-[#27c372] hover:bg-[#22c55e] text-white font-black rounded-xl text-xs h-11 px-6 shadow-md cursor-pointer flex-1"
                >
                  {isChangingPassword ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ==================== LOGOUT CONFIRM MODAL ==================== */}
        <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
          <DialogContent className="max-w-md sm:rounded-3xl p-6 font-sans border-border bg-white dark:bg-card text-card-foreground">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                <span>Xác Nhận Đăng Xuất</span>
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                Bạn có chắc chắn muốn đăng xuất khỏi tài khoản DemoPick này không?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-row gap-3 justify-end pt-4 border-t border-slate-100 dark:border-border">
              <Button
                variant="outline"
                onClick={() => setShowLogoutModal(false)}
                className="rounded-xl font-bold border-slate-200 dark:border-border"
              >
                Hủy Bỏ
              </Button>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="rounded-xl font-bold"
              >
                Đăng Xuất
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ==================== ORDER RECEIPT MODAL ==================== */}
        <OrderReceiptModal
          open={isReceiptModalOpen}
          onOpenChange={setIsReceiptModalOpen}
          order={selectedReceiptOrder}
        />

      </div>
    </div>
  )
}
