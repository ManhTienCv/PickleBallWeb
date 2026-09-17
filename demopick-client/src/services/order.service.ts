import api, { ApiResponse } from '@/lib/api'

export interface CreateOrderParams {
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  ghnProvinceId?: number
  ghnDistrictId?: number
  ghnWardCode?: string
  paymentMethod: 'momo' | 'cod'
  items: Array<{
    id: number
    product_id?: number
    name: string
    quantity: number
    price: number
  }>
}

export interface CreateOrderResult {
  orderCode: string
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
  payUrl?: string
}

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
}

export interface OrderItem {
  id: number
  item_type?: 'product' | 'booking'
  item_name: string
  quantity: number
  price: number
  subtotal: number
}

export interface Order {
  id: number
  order_code: string
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'completed' | 'cancelled'
  payment_status: 'unpaid' | 'paid' | 'refunded'
  payment_method: string
  customer_name?: string
  customer_phone?: string
  shipping_name?: string
  shipping_phone?: string
  shipping_address?: string
  shipping_carrier?: string
  shipping_fee?: number
  total_amount: number
  created_at: string
  ghn_order_code?: string
  trans_id?: string
  court_name?: string
  court_address?: string
  play_time?: string
  qr_checkin_code?: string
  items: OrderItem[]
}

export const orderService = {
  /**
   * Tạo đơn hàng mới qua Server Backend (Server-Side Price Protection)
   */
  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    const response = await api.post<{ success: boolean; data: CreateOrderResult }>('/orders', params)
    return response.data.data
  },

  async checkout(params: CheckoutParams): Promise<CheckoutResult> {
    const response = await api.post<ApiResponse<CheckoutResult>>('/checkout', params)
    return response.data.data
  },

  async getOrders(): Promise<Order[]> {
    try {
      const response = await api.get<{ success: boolean; data: Order[] }>('/orders')
      return response.data.data || []
    } catch {
      return []
    }
  },

  async getOrderByCode(code: string): Promise<Order | null> {
    try {
      const response = await api.get<{ success: boolean; data: { order: Order } }>(`/orders/${code}`)
      return response.data.data.order
    } catch {
      return null
    }
  },

  async verifyMomoPayment(params: Record<string, any>): Promise<{
    success: boolean
    orderCode?: string
    resultCode?: number
    transId?: string
    message?: string
  }> {
    try {
      const response = await api.post('/payments/momo/verify', params)
      return response.data
    } catch (err: any) {
      return {
        success: false,
        orderCode: err.response?.data?.orderCode,
        resultCode: err.response?.data?.resultCode ?? 99,
        message: err.response?.data?.message || 'Thanh toán MoMo chưa hoàn tất hoặc đã bị hủy.',
      }
    }
  },

  async cancelOrder(code: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/orders/${code}/cancel`, { reason })
      return response.data
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Không thể hủy đơn hàng.'
      throw new Error(errMsg)
    }
  },
}

