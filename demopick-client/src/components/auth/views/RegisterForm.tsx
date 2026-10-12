import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModalStore } from '@/stores/useAuthModalStore'
import { authService } from '@/services/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Mail, Lock, User, Phone, ArrowRight, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { GoogleAuthButton } from '../GoogleAuthButton'

interface RegisterFormProps {
  onGoogleAuth: () => void
  isGoogleLoading: boolean
  onSwitchToLogin: () => void
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onGoogleAuth,
  isGoogleLoading,
  onSwitchToLogin,
}) => {
  const { registerWithOtp, isLoading } = useAuth()
  const { close } = useAuthModalStore()

  const [step, setStep] = useState<'info' | 'otp'>('info')
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })
  const [otp, setOtp] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegData({ ...regData, [e.target.name]: e.target.value })
  }

  // Bước 1: Gửi mã OTP xác thực email trước khi tạo tài khoản
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (regData.password.length < 6) {
      setError('Mật khẩu phải từ 6 ký tự trở lên.')
      return
    }

    if (regData.password !== regData.password_confirmation) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setIsSendingOtp(true)
    try {
      await authService.sendRegisterOtp(regData.email.trim(), regData.name.trim())
      setStep('otp')
      setCountdown(60)
      toast.success(`Mã OTP đã được gửi tới email ${regData.email.trim()}`)
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Không thể gửi mã xác thực OTP. Vui lòng thử lại.'
      )
    } finally {
      setIsSendingOtp(false)
    }
  }

  // Gửi lại mã OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return
    setError(null)
    setIsSendingOtp(true)
    try {
      await authService.sendRegisterOtp(regData.email.trim(), regData.name.trim())
      setCountdown(60)
      toast.success('Đã gửi lại mã OTP mới qua email!')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Lỗi gửi lại mã OTP.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  // Bước 2: Nhập OTP và kích hoạt tài khoản
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!otp || otp.trim().length !== 6) {
      setError('Vui lòng nhập đúng mã OTP gồm 6 chữ số.')
      return
    }

    setIsVerifyingOtp(true)
    try {
      await registerWithOtp({
        name: regData.name.trim(),
        email: regData.email.trim(),
        phone: regData.phone.trim(),
        password: regData.password,
        password_confirmation: regData.password_confirmation,
        otp: otp.trim(),
      })
      toast.success('🎉 Đăng ký & xác thực tài khoản thành công!')
      close()
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Mã OTP không chính xác hoặc đã hết hạn.'
      )
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  // Giao diện Bước 2: Nhập OTP
  if (step === 'otp') {
    return (
      <div className="flex flex-col justify-center min-h-[500px] animate-in fade-in duration-300">
        <div className="text-center mb-4">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-1 border border-emerald-100 dark:border-emerald-800">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Xác thực OTP tạo tài khoản
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
            Mã 6 chữ số đã được gửi tới <strong>{regData.email}</strong>
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/15 p-3 text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/30 mb-3">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerifyOtpSubmit} className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="otp-input"
                className="text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Mã xác thực OTP (6 số)
              </Label>
              {countdown > 0 ? (
                <span className="text-[11px] font-mono font-medium text-slate-400">
                  Gửi lại sau {countdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSendingOtp}
                  className="text-[11px] font-bold text-emerald-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSendingOtp ? 'animate-spin' : ''}`} /> Gửi lại mã
                </button>
              )}
            </div>
            <Input
              id="otp-input"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              autoFocus
              required
              className="h-12 rounded-xl text-center font-mono text-xl font-black tracking-widest text-emerald-700 bg-emerald-50/40 border-emerald-300 focus:border-emerald-500"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 mt-2 rounded-xl font-semibold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer flex items-center justify-center gap-2"
            disabled={isVerifyingOtp || isLoading}
          >
            {isVerifyingOtp || isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Đang kích hoạt tài khoản...</span>
              </>
            ) : (
              <>
                <span>Xác nhận & Hoàn tất đăng ký</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setStep('info')
              setError(null)
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại chỉnh sửa thông tin</span>
          </button>
        </div>
      </div>
    )
  }

  // Giao diện Bước 1: Nhập thông tin đăng ký
  return (
    <div className="flex flex-col justify-center min-h-[500px] animate-in fade-in duration-300">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
          Tạo tài khoản
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-300 mt-0.5">
          Gia nhập cộng đồng Pickleball số 1 Việt Nam
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/15 p-3 text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/30 mb-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRequestOtp} className="space-y-2.5">
        <div className="space-y-1">
          <Label
            htmlFor="reg-name"
            className="text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            Họ và tên
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="h-4 w-4" />
            </div>
            <Input
              id="reg-name"
              name="name"
              value={regData.name}
              onChange={handleRegChange}
              required
              placeholder="Nguyễn Văn An"
              className="pl-10 h-10 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label
              htmlFor="reg-email"
              className="text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              Email
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <Input
                id="reg-email"
                name="email"
                type="email"
                value={regData.email}
                onChange={handleRegChange}
                required
                placeholder="tenban@example.com"
                className="pl-10 h-10 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="reg-phone"
              className="text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              Số điện thoại
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <Input
                id="reg-phone"
                name="phone"
                type="tel"
                value={regData.phone}
                onChange={handleRegChange}
                required
                placeholder="0912345678"
                className="pl-10 h-10 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label
              htmlFor="reg-password"
              className="text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              Mật khẩu
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <Input
                id="reg-password"
                name="password"
                type="password"
                value={regData.password}
                onChange={handleRegChange}
                required
                placeholder="Tối thiểu 6 ký tự"
                className="pl-10 h-10 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="reg-password-conf"
              className="text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              Xác nhận
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <Input
                id="reg-password-conf"
                name="password_confirmation"
                type="password"
                value={regData.password_confirmation}
                onChange={handleRegChange}
                required
                placeholder="Nhập lại mật khẩu"
                className="pl-10 h-10 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 mt-1 rounded-xl font-semibold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer flex items-center justify-center gap-2"
          disabled={isSendingOtp || isLoading}
        >
          {isSendingOtp ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Đang gửi mã OTP...</span>
            </>
          ) : (
            <>
              <span>Tiếp tục & Nhận mã OTP</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Google Sign-up Divider & Button */}
      <div className="relative flex items-center my-3">
        <div className="flex-grow border-t border-slate-200 dark:border-slate-700/70"></div>
        <span className="flex-shrink-0 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider">
          Hoặc
        </span>
        <div className="flex-grow border-t border-slate-200 dark:border-slate-700/70"></div>
      </div>

      <div className="space-y-2">
        <GoogleAuthButton
          label="Đăng ký nhanh bằng tài khoản Google"
          loadingLabel="Đang mở Google..."
          isLoading={isGoogleLoading}
          disabled={isSendingOtp || isLoading}
          onClick={onGoogleAuth}
        />
      </div>

      <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-300">
        Đã có tài khoản?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </p>
    </div>
  )
}
