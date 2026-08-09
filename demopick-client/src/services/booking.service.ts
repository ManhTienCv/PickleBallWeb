import api, { ApiResponse } from '@/lib/api'

export interface Court {
  id: number
  name: string
  court_number: string
  type: string
  hourly_rate: number
  peak_hourly_rate: number
  status: string
  description?: string
  image_url?: string
}

export interface TimeSlot {
  id: number
  court_id: number
  date: string
  start_time: string
  end_time: string
  price: number
  status: 'available' | 'held' | 'booked' | 'locked'
  is_peak: boolean
}

export interface Hold {
  id: number
  slot_ids: number[]
  expires_at: string
  seconds_remaining: number
  total_price: number
}

export const bookingService = {
  async getCourts(): Promise<Court[]> {
    const response = await api.get<ApiResponse<Court[]>>('/courts')
    return response.data.data
  },

  async getSlots(date: string, courtId?: number): Promise<TimeSlot[]> {
    const response = await api.get<ApiResponse<TimeSlot[]>>('/slots', {
      params: { date, court_id: courtId },
    })
    return response.data.data
  },

  async createHold(slotIds: number[]): Promise<Hold> {
    const response = await api.post<ApiResponse<Hold>>('/booking/hold', {
      slot_ids: slotIds,
    })
    return response.data.data
  },

  async releaseHold(holdId: number): Promise<void> {
    await api.delete(`/booking/hold/${holdId}`)
  },
}
