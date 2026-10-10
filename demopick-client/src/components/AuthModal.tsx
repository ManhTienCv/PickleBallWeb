import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModalStore } from '@/stores/useAuthModalStore'
import { authService } from '@/services/auth.service'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import PickleballLogo from '@/components/PickleballLogo'
import { toast } from 'sonner'
import { LoginForm } from './auth/views/LoginForm'
import { RegisterForm } from './auth/views/RegisterForm'
import { ForgotPasswordForm } from './auth/views/ForgotPasswordForm'
import { ResetPasswordForm } from './auth/views/ResetPasswordForm'
import { GoogleCompleteForm } from './auth/views/GoogleCompleteForm'

export function AuthModal() {
  const { isOpen, view, close, setView } = useAuthModalStore()
  const { setSession } = useAuth()

  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Pre-filled state between views
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')

  // Google Flow State
  const [selectedGoogleEmail, setSelectedGoogleEmail] = useState('')
  const [googleDisplayName, setGoogleDisplayName] = useState('')
  const [googlePhone, setGooglePhone] = useState('')
  const [googleAvatar, setGoogleAvatar] = useState('')
  const [googleId, setGoogleId] = useState('')
  const [googleAccessToken, setGoogleAccessToken] = useState('')
  const [googlePreviousView, setGooglePreviousView] = useState<'login' | 'register'>('login')

  // OTP Countdown timer
  const [otpCountdown, setOtpCountdown] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [otpCountdown])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close()
    }
  }

  // --- Kích hoạt luồng xác thực Google OAuth (accounts.google.com popup) ---
  const handleGoogleOAuth = (fromView: 'login' | 'register') => {
    setIsGoogleLoading(true)
    setGooglePreviousView(fromView)

    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '906368230840-urh61jjbk523u2mqjhr1dn1dbkcdc7n7.apps.googleusercontent.com'

    const triggerGIS = () => {
      const google = (window as any).google
      if (!google?.accounts?.oauth2) {
        setIsGoogleLoading(false)
        toast.error('Thư viện Google Identity Services chưa tải xong hoặc bị chặn bởi trình duyệt.')
        return
      }

      try {
        let isHandled = false

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
              toast.error('Trình duyệt đã chặn cửa sổ Popup. Vui lòng cho phép mở popup.')
            } else {
              toast.info('Đã hủy thao tác với tài khoản Google.')
            }
          },
          callback: async (tokenResponse: any) => {
            isHandled = true
            window.removeEventListener('focus', handleWindowFocus)

            if (tokenResponse.error) {
              setIsGoogleLoading(false)
              if (
                tokenResponse.error === 'popup_closed_by_user' ||
                tokenResponse.error === 'access_denied'
              ) {
                toast.info('Bạn đã đóng cửa sổ chọn tài khoản Google.')
                return
              }
              toast.error(`Lỗi xác thực Google: ${tokenResponse.error}`)
              return
            }

            try {
              const accessToken = tokenResponse.access_token
              setGoogleAccessToken(accessToken)

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

              // 1-Chạm: Đăng nhập hoặc tạo mới tức thì
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
            } catch (fetchErr: any) {
              toast.error(fetchErr.message || 'Lỗi khi đồng bộ dữ liệu hồ sơ Google.')
            } finally {
              setIsGoogleLoading(false)
            }
          },
        })

        client.requestAccessToken({ prompt: 'select_account' })
      } catch (initErr: any) {
        setIsGoogleLoading(false)
        toast.error(initErr.message || 'Khởi tạo Google OAuth thất bại.')
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
          toast.error('Không thể kết nối đến máy chủ Google (accounts.google.com). Vui lòng thử lại.')
        }
      }, 250)
    }
  }

  const handleResendOtp = async () => {
    try {
      const res = await authService.requestPasswordResetOTP(forgotEmail)
      setOtpCountdown(60)
      toast.success(res.message || 'Mã OTP đã được gửi lại đến email của bạn!')
    } catch (err: any) {
      toast.error(err.message || 'Không thể gửi lại mã OTP.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-[860px] p-0 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 shadow-2xl overflow-hidden focus:outline-none">
        <DialogTitle className="sr-only">Cửa sổ Xác thực DemoPick</DialogTitle>
        <DialogDescription className="sr-only">
          Đăng nhập, đăng ký hoặc đặt lại mật khẩu
        </DialogDescription>

        <div className="grid grid-cols-1 md:grid-cols-5 min-h-[580px]">
          {/* Left Column - Image & Branding (Desktop) */}
          <div className="hidden md:flex md:col-span-2 relative bg-slate-900 flex-col justify-between p-8 overflow-hidden select-none">
            <img
              src="/images/pickleball_court.jpg"
              alt="Sân Pickleball Chuẩn Thi Đấu"
              onError={(e) => {
                const target = e.currentTarget
                target.onerror = null
                target.style.display = 'none'
              }}
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
            </div>
          </div>

          {/* Right Column - Sub-views Container */}
          <div className="col-span-1 md:col-span-3 relative overflow-hidden bg-white dark:bg-slate-900 flex flex-col justify-center p-6 sm:p-9">
            {view === 'login' && (
              <LoginForm
                initialEmail={loginEmail}
                initialPassword={loginPassword}
                isGoogleLoading={isGoogleLoading}
                onGoogleAuth={() => handleGoogleOAuth('login')}
                onSwitchToRegister={() => setView('register')}
                onSwitchToForgot={(currentEmail) => {
                  setForgotEmail(currentEmail)
                  setView('forgot')
                }}
              />
            )}

            {view === 'register' && (
              <RegisterForm
                isGoogleLoading={isGoogleLoading}
                onGoogleAuth={() => handleGoogleOAuth('register')}
                onSwitchToLogin={() => setView('login')}
              />
            )}

            {view === 'forgot' && (
              <ForgotPasswordForm
                initialEmail={forgotEmail}
                onSwitchToLogin={() => setView('login')}
                onOtpSent={(email) => {
                  setForgotEmail(email)
                  setOtpCountdown(60)
                  setView('reset')
                }}
              />
            )}

            {view === 'reset' && (
              <ResetPasswordForm
                email={forgotEmail}
                countdown={otpCountdown}
                onResendOtp={handleResendOtp}
                onResetSuccess={(email, newPass) => {
                  setLoginEmail(email)
                  setLoginPassword(newPass)
                  setView('login')
                }}
                onCancel={() => setView('login')}
              />
            )}

            {view === 'google_complete' && (
              <GoogleCompleteForm
                email={selectedGoogleEmail}
                avatar={googleAvatar}
                initialName={googleDisplayName}
                initialPhone={googlePhone}
                googleId={googleId}
                googleAccessToken={googleAccessToken}
                googlePreviousView={googlePreviousView}
                onChangeAccount={() => handleGoogleOAuth(googlePreviousView)}
                onBack={() => setView(googlePreviousView)}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
