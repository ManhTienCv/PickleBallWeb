import { toast } from 'sonner'

export interface OrderNotificationPayload {
  orderCode: string
  customerEmail?: string
  customerName: string
  customerPhone?: string
  shippingAddress: string
  totalAmount: number
}

export const notificationService = {
  /**
   * Triggered when an online order is placed and placed in PENDING (Chờ duyệt) status.
   */
  sendOrderPlacedNotice: (payload: OrderNotificationPayload) => {
    console.log('[SSMS/Mail Gateway] Sending Order Placed Notice:', payload)
    toast.info(
      `📧 [Thông báo Đơn hàng #${payload.orderCode}]: Vui lòng kiểm tra lại thông tin đơn hàng trước khi đơn hàng được chấp nhận & giao cho đơn vị vận chuyển.`,
      { duration: 6000 }
    )
  },

  /**
   * Triggered when Admin approves & hands over order to shipping carrier.
   */
  sendOrderShippedNotice: (payload: OrderNotificationPayload) => {
    console.log('[SSMS/Mail Gateway] Sending Order Shipped Notice:', payload)
    toast.success(
      `🚚 [Thông báo Vận chuyển #${payload.orderCode}]: Đơn hàng đã được bàn giao cho đơn vị vận chuyển & đang trên đường giao đến ${payload.shippingAddress}`,
      { duration: 7000 }
    )
  },

  /**
   * Triggered when customer updates their delivery details before shipping.
   */
  sendAddressUpdatedNotice: (payload: OrderNotificationPayload) => {
    console.log('[SSMS/Mail Gateway] Sending Address Update Notice:', payload)
    toast.success(
      `✏️ [Đã cập nhật đơn hàng #${payload.orderCode}]: Địa chỉ nhận hàng mới là "${payload.shippingAddress}".`,
      { duration: 5000 }
    )
  },
}
