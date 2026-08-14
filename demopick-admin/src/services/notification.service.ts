import { toast } from 'sonner'

export interface OrderNotificationPayload {
  orderCode: string
  customerName: string
  shippingAddress: string
  totalAmount: number
}

export const notificationService = {
  /**
   * Triggered by Admin when clicking "Giao Cho Đơn Vị Vận Chuyển"
   */
  sendOrderShippedNotice: (payload: OrderNotificationPayload) => {
    console.log('[Admin Mail Gateway] Order Shipped Notice Sent:', payload)
    toast.success(
      ` [Đã Gửi Email & Thông Báo Handoff #${payload.orderCode}]: Đơn hàng đã chuyển sang trạng thái ĐÃ GIAO ĐƠN VỊ VẬN CHUYỂN. Đã khóa quyền sửa địa chỉ của người dùng.`,
      { duration: 6000 }
    )
  },
}
