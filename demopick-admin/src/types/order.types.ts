import { ShippingCarrier } from "@/services/shipping.service";

export type OrderStatus =
  | "PENDING"
  | "CHỜ_THANH_TOÁN"
  | "PAID"
  | "ĐÃ_THANH_TOÁN"
  | "CONFIRMED"
  | "READY_TO_PICK"
  | "PICKING"
  | "SHIPPED"
  | "SHIPPING"
  | "COMPLETED"
  | "RETURNED"
  | "REFUND_PENDING"
  | "CHỜ_HOÀN_TIỀN"
  | "REFUNDED"
  | "ĐÃ_HOÀN_TIỀN"
  | "CANCELLED";

export type PaymentMethod = "Tiền mặt" | "VietQR" | "MoMo" | "COD" | "Cổng Online";

export type PaymentStatus = "PAID" | "PENDING" | "REFUNDED";

export type OrderType = "POS Quầy" | "Đặt Sân Online" | "Đặt Sân & Thiết Bị" | "Online" | "online";

export type PosCategory = "court_service" | "retail";

export interface OrderItem {
  id: number;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  code: string;
  customerName: string;
  customerPhone?: string;
  staffName: string;
  type: OrderType;
  posCategory?: PosCategory;
  courtInfo?: {
    courtName: string;
    duration: string;
    timeRange: string;
  };
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  dateStr: string;
  items: OrderItem[];
  editNote?: string;
  shippingAddress?: string;
  shippingCarrier?: ShippingCarrier;
  trackingNumber?: string;
  shippingFee?: number;
  codAmount?: number;
  deliveryNote?: string;
  ghn_district_id?: number;
  ghn_ward_code?: string;
  refundReason?: string;
  refundAmount?: number;
  refundTransId?: string;
  refundNote?: string;
  refundedAt?: string;
}

export interface BackendOrderItem {
  id?: number;
  item_name?: string;
  name?: string;
  quantity?: number;
  qty?: number;
  price?: number;
}

export interface BackendOrder {
  order_code?: string;
  code?: string;
  payment_status?: string;
  status?: string;
  payment_method?: string;
  total_amount?: number;
  customer_name?: string;
  customer_phone?: string;
  shipping_address?: string;
  shipping_fee?: number;
  created_at?: string;
  items?: BackendOrderItem[];
}

export interface CatalogProduct {
  id: number;
  name: string;
  price: number;
  category: string;
}

export interface OnlineStatusTab {
  id: string;
  label: string;
}
