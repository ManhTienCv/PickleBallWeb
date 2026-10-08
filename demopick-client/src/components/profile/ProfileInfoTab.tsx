import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Phone,
  Mail,
  Lock,
  Check,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'

interface ProfileInfoTabProps {
  user: any
  onOpenEmailModal: () => void
  onOpenPasswordModal: () => void
  onProfileUpdated: (updatedUser: any) => void
}

export default function ProfileInfoTab({
  user,
  onOpenEmailModal,
  onOpenPasswordModal,
  onProfileUpdated,
}: ProfileInfoTabProps) {
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
    }
  }, [user])

  const handleUpdateBasicProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const updated = await authService.updateProfile({ name, phone })
      onProfileUpdated(updated)
      toast.success('Đã cập nhật thông tin cá nhân!')
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
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
              onClick={onOpenEmailModal}
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
              onClick={onOpenPasswordModal}
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
  )
}
