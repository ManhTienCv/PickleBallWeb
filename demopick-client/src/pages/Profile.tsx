import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { User, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function Profile() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await authService.updateProfile({ name, phone })
      toast.success('Đã cập nhật thông tin cá nhân!')
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-xl">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Hồ Sơ Cá Nhân</CardTitle>
          <CardDescription>Cập nhật thông tin và quản lý tài khoản của bạn</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Địa chỉ Email (Không thể thay đổi)</Label>
              <Input id="email" value={user?.email || ''} disabled className="bg-slate-50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại liên hệ</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Tài khoản của bạn đã được xác thực bảo mật Sanctum Bearer Token</span>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
