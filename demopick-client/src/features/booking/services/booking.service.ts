import api, { ApiResponse } from '@/lib/api'
import { Court, TimeSlot, Hold } from '../types/booking.types'
import { MOCK_COURTS, generateMockSlots, mockCreateHold } from '../data/mockBookingData'

export const bookingService = {
  async getCourts(): Promise<Court[]> {
    // Trả về dữ liệu 6 sân hoàn chỉnh ngay lập tức (0ms), không bị nghẽn mạng
    return MOCK_COURTS
  },

  async getSlots(date: string, courtId?: number): Promise<TimeSlot[]> {
    // Trả về lịch 18 khung giờ mỗi ngày cho 6 sân tức thì (0ms)
    const mockSlots = generateMockSlots(date)
    return courtId ? mockSlots.filter((s) => s.court_id === courtId) : mockSlots
  },

  async createHold(slotIds: number[], currentSlots: TimeSlot[] = []): Promise<Hold> {
    const slots = currentSlots.length > 0 ? currentSlots : generateMockSlots(new Date().toISOString().split('T')[0])
    return mockCreateHold(slotIds, slots)
  },

  async releaseHold(_holdId: number): Promise<void> {
    // Giải phóng giữ chỗ tức thì
  },
}

export default bookingService

