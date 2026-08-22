import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, AlertCircle } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })
  const [error, setError] = useState<string | null>(null)
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (formData.password !== formData.password_confirmation) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    try {
      await register(formData)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.')
    }
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg border-primary/10 bg-white dark:bg-card border-border">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Trophy className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tạo Tài Khoản Mới</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Điền đầy đủ thông tin bên dưới để trải nghiệm Pick
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Họ và tên</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-white dark:bg-slate-900/60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-white dark:bg-slate-900/60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300">Số điện thoại</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="0901234567"
                value={formData.phone}
                onChange={handleChange}
                required
                className="bg-white dark:bg-slate-900/60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-white dark:bg-slate-900/60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation" className="text-slate-700 dark:text-slate-300">Xác nhận mật khẩu</Label>
              <Input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                className="bg-white dark:bg-slate-900/60"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Đăng Ký Tài Khoản'}
            </Button>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Đăng nhập
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
