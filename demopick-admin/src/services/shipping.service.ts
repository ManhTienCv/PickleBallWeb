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

  public generateTrackingNumber(carrier: ShippingCarrier): string {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    switch (carrier) {
      case "GHN":
        return `GHN-VN-${randomNum}`;
      case "GHTK":
        return `GHTK-HN-${randomNum}`;
      case "Viettel Post":
        return `VTP-${randomNum}`;
      case "GrabExpress":
        return `GRAB-EXP-${randomNum}`;
      default:
        return `VNPOST-${randomNum}`;
    }
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

  public createShippingOrder(params: {
    orderCode: string;
    carrier: ShippingCarrier;
    receiverName: string;
    receiverAddress: string;
    receiverPhone: string;
    itemsSummary: string;
    weightGram?: number;
    shippingFee?: number;
    codAmount?: number;
    paymentMethod?: string;
    deliveryNote?: string;
  }): ShippingOrderInfo {
    const trackingNumber = this.generateTrackingNumber(params.carrier);
    const now = new Date();
    const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toLocaleDateString("vi-VN");

    const shippers = [
      { name: "Nguyễn Văn Tuấn", phone: "0912.345.678", plate: "29B1-889.21" },
      { name: "Trần Đình Trọng", phone: "0988.765.432", plate: "59T2-663.89" },
      { name: "Phạm Hoàng Nam", phone: "0909.112.233", plate: "43C1-992.10" },
    ];
    const assignedShipper = shippers[Math.floor(Math.random() * shippers.length)];

    const initialTimeline: TrackingEvent[] = [
      {
        stage: 1,
        time: `${timeStr} - ${dateStr}`,
        title: "Tạo đơn hàng & Tiếp nhận yêu cầu vận chuyển",
        description: `Hệ thống quản lý đã phát lệnh xuất kho. Hãng ${params.carrier} đã tiếp nhận mã vận đơn ${trackingNumber}.`,
        location: "Kho hàng Pickleball Club, Quận 7, TP.HCM",
      },
    ];

    const shippingInfo: ShippingOrderInfo = {
      trackingNumber,
      carrier: params.carrier,
      orderCode: params.orderCode,
      serviceType: params.carrier === "GrabExpress" ? "Hỏa tốc 2H" : "Nhanh",
      senderName: "Pickleball Club & Pro Shop",
      senderAddress: "123 Đường Pickleball, Tân Phong, Quận 7, TP.HCM",
      senderPhone: "0909 123 456",
      receiverName: params.receiverName,
      receiverAddress: params.receiverAddress,
      receiverPhone: params.receiverPhone,
      itemsSummary: params.itemsSummary,
      weightGram: params.weightGram || 500,
      shippingFee: params.shippingFee || 0,
      codAmount: params.codAmount || 0,
      paymentMethod: params.paymentMethod || "VietQR",
      deliveryNote: params.deliveryNote || "Cho xem hàng, không thử",
      shipperName: assignedShipper.name,
      shipperPhone: assignedShipper.phone,
      shipperPlate: assignedShipper.plate,
      currentStage: 1,
      isCompleted: false,
      timeline: initialTimeline,
      createdAt: `${dateStr} ${timeStr}`,
    };

    const registry = this.getRegistry();
    registry[trackingNumber] = shippingInfo;
    registry[params.orderCode] = shippingInfo;
    this.saveRegistry(registry);

    return shippingInfo;
  }

  public getShippingInfo(key: string): ShippingOrderInfo | null {
    const registry = this.getRegistry();
    return registry[key] || null;
  }

  public advanceTrackingStage(key: string): ShippingOrderInfo | null {
    const registry = this.getRegistry();
    const info = registry[key];
    if (!info) return null;

    if (info.currentStage >= 5) {
      info.isCompleted = true;
      return info;
    }

    const nextStage = (info.currentStage + 1) as 1 | 2 | 3 | 4 | 5;
    info.currentStage = nextStage;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toLocaleDateString("vi-VN");

    let newEvent: TrackingEvent;
    switch (nextStage) {
      case 2:
        newEvent = {
          stage: 2,
          time: `${timeStr} - ${dateStr}`,
          title: "Shipper đã lấy kiện hàng tại Sân",
          description: `Tài xế [${info.shipperName} - ${info.shipperPhone}] đã đến quầy lấy kiện hàng và bắt đầu chuyển về kho bưu cục.`,
          location: "Bưu cục xuất hàng: TP.HCM Hub 01",
        };
        break;
      case 3:
        newEvent = {
          stage: 3,
          time: `${timeStr} - ${dateStr}`,
          title: "Kiện hàng đến Kho Trung Chuyển Phân Loại",
          description: `Đã quét mã Barcode phân loại tự động. Kiện hàng đang trên xe tải chuyên dụng luân chuyển đến bưu cục phát gần bạn nhất.`,
          location: "Kho trung chuyển Tổng Miền Nam ➔ Kho phát Quận đích",
        };
        break;
      case 4:
        newEvent = {
          stage: 4,
          time: `${timeStr} - ${dateStr}`,
          title: "Shipper đang trên đường giao đến bạn",
          description: `Shipper [${info.shipperName} - SĐT: ${info.shipperPhone} - Xe: ${info.shipperPlate}] đang đi giao hàng. Quý khách vui lòng để ý điện thoại.`,
          location: "Khu vực giao: " + info.receiverAddress.split(",")[0],
        };
        break;
      case 5:
        info.isCompleted = true;
        newEvent = {
          stage: 5,
          time: `${timeStr} - ${dateStr}`,
          title: "Giao hàng thành công",
          description: `Kiện hàng đã được giao thành công đến tay [${info.receiverName}]. ${
            info.codAmount > 0
              ? `Đã thu tiền COD: ${new Intl.NumberFormat("vi-VN").format(info.codAmount)}đ.`
              : "Đơn hàng đã thanh toán trước đầy đủ."
          } Cảm ơn quý khách!`,
          location: info.receiverAddress,
        };
        break;
    }

    info.timeline = [newEvent, ...info.timeline];
    registry[info.trackingNumber] = info;
    registry[info.orderCode] = info;
    this.saveRegistry(registry);

    return info;
  }

  public setTrackingStage(key: string, targetStage: 1 | 2 | 3 | 4 | 5): ShippingOrderInfo | null {
    const registry = this.getRegistry();
    const info = registry[key];
    if (!info) return null;

    while (info.currentStage < targetStage) {
      this.advanceTrackingStage(key);
    }
    return this.getShippingInfo(key);
  }
}

export const shippingService = new ShippingService();
