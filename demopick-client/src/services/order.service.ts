import api, { ApiResponse } from '@/lib/api'

export interface CheckoutParams {
  payment_method: 'momo' | 'bank_transfer' | 'cash'
  hold_id?: number
  note?: string
  shipping_address?: string
}

export interface CheckoutResult {
  order_code: string
  total_amount: number
  payment_url?: string
  qr_code_url?: string
  bank_account_info?: {
    bank_name: string
    account_no: string
    account_name: string
    transfer_content: string
  }
}

export interface OrderItem {
  id: number
  item_type: 'product' | 'booking'
  item_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Order {
  id: number
  order_code: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  payment_status: 'unpaid' | 'paid' | 'refunded'
  payment_method: string
  total_amount: number
  created_at: string
  items: OrderItem[]
  qr_checkin_code?: string
}

export const orderService = {
  async checkout(params: CheckoutParams): Promise<CheckoutResult> {
    const response = await api.post<ApiResponse<CheckoutResult>>('/checkout', params)
    return response.data.data
  },

  async getOrders(): Promise<Order[]> {
    const response = await api.get<ApiResponse<Order[]>>('/orders')
    return response.data.data
  },

  async getOrderByCode(code: string): Promise<Order> {
    const response = await api.get<ApiResponse<Order>>(`/orders/${code}`)
    return response.data.data
  },
}
