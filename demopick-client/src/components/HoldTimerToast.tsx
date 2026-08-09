import React, { useEffect, useState } from 'react'
import { Hold } from '@/services/booking.service'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, AlertTriangle, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface HoldTimerToastProps {
  hold: Hold | null
  onExpired: () => void
}

export default function HoldTimerToast({ hold, onExpired }: HoldTimerToastProps) {
  const navigate = useNavigate()
  const [secondsLeft, setSecondsLeft] = useState<number>(0)

  useEffect(() => {
    if (!hold) return

    const calculateRemaining = () => {
      const expiresAt = new Date(hold.expires_at).getTime()
      const now = new Date().getTime()
      const diff = Math.max(0, Math.floor((expiresAt - now) / 1000))
      setSecondsLeft(diff)
      if (diff <= 0) {
        onExpired()
      }
    }

    calculateRemaining()
    const timer = setInterval(calculateRemaining, 1000)

    return () => clearInterval(timer)
  }, [hold, onExpired])

  if (!hold || secondsLeft <= 0) return null

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
      <Card className="flex items-center gap-4 bg-slate-900 text-white p-4 shadow-2xl border-primary/40 rounded-xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary animate-pulse">
          <Clock className="h-5 w-5" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Khung giờ đã tạm giữ:</span>
            <span className="font-mono text-sm font-bold text-amber-400">{formattedTime}</span>
          </div>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            {hold.slot_ids.length} suất sân • {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(hold.total_price)}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => navigate('/checkout', { state: { holdId: hold.id } })}
          className="ml-2 gap-1 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold"
        >
          <span>Thanh toán</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Card>
    </div>
  )
}
