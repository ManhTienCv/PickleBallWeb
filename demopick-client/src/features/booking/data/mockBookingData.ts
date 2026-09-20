import { Court, TimeSlot, Hold } from '../types/booking.types'

export const MOCK_COURTS: Court[] = [
  {
    id: 1,
    name: 'Sân Pickleball A1',
    court_number: 'A1',
    type: 'Trong Nhà • Tiêu Chuẩn Pro',
    hourly_rate: 140000,
    peak_hourly_rate: 180000,
    status: 'active',
    description: 'Mặt thảm Cushion Master 8 lớp đạt chuẩn USAPA, điều hòa mát mẻ 24/7 và hệ thống đèn LED chống lóa chuyên nghiệp.',
    image_url: '/images/pickleball_court.jpg',
  },
  {
    id: 2,
    name: 'Sân Pickleball A2',
    court_number: 'A2',
    type: 'Trong Nhà • Tiêu Chuẩn Pro',
    hourly_rate: 140000,
    peak_hourly_rate: 180000,
    status: 'active',
    description: 'Mặt thảm Cushion Master chuẩn thi đấu quốc tế, tích hợp camera bắt vạch biên và ghi hình highlight tự động.',
    image_url: '/images/pickleball_court_indoor.jpg',
  },
  {
    id: 3,
    name: 'Sân Pickleball B1',
    court_number: 'B1',
    type: 'Ngoài Trời • Mái Vòm Che',
    hourly_rate: 140000,
    peak_hourly_rate: 180000,
    status: 'active',
    description: 'Sân ngoài trời có mái vòm thông minh che nắng mưa, gió tự nhiên thoáng mát, thảm chống trơn trượt tối đa.',
    image_url: '/images/pickleball_court_outdoor.jpg',
  },
  {
    id: 4,
    name: 'Sân Pickleball B2',
    court_number: 'B2',
    type: 'Ngoài Trời • Mái Vòm Che',
    hourly_rate: 140000,
    peak_hourly_rate: 180000,
    status: 'active',
    description: 'Mặt sân thoáng rộng có khu vực khán đài mini, thích hợp tổ chức các buổi giao lưu câu lạc bộ và thi đấu hội nhóm.',
    image_url: '/images/pickleball_court.jpg',
  },
  {
    id: 5,
    name: 'Sân Pickleball C1',
    court_number: 'C1',
    type: 'Tiêu Chuẩn Pro',
    hourly_rate: 180000,
    peak_hourly_rate: 220000,
    status: 'active',
    description: 'Sân trung tâm có ghế sofa da thư giãn riêng biệt, tủ lạnh mini phục vụ nước suối & khăn lạnh miễn phí.',
    image_url: '/images/pickleball_match.jpg',
  },
  {
    id: 6,
    name: 'Sân Pickleball C2',
    court_number: 'C2',
    type: 'Tiêu Chuẩn Pro',
    hourly_rate: 180000,
    peak_hourly_rate: 220000,
    status: 'active',
    description: 'Sân thi đấu trang bị hệ thống màn hình hiển thị tỉ số kỹ thuật số, hỗ trợ livestream độ phân giải 4K sắc nét.',
    image_url: '/images/pickleball_court_indoor.jpg',
  },
  {
    id: 7,
    name: 'Sân Pickleball D1',
    court_number: 'D1',
    type: 'Tiêu Chuẩn Pro',
    hourly_rate: 140000,
    peak_hourly_rate: 180000,
    status: 'active',
    description: 'Sân tiêu chuẩn thi đấu trang bị mặt sân chống lóa và hệ thống đèn chiếu sáng công nghệ cao.',
    image_url: '/images/pickleball_court_outdoor.jpg',
  },
  {
    id: 8,
    name: 'Sân Pickleball D2',
    court_number: 'D2',
    type: 'Tiêu Chuẩn Pro',
    hourly_rate: 140000,
    peak_hourly_rate: 180000,
    status: 'active',
    description: 'Sân mặt thảm êm ái, độ đàn hồi chuẩn thi đấu giúp bảo vệ tốt cổ chân và đầu gối vận động viên.',
    image_url: '/images/pickleball_court.jpg',
  },
]

export const TIME_SLOTS_RANGE = [
  '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00',
]

/**
 * Tạo danh sách TimeSlot mô phỏng sinh động cho ngày bất kỳ
 */
export function generateMockSlots(dateStr: string): TimeSlot[] {
  const slots: TimeSlot[] = []

  // Check real bookings in demopick_orders_admin
  const bookedKeys = new Set<string>()
  try {
    const raw = localStorage.getItem('demopick_orders_admin')
    if (raw) {
      const orders = JSON.parse(raw)
      orders.forEach((o: any) => {
        if (o.status !== 'cancelled' && Array.isArray(o.items)) {
          o.items.forEach((it: any) => {
            if (it.item_type === 'booking' && it.slot_ids) {
              it.slot_ids.forEach((sid: number) => bookedKeys.add(String(sid)))
            }
          })
        }
      })
    }
  } catch {}

  MOCK_COURTS.forEach((court) => {
    TIME_SLOTS_RANGE.forEach((startTimeStr) => {
      const hour = parseInt(startTimeStr.split(':')[0], 10)
      const nextHour = hour + 1
      const endTimeStr = `${String(nextHour).padStart(2, '0')}:00`
      const isPeak = hour >= 17
      const price = isPeak ? court.peak_hourly_rate : court.hourly_rate

      const slotId = court.id * 1000 + hour
      const status: TimeSlot['status'] = bookedKeys.has(String(slotId)) ? 'booked' : 'available'

      slots.push({
        id: slotId,
        court_id: court.id,
        date: dateStr,
        start_time: `${startTimeStr}:00`,
        end_time: `${endTimeStr}:00`,
        price,
        status,
        is_peak: isPeak,
      })
    })
  })

  return slots
}

/**
 * Giả lập tạm giữ sân thành công khi chưa kết nối backend
 */
export function mockCreateHold(slotIds: number[], slots: TimeSlot[]): Hold {
  const selectedSlots = slots.filter((s) => slotIds.includes(s.id))
  const totalPrice = selectedSlots.reduce((sum, s) => sum + s.price, 0)

  return {
    id: Math.floor(Math.random() * 90000) + 10000,
    slot_ids: slotIds,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    seconds_remaining: 600,
    total_price: totalPrice,
  }
}
