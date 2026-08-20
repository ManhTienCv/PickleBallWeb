import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Award } from 'lucide-react'

export interface TechnicalSpecs {
  material?: string
  thickness?: string
  weight?: string
  usapa_certified?: boolean
  origin?: string
  [key: string]: any
}

interface TechnicalSpecsTableProps {
  specs?: TechnicalSpecs
}

export default function TechnicalSpecsTable({ specs }: TechnicalSpecsTableProps) {
  if (!specs || Object.keys(specs).length === 0) {
    return (
      <Card className="p-6 bg-slate-50 border-dashed text-center text-slate-500 text-sm">
        Chưa có bảng thông số kỹ thuật chi tiết cho sản phẩm này.
      </Card>
    )
  }

  const specLabels: Record<string, string> = {
    material: 'Chất liệu mặt vợt',
    thickness: 'Độ dày lõi tổ ong',
    weight: 'Trọng lượng chuẩn',
    usapa_certified: 'Chứng nhận USAPA',
    origin: 'Xuất xứ thương hiệu',
    length: 'Chiều dài tổng thể',
    width: 'Chiều rộng mặt vợt',
    handle_length: 'Chiều dài tay cầm',
    grip_circumference: 'Chu vi tay cầm',
  }

  return (
    <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
      <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Award className="h-5 w-5 text-emerald-600" />
        Bảng Thông Số Kỹ Thuật Chi Tiết
      </h3>

      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs sm:text-sm">
          <tbody className="divide-y divide-slate-100">
            {Object.entries(specs).map(([key, val], idx) => (
              <tr key={key} className={idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}>
                <td className="py-3 px-4 font-semibold text-slate-600 w-1/3">
                  {specLabels[key] || key}
                </td>
                <td className="py-3 px-4 font-medium text-slate-900">
                  {typeof val === 'boolean' ? (
                    val ? (
                      <Badge className="bg-emerald-600 text-white font-bold gap-1 text-xs">
                        <ShieldCheck className="h-3.5 w-3.5" /> Đã chứng nhận USAPA Thi Đấu
                      </Badge>
                    ) : (
                      'Tiêu chuẩn tập luyện'
                    )
                  ) : (
                    String(val)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
