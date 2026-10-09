import React, { useState } from 'react'
import { authService } from '@/services/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, RefreshCw, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

interface ResetPasswordFormProps {
  email: string
  countdown: number
  onResendOtp: () => Promise<void>
  onResetSuccess: (email: string, newPassword: string) => void
  onCancel: () => void
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  email,
  countdown,
  onResendOtp,
  onResetSuccess,
  onCancel,
}) => {
  const [resetOtp, setResetOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConf, setNewPasswordConf] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      await authService.resetPasswordWithOTP(email, resetOtp.trim(), newPassword)
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.')
      onResetSuccess(email, newPassword)
    } catch (err: any) {
      setError(err.message || 'Xác thực OTP hoặc cập nhật mật khẩu thất bại.')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="flex flex-col justify-center min-h-[500px] animate-in fade-in duration-300">
      <div className="text-center mb-4">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-1 border border-emerald-100 dark:border-emerald-800">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
          Xác thực OTP & Đặt mật khẩu mới
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
          Mã 6 chữ số đã được gửi tới <strong>{email}</strong>
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
                onClick={onResendOtp}
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
            <Label
              htmlFor="new-pass"
              className="text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
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
            <Label
              htmlFor="new-pass-conf"
              className="text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
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
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Hủy & Quay lại Đăng nhập</span>
        </button>
      </div>
    </div>
  )
}
