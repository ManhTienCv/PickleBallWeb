import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModalStore } from '@/stores/useAuthModalStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Mail, Lock, ArrowRight, RefreshCw } from 'lucide-react'
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
  const { login, isLoading } = useAuth()
  const { close } = useAuthModalStore()

  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState(initialPassword)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail)
    if (initialPassword) setPassword(initialPassword)
  }, [initialEmail, initialPassword])

  const handleLoginSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="flex flex-col justify-center min-h-[500px] animate-in fade-in duration-300">
      <div className="text-center mb-5">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
          Đăng nhập
        </h2>
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
      </form>

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
          disabled={isLoading}
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
