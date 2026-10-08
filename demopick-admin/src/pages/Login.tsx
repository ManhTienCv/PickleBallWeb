import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  Shield,
  ArrowRight,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react'
import PickleballLogo from '@/components/PickleballLogo'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { login, isLoading } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      toast.success('Đăng nhập thành công! Đang chuyển hướng...')
      navigate(email.includes('staff') || email.includes('letan') ? '/pos' : '/')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Email hoặc mật khẩu không chính xác.')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 py-12 selection:bg-emerald-500 selection:text-white overflow-hidden transition-colors duration-300">
      {/* Nút chuyển đổi Theme (Sáng / Tối / Hệ thống) góc trên bên phải */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-1 rounded-full border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1 shadow-sm transition-colors duration-200">
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${theme === 'light'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          title="Giao diện Sáng"
        >
          <Sun className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sáng</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${theme === 'dark'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          title="Giao diện Tối"
        >
          <Moon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Tối</span>
        </button>
      </div>

      {/* Hiệu ứng hào quang nền công nghệ thích ứng Sáng / Tối */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.18),rgba(0,0,0,0))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_100%,rgba(20,184,166,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_60%_50%_at_80%_100%,rgba(20,184,166,0.12),rgba(0,0,0,0))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#94a3b818_1px,transparent_1px),linear-gradient(to_bottom,#94a3b818_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#33415515_1px,transparent_1px),linear-gradient(to_bottom,#33415515_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Login Card Glassmorphism (Thích ứng theo Theme Sáng / Tối) */}
      <Card className="relative w-full max-w-md rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/85 backdrop-blur-xl text-slate-900 dark:text-white shadow-[0_20px_50px_rgba(15,23,42,0.08),0_0_25px_rgba(16,185,129,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_40px_rgba(16,185,129,0.12)] overflow-hidden transition-all duration-300">
        {/* Viền sáng gradient mỏng ở mép trên card */}
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/70 dark:via-emerald-400/60 to-transparent" />

        <CardHeader className="space-y-3 text-center pb-6 pt-8">
          {/* Logo badge với hiệu ứng phát sáng */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-30 dark:opacity-40 blur-sm group-hover:opacity-50 transition duration-300" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-950 border border-emerald-500/30 dark:border-emerald-500/40 shadow-md dark:shadow-inner">
                <PickleballLogo size={38} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>CỔNG QUẢN TRỊ NỘI BỘ</span>
            </div>

            <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Pickleball Admin Portal
            </CardTitle>

            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              Hệ thống Quản Trị Sân & Bán Hàng POS Pickleball
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-6 sm:px-8">
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl bg-destructive/10 dark:bg-destructive/15 border border-destructive/20 dark:border-destructive/30 p-3 text-xs text-red-600 dark:text-red-300 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Field: Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email quản trị
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@demopick.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50/90 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 pl-10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-emerald-500 focus:ring-emerald-500/20 text-sm transition-all"
                  required
                />
              </div>
            </div>

            {/* Field: Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mật khẩu
                </Label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50/90 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 pl-10 pr-10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-emerald-500 focus:ring-emerald-500/20 text-sm transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-emerald-600 focus:ring-emerald-500/30"
                />
                <span className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300 transition-colors">
                  Ghi nhớ phiên làm việc
                </span>
              </label>

              <span className="text-xs text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 cursor-pointer transition-colors">
                Quên mật khẩu?
              </span>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 px-6 sm:px-8 pb-8 pt-2">
            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="group relative h-11 w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-500 hover:via-emerald-500 hover:to-teal-500 font-semibold text-white shadow-lg shadow-emerald-600/25 active:scale-[0.99] transition-all duration-200"
            >
              {isLoading ? (
                <span className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  Đang xác thực thông tin...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-100" />
                  Đăng Nhập Quản Trị
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>

            {/* Security disclaimer footer */}
            <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">


            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
