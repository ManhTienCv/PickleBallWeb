import api, { ApiResponse } from '@/lib/api'
import { Court, TimeSlot, Hold } from '../types/booking.types'
import { MOCK_COURTS, generateMockSlots, mockCreateHold } from '../data/mockBookingData'

export const bookingService = {
  async getCourts(): Promise<Court[]> {
    try {
      const res = await api.get<ApiResponse<Court[]>>('/courts', { timeout: 15000 })
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data
      }
    } catch (err) {
      console.warn('API /courts error, using fallback:', err)
    }
    return MOCK_COURTS
  },

  async getSlots(date: string, courtId?: number): Promise<TimeSlot[]> {
    try {
      const res = await api.get<ApiResponse<TimeSlot[]>>('/slots', {
        params: { date, ...(courtId ? { court_id: courtId } : {}) },
        timeout: 15000,
      })
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data
      }
    } catch (err) {
      console.warn('API /slots error, using fallback:', err)
    }
    const mockSlots = generateMockSlots(date)
    return courtId ? mockSlots.filter((s) => s.court_id === courtId) : mockSlots
  },

  async createHold(slotIds: number[], currentSlots: TimeSlot[] = []): Promise<Hold> {
    try {
      const res = await api.post<ApiResponse<Hold>>('/booking/hold', { slot_ids: slotIds })
      if (res.data?.data) {
        return res.data.data
      }
      throw new Error(res.data?.message || 'Không thể giữ chỗ khung giờ này.')
    } catch (err: any) {
      // Nếu slot là ID mock (backend báo 404) hoặc mất kết nối mạng -> fallback chế độ demo
      if (err.response?.status === 404 || !err.response) {
        console.warn('Backend slot not found or server unavailable, using local mock hold for demo:', err)
        const slots = currentSlots.length > 0 ? currentSlots : generateMockSlots(new Date().toISOString().split('T')[0])
        return mockCreateHold(slotIds, slots)
      }
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message)
      }
      if (err.response?.data?.error?.message) {
        throw new Error(err.response.data.error.message)
      }
      throw new Error(err.message || 'Không thể tạo giữ chỗ khung giờ này.')
    }
  },

  async releaseHold(holdId: number): Promise<void> {
    try {
      await api.delete(`/booking/hold/${holdId}`)
    } catch (err) {
      console.warn('API delete hold error:', err)
    }
  },
}

export default bookingService
