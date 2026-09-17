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

export const DEFAULT_ADMIN_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Vợt JOOLA Perseus 3S Carbon 16mm",
    slug: "vot-joola-perseus",
    price: 5490000,
    base_price: 5490000,
    image_url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400",
    short_description: "Vợt thi đấu chuyên nghiệp carbon nén cao cấp",
    in_stock: true,
    category: { id: 1, name: "Vợt Pickleball" },
    item_type: "product",
    variants: [{ id: 101, sku: "JOO-PER3S-BLU-16MM", color: "Xanh", weight: "225g", option_name: "Độ dày", option_value: "16mm", price: 5490000, stock_quantity: 25 }]
  },
  {
    id: 2,
    name: "Vợt Selkirk Vanguard Power Air Invikta",
    slug: "vot-selkirk-vanguard",
    price: 6200000,
    base_price: 6200000,
    image_url: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400",
    short_description: "Lực đánh tối ưu kiểm soát xoáy bóng tốt",
    in_stock: true,
    category: { id: 1, name: "Vợt Pickleball" },
    item_type: "product",
    variants: [{ id: 102, sku: "SEL-AIR-RED-STD", color: "Đỏ", weight: "230g", option_name: "Loại cán", option_value: "Cán Dài", price: 6200000, stock_quantity: 20 }]
  },
  {
    id: 3,
    name: "Vợt CRBN 1X Power Series 14mm Raw Carbon",
    slug: "vot-crbn-1x-power",
    price: 4850000,
    base_price: 4850000,
    image_url: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400",
    short_description: "Bề mặt sợi carbon nhám T700 trợ lực xoáy bóng",
    in_stock: true,
    category: { id: 1, name: "Vợt Pickleball" },
    item_type: "product",
    variants: [{ id: 103, sku: "CRBN-1X-14MM", color: "Đen", weight: "220g", option_name: "Độ dày", option_value: "14mm", price: 4850000, stock_quantity: 18 }]
  },
  {
    id: 17,
    name: "Vợt Franklin Signature Pro Carbon 16mm",
    slug: "vot-franklin-signature-pro",
    price: 3450000,
    base_price: 3450000,
    image_url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400",
    short_description: "Điểm ngọt lớn kiểm soát bóng êm ái tiêu chuẩn thi đấu",
    in_stock: true,
    category: { id: 1, name: "Vợt Pickleball" },
    item_type: "product",
    variants: [{ id: 117, sku: "FRA-SIG-16MM", color: "Đen / Trắng", weight: "225g", option_name: "Độ dày", option_value: "16mm", price: 3450000, stock_quantity: 22 }]
  },
  {
    id: 4,
    name: "Hộp 12 Bóng Franklin X-40 Outdoor (Vàng)",
    slug: "bong-franklin-x40",
    price: 420000,
    base_price: 420000,
    image_url: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400",
    short_description: "Bóng tiêu chuẩn thi đấu ngoài trời USAPA Approved",
    in_stock: true,
    category: { id: 2, name: "Bóng Pickleball" },
    item_type: "product",
    variants: [{ id: 104, sku: "FRA-X40-YELLOW-PACK12", color: "Vàng", weight: "26g", option_name: "Quy cách", option_value: "Hộp 12 Quả", price: 420000, stock_quantity: 50 }]
  },
  {
    id: 5,
    name: "Hộp 3 Quả Bóng Dura Fast 40 Chuyên Nghiệp",
    slug: "bong-dura-fast-40",
    price: 150000,
    base_price: 150000,
    image_url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400",
    short_description: "Bóng giải đấu PPA Tour tốc độ bay chuẩn",
    in_stock: true,
    category: { id: 2, name: "Bóng Pickleball" },
    item_type: "product",
    variants: [{ id: 105, sku: "DUR-FAST40-PACK3", color: "Vàng Neon", weight: "26g", option_name: "Quy cách", option_value: "Hộp 3 Quả", price: 150000, stock_quantity: 80 }]
  },
  {
    id: 18,
    name: "Hộp 3 Quả Bóng Thi Đấu Gamma Photon",
    slug: "bong-gamma-photon",
    price: 140000,
    base_price: 140000,
    image_url: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400",
    short_description: "Bóng thi đấu độ nảy ổn định và siêu bền",
    in_stock: true,
    category: { id: 2, name: "Bóng Pickleball" },
    item_type: "product",
    variants: [{ id: 118, sku: "GAM-PHO-PACK3", color: "Vàng Quang Học", weight: "26g", option_name: "Quy cách", option_value: "Hộp 3 Quả", price: 140000, stock_quantity: 65 }]
  },
  {
    id: 6,
    name: "Băng Quấn Cán Vợt Chống Trơn Wilson Pro Grip (Set 3 cái)",
    slug: "bang-quan-can-wilson-pro",
    price: 105000,
    base_price: 105000,
    image_url: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400",
    short_description: "Thấm hút mồ hôi êm ái chống trượt tay khi thi đấu",
    in_stock: true,
    category: { id: 3, name: "Phụ kiện & Quấn cán" },
    item_type: "product",
    variants: [{ id: 106, sku: "WIL-GRIP-SET3", color: "Trắng", weight: "15g", option_name: "Quy cách", option_value: "Set 3 Cuộn", price: 105000, stock_quantity: 120 }]
  },
  {
    id: 7,
    name: "Bao Vợt Pickleball Chống Sốc JOOLA Tour Pro",
    slug: "bao-vot-joola-tour-pro",
    price: 650000,
    base_price: 650000,
    image_url: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=400",
    short_description: "Bao chống sốc có ngăn đựng giày và phụ kiện",
    in_stock: true,
    category: { id: 3, name: "Phụ kiện & Quấn cán" },
    item_type: "product",
    variants: [{ id: 107, sku: "JOO-BAG-TOUR", color: "Đen / Xám", weight: "450g", option_name: "Kích thước", option_value: "Standard", price: 650000, stock_quantity: 30 }]
  },
  {
    id: 8,
    name: "Dây Chì Dán Cân Bằng Đầu Vợt Lead Tape 3g (Set 4 thanh)",
    slug: "day-chi-lead-tape",
    price: 90000,
    base_price: 90000,
    image_url: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400",
    short_description: "Tăng trọng lượng và độ mở rộng của sweet spot",
    in_stock: true,
    category: { id: 3, name: "Phụ kiện & Quấn cán" },
    item_type: "product",
    variants: [{ id: 108, sku: "LEAD-TAPE-3G", color: "Bạc", weight: "12g", option_name: "Quy cách", option_value: "Vỉ 4 Thanh", price: 90000, stock_quantity: 65 }]
  },
  {
    id: 9,
    name: "Nước Điện Giải Pocari Sweat 500ml",
    slug: "nuoc-pocari-sweat-500ml",
    price: 25000,
    base_price: 25000,
    image_url: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400",
    short_description: "Nước bù khoáng chất & ion điện giải cho VĐV",
    in_stock: true,
    category: { id: 5, name: "Đồ uống & Đồ ăn" },
    item_type: "drink_food",
    variants: [{ id: 109, sku: "POC-500ML", color: "Xanh", weight: "500g", option_name: "Dung tích", option_value: "Chai 500ml", price: 25000, stock_quantity: 120 }]
  },
  {
    id: 10,
    name: "Nước Suối Aquafina 500ml",
    slug: "nuoc-suoi-aquafina",
    price: 10000,
    base_price: 10000,
    image_url: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400",
    short_description: "Nước tinh khiết đóng chai ướp lạnh tại quầy",
    in_stock: true,
    category: { id: 5, name: "Đồ uống & Đồ ăn" },
    item_type: "drink_food",
    variants: [{ id: 110, sku: "AQU-500ML", color: "Trong suốt", weight: "500g", option_name: "Quy cách", option_value: "Chai 500ml", price: 10000, stock_quantity: 250 }]
  },
  {
    id: 11,
    name: "Nước Revive Chanh Muối Bù Nước 500ml",
    slug: "nuoc-revive-chanh-muoi",
    price: 20000,
    base_price: 20000,
    image_url: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400",
    short_description: "Bổ sung muối khoáng và vitamin B3, B6, B12",
    in_stock: true,
    category: { id: 5, name: "Đồ uống & Đồ ăn" },
    item_type: "drink_food",
    variants: [{ id: 111, sku: "REV-500ML", color: "Vàng chanh", weight: "500g", option_name: "Dung tích", option_value: "Chai 500ml", price: 20000, stock_quantity: 150 }]
  },
  {
    id: 12,
    name: "Nước Tăng Lực Red Bull Thái Lan 250ml",
    slug: "nuoc-redbull-thai",
    price: 25000,
    base_price: 25000,
    image_url: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=400",
    short_description: "Bổ sung năng lượng và sự tỉnh táo trước trận đấu",
    in_stock: true,
    category: { id: 5, name: "Đồ uống & Đồ ăn" },
    item_type: "drink_food",
    variants: [{ id: 112, sku: "RED-BULL-250ML", color: "Vàng", weight: "250g", option_name: "Dung tích", option_value: "Lon 250ml", price: 25000, stock_quantity: 90 }]
  },
  {
    id: 16,
    name: "Nước Dừa Xiêm Tươi Ướp Lạnh 500ml",
    slug: "nuoc-dua-xiem-tuoi",
    price: 30000,
    base_price: 30000,
    image_url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400",
    short_description: "Nước dừa xiêm Bến Tre tự nhiên mát lạnh bổ sung khoáng",
    in_stock: true,
    category: { id: 5, name: "Đồ uống & Đồ ăn" },
    item_type: "drink_food",
    variants: [{ id: 116, sku: "COCO-500ML", color: "Tự nhiên", weight: "500g", option_name: "Dung tích", option_value: "Chai 500ml", price: 30000, stock_quantity: 60 }]
  },
  {
    id: 13,
    name: "Bánh Thể Thao Protein Bar Snickers 50g",
    slug: "banh-protein-snickers",
    price: 35000,
    base_price: 35000,
    image_url: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400",
    short_description: "Bổ sung Protein chống đói và phục hồi thể lực",
    in_stock: true,
    category: { id: 5, name: "Đồ uống & Đồ ăn" },
    item_type: "drink_food",
    variants: [{ id: 113, sku: "SNK-BAR-50G", color: "Nâu", weight: "50g", option_name: "Quy cách", option_value: "Thanh 50g", price: 35000, stock_quantity: 80 }]
  },
  {
    id: 14,
    name: "Dịch Vụ Cho Thuê Vợt Tập JOOLA (30k/giờ)",
    slug: "dich-vu-thue-vot-tap",
    price: 30000,
    base_price: 30000,
    image_url: "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=400",
    short_description: "Món cố định: Thuê vợt tập theo giờ chơi tại cụm sân",
    in_stock: true,
    category: { id: 4, name: "Cho thuê đồ" },
    item_type: "rental",
    variants: [{ id: 114, sku: "RENT-PAD-01", color: "Mặc định", weight: "220g", option_name: "Thời lượng", option_value: "Gói 1 Giờ", price: 30000, stock_quantity: 20 }]
  },
  {
    id: 15,
    name: "Dịch Vụ Cho Thuê Máy Bắn Bóng Tập Luyện (100k/giờ)",
    slug: "dich-vu-thue-may-ban-bong",
    price: 100000,
    base_price: 100000,
    image_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
    short_description: "Món cố định: Thuê máy tập bắn bóng tự động theo giờ",
    in_stock: true,
    category: { id: 4, name: "Cho thuê đồ" },
    item_type: "rental",
    variants: [{ id: 115, sku: "RENT-BALL-MACHINE", color: "Mặc định", weight: "15kg", option_name: "Thời lượng", option_value: "Gói 1 Giờ", price: 100000, stock_quantity: 3 }]
  },
]

export const adminService = {
  getCourts: async (): Promise<Court[]> => {
    return [
      { id: 1, code: "S01", name: "Sân Pickleball A1", court_number: "A1", type: "Pickleball Standard Indoor", hourly_rate: 140000, peak_hourly_rate: 180000, status: "active" },
      { id: 2, code: "S02", name: "Sân Pickleball A2", court_number: "A2", type: "Pickleball Standard Indoor", hourly_rate: 140000, peak_hourly_rate: 180000, status: "active" },
      { id: 3, code: "S03", name: "Sân Pickleball B1", court_number: "B1", type: "Pickleball Standard Outdoor", hourly_rate: 140000, peak_hourly_rate: 180000, status: "active" },
      { id: 4, code: "S04", name: "Sân Pickleball B2", court_number: "B2", type: "Pickleball Standard Outdoor", hourly_rate: 140000, peak_hourly_rate: 180000, status: "active" },
      { id: 5, code: "SV1", name: "Sân Pickleball C1", court_number: "C1", type: "Tiêu Chuẩn Pro", hourly_rate: 180000, peak_hourly_rate: 220000, status: "active" },
      { id: 6, code: "SV2", name: "Sân Pickleball C2", court_number: "C2", type: "Tiêu Chuẩn Pro", hourly_rate: 180000, peak_hourly_rate: 220000, status: "active" },
      { id: 7, code: "S07", name: "Sân Pickleball D1", court_number: "D1", type: "Tiêu Chuẩn Pro", hourly_rate: 140000, peak_hourly_rate: 180000, status: "active" },
      { id: 8, code: "S08", name: "Sân Pickleball D2", court_number: "D2", type: "Tiêu Chuẩn Pro", hourly_rate: 140000, peak_hourly_rate: 180000, status: "active" },
    ]
  },

  getSlots: async (date: string): Promise<TimeSlot[]> => {
    const timeHeaders = [
      "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
      "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
    ]
    const mockSlots: TimeSlot[] = []
    let slotId = 1

    const bookedConfig: Record<number, { bookedHours: number[]; heldHours: number[]; inUseHours: number[] }> = {
      1: { bookedHours: [10, 11, 17, 18], heldHours: [12], inUseHours: [8] },
      2: { bookedHours: [7, 18, 19], heldHours: [14], inUseHours: [] },
        3: { bookedHours: [6, 7, 19, 20], heldHours: [16], inUseHours: [8] },
        4: { bookedHours: [9, 15, 18], heldHours: [], inUseHours: [] },
        5: { bookedHours: [7, 8, 18, 19], heldHours: [17], inUseHours: [] },
        6: { bookedHours: [8, 9, 19, 20], heldHours: [15], inUseHours: [] },
        7: { bookedHours: [8, 18], heldHours: [], inUseHours: [19] },
        8: { bookedHours: [9, 17], heldHours: [18], inUseHours: [] },
      }

      ;[1, 2, 3, 4, 5, 6, 7, 8].forEach(courtId => {
        const isVip = courtId >= 5
        const baseRate = isVip ? 180000 : 140000
        const peakRate = isVip ? 220000 : 180000

        timeHeaders.forEach(timeStr => {
          const hour = parseInt(timeStr.split(":")[0], 10)
          const isPeak = hour >= 17 && hour <= 21
          const price = isPeak ? peakRate : baseRate

          const cfg = bookedConfig[courtId] || { bookedHours: [], heldHours: [], inUseHours: [] }
          let status: TimeSlot['status'] = 'available'
          if (cfg.inUseHours.includes(hour)) {
            status = 'in_use'
          } else if (cfg.bookedHours.includes(hour)) {
            status = 'booked'
          } else if (cfg.heldHours.includes(hour)) {
            status = 'held'
          }

          const endHour = String(hour + 1).padStart(2, '0')
          mockSlots.push({
            id: slotId++,
            court_id: courtId,
            date,
            start_time: `${timeStr}:00`,
            end_time: `${endHour}:00:00`,
            price,
            is_peak: isPeak,
            status,
            held_expires_at: status === 'held' ? new Date(Date.now() + 8 * 60 * 1000).toISOString() : null,
          })
        })
      })
      return mockSlots
    },

  getProducts: async (): Promise<Product[]> => {
    const syncedRaw = localStorage.getItem("demopick_synced_products")
    if (syncedRaw) {
      try {
        const syncedList: Product[] = JSON.parse(syncedRaw)
        if (Array.isArray(syncedList) && syncedList.length > 0) {
          const syncedIds = new Set(syncedList.map((i) => i.id))
          const nonSynced = DEFAULT_ADMIN_PRODUCTS.filter((s) => !syncedIds.has(s.id))
          return [...syncedList, ...nonSynced]
        }
      } catch {}
    }
    return DEFAULT_ADMIN_PRODUCTS
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
        image_url: productData.image_url || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400',
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
      return res.data.data
    } catch {
      return []
    }
  },

  updateOrderStatus: async (orderId: number, status: string): Promise<any> => {
    try {
      const res = await api.put<ApiResponse<any>>(`/admin/orders/${orderId}/status`, { status })
      return res.data.data
    } catch {
      return { id: orderId, status }
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
    const now = new Date()
    // Sân A1 started 45 minutes ago
    const a1Start = new Date(now.getTime() - 45 * 60 * 1000)
    const a1StartStr = `${String(a1Start.getHours()).padStart(2, '0')}:${String(a1Start.getMinutes()).padStart(2, '0')}:${String(a1Start.getSeconds()).padStart(2, '0')}`

    // Sân B1 started 80 minutes ago
    const b1Start = new Date(now.getTime() - 80 * 60 * 1000)
    const b1StartStr = `${String(b1Start.getHours()).padStart(2, '0')}:${String(b1Start.getMinutes()).padStart(2, '0')}:${String(b1Start.getSeconds()).padStart(2, '0')}`

    // Sân D1 started 25 minutes ago
    const d1Start = new Date(now.getTime() - 25 * 60 * 1000)
    const d1StartStr = `${String(d1Start.getHours()).padStart(2, '0')}:${String(d1Start.getMinutes()).padStart(2, '0')}:${String(d1Start.getSeconds()).padStart(2, '0')}`

    return [
      {
        id: 1,
        name: "Sân Pickleball A1",
        code: "S01",
        surface_type: "Trong nhà",
        status: "in_use",
        status_label: "ĐANG CHƠI",
        session_id: 101,
        start_time: a1StartStr,
        start_time_formatted: a1StartStr,
        elapsed_minutes: 45,
        rounded_minutes: 45,
        current_price: 105000,
        hourly_rate: 140000,
        customer_name: "Hoàng Long",
        customer_phone: "0912.345.678",
        expected_duration_minutes: 60,
        expected_end_time: "15 phút nữa",
      },
      {
        id: 2,
        name: "Sân Pickleball A2",
        code: "S02",
        surface_type: "Trong nhà",
        status: "available",
        status_label: "TRỐNG",
        session_id: null,
        hourly_rate: 140000,
        customer_name: null,
        customer_phone: null,
        available_minutes_until_next: 90,
        next_booking_time: "19:30",
      },
      {
        id: 3,
        name: "Sân Pickleball B1",
        code: "S03",
        surface_type: "Ngoài trời",
        status: "ending",
        status_label: "SẮP HẾT GIỜ",
        session_id: 103,
        start_time: b1StartStr,
        start_time_formatted: b1StartStr,
        elapsed_minutes: 80,
        rounded_minutes: 90,
        current_price: 210000,
        hourly_rate: 140000,
        customer_name: "Chị Minh Thảo",
        customer_phone: "0988.765.432",
        expected_duration_minutes: 90,
        expected_end_time: "10 phút nữa",
      },
      {
        id: 4,
        name: "Sân Pickleball B2",
        code: "S04",
        surface_type: "Ngoài trời",
        status: "available",
        status_label: "TRỐNG",
        session_id: null,
        hourly_rate: 140000,
        customer_name: null,
        customer_phone: null,
        available_minutes_until_next: 120,
        next_booking_time: "20:00",
      },
      {
        id: 5,
        name: "Sân Pickleball C1",
        code: "SV1",
        surface_type: "Cụm C",
        status: "booked",
        status_label: "ĐÃ ĐẶT",
        session_id: null,
        hourly_rate: 180000,
        customer_name: "CLB Doanh Nhân SG",
        customer_phone: "0903.111.222",
        next_booking_time: "18:00 (Hôm nay)",
      },
      {
        id: 6,
        name: "Sân Pickleball C2",
        code: "SV2",
        surface_type: "Cụm C",
        status: "available",
        status_label: "TRỐNG",
        session_id: null,
        hourly_rate: 180000,
        customer_name: null,
        customer_phone: null,
        available_minutes_until_next: null,
        next_booking_time: null,
      },
      {
        id: 7,
        name: "Sân Pickleball D1",
        code: "S07",
        surface_type: "Cụm D",
        status: "in_use",
        status_label: "ĐANG ĐÁNH",
        session_id: 1007,
        start_time: d1StartStr,
        start_time_formatted: d1StartStr,
        elapsed_minutes: 25,
        rounded_minutes: 30,
        current_price: 70000,
        hourly_rate: 140000,
        customer_name: "Anh Hoàng Nam",
        customer_phone: "0912.333.444",
        expected_duration_minutes: 60,
        expected_end_time: "35 phút nữa",
      },
      {
        id: 8,
        name: "Sân Pickleball D2",
        code: "S08",
        surface_type: "Cụm D",
        status: "available",
        status_label: "TRỐNG",
        session_id: null,
        hourly_rate: 140000,
        customer_name: null,
        customer_phone: null,
        available_minutes_until_next: null,
        next_booking_time: null,
      },
    ]
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
}

