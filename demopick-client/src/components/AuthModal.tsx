import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModalStore } from '@/stores/useAuthModalStore'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Mail, Lock, User, Phone, ArrowRight, Zap, Sparkles, ShieldCheck } from 'lucide-react'
import PickleballLogo from '@/components/PickleballLogo'

export function AuthModal() {
  const { isOpen, view, close, setView } = useAuthModalStore()
  const { login, register, isLoading } = useAuth()
  
  const [error, setError] = useState<string | null>(null)
  
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

  // Handle Close
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close()
      setError(null)
    }
  }

  // --- Login Logic ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(loginEmail, loginPassword)
      close()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
    }
  }

  const fillDemoAccount = () => {
    setLoginEmail('customer@demopick.vn')
    setLoginPassword('12345678')
    setError(null)
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
      close()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-[860px] p-0 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 shadow-2xl overflow-hidden focus:outline-none">
        {/* Hidden accessible title for screen readers */}
        <DialogTitle className="sr-only">Cửa sổ Xác thực DemoPick</DialogTitle>
        <DialogDescription className="sr-only">Đăng nhập hoặc đăng ký tài khoản DemoPick</DialogDescription>

        <div className="grid grid-cols-1 md:grid-cols-5 min-h-[580px]">
          {/* Left Column - Image & Branding (Desktop) */}
          <div className="hidden md:flex md:col-span-2 relative bg-slate-900 flex-col justify-between p-8 overflow-hidden select-none">
            <img 
              src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=800" 
              alt="Pickleball Court" 
              className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-700 hover:scale-110"
            />
            {/* Subtle neutral dark gradient for text legibility without green tint */}
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
                {view === 'login' 
                  ? 'Trọn vẹn đam mê trên từng đường bóng' 
                  : 'Trở thành hội viên chính thức ngay hôm nay'}
              </h3>
              <p className="text-slate-200/90 text-xs leading-relaxed">
                Hệ thống tự động đồng bộ lịch sân trực tiếp, thanh toán một chạm và ưu đãi độc quyền dành riêng cho bạn.
              </p>

              <div className="pt-2 flex items-center gap-4 text-xs text-slate-300/80 border-t border-white/15">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Bảo mật 100%
                </div>
                <div>•</div>
                <div>Hỗ trợ 24/7</div>
              </div>
            </div>
          </div>

          {/* Right Column - Sliding View Container */}
          <div className="col-span-1 md:col-span-3 relative overflow-hidden bg-white dark:bg-slate-900 flex flex-col justify-center">
            {/* Horizontal Slider Track */}
            <div 
              className="flex w-[200%] will-change-transform"
              style={{ 
                transform: view === 'login' ? 'translateX(0%)' : 'translateX(-50%)',
                transition: 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* SLIDE 1: LOGIN FORM */}
              <div className="w-1/2 p-6 sm:p-9 flex flex-col justify-center min-h-[580px]">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Đăng nhập</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                    Chào mừng bạn quay trở lại với DemoPick
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {error && view === 'login' && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/15 p-3 text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/30 animate-in fade-in-50 duration-200">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-3.5">
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
                          autoComplete="off"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                          className="pl-10 h-10.5 bg-slate-50/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 hover:border-slate-300 dark:hover:border-slate-600 text-sm shadow-sm transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                          Mật khẩu
                        </Label>
                        <a href="#" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                          Quên mật khẩu?
                        </a>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="h-4 w-4" />
                        </div>
                        <Input
                          id="login-password"
                          type="password"
                          autoComplete="new-password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          className="pl-10 h-10.5 bg-slate-50/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 hover:border-slate-300 dark:hover:border-slate-600 text-sm shadow-sm transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 mt-1 rounded-xl font-semibold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-[0.99]" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                    {!isLoading && <ArrowRight className="ml-1.5 h-4 w-4" />}
                  </Button>
                </form>

                <div className="relative flex items-center my-4">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700/70"></div>
                  <span className="flex-shrink-0 px-3 text-[11px] text-slate-400 dark:text-slate-400 font-medium uppercase tracking-wider">Hoặc</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700/70"></div>
                </div>

                <button
                  type="button"
                  onClick={fillDemoAccount}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/70 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors group text-xs font-medium"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                  Điền nhanh tài khoản Demo
                </button>

                <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-300">
                  Bạn chưa có tài khoản?{' '}
                  <button 
                    type="button"
                    onClick={() => { setView('register'); setError(null) }} 
                    className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Tạo tài khoản mới
                  </button>
                </p>
              </div>

              {/* SLIDE 2: REGISTER FORM */}
              <div className="w-1/2 p-6 sm:p-9 flex flex-col justify-center min-h-[580px]">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Tạo tài khoản</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                    Điền thông tin để bắt đầu trải nghiệm tại DemoPick
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {error && view === 'register' && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/15 p-3 text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/30 animate-in fade-in-50 duration-200">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="space-y-1.5">
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
                          autoComplete="off" 
                          value={regData.name} 
                          onChange={handleRegChange} 
                          required 
                          className="pl-10 h-10 bg-slate-50/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 hover:border-slate-300 dark:hover:border-slate-600 text-sm shadow-sm transition-colors" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1.5">
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
                            autoComplete="off" 
                            value={regData.email} 
                            onChange={handleRegChange} 
                            required 
                            className="pl-10 h-10 bg-slate-50/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 hover:border-slate-300 dark:hover:border-slate-600 text-sm shadow-sm transition-colors" 
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
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
                            autoComplete="off" 
                            value={regData.phone} 
                            onChange={handleRegChange} 
                            required 
                            className="pl-10 h-10 bg-slate-50/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 hover:border-slate-300 dark:hover:border-slate-600 text-sm shadow-sm transition-colors" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1.5">
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
                            autoComplete="new-password" 
                            value={regData.password} 
                            onChange={handleRegChange} 
                            required 
                            className="pl-10 h-10 bg-slate-50/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 hover:border-slate-300 dark:hover:border-slate-600 text-sm shadow-sm transition-colors" 
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
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
                            autoComplete="new-password" 
                            value={regData.password_confirmation} 
                            onChange={handleRegChange} 
                            required 
                            className="pl-10 h-10 bg-slate-50/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 hover:border-slate-300 dark:hover:border-slate-600 text-sm shadow-sm transition-colors" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 mt-2 rounded-xl font-semibold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-[0.99]" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
                    {!isLoading && <ArrowRight className="ml-1.5 h-4 w-4" />}
                  </Button>
                </form>

                <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-300">
                  Đã có tài khoản?{' '}
                  <button 
                    type="button"
                    onClick={() => { setView('login'); setError(null) }} 
                    className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
