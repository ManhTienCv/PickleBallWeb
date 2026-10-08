import React, { useState } from 'react'
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
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleClose = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    onClose()
  }

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

  const passwordStrength = getPasswordStrength(newPassword)

  const handleSubmit = async (e: React.FormEvent) => {
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
      toast.success('Đổi mật khẩu thành công! Tài khoản của bạn đã được cập nhật mật khẩu mới an toàn.')
      handleClose()
    } catch (err: any) {
      toast.error(err.message || 'Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md sm:rounded-3xl p-6 border border-slate-200 dark:border-border bg-white dark:bg-card shadow-2xl font-sans text-card-foreground">
        <DialogHeader className="text-center sm:text-left space-y-1.5">
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100">
                Đổi Mật Khẩu Tài Khoản
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Cập nhật mật khẩu mới để tăng cường an toàn tuyệt đối
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Current password */}
          <div className="space-y-1.5">
            <Label htmlFor="currPass" className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Mật khẩu hiện tại <span className="text-rose-500">*</span>
            </Label>
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
                  <span className={`font-bold ${passwordStrength.color.split(' ')[1]}`}>
                    {passwordStrength.text}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 rounded-full transition-all ${passwordStrength.score >= 1 ? passwordStrength.color.split(' ')[0] : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 rounded-full transition-all ${passwordStrength.score >= 2 ? passwordStrength.color.split(' ')[0] : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 rounded-full transition-all ${passwordStrength.score >= 3 ? passwordStrength.color.split(' ')[0] : 'bg-transparent'}`} />
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
              className="rounded-xl text-xs font-bold h-11 px-4 border-slate-200 dark:border-border"
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
      </DialogContent>
    </Dialog>
  )
}
