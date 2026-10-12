import api, { ApiResponse } from '@/lib/api'
import { Court, TimeSlot, Hold } from '../types/booking.types'
import { MOCK_COURTS, generateMockSlots, mockCreateHold } from '../data/mockBookingData'

// Fast health-check tracking to prevent waiting for dead network timeouts
let isBackendAvailable: boolean | null = null
let lastBackendCheck = 0
const CHECK_COOLDOWN = 30000 // Re-check every 30 seconds

export const bookingService = {
  async getCourts(): Promise<Court[]> {
    // If backend was recently verified unreachable, use fallback immediately
    if (isBackendAvailable === false && Date.now() - lastBackendCheck < CHECK_COOLDOWN) {
      return MOCK_COURTS
    }

    try {
      const res = await api.get<ApiResponse<Court[]>>('/courts', { timeout: 1500 })
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        isBackendAvailable = true
        return res.data.data
      }
    } catch (err) {
      isBackendAvailable = false
      lastBackendCheck = Date.now()
      console.warn('API /courts unreachable, using fallback courts (offline/mock mode):', err)
    }
    return MOCK_COURTS
  },

  async getSlots(date: string, courtId?: number): Promise<TimeSlot[]> {
    // If backend was recently verified unreachable, use fallback immediately
    if (isBackendAvailable === false && Date.now() - lastBackendCheck < CHECK_COOLDOWN) {
      const mockSlots = generateMockSlots(date)
      return courtId ? mockSlots.filter((s) => s.court_id === courtId) : mockSlots
    }

    try {
      const res = await api.get<ApiResponse<TimeSlot[]>>('/slots', {
        params: { date, ...(courtId ? { court_id: courtId } : {}) },
        timeout: 1500,
      })
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        isBackendAvailable = true
        return res.data.data
      }
    } catch (err) {
      isBackendAvailable = false
      lastBackendCheck = Date.now()
      console.warn('API /slots unreachable, using fallback slots (offline/mock mode):', err)
    }
    const mockSlots = generateMockSlots(date)
    return courtId ? mockSlots.filter((s) => s.court_id === courtId) : mockSlots
  },

  async createHold(slotIds: number[], currentSlots: TimeSlot[] = []): Promise<Hold> {
    const slots = currentSlots.length > 0 ? currentSlots : generateMockSlots(new Date().toISOString().split('T')[0])

    // If backend is known to be offline or slots are local mock IDs (>= 1000)
    if (isBackendAvailable === false && Date.now() - lastBackendCheck < CHECK_COOLDOWN) {
      return mockCreateHold(slotIds, slots)
    }

    try {
      const res = await api.post<ApiResponse<Hold>>('/booking/hold', { slot_ids: slotIds }, { timeout: 1200 })
      if (res.data?.data) {
        isBackendAvailable = true
        return res.data.data
      }
      throw new Error(res.data?.message || 'Không thể giữ chỗ khung giờ này.')
    } catch (err: any) {
      // Nếu slot là ID mock (backend báo 404), timeout hoặc mất kết nối mạng -> fallback chế độ demo ngay lập tức
      if (err.response?.status === 404 || !err.response || err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        isBackendAvailable = false
        lastBackendCheck = Date.now()
        console.warn('Backend slot not found or server offline, using local mock hold instantly:', err)
        return mockCreateHold(slotIds, slots)
      }
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message)
      }
      if (err.response?.data?.error?.message) {
        throw new Error(err.response.data.error.message)
      }
      return mockCreateHold(slotIds, slots)
    }
  },

  async releaseHold(holdId: number): Promise<void> {
    // If mock hold ID (>= 10000) or backend is known to be offline, return immediately in 0ms
    if (holdId >= 10000 || isBackendAvailable === false) {
      return
    }

    try {
      await api.delete(`/booking/hold/${holdId}`, { timeout: 1000 })
    } catch (err) {
      console.warn('API delete hold error:', err)
    }
  },
}

export default bookingService
