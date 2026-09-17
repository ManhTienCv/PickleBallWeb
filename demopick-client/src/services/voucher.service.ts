import api, { ApiResponse } from '@/lib/api'

export interface Voucher {
  id: number
  code: string
  title: string
  description?: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_discount?: number | null
  min_order_amount: number
  usage_limit?: number | null
  used_count: number
  is_active: boolean
}

export interface AppliedVoucherResult {
  valid: boolean
  code: string
  title: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  discount_amount: number
  final_amount: number
  message: string
}

const FALLBACK_VOUCHERS: Voucher[] = [
  {
    id: 1,
    code: 'CHAOBANMOI',
    title: 'Ưu đãi chào bạn mới - Giảm 50K',
    description: 'Giảm ngay 50.000đ cho đơn hàng thiết bị từ 300.000đ.',
    discount_type: 'fixed',
    discount_value: 50000,
    min_order_amount: 300000,
    used_count: 42,
    is_active: true,
  },
  {
    id: 2,
    code: 'DEMOPICK10',
    title: 'Giảm 10% thiết bị thi đấu (Tối đa 200K)',
    description: 'Áp dụng cho đơn hàng tổng từ 1.000.000đ trở lên.',
    discount_type: 'percentage',
    discount_value: 10,
    max_discount: 200000,
    min_order_amount: 1000000,
    used_count: 128,
    is_active: true,
  },
  {
    id: 3,
    code: 'FREESHIP30',
    title: 'Hỗ trợ 30K phí vận chuyển GHN',
    description: 'Giảm 30.000đ phí giao hàng cho đơn từ 500.000đ.',
    discount_type: 'fixed',
    discount_value: 30000,
    min_order_amount: 500000,
    used_count: 310,
    is_active: true,
  },
  {
    id: 4,
    code: 'VIPPRO500',
    title: 'Đặc quyền Vợt Chuyên Nghiệp - Giảm 500K',
    description: 'Giảm trực tiếp 500.000đ cho các dòng vợt thi đấu cao cấp từ 4.500.000đ.',
    discount_type: 'fixed',
    discount_value: 500000,
    min_order_amount: 4500000,
    used_count: 19,
    is_active: true,
  },
]

export const voucherService = {
  async getAvailableVouchers(): Promise<Voucher[]> {
    try {
      const res = await api.get<ApiResponse<Voucher[]>>('/vouchers')
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data
      }
    } catch (err) {
      console.warn('Backend vouchers API unreachable, using fallback list:', err)
    }
    return FALLBACK_VOUCHERS
  },

  async applyVoucher(code: string, orderAmount: number): Promise<AppliedVoucherResult> {
    try {
      const res = await api.post<ApiResponse<AppliedVoucherResult>>('/vouchers/apply', {
        code,
        order_amount: orderAmount,
      })
      if (res.data?.data) {
        return res.data.data
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Không thể áp dụng mã ưu đãi này.'
      throw new Error(msg)
    }

    // Client fallback if API completely down
    const cleanCode = code.toUpperCase().trim()
    const found = FALLBACK_VOUCHERS.find((v) => v.code === cleanCode)
    if (!found) {
      throw new Error('Mã giảm giá không tồn tại hoặc đã hết hạn.')
    }
    if (orderAmount < found.min_order_amount) {
      throw new Error(`Đơn hàng phải từ ${new Intl.NumberFormat('vi-VN').format(found.min_order_amount)}đ để áp dụng.`)
    }
    let discount = 0
    if (found.discount_type === 'percentage') {
      discount = (orderAmount * found.discount_value) / 100
      if (found.max_discount && discount > found.max_discount) discount = found.max_discount
    } else {
      discount = Math.min(orderAmount, found.discount_value)
    }

    return {
      valid: true,
      code: found.code,
      title: found.title,
      discount_type: found.discount_type,
      discount_value: found.discount_value,
      discount_amount: discount,
      final_amount: Math.max(0, orderAmount - discount),
      message: `Áp dụng thành công! Đã giảm ${new Intl.NumberFormat('vi-VN').format(discount)}đ.`,
    }
  },
}
