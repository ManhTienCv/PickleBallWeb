import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModalStore } from '@/stores/useAuthModalStore'
import { authService } from '@/services/auth.service'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Mail, Lock, User, Phone, ArrowRight, ArrowLeft, ShieldCheck, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react'
import PickleballLogo from '@/components/PickleballLogo'
import { toast } from 'sonner'

export function AuthModal() {
  const { isOpen, view, close, setView } = useAuthModalStore()
  const { login, register, isLoading, setSession } = useAuth()

  const [error, setError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register Form State
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })

  // Google Flow State
  const [selectedGoogleEmail, setSelectedGoogleEmail] = useState('')
  const [googleDisplayName, setGoogleDisplayName] = useState('')
  const [googlePhone, setGooglePhone] = useState('')
  const [googleAvatar, setGoogleAvatar] = useState('')
  const [googleId, setGoogleId] = useState('')
  const [googleAccessToken, setGoogleAccessToken] = useState('')
  const [googlePreviousView, setGooglePreviousView] = useState<'login' | 'register'>('login')

  // Forgot & Reset Password OTP State
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetOtp, setResetOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConf, setNewPasswordConf] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(0)

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [otpCountdown])

  // Handle Close
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close()
      setError(null)
    }
  }

  // --- Kích hoạt luồng xác thực Google thực tế (accounts.google.com popup) ---
  const handleGoogleOAuth = (fromView: 'login' | 'register') => {
    setError(null)
    setIsGoogleLoading(true)
    setGooglePreviousView(fromView)

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '906368230840-urh61jjbk523u2mqjhr1dn1dbkcdc7n7.apps.googleusercontent.com'

    const triggerGIS = () => {
      const google = (window as any).google
      if (!google?.accounts?.oauth2) {
        setIsGoogleLoading(false)
        setError('Thư viện Google Identity Services chưa tải xong hoặc bị chặn bởi trình duyệt. Vui lòng tải lại trang.')
        return
      }

      try {
        let isHandled = false

        // Lắng nghe sự kiện người dùng đóng popup và quay lại tab chính
        const handleWindowFocus = () => {
          setTimeout(() => {
            if (!isHandled) {
              setIsGoogleLoading((loading) => {
                if (loading) {
                  toast.info('Bạn đã đóng cửa sổ chọn tài khoản Google.')
                  return false
                }
                return false
              })
            }
          }, 800)
        }
        window.addEventListener('focus', handleWindowFocus, { once: true })

        const client = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          prompt: 'select_account',
          error_callback: (nonOAuthError: any) => {
            isHandled = true
            window.removeEventListener('focus', handleWindowFocus)
            setIsGoogleLoading(false)
            if (nonOAuthError?.type === 'popup_closed') {
              toast.info('Bạn đã đóng cửa sổ chọn tài khoản Google.')
            } else if (nonOAuthError?.type === 'popup_failed_to_open') {
              setError('Trình duyệt đã chặn cửa sổ Popup. Vui lòng cho phép mở popup để tiếp tục với Google.')
            } else {
              toast.info('Đã hủy thao tác với tài khoản Google.')
            }
          },
          callback: async (tokenResponse: any) => {
            isHandled = true
            window.removeEventListener('focus', handleWindowFocus)

            if (tokenResponse.error) {
              setIsGoogleLoading(false)
              if (tokenResponse.error === 'popup_closed_by_user' || tokenResponse.error === 'access_denied') {
                toast.info('Bạn đã đóng cửa sổ chọn tài khoản Google.')
                return
              }
              setError(`Lỗi xác thực Google: ${tokenResponse.error}`)
              return
            }

            try {
              const accessToken = tokenResponse.access_token
              setGoogleAccessToken(accessToken)

              // Lấy profile thực tế từ Google OAuth API
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              })
              const profile = await res.json()
              if (!profile || !profile.email) {
                throw new Error('Không lấy được thông tin email từ tài khoản Google.')
              }

              const email = profile.email.toLowerCase().trim()
              const name = profile.name || profile.given_name || email.split('@')[0]
              const picture = profile.picture || ''
              const gid = profile.sub || ''

              setSelectedGoogleEmail(email)
              setGoogleDisplayName(name)
              setGoogleAvatar(picture)
              setGoogleId(gid)
              setGooglePhone(regData.phone || '')

              // Đăng nhập / Đăng ký 1-Chạm tức thì (One-Click Google Authentication)
              // Backend tự động nhận diện: đã có tài khoản thì đăng nhập ngay, tài khoản mới thì tự tạo tài khoản
              const session = await authService.loginWithGoogle({
                access_token: accessToken,
                email,
                name,
                picture,
                googleId: gid,
              })
              setSession(session.token, session.user)
              toast.success(`Đăng nhập Google thành công! Chào mừng ${session.user.name}.`)
              close()
              return
            } catch (fetchErr: any) {
              setError(fetchErr.message || 'Lỗi khi đồng bộ dữ liệu hồ sơ Google.')
            } finally {
              setIsGoogleLoading(false)
            }
          },
        })

        client.requestAccessToken({ prompt: 'select_account' })
      } catch (initErr: any) {
        setIsGoogleLoading(false)
        setError(initErr.message || 'Khởi tạo Google OAuth thất bại.')
      }
    }

    if ((window as any).google?.accounts?.oauth2) {
      triggerGIS()
    } else {
      let attempts = 0
      const interval = setInterval(() => {
        attempts++
        if ((window as any).google?.accounts?.oauth2) {
          clearInterval(interval)
          triggerGIS()
        } else if (attempts > 12) {
          clearInterval(interval)
          setIsGoogleLoading(false)
          setError('Không thể kết nối đến máy chủ Google (accounts.google.com). Vui lòng thử lại.')
        }
      }, 250)
    }
  }

  // --- Hoàn tất đăng ký / đăng nhập với Google (Xác nhận tên hiển thị) ---
  const handleCompleteGoogleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!googleDisplayName.trim()) {
      setError('Vui lòng nhập họ và tên hiển thị.')
      return
    }
    setError(null)
    setIsGoogleLoading(true)
    try {
      const profile = {
        access_token: googleAccessToken || undefined,
        email: selectedGoogleEmail,
        name: googleDisplayName.trim(),
        phone: googlePhone.trim() || undefined,
        picture: googleAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        googleId: googleId || `google_${Date.now()}`,
      }
      const session = await authService.loginWithGoogle(profile)
      setSession(session.token, session.user)
      toast.success(`Đăng ký Google thành công! Chào mừng ${session.user.name}.`)
      close()
    } catch (err: any) {
      setError(err.message || 'Không thể xác thực với tài khoản Google.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  // --- Login Logic ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(loginEmail, loginPassword)
      toast.success('Đăng nhập thành công! Chào mừng bạn quay trở lại.')
      close()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
    }
  }

  // --- Register Logic ---
  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegData({ ...regData, [e.target.name]: e.target.value })
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (regData.password !== regData.password_confirmation) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    try {
      await register(regData)
      toast.success('Đăng ký tài khoản thành công!')
      close()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.')
    }
  }

  // --- Forgot Password Request OTP ---
  const handleRequestOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!forgotEmail) {
      setError('Vui lòng nhập địa chỉ email.')
      return
    }
    setIsSendingOtp(true)
    try {
      const res = await authService.requestPasswordResetOTP(forgotEmail)
      setOtpCountdown(60)
      setView('reset')
      toast.success(res.message || 'Mã OTP đã được gửi đến email của bạn!')
    } catch (err: any) {
      setError(err.message || 'Không thể gửi mã OTP. Vui lòng thử lại.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  // --- Reset Password Submit ---
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!resetOtp || resetOtp.trim().length !== 6) {
      setError('Vui lòng nhập mã OTP gồm 6 chữ số.')
      return
    }
    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có tối thiểu 8 ký tự.')
      return
    }
    if (newPassword !== newPasswordConf) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setIsResetting(true)
    try {
      await authService.resetPasswordWithOTP(forgotEmail, resetOtp, newPassword)
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.')
      setLoginEmail(forgotEmail)
      setLoginPassword(newPassword)
      setView('login')
    } catch (err: any) {
      setError(err.message || 'Xác thực OTP hoặc cập nhật mật khẩu thất bại.')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-[860px] p-0 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 shadow-2xl overflow-hidden focus:outline-none">
        <DialogTitle className="sr-only">Cửa sổ Xác thực DemoPick</DialogTitle>
        <DialogDescription className="sr-only">Đăng nhập, đăng ký hoặc đặt lại mật khẩu</DialogDescription>

        <div className="grid grid-cols-1 md:grid-cols-5 min-h-[580px]">
          {/* Left Column - Image & Branding (Desktop) */}
          <div className="hidden md:flex md:col-span-2 relative bg-slate-900 flex-col justify-between p-8 overflow-hidden select-none">
            <img
              src="/images/pickleball_court.jpg"
              alt="Sân Pickleball Chuẩn Thi Đấu"
              className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-slate-900/10" />

            {/* Header Brand */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/20 text-white shadow-sm">
                <PickleballLogo size={20} />
                <span className="font-bold text-sm tracking-wide">Pickleball</span>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 space-y-3">
              <h3 className="text-white font-bold text-xl leading-tight">
                {view === 'login' && 'Trọn vẹn đam mê trên từng đường bóng'}
                {view === 'register' && 'Tạo tài khoản DemoPick ngay hôm nay'}
                {view === 'forgot' && 'Khôi phục quyền truy cập tài khoản'}
                {view === 'reset' && 'Bảo vệ tài khoản với mật khẩu mới'}
                {view === 'google_complete' && 'Thiết lập tên hiển thị tài khoản'}
              </h3>
              <p className="text-slate-200/90 text-xs leading-relaxed">
                Hệ thống tự động đồng bộ lịch sân trực tiếp, vận chuyển GHN Express và thanh toán trực tuyến bảo mật.
              </p>

              <div className="pt-2 flex items-center gap-4 text-xs text-slate-300/80 border-t border-white/15">
              </div>
            </div>
          </div>

          {/* Right Column - Sliding View Container */}
          <div className="col-span-1 md:col-span-3 relative overflow-hidden bg-white dark:bg-slate-900 flex flex-col justify-center p-6 sm:p-9">

            {/* VIEW 1: LOGIN */}
            {view === 'login' && (
              <div className="flex flex-col justify-center min-h-[500px] animate-in fade-in duration-300">
                <div className="text-center mb-5">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Đăng nhập</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                    Chào mừng bạn quay trở lại với DemoPick
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/15 p-3 text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/30 mb-4">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Email
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        placeholder="tenban@example.com"
                        className="pl-10 h-10.5 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Mật khẩu
                      </Label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(loginEmail)
                          setView('forgot')
                          setError(null)
                        }}
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
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
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
                </form>

                {/* Google Sign-in Button */}
                <div className="relative flex items-center my-3.5">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700/70"></div>
                  <span className="flex-shrink-0 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider">Hoặc</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700/70"></div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleGoogleOAuth('login')}
                    disabled={isGoogleLoading || isLoading}
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-all text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    {isGoogleLoading && googlePreviousView === 'login' ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    ) : (
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    )}
                    <span>{isGoogleLoading && googlePreviousView === 'login' ? 'Đang mở Google...' : 'Tiếp tục với tài khoản Google'}</span>
                  </button>
                </div>

                <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-300">
                  Bạn chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => { setView('register'); setError(null) }}
                    className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Tạo tài khoản mới
                  </button>
                </p>
              </div>
            )}

            {/* VIEW 2: REGISTER */}
            {view === 'register' && (
              <div className="flex flex-col justify-center min-h-[500px] animate-in fade-in duration-300">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Tạo tài khoản</h2>
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

                <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="reg-name" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
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
                      <Label htmlFor="reg-email" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
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
                      <Label htmlFor="reg-phone" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
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
                      <Label htmlFor="reg-password" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
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
                          placeholder="Tối thiểu 8 ký tự"
                          className="pl-10 h-10 rounded-xl text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="reg-password-conf" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
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
                    className="w-full h-11 mt-1 rounded-xl font-semibold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
                    {!isLoading && <ArrowRight className="ml-1.5 h-4 w-4" />}
                  </Button>
                </form>

                {/* Google Sign-up Button */}
                <div className="relative flex items-center my-3">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700/70"></div>
                  <span className="flex-shrink-0 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider">Hoặc</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700/70"></div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleGoogleOAuth('register')}
                    disabled={isGoogleLoading || isLoading}
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-all text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    {isGoogleLoading && googlePreviousView === 'register' ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    ) : (
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    )}
                    <span>{isGoogleLoading && googlePreviousView === 'register' ? 'Đang mở Google...' : 'Đăng ký nhanh bằng tài khoản Google'}</span>
                  </button>
                </div>

                <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-300">
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => { setView('login'); setError(null) }}
                    className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              </div>
            )}

            {/* VIEW 3: FORGOT PASSWORD (STEP 1 - REQUEST OTP) */}
            {view === 'forgot' && (
              <div className="flex flex-col justify-center min-h-[500px] animate-in fade-in duration-300">
                <div className="text-center mb-5">
                  <div className="inline-flex p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-2 border border-emerald-100 dark:border-emerald-800">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Quên mật khẩu</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 max-w-sm mx-auto">
                    Nhập địa chỉ email tài khoản của bạn. Chúng tôi sẽ gửi mã OTP 6 chữ số an toàn qua thư điện tử.
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/15 p-3 text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/30 mb-4">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleRequestOtpSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="forgot-email" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Địa chỉ Email đăng ký
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input
                        id="forgot-email"
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        placeholder="tenban@example.com"
                        className="pl-10 h-11 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl font-semibold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer"
                    disabled={isSendingOtp}
                  >
                    {isSendingOtp ? 'Đang gửi mã OTP...' : 'Gửi mã xác thực OTP'}
                    {!isSendingOtp && <ArrowRight className="ml-1.5 h-4 w-4" />}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => { setView('login'); setError(null) }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại Đăng nhập</span>
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 4: RESET PASSWORD (STEP 2 - ENTER OTP & NEW PASSWORD) */}
            {view === 'reset' && (
              <div className="flex flex-col justify-center min-h-[500px] animate-in fade-in duration-300">
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-1 border border-emerald-100 dark:border-emerald-800">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Xác thực OTP & Đặt mật khẩu mới</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                    Mã 6 chữ số đã được gửi tới <strong>{forgotEmail}</strong>
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/15 p-3 text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/30 mb-3">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="otp-input" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Mã xác thực OTP (6 số)
                      </Label>
                      {otpCountdown > 0 ? (
                        <span className="text-[11px] font-mono font-medium text-slate-400">
                          Gửi lại sau {otpCountdown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleRequestOtpSubmit}
                          className="text-[11px] font-bold text-emerald-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" /> Gửi lại mã
                        </button>
                      )}
                    </div>
                    <Input
                      id="otp-input"
                      type="text"
                      maxLength={6}
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      required
                      className="h-11 rounded-xl text-center font-mono text-lg font-black tracking-widest text-emerald-700 bg-emerald-50/40 border-emerald-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="new-pass" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Mật khẩu mới
                      </Label>
                      <Input
                        id="new-pass"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="Tối thiểu 8 ký tự"
                        className="h-10 rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="new-pass-conf" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Nhập lại mật khẩu
                      </Label>
                      <Input
                        id="new-pass-conf"
                        type="password"
                        value={newPasswordConf}
                        onChange={(e) => setNewPasswordConf(e.target.value)}
                        required
                        placeholder="Xác nhận mật khẩu"
                        className="h-10 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 mt-1 rounded-xl font-semibold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer"
                    disabled={isResetting}
                  >
                    {isResetting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu mới'}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => { setView('login'); setError(null) }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Hủy & Quay lại Đăng nhập</span>
                  </button>
                </div>
              </div>
            )}

            {/* VIEW: GOOGLE REGISTRATION FORM (XÁC NHẬN / ĐẶT TÊN HIỂN THỊ KHI ĐĂNG KÝ) */}
            {view === 'google_complete' && (
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
                    {googleAvatar ? (
                      <img
                        src={googleAvatar}
                        alt="Google avatar"
                        className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-600 shadow-xs"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-600 shadow-xs">
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      </div>
                    )}
                    <div className="truncate">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate">
                        {selectedGoogleEmail}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Tài khoản Google hợp lệ
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGoogleOAuth(googlePreviousView)}
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
                    <Label htmlFor="google-name" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Tên hiển thị của bạn <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <Input
                        id="google-name"
                        type="text"
                        value={googleDisplayName}
                        onChange={(e) => setGoogleDisplayName(e.target.value)}
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
                    <Label htmlFor="google-phone" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Số điện thoại liên hệ <span className="text-slate-400 font-normal">(Khuyến khích)</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <Input
                        id="google-phone"
                        type="tel"
                        value={googlePhone}
                        onChange={(e) => setGooglePhone(e.target.value)}
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
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? (
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
                    onClick={() => { setView(googlePreviousView); setError(null) }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại {googlePreviousView === 'register' ? 'Tạo tài khoản' : 'Đăng nhập'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
