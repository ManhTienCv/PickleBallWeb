import api, { ApiResponse } from '@/lib/api'

export interface Court {
  id: number
  code: string
  name: string
  court_number: string
  type: string
  hourly_rate: number
  peak_hourly_rate: number
  status: string
}

export interface TimeSlot {
  id: number
  court_id: number
  date: string
  start_time: string
  end_time: string
  price: number
  is_peak: boolean
  status: 'available' | 'held' | 'booked' | 'locked' | 'in_use'
  held_expires_at: string | null
}

export interface LiveCourtItem {
  id: number
  name: string
  code: string
  surface_type: string
  status: 'available' | 'in_use' | 'ending' | 'booked'
  status_label: string
  session_id: number | null
  start_time?: string
  start_time_formatted?: string
  elapsed_minutes?: number
  rounded_minutes?: number
  current_price?: number
  hourly_rate: number
  customer_name?: string | null
  customer_phone?: string | null
  expected_duration_minutes?: number | null
  expected_end_time?: string | null
  available_minutes_until_next?: number | null
  next_booking_time?: string | null
}

export interface ProductVariant {
  id: number
  sku: string
  color: string
  weight: string
  option_name: string
  option_value: string
  price: number
  stock_quantity: number
}

export interface ProductCategory {
  id?: number
  name?: string
  slug?: string
  description?: string
  image_url?: string | null
}

export interface TechnicalSpecs {
  material?: string
  thickness?: string
  weight?: string
  usapa_certified?: boolean
  origin?: string
}

export interface Product {
  id: number
  name: string
  slug: string
  price: number
  base_price: number
  image_url: string | null
  short_description: string
  description?: string
  in_stock: boolean
  category?: ProductCategory
  item_type?: 'product' | 'rental' | 'drink_food'
  variants: ProductVariant[]
  specs?: TechnicalSpecs
}

export interface PosCheckoutRequest {
  cart_items: {
    product_variant_id: number
    quantity: number
  }[]
  payment_method: 'cash' | 'bank_transfer'
  customer_phone?: string
}

export {
  DEFAULT_ADMIN_PRODUCTS,
  DEFAULT_ADMIN_COURTS,
  DEFAULT_ADMIN_LIVE_COURTS,
} from '@/data/mockAdminData'
import {
  DEFAULT_ADMIN_PRODUCTS,
  DEFAULT_ADMIN_COURTS,
  DEFAULT_ADMIN_LIVE_COURTS,
} from '@/data/mockAdminData'

export function generateDefaultAdminSlots(date: string): TimeSlot[] {
  const timeSlots: TimeSlot[] = []
  const times = [
    { start: "05:00", end: "06:00", peak: false },
    { start: "06:00", end: "07:00", peak: false },
    { start: "07:00", end: "08:00", peak: false },
    { start: "08:00", end: "09:00", peak: false },
    { start: "09:00", end: "10:00", peak: false },
    { start: "10:00", end: "11:00", peak: false },
    { start: "11:00", end: "12:00", peak: false },
    { start: "12:00", end: "13:00", peak: false },
    { start: "13:00", end: "14:00", peak: false },
    { start: "14:00", end: "15:00", peak: false },
    { start: "15:00", end: "16:00", peak: false },
    { start: "16:00", end: "17:00", peak: false },
    { start: "17:00", end: "18:00", peak: true },
    { start: "18:00", end: "19:00", peak: true },
    { start: "19:00", end: "20:00", peak: true },
    { start: "20:00", end: "21:00", peak: true },
    { start: "21:00", end: "22:00", peak: true },
  ]

  const bookedSlotIds = new Set<string>()
  try {
    const rawBooked = localStorage.getItem('demopick_booked_slots')
    if (rawBooked) {
      const arr = JSON.parse(rawBooked)
      if (Array.isArray(arr)) arr.forEach((id) => bookedSlotIds.add(String(id)))
    }
  } catch {}

  try {
    const rawOrders = localStorage.getItem('demopick_orders_admin')
    if (rawOrders) {
      const orders = JSON.parse(rawOrders)
      if (Array.isArray(orders)) {
        orders.forEach((o: any) => {
          if (o.status !== 'cancelled' && o.status !== 'HỦY_ĐƠN') {
            if (Array.isArray(o.slot_ids)) {
              o.slot_ids.forEach((id: any) => bookedSlotIds.add(String(id)))
            }
          }
        })
      }
    }
  } catch {}

  try {
    const rawClientOrders = localStorage.getItem('demopick_orders_client')
    if (rawClientOrders) {
      const orders = JSON.parse(rawClientOrders)
      if (Array.isArray(orders)) {
        orders.forEach((o: any) => {
          if (o.status !== 'cancelled' && o.payment_status !== 'failed') {
            if (Array.isArray(o.slot_ids)) {
              o.slot_ids.forEach((id: any) => bookedSlotIds.add(String(id)))
            }
            if (Array.isArray(o.items)) {
              o.items.forEach((it: any) => {
                if (it.slot_ids && Array.isArray(it.slot_ids)) {
                  it.slot_ids.forEach((id: any) => bookedSlotIds.add(String(id)))
                }
                if (it.item_type === 'booking' && it.id) {
                  bookedSlotIds.add(String(it.id))
                }
              })
            }
          }
        })
      }
    }
  } catch {}

  let idCounter = 1
  DEFAULT_ADMIN_COURTS.forEach((court) => {
    times.forEach((t) => {
      const slotId = idCounter++
      const price = t.peak ? court.peak_hourly_rate : court.hourly_rate
      let status: 'available' | 'held' | 'booked' | 'locked' | 'in_use' = 'available'
      if (bookedSlotIds.has(String(slotId))) {
        status = 'booked'
      }

      timeSlots.push({
        id: slotId,
        court_id: court.id,
        date,
        start_time: t.start,
        end_time: t.end,
        price,
        is_peak: t.peak,
        status,
        held_expires_at: null,
      })
    })
  })

  return timeSlots
}

function normalizeAdminProduct(p: any): Product {
  const cat = p.category || (p.categoryId === 1 ? { id: 1, name: "Vợt Pickleball", slug: "vot-pickleball" }
    : p.categoryId === 2 ? { id: 2, name: "Bóng Pickleball", slug: "bong-pickleball" }
    : p.categoryId === 3 ? { id: 3, name: "Phụ kiện & Bao vợt", slug: "phu-kien-bao-vot" }
    : p.categoryId === 4 ? { id: 4, name: "Quần áo & Trang phục", slug: "quan-ao-trang-phuc" }
    : p.categoryId === 5 ? { id: 5, name: "Đồ uống & Đồ ăn", slug: "do-uong-do-an" }
    : p.categoryId === 6 ? { id: 6, name: "Thiết bị & Dịch vụ cho thuê", slug: "thiet-bi-dich-vu-cho-thue" }
    : undefined);

  const slug = (p.slug || '').toLowerCase();
  const catSlug = (cat?.slug || '').toLowerCase();
  const catName = (cat?.name || '').toLowerCase();

  const isDrink = p.item_type === 'drink_food' || p.itemType === 'drink_food' || p.categoryId === 5 || cat?.id === 5 || catSlug.includes('do-uong') || catName.includes('đồ uống') || catName.includes('đồ ăn') || slug.includes('pocari') || slug.includes('revive') || slug.includes('lavie') || slug.includes('red-bull') || slug.includes('dua') || slug.includes('tra-chanh') || slug.includes('coffee') || slug.includes('granola') || slug.includes('snickers') || slug.includes('banana') || slug.includes('dole');

  const isRental = p.item_type === 'rental' || p.itemType === 'rental' || p.categoryId === 6 || cat?.id === 6 || catSlug.includes('thue') || catName.includes('thuê') || slug.includes('thue-');

  const itemType: 'product' | 'rental' | 'drink_food' = isDrink ? 'drink_food' : (isRental ? 'rental' : 'product');

  let imageUrl = p.image_url || p.imageUrl;
  if (!imageUrl && p.images) {
    try {
      const parsed = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
      if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
    } catch {}
  }

  const price = Number(p.price || p.base_price || p.basePrice || 0);

  const variants: ProductVariant[] = Array.isArray(p.variants) && p.variants.length > 0
    ? p.variants.map((v: any) => ({
        id: v.id || (p.id * 100 + 1),
        sku: v.sku || `SKU-${p.id}`,
        color: v.color || '',
        weight: v.weight || '',
        option_name: v.option_name || v.optionName || 'Quy cách',
        option_value: v.option_value || v.optionValue || 'Tiêu chuẩn',
        price: Number(v.price || v.priceOverride || price),
        stock_quantity: v.stock_quantity ?? v.stockQty ?? 50,
      }))
    : [{
        id: p.id * 100 + 1,
        sku: `SKU-${p.id}`,
        color: '',
        weight: '',
        option_name: 'Quy cách',
        option_value: 'Tiêu chuẩn',
        price: price,
        stock_quantity: 50,
      }];

  return {
    ...p,
    category: cat,
    item_type: itemType,
    image_url: imageUrl || (isDrink ? '/images/pocari_sweat_500ml.jpg' : '/images/pickleball_paddle_joola.jpg'),
    price: price,
    base_price: price,
    in_stock: p.in_stock !== undefined ? Boolean(p.in_stock) : true,
    variants: variants,
  };
}

export const adminService = {
  getCourts: async (): Promise<Court[]> => {
    try {
      const res = await api.get<ApiResponse<Court[]>>('/courts')
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data
      }
      return DEFAULT_ADMIN_COURTS
    } catch {
      return DEFAULT_ADMIN_COURTS
    }
  },

  getSlots: async (date: string): Promise<TimeSlot[]> => {
    try {
      const res = await api.get<ApiResponse<TimeSlot[]>>('/slots', { params: { date } })
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data
      }
      return generateDefaultAdminSlots(date)
    } catch {
      return generateDefaultAdminSlots(date)
    }
  },

  getProducts: async (): Promise<Product[]> => {
    try {
      const res = await api.get<ApiResponse<Product[]>>('/products?per_page=100')
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length >= 30) {
        return res.data.data.map(normalizeAdminProduct)
      }
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const apiNormalized = res.data.data.map(normalizeAdminProduct)
        const apiSlugs = new Set(apiNormalized.map((p) => p.slug))
        const missing = DEFAULT_ADMIN_PRODUCTS.filter((p) => !apiSlugs.has(p.slug))
        return [...apiNormalized, ...missing]
      }
      return DEFAULT_ADMIN_PRODUCTS
    } catch {
      return DEFAULT_ADMIN_PRODUCTS
    }
  },

  posCheckout: async (payload: PosCheckoutRequest): Promise<{ order_code: string }> => {
    try {
      const res = await api.post<ApiResponse<{ order_code: string }>>('/checkout', payload)
      return res.data.data
    } catch {
      return { order_code: `POS-${Math.floor(10000 + Math.random() * 90000)}` }
    }
  },

  verifyCheckIn: async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post<ApiResponse<{ success: boolean; message: string }>>('/checkin/scan', { code })
      return res.data.data
    } catch {
      return { success: true, message: `Check-in thành công cho mã đặt sân #${code}` }
    }
  },

  createProduct: async (productData: Partial<Product> & { stock_quantity?: number; sku?: string }): Promise<Product> => {
    try {
      const res = await api.post<ApiResponse<Product>>('/admin/products', productData)
      return res.data.data
    } catch {
      return {
        id: Date.now(),
        name: productData.name || 'Sản phẩm mới',
        slug: (productData.name || 'san-pham-moi').toLowerCase().replace(/\s+/g, '-'),
        price: Number(productData.price) || 0,
        base_price: Number(productData.price) || 0,
        image_url: productData.image_url || '/images/pickleball_paddle_joola.jpg',
        short_description: productData.short_description || '',
        in_stock: true,
        category: { name: productData.category?.name || 'Vợt Pickleball' },
        variants: [
          {
            id: Date.now() + 1,
            sku: productData.sku || 'SKU-NEW',
            color: 'Mặc định',
            weight: 'Tiêu chuẩn',
            option_name: 'Phiên bản',
            option_value: 'Tiêu chuẩn',
            price: Number(productData.price) || 0,
            stock_quantity: productData.stock_quantity || 10,
          },
        ],
      }
    }
  },

  updateProduct: async (id: number, productData: Partial<Product>): Promise<Product> => {
    try {
      const res = await api.put<ApiResponse<Product>>(`/admin/products/${id}`, productData)
      return res.data.data
    } catch {
      return productData as Product
    }
  },

  adjustStock: async (id: number, changeQty: number, type: 'in' | 'out' | 'adjust', notes?: string): Promise<Product> => {
    try {
      const res = await api.post<ApiResponse<Product>>(`/admin/products/${id}/stock`, { change_qty: changeQty, type, notes })
      return res.data.data
    } catch {
      throw new Error('Không thể điều chỉnh tồn kho')
    }
  },

  toggleCourtLock: async (courtId: number, status: 'active' | 'maintenance'): Promise<{ id: number; status: string }> => {
    try {
      const res = await api.post<ApiResponse<{ id: number; status: string }>>(`/admin/courts/${courtId}/lock`, { status })
      return res.data.data
    } catch {
      return { id: courtId, status }
    }
  },

  getAdminOrders: async (): Promise<any[]> => {
    try {
      const res = await api.get<ApiResponse<any[]>>('/admin/orders')
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data
      }
      const saved = localStorage.getItem('demopick_orders_admin')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        } catch {}
      }
      return []
    } catch {
      const saved = localStorage.getItem('demopick_orders_admin')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        } catch {}
      }
      return []
    }
  },

  updateOrderStatus: async (orderId: number | string, status: string): Promise<any> => {
    try {
      const res = await api.put<ApiResponse<any>>(`/admin/orders/${orderId}/status`, { status })
      return res.data.data
    } catch {
      return { id: orderId, status }
    }
  },

  cancelOrder: async (orderCode: string, reason?: string): Promise<any> => {
    try {
      const res = await api.post<ApiResponse<any>>(`/admin/orders/${orderCode}/cancel`, { reason })
      return res.data?.data || res.data
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 404 || status === 500) {
        try {
          const fallbackRes = await api.post<ApiResponse<any>>(`/orders/${orderCode}/cancel`, { reason })
          return fallbackRes.data?.data || fallbackRes.data
        } catch (fbErr: any) {
          throw fbErr
        }
      }
      throw err
    }
  },

  confirmRefund: async (orderCode: string, params?: { refund_trans_id?: string; refund_note?: string }): Promise<any> => {
    try {
      const res = await api.post<ApiResponse<any>>(`/admin/orders/${orderCode}/refund`, params || {})
      return res.data.data
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi khi xác nhận hoàn tiền.'
      throw new Error(msg)
    }
  },

  getRevenueReport: async (): Promise<any> => {
    try {
      const res = await api.get<ApiResponse<any>>('/admin/reports/revenue')
      return res.data.data
    } catch {
      return { total_revenue: 125000000, court_revenue: 75000000, shop_revenue: 50000000 }
    }
  },

  getLiveCourtStatus: async (): Promise<LiveCourtItem[]> => {
    try {
      const res = await api.get<ApiResponse<LiveCourtItem[]>>('/admin/courts/live-status')
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data
      }
      return DEFAULT_ADMIN_LIVE_COURTS
    } catch {
      return DEFAULT_ADMIN_LIVE_COURTS
    }
  },

  getUsers: async (): Promise<any[]> => {
    try {
      const res = await api.get<ApiResponse<any[]>>('/admin/users')
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data
      }
      const saved = localStorage.getItem('demopick_system_users_v2')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        } catch {}
      }
      return []
    } catch {
      const saved = localStorage.getItem('demopick_system_users_v2')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        } catch {}
      }
      return []
    }
  },

  startCourtSession: async (courtId: number, data: {
    customer_name?: string
    customer_phone?: string
    duration_minutes?: number
    hourly_rate?: number
    booking_id?: number
    notes?: string
  }): Promise<any> => {
    try {
      const res = await api.post<ApiResponse<any>>(`/admin/courts/${courtId}/start-session`, data)
      return res.data.data
    } catch {
      const now = new Date()
      const startTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      return {
        session_id: Date.now(),
        court_id: courtId,
        customer_name: data.customer_name || "Khách vãng lai",
        customer_phone: data.customer_phone || "",
        start_time: startTimeStr,
        status: "in_use",
      }
    }
  },

  stopCourtSession: async (courtId: number): Promise<{
    session: any
    court_name: string
    duration_minutes: number
    exact_minutes: number
    total_price: number
    formatted_price: string
    time_range: string
  }> => {
    try {
      const res = await api.post<ApiResponse<any>>(`/admin/courts/${courtId}/stop-session`)
      return res.data.data
    } catch {
      const courtNames: Record<number, string> = {
        1: "Sân Pickleball A1",
        2: "Sân Pickleball A2",
        3: "Sân Pickleball B1",
        4: "Sân Pickleball B2",
        5: "Sân Pickleball C1",
        6: "Sân Pickleball C2",
        7: "Sân Pickleball D1",
        8: "Sân Pickleball D2",
      }
      const rate = (courtId === 5 || courtId === 6) ? 180000 : 140000
      return {
        session: { id: Date.now(), court_id: courtId },
        court_name: courtNames[courtId] || `Sân ${courtId}`,
        duration_minutes: 60,
        exact_minutes: 58,
        total_price: rate,
        formatted_price: `${new Intl.NumberFormat("vi-VN").format(rate)} đ`,
        time_range: "Vừa kết thúc (1h00)",
      }
    }
  },

  scanCheckIn: async (qrToken: string): Promise<any> => {
    try {
      const res = await api.post<ApiResponse<any>>('/admin/checkin/scan', { qr_token: qrToken })
      return res.data.data
    } catch {
      return {
        success: true,
        booking_code: qrToken.toUpperCase(),
        court_name: "Sân Pickleball C1",
        customer_name: "CLB Doanh Nhân SG",
        time: "18:00 - 20:00",
        message: "Check-in thành công! Khách đã vào sân.",
      }
    }
  },

  getVietQrSetting: async (): Promise<{
    bankId: string
    bankName: string
    accountNo: string
    accountName: string
    enabled: boolean
  }> => {
    try {
      const res = await api.get<ApiResponse<any>>('/admin/settings/vietqr')
      const d = res.data.data
      return {
        bankId: d?.bankId || d?.bank_id || 'ICB',
        bankName: d?.bankName || d?.bank_name || 'VietinBank (Ngân Hàng Công Thương)',
        accountNo: d?.accountNo || d?.account_no || '102888888888',
        accountName: d?.accountName || d?.account_name || 'NGUYEN MANH TIEN',
        enabled: d?.enabled ?? d?.is_enabled ?? true,
      }
    } catch {
      const saved = localStorage.getItem('demopick_vietqr_setting')
      if (saved) {
        try { return JSON.parse(saved) } catch {}
      }
      return {
        bankId: 'ICB',
        bankName: 'VietinBank (Ngân Hàng Công Thương)',
        accountNo: '102888888888',
        accountName: 'NGUYEN MANH TIEN',
        enabled: true,
      }
    }
  },

  updateVietQrSetting: async (setting: {
    bankId: string
    bankName: string
    accountNo: string
    accountName: string
    enabled: boolean
  }): Promise<any> => {
    localStorage.setItem('demopick_vietqr_setting', JSON.stringify(setting))
    try {
      const res = await api.put<ApiResponse<any>>('/admin/settings/vietqr', setting)
      return res.data.data
    } catch {
      return setting
    }
  },

  getPaymentTransactions: async (): Promise<any[]> => {
    try {
      const res = await api.get<ApiResponse<any[]>>('/admin/payments/transactions')
      return res.data.data || []
    } catch {
      return []
    }
  },
}
