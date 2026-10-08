import { CategoryItem, BrandItem, InventoryProduct } from '@/pages/Inventory';
export const initialCategories: CategoryItem[] = [
  {
    id: 1,
    name: "Vợt Pickleball",
    slug: "vot-pickleball",
    description: "Các dòng vợt thi đấu sợi carbon T700, raw carbon, composite đạt chuẩn USAPA Pro.",
    iconType: "trophy",
  },
  {
    id: 2,
    name: "Bóng Pickleball",
    slug: "bong-pickleball",
    description: "Bóng thi đấu ngoài trời 40 lỗ và trong nhà 26 lỗ đạt chuẩn giải đấu quốc tế.",
    iconType: "circle-dot",
  },
  {
    id: 3,
    name: "Phụ kiện & Bao vợt",
    slug: "phu-kien-bao-vot",
    description: "Bao vợt chuyên dụng, balo, băng quấn cán, nón, kính bảo vệ mắt chống lóa.",
    iconType: "shopping-bag",
  },
  {
    id: 4,
    name: "Quần áo & Trang phục",
    slug: "quan-ao-trang-phuc",
    description: "Trang phục thi đấu Pickleball chất liệu dry-fit thoáng khí, co giãn 4 chiều.",
    iconType: "layers",
  },
  {
    id: 5,
    name: "Giày & Tất Thể Thao",
    slug: "giay-tat-the-thao",
    description: "Giày thi đấu Pickleball chuyên dụng đế cao su non bám sân, bảo vệ cổ chân.",
    iconType: "tag",
  },
  {
    id: 6,
    name: "Thiết bị & Dịch vụ cho thuê",
    slug: "thiet-bi-dich-vu-cho-thue",
    description: "Cho thuê vợt tập, máy bắn bóng tự động, cọc lưới di động, giày thi đấu.",
    iconType: "tag",
  },
  {
    id: 7,
    name: "Đồ uống & Đồ ăn",
    slug: "do-uong-do-an",
    description: "Nước khoáng điện giải bù khoáng tức thì, cà phê và đồ ăn nhẹ tại quầy dịch vụ sân.",
    iconType: "coffee",
  },
];

export const initialBrands: BrandItem[] = [
  { id: 1, name: "JOOLA", slug: "joola", origin: "Mỹ / Đức", description: "Thương hiệu số 1 thế giới, tài trợ Ben Johns & Anna Bright." },
  { id: 2, name: "Selkirk", slug: "selkirk", origin: "Mỹ (USA)", description: "Dòng vợt Power Air & Vanguard sản xuất thủ công cao cấp tại Mỹ." },
  { id: 3, name: "CRBN", slug: "crbn", origin: "Mỹ (USA)", description: "Công nghệ Raw T700 Carbon Fiber tạo xoáy bóng đỉnh cao." },
  { id: 4, name: "Franklin", slug: "franklin", origin: "Mỹ (USA)", description: "Bóng thi đấu chính thức US Open X-40 và phụ kiện chuyên nghiệp." },
  { id: 5, name: "Gamma", slug: "gamma", origin: "Mỹ (USA)", description: "Phụ kiện thể thao, băng cuốn cán vợt chống trượt hàng đầu." },
  { id: 6, name: "Pocari", slug: "pocari", origin: "Nhật Bản", description: "Thức uống bù điện giải ion hàng đầu thế giới." },
  { id: 7, name: "Aquafina", slug: "aquafina", origin: "Việt Nam (PepsiCo)", description: "Nước uống tinh khiết cao cấp." },
  { id: 8, name: "Babolat", slug: "babolat", origin: "Pháp", description: "Hãng thể thao danh tiếng với các dòng vợt trợ lực toàn diện." },
];

export const initialUnifiedProducts: InventoryProduct[] = [
  {
    "id": 1,
    "name": "Vợt JOOLA Perseus 3S Carbon 16mm Ben Johns Edition",
    "category": "Vợt Pickleball",
    "brand": "JOOLA",
    "price": 5490000,
    "originalPrice": 5990000,
    "stock": 25,
    "status": "active",
    "image": "/images/pickleball_paddle_joola.jpg",
    "gallery": [
      "/images/pickleball_paddle_joola.jpg"
    ],
    "highlights": [
      "Vợt thi đấu đỉnh cao thế giới Ben Johns Carbon T700 Propulsion Core trợ lực tối đa"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Raw Carbon T700 Charged"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "16mm & 14mm"
      },
      {
        "label": "Trọng lượng",
        "value": "225g - 235g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Mỹ / Nhập khẩu chính hãng"
      }
    ],
    "description": "Vợt thi đấu đỉnh cao của tay vợt số 1 thế giới Ben Johns với công nghệ Carbon T700 Charged, lõi Propulsion Core trợ lực tối đa.",
    "channel": "all"
  },
  {
    "id": 2,
    "name": "Vợt Selkirk Vanguard Power Air Invikta Pro",
    "category": "Vợt Pickleball",
    "brand": "Selkirk",
    "price": 6200000,
    "originalPrice": 6800000,
    "stock": 20,
    "status": "active",
    "image": "/images/pickleball_paddle_balls.jpg",
    "gallery": [
      "/images/pickleball_paddle_balls.jpg"
    ],
    "highlights": [
      "Dòng vợt không viền Air Dynamic Throttle bứt phá tốc độ và xoáy bóng ProSpin+"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "QuadFlex 4 Layer Hybrid Face"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "13mm Aerodynamic"
      },
      {
        "label": "Trọng lượng",
        "value": "220g - 230g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "USA Made"
      }
    ],
    "description": "Dòng vợt cao cấp không viền Air Dynamic Throttle tăng tốc độ vung vợt, màng ProSpin+ NextGen tạo xoáy bóng tối đa.",
    "channel": "all"
  },
  {
    "id": 3,
    "name": "Vợt CRBN 1X Power Series 14mm Raw Carbon",
    "category": "Vợt Pickleball",
    "brand": "CRBN",
    "price": 4850000,
    "originalPrice": 5200000,
    "stock": 18,
    "status": "active",
    "image": "/images/pickleball_carbon_technology.png",
    "gallery": [
      "/images/pickleball_carbon_technology.png"
    ],
    "highlights": [
      "Toray T700 Raw Carbon nhám tự nhiên trợ lực xoáy bóng và smash uy lực cuối sân"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Toray T700 Carbon Fiber"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "14mm & 16mm"
      },
      {
        "label": "Trọng lượng",
        "value": "225g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "USA Design"
      }
    ],
    "description": "Bề mặt Toray T700 Raw Carbon nhám tự nhiên siêu bám bóng, hỗ trợ lực xoáy bóng và smash uy lực vùng cuối sân.",
    "channel": "all"
  },
  {
    "id": 4,
    "name": "Vợt Franklin Signature Pro Carbon 16mm",
    "category": "Vợt Pickleball",
    "brand": "Franklin",
    "price": 3450000,
    "originalPrice": 3800000,
    "stock": 25,
    "status": "active",
    "image": "/images/pickleball_paddles_collection.jpg",
    "gallery": [
      "/images/pickleball_paddles_collection.jpg"
    ],
    "highlights": [
      "Vợt thi đấu chính thức US Open Pickleball Championships điểm ngọt lớn kiểm soát bóng"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Carbon Fiber Surface + MaxGrit"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "16mm Polypropylene Core"
      },
      {
        "label": "Trọng lượng",
        "value": "215g - 225g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Chính hãng"
      }
    ],
    "description": "Vợt chính thức của giải thi đấu US Open Pickleball Championships, điểm ngọt lớn, kiểm soát bóng êm ái.",
    "channel": "all"
  },
  {
    "id": 5,
    "name": "Vợt Six Zero Double Black Diamond Control 16mm",
    "category": "Vợt Pickleball",
    "brand": "Six Zero",
    "price": 4950000,
    "originalPrice": 5400000,
    "stock": 15,
    "status": "active",
    "image": "/images/pickleball_paddle_joola.jpg",
    "gallery": [
      "/images/pickleball_paddle_joola.jpg"
    ],
    "highlights": [
      "Raw Toray 700 Carbon nhiệt luyện toàn phần sweetspot cực rộng cho pha dink bóng"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Premium Japanese Toray 700 Carbon"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "16mm Honeycomb Core"
      },
      {
        "label": "Trọng lượng",
        "value": "230g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Úc / USA"
      }
    ],
    "description": "Raw Toray 700 Carbon nhiệt luyện toàn phần Carbon Fusion Edge, sweetspot cực rộng cho các pha dink bóng sát lưới.",
    "channel": "all"
  },
  {
    "id": 6,
    "name": "Vợt Engage Pursuit Pro EX 6.0 Raw Carbon",
    "category": "Vợt Pickleball",
    "brand": "Engage",
    "price": 5600000,
    "originalPrice": 6100000,
    "stock": 14,
    "status": "active",
    "image": "/images/pickleball_paddle_balls.jpg",
    "gallery": [
      "/images/pickleball_paddle_balls.jpg"
    ],
    "highlights": [
      "Lõi MachPro Black Polymer trợ lực và giảm chấn êm ái tăng xoáy bóng top-spin"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Toray T700 Raw Carbon + MachPro Core"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "16mm Core"
      },
      {
        "label": "Trọng lượng",
        "value": "230g - 240g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Made in USA"
      }
    ],
    "description": "Lõi MachPro Black Polymer trợ lực và giảm rung chấn chấn thương cổ tay, mặt vợt nhám tăng tỷ lệ xoáy bóng top-spin.",
    "channel": "all"
  },
  {
    "id": 7,
    "name": "Vợt Gearbox Pro Power Elongated SST Carbon",
    "category": "Vợt Pickleball",
    "brand": "Gearbox",
    "price": 6500000,
    "originalPrice": 6950000,
    "stock": 10,
    "status": "active",
    "image": "/images/pickleball_carbon_technology.png",
    "gallery": [
      "/images/pickleball_carbon_technology.png"
    ],
    "highlights": [
      "Khung đúc Solid Span Technology không viền bọc lực smash uy lực nhất hiện nay"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Patented Solid Carbon Core SST"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "14mm"
      },
      {
        "label": "Trọng lượng",
        "value": "230g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "USA"
      }
    ],
    "description": "Công nghệ khung đúc nguyên khối Solid Span Technology không viền bọc, độ nảy và lực bóng smash uy lực nhất hiện nay.",
    "channel": "all"
  },
  {
    "id": 8,
    "name": "Vợt Diadem Edge 18k Speed Pro Carbon 3D",
    "category": "Vợt Pickleball",
    "brand": "Diadem",
    "price": 5200000,
    "originalPrice": 5600000,
    "stock": 16,
    "status": "active",
    "image": "/images/pickleball_paddles_collection.jpg",
    "gallery": [
      "/images/pickleball_paddles_collection.jpg"
    ],
    "highlights": [
      "Bề mặt sợi carbon 18K dạng đan 3D bám bóng triệt tiêu rung giật kiểm soát tinh tế"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "3D 18K Carbon Fiber Face"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "16mm Core"
      },
      {
        "label": "Trọng lượng",
        "value": "228g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Mỹ"
      }
    ],
    "description": "Bề mặt sợi carbon 18K dạng đan 3D độc quyền bám bóng và triệt tiêu lực giật, cho cảm giác chạm bóng tinh tế nhất.",
    "channel": "all"
  },
  {
    "id": 9,
    "name": "Vợt Paddletek Tempest Pro Bantam v3 Wave",
    "category": "Vợt Pickleball",
    "brand": "Paddletek",
    "price": 4700000,
    "originalPrice": 5100000,
    "stock": 12,
    "status": "active",
    "image": "/images/pickleball_paddle_joola.jpg",
    "gallery": [
      "/images/pickleball_paddle_joola.jpg"
    ],
    "highlights": [
      "Bề mặt Smart Response Technology triệt tiêu rung giật khi block bóng phản xạ nhanh"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "High Grade Carbon Composite"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "14.3mm"
      },
      {
        "label": "Trọng lượng",
        "value": "225g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Made in USA"
      }
    ],
    "description": "Dòng vợt huyền thoại kiểm soát bóng với bề mặt Smart Response Technology triệt tiêu rung giật khi block bóng phản xạ nhanh.",
    "channel": "all"
  },
  {
    "id": 10,
    "name": "Vợt ProXR Zane Navratil The Standard 14mm Spin",
    "category": "Vợt Pickleball",
    "brand": "ProXR",
    "price": 4600000,
    "originalPrice": 4950000,
    "stock": 15,
    "status": "active",
    "image": "/images/pickleball_paddle_balls.jpg",
    "gallery": [
      "/images/pickleball_paddle_balls.jpg"
    ],
    "highlights": [
      "Cán nghiêng công thái học độc quyền Zane Navratil cổ tay linh hoạt cắt bóng xoáy"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "T700 Raw Carbon Ultra Spin"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "14mm Core"
      },
      {
        "label": "Trọng lượng",
        "value": "232g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "USA"
      }
    ],
    "description": "Thiết kế cán nghiêng công thái học độc quyền của Zane Navratil giúp cổ tay linh hoạt tối đa khi cắt bóng xoáy chéo sân.",
    "channel": "all"
  },
  {
    "id": 11,
    "name": "Hộp 12 Quả Bóng Franklin X-40 Outdoor (Vàng Chanh)",
    "category": "Bóng Pickleball",
    "brand": "Franklin",
    "price": 420000,
    "originalPrice": 460000,
    "stock": 80,
    "status": "active",
    "image": "/images/pickleball_balls_yellow.jpg",
    "gallery": [
      "/images/pickleball_balls_yellow.jpg"
    ],
    "highlights": [
      "Bóng thi đấu ngoài trời chuẩn 40 lỗ đục khí động học USAPA Approved độ nảy đồng đều"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Nhựa nhiệt dẻo đúc nguyên khối"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "40 lỗ chuẩn ngoài trời"
      },
      {
        "label": "Trọng lượng",
        "value": "26g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "USA"
      }
    ],
    "description": "Bóng thi đấu ngoài trời chuẩn 40 lỗ đục khí động học, độ nảy đồng đều và độ bền cao không lo nứt vỡ, USAPA Approved.",
    "channel": "all"
  },
  {
    "id": 12,
    "name": "Hộp 3 Quả Bóng Dura Fast 40 Chuyên Nghiệp PPA Tour",
    "category": "Bóng Pickleball",
    "brand": "Dura",
    "price": 150000,
    "originalPrice": 165000,
    "stock": 120,
    "status": "active",
    "image": "/images/pickleball_balls_yellow.jpg",
    "gallery": [
      "/images/pickleball_balls_yellow.jpg"
    ],
    "highlights": [
      "Bóng thi đấu chính thức giải PPA Tour đường bay nhanh đầm tay tối ưu VĐV"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Polyethylene công nghiệp cứng"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "40 lỗ gia công CNC"
      },
      {
        "label": "Trọng lượng",
        "value": "26g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "USA"
      }
    ],
    "description": "Bóng thi đấu chính thức các giải PPA Tour thế giới, đường bay nhanh và đầm tay, tối ưu cho các trận cầu đỉnh cao.",
    "channel": "all"
  },
  {
    "id": 13,
    "name": "Hộp 12 Quả Bóng Onix Fuse G2 Indoor (Màu Cam Sáng)",
    "category": "Bóng Pickleball",
    "brand": "Onix",
    "price": 450000,
    "originalPrice": 490000,
    "stock": 60,
    "status": "active",
    "image": "/images/pickleball_balls_yellow.jpg",
    "gallery": [
      "/images/pickleball_balls_yellow.jpg"
    ],
    "highlights": [
      "Bóng thi đấu trong nhà chuẩn 26 lỗ lớn quỹ đạo ổn định độ bám sân cao"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Nhựa dẻo giảm tiếng ồn"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "26 lỗ trong nhà"
      },
      {
        "label": "Trọng lượng",
        "value": "25g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "USA"
      }
    ],
    "description": "Bóng thi đấu trong nhà chuẩn 26 lỗ kích thước lớn, quỹ đạo bay ổn định, độ bám mặt sân cao không trơn trượt.",
    "channel": "all"
  },
  {
    "id": 14,
    "name": "Hộp 6 Quả Bóng JOOLA Primo Ball Outdoor USAPA",
    "category": "Bóng Pickleball",
    "brand": "JOOLA",
    "price": 260000,
    "originalPrice": 290000,
    "stock": 75,
    "status": "active",
    "image": "/images/pickleball_balls_yellow.jpg",
    "gallery": [
      "/images/pickleball_balls_yellow.jpg"
    ],
    "highlights": [
      "Nhựa đàn hồi cao cấp chống méo nứt khi nắng gắt độ nảy ổn định chuẩn USAPA"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Polyethylene dẻo nhiệt chống méo"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "40 lỗ đục cân bằng"
      },
      {
        "label": "Trọng lượng",
        "value": "26g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Chính hãng"
      }
    ],
    "description": "Hạt nhựa đàn hồi cao cấp chống biến dạng khi thời tiết lạnh hoặc nắng gắt, độ nảy giữ chuẩn sau hàng trăm trận đấu.",
    "channel": "all"
  },
  {
    "id": 15,
    "name": "Hộp 12 Quả Bóng Selkirk Pro S1 Tour Ball",
    "category": "Bóng Pickleball",
    "brand": "Selkirk",
    "price": 480000,
    "originalPrice": 520000,
    "stock": 50,
    "status": "active",
    "image": "/images/pickleball_balls_yellow.jpg",
    "gallery": [
      "/images/pickleball_balls_yellow.jpg"
    ],
    "highlights": [
      "Công nghệ đúc vi mô khí động học bóng bay thẳng xoáy chuẩn trong gió lớn"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Khuôn đúc cân bằng vi mô"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "40 lỗ tròn khí động học"
      },
      {
        "label": "Trọng lượng",
        "value": "26.2g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "USA"
      }
    ],
    "description": "Thiết kế khí động học được nghiên cứu chuyên sâu đảm bảo bóng bay thẳng và xoáy chuẩn xác trong gió lớn.",
    "channel": "all"
  },
  {
    "id": 16,
    "name": "Thùng 100 Quả Bóng Pickleball Tập Luyện Câu Lạc Bộ DemoPick",
    "category": "Bóng Pickleball",
    "brand": "DEMOPICK",
    "price": 2650000,
    "originalPrice": 2900000,
    "stock": 30,
    "status": "active",
    "image": "/images/pickleball_balls_yellow.jpg",
    "gallery": [
      "/images/pickleball_balls_yellow.jpg"
    ],
    "highlights": [
      "Thùng 100 quả bóng dập logo DemoPick siêu bền tối ưu cho CLB và máy bắn bóng"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Nhựa dẻo siêu bền chống nứt vỡ"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "40 lỗ tiêu chuẩn"
      },
      {
        "label": "Trọng lượng",
        "value": "26g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Việt Nam"
      }
    ],
    "description": "Thùng bóng số lượng lớn tối ưu chi phí cho các câu lạc bộ, lớp huấn luyện và máy bắn bóng tự động.",
    "channel": "all"
  },
  {
    "id": 17,
    "name": "Balo Pickleball JOOLA Tour Elite Pro Backpack",
    "category": "Phụ kiện & Bao vợt",
    "brand": "JOOLA",
    "price": 1850000,
    "originalPrice": 2100000,
    "stock": 25,
    "status": "active",
    "image": "/images/pickleball_backpack_apex.jpg",
    "gallery": [
      "/images/pickleball_backpack_apex.jpg"
    ],
    "highlights": [
      "Ngăn cách nhiệt bảo vệ 4 vợt, ngăn giày thông gió riêng và móc treo sân tiện lợi"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "900D Nylon chống thấm"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "Ngăn Thermoguard"
      },
      {
        "label": "Trọng lượng",
        "value": "850g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Chính hãng"
      }
    ],
    "description": "Balo đựng vợt chuyên nghiệp có ngăn cách nhiệt chứa 4 cây vợt, ngăn thông gió đựng giày và móc treo hàng rào sân cực tiện.",
    "channel": "all"
  },
  {
    "id": 18,
    "name": "Túi Du Lịch Pickleball Selkirk Team Duffle Bag",
    "category": "Phụ kiện & Bao vợt",
    "brand": "Selkirk",
    "price": 1650000,
    "originalPrice": 1850000,
    "stock": 20,
    "status": "active",
    "image": "/images/pickleball_backpack_apex.jpg",
    "gallery": [
      "/images/pickleball_backpack_apex.jpg"
    ],
    "highlights": [
      "Thể tích lớn chứa 6 vợt, bóng, khăn thi đấu cho các giải đấu xa"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Poly Fabric chống nước cao cấp"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "Đáy gia cố chống va đập"
      },
      {
        "label": "Trọng lượng",
        "value": "900g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "USA"
      }
    ],
    "description": "Thể tích lớn chứa trọn bộ 6 cây vợt, bóng, khăn và phụ kiện cho các giải đấu xa.",
    "channel": "all"
  },
  {
    "id": 19,
    "name": "Balo Đựng Vợt Franklin Pro Series Court Backpack",
    "category": "Phụ kiện & Bao vợt",
    "brand": "Franklin",
    "price": 1250000,
    "originalPrice": 1450000,
    "stock": 30,
    "status": "active",
    "image": "/images/pickleball_backpack_apex.jpg",
    "gallery": [
      "/images/pickleball_backpack_apex.jpg"
    ],
    "highlights": [
      "Quai đeo công thái học êm ái chống mỏi lưng túi phụ giữ lạnh bình nước 1L"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Polyester trượt nước"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "Đệm chống sốc 3 lớp"
      },
      {
        "label": "Trọng lượng",
        "value": "750g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Chính hãng"
      }
    ],
    "description": "Quai đeo công thái học êm ái chống mỏi lưng, túi phụ bên hông giữ lạnh bình nước 1 lít.",
    "channel": "all"
  },
  {
    "id": 20,
    "name": "Bao Da Bảo Vệ Mặt Vợt CRBN Neoprene Paddle Cover",
    "category": "Phụ kiện & Bao vợt",
    "brand": "CRBN",
    "price": 290000,
    "originalPrice": 350000,
    "stock": 45,
    "status": "active",
    "image": "/images/pickleball_carbon_technology.png",
    "gallery": [
      "/images/pickleball_carbon_technology.png"
    ],
    "highlights": [
      "Bọc đệm Neoprene dày dặn chống trầy xước bảo vệ độ nhám Toray T700"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Cao su Neoprene co giãn"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "Đệm 5mm"
      },
      {
        "label": "Trọng lượng",
        "value": "120g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "USA"
      }
    ],
    "description": "Bọc đệm cao su Neoprene dày dặn chống trầy xước và bảo vệ độ nhám bề mặt Carbon T700 của vợt.",
    "channel": "all"
  },
  {
    "id": 21,
    "name": "Túi Đeo Chéo Pickleball Sling Bag Chống Thấm Nước",
    "category": "Phụ kiện & Bao vợt",
    "brand": "DEMOPICK",
    "price": 420000,
    "originalPrice": 490000,
    "stock": 50,
    "status": "active",
    "image": "/images/pickleball_backpack_apex.jpg",
    "gallery": [
      "/images/pickleball_backpack_apex.jpg"
    ],
    "highlights": [
      "Sling bag đeo chéo năng động nhỏ gọn chứa 2 vợt, 4 bóng và đồ cá nhân"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Vải Oxford chống nước"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "Ngăn lót chống sốc"
      },
      {
        "label": "Trọng lượng",
        "value": "350g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Việt Nam"
      }
    ],
    "description": "Thiết kế sling bag năng động đeo chéo gọn nhẹ chứa 2 cây vợt, 4 quả bóng và điện thoại cá nhân.",
    "channel": "all"
  },
  {
    "id": 22,
    "name": "Giày Thi Đấu Pickleball Babolat Jet Mach 3 Pro Court",
    "category": "Quần áo & Trang phục",
    "brand": "Babolat",
    "price": 2950000,
    "originalPrice": 3300000,
    "stock": 12,
    "status": "active",
    "image": "/images/pickleball_shoes.jpg",
    "gallery": [
      "/images/pickleball_shoes.jpg"
    ],
    "highlights": [
      "Đế cao su Michelin bám sân thân dệt Matryx EVO siêu nhẹ bứt tốc ngang êm ái"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Matryx EVO Fabric + Michelin Rubber"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "Đệm KPRS-X"
      },
      {
        "label": "Trọng lượng",
        "value": "310g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Pháp / Chính hãng"
      }
    ],
    "description": "Đế cao su Michelin siêu bám mặt sân pickleball, thân giày dệt Matryx EVO siêu nhẹ bảo vệ cổ chân và khớp gối khi bứt tốc ngang.",
    "channel": "all"
  },
  {
    "id": 23,
    "name": "Giày Chuyên Sân Pickleball Wilson Rush Pro Ace Court",
    "category": "Quần áo & Trang phục",
    "brand": "Wilson",
    "price": 2450000,
    "originalPrice": 2750000,
    "stock": 10,
    "status": "active",
    "image": "/images/pickleball_shoes.jpg",
    "gallery": [
      "/images/pickleball_shoes.jpg"
    ],
    "highlights": [
      "Khung 4D Support Chassis kiểm soát vặn xoắn đế Duralast bền bỉ trên sân cứng"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Sensifeel Mesh + Duralast Rubber"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "Khung 4D Chassis"
      },
      {
        "label": "Trọng lượng",
        "value": "330g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Mỹ"
      }
    ],
    "description": "Mũi giày gia cố 4D Support Chassis kiểm soát chuyển động vặn xoắn, đế Duralast chống mòn tối đa trên sân cứng.",
    "channel": "all"
  },
  {
    "id": 24,
    "name": "Áo Đấu Pickleball Dry-Fit Unisex JOOLA Team Pro",
    "category": "Quần áo & Trang phục",
    "brand": "JOOLA",
    "price": 380000,
    "originalPrice": 450000,
    "stock": 35,
    "status": "active",
    "image": "/images/pickleball_shirt_dryfit.jpg",
    "gallery": [
      "/images/pickleball_shirt_dryfit.jpg"
    ],
    "highlights": [
      "Vải mè vi sợi QuickDry co giãn 4 chiều thoát nhiệt siêu tốc khi vận động mạnh"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "88% Polyester + 12% Spandex"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "Dệt mè lỗ kim thoáng khí"
      },
      {
        "label": "Trọng lượng",
        "value": "160g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Chính hãng"
      }
    ],
    "description": "Chất liệu vải mè vi sợi QuickDry co giãn 4 chiều, công nghệ làm mát thân nhiệt hỗ trợ vận động cường độ cao.",
    "channel": "all"
  },
  {
    "id": 25,
    "name": "Quần Short Thể Thao Pickleball Selkirk Performance Có Túi Sâu",
    "category": "Quần áo & Trang phục",
    "brand": "Selkirk",
    "price": 320000,
    "originalPrice": 380000,
    "stock": 30,
    "status": "active",
    "image": "/images/pickleball_shorts.jpg",
    "gallery": [
      "/images/pickleball_shorts.jpg"
    ],
    "highlights": [
      "Túi sâu đặc dụng chứa gọn 2 quả bóng pickleball không bị rơi văng khi di chuyển"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Co giãn 4 chiều mềm nhẹ"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "Túi sâu ôm bóng"
      },
      {
        "label": "Trọng lượng",
        "value": "180g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "USA"
      }
    ],
    "description": "Thiết kế túi sâu đặc dụng chứa gọn 2 quả bóng pickleball không bị rơi văng ra khi di chuyển cứu bóng.",
    "channel": "all"
  },
  {
    "id": 26,
    "name": "Nón Thể Thao Visor Chắn Nắng Sân Ngoài Trời Franklin Pro",
    "category": "Quần áo & Trang phục",
    "brand": "Franklin",
    "price": 180000,
    "originalPrice": 220000,
    "stock": 50,
    "status": "active",
    "image": "/images/sports_visor_hat.jpg",
    "gallery": [
      "/images/sports_visor_hat.jpg"
    ],
    "highlights": [
      "Nón nửa đầu VĐV chống chói đèn LED và nắng gắt vành thấm hút mồ hôi trán"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Sợi Poly siêu nhẹ"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "Băng trán kháng khuẩn"
      },
      {
        "label": "Trọng lượng",
        "value": "65g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Chính hãng"
      }
    ],
    "description": "Nón nửa đầu phong cách VĐV chuyên nghiệp, vành chắn chống lóa đèn LED sân và chống nắng gắt, thấm hút mồ hôi trán.",
    "channel": "all"
  },
  {
    "id": 27,
    "name": "Set 3 Cuộn Quấn Cán Vợt Pickleball Wilson Pro Overgrip",
    "category": "Phụ kiện & Bao vợt",
    "brand": "Wilson",
    "price": 125000,
    "originalPrice": 140000,
    "stock": 120,
    "status": "active",
    "image": "/images/pickleball_overgrip_tape.jpg",
    "gallery": [
      "/images/pickleball_overgrip_tape.jpg"
    ],
    "highlights": [
      "Băng quấn cán siêu thấm mồ hôi tay bề mặt gai êm ái chống tuột cán khi smash"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Polyurethane vi xốp siêu thấm"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "0.5mm x 110cm"
      },
      {
        "label": "Trọng lượng",
        "value": "30g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Mỹ"
      }
    ],
    "description": "Băng quấn cán mỏng 0.5mm siêu thấm mồ hôi tay, bề mặt gai êm ái chống tuột tay trong các pha smash mạnh.",
    "channel": "all"
  },
  {
    "id": 28,
    "name": "Vỉ 4 Thanh Chì Dán Cân Bằng Đầu Vợt Lead Tape 3g",
    "category": "Phụ kiện & Bao vợt",
    "brand": "CRBN",
    "price": 95000,
    "originalPrice": 120000,
    "stock": 70,
    "status": "active",
    "image": "/images/pickleball_carbon_technology.png",
    "gallery": [
      "/images/pickleball_carbon_technology.png"
    ],
    "highlights": [
      "Chì dán kết dính 3M tăng trọng lượng vung vợt và mở rộng sweetspot"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Chì dán kết dính 3M cao cấp"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "Thanh 5cm x 1cm"
      },
      {
        "label": "Trọng lượng",
        "value": "12g tổng"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "USA"
      }
    ],
    "description": "Tăng trọng lượng vung vợt và mở rộng diện tích điểm ngọt sweetspot theo phong cách cá nhân của người chơi chuyên nghiệp.",
    "channel": "all"
  },
  {
    "id": 29,
    "name": "Cục Gôm Tẩy Vết Bẩn & Bụi Mặt Vợt Carbon Eraser Raw Cleaner",
    "category": "Phụ kiện & Bao vợt",
    "brand": "DEMOPICK",
    "price": 120000,
    "originalPrice": 150000,
    "stock": 85,
    "status": "active",
    "image": "/images/pickleball_carbon_technology.png",
    "gallery": [
      "/images/pickleball_carbon_technology.png"
    ],
    "highlights": [
      "Khôi phục độ nhám nguyên bản mặt sợi Toray T700 chỉ sau 30 giây chà nhẹ"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Hợp chất cao su đặc biệt chuyên dụng"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "Khối 5cm x 5cm x 2.5cm"
      },
      {
        "label": "Trọng lượng",
        "value": "50g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Việt Nam"
      }
    ],
    "description": "Khôi phục độ nhám nguyên bản của mặt sợi Toray Carbon T700, tẩy sạch sợi bóng bám vào sau 30 giây chà nhẹ.",
    "channel": "all"
  },
  {
    "id": 30,
    "name": "Bộ Lưới Di Động Thi Đấu Pickleball USAPA 22-Feet Kèm Khung Thép",
    "category": "Phụ kiện & Bao vợt",
    "brand": "Franklin",
    "price": 2150000,
    "originalPrice": 2450000,
    "stock": 15,
    "status": "active",
    "image": "/images/pickleball_net_portable.jpg",
    "gallery": [
      "/images/pickleball_net_portable.jpg"
    ],
    "highlights": [
      "Khung thép sơn tĩnh điện tháo lắp 5 phút chuẩn USAPA 22ft tặng kèm túi đựng"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Khung thép sơn tĩnh điện + Lưới PE chống UV"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "Dài 22 feet (6.7m)"
      },
      {
        "label": "Trọng lượng",
        "value": "9.5kg"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Chính hãng"
      }
    ],
    "description": "Bộ khung thép sơn tĩnh điện tháo lắp nhanh chuẩn USAPA dài 22ft, chiều cao tâm lưới chuẩn 34 inch và hai đầu 36 inch.",
    "channel": "all"
  },
  {
    "id": 31,
    "name": "Nước Bù Điện Giải Pocari Sweat Ion Supply 500ml",
    "category": "Đồ uống & Đồ ăn",
    "brand": "Pocari",
    "price": 25000,
    "originalPrice": 25000,
    "stock": 120,
    "status": "active",
    "image": "/images/pocari_sweat_500ml.jpg",
    "gallery": [
      "/images/pocari_sweat_500ml.jpg"
    ],
    "highlights": [
      "Bù nước & 5 ion thiết yếu tương đồng dịch cơ thể hấp thụ nhanh cho VĐV"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Nước bù điện giải ion"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "500ml"
      },
      {
        "label": "Trọng lượng",
        "value": "500g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Otsuka Nhật Bản"
      }
    ],
    "description": "Bù nước và 5 loại ion thiết yếu (Na+, K+, Cl-, Ca2+, Mg2+) tương đồng dịch cơ thể, hấp thụ nhanh gấp 2.2 lần nước thường.",
    "channel": "all"
  },
  {
    "id": 32,
    "name": "Nước Thể Thao Revive Chanh Muối 500ml",
    "category": "Đồ uống & Đồ ăn",
    "brand": "Revive",
    "price": 20000,
    "originalPrice": 20000,
    "stock": 100,
    "status": "active",
    "image": "/images/revive_lemon_drink.jpg",
    "gallery": [
      "/images/revive_lemon_drink.jpg"
    ],
    "highlights": [
      "Bổ sung muối khoáng vitamin B3, B6, B12 và vị chanh muối thanh mát"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Nước isotonic thể thao"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "500ml"
      },
      {
        "label": "Trọng lượng",
        "value": "500g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "PepsiCo Việt Nam"
      }
    ],
    "description": "Bổ sung muối khoáng, vitamin B3, B6, B12 và vị chanh muối thanh mát xua tan cơn khát và chống mỏi cơ khi thi đấu.",
    "channel": "all"
  },
  {
    "id": 33,
    "name": "Nước Tăng Lực Red Bull Thái Lan Lon 250ml",
    "category": "Đồ uống & Đồ ăn",
    "brand": "Red Bull",
    "price": 25000,
    "originalPrice": 25000,
    "stock": 90,
    "status": "active",
    "image": "/images/red_bull_can.jpg",
    "gallery": [
      "/images/red_bull_can.jpg"
    ],
    "highlights": [
      "Lon vàng lùn nạp năng lượng bùng nổ tăng tỉnh táo và phản xạ thần kinh"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Taurine, Caffeine, Vitamin nhóm B"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "250ml"
      },
      {
        "label": "Trọng lượng",
        "value": "250g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Thái Lan"
      }
    ],
    "description": "Nạp năng lượng bùng nổ, tăng cường sự tỉnh táo và phản xạ thần kinh trong các trận thi đấu căng thẳng.",
    "channel": "all"
  },
  {
    "id": 34,
    "name": "Nước Khoáng Thiên Nhiên La Vie 500ml",
    "category": "Đồ uống & Đồ ăn",
    "brand": "LaVie",
    "price": 12000,
    "originalPrice": 12000,
    "stock": 200,
    "status": "active",
    "image": "/images/water_bottle_lavie.jpg",
    "gallery": [
      "/images/water_bottle_lavie.jpg"
    ],
    "highlights": [
      "Nước khoáng thiên nhiên thanh khiết ướp lạnh sảng khoái giải khát"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Khoáng thiên nhiên đóng chai"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "500ml"
      },
      {
        "label": "Trọng lượng",
        "value": "500g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Nestlé Waters Việt Nam"
      }
    ],
    "description": "Nước khoáng thiên nhiên đóng chai thanh khiết, ướp lạnh sảng khoái bổ sung khoáng chất vi lượng an lành.",
    "channel": "all"
  },
  {
    "id": 35,
    "name": "Nước Dừa Tươi Bến Tre Nguyên Trái Ướp Lạnh",
    "category": "Đồ uống & Đồ ăn",
    "brand": "DEMOPICK",
    "price": 30000,
    "originalPrice": 30000,
    "stock": 60,
    "status": "active",
    "image": "/images/fresh_coconut.jpg",
    "gallery": [
      "/images/fresh_coconut.jpg"
    ],
    "highlights": [
      "Dừa xiêm gọt sọ ướp lạnh dồi dào Kali tự nhiên phòng ngừa chuột rút hiệu quả"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "100% Nước dừa tươi nguyên chất"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "Trái 400ml - 500ml"
      },
      {
        "label": "Trọng lượng",
        "value": "500g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Bến Tre, Việt Nam"
      }
    ],
    "description": "Dừa xiêm gọt sọ Bến Tre ướp lạnh, dồi dào chất điện giải tự nhiên và khoáng Kali giúp phòng ngừa chuột rút hiệu quả.",
    "channel": "all"
  },
  {
    "id": 36,
    "name": "Trà Chanh Sả Mật Ong Tươi Ướp Lạnh 500ml",
    "category": "Đồ uống & Đồ ăn",
    "brand": "DEMOPICK",
    "price": 28000,
    "originalPrice": 28000,
    "stock": 50,
    "status": "active",
    "image": "/images/iced_lemon_tea.jpg",
    "gallery": [
      "/images/iced_lemon_tea.jpg"
    ],
    "highlights": [
      "Trà thảo mộc pha trong ngày từ cốt chanh tươi, sả đập dập và mật ong hoa nhãn"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Trà xanh, chanh tươi, sả tươi, mật ong"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "500ml"
      },
      {
        "label": "Trọng lượng",
        "value": "500g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Pha chế tại Quầy Sân"
      }
    ],
    "description": "Trà thảo mộc tươi pha trong ngày từ lá trà xanh hảo hạng, nước cốt chanh tươi, sả đập dập và mật ong hoa nhãn giải nhiệt.",
    "channel": "all"
  },
  {
    "id": 37,
    "name": "Cà Phê Sữa Đá Chiết Xuất Lạnh Cold Brew DemoPick 350ml",
    "category": "Đồ uống & Đồ ăn",
    "brand": "DEMOPICK",
    "price": 35000,
    "originalPrice": 35000,
    "stock": 40,
    "status": "active",
    "image": "/images/cold_brew_coffee.jpg",
    "gallery": [
      "/images/cold_brew_coffee.jpg"
    ],
    "highlights": [
      "Arabica Cầu Đất ủ lạnh 16 tiếng đậm vị mượt mà mang lại tỉnh táo tập trung cao độ"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Cà phê Arabica Cầu Đất ủ lạnh + Sữa tươi"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "Chai thủy tinh 350ml"
      },
      {
        "label": "Trọng lượng",
        "value": "350g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "DemoPick Kitchen"
      }
    ],
    "description": "Hạt Arabica Cầu Đất ủ lạnh 16 tiếng đậm vị mượt mà, hòa cùng sữa tươi ít béo mang lại sự tỉnh táo tập trung tối đa cho người chơi.",
    "channel": "all"
  },
  {
    "id": 38,
    "name": "Thanh Năng Lượng Hạt Dinh Dưỡng Granola Protein Bar 50g",
    "category": "Đồ uống & Đồ ăn",
    "brand": "Nature Valley",
    "price": 35000,
    "originalPrice": 35000,
    "stock": 80,
    "status": "active",
    "image": "/images/protein_granola_bar.jpg",
    "gallery": [
      "/images/protein_granola_bar.jpg"
    ],
    "highlights": [
      "Chứa 12g protein từ yến mạch hạnh nhân chống đói hạ đường huyết giữa trận"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Yến mạch, hạnh nhân, hạt điều, whey protein"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "Thanh 50g"
      },
      {
        "label": "Trọng lượng",
        "value": "50g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Nhập khẩu Mỹ"
      }
    ],
    "description": "Chứa 12g protein từ yến mạch nguyên cám, hạt hạnh nhân và hạt điều, giải pháp chống đói hạ đường huyết hoàn hảo giữa hai set đấu.",
    "channel": "all"
  },
  {
    "id": 39,
    "name": "Bánh Sô-cô-la Đậu Phộng Năng Lượng Snickers Bar 50g",
    "category": "Đồ uống & Đồ ăn",
    "brand": "Snickers",
    "price": 30000,
    "originalPrice": 30000,
    "stock": 90,
    "status": "active",
    "image": "/images/snickers_bar.jpg",
    "gallery": [
      "/images/snickers_bar.jpg"
    ],
    "highlights": [
      "Nạp calo nhanh chóng với caramel dẻo, đậu phộng giòn phủ socola sữa thơm ngon"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Đậu phộng rang, caramel, kẹo mềm xốp, socola sữa"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "250 kcal / thanh"
      },
      {
        "label": "Trọng lượng",
        "value": "50g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Chính hãng Mars"
      }
    ],
    "description": "Nạp calo nhanh chóng với lớp caramel dẻo ngọt, đậu phộng rang giòn thơm bùi phủ chocolate sữa chất lượng.",
    "channel": "all"
  },
  {
    "id": 40,
    "name": "Chuối Tiêu Tươi Thể Thao Dole Farm Tiêu Chuẩn",
    "category": "Đồ uống & Đồ ăn",
    "brand": "Dole",
    "price": 15000,
    "originalPrice": 15000,
    "stock": 70,
    "status": "active",
    "image": "/images/dole_banana.jpg",
    "gallery": [
      "/images/dole_banana.jpg"
    ],
    "highlights": [
      "Bổ sung Kali tự nhiên và carbohydrate dễ tiêu hóa chống chuột rút khi thi đấu"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "100% Chuối tiêu tươi Dole đạt chuẩn GAP"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "Trái 150g - 180g"
      },
      {
        "label": "Trọng lượng",
        "value": "160g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Dole Farm"
      }
    ],
    "description": "\"Thực phẩm vàng\" của các vận động viên tennis & pickleball chuyên nghiệp, bổ sung carbohydrate dễ tiêu hóa và Kali chống chuột rút.",
    "channel": "all"
  },
  {
    "id": 41,
    "name": "Dịch Vụ Cho Thuê Vợt Tập Pickleball JOOLA (30k/giờ)",
    "category": "Thiết bị & Dịch vụ cho thuê",
    "brand": "JOOLA",
    "price": 30000,
    "originalPrice": 30000,
    "stock": 20,
    "status": "active",
    "image": "/images/pickleball_paddle_balls.jpg",
    "gallery": [
      "/images/pickleball_paddle_balls.jpg"
    ],
    "highlights": [
      "Thuê vợt tập theo giờ chơi tại cụm sân (kèm bóng miễn phí)"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Composite Polymer"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "14mm"
      },
      {
        "label": "Trọng lượng",
        "value": "220g"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "JOOLA"
      }
    ],
    "description": "Cho thuê vợt tập thi đấu JOOLA chuẩn cho người mới chơi hoặc khách quên mang vợt tại cụm sân.",
    "channel": "all"
  },
  {
    "id": 42,
    "name": "Dịch Vụ Cho Thuê Máy Bắn Bóng Tự Động (100k/giờ)",
    "category": "Thiết bị & Dịch vụ cho thuê",
    "brand": "Selkirk",
    "price": 100000,
    "originalPrice": 100000,
    "stock": 4,
    "status": "active",
    "image": "/images/pickleball_net_portable.jpg",
    "gallery": [
      "/images/pickleball_net_portable.jpg"
    ],
    "highlights": [
      "Thuê máy tập bắn bóng tự động lập trình nhiều góc độ theo giờ"
    ],
    "specs": [
      {
        "label": "Chất liệu / Thành phần",
        "value": "Khung hợp kim nhôm di động"
      },
      {
        "label": "Quy cách / Dung tích",
        "value": "Chứa 150 bóng"
      },
      {
        "label": "Trọng lượng",
        "value": "15kg"
      },
      {
        "label": "Xuất xứ / Chứng nhận",
        "value": "Selkirk USA"
      }
    ],
    "description": "Cho thuê máy bắn bóng tự động lập trình nhiều góc độ, xoáy và tốc độ phục vụ luyện tập dink và smash cá nhân.",
    "channel": "all"
  }
];
