import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModalStore } from '@/stores/useAuthModalStore'
import { authService } from '@/services/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertCircle,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

interface GoogleCompleteFormProps {
  email: string
  avatar: string
  initialName: string
  initialPhone: string
  googleId: string
  googleAccessToken: string
  googlePreviousView: 'login' | 'register'
  onChangeAccount: () => void
  onBack: () => void
}

export const GoogleCompleteForm: React.FC<GoogleCompleteFormProps> = ({
  email,
  avatar,
  initialName,
  initialPhone,
  googleId,
  googleAccessToken,
  googlePreviousView,
  onChangeAccount,
  onBack,
}) => {
  const { setSession } = useAuth()
  const { close } = useAuthModalStore()

  const [displayName, setDisplayName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialName) setDisplayName(initialName)
    if (initialPhone) setPhone(initialPhone)
  }, [initialName, initialPhone])

  const handleCompleteGoogleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim()) {
      setError('Vui lòng nhập họ và tên hiển thị.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const profile = {
        access_token: googleAccessToken || undefined,
        email,
        name: displayName.trim(),
        phone: phone.trim() || undefined,
        picture:
          avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        googleId: googleId || `google_${Date.now()}`,
      }
      const session = await authService.loginWithGoogle(profile)
      setSession(session.token, session.user)
      toast.success(`Đăng ký Google thành công! Chào mừng ${session.user.name}.`)
      close()
    } catch (err: any) {
      setError(err.message || 'Không thể xác thực với tài khoản Google.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col justify-center min-h-[500px] animate-in fade-in duration-300">
      <div className="text-center mb-4">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-1.5 border border-emerald-100 dark:border-emerald-800">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
          Hoàn tất thông tin tài khoản
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
          Thiết lập tên hiển thị của bạn để gia nhập DemoPick Pickleball
        </p>
      </div>

      {/* Badge tài khoản Google đã xác thực từ accounts.google.com */}
      <div className="flex items-center justify-between p-3.5 mb-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          {avatar ? (
            <img
              src={avatar}
              alt="Google avatar"
              className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-600 shadow-xs"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-600 shadow-xs">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
          )}
          <div className="truncate">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate">
              {email}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Tài khoản Google hợp lệ
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onChangeAccount}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 ml-2 cursor-pointer"
        >
          Đổi tài khoản
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/15 p-3 text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/30 mb-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleCompleteGoogleAuth} className="space-y-3.5">
        <div className="space-y-1.5">
          <Label
            htmlFor="google-name"
            className="text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            Tên hiển thị của bạn <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="h-4 w-4" />
            </div>
            <Input
              id="google-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="VD: Nguyễn Mạnh Tiến"
              className="pl-10 h-11 rounded-xl text-sm"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Tên này sẽ hiển thị trên hệ thống sân, giỏ hàng và danh tính tài khoản của bạn.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="google-phone"
            className="text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            Số điện thoại liên hệ <span className="text-slate-400 font-normal">(Khuyến khích)</span>
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="h-4 w-4" />
            </div>
            <Input
              id="google-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912 345 678"
              className="pl-10 h-11 rounded-xl text-sm"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Dùng để nhận SMS mã check-in sân Pickleball và giao nhận hàng GHN Express.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full h-11 mt-2 rounded-xl font-semibold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Đang hoàn tất đăng ký...</span>
            </>
          ) : (
            <>
              <span>Xác nhận & Hoàn tất</span>
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại {googlePreviousView === 'register' ? 'Tạo tài khoản' : 'Đăng nhập'}</span>
        </button>
      </div>
    </div>
  )
}
