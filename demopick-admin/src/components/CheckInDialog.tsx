import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { QrCode, CheckCircle2, Search } from 'lucide-react'
import { adminService } from '@/services/admin.service'
import { toast } from 'sonner'

interface CheckInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CheckInDialog({ open, onOpenChange }: CheckInDialogProps) {
  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [resultMessage, setResultMessage] = useState<string | null>(null)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setIsVerifying(true)
    setResultMessage(null)
    try {
      const res = await adminService.verifyCheckIn(code.trim())
      setResultMessage(res.message)
      toast.success(res.message)
    } catch (err: any) {
      toast.error('Check-in thất bại: Mã không tồn tại hoặc đã hết hạn.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold text-slate-900">
            <QrCode className="h-5 w-5 text-emerald-600" />
            Check-in Khách Đặt Sân Tức Thì
          </DialogTitle>
          <DialogDescription>
            Quét mã QR từ ứng dụng Khách hàng hoặc nhập Mã đơn đặt sân (VD: BK-901)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleVerify} className="space-y-4 pt-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Nhập mã đặt sân (VD: BK-901)..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="pl-10 h-11 text-base font-mono"
            />
          </div>

          {resultMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{resultMessage}</span>
            </div>
          )}

          <Button type="submit" disabled={isVerifying || !code.trim()} className="w-full font-bold bg-emerald-600 hover:bg-emerald-500">
            {isVerifying ? 'Đang xác thực mã...' : 'Xác Nhận Check-in Sân'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
