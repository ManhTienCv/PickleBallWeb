import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModalStore } from '@/stores/useAuthModalStore'
import { authService } from '@/services/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Mail, Lock, ArrowRight, ArrowLeft, RefreshCw, KeyRound, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { GoogleAuthButton } from '../GoogleAuthButton'

interface LoginFormProps {
  onGoogleAuth: () => void
  isGoogleLoading: boolean
  onSwitchToRegister: () => void
  onSwitchToForgot: (currentEmail: string) => void
  initialEmail?: string
  initialPassword?: string
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onGoogleAuth,
  isGoogleLoading,
  onSwitchToRegister,
  onSwitchToForgot,
  initialEmail = '',
  initialPassword = '',
}) => {
  const { login, loginWithOtp, isLoading } = useAuth()
  const { close } = useAuthModalStore()

  // Chế độ đăng nhập: 'password' (mật khẩu) hoặc 'otp' (mã OTP qua email)
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password')
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request')

  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState(initialPassword)
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail)
    if (initialPassword) setPassword(initialPassword)
  }, [initialEmail, initialPassword])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // Đăng nhập bằng Mật khẩu
  const handlePasswordLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      toast.success('Đăng nhập thành công! Chào mừng bạn quay trở lại.')
      close()
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
      )
    }
  }

  // Bước 1 luồng OTP: Yêu cầu gửi mã OTP đăng nhập qua email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.')
      return
    }

    setIsSendingOtp(true)
    try {
      await authService.sendLoginOtp(email.trim())
      setOtpStep('verify')
      setCountdown(60)
      toast.success(`Mã OTP đã được gửi tới email ${email.trim()}`)
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Không thể gửi mã OTP. Vui lòng kiểm tra lại email.'
      )
    } finally {
      setIsSendingOtp(false)
    }
  }

  // Gửi lại mã OTP đăng nhập
  const handleResendOtp = async () => {
    if (countdown > 0) return
    setError(null)
    setIsSendingOtp(true)
    try {
      await authService.sendLoginOtp(email.trim())
      setCountdown(60)
      toast.success('Đã gửi lại mã OTP mới qua email!')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Lỗi gửi lại mã OTP.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  // Bước 2 luồng OTP: Xác thực mã OTP và đăng nhập
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!otp || otp.trim().length !== 6) {
      setError('Vui lòng nhập đúng mã OTP gồm 6 chữ số.')
      return
    }

    setIsVerifyingOtp(true)
    try {
      await loginWithOtp(email.trim(), otp.trim())
      toast.success('Đăng nhập bằng mã OTP thành công!')
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

  return (
    <div className="flex flex-col justify-center min-h-[500px] animate-in fade-in duration-300">
      <div className="text-center mb-5">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
          {loginMode === 'password'
            ? 'Đăng nhập'
            : otpStep === 'request'
            ? 'Đăng nhập bằng Email OTP'
            : 'Xác thực mã OTP'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
          {loginMode === 'password'
            ? 'Chào mừng bạn quay trở lại với Pickleball Club'
            : otpStep === 'request'
            ? 'Đăng nhập an toàn không cần nhớ mật khẩu'
            : `Nhập mã 6 chữ số đã gửi tới ${email}`}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/15 p-3 text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/30 mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* --- CHẾ ĐỘ 1: ĐĂNG NHẬP BẰNG MẬT KHẨU --- */}
      {loginMode === 'password' && (
        <form onSubmit={handlePasswordLoginSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label
              htmlFor="login-email"
              className="text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              Email
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tenban@example.com"
                className="pl-10 h-10.5 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="login-password"
                className="text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Mật khẩu
              </Label>
              <button
                type="button"
                onClick={() => onSwitchToForgot(email)}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 h-10.5 rounded-xl text-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 mt-1 rounded-xl font-semibold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer flex items-center justify-center gap-2"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>

          {/* Nút chuyển sang đăng nhập bằng OTP */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setLoginMode('otp')
                setOtpStep('request')
                setError(null)
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Đăng nhập nhanh bằng mã OTP qua Email</span>
            </button>
          </div>
        </form>
      )}

      {/* --- CHẾ ĐỘ 2: ĐĂNG NHẬP BẰNG OTP (BƯỚC 1 - GỬI OTP) --- */}
      {loginMode === 'otp' && otpStep === 'request' && (
        <form onSubmit={handleRequestOtp} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label
              htmlFor="login-otp-email"
              className="text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              Email tài khoản của bạn
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <Input
                id="login-otp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tenban@example.com"
                className="pl-10 h-10.5 rounded-xl text-sm"
              />
            </div>
            <p className="text-[11px] text-slate-400 pt-0.5">
              Hệ thống sẽ gửi mã xác thực 6 chữ số đến email này để bạn đăng nhập ngay.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-11 mt-1 rounded-xl font-semibold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer flex items-center justify-center gap-2"
            disabled={isSendingOtp}
          >
            {isSendingOtp ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Đang gửi mã OTP...</span>
              </>
            ) : (
              <>
                <span>Gửi mã OTP đăng nhập</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setLoginMode('password')
                setError(null)
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-600 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại đăng nhập bằng mật khẩu</span>
            </button>
          </div>
        </form>
      )}

      {/* --- CHẾ ĐỘ 2: ĐĂNG NHẬP BẰNG OTP (BƯỚC 2 - NHẬP OTP) --- */}
      {loginMode === 'otp' && otpStep === 'verify' && (
        <form onSubmit={handleVerifyOtpSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="login-otp-input"
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
              id="login-otp-input"
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
            className="w-full h-11 mt-1 rounded-xl font-semibold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer flex items-center justify-center gap-2"
            disabled={isVerifyingOtp || isLoading}
          >
            {isVerifyingOtp || isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <>
                <span>Xác nhận & Đăng nhập</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setOtpStep('request')
                setError(null)
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-600 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Đổi email khác</span>
            </button>
          </div>
        </form>
      )}

      {/* Google Sign-in Divider & Button */}
      <div className="relative flex items-center my-3.5">
        <div className="flex-grow border-t border-slate-200 dark:border-slate-700/70"></div>
        <span className="flex-shrink-0 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider">
          Hoặc
        </span>
        <div className="flex-grow border-t border-slate-200 dark:border-slate-700/70"></div>
      </div>

      <div className="space-y-2">
        <GoogleAuthButton
          label="Tiếp tục với tài khoản Google"
          loadingLabel="Đang mở Google..."
          isLoading={isGoogleLoading}
          disabled={isLoading || isSendingOtp || isVerifyingOtp}
          onClick={onGoogleAuth}
        />
      </div>

      <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-300">
        Bạn chưa có tài khoản?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
        >
          Tạo tài khoản mới
        </button>
      </p>
    </div>
  )
}
