import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Plus,
  Home,
  Building2,
  Trophy,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
} from 'lucide-react'
import { UserAddress } from '@/services/address.service'

interface AddressBookTabProps {
  addresses: UserAddress[]
  onOpenAddAddress: () => void
  onOpenEditAddress: (addr: UserAddress) => void
  onDeleteAddress: (id: string) => void
  onSetDefaultAddress: (id: string) => void
}

export default function AddressBookTab({
  addresses,
  onOpenAddAddress,
  onOpenEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}: AddressBookTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-card p-6 rounded-3xl border border-slate-200/80 dark:border-border shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#27c372]" />
            <span>Sổ Địa Chỉ Giao Hàng & Ghim Bản Đồ</span>
          </h2>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={onOpenAddAddress}
            className="h-11 px-5 bg-[#27c372] hover:bg-[#22c55e] text-white font-bold rounded-2xl text-xs gap-2 shadow-md shadow-[#27c372]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Địa Chỉ Mới</span>
          </Button>
        </div>
      </div>

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {addresses.map((addr) => {
          const isHome = addr.label === 'home'
          const isOffice = addr.label === 'office'
          const isCourt = addr.label === 'court'

          return (
            <Card
              key={addr.id}
              className={`p-6 rounded-3xl border-2 transition-all bg-white dark:bg-card space-y-4 relative ${addr.isDefault
                ? 'border-emerald-500/80 shadow-md ring-2 ring-emerald-500/10'
                : 'border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isHome
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600'
                      : isOffice
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                      }`}
                  >
                    {isHome ? (
                      <Home className="w-4.5 h-4.5" />
                    ) : isOffice ? (
                      <Building2 className="w-4.5 h-4.5" />
                    ) : (
                      <Trophy className="w-4.5 h-4.5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {isHome ? 'Nhà riêng' : isOffice ? 'Văn phòng Công ty' : isCourt ? 'Sân bóng Pickleball' : 'Địa chỉ khác'}
                      </span>
                      {addr.isDefault && (
                        <Badge className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 text-[10px] font-extrabold px-2 py-0.5">
                          ★ Mặc định
                        </Badge>
                      )}
                    </div>
                    {addr.lat && addr.lng && (
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-500" /> GPS: {addr.lat.toFixed(3)}, {addr.lng.toFixed(3)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onOpenEditAddress(addr)}
                    className="h-8 w-8 p-0 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="Chỉnh sửa địa chỉ"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  {!addr.isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteAddress(addr.id)}
                      className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title="Xóa địa chỉ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-border">
                <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                  {addr.recipientName}
                  <span className="font-normal text-slate-500 dark:text-slate-400 text-xs ml-2">
                    ({addr.phone})
                  </span>
                </div>
                <p className="leading-relaxed font-medium text-slate-700 dark:text-slate-300">
                  {addr.streetAddress}{addr.district ? `, ${addr.district}` : ''}, {addr.city}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-border">
                {addr.isDefault ? (
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Địa chỉ nhận hàng ưu tiên
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSetDefaultAddress(addr.id)}
                    className="text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Star className="w-3 h-3 text-slate-400" />
                    <span>Thiết lập làm mặc định</span>
                  </button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenEditAddress(addr)}
                  className="h-7 text-[11px] text-slate-500 hover:text-emerald-600 font-bold px-2 rounded-lg"
                >
                  Sửa chi tiết
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
