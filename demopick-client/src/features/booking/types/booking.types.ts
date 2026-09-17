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
  status: 'available' | 'held' | 'booked' | 'locked' | 'in_use'
  is_peak: boolean
  is_cut_off?: boolean
}

export interface Hold {
  id: number
  slot_ids: number[]
  expires_at: string
  seconds_remaining: number
  total_price: number
}

export interface BookingGridProps {
  courts: Court[]
  slots: TimeSlot[]
  selectedSlotIds: number[]
  onToggleSlot: (slotId: number) => void
  selectedDate?: Date
}

export interface HoldTimerToastProps {
  hold: Hold | null
  onExpired: () => void
}
