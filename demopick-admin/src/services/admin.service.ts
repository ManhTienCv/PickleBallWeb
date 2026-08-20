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
  status: 'available' | 'held' | 'booked' | 'locked'
  held_expires_at: string | null
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

export const adminService = {
  getCourts: async (): Promise<Court[]> => {
    try {
      const res = await api.get<ApiResponse<any[]>>('/courts')
      return res.data.data.map((c) => ({
        id: c.id,
        code: c.code || `S0${c.id}`,
        name: c.name,
        court_number: c.court_number || `0${c.id}`,
        type: c.type || 'Pickleball Standard',
        hourly_rate: Number(c.hourly_rate || c.price_per_hour || 90000),
        peak_hourly_rate: Number(c.peak_hourly_rate || c.peak_price_per_hour || 120000),
        status: c.status || 'active',
      }))
    } catch {
      return [
        { id: 1, code: "S01", name: "Sân A1", court_number: "A1", type: "Pickleball Standard", hourly_rate: 90000, peak_hourly_rate: 120000, status: "active" },
        { id: 2, code: "S02", name: "Sân A2", court_number: "A2", type: "Pickleball Standard", hourly_rate: 90000, peak_hourly_rate: 120000, status: "active" },
        { id: 3, code: "S03", name: "Sân B1", court_number: "B1", type: "Pickleball Standard", hourly_rate: 90000, peak_hourly_rate: 120000, status: "active" },
        { id: 4, code: "S04", name: "Sân B2", court_number: "B2", type: "Pickleball Standard", hourly_rate: 90000, peak_hourly_rate: 120000, status: "active" },
        { id: 5, code: "SV1", name: "Sân C1 (VIP)", court_number: "C1", type: "Pickleball Indoor VIP", hourly_rate: 150000, peak_hourly_rate: 180000, status: "active" },
        { id: 6, code: "SV2", name: "Sân C2 (VIP)", court_number: "C2", type: "Pickleball Indoor VIP", hourly_rate: 150000, peak_hourly_rate: 180000, status: "active" },
      ]
    }
  },

  getSlots: async (date: string): Promise<TimeSlot[]> => {
    try {
      const res = await api.get<ApiResponse<TimeSlot[]>>('/slots', { params: { date } })
      return res.data.data
    } catch {
      const times = ["06:00", "08:00", "10:00", "14:00", "16:00", "18:00", "20:00"]
      const mockSlots: TimeSlot[] = []
      let id = 1
      ;[1, 2, 3, 4, 5, 6].forEach(courtId => {
        times.forEach(t => {
          const isPeak = t === "18:00" || t === "20:00"
          const statusVal = (id % 5 === 0) ? "held" : (id % 3 === 0) ? "booked" : "available"
          mockSlots.push({
            id: id++,
            court_id: courtId,
            date,
            start_time: `${t}:00`,
            end_time: `${parseInt(t.split(':')[0]) + 2}:00:00`,
            price: isPeak ? 150000 : 90000,
            is_peak: isPeak,
            status: statusVal,
            held_expires_at: null,
          })
        })
      })
      return mockSlots
    }
  },

  getProducts: async (): Promise<Product[]> => {
    try {
      const res = await api.get<ApiResponse<Product[]>>('/products')
      return res.data.data
    } catch {
      return [
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
}
