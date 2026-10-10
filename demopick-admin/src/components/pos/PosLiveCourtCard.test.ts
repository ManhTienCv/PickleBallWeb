import { describe, it, expect } from 'vitest'
import { calculateLiveCourtDetails } from './PosLiveCourtCard'

describe('calculateLiveCourtDetails', () => {
  it('should return default fallback state when court is available', () => {
    const court = {
      id: 1,
      name: 'Sân 01',
      status: 'available',
      rate: 140000,
    }
    const result = calculateLiveCourtDetails(court)
    expect(result.exactMinutes).toBe(0)
    expect(result.isOvertime).toBe(false)
    expect(result.currentEstimatedPrice).toBe(140000)
  })

  it('should handle standard in_use session with correct elapsed minutes', () => {
    const now = new Date('2026-10-10T10:30:00')
    const court = {
      id: 1,
      name: 'Sân 01',
      status: 'in_use',
      start_time: '10:00:00',
      expected_duration_minutes: 60,
      rate: 140000,
    }
    const result = calculateLiveCourtDetails(court, now)
    expect(result.exactMinutes).toBe(30)
    expect(result.remainingMinutes).toBe(30)
    expect(result.isOvertime).toBe(false)
    expect(result.isNearEnding).toBe(false)
  })

  it('should correctly handle midnight rollover when session started before midnight', () => {
    // Current time is 00:15:00
    const now = new Date('2026-10-10T00:15:00')
    // Session started at 23:45:00 the previous day
    const court = {
      id: 2,
      name: 'Sân 02',
      status: 'in_use',
      start_time: '23:45:00',
      expected_duration_minutes: 60,
      rate: 140000,
    }
    const result = calculateLiveCourtDetails(court, now)
    // 15 mins before midnight + 15 mins after midnight = 30 minutes
    expect(result.exactMinutes).toBe(30)
    expect(result.remainingMinutes).toBe(30)
    expect(result.isOvertime).toBe(false)
  })

  it('should detect overtime correctly when elapsed time exceeds expected duration', () => {
    const now = new Date('2026-10-10T11:15:00')
    const court = {
      id: 3,
      name: 'Sân 03',
      status: 'in_use',
      start_time: '10:00:00',
      expected_duration_minutes: 60,
      rate: 140000,
    }
    const result = calculateLiveCourtDetails(court, now)
    expect(result.exactMinutes).toBe(75)
    expect(result.isOvertime).toBe(true)
    expect(result.overtimeMinutes).toBe(15)
  })
})
