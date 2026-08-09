import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldAlert, AlertCircle, UserCheck, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('admin@demopick.vn')
  const [password, setPassword] = useState('12345678')
  const [error, setError] = useState<string | null>(null)
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      toast.success('Đăng nhập thành công!')
      navigate(email.includes('staff') || email.includes('letan') ? '/pos' : '/')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại.')
    }
  }

  const handleQuickLogin = async (targetEmail: string) => {
    setEmail(targetEmail)
    setPassword('12345678')
    try {
      await login(targetEmail, '12345678')
      const isStaff = targetEmail.includes('staff') || targetEmail.includes('letan')
      toast.success(`Đăng nhập thành công quyền: ${isStaff ? 'Lễ Tân POS' : 'Quản Trị Admin'}!`)
      navigate(isStaff ? '/pos' : '/')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <Card className="w-full max-w-md bg-slate-950 border-slate-800 text-white shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">DemoPick Admin Portal</CardTitle>
          <CardDescription className="text-slate-400">
            Hệ thống Quản Trị Sân & Bán Hàng POS Pickleball
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email quản trị</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@demopick.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white"
                required
              />
            </div>

            {/* Quick Demo Credentials Buttons */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <p className="text-xs font-semibold text-slate-400">⚡ Chọn nhanh tài khoản kiểm thử phân quyền:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickLogin('admin@demopick.vn')}
                  className="h-9 border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-emerald-400 gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4" /> Chủ Sân (Admin)
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickLogin('staff@demopick.vn')}
                  className="h-9 border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-amber-400 gap-1.5"
                >
                  <UserCheck className="h-4 w-4" /> Lễ Tân (Staff POS)
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full font-bold bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? 'Đang xác thực...' : 'Đăng Nhập Quản Trị'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
