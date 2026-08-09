import React from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, QrCode, ArrowRight, ShoppingBag, CalendarDays } from 'lucide-react'

export default function OrderSuccess() {
  const { code } = useParams<{ code: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state?.result

  const bankInfo = result?.bank_account_info
  const qrUrl = result?.qr_code_url

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 max-w-2xl text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto mb-4 animate-in zoom-in-50">
        <CheckCircle2 className="h-12 w-12" />
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900">Đặt Hàng Thành Công!</h1>
      <p className="text-slate-600 mt-2 text-sm">
        Cảm ơn bạn đã tin tưởng dịch vụ của DemoPick. Mã đơn hàng của bạn là{' '}
        <span className="font-mono font-bold text-primary">{code}</span>
      </p>

      {/* VietQR Bank Transfer Block */}
      {bankInfo && (
        <Card className="mt-8 p-6 border-emerald-200 bg-emerald-50/50 text-left space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-800 font-bold border-b border-emerald-200 pb-3">
            <QrCode className="h-5 w-5" />
            <span>Thanh Toán Chuyển Khoản Ngân Hàng (VietQR)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {qrUrl && (
              <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-emerald-100 shadow-inner">
                <img src={qrUrl} alt="Mã VietQR" className="h-44 w-44 object-contain" />
                <span className="text-[11px] text-slate-400 mt-1">Quét mã bằng App Ngân Hàng</span>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-500 text-xs">Ngân hàng:</span>
                <div className="font-semibold text-slate-900">{bankInfo.bank_name}</div>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Số tài khoản:</span>
                <div className="font-mono font-bold text-emerald-700 text-base">{bankInfo.account_no}</div>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Chủ tài khoản:</span>
                <div className="font-semibold text-slate-900">{bankInfo.account_name}</div>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Nội dung chuyển khoản (bắt buộc):</span>
                <div className="font-mono font-bold text-primary bg-white p-2 rounded border border-slate-200">
                  {bankInfo.transfer_content}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* MoMo Redirect Payment Option */}
      {result?.payment_url && (
        <Card className="mt-8 p-6 border-pink-200 bg-pink-50/50 text-center space-y-4">
          <h3 className="font-bold text-pink-900">Thanh Toán Qua Cổng MoMo</h3>
          <p className="text-xs text-pink-700">Vui lòng bấm nút bên dưới để chuyển hướng sang giao diện thanh toán MoMo Sandbox.</p>
          <a href={result.payment_url} target="_blank" rel="noreferrer">
            <Button className="bg-pink-600 hover:bg-pink-700 text-white font-bold gap-2">
              <span>Đến trang thanh toán MoMo</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </Card>
      )}

      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <Button variant="outline" onClick={() => navigate(`/orders`)} className="gap-2">
          <CalendarDays className="h-4 w-4" />
          <span>Quản lý đơn hàng của tôi</span>
        </Button>
        <Button onClick={() => navigate('/products')} className="gap-2">
          <ShoppingBag className="h-4 w-4" />
          <span>Tiếp tục mua sắm</span>
        </Button>
      </div>
    </div>
  )
}
