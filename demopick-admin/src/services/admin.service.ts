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
    "id": 1,
    "name": "Vợt JOOLA Perseus 3S Carbon 16mm Ben Johns Edition",
    "slug": "vot-joola-perseus-3s",
    "price": 5490000,
    "sale_price": 5990000,
    "base_price": 5490000,
    "image_url": "/images/pickleball_paddle_joola.jpg",
    "description": "Vợt thi đấu đỉnh cao của tay vợt số 1 thế giới Ben Johns với công nghệ Carbon T700 Charged, lõi Propulsion Core trợ lực tối đa.",
    "short_description": "Vợt thi đấu đỉnh cao thế giới Ben Johns Carbon T700 Propulsion Core trợ lực tối đa",
    "category": {
      "id": 1,
      "name": "Vợt Pickleball",
      "slug": "vot-pickleball"
    },
    "brand": {
      "id": 1,
      "name": "JOOLA",
      "slug": "joola"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 101,
        "sku": "JOO-PER-3S-16MM",
        "color": "Đen / Xanh",
        "weight": "230g",
        "option_name": "Độ dày",
        "option_value": "16mm",
        "price": 5490000,
        "stock_quantity": 25
      },
      {
        "id": 102,
        "sku": "JOO-PER-3S-14MM",
        "color": "Đen / Trắng",
        "weight": "225g",
        "option_name": "Độ dày",
        "option_value": "14mm",
        "price": 5490000,
        "stock_quantity": 18
      }
    ],
    "specs": {
      "material": "Raw Carbon T700 Charged",
      "thickness": "16mm & 14mm",
      "weight": "225g - 235g",
      "usapa_certified": true,
      "origin": "Mỹ / Nhập khẩu chính hãng"
    }
  },
  {
    "id": 2,
    "name": "Vợt Selkirk Vanguard Power Air Invikta Pro",
    "slug": "vot-selkirk-vanguard-power-air",
    "price": 6200000,
    "sale_price": 6800000,
    "base_price": 6200000,
    "image_url": "/images/pickleball_paddle_balls.jpg",
    "description": "Dòng vợt cao cấp không viền Air Dynamic Throttle tăng tốc độ vung vợt, màng ProSpin+ NextGen tạo xoáy bóng tối đa.",
    "short_description": "Dòng vợt không viền Air Dynamic Throttle bứt phá tốc độ và xoáy bóng ProSpin+",
    "category": {
      "id": 1,
      "name": "Vợt Pickleball",
      "slug": "vot-pickleball"
    },
    "brand": {
      "id": 2,
      "name": "Selkirk",
      "slug": "selkirk"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 201,
        "sku": "SEL-AIR-RED-STD",
        "color": "Đỏ Đô",
        "weight": "230g",
        "option_name": "Loại cán",
        "option_value": "Cán Dài (Invikta)",
        "price": 6200000,
        "stock_quantity": 20
      }
    ],
    "specs": {
      "material": "QuadFlex 4 Layer Hybrid Face",
      "thickness": "13mm Aerodynamic",
      "weight": "220g - 230g",
      "usapa_certified": true,
      "origin": "USA Made"
    }
  },
  {
    "id": 3,
    "name": "Vợt CRBN 1X Power Series 14mm Raw Carbon",
    "slug": "vot-crbn-1x-power-series",
    "price": 4850000,
    "sale_price": 5200000,
    "base_price": 4850000,
    "image_url": "/images/pickleball_carbon_technology.png",
    "description": "Bề mặt Toray T700 Raw Carbon nhám tự nhiên siêu bám bóng, hỗ trợ lực xoáy bóng và smash uy lực vùng cuối sân.",
    "short_description": "Toray T700 Raw Carbon nhám tự nhiên trợ lực xoáy bóng và smash uy lực cuối sân",
    "category": {
      "id": 1,
      "name": "Vợt Pickleball",
      "slug": "vot-pickleball"
    },
    "brand": {
      "id": 3,
      "name": "CRBN",
      "slug": "crbn"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 301,
        "sku": "CRBN-1X-14MM",
        "color": "Đen Nhám",
        "weight": "225g",
        "option_name": "Độ dày",
        "option_value": "14mm",
        "price": 4850000,
        "stock_quantity": 18
      },
      {
        "id": 302,
        "sku": "CRBN-1X-16MM",
        "color": "Đen Nhám",
        "weight": "230g",
        "option_name": "Độ dày",
        "option_value": "16mm",
        "price": 4850000,
        "stock_quantity": 22
      }
    ],
    "specs": {
      "material": "Toray T700 Carbon Fiber",
      "thickness": "14mm & 16mm",
      "weight": "225g",
      "usapa_certified": true,
      "origin": "USA Design"
    }
  },
  {
    "id": 4,
    "name": "Vợt Franklin Signature Pro Carbon 16mm",
    "slug": "vot-franklin-signature-pro-carbon",
    "price": 3450000,
    "sale_price": 3800000,
    "base_price": 3450000,
    "image_url": "/images/pickleball_paddles_collection.jpg",
    "description": "Vợt chính thức của giải thi đấu US Open Pickleball Championships, điểm ngọt lớn, kiểm soát bóng êm ái.",
    "short_description": "Vợt thi đấu chính thức US Open Pickleball Championships điểm ngọt lớn kiểm soát bóng",
    "category": {
      "id": 1,
      "name": "Vợt Pickleball",
      "slug": "vot-pickleball"
    },
    "brand": {
      "id": 4,
      "name": "Franklin",
      "slug": "franklin"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 401,
        "sku": "FRA-SIG-16MM",
        "color": "Đen / Vàng",
        "weight": "225g",
        "option_name": "Độ dày",
        "option_value": "16mm",
        "price": 3450000,
        "stock_quantity": 25
      }
    ],
    "specs": {
      "material": "Carbon Fiber Surface + MaxGrit",
      "thickness": "16mm Polypropylene Core",
      "weight": "215g - 225g",
      "usapa_certified": true,
      "origin": "Chính hãng"
    }
  },
  {
    "id": 5,
    "name": "Vợt Six Zero Double Black Diamond Control 16mm",
    "slug": "vot-six-zero-double-black-diamond",
    "price": 4950000,
    "sale_price": 5400000,
    "base_price": 4950000,
    "image_url": "/images/pickleball_paddle_joola.jpg",
    "description": "Raw Toray 700 Carbon nhiệt luyện toàn phần Carbon Fusion Edge, sweetspot cực rộng cho các pha dink bóng sát lưới.",
    "short_description": "Raw Toray 700 Carbon nhiệt luyện toàn phần sweetspot cực rộng cho pha dink bóng",
    "category": {
      "id": 1,
      "name": "Vợt Pickleball",
      "slug": "vot-pickleball"
    },
    "brand": {
      "id": 5,
      "name": "Six Zero",
      "slug": "six-zero"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 501,
        "sku": "SIX-DBD-16MM",
        "color": "Carbon Nguyên Bản",
        "weight": "230g",
        "option_name": "Độ dày",
        "option_value": "16mm",
        "price": 4950000,
        "stock_quantity": 15
      }
    ],
    "specs": {
      "material": "Premium Japanese Toray 700 Carbon",
      "thickness": "16mm Honeycomb Core",
      "weight": "230g",
      "usapa_certified": true,
      "origin": "Úc / USA"
    }
  },
  {
    "id": 6,
    "name": "Vợt Engage Pursuit Pro EX 6.0 Raw Carbon",
    "slug": "vot-engage-pursuit-pro-ex",
    "price": 5600000,
    "sale_price": 6100000,
    "base_price": 5600000,
    "image_url": "/images/pickleball_paddle_balls.jpg",
    "description": "Lõi MachPro Black Polymer trợ lực và giảm rung chấn chấn thương cổ tay, mặt vợt nhám tăng tỷ lệ xoáy bóng top-spin.",
    "short_description": "Lõi MachPro Black Polymer trợ lực và giảm chấn êm ái tăng xoáy bóng top-spin",
    "category": {
      "id": 1,
      "name": "Vợt Pickleball",
      "slug": "vot-pickleball"
    },
    "brand": {
      "id": 6,
      "name": "Engage",
      "slug": "engage"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 601,
        "sku": "ENG-PUR-EX60",
        "color": "Đen / Cam",
        "weight": "235g",
        "option_name": "Độ dày",
        "option_value": "16mm EX 6.0",
        "price": 5600000,
        "stock_quantity": 14
      }
    ],
    "specs": {
      "material": "Toray T700 Raw Carbon + MachPro Core",
      "thickness": "16mm Core",
      "weight": "230g - 240g",
      "usapa_certified": true,
      "origin": "Made in USA"
    }
  },
  {
    "id": 7,
    "name": "Vợt Gearbox Pro Power Elongated SST Carbon",
    "slug": "vot-gearbox-pro-power-elongated",
    "price": 6500000,
    "sale_price": 6950000,
    "base_price": 6500000,
    "image_url": "/images/pickleball_carbon_technology.png",
    "description": "Công nghệ khung đúc nguyên khối Solid Span Technology không viền bọc, độ nảy và lực bóng smash uy lực nhất hiện nay.",
    "short_description": "Khung đúc Solid Span Technology không viền bọc lực smash uy lực nhất hiện nay",
    "category": {
      "id": 1,
      "name": "Vợt Pickleball",
      "slug": "vot-pickleball"
    },
    "brand": {
      "id": 7,
      "name": "Gearbox",
      "slug": "gearbox"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 701,
        "sku": "GB-PROP-ELON",
        "color": "Đen Nhám Cạnh Đỏ",
        "weight": "230g",
        "option_name": "Quy cách",
        "option_value": "Elongated Pro Power",
        "price": 6500000,
        "stock_quantity": 10
      }
    ],
    "specs": {
      "material": "Patented Solid Carbon Core SST",
      "thickness": "14mm",
      "weight": "230g",
      "usapa_certified": true,
      "origin": "USA"
    }
  },
  {
    "id": 8,
    "name": "Vợt Diadem Edge 18k Speed Pro Carbon 3D",
    "slug": "vot-diadem-edge-18k-speed-pro",
    "price": 5200000,
    "sale_price": 5600000,
    "base_price": 5200000,
    "image_url": "/images/pickleball_paddles_collection.jpg",
    "description": "Bề mặt sợi carbon 18K dạng đan 3D độc quyền bám bóng và triệt tiêu lực giật, cho cảm giác chạm bóng tinh tế nhất.",
    "short_description": "Bề mặt sợi carbon 18K dạng đan 3D bám bóng triệt tiêu rung giật kiểm soát tinh tế",
    "category": {
      "id": 1,
      "name": "Vợt Pickleball",
      "slug": "vot-pickleball"
    },
    "brand": {
      "id": 8,
      "name": "Diadem",
      "slug": "diadem"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 801,
        "sku": "DIA-EDG-18K",
        "color": "Xanh Teal Carbon",
        "weight": "228g",
        "option_name": "Độ dày",
        "option_value": "16mm 18K",
        "price": 5200000,
        "stock_quantity": 16
      }
    ],
    "specs": {
      "material": "3D 18K Carbon Fiber Face",
      "thickness": "16mm Core",
      "weight": "228g",
      "usapa_certified": true,
      "origin": "Mỹ"
    }
  },
  {
    "id": 9,
    "name": "Vợt Paddletek Tempest Pro Bantam v3 Wave",
    "slug": "vot-paddletek-tempest-pro-bantam",
    "price": 4700000,
    "sale_price": 5100000,
    "base_price": 4700000,
    "image_url": "/images/pickleball_paddle_joola.jpg",
    "description": "Dòng vợt huyền thoại kiểm soát bóng với bề mặt Smart Response Technology triệt tiêu rung giật khi block bóng phản xạ nhanh.",
    "short_description": "Bề mặt Smart Response Technology triệt tiêu rung giật khi block bóng phản xạ nhanh",
    "category": {
      "id": 1,
      "name": "Vợt Pickleball",
      "slug": "vot-pickleball"
    },
    "brand": {
      "id": 9,
      "name": "Paddletek",
      "slug": "paddletek"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 901,
        "sku": "PAD-TEM-V3",
        "color": "Xanh Biển / Bạc",
        "weight": "225g",
        "option_name": "Độ dày",
        "option_value": "14.3mm Wave",
        "price": 4700000,
        "stock_quantity": 12
      }
    ],
    "specs": {
      "material": "High Grade Carbon Composite",
      "thickness": "14.3mm",
      "weight": "225g",
      "usapa_certified": true,
      "origin": "Made in USA"
    }
  },
  {
    "id": 10,
    "name": "Vợt ProXR Zane Navratil The Standard 14mm Spin",
    "slug": "vot-proxr-zane-navratil-standard",
    "price": 4600000,
    "sale_price": 4950000,
    "base_price": 4600000,
    "image_url": "/images/pickleball_paddle_balls.jpg",
    "description": "Thiết kế cán nghiêng công thái học độc quyền của Zane Navratil giúp cổ tay linh hoạt tối đa khi cắt bóng xoáy chéo sân.",
    "short_description": "Cán nghiêng công thái học độc quyền Zane Navratil cổ tay linh hoạt cắt bóng xoáy",
    "category": {
      "id": 1,
      "name": "Vợt Pickleball",
      "slug": "vot-pickleball"
    },
    "brand": {
      "id": 10,
      "name": "ProXR",
      "slug": "proxr"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 1001,
        "sku": "PXR-ZN-STD14",
        "color": "Đen / Xanh Lá",
        "weight": "232g",
        "option_name": "Độ dày",
        "option_value": "14mm Ergonomic",
        "price": 4600000,
        "stock_quantity": 15
      }
    ],
    "specs": {
      "material": "T700 Raw Carbon Ultra Spin",
      "thickness": "14mm Core",
      "weight": "232g",
      "usapa_certified": true,
      "origin": "USA"
    }
  },
  {
    "id": 11,
    "name": "Hộp 12 Quả Bóng Franklin X-40 Outdoor (Vàng Chanh)",
    "slug": "bong-franklin-x40-outdoor-12pack",
    "price": 420000,
    "sale_price": 460000,
    "base_price": 420000,
    "image_url": "/images/pickleball_balls_yellow.jpg",
    "description": "Bóng thi đấu ngoài trời chuẩn 40 lỗ đục khí động học, độ nảy đồng đều và độ bền cao không lo nứt vỡ, USAPA Approved.",
    "short_description": "Bóng thi đấu ngoài trời chuẩn 40 lỗ đục khí động học USAPA Approved độ nảy đồng đều",
    "category": {
      "id": 2,
      "name": "Bóng Pickleball",
      "slug": "bong-pickleball"
    },
    "brand": {
      "id": 4,
      "name": "Franklin",
      "slug": "franklin"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 1101,
        "sku": "FRA-X40-YELLOW-PACK12",
        "color": "Vàng Chanh",
        "weight": "26g",
        "option_name": "Quy cách",
        "option_value": "Hộp 12 Quả",
        "price": 420000,
        "stock_quantity": 80
      }
    ],
    "specs": {
      "material": "Nhựa nhiệt dẻo đúc nguyên khối",
      "thickness": "40 lỗ chuẩn ngoài trời",
      "weight": "26g",
      "usapa_certified": true,
      "origin": "USA"
    }
  },
  {
    "id": 12,
    "name": "Hộp 3 Quả Bóng Dura Fast 40 Chuyên Nghiệp PPA Tour",
    "slug": "bong-dura-fast-40-pack3",
    "price": 150000,
    "sale_price": 165000,
    "base_price": 150000,
    "image_url": "/images/pickleball_balls_yellow.jpg",
    "description": "Bóng thi đấu chính thức các giải PPA Tour thế giới, đường bay nhanh và đầm tay, tối ưu cho các trận cầu đỉnh cao.",
    "short_description": "Bóng thi đấu chính thức giải PPA Tour đường bay nhanh đầm tay tối ưu VĐV",
    "category": {
      "id": 2,
      "name": "Bóng Pickleball",
      "slug": "bong-pickleball"
    },
    "brand": {
      "id": 11,
      "name": "Dura",
      "slug": "dura"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 1201,
        "sku": "DUR-FAST40-PACK3",
        "color": "Vàng Neon",
        "weight": "26g",
        "option_name": "Quy cách",
        "option_value": "Hộp 3 Quả",
        "price": 150000,
        "stock_quantity": 120
      }
    ],
    "specs": {
      "material": "Polyethylene công nghiệp cứng",
      "thickness": "40 lỗ gia công CNC",
      "weight": "26g",
      "usapa_certified": true,
      "origin": "USA"
    }
  },
  {
    "id": 13,
    "name": "Hộp 12 Quả Bóng Onix Fuse G2 Indoor (Màu Cam Sáng)",
    "slug": "bong-onix-fuse-g2-indoor",
    "price": 450000,
    "sale_price": 490000,
    "base_price": 450000,
    "image_url": "/images/pickleball_balls_yellow.jpg",
    "description": "Bóng thi đấu trong nhà chuẩn 26 lỗ kích thước lớn, quỹ đạo bay ổn định, độ bám mặt sân cao không trơn trượt.",
    "short_description": "Bóng thi đấu trong nhà chuẩn 26 lỗ lớn quỹ đạo ổn định độ bám sân cao",
    "category": {
      "id": 2,
      "name": "Bóng Pickleball",
      "slug": "bong-pickleball"
    },
    "brand": {
      "id": 12,
      "name": "Onix",
      "slug": "onix"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 1301,
        "sku": "ONX-FUSE2-PACK12",
        "color": "Cam Sáng Indoor",
        "weight": "25g",
        "option_name": "Quy cách",
        "option_value": "Hộp 12 Quả",
        "price": 450000,
        "stock_quantity": 60
      }
    ],
    "specs": {
      "material": "Nhựa dẻo giảm tiếng ồn",
      "thickness": "26 lỗ trong nhà",
      "weight": "25g",
      "usapa_certified": true,
      "origin": "USA"
    }
  },
  {
    "id": 14,
    "name": "Hộp 6 Quả Bóng JOOLA Primo Ball Outdoor USAPA",
    "slug": "bong-joola-primo-outdoor-6pack",
    "price": 260000,
    "sale_price": 290000,
    "base_price": 260000,
    "image_url": "/images/pickleball_balls_yellow.jpg",
    "description": "Hạt nhựa đàn hồi cao cấp chống biến dạng khi thời tiết lạnh hoặc nắng gắt, độ nảy giữ chuẩn sau hàng trăm trận đấu.",
    "short_description": "Nhựa đàn hồi cao cấp chống méo nứt khi nắng gắt độ nảy ổn định chuẩn USAPA",
    "category": {
      "id": 2,
      "name": "Bóng Pickleball",
      "slug": "bong-pickleball"
    },
    "brand": {
      "id": 1,
      "name": "JOOLA",
      "slug": "joola"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 1401,
        "sku": "JOO-PRIMO-PACK6",
        "color": "Vàng Quang Học",
        "weight": "26g",
        "option_name": "Quy cách",
        "option_value": "Hộp 6 Quả",
        "price": 260000,
        "stock_quantity": 75
      }
    ],
    "specs": {
      "material": "Polyethylene dẻo nhiệt chống méo",
      "thickness": "40 lỗ đục cân bằng",
      "weight": "26g",
      "usapa_certified": true,
      "origin": "Chính hãng"
    }
  },
  {
    "id": 15,
    "name": "Hộp 12 Quả Bóng Selkirk Pro S1 Tour Ball",
    "slug": "bong-selkirk-pro-s1-tour-ball",
    "price": 480000,
    "sale_price": 520000,
    "base_price": 480000,
    "image_url": "/images/pickleball_balls_yellow.jpg",
    "description": "Thiết kế khí động học được nghiên cứu chuyên sâu đảm bảo bóng bay thẳng và xoáy chuẩn xác trong gió lớn.",
    "short_description": "Công nghệ đúc vi mô khí động học bóng bay thẳng xoáy chuẩn trong gió lớn",
    "category": {
      "id": 2,
      "name": "Bóng Pickleball",
      "slug": "bong-pickleball"
    },
    "brand": {
      "id": 2,
      "name": "Selkirk",
      "slug": "selkirk"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 1501,
        "sku": "SEL-S1TOUR-PACK12",
        "color": "Vàng Neon",
        "weight": "26.2g",
        "option_name": "Quy cách",
        "option_value": "Hộp 12 Quả",
        "price": 480000,
        "stock_quantity": 50
      }
    ],
    "specs": {
      "material": "Khuôn đúc cân bằng vi mô",
      "thickness": "40 lỗ tròn khí động học",
      "weight": "26.2g",
      "usapa_certified": true,
      "origin": "USA"
    }
  },
  {
    "id": 16,
    "name": "Thùng 100 Quả Bóng Pickleball Tập Luyện Câu Lạc Bộ DemoPick",
    "slug": "thung-100-bong-tap-luyen-demopick",
    "price": 2650000,
    "sale_price": 2900000,
    "base_price": 2650000,
    "image_url": "/images/pickleball_balls_yellow.jpg",
    "description": "Thùng bóng số lượng lớn tối ưu chi phí cho các câu lạc bộ, lớp huấn luyện và máy bắn bóng tự động.",
    "short_description": "Thùng 100 quả bóng dập logo DemoPick siêu bền tối ưu cho CLB và máy bắn bóng",
    "category": {
      "id": 2,
      "name": "Bóng Pickleball",
      "slug": "bong-pickleball"
    },
    "brand": {
      "id": 22,
      "name": "DEMOPICK",
      "slug": "demopick"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 1601,
        "sku": "DMP-BALL100-BUCKET",
        "color": "Vàng Chuẩn CLB",
        "weight": "26g / quả",
        "option_name": "Quy cách",
        "option_value": "Thùng 100 Quả",
        "price": 2650000,
        "stock_quantity": 30
      }
    ],
    "specs": {
      "material": "Nhựa dẻo siêu bền chống nứt vỡ",
      "thickness": "40 lỗ tiêu chuẩn",
      "weight": "26g",
      "usapa_certified": true,
      "origin": "Việt Nam"
    }
  },
  {
    "id": 17,
    "name": "Balo Pickleball JOOLA Tour Elite Pro Backpack",
    "slug": "balo-pickleball-joola-tour-elite-pro",
    "price": 1850000,
    "sale_price": 2100000,
    "base_price": 1850000,
    "image_url": "/images/pickleball_backpack_apex.jpg",
    "description": "Balo đựng vợt chuyên nghiệp có ngăn cách nhiệt chứa 4 cây vợt, ngăn thông gió đựng giày và móc treo hàng rào sân cực tiện.",
    "short_description": "Ngăn cách nhiệt bảo vệ 4 vợt, ngăn giày thông gió riêng và móc treo sân tiện lợi",
    "category": {
      "id": 3,
      "name": "Phụ kiện & Bao vợt",
      "slug": "phu-kien-bao-vot"
    },
    "brand": {
      "id": 1,
      "name": "JOOLA",
      "slug": "joola"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 1701,
        "sku": "JOO-BAG-ELITE",
        "color": "Đen / Xám Than",
        "weight": "850g",
        "option_name": "Kích cỡ",
        "option_value": "Tour Pro 45L",
        "price": 1850000,
        "stock_quantity": 25
      }
    ],
    "specs": {
      "material": "900D Nylon chống thấm",
      "thickness": "Ngăn Thermoguard",
      "weight": "850g",
      "usapa_certified": true,
      "origin": "Chính hãng"
    }
  },
  {
    "id": 18,
    "name": "Túi Du Lịch Pickleball Selkirk Team Duffle Bag",
    "slug": "tui-du-lich-selkirk-team-duffle",
    "price": 1650000,
    "sale_price": 1850000,
    "base_price": 1650000,
    "image_url": "/images/pickleball_backpack_apex.jpg",
    "description": "Thể tích lớn chứa trọn bộ 6 cây vợt, bóng, khăn và phụ kiện cho các giải đấu xa.",
    "short_description": "Thể tích lớn chứa 6 vợt, bóng, khăn thi đấu cho các giải đấu xa",
    "category": {
      "id": 3,
      "name": "Phụ kiện & Bao vợt",
      "slug": "phu-kien-bao-vot"
    },
    "brand": {
      "id": 2,
      "name": "Selkirk",
      "slug": "selkirk"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 1801,
        "sku": "SEL-BAG-DUFFLE",
        "color": "Đỏ / Đen",
        "weight": "900g",
        "option_name": "Dung tích",
        "option_value": "Duffle 55L",
        "price": 1650000,
        "stock_quantity": 20
      }
    ],
    "specs": {
      "material": "Poly Fabric chống nước cao cấp",
      "thickness": "Đáy gia cố chống va đập",
      "weight": "900g",
      "usapa_certified": true,
      "origin": "USA"
    }
  },
  {
    "id": 19,
    "name": "Balo Đựng Vợt Franklin Pro Series Court Backpack",
    "slug": "balo-franklin-pro-series-court",
    "price": 1250000,
    "sale_price": 1450000,
    "base_price": 1250000,
    "image_url": "/images/pickleball_backpack_apex.jpg",
    "description": "Quai đeo công thái học êm ái chống mỏi lưng, túi phụ bên hông giữ lạnh bình nước 1 lít.",
    "short_description": "Quai đeo công thái học êm ái chống mỏi lưng túi phụ giữ lạnh bình nước 1L",
    "category": {
      "id": 3,
      "name": "Phụ kiện & Bao vợt",
      "slug": "phu-kien-bao-vot"
    },
    "brand": {
      "id": 4,
      "name": "Franklin",
      "slug": "franklin"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 1901,
        "sku": "FRA-BAG-COURT",
        "color": "Xám Phối Đen",
        "weight": "750g",
        "option_name": "Kích cỡ",
        "option_value": "Court Backpack",
        "price": 1250000,
        "stock_quantity": 30
      }
    ],
    "specs": {
      "material": "Polyester trượt nước",
      "thickness": "Đệm chống sốc 3 lớp",
      "weight": "750g",
      "usapa_certified": true,
      "origin": "Chính hãng"
    }
  },
  {
    "id": 20,
    "name": "Bao Da Bảo Vệ Mặt Vợt CRBN Neoprene Paddle Cover",
    "slug": "bao-da-bao-ve-mat-vot-crbn",
    "price": 290000,
    "sale_price": 350000,
    "base_price": 290000,
    "image_url": "/images/pickleball_carbon_technology.png",
    "description": "Bọc đệm cao su Neoprene dày dặn chống trầy xước và bảo vệ độ nhám bề mặt Carbon T700 của vợt.",
    "short_description": "Bọc đệm Neoprene dày dặn chống trầy xước bảo vệ độ nhám Toray T700",
    "category": {
      "id": 3,
      "name": "Phụ kiện & Bao vợt",
      "slug": "phu-kien-bao-vot"
    },
    "brand": {
      "id": 3,
      "name": "CRBN",
      "slug": "crbn"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 2001,
        "sku": "CRBN-COV-NEO",
        "color": "Đen Mờ Logo Trắng",
        "weight": "120g",
        "option_name": "Quy cách",
        "option_value": "Bao Neoprene Chuẩn",
        "price": 290000,
        "stock_quantity": 45
      }
    ],
    "specs": {
      "material": "Cao su Neoprene co giãn",
      "thickness": "Đệm 5mm",
      "weight": "120g",
      "usapa_certified": true,
      "origin": "USA"
    }
  },
  {
    "id": 21,
    "name": "Túi Đeo Chéo Pickleball Sling Bag Chống Thấm Nước",
    "slug": "tui-deo-cheo-pickleball-sling-bag",
    "price": 420000,
    "sale_price": 490000,
    "base_price": 420000,
    "image_url": "/images/pickleball_backpack_apex.jpg",
    "description": "Thiết kế sling bag năng động đeo chéo gọn nhẹ chứa 2 cây vợt, 4 quả bóng và điện thoại cá nhân.",
    "short_description": "Sling bag đeo chéo năng động nhỏ gọn chứa 2 vợt, 4 bóng và đồ cá nhân",
    "category": {
      "id": 3,
      "name": "Phụ kiện & Bao vợt",
      "slug": "phu-kien-bao-vot"
    },
    "brand": {
      "id": 22,
      "name": "DEMOPICK",
      "slug": "demopick"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 2101,
        "sku": "DMP-SLING-BAG",
        "color": "Đen Xanh Emerald",
        "weight": "350g",
        "option_name": "Kiểu dáng",
        "option_value": "Đeo chéo 2 vợt",
        "price": 420000,
        "stock_quantity": 50
      }
    ],
    "specs": {
      "material": "Vải Oxford chống nước",
      "thickness": "Ngăn lót chống sốc",
      "weight": "350g",
      "usapa_certified": true,
      "origin": "Việt Nam"
    }
  },
  {
    "id": 22,
    "name": "Giày Thi Đấu Pickleball Babolat Jet Mach 3 Pro Court",
    "slug": "giay-pickleball-babolat-jet-mach-3",
    "price": 2950000,
    "sale_price": 3300000,
    "base_price": 2950000,
    "image_url": "/images/pickleball_shoes.jpg",
    "description": "Đế cao su Michelin siêu bám mặt sân pickleball, thân giày dệt Matryx EVO siêu nhẹ bảo vệ cổ chân và khớp gối khi bứt tốc ngang.",
    "short_description": "Đế cao su Michelin bám sân thân dệt Matryx EVO siêu nhẹ bứt tốc ngang êm ái",
    "category": {
      "id": 4,
      "name": "Quần áo & Trang phục",
      "slug": "quan-ao-trang-phuc"
    },
    "brand": {
      "id": 13,
      "name": "Babolat",
      "slug": "babolat"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 2201,
        "sku": "BAB-JET3-41",
        "color": "Xanh Navy / Cam",
        "weight": "310g",
        "option_name": "Size",
        "option_value": "Size 41 (26cm)",
        "price": 2950000,
        "stock_quantity": 12
      },
      {
        "id": 2202,
        "sku": "BAB-JET3-42",
        "color": "Xanh Navy / Cam",
        "weight": "315g",
        "option_name": "Size",
        "option_value": "Size 42 (26.5cm)",
        "price": 2950000,
        "stock_quantity": 15
      }
    ],
    "specs": {
      "material": "Matryx EVO Fabric + Michelin Rubber",
      "thickness": "Đệm KPRS-X",
      "weight": "310g",
      "usapa_certified": true,
      "origin": "Pháp / Chính hãng"
    }
  },
  {
    "id": 23,
    "name": "Giày Chuyên Sân Pickleball Wilson Rush Pro Ace Court",
    "slug": "giay-pickleball-wilson-rush-pro-ace",
    "price": 2450000,
    "sale_price": 2750000,
    "base_price": 2450000,
    "image_url": "/images/pickleball_shoes.jpg",
    "description": "Mũi giày gia cố 4D Support Chassis kiểm soát chuyển động vặn xoắn, đế Duralast chống mòn tối đa trên sân cứng.",
    "short_description": "Khung 4D Support Chassis kiểm soát vặn xoắn đế Duralast bền bỉ trên sân cứng",
    "category": {
      "id": 4,
      "name": "Quần áo & Trang phục",
      "slug": "quan-ao-trang-phuc"
    },
    "brand": {
      "id": 14,
      "name": "Wilson",
      "slug": "wilson"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 2301,
        "sku": "WIL-RUSH-41",
        "color": "Trắng / Xanh Đậm",
        "weight": "330g",
        "option_name": "Size",
        "option_value": "Size 41 (26cm)",
        "price": 2450000,
        "stock_quantity": 10
      },
      {
        "id": 2302,
        "sku": "WIL-RUSH-42",
        "color": "Trắng / Xanh Đậm",
        "weight": "335g",
        "option_name": "Size",
        "option_value": "Size 42 (26.5cm)",
        "price": 2450000,
        "stock_quantity": 14
      }
    ],
    "specs": {
      "material": "Sensifeel Mesh + Duralast Rubber",
      "thickness": "Khung 4D Chassis",
      "weight": "330g",
      "usapa_certified": true,
      "origin": "Mỹ"
    }
  },
  {
    "id": 24,
    "name": "Áo Đấu Pickleball Dry-Fit Unisex JOOLA Team Pro",
    "slug": "ao-dau-pickleball-dryfit-joola-team-pro",
    "price": 380000,
    "sale_price": 450000,
    "base_price": 380000,
    "image_url": "/images/pickleball_shirt_dryfit.jpg",
    "description": "Chất liệu vải mè vi sợi QuickDry co giãn 4 chiều, công nghệ làm mát thân nhiệt hỗ trợ vận động cường độ cao.",
    "short_description": "Vải mè vi sợi QuickDry co giãn 4 chiều thoát nhiệt siêu tốc khi vận động mạnh",
    "category": {
      "id": 4,
      "name": "Quần áo & Trang phục",
      "slug": "quan-ao-trang-phuc"
    },
    "brand": {
      "id": 1,
      "name": "JOOLA",
      "slug": "joola"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 2401,
        "sku": "JOO-TSHIRT-M",
        "color": "Trắng / Viền Xanh",
        "weight": "160g",
        "option_name": "Size",
        "option_value": "Size M (55-65kg)",
        "price": 380000,
        "stock_quantity": 35
      },
      {
        "id": 2402,
        "sku": "JOO-TSHIRT-L",
        "color": "Trắng / Viền Xanh",
        "weight": "170g",
        "option_name": "Size",
        "option_value": "Size L (65-75kg)",
        "price": 380000,
        "stock_quantity": 40
      }
    ],
    "specs": {
      "material": "88% Polyester + 12% Spandex",
      "thickness": "Dệt mè lỗ kim thoáng khí",
      "weight": "160g",
      "usapa_certified": true,
      "origin": "Chính hãng"
    }
  },
  {
    "id": 25,
    "name": "Quần Short Thể Thao Pickleball Selkirk Performance Có Túi Sâu",
    "slug": "quan-short-the-thao-selkirk-performance",
    "price": 320000,
    "sale_price": 380000,
    "base_price": 320000,
    "image_url": "/images/pickleball_shorts.jpg",
    "description": "Thiết kế túi sâu đặc dụng chứa gọn 2 quả bóng pickleball không bị rơi văng ra khi di chuyển cứu bóng.",
    "short_description": "Túi sâu đặc dụng chứa gọn 2 quả bóng pickleball không bị rơi văng khi di chuyển",
    "category": {
      "id": 4,
      "name": "Quần áo & Trang phục",
      "slug": "quan-ao-trang-phuc"
    },
    "brand": {
      "id": 2,
      "name": "Selkirk",
      "slug": "selkirk"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 2501,
        "sku": "SEL-SHORT-M",
        "color": "Đen Thể Thao",
        "weight": "180g",
        "option_name": "Size",
        "option_value": "Size M (Lưng 29-31)",
        "price": 320000,
        "stock_quantity": 30
      },
      {
        "id": 2502,
        "sku": "SEL-SHORT-L",
        "color": "Đen Thể Thao",
        "weight": "190g",
        "option_name": "Size",
        "option_value": "Size L (Lưng 32-34)",
        "price": 320000,
        "stock_quantity": 30
      }
    ],
    "specs": {
      "material": "Co giãn 4 chiều mềm nhẹ",
      "thickness": "Túi sâu ôm bóng",
      "weight": "180g",
      "usapa_certified": true,
      "origin": "USA"
    }
  },
  {
    "id": 26,
    "name": "Nón Thể Thao Visor Chắn Nắng Sân Ngoài Trời Franklin Pro",
    "slug": "non-visor-chan-nang-franklin-pro",
    "price": 180000,
    "sale_price": 220000,
    "base_price": 180000,
    "image_url": "/images/sports_visor_hat.jpg",
    "description": "Nón nửa đầu phong cách VĐV chuyên nghiệp, vành chắn chống lóa đèn LED sân và chống nắng gắt, thấm hút mồ hôi trán.",
    "short_description": "Nón nửa đầu VĐV chống chói đèn LED và nắng gắt vành thấm hút mồ hôi trán",
    "category": {
      "id": 4,
      "name": "Quần áo & Trang phục",
      "slug": "quan-ao-trang-phuc"
    },
    "brand": {
      "id": 4,
      "name": "Franklin",
      "slug": "franklin"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 2601,
        "sku": "FRA-VISOR-WHT",
        "color": "Trắng Tinh",
        "weight": "65g",
        "option_name": "Quy cách",
        "option_value": "Freesize Khóa Dán",
        "price": 180000,
        "stock_quantity": 50
      }
    ],
    "specs": {
      "material": "Sợi Poly siêu nhẹ",
      "thickness": "Băng trán kháng khuẩn",
      "weight": "65g",
      "usapa_certified": true,
      "origin": "Chính hãng"
    }
  },
  {
    "id": 27,
    "name": "Set 3 Cuộn Quấn Cán Vợt Pickleball Wilson Pro Overgrip",
    "slug": "set-3-cuon-quan-can-wilson-pro-overgrip",
    "price": 125000,
    "sale_price": 140000,
    "base_price": 125000,
    "image_url": "/images/pickleball_overgrip_tape.jpg",
    "description": "Băng quấn cán mỏng 0.5mm siêu thấm mồ hôi tay, bề mặt gai êm ái chống tuột tay trong các pha smash mạnh.",
    "short_description": "Băng quấn cán siêu thấm mồ hôi tay bề mặt gai êm ái chống tuột cán khi smash",
    "category": {
      "id": 3,
      "name": "Phụ kiện & Bao vợt",
      "slug": "phu-kien-bao-vot"
    },
    "brand": {
      "id": 14,
      "name": "Wilson",
      "slug": "wilson"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 2701,
        "sku": "WIL-GRIP-3PK",
        "color": "Trắng Cổ Điển",
        "weight": "30g",
        "option_name": "Quy cách",
        "option_value": "Set 3 Cuộn",
        "price": 125000,
        "stock_quantity": 120
      }
    ],
    "specs": {
      "material": "Polyurethane vi xốp siêu thấm",
      "thickness": "0.5mm x 110cm",
      "weight": "30g",
      "usapa_certified": true,
      "origin": "Mỹ"
    }
  },
  {
    "id": 28,
    "name": "Vỉ 4 Thanh Chì Dán Cân Bằng Đầu Vợt Lead Tape 3g",
    "slug": "vi-thanh-chi-dan-can-bang-lead-tape-3g",
    "price": 95000,
    "sale_price": 120000,
    "base_price": 95000,
    "image_url": "/images/pickleball_carbon_technology.png",
    "description": "Tăng trọng lượng vung vợt và mở rộng diện tích điểm ngọt sweetspot theo phong cách cá nhân của người chơi chuyên nghiệp.",
    "short_description": "Chì dán kết dính 3M tăng trọng lượng vung vợt và mở rộng sweetspot",
    "category": {
      "id": 3,
      "name": "Phụ kiện & Bao vợt",
      "slug": "phu-kien-bao-vot"
    },
    "brand": {
      "id": 3,
      "name": "CRBN",
      "slug": "crbn"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 2801,
        "sku": "CRBN-LEAD-4PK",
        "color": "Bạc Kim Loại",
        "weight": "12g",
        "option_name": "Quy cách",
        "option_value": "Vỉ 4 Thanh (3g/thanh)",
        "price": 95000,
        "stock_quantity": 70
      }
    ],
    "specs": {
      "material": "Chì dán kết dính 3M cao cấp",
      "thickness": "Thanh 5cm x 1cm",
      "weight": "12g tổng",
      "usapa_certified": true,
      "origin": "USA"
    }
  },
  {
    "id": 29,
    "name": "Cục Gôm Tẩy Vết Bẩn & Bụi Mặt Vợt Carbon Eraser Raw Cleaner",
    "slug": "cuc-gom-tay-ve-sinh-mat-vot-carbon-eraser",
    "price": 120000,
    "sale_price": 150000,
    "base_price": 120000,
    "image_url": "/images/pickleball_carbon_technology.png",
    "description": "Khôi phục độ nhám nguyên bản của mặt sợi Toray Carbon T700, tẩy sạch sợi bóng bám vào sau 30 giây chà nhẹ.",
    "short_description": "Khôi phục độ nhám nguyên bản mặt sợi Toray T700 chỉ sau 30 giây chà nhẹ",
    "category": {
      "id": 3,
      "name": "Phụ kiện & Bao vợt",
      "slug": "phu-kien-bao-vot"
    },
    "brand": {
      "id": 22,
      "name": "DEMOPICK",
      "slug": "demopick"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 2901,
        "sku": "DMP-ERASER-01",
        "color": "Xám Cao Su",
        "weight": "50g",
        "option_name": "Quy cách",
        "option_value": "Khối Gôm 50g",
        "price": 120000,
        "stock_quantity": 85
      }
    ],
    "specs": {
      "material": "Hợp chất cao su đặc biệt chuyên dụng",
      "thickness": "Khối 5cm x 5cm x 2.5cm",
      "weight": "50g",
      "usapa_certified": true,
      "origin": "Việt Nam"
    }
  },
  {
    "id": 30,
    "name": "Bộ Lưới Di Động Thi Đấu Pickleball USAPA 22-Feet Kèm Khung Thép",
    "slug": "bo-luoi-di-dong-pickleball-usapa-22-feet",
    "price": 2150000,
    "sale_price": 2450000,
    "base_price": 2150000,
    "image_url": "/images/pickleball_net_portable.jpg",
    "description": "Bộ khung thép sơn tĩnh điện tháo lắp nhanh chuẩn USAPA dài 22ft, chiều cao tâm lưới chuẩn 34 inch và hai đầu 36 inch.",
    "short_description": "Khung thép sơn tĩnh điện tháo lắp 5 phút chuẩn USAPA 22ft tặng kèm túi đựng",
    "category": {
      "id": 3,
      "name": "Phụ kiện & Bao vợt",
      "slug": "phu-kien-bao-vot"
    },
    "brand": {
      "id": 4,
      "name": "Franklin",
      "slug": "franklin"
    },
    "item_type": "product",
    "in_stock": true,
    "variants": [
      {
        "id": 3001,
        "sku": "FRA-NET-PORT22",
        "color": "Khung Đen / Lưới Trắng",
        "weight": "9.5kg",
        "option_name": "Quy cách",
        "option_value": "Bộ 22ft Kèm Khung",
        "price": 2150000,
        "stock_quantity": 15
      }
    ],
    "specs": {
      "material": "Khung thép sơn tĩnh điện + Lưới PE chống UV",
      "thickness": "Dài 22 feet (6.7m)",
      "weight": "9.5kg",
      "usapa_certified": true,
      "origin": "Chính hãng"
    }
  },
  {
    "id": 31,
    "name": "Nước Bù Điện Giải Pocari Sweat Ion Supply 500ml",
    "slug": "nuoc-bu-dien-giai-pocari-sweat-500ml",
    "price": 25000,
    "sale_price": 25000,
    "base_price": 25000,
    "image_url": "/images/pocari_sweat_500ml.jpg",
    "description": "Bù nước và 5 loại ion thiết yếu (Na+, K+, Cl-, Ca2+, Mg2+) tương đồng dịch cơ thể, hấp thụ nhanh gấp 2.2 lần nước thường.",
    "short_description": "Bù nước & 5 ion thiết yếu tương đồng dịch cơ thể hấp thụ nhanh cho VĐV",
    "category": {
      "id": 5,
      "name": "Đồ uống & Đồ ăn",
      "slug": "do-uong-do-an"
    },
    "brand": {
      "id": 15,
      "name": "Pocari",
      "slug": "pocari"
    },
    "item_type": "drink_food",
    "in_stock": true,
    "variants": [
      {
        "id": 3101,
        "sku": "POC-500ML",
        "color": "Xanh Dương",
        "weight": "500g",
        "option_name": "Dung tích",
        "option_value": "Chai 500ml Ướp Lạnh",
        "price": 25000,
        "stock_quantity": 120
      }
    ],
    "specs": {
      "material": "Nước bù điện giải ion",
      "thickness": "500ml",
      "weight": "500g",
      "usapa_certified": true,
      "origin": "Otsuka Nhật Bản"
    }
  },
  {
    "id": 32,
    "name": "Nước Thể Thao Revive Chanh Muối 500ml",
    "slug": "nuoc-the-thao-revive-chanh-muoi-500ml",
    "price": 20000,
    "sale_price": 20000,
    "base_price": 20000,
    "image_url": "/images/revive_lemon_drink.jpg",
    "description": "Bổ sung muối khoáng, vitamin B3, B6, B12 và vị chanh muối thanh mát xua tan cơn khát và chống mỏi cơ khi thi đấu.",
    "short_description": "Bổ sung muối khoáng vitamin B3, B6, B12 và vị chanh muối thanh mát",
    "category": {
      "id": 5,
      "name": "Đồ uống & Đồ ăn",
      "slug": "do-uong-do-an"
    },
    "brand": {
      "id": 16,
      "name": "Revive",
      "slug": "revive"
    },
    "item_type": "drink_food",
    "in_stock": true,
    "variants": [
      {
        "id": 3201,
        "sku": "REV-500ML",
        "color": "Vàng Chanh",
        "weight": "500g",
        "option_name": "Dung tích",
        "option_value": "Chai 500ml Ướp Lạnh",
        "price": 20000,
        "stock_quantity": 100
      }
    ],
    "specs": {
      "material": "Nước isotonic thể thao",
      "thickness": "500ml",
      "weight": "500g",
      "usapa_certified": true,
      "origin": "PepsiCo Việt Nam"
    }
  },
  {
    "id": 33,
    "name": "Nước Tăng Lực Red Bull Thái Lan Lon 250ml",
    "slug": "nuoc-tang-luc-red-bull-thai-lan-250ml",
    "price": 25000,
    "sale_price": 25000,
    "base_price": 25000,
    "image_url": "/images/red_bull_can.jpg",
    "description": "Nạp năng lượng bùng nổ, tăng cường sự tỉnh táo và phản xạ thần kinh trong các trận thi đấu căng thẳng.",
    "short_description": "Lon vàng lùn nạp năng lượng bùng nổ tăng tỉnh táo và phản xạ thần kinh",
    "category": {
      "id": 5,
      "name": "Đồ uống & Đồ ăn",
      "slug": "do-uong-do-an"
    },
    "brand": {
      "id": 17,
      "name": "Red Bull",
      "slug": "red-bull"
    },
    "item_type": "drink_food",
    "in_stock": true,
    "variants": [
      {
        "id": 3301,
        "sku": "RED-250ML",
        "color": "Lon Vàng",
        "weight": "250g",
        "option_name": "Dung tích",
        "option_value": "Lon 250ml Ướp Lạnh",
        "price": 25000,
        "stock_quantity": 90
      }
    ],
    "specs": {
      "material": "Taurine, Caffeine, Vitamin nhóm B",
      "thickness": "250ml",
      "weight": "250g",
      "usapa_certified": true,
      "origin": "Thái Lan"
    }
  },
  {
    "id": 34,
    "name": "Nước Khoáng Thiên Nhiên La Vie 500ml",
    "slug": "nuoc-khoang-thien-nhien-lavie-500ml",
    "price": 12000,
    "sale_price": 12000,
    "base_price": 12000,
    "image_url": "/images/water_bottle_lavie.jpg",
    "description": "Nước khoáng thiên nhiên đóng chai thanh khiết, ướp lạnh sảng khoái bổ sung khoáng chất vi lượng an lành.",
    "short_description": "Nước khoáng thiên nhiên thanh khiết ướp lạnh sảng khoái giải khát",
    "category": {
      "id": 5,
      "name": "Đồ uống & Đồ ăn",
      "slug": "do-uong-do-an"
    },
    "brand": {
      "id": 18,
      "name": "LaVie",
      "slug": "lavie"
    },
    "item_type": "drink_food",
    "in_stock": true,
    "variants": [
      {
        "id": 3401,
        "sku": "LAV-500ML",
        "color": "Trong Suốt",
        "weight": "500g",
        "option_name": "Dung tích",
        "option_value": "Chai 500ml Ướp Lạnh",
        "price": 12000,
        "stock_quantity": 200
      }
    ],
    "specs": {
      "material": "Khoáng thiên nhiên đóng chai",
      "thickness": "500ml",
      "weight": "500g",
      "usapa_certified": true,
      "origin": "Nestlé Waters Việt Nam"
    }
  },
  {
    "id": 35,
    "name": "Nước Dừa Tươi Bến Tre Nguyên Trái Ướp Lạnh",
    "slug": "nuoc-dua-tuoi-ben-tre-nguyen-trai",
    "price": 30000,
    "sale_price": 30000,
    "base_price": 30000,
    "image_url": "/images/fresh_coconut.jpg",
    "description": "Dừa xiêm gọt sọ Bến Tre ướp lạnh, dồi dào chất điện giải tự nhiên và khoáng Kali giúp phòng ngừa chuột rút hiệu quả.",
    "short_description": "Dừa xiêm gọt sọ ướp lạnh dồi dào Kali tự nhiên phòng ngừa chuột rút hiệu quả",
    "category": {
      "id": 5,
      "name": "Đồ uống & Đồ ăn",
      "slug": "do-uong-do-an"
    },
    "brand": {
      "id": 22,
      "name": "DEMOPICK",
      "slug": "demopick"
    },
    "item_type": "drink_food",
    "in_stock": true,
    "variants": [
      {
        "id": 3501,
        "sku": "COCO-FRESH",
        "color": "Trắng Gọt Sọ",
        "weight": "500g",
        "option_name": "Quy cách",
        "option_value": "Trái Ướp Lạnh Kèm Ống Hút",
        "price": 30000,
        "stock_quantity": 60
      }
    ],
    "specs": {
      "material": "100% Nước dừa tươi nguyên chất",
      "thickness": "Trái 400ml - 500ml",
      "weight": "500g",
      "usapa_certified": true,
      "origin": "Bến Tre, Việt Nam"
    }
  },
  {
    "id": 36,
    "name": "Trà Chanh Sả Mật Ong Tươi Ướp Lạnh 500ml",
    "slug": "tra-chanh-sa-mat-ong-tuoi-500ml",
    "price": 28000,
    "sale_price": 28000,
    "base_price": 28000,
    "image_url": "/images/iced_lemon_tea.jpg",
    "description": "Trà thảo mộc tươi pha trong ngày từ lá trà xanh hảo hạng, nước cốt chanh tươi, sả đập dập và mật ong hoa nhãn giải nhiệt.",
    "short_description": "Trà thảo mộc pha trong ngày từ cốt chanh tươi, sả đập dập và mật ong hoa nhãn",
    "category": {
      "id": 5,
      "name": "Đồ uống & Đồ ăn",
      "slug": "do-uong-do-an"
    },
    "brand": {
      "id": 22,
      "name": "DEMOPICK",
      "slug": "demopick"
    },
    "item_type": "drink_food",
    "in_stock": true,
    "variants": [
      {
        "id": 3601,
        "sku": "TEA-LEMON-500",
        "color": "Vàng Hổ Phách",
        "weight": "500g",
        "option_name": "Dung tích",
        "option_value": "Ly Thể Thao 500ml",
        "price": 28000,
        "stock_quantity": 50
      }
    ],
    "specs": {
      "material": "Trà xanh, chanh tươi, sả tươi, mật ong",
      "thickness": "500ml",
      "weight": "500g",
      "usapa_certified": true,
      "origin": "Pha chế tại Quầy Sân"
    }
  },
  {
    "id": 37,
    "name": "Cà Phê Sữa Đá Chiết Xuất Lạnh Cold Brew DemoPick 350ml",
    "slug": "ca-phe-sua-da-cold-brew-demopick-350ml",
    "price": 35000,
    "sale_price": 35000,
    "base_price": 35000,
    "image_url": "/images/cold_brew_coffee.jpg",
    "description": "Hạt Arabica Cầu Đất ủ lạnh 16 tiếng đậm vị mượt mà, hòa cùng sữa tươi ít béo mang lại sự tỉnh táo tập trung tối đa cho người chơi.",
    "short_description": "Arabica Cầu Đất ủ lạnh 16 tiếng đậm vị mượt mà mang lại tỉnh táo tập trung cao độ",
    "category": {
      "id": 5,
      "name": "Đồ uống & Đồ ăn",
      "slug": "do-uong-do-an"
    },
    "brand": {
      "id": 22,
      "name": "DEMOPICK",
      "slug": "demopick"
    },
    "item_type": "drink_food",
    "in_stock": true,
    "variants": [
      {
        "id": 3701,
        "sku": "CB-COFFEE-350",
        "color": "Nâu Cà Phê Sữa",
        "weight": "350g",
        "option_name": "Dung tích",
        "option_value": "Chai 350ml Ướp Lạnh",
        "price": 35000,
        "stock_quantity": 40
      }
    ],
    "specs": {
      "material": "Cà phê Arabica Cầu Đất ủ lạnh + Sữa tươi",
      "thickness": "Chai thủy tinh 350ml",
      "weight": "350g",
      "usapa_certified": true,
      "origin": "DemoPick Kitchen"
    }
  },
  {
    "id": 38,
    "name": "Thanh Năng Lượng Hạt Dinh Dưỡng Granola Protein Bar 50g",
    "slug": "thanh-nang-luong-granola-protein-bar-50g",
    "price": 35000,
    "sale_price": 35000,
    "base_price": 35000,
    "image_url": "/images/protein_granola_bar.jpg",
    "description": "Chứa 12g protein từ yến mạch nguyên cám, hạt hạnh nhân và hạt điều, giải pháp chống đói hạ đường huyết hoàn hảo giữa hai set đấu.",
    "short_description": "Chứa 12g protein từ yến mạch hạnh nhân chống đói hạ đường huyết giữa trận",
    "category": {
      "id": 5,
      "name": "Đồ uống & Đồ ăn",
      "slug": "do-uong-do-an"
    },
    "brand": {
      "id": 19,
      "name": "Nature Valley",
      "slug": "nature-valley"
    },
    "item_type": "drink_food",
    "in_stock": true,
    "variants": [
      {
        "id": 3801,
        "sku": "BAR-PRO-50G",
        "color": "Nâu Hạt Ngũ Cốc",
        "weight": "50g",
        "option_name": "Quy cách",
        "option_value": "Thanh Dinh Dưỡng 50g",
        "price": 35000,
        "stock_quantity": 80
      }
    ],
    "specs": {
      "material": "Yến mạch, hạnh nhân, hạt điều, whey protein",
      "thickness": "Thanh 50g",
      "weight": "50g",
      "usapa_certified": true,
      "origin": "Nhập khẩu Mỹ"
    }
  },
  {
    "id": 39,
    "name": "Bánh Sô-cô-la Đậu Phộng Năng Lượng Snickers Bar 50g",
    "slug": "banh-socola-dau-phong-snickers-bar-50g",
    "price": 30000,
    "sale_price": 30000,
    "base_price": 30000,
    "image_url": "/images/snickers_bar.jpg",
    "description": "Nạp calo nhanh chóng với lớp caramel dẻo ngọt, đậu phộng rang giòn thơm bùi phủ chocolate sữa chất lượng.",
    "short_description": "Nạp calo nhanh chóng với caramel dẻo, đậu phộng giòn phủ socola sữa thơm ngon",
    "category": {
      "id": 5,
      "name": "Đồ uống & Đồ ăn",
      "slug": "do-uong-do-an"
    },
    "brand": {
      "id": 20,
      "name": "Snickers",
      "slug": "snickers"
    },
    "item_type": "drink_food",
    "in_stock": true,
    "variants": [
      {
        "id": 3901,
        "sku": "SNK-BAR-50G",
        "color": "Nâu Socola",
        "weight": "50g",
        "option_name": "Quy cách",
        "option_value": "Thanh 50g Nạp Năng Lượng",
        "price": 30000,
        "stock_quantity": 90
      }
    ],
    "specs": {
      "material": "Đậu phộng rang, caramel, kẹo mềm xốp, socola sữa",
      "thickness": "250 kcal / thanh",
      "weight": "50g",
      "usapa_certified": true,
      "origin": "Chính hãng Mars"
    }
  },
  {
    "id": 40,
    "name": "Chuối Tiêu Tươi Thể Thao Dole Farm Tiêu Chuẩn",
    "slug": "chuoi-tieu-tuoi-the-thao-dole-farm",
    "price": 15000,
    "sale_price": 15000,
    "base_price": 15000,
    "image_url": "/images/dole_banana.jpg",
    "description": "\"Thực phẩm vàng\" của các vận động viên tennis & pickleball chuyên nghiệp, bổ sung carbohydrate dễ tiêu hóa và Kali chống chuột rút.",
    "short_description": "Bổ sung Kali tự nhiên và carbohydrate dễ tiêu hóa chống chuột rút khi thi đấu",
    "category": {
      "id": 5,
      "name": "Đồ uống & Đồ ăn",
      "slug": "do-uong-do-an"
    },
    "brand": {
      "id": 21,
      "name": "Dole",
      "slug": "dole"
    },
    "item_type": "drink_food",
    "in_stock": true,
    "variants": [
      {
        "id": 4001,
        "sku": "DOLE-BANANA-01",
        "color": "Vàng Tươi",
        "weight": "160g",
        "option_name": "Quy cách",
        "option_value": "Trái Chuối Tươi Chọn Lọc",
        "price": 15000,
        "stock_quantity": 70
      }
    ],
    "specs": {
      "material": "100% Chuối tiêu tươi Dole đạt chuẩn GAP",
      "thickness": "Trái 150g - 180g",
      "weight": "160g",
      "usapa_certified": true,
      "origin": "Dole Farm"
    }
  },
  {
    "id": 41,
    "name": "Dịch Vụ Cho Thuê Vợt Tập Pickleball JOOLA (30k/giờ)",
    "slug": "dich-vu-thue-vot-tap-pickleball",
    "price": 30000,
    "sale_price": 30000,
    "base_price": 30000,
    "image_url": "/images/pickleball_paddle_balls.jpg",
    "description": "Cho thuê vợt tập thi đấu JOOLA chuẩn cho người mới chơi hoặc khách quên mang vợt tại cụm sân.",
    "short_description": "Thuê vợt tập theo giờ chơi tại cụm sân (kèm bóng miễn phí)",
    "category": {
      "id": 6,
      "name": "Thiết bị & Dịch vụ cho thuê",
      "slug": "thiet-bi-dich-vu-cho-thue"
    },
    "brand": {
      "id": 1,
      "name": "JOOLA",
      "slug": "joola"
    },
    "item_type": "rental",
    "in_stock": true,
    "variants": [
      {
        "id": 4101,
        "sku": "RENT-PAD-01",
        "color": "Mặc định",
        "weight": "220g",
        "option_name": "Thời lượng",
        "option_value": "Gói 1 Giờ",
        "price": 30000,
        "stock_quantity": 20
      }
    ],
    "specs": {
      "material": "Composite Polymer",
      "thickness": "14mm",
      "weight": "220g",
      "usapa_certified": true,
      "origin": "JOOLA"
    }
  },
  {
    "id": 42,
    "name": "Dịch Vụ Cho Thuê Máy Bắn Bóng Tự Động (100k/giờ)",
    "slug": "dich-vu-thue-may-ban-bong-tu-dong",
    "price": 100000,
    "sale_price": 100000,
    "base_price": 100000,
    "image_url": "/images/pickleball_net_portable.jpg",
    "description": "Cho thuê máy bắn bóng tự động lập trình nhiều góc độ, xoáy và tốc độ phục vụ luyện tập dink và smash cá nhân.",
    "short_description": "Thuê máy tập bắn bóng tự động lập trình nhiều góc độ theo giờ",
    "category": {
      "id": 6,
      "name": "Thiết bị & Dịch vụ cho thuê",
      "slug": "thiet-bi-dich-vu-cho-thue"
    },
    "brand": {
      "id": 2,
      "name": "Selkirk",
      "slug": "selkirk"
    },
    "item_type": "rental",
    "in_stock": true,
    "variants": [
      {
        "id": 4201,
        "sku": "RENT-BALL-MACHINE",
        "color": "Mặc định",
        "weight": "15kg",
        "option_name": "Thời lượng",
        "option_value": "Gói 1 Giờ",
        "price": 100000,
        "stock_quantity": 4
      }
    ],
    "specs": {
      "material": "Khung hợp kim nhôm di động",
      "thickness": "Chứa 150 bóng",
      "weight": "15kg",
      "usapa_certified": true,
      "origin": "Selkirk USA"
    }
  }
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
    const syncedRaw = localStorage.getItem("demopick_synced_products_v3")
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

