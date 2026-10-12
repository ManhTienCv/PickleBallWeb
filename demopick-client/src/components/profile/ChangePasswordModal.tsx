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
import { Lock, Eye, EyeOff, CheckCircle2, KeyRound, Mail, RefreshCw, ArrowLeft, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'
import { useAuth } from '@/contexts/AuthContext'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { user } = useAuth()

  // Chế độ: 'change' (đổi bằng mật khẩu hiện tại) | 'forgot_otp' (quên pass, đặt lại bằng mã OTP email)
  const [mode, setMode] = useState<'change' | 'forgot_otp'>('change')

  // State cho Form 1: Đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // State cho Form 2: Quên mật khẩu & Đặt lại qua OTP
  const [otpCode, setOtpCode] = useState('')
  const [resetNewPassword, setResetNewPassword] = useState('')
  const [resetConfirmPassword, setResetConfirmPassword] = useState('')
  const [showResetNewPassword, setShowResetNewPassword] = useState(false)
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [otpSent, setOtpSent] = useState(false)
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null)

  // Đếm ngược gửi lại OTP
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleClose = () => {
    setMode('change')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)

    setOtpCode('')
    setResetNewPassword('')
    setResetConfirmPassword('')
    setShowResetNewPassword(false)
    setShowResetConfirmPassword(false)
    setOtpSent(false)
    setCountdown(0)
    setDemoOtpHint(null)

    onClose()
  }

  // Chuyển sang form Quên Mật Khẩu và tự động gửi mã OTP
  const handleSwitchToForgot = async () => {
    setMode('forgot_otp')
    const emailToUse = user?.email
    if (!emailToUse) {
      toast.error('Không tìm thấy thông tin email của tài khoản.')
      return
    }

    if (!otpSent) {
      setIsSendingOtp(true)
      try {
        const res = await authService.requestPasswordResetOTP(emailToUse)
        setOtpSent(true)
        setCountdown(60)
        if (res?.demoOtp) {
          setDemoOtpHint(res.demoOtp)
        }
        toast.success(`Mã OTP đã được gửi tới email ${emailToUse}`)
      } catch (err: any) {
        toast.error(err.message || 'Không thể gửi mã OTP. Vui lòng thử lại.')
      } finally {
        setIsSendingOtp(false)
      }
    }
  }

  // Gửi lại mã OTP đặt lại mật khẩu
  const handleResendResetOtp = async () => {
    if (countdown > 0) return
    const emailToUse = user?.email
    if (!emailToUse) {
      toast.error('Không tìm thấy thông tin email của tài khoản.')
      return
    }

    setIsSendingOtp(true)
    try {
      const res = await authService.requestPasswordResetOTP(emailToUse)
      setCountdown(60)
      if (res?.demoOtp) {
        setDemoOtpHint(res.demoOtp)
      }
      toast.success('Đã gửi lại mã OTP mới qua email!')
    } catch (err: any) {
      toast.error(err.message || 'Lỗi gửi lại mã OTP.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  // Đánh giá độ mạnh mật khẩu
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: '' }
    let score = 0
    if (pass.length >= 6) score += 1
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1

    if (score === 1) return { score: 1, text: 'Yếu', color: 'bg-rose-500 text-rose-500' }
    if (score === 2) return { score: 2, text: 'Trung bình', color: 'bg-amber-500 text-amber-500' }
    return { score: 3, text: 'Rất mạnh', color: 'bg-emerald-500 text-emerald-500' }
  }

  const changeStrength = getPasswordStrength(newPassword)
  const resetStrength = getPasswordStrength(resetNewPassword)

  // Submit Form 1: Đổi mật khẩu thông thường
  const handleChangeSubmit = async (e: React.FormEvent) => {
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
      toast.success('Đổi mật khẩu thành công! Mật khẩu mới của bạn đã có hiệu lực.')
      handleClose()
    } catch (err: any) {
      toast.error(err.message || 'Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Submit Form 2: Đặt lại mật khẩu bằng mã OTP
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailToUse = user?.email
    if (!emailToUse) {
      toast.error('Không tìm thấy email tài khoản.')
      return
    }

    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error('Vui lòng nhập đúng mã OTP gồm 6 chữ số.')
      return
    }

    if (resetNewPassword.length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự.')
      return
    }

    if (resetNewPassword !== resetConfirmPassword) {
      toast.error('Mật khẩu xác nhận không trùng khớp.')
      return
    }

    setIsResettingPassword(true)
    try {
      await authService.resetPasswordWithOTP(emailToUse, otpCode.trim(), resetNewPassword)
      toast.success('🎉 Đặt lại mật khẩu thành công! Tài khoản của bạn đã được cập nhật mật khẩu mới an toàn.')
      handleClose()
    } catch (err: any) {
      toast.error(err.message || 'Mã OTP không chính xác hoặc đã hết hạn.')
    } finally {
      setIsResettingPassword(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md sm:rounded-3xl p-6 border border-slate-200 dark:border-border bg-white dark:bg-card shadow-2xl font-sans text-card-foreground">
        {/* ================= HEADER ================= */}
        <DialogHeader className="text-center sm:text-left space-y-1.5">
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
              {mode === 'change' ? <Lock className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100">
                {mode === 'change' ? 'Đổi Mật Khẩu Tài Khoản' : 'Đặt Lại Mật Khẩu (Quên Mật Khẩu)'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'change'
                  ? 'Cập nhật mật khẩu mới để tăng cường an toàn tuyệt đối'
                  : 'Xác thực qua mã OTP email để tạo mật khẩu mới an toàn'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ================= FORM 1: ĐỔI MẬT KHẨU KHI NHỚ PASS CŨ ================= */}
        {mode === 'change' && (
          <form onSubmit={handleChangeSubmit} className="space-y-4 pt-2">
            {/* Current password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="currPass" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Mật khẩu hiện tại <span className="text-rose-500">*</span>
                </Label>
                <button
                  type="button"
                  onClick={handleSwitchToForgot}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>

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
                    <span className={`font-bold ${changeStrength.color.split(' ')[1]}`}>
                      {changeStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full transition-all ${changeStrength.score >= 1 ? changeStrength.color.split(' ')[0] : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 rounded-full transition-all ${changeStrength.score >= 2 ? changeStrength.color.split(' ')[0] : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 rounded-full transition-all ${changeStrength.score >= 3 ? changeStrength.color.split(' ')[0] : 'bg-transparent'}`} />
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
                onClick={handleClose}
                className="rounded-xl text-xs font-bold h-11 px-4 border-slate-200 dark:border-border cursor-pointer"
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
        )}

        {/* ================= FORM 2: ĐẶT LẠI MẬT KHẨU QUA MÃ OTP (KHI QUÊN PASS) ================= */}
        {mode === 'forgot_otp' && (
          <form onSubmit={handleResetSubmit} className="space-y-4 pt-2">
            {/* Hộp thông báo gửi OTP */}
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-xs leading-relaxed">
                <span className="text-slate-600 dark:text-slate-300">Gửi mã OTP về: </span>
                <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                  {user?.email || 'email tài khoản'}
                </strong>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Mã OTP 6 số đã được gửi. Vui lòng kiểm tra <strong>Hộp thư đến</strong> hoặc thư mục <strong>Thư rác (Spam)</strong>.
                </p>
              </div>
            </div>

            {/* Hint mã OTP nếu nhận được từ máy chủ */}
            {demoOtpHint && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 text-[11px]">
                <span className="text-amber-800 dark:text-amber-300">
                  Mã xác thực gửi tới bạn: <strong className="font-mono text-emerald-700 dark:text-emerald-400 text-xs font-black">{demoOtpHint}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setOtpCode(demoOtpHint)}
                  className="font-bold text-emerald-700 dark:text-emerald-400 underline hover:text-emerald-800 cursor-pointer ml-2 shrink-0"
                >
                  Điền nhanh
                </button>
              </div>
            )}

            {/* Ô nhập mã OTP 6 số */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="reset-otp" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Mã xác thực OTP (6 số) <span className="text-rose-500">*</span>
                </Label>
                {countdown > 0 ? (
                  <span className="text-[11px] font-mono font-medium text-slate-400">
                    Gửi lại sau {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendResetOtp}
                    disabled={isSendingOtp}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSendingOtp ? 'animate-spin' : ''}`} />
                    <span>Gửi lại mã OTP</span>
                  </button>
                )}
              </div>
              <Input
                id="reset-otp"
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoFocus
                required
                className="h-11 rounded-xl text-center font-mono text-xl font-black tracking-widest text-emerald-700 bg-emerald-50/40 border-emerald-300 focus:border-emerald-500"
              />
            </div>

            {/* Mật khẩu mới */}
            <div className="space-y-1.5">
              <Label htmlFor="resetNewPass" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Mật khẩu mới <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="resetNewPass"
                  type={showResetNewPassword ? 'text' : 'password'}
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  required
                  className="h-11 rounded-xl text-xs font-medium pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                >
                  {showResetNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {resetNewPassword && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Độ bảo mật:</span>
                    <span className={`font-bold ${resetStrength.color.split(' ')[1]}`}>
                      {resetStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full transition-all ${resetStrength.score >= 1 ? resetStrength.color.split(' ')[0] : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 rounded-full transition-all ${resetStrength.score >= 2 ? resetStrength.color.split(' ')[0] : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 rounded-full transition-all ${resetStrength.score >= 3 ? resetStrength.color.split(' ')[0] : 'bg-transparent'}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Xác nhận lại mật khẩu mới */}
            <div className="space-y-1.5">
              <Label htmlFor="resetConfPass" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Xác nhận lại mật khẩu mới <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="resetConfPass"
                  type={showResetConfirmPassword ? 'text' : 'password'}
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  className="h-11 rounded-xl text-xs font-medium pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                >
                  {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {resetConfirmPassword && (
                <div className="text-[11px] pt-0.5">
                  {resetNewPassword === resetConfirmPassword ? (
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
                onClick={() => setMode('change')}
                className="rounded-xl text-xs font-bold h-11 px-4 border-slate-200 dark:border-border cursor-pointer inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay Lại</span>
              </Button>
              <Button
                type="submit"
                disabled={isResettingPassword || !otpCode || otpCode.length !== 6 || resetNewPassword.length < 6 || resetNewPassword !== resetConfirmPassword}
                className="bg-[#27c372] hover:bg-[#22c55e] text-white font-black rounded-xl text-xs h-11 px-6 shadow-md cursor-pointer flex-1"
              >
                {isResettingPassword ? (
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang cập nhật...</span>
                  </span>
                ) : (
                  'Xác Nhận Đặt Lại Mật Khẩu'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
