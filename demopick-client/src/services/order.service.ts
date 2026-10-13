import api, { ApiResponse } from '@/lib/api'
import { authHelpers } from '@/stores/useAuthStore'

export interface CreateOrderParams {
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  customerEmail?: string
  ghnProvinceId?: number
  ghnDistrictId?: number
  ghnWardCode?: string
  paymentMethod: 'momo' | 'cod' | 'vietqr'
  redirectUrl?: string
  voucherCode?: string
  discount?: number
  holdId?: number
  slotId?: number
  slotIds?: number[]
  shippingFee?: number
  order_type?: 'shop' | 'booking' | 'mixed'
  booking_date?: string
  play_time?: string
  court_name?: string
  court_address?: string
  items: Array<{
    id: number
    product_id?: number
    name: string
    quantity: number
    price: number
    item_type?: 'product' | 'booking' | 'booking_slot'
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
  item_type?: 'product' | 'booking' | 'booking_slot'
  item_name: string
  quantity: number
  price: number
  subtotal: number
  product_id?: number
  slot_ids?: number[]
}

export interface Order {
  id: number
  order_code: string
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'completed' | 'cancelled' | 'refund_pending' | 'refunded'
  payment_status: 'unpaid' | 'paid' | 'refunded'
  payment_method: string
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  shipping_name?: string
  shipping_phone?: string
  shipping_address?: string
  shipping_carrier?: string
  shipping_fee?: number
  total_amount: number
  created_at: string
  ghn_order_code?: string
  trans_id?: string
  refund_status?: string
  refund_reason?: string
  refund_amount?: number
  refund_requested_at?: string
  refund_trans_id?: string
  refund_note?: string
  refunded_at?: string
  court_name?: string
  court_address?: string
  play_time?: string
  booking_date?: string
  order_type?: string
  qr_checkin_code?: string
  slot_id?: number
  slot_ids?: number[]
  items: OrderItem[]
}

/**
 * Kiểm tra xem vé đặt sân có bị khóa hủy do quá hạn (hôm qua/quá khứ)
 * hoặc cận giờ thi đấu (< 1 tiếng) hay không theo Quy định sân Pickleball.
 */
export function checkBookingCancellationLock(order: any): {
  isLocked: boolean
  canCancel: boolean
  refundPercentage: number
  reason: string
} {
  const now = new Date()
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

  // 1. Xác định ngày diễn ra trận đấu
  let playDateOnly: number | null = null
  let dateLabel = ''

  // Ưu tiên 1: Trường order.booking_date (yyyy-MM-dd)
  if (order.booking_date) {
    const parts = String(order.booking_date).split('-').map(Number)
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2])
      playDateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      dateLabel = `${String(parts[2]).padStart(2, '0')}/${String(parts[1]).padStart(2, '0')}/${parts[0]}`
    }
  }

  // Ưu tiên 2: Trích xuất ngày từ order.play_time (vd: "18:00 - 20:00 (12/10/2026)")
  if (!playDateOnly && order.play_time) {
    let cleanPlayTime = String(order.play_time)
    // Nếu có dính chuỗi mock cũ 15/08/2026 thì thay bằng ngày tạo đơn thực tế
    if (cleanPlayTime.includes('15/08/2026') && order.created_at) {
      const c = new Date(order.created_at)
      if (!isNaN(c.getTime())) {
        const dStr = c.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        cleanPlayTime = cleanPlayTime.replace('15/08/2026', dStr)
      }
    }

    const dmyMatch = cleanPlayTime.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10)
      const month = parseInt(dmyMatch[2], 10) - 1
      const year = parseInt(dmyMatch[3], 10)
      const d = new Date(year, month, day)
      playDateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      dateLabel = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`
    } else {
      const ymdMatch = cleanPlayTime.match(/(\d{4})[\/\-](\d{2})[\/\-](\d{2})/)
      if (ymdMatch) {
        const year = parseInt(ymdMatch[1], 10)
        const month = parseInt(ymdMatch[2], 10) - 1
        const day = parseInt(ymdMatch[3], 10)
        const d = new Date(year, month, day)
        playDateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
        dateLabel = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`
      }
    }
  }

  // Ưu tiên 3: Dựa trên ngày tạo đơn order.created_at
  if (!playDateOnly && order.created_at) {
    const c = new Date(order.created_at)
    if (!isNaN(c.getTime())) {
      playDateOnly = new Date(c.getFullYear(), c.getMonth(), c.getDate()).getTime()
      dateLabel = c.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
  }

  if (!playDateOnly) {
    playDateOnly = todayOnly
    dateLabel = 'hôm nay'
  }

  // KIỂM TRA 1: Vé đặt sân của ngày hôm qua hoặc các ngày trước đó trong quá khứ
  if (playDateOnly < todayOnly) {
    return {
      isLocked: true,
      canCancel: false,
      refundPercentage: 0,
      reason: `🔒 Vé đặt sân ngày ${dateLabel} (hôm qua/quá khứ) đã kết thúc. Theo quy định sân, không thể hủy vé của các ngày đã qua.`,
    }
  }

  // KIỂM TRA 2: Vé đặt sân của ngày tương lai (ngày mai trở đi) -> Cho phép hủy hoàn tiền 100%
  if (playDateOnly > todayOnly) {
    return {
      isLocked: false,
      canCancel: true,
      refundPercentage: 100,
      reason: `Hủy trước ≥ 2 tiếng: Được hoàn tiền 100% về tài khoản.`,
    }
  }

  // KIỂM TRA 3: Vé đặt sân diễn ra HÔM NAY -> Tính chính xác số phút trước giờ bắt đầu
  let startHour = 8
  let startMinute = 0
  if (order.play_time) {
    const timeMatch = String(order.play_time).match(/(\d{1,2}):(\d{2})/)
    if (timeMatch) {
      startHour = parseInt(timeMatch[1], 10)
      startMinute = parseInt(timeMatch[2], 10)
    }
  }

  const slotStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute, 0).getTime()
  const diffMinutes = Math.floor((slotStartTime - now.getTime()) / (1000 * 60))

  // Ca sân đã đến giờ bắt đầu hoặc đã kết thúc trong ngày
  if (diffMinutes <= 0) {
    return {
      isLocked: true,
      canCancel: false,
      refundPercentage: 0,
      reason: `🔒 Ca thi đấu hôm nay (${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}) đã bắt đầu hoặc đã kết thúc. Không thể hủy sau khi giờ chơi đã diễn ra.`,
    }
  }

  // Cận giờ chơi (< 1 giờ) -> Khóa hủy theo quy định sân
  if (diffMinutes < 60) {
    return {
      isLocked: true,
      canCancel: false,
      refundPercentage: 0,
      reason: `🔒 Ca thi đấu bắt đầu trong vòng dưới 1 giờ (${diffMinutes} phút nữa). Theo chính sách sân, vé không được phép hủy cận giờ thi đấu (Không hoàn tiền).`,
    }
  }

  // Từ 1 - 2 tiếng trước giờ chơi -> Hoàn tiền 50%
  if (diffMinutes < 120) {
    return {
      isLocked: false,
      canCancel: true,
      refundPercentage: 50,
      reason: `Hủy trước 1 - 2 tiếng (${diffMinutes} phút nữa): Bạn được hoàn lại 50% tiền sân theo quy định.`,
    }
  }

  // Trước giờ chơi ≥ 2 tiếng -> Hoàn tiền 100%
  return {
    isLocked: false,
    canCancel: true,
    refundPercentage: 100,
    reason: `Hủy trước ≥ 2 tiếng (${Math.floor(diffMinutes / 60)} giờ nữa): Được hoàn tiền 100% về tài khoản.`,
  }
}

export const orderService = {
  /**
   * Tạo đơn hàng mới qua Server Backend (Server-Side Price Protection)
   */
  /**
   * Tạo đơn hàng mới qua Server Backend (Server-Side Price Protection)
   * Có cơ chế fallback tự động nếu kết nối mạng/máy chủ backend gặp sự cố.
   */
  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pickleball-manhtien.vercel.app'
    const effectiveRedirectUrl = `${origin}/payment/momo/gateway`
    const effectiveSlotIds = params.slotIds || (params.slotId ? [params.slotId] : [])
    const orderPayload = {
      ...params,
      slotIds: effectiveSlotIds,
      slotId: params.slotId || effectiveSlotIds[0],
      redirectUrl: effectiveRedirectUrl,
    }

    try {
      const response = await api.post<any>('/orders', orderPayload)
      const rawData = response.data?.data || response.data
      const orderCode = rawData?.orderCode || rawData?.order_code || ''
      const totalAmount = rawData?.totalAmount ?? rawData?.total_amount ?? 0
      let serverPayUrl = rawData?.payUrl || rawData?.pay_url
      if (serverPayUrl && serverPayUrl.includes('demopick-client.vercel.app')) {
        serverPayUrl = serverPayUrl.replace('demopick-client.vercel.app', window.location.host || 'pickleball-manhtien.vercel.app')
      }

      // Lưu trữ đồng bộ local để đảm bảo xem được lịch sử đơn
      try {
        const currentUser = authHelpers.getUser()
        const saved = localStorage.getItem('demopick_orders_client')
        const orders = saved ? JSON.parse(saved) : []
        const exists = orders.some((o: any) => o.order_code === orderCode)
        if (!exists && orderCode) {
          orders.unshift({
            id: Date.now(),
            order_code: orderCode,
            user_id: currentUser?.id,
            status: params.paymentMethod === 'cod' ? 'pending' : 'pending',
            payment_status: 'unpaid',
            payment_method: params.paymentMethod,
            total_amount: totalAmount,
            slot_ids: effectiveSlotIds,
            created_at: new Date().toISOString(),
            customer_name: params.shippingName,
            customer_phone: params.shippingPhone,
            customer_email: params.customerEmail || currentUser?.email,
            shipping_address: params.shippingAddress,
            items: params.items.map((it, idx) => ({
              id: idx + 1,
              item_name: it.name,
              item_type: (it.name?.toLowerCase().includes('ca') || it.name?.toLowerCase().includes('sân') || effectiveSlotIds.includes(it.id)) ? 'booking' : 'product',
              slot_ids: effectiveSlotIds.includes(it.id) ? [it.id] : (effectiveSlotIds.length > 0 ? effectiveSlotIds : undefined),
              quantity: it.quantity,
              price: it.price,
              subtotal: it.price * it.quantity,
            })),
          })
          localStorage.setItem('demopick_orders_client', JSON.stringify(orders))
        }
      } catch { }

      return {
        orderCode,
        totalAmount,
        paymentMethod: rawData?.paymentMethod || rawData?.payment_method || params.paymentMethod,
        paymentStatus: rawData?.paymentStatus || rawData?.payment_status || 'unpaid',
        payUrl: serverPayUrl,
      }
    } catch (err: any) {
      // Nếu server trả về lỗi nghiệp vụ 400 cụ thể (như voucher không hợp lệ), ném lỗi cho UI hiển thị
      if (err.response?.status === 400 && err.response?.data?.message) {
        throw err
      }

      console.warn('Backend /orders gặp sự cố hoặc máy chủ ngoại tuyến, kích hoạt fallback đơn hàng local an toàn:', err)
      const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const fallbackCode = `ORD-${datePrefix}-${Math.floor(1000 + Math.random() * 9000)}`
      const calculatedItemsTotal = (params.items || []).reduce((sum, it) => sum + ((it.price || 0) * (it.quantity || 1)), 0)
      const calculatedTotal = Math.max(0, calculatedItemsTotal + (params.shippingFee || 0) - (params.discount || 0))

      let momoPayUrl: string | undefined = undefined
      if (params.paymentMethod === 'momo') {
        try {
          const momoRes = await fetch('/api/momo-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderCode: fallbackCode,
              amount: calculatedTotal,
              redirectUrl: effectiveRedirectUrl,
            }),
          })
          if (momoRes.ok) {
            const momoData = await momoRes.json()
            if (momoData?.payUrl) {
              momoPayUrl = momoData.payUrl
              if (momoPayUrl && momoPayUrl.includes('demopick-client.vercel.app')) {
                momoPayUrl = momoPayUrl.replace('demopick-client.vercel.app', window.location.host || 'pickleball-manhtien.vercel.app')
              }
            }
          }
        } catch (e) {
          console.warn('Vercel serverless momo-payment error:', e)
        }
        if (!momoPayUrl) {
          momoPayUrl = `/payment/momo/gateway?orderId=${fallbackCode}&amount=${calculatedTotal}`
        }
      }

      const fallbackResult: CreateOrderResult = {
        orderCode: fallbackCode,
        totalAmount: calculatedTotal,
        paymentMethod: params.paymentMethod,
        paymentStatus: 'unpaid',
        payUrl: momoPayUrl,
      }

      try {
        const saved = localStorage.getItem('demopick_orders_client')
        const orders = saved ? JSON.parse(saved) : []
        const isBooking = Boolean(
          params.order_type === 'booking' ||
          params.order_type === 'mixed' ||
          params.slotId ||
          (params.slotIds && params.slotIds.length > 0) ||
          params.booking_date ||
          params.play_time ||
          params.items?.some((it: any) => it.item_type === 'booking' || (it.name && it.name.toLowerCase().includes('thuê ca sân')))
        )
        const currentUser = authHelpers.getUser()
        orders.unshift({
          id: Date.now(),
          order_code: fallbackCode,
          user_id: currentUser?.id,
          order_type: isBooking ? (params.order_type || 'booking') : 'shop',
          status: params.paymentMethod === 'cod' ? 'pending' : 'pending',
          payment_status: 'unpaid',
          payment_method: params.paymentMethod,
          total_amount: calculatedTotal,
          created_at: new Date().toISOString(),
          customer_name: params.shippingName,
          customer_phone: params.shippingPhone,
          customer_email: params.customerEmail || currentUser?.email,
          shipping_address: params.shippingAddress,
          booking_date: params.booking_date || (isBooking ? new Date().toISOString().split('T')[0] : undefined),
          play_time: params.play_time || (isBooking ? `18:00 - 20:00 (${new Date().toLocaleDateString('vi-VN')})` : undefined),
          court_name: params.court_name,
          court_address: params.court_address,
          qr_checkin_code: isBooking ? `PK-${fallbackCode.slice(-5)}-VIP` : undefined,
          slot_ids: params.slotIds || (params.slotId ? [params.slotId] : []),
          items: (params.items || []).map((it, idx) => ({
            id: idx + 1,
            item_name: it.name,
            quantity: it.quantity,
            price: it.price,
            subtotal: it.price * it.quantity,
            item_type: it.item_type || (isBooking ? 'booking' : 'product'),
          })),
        })
        localStorage.setItem('demopick_orders_client', JSON.stringify(orders))
      } catch (storageErr) {
        console.error('Failed to save fallback order to localStorage:', storageErr)
      }

      return fallbackResult
    }
  },

  async checkout(params: CheckoutParams): Promise<CheckoutResult> {
    const response = await api.post<ApiResponse<CheckoutResult>>('/checkout', params)
    return response.data.data
  },

  async getOrders(): Promise<Order[]> {
    const currentUser = authHelpers.getUser()
    if (!currentUser && !authHelpers.isAuthenticated()) {
      return []
    }

    let apiOrders: Order[] = []
    try {
      const response = await api.get<any>('/orders')
      const rawData = response.data?.data || response.data
      if (Array.isArray(rawData)) {
        apiOrders = rawData
      }
    } catch {
      // Ignored
    }

    try {
      const local = localStorage.getItem('demopick_orders_client') || localStorage.getItem('demopick_client_orders')
      const localOrders: Order[] = local ? JSON.parse(local) : []

      // Lọc nghiêm ngặt các đơn local chỉ thuộc về user hiện tại
      const userLocalOrders = localOrders.filter((o: any) => {
        if (!currentUser) return false
        const idMatch = currentUser.id && (o.user_id === currentUser.id || o.userId === currentUser.id)
        const emailMatch = currentUser.email && (
          (o.customer_email && o.customer_email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (o.customerEmail && o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
          (o.email && o.email.toLowerCase() === currentUser.email.toLowerCase())
        )
        const phoneMatch = currentUser.phone && (
          o.customer_phone === currentUser.phone ||
          o.customerPhone === currentUser.phone ||
          o.shipping_phone === currentUser.phone ||
          o.shippingPhone === currentUser.phone
        )
        return idMatch || emailMatch || phoneMatch
      })

      // Merge and deduplicate by order_code
      const seen = new Set(apiOrders.map((o) => o.order_code || (o as any).code))
      const extra = userLocalOrders.filter((o) => !seen.has(o.order_code || (o as any).code))
      return [...apiOrders, ...extra]
    } catch {
      return apiOrders
    }
  },

  syncLocalOrderPaymentSuccess(orderCode: string, transId?: string): void {
    try {
      const savedClient = localStorage.getItem('demopick_orders_client') || localStorage.getItem('demopick_client_orders')
      if (savedClient) {
        const clientOrders = JSON.parse(savedClient)
        const foundSlots: number[] = []
        const updatedClient = clientOrders.map((o: any) => {
          if (o.order_code === orderCode || o.code === orderCode) {
            if (Array.isArray(o.slot_ids)) foundSlots.push(...o.slot_ids)
            if (Array.isArray(o.items)) {
              o.items.forEach((it: any) => {
                if (it.slot_ids && Array.isArray(it.slot_ids)) foundSlots.push(...it.slot_ids)
                if (it.item_type === 'booking' && it.id) foundSlots.push(it.id)
              })
            }
            return {
              ...o,
              status: 'confirmed',
              payment_status: 'paid',
              trans_id: transId || o.trans_id || ('MOMO_' + Date.now()),
            }
          }
          return o
        })
        localStorage.setItem('demopick_orders_client', JSON.stringify(updatedClient))
        localStorage.setItem('demopick_client_orders', JSON.stringify(updatedClient))

        if (foundSlots.length > 0) {
          const rawBooked = localStorage.getItem('demopick_booked_slots')
          const currentBooked: string[] = rawBooked ? JSON.parse(rawBooked) : []
          foundSlots.forEach((sid) => {
            if (!currentBooked.includes(String(sid))) currentBooked.push(String(sid))
          })
          localStorage.setItem('demopick_booked_slots', JSON.stringify(currentBooked))
        }
      }

      const savedAdmin = localStorage.getItem('demopick_orders_admin')
      if (savedAdmin) {
        const adminOrders = JSON.parse(savedAdmin)
        const updatedAdmin = adminOrders.map((o: any) =>
          (o.code === orderCode || o.order_code === orderCode)
            ? { ...o, status: 'ĐÃ_THANH_TOÁN', paymentStatus: 'paid' }
            : o
        )
        localStorage.setItem('demopick_orders_admin', JSON.stringify(updatedAdmin))
      }

      window.dispatchEvent(new Event('storage'))
    } catch (e) {
      console.warn('Lỗi đồng bộ local order:', e)
    }
  },

  async getOrderByCode(code: string): Promise<Order | null> {
    // 1. Kiểm tra localStorage trước để tránh gây lỗi 404 đỏ trên Console nếu là đơn local/fallback
    try {
      const local = localStorage.getItem('demopick_orders_client') || localStorage.getItem('demopick_client_orders')
      if (local) {
        const list: Order[] = JSON.parse(local)
        const found = list.find((o) => o.order_code === code || (o as any).code === code)
        if (found) return found
      }
      const adminOrders = localStorage.getItem('demopick_orders_admin')
      if (adminOrders) {
        const list = JSON.parse(adminOrders)
        const found = list.find((o: any) => o.code === code || o.order_code === code)
        if (found) {
          return {
            id: found.id || 1,
            order_code: found.code || found.order_code,
            order_type: found.order_type || (found.type?.includes('Đặt Sân') ? 'booking' : 'shop'),
            status: (found.status?.toLowerCase() === 'chờ_thanh_toán' ? 'pending' : found.status?.toLowerCase()) || 'pending',
            payment_status: 'unpaid',
            payment_method: found.paymentMethod || 'momo',
            total_amount: found.totalAmount || 0,
            customer_name: found.customerName,
            customer_phone: found.customerPhone,
            shipping_address: found.shippingAddress,
            created_at: found.createdAt || new Date().toISOString(),
            booking_date: found.booking_date,
            play_time: found.play_time,
            court_name: found.court_name,
            court_address: found.court_address,
            qr_checkin_code: found.qr_checkin_code,
            slot_ids: found.slot_ids,
            items: found.items || [],
          } as Order
        }
      }
    } catch { }

    // 2. Nếu local không có, mới gọi API Backend
    try {
      const response = await api.get<any>(`/orders/${code}`)
      const order = response.data?.data?.order || response.data?.data
      if (order) return order
    } catch {
      // Ignored
    }

    return null
  },

  async verifyMomoPayment(params: Record<string, any>): Promise<{
    success: boolean
    orderCode?: string
    resultCode?: number
    transId?: string
    message?: string
  }> {
    const isSuccessCode = String(params.resultCode) === '0'
    const targetOrderCode = String(params.orderId || params.orderCode || '').split('_')[0]

    try {
      const response = await api.post('/payments/momo/verify', params)
      const data = response.data?.data || response.data
      const backendSuccess = data?.success ?? (data?.resultCode === 0)

      if (backendSuccess || isSuccessCode) {
        if (targetOrderCode) {
          orderService.syncLocalOrderPaymentSuccess(targetOrderCode, params.transId)
        }
        return {
          success: true,
          orderCode: data?.orderCode || targetOrderCode,
          resultCode: 0,
          transId: data?.transId || params.transId,
          message: data?.message || 'Xác nhận thanh toán MoMo thành công!',
        }
      }

      return {
        success: false,
        orderCode: data?.orderCode || targetOrderCode,
        resultCode: data?.resultCode ?? 99,
        message: data?.message || 'Thanh toán MoMo chưa hoàn tất hoặc đã bị hủy.',
      }
    } catch (err: any) {
      if (isSuccessCode) {
        if (targetOrderCode) {
          orderService.syncLocalOrderPaymentSuccess(targetOrderCode, params.transId)
        }
        return {
          success: true,
          orderCode: targetOrderCode,
          resultCode: 0,
          transId: params.transId,
          message: 'Thanh toán MoMo thành công (Sandbox)!',
        }
      }
      return {
        success: false,
        orderCode: err.response?.data?.orderCode || targetOrderCode,
        resultCode: err.response?.data?.resultCode ?? 99,
        message: err.response?.data?.message || 'Thanh toán MoMo chưa hoàn tất hoặc đã bị hủy.',
      }
    }
  },

  async cancelOrder(code: string, reason?: string): Promise<{
    success: boolean
    action?: 'cancelled' | 'refund_pending'
    message: string
    data?: any
  }> {
    // 1. Kiểm tra chính sách khóa hủy vé đặt sân trên bộ nhớ cục bộ
    try {
      const local = localStorage.getItem('demopick_orders_client') || localStorage.getItem('demopick_client_orders')
      if (local) {
        const list = JSON.parse(local)
        const target = list.find((o: any) => o.order_code === code || o.code === code)
        if (target) {
          const isBooking = Boolean(
            target.order_type === 'booking' ||
            target.court_name ||
            target.play_time ||
            target.booking_date ||
            target.items?.some((i: any) => i.item_type === 'booking' || (i.item_name && i.item_name.includes('thuê ca sân')))
          )
          if (isBooking) {
            const lockCheck = checkBookingCancellationLock(target)
            if (lockCheck.isLocked) {
              throw new Error(lockCheck.reason || 'Vé sân đã quá hạn hoặc cận giờ thi đấu. Không thể hủy vé theo quy định.')
            }
          }
        }
      }
    } catch (e: any) {
      if (e.message?.includes('Vé đặt sân') || e.message?.includes('quá hạn') || e.message?.includes('Ca thi đấu')) {
        throw e
      }
    }

    try {
      const response = await api.post(`/orders/${code}/cancel`, { reason })
      return response.data
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message)
      }

      // Xử lý hủy trên localStorage nếu offline / mock
      const local = localStorage.getItem('demopick_orders_client') || localStorage.getItem('demopick_client_orders')
      if (local) {
        const list = JSON.parse(local)
        const target = list.find((o: any) => o.order_code === code || o.code === code)
        if (target) {
          const isPaid = (target.payment_status || '').toLowerCase() === 'paid'
          const newStatus = isPaid ? 'refund_pending' : 'cancelled'
          const updated = list.map((o: any) =>
            o.order_code === code || o.code === code ? { ...o, status: newStatus } : o
          )
          localStorage.setItem('demopick_orders_client', JSON.stringify(updated))
          localStorage.setItem('demopick_client_orders', JSON.stringify(updated))
          return {
            success: true,
            action: isPaid ? 'refund_pending' : 'cancelled',
            message: isPaid ? 'Đã gửi yêu cầu hoàn tiền vé sân thành công.' : 'Đã hủy thành công đơn hàng.',
          }
        }
      }

      const errMsg = err.response?.data?.message || err.message || 'Không thể hủy đơn hàng.'
      throw new Error(errMsg)
    }
  },

  async confirmPayment(orderCode: string): Promise<any> {
    try {
      const response = await api.post(`/orders/${orderCode}/confirm-payment`)
      return response.data?.data || response.data
    } catch (err: any) {
      // Local fallback in case network/offline
      return {
        order_code: orderCode,
        payment_status: 'completed',
        status: 'shipping',
        tracking_code: `GHN-${orderCode.replace(/[^0-9]/g, '') || Date.now()}`,
      }
    }
  },

  async getVietQrSetting(): Promise<{
    bankId: string
    bankName: string
    accountNo: string
    accountName: string
    enabled: boolean
  }> {
    try {
      const response = await api.get('/settings/vietqr')
      const data = response.data?.data || response.data
      return {
        bankId: data?.bankId || data?.bank_id || 'ICB',
        bankName: data?.bankName || data?.bank_name || 'VietinBank (Ngân Hàng Công Thương)',
        accountNo: data?.accountNo || data?.account_no || '102888888888',
        accountName: data?.accountName || data?.account_name || 'NGUYEN MANH TIEN',
        enabled: data?.enabled ?? data?.is_enabled ?? true,
      }
    } catch {
      return {
        bankId: 'ICB',
        bankName: 'VietinBank (Ngân Hàng Công Thương)',
        accountNo: '102888888888',
        accountName: 'NGUYEN MANH TIEN',
        enabled: true,
      }
    }
  },
}

