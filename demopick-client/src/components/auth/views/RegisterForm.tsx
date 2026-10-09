import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModalStore } from '@/stores/useAuthModalStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react'
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
  const { register, isLoading } = useAuth()
  const { close } = useAuthModalStore()

  const [regData, setRegData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })
  const [error, setError] = useState<string | null>(null)

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
      setError(
        err.response?.data?.message ||
          err.message ||
          'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.'
      )
    }
  }

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

      <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
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
                placeholder="Tối thiểu 8 ký tự"
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
          className="w-full h-11 mt-1 rounded-xl font-semibold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
          {!isLoading && <ArrowRight className="ml-1.5 h-4 w-4" />}
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
          disabled={isLoading}
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
