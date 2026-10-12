import { toast } from 'sonner'

export interface OrderNotificationPayload {
  orderCode: string
  customerName: string
  shippingAddress: string
  totalAmount: number
}

export interface AdminNoticeItem {
  id: string
  orderCode: string
  title: string
  message: string
  status: string
  type: 'pending' | 'shipping' | 'completed' | 'return' | 'refund' | 'cancelled' | 'booking'
  createdAt: string
  isRead: boolean
  linkUrl: string
}

export const notificationService = {
  /**
   * Add a notification for admin
   */
  addNotification: (item: Omit<AdminNoticeItem, 'id' | 'createdAt' | 'isRead'>) => {
    try {
      const saved = localStorage.getItem('demopick_admin_notifications')
      const notifs: AdminNoticeItem[] = saved ? JSON.parse(saved) : []

      const newNotif: AdminNoticeItem = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        ...item,
        createdAt: 'Vừa xong',
        isRead: false,
      }

      // Prepend
      notifs.unshift(newNotif)
      // Keep at most 50 notifications
      if (notifs.length > 50) notifs.pop()

      localStorage.setItem('demopick_admin_notifications', JSON.stringify(notifs))
      window.dispatchEvent(new CustomEvent('demopick_order_status_changed'))
    } catch (e) {
      console.warn('Error saving admin notification', e)
    }
  },

  /**
   * Triggered by Admin when clicking "Giao Cho Đơn Vị Vận Chuyển"
   */
  sendOrderShippedNotice: (payload: OrderNotificationPayload) => {
    console.log('[Admin Mail Gateway] Order Shipped Notice Sent:', payload)
    toast.success(
      ` [Đã Gửi Email & Thông Báo Handoff #${payload.orderCode}]: Đơn hàng đã chuyển sang trạng thái ĐÃ GIAO ĐƠN VỊ VẬN CHUYỂN. Đã khóa quyền sửa địa chỉ của người dùng.`,
      { duration: 6000 }
    )

    notificationService.addNotification({
      orderCode: payload.orderCode,
      title: 'Đơn hàng chuyển sang Đang giao',
      message: `Đơn hàng #${payload.orderCode} (${payload.customerName}) đã bàn giao cho GHN Express.`,
      status: 'SHIPPED',
      type: 'shipping',
      linkUrl: '/orders?tab=online',
    })
  },
}
