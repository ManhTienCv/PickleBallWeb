import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
  Mail,
  Phone,
  Calendar,
  LogOut,
  ShoppingBag,
  MapPin,
  ShieldCheck,
  Package,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { orderService, Order } from '@/services/order.service'
import { addressService, UserAddress } from '@/services/address.service'
import OrderReceiptModal from '@/components/OrderReceiptModal'

import ProfileInfoTab from '@/components/profile/ProfileInfoTab'
import AddressBookTab from '@/components/profile/AddressBookTab'
import OrderHistoryTab from '@/components/profile/OrderHistoryTab'
import ChangePasswordModal from '@/components/profile/ChangePasswordModal'
import ChangeEmailModal from '@/components/profile/ChangeEmailModal'
import AddressModal from '@/components/profile/AddressModal'

export default function Profile() {
  const navigate = useNavigate()
  const { user, isAuthenticated, updateUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile')

  // Modals state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Orders State
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)

  // Address Book State
  const [addresses, setAddresses] = useState<UserAddress[]>([])

  const reloadAddresses = () => {
    setAddresses(addressService.getSavedAddresses())
  }

  const loadOrders = async () => {
    setIsLoadingOrders(true)
    try {
      const data = await orderService.getOrders()
      if (data && data.length > 0) {
        setOrders(data)
      } else {
        const adminOrdersRaw = localStorage.getItem('demopick_orders_admin')
        if (adminOrdersRaw) {
          try {
            const parsed = JSON.parse(adminOrdersRaw)
            if (Array.isArray(parsed)) {
              const userOrders = parsed.filter((o: any) => {
                const phoneMatch = user?.phone && (o.customerPhone === user.phone || o.customer_phone === user.phone || o.shippingPhone === user.phone)
                const emailMatch = user?.email && (o.customerEmail === user.email || o.customer_email === user.email || o.email === user.email)
                return phoneMatch || emailMatch
              }).map((o: any) => ({
                id: o.id || Math.floor(Math.random() * 9000) + 1000,
                order_code: o.code || o.order_code || 'ORD-20261008-0001',
                customer_name: o.customerName || o.customer_name || user?.name || 'Khách hàng',
                customer_phone: o.customerPhone || o.customer_phone || user?.phone || '',
                total_amount: o.totalAmount || o.total_amount || 0,
                status: (o.status || 'pending').toLowerCase(),
                payment_status: (o.paymentStatus || o.payment_status || 'unpaid').toLowerCase(),
                payment_method: o.paymentMethod || o.payment_method || 'momo',
                created_at: o.createdAt || o.created_at || new Date().toISOString().replace('T', ' ').substring(0, 19),
                items: Array.isArray(o.items) ? o.items.map((it: any, idx: number) => ({
                  id: it.id || idx + 1,
                  item_name: it.name || it.item_name || it.itemName || 'Sản phẩm',
                  quantity: it.quantity || 1,
                  unit_price: it.price || it.unit_price || 0,
                  subtotal: (it.price || it.unit_price || 0) * (it.quantity || 1),
                })) : [],
              }))
              setOrders(userOrders)
            }
          } catch {
            setOrders([])
          }
        }
      }
    } catch {
      // Fallback local storage
      const localOrdersRaw = localStorage.getItem('demopick_client_orders')
      if (localOrdersRaw) {
        try {
          setOrders(JSON.parse(localOrdersRaw))
        } catch {
          setOrders([])
        }
      }
    } finally {
      setIsLoadingOrders(false)
    }
  }

  useEffect(() => {
    reloadAddresses()
    loadOrders()
  }, [])

  const handleDeleteAddress = (id: string) => {
    addressService.deleteAddress(id)
    reloadAddresses()
    toast.success('Đã xóa địa chỉ khỏi Sổ địa chỉ')
  }

  const handleSetDefaultAddress = (id: string) => {
    addressService.setDefaultAddress(id)
    reloadAddresses()
    toast.success('Đã đặt làm địa chỉ giao hàng mặc định!')
  }

  const handleLogout = async () => {
    await logout()
    setShowLogoutModal(false)
    toast.success('Đã đăng xuất tài khoản!')
    navigate('/')
  }

  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0]
  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U'

  if (!isAuthenticated && !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">Vui lòng đăng nhập</h2>
          <p className="text-sm text-slate-500">Bạn cần đăng nhập để xem và quản lý thông tin tài khoản cá nhân.</p>
          <Button onClick={() => navigate('/login')} className="w-full bg-[#27c372] hover:bg-[#22c55e] text-white">
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-6xl xl:max-w-7xl font-sans space-y-8">

        {/* ==================== HERO PROFILE BANNER ==================== */}
        <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-card">
          <div className="h-32 sm:h-40 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#27c372_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#27c372]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 left-1/4 w-60 h-24 bg-teal-400/10 rounded-full blur-xl pointer-events-none" />
          </div>

          <div className="px-6 sm:px-8 pb-6 sm:pb-7 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-5">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 text-center sm:text-left">
                <div className="-mt-14 sm:-mt-16 relative shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-white dark:bg-card shadow-2xl ring-4 ring-black/5 dark:ring-white/10">
                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#27c372] via-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-3xl sm:text-4xl shadow-inner uppercase tracking-wider">
                      {userInitial}
                    </div>
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 w-4.5 h-4.5 rounded-full bg-emerald-500 border-3 border-white dark:border-card shadow-sm" title="Tài khoản đang hoạt động" />
                </div>

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

        {/* ==================== TAB CONTENT RENDERERS ==================== */}
        {activeTab === 'profile' && (
          <ProfileInfoTab
            user={user}
            onOpenEmailModal={() => setIsEmailModalOpen(true)}
            onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
            onProfileUpdated={(updated) => updateUser(updated)}
          />
        )}

        {activeTab === 'addresses' && (
          <AddressBookTab
            addresses={addresses}
            onOpenAddAddress={() => {
              setEditingAddress(null)
              setIsAddressModalOpen(true)
            }}
            onOpenEditAddress={(addr) => {
              setEditingAddress(addr)
              setIsAddressModalOpen(true)
            }}
            onDeleteAddress={handleDeleteAddress}
            onSetDefaultAddress={handleSetDefaultAddress}
          />
        )}

        {activeTab === 'orders' && (
          <OrderHistoryTab
            orders={orders}
            isLoadingOrders={isLoadingOrders}
            onViewReceipt={(ord) => {
              setSelectedReceiptOrder(ord)
              setIsReceiptModalOpen(true)
            }}
          />
        )}

        {/* ==================== EXTRACTED MODALS ==================== */}
        <AddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          editingAddress={editingAddress}
          defaultRecipientName={user?.name || ''}
          defaultPhone={user?.phone || ''}
          isFirstAddress={addresses.length === 0}
          onSaved={reloadAddresses}
        />

        <ChangeEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          currentEmail={user?.email}
          onEmailUpdated={(updated) => updateUser(updated)}
        />

        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />

        {/* ==================== LOGOUT CONFIRM MODAL ==================== */}
        <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
          <DialogContent className="max-w-md sm:rounded-3xl p-6 border border-slate-200 dark:border-border bg-white dark:bg-card shadow-2xl font-sans text-card-foreground">
            <DialogHeader className="text-center sm:text-left space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center border border-rose-100 dark:border-rose-900">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100">
                    Xác Nhận Đăng Xuất
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Sau khi đăng xuất, bạn sẽ được chuyển về Trang Chủ ngay lập tức và giỏ hàng tạm sẽ được làm sạch.
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                variant="outline"
                onClick={() => setShowLogoutModal(false)}
                className="rounded-xl text-xs font-bold h-11 px-4 border-slate-200 dark:border-border"
              >
                Hủy Bỏ
              </Button>
              <Button
                onClick={handleLogout}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs h-11 px-5 shadow-md cursor-pointer"
              >
                Đăng Xuất Ngay
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Receipt Modal */}
        {selectedReceiptOrder && (
          <OrderReceiptModal
            open={isReceiptModalOpen}
            onOpenChange={(op) => {
              setIsReceiptModalOpen(op)
              if (!op) setSelectedReceiptOrder(null)
            }}
            order={selectedReceiptOrder}
          />
        )}
      </div>
    </div>
  )
}
