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
import { KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'

interface ChangeEmailModalProps {
  isOpen: boolean
  onClose: () => void
  currentEmail?: string
  onEmailUpdated: (updatedUser: any) => void
}

export default function ChangeEmailModal({
  isOpen,
  onClose,
  currentEmail,
  onEmailUpdated,
}: ChangeEmailModalProps) {
  const [newEmail, setNewEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpStep, setOtpStep] = useState<'input_email' | 'input_otp'>('input_email')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleClose = () => {
    setNewEmail('')
    setOtpCode('')
    setOtpStep('input_email')
    setCountdown(0)
    onClose()
  }

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Vui lòng nhập địa chỉ email hợp lệ.')
      return
    }
    if (currentEmail && newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      toast.error('Địa chỉ email mới phải khác với email hiện tại.')
      return
    }

    setIsSendingOtp(true)
    try {
      await authService.sendEmailOtp(newEmail)
      setOtpStep('input_otp')
      setCountdown(60)
      toast.success(`Mã OTP xác thực đã được gửi tới ${newEmail}! Vui lòng kiểm tra hòm thư.`)
    } catch (err: any) {
      toast.error(err.message || 'Không thể gửi mã OTP. Vui lòng thử lại.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error('Vui lòng nhập đúng mã OTP gồm 6 chữ số.')
      return
    }

    setIsVerifyingOtp(true)
    try {
      const updatedUser = await authService.verifyEmailOtp(newEmail, otpCode.trim())
      onEmailUpdated(updatedUser)
      toast.success(`Cập nhật email thành công! Email mới của bạn là: ${newEmail}`)
      handleClose()
    } catch (err: any) {
      toast.error(err.message || 'Mã OTP không chính xác hoặc đã hết hạn.')
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md sm:rounded-3xl p-6 border border-slate-200 dark:border-border bg-white dark:bg-card shadow-2xl font-sans text-card-foreground">
        <DialogHeader className="text-center sm:text-left space-y-1.5">
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100">
                Đổi Địa Chỉ Email
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Xác thực mã OTP 6 chữ số để bảo đảm an toàn tài khoản
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {otpStep === 'input_email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="newEmailInput" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Nhập địa chỉ Email mới
              </Label>
              <Input
                id="newEmailInput"
                type="email"
                placeholder="name@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="h-11 text-xs rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={isSendingOtp}
                className="w-full h-11 bg-[#27c372] hover:bg-[#22c55e] text-white font-black rounded-xl text-xs shadow-md"
              >
                {isSendingOtp ? 'Đang gửi mã...' : 'Gửi Mã Xác Thực OTP'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="otpInput" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Nhập mã OTP (6 số) gửi tới {newEmail}
              </Label>
              <Input
                id="otpInput"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                className="h-12 text-center font-mono font-black text-xl tracking-widest rounded-xl"
              />
              {countdown > 0 ? (
                <p className="text-[11px] text-slate-400 text-center">Gửi lại mã sau {countdown}s</p>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="text-[11px] text-emerald-600 font-bold hover:underline block mx-auto cursor-pointer"
                >
                  Gửi lại mã OTP
                </button>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={isVerifyingOtp}
                className="w-full h-11 bg-[#27c372] hover:bg-[#22c55e] text-white font-black rounded-xl text-xs shadow-md"
              >
                {isVerifyingOtp ? 'Đang xác thực...' : 'Xác Nhận & Đổi Email'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
