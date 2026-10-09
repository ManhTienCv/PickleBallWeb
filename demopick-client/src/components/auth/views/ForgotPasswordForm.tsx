import React, { useState } from 'react'
import { authService } from '@/services/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Mail, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react'
import { toast } from 'sonner'

interface ForgotPasswordFormProps {
  initialEmail?: string
  onSwitchToLogin: () => void
  onOtpSent: (email: string) => void
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  initialEmail = '',
  onSwitchToLogin,
  onOtpSent,
}) => {
  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState<string | null>(null)
  const [isSendingOtp, setIsSendingOtp] = useState(false)

  const handleRequestOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email.')
      return
    }
    setIsSendingOtp(true)
    try {
      const res = await authService.requestPasswordResetOTP(email.trim())
      toast.success(res.message || 'Mã OTP đã được gửi đến email của bạn!')
      onOtpSent(email.trim())
    } catch (err: any) {
      setError(err.message || 'Không thể gửi mã OTP. Vui lòng thử lại.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  return (
    <div className="flex flex-col justify-center min-h-[500px] animate-in fade-in duration-300">
      <div className="text-center mb-5">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-2 border border-emerald-100 dark:border-emerald-800">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
          Quên mật khẩu
        </h2>
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
          <Label
            htmlFor="forgot-email"
            className="text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            Địa chỉ Email đăng ký
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <Input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          onClick={onSwitchToLogin}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại Đăng nhập</span>
        </button>
      </div>
    </div>
  )
}
