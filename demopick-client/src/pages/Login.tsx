import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, AlertCircle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('customer@demopick.vn')
  const [password, setPassword] = useState('12345678')
  const [error, setError] = useState<string | null>(null)
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.')
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
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">Đăng Nhập</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Nhập email và mật khẩu để đăng nhập tài khoản Pick
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
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white dark:bg-slate-900/60"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Mật khẩu</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white dark:bg-slate-900/60"
              />
            </div>

            <div className="rounded-md bg-slate-50 dark:bg-slate-900/60 p-3 text-xs text-slate-600 dark:text-slate-400 space-y-1 border border-slate-200 dark:border-border">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Tài khoản demo có sẵn:</p>
              <p>• Email: <code className="text-primary font-mono font-semibold">customer@demopick.vn</code></p>
              <p>• Mật khẩu: <code className="text-primary font-mono font-semibold">12345678</code></p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </Button>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
