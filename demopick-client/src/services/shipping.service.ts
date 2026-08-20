export type ShippingCarrier = "GHN" | "GHTK" | "Viettel Post" | "GrabExpress";

export interface CarrierInfo {
  id: ShippingCarrier;
  name: string;
  shortName: string;
  tagline: string;
  badgeColor: string;
  estimatedTime: string;
  baseFee: number;
}

export interface TrackingEvent {
  stage: 1 | 2 | 3 | 4 | 5;
  time: string;
  title: string;
  description: string;
  location: string;
}

export interface ShippingOrderInfo {
  trackingNumber: string;
  carrier: ShippingCarrier;
  orderCode: string;
  serviceType: "Tiêu chuẩn" | "Nhanh" | "Hỏa tốc 2H";
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  receiverName: string;
  receiverAddress: string;
  receiverPhone: string;
  itemsSummary: string;
  weightGram: number;
  shippingFee: number;
  codAmount: number;
  paymentMethod: string;
  deliveryNote: string;
  shipperName: string;
  shipperPhone: string;
  shipperPlate: string;
  currentStage: 1 | 2 | 3 | 4 | 5;
  isCompleted: boolean;
  timeline: TrackingEvent[];
  createdAt: string;
}

export const AVAILABLE_CARRIERS: CarrierInfo[] = [
  {
    id: "GHN",
    name: "Giao Hàng Nhanh (GHN Express)",
    shortName: "GHN",
    tagline: "Giao nhanh toàn quốc 1-2 ngày, mạng lưới 100% bưu cục",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
    estimatedTime: "1 - 2 ngày",
    baseFee: 30000,
  },
  {
    id: "GHTK",
    name: "Giao Hàng Tiết Kiệm (GHTK)",
    shortName: "GHTK",
    tagline: "Tối ưu chi phí, chuyên biệt đơn hàng thể thao & TMĐT",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    estimatedTime: "2 - 3 ngày",
    baseFee: 25000,
  },
  {
    id: "Viettel Post",
    name: "Viettel Post Logistics",
    shortName: "Viettel Post",
    tagline: "Bảo đảm an toàn hàng giá trị cao, phủ sóng 63 tỉnh thành",
    badgeColor: "bg-red-50 text-red-700 border-red-200",
    estimatedTime: "2 - 3 ngày",
    baseFee: 28000,
  },
  {
    id: "GrabExpress",
    name: "GrabExpress Hỏa Tốc (2 Giờ)",
    shortName: "GrabExpress",
    tagline: "Giao tức thì trong 2 tiếng nội thành — Kịp giờ ra sân",
    badgeColor: "bg-green-50 text-green-700 border-green-200",
    estimatedTime: "1 - 2 giờ",
    baseFee: 45000,
  },
];

const STORAGE_KEY = "demopick_shipping_registry";

class ShippingService {
  private getRegistry(): Record<string, ShippingOrderInfo> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveRegistry(reg: Record<string, ShippingOrderInfo>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reg));
    window.dispatchEvent(new Event("storage"));
  }

  public calculateShippingFee(
    province: string,
    weightGram: number = 500,
    carrier: ShippingCarrier = "GHN",
    orderTotal: number = 0
  ): { fee: number; isFreeship: boolean; originalFee: number } {
    let originalFee = 30000;
    const isGrab = carrier === "GrabExpress";

    if (isGrab) {
      originalFee = 50000;
    } else {
      const isUrban =
        province.toLowerCase().includes("hà nội") ||
        province.toLowerCase().includes("hồ chí minh") ||
        province.toLowerCase().includes("đà nẵng");

      if (isUrban) {
        originalFee = carrier === "GHTK" ? 22000 : 28000;
      } else {
        originalFee = carrier === "GHTK" ? 32000 : 38000;
      }

      if (weightGram > 1000) {
        originalFee += Math.ceil((weightGram - 1000) / 500) * 5000;
      }
    }

    const isFreeship = !isGrab && orderTotal >= 1000000;
    return {
      fee: isFreeship ? 0 : originalFee,
      isFreeship,
      originalFee,
    };
  }

  public getShippingInfo(key: string): ShippingOrderInfo | null {
    const registry = this.getRegistry();
    if (registry[key]) return registry[key];

    // Fallback simulated tracking if not yet registered
    return {
      trackingNumber: key.startsWith("GHN") || key.startsWith("GHTK") || key.startsWith("SPX") ? key : `GHN-VN-882910`,
      carrier: key.includes("GHTK") ? "GHTK" : key.includes("Grab") ? "GrabExpress" : "GHN",
      orderCode: key,
      serviceType: "Nhanh",
      senderName: "Pickleball Club & Pro Shop",
      senderAddress: "123 Đường Pickleball, Quận 7, TP.HCM",
      senderPhone: "0909 123 456",
      receiverName: "Nguyễn Văn An",
      receiverAddress: "Số 25 Phố Lý Thường Kiệt, Q. Hoàn Kiếm, Hà Nội",
      receiverPhone: "0987654321",
      itemsSummary: "Vợt JOOLA Perseus 3S + Hộp 4 bóng Franklin X-40",
      weightGram: 650,
      shippingFee: 0,
      codAmount: 0,
      paymentMethod: "VietQR",
      deliveryNote: "Cho xem hàng, không thử",
      shipperName: "Nguyễn Văn Tuấn",
      shipperPhone: "0912.345.678",
      shipperPlate: "29B1-889.21",
      currentStage: 4,
      isCompleted: false,
      timeline: [
        {
          stage: 4,
          time: "14:30 - Hôm nay",
          title: "Shipper đang trên đường giao đến bạn",
          description: "Shipper [Nguyễn Văn Tuấn - 0912.345.678] đang giao hàng trong khu vực Hoàn Kiếm.",
          location: "Bưu cục Hoàn Kiếm, Hà Nội",
        },
        {
          stage: 3,
          time: "08:15 - Hôm nay",
          title: "Kiện hàng đến Kho Trung Chuyển Phân Loại Hà Nội",
          description: "Đã quét mã Barcode phân loại thành công. Đang xuất kho giao trạm phát.",
          location: "Kho trung chuyển Tổng Hà Nội",
        },
        {
          stage: 2,
          time: "18:00 - Hôm qua",
          title: "Shipper đã lấy kiện hàng tại Sân",
          description: "Đã nhận kiện hàng từ Cửa hàng Pickleball Club, chuẩn bị vận chuyển liên tỉnh.",
          location: "Kho hàng, Quận 7, TP.HCM",
        },
        {
          stage: 1,
          time: "14:00 - Hôm qua",
          title: "Tạo đơn hàng & Tiếp nhận yêu cầu vận chuyển",
          description: "Hệ thống quản lý đã phát lệnh xuất kho.",
          location: "Hệ thống quản lý đơn hàng",
        },
      ],
      createdAt: "2026-08-09 14:00",
    };
  }
}

export const shippingService = new ShippingService();
