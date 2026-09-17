import React, { useEffect, useState } from 'react'
import { HoldTimerToastProps } from '../types/booking.types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function HoldTimerToast({ hold, onExpired }: HoldTimerToastProps) {
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
      <Card className="flex items-center gap-4 bg-white/95 dark:bg-card/95 backdrop-blur-md text-slate-900 dark:text-slate-100 p-4 shadow-2xl border-2 border-emerald-500/30 ring-1 ring-emerald-500/10 rounded-2xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 animate-pulse shadow-xs">
          <Clock className="h-5 w-5" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Khung giờ đã tạm giữ:</span>
            <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">{formattedTime}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
            {hold.slot_ids.length} suất sân • {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(hold.total_price)}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => navigate('/checkout', { state: { holdId: hold.id } })}
          className="ml-2 gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
        >
          <span>Thanh toán</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Card>
    </div>
  )
}

export default HoldTimerToast
