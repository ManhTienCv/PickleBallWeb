import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface CheckoutTimerContextType {
  secondsLeft: number
  formattedTime: string
  isActive: boolean
  isExpired: boolean
  startTimer: () => void
  resetTimer: () => void
  extendTimer: () => void
}

const TOTAL_SECONDS = 20 * 60 // 20 minutes = 1200s
const STORAGE_KEY = 'pickleball_checkout_expires_at'

const getInitialTimerState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const expiresAt = parseInt(stored, 10)
      const now = Date.now()
      if (!isNaN(expiresAt)) {
        const diff = Math.floor((expiresAt - now) / 1000)
        if (diff > 0) {
          return { seconds: diff, active: true, expired: false }
        } else {
          return { seconds: 0, active: false, expired: true }
        }
      }
    }
  } catch {}
  return { seconds: TOTAL_SECONDS, active: false, expired: false }
}

const CheckoutTimerContext = createContext<CheckoutTimerContextType | undefined>(undefined)

export const CheckoutTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initial] = useState(getInitialTimerState)
  const [secondsLeft, setSecondsLeft] = useState<number>(initial.seconds)
  const [isActive, setIsActive] = useState<boolean>(initial.active)
  const [isExpired, setIsExpired] = useState<boolean>(initial.expired)

  // Start timer: If a session already exists and is unexpired, resume it.
  // Otherwise create a new 20-minute expiry timestamp in localStorage.
  const startTimer = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const now = Date.now()
      if (stored) {
        const expiresAt = parseInt(stored, 10)
        if (!isNaN(expiresAt)) {
          const diff = Math.floor((expiresAt - now) / 1000)
          if (diff > 0) {
            setSecondsLeft(diff)
            setIsActive(true)
            setIsExpired(false)
            return
          }
        }
      }

      // Create new 20-minute session
      const newExpiresAt = now + TOTAL_SECONDS * 1000
      localStorage.setItem(STORAGE_KEY, newExpiresAt.toString())
      setSecondsLeft(TOTAL_SECONDS)
      setIsActive(true)
      setIsExpired(false)
    } catch {
      setIsActive(true)
    }
  }, [])

  // Reset timer: clear localStorage timestamp and stop
  const resetTimer = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    setSecondsLeft(TOTAL_SECONDS)
    setIsActive(false)
    setIsExpired(false)
  }, [])

  // Extend timer: give another 20 minutes from right now
  const extendTimer = useCallback(() => {
    try {
      const newExpiresAt = Date.now() + TOTAL_SECONDS * 1000
      localStorage.setItem(STORAGE_KEY, newExpiresAt.toString())
      setSecondsLeft(TOTAL_SECONDS)
      setIsActive(true)
      setIsExpired(false)
    } catch {
      setSecondsLeft(TOTAL_SECONDS)
      setIsActive(true)
      setIsExpired(false)
    }
  }, [])

  // Real-time calculation against absolute timestamp
  useEffect(() => {
    if (!isActive) return

    const tick = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) {
          setIsActive(false)
          return
        }
        const expiresAt = parseInt(stored, 10)
        const now = Date.now()
        const diff = Math.max(0, Math.floor((expiresAt - now) / 1000))
        setSecondsLeft(diff)
        if (diff <= 0) {
          setIsActive(false)
          setIsExpired(true)
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false)
            setIsExpired(true)
            return 0
          }
          return prev - 1
        })
      }
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isActive])

  // Cross-tab synchronization via storage event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        if (!e.newValue) {
          resetTimer()
        } else {
          const expiresAt = parseInt(e.newValue, 10)
          const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
          if (diff > 0) {
            setSecondsLeft(diff)
            setIsActive(true)
            setIsExpired(false)
          } else {
            setSecondsLeft(0)
            setIsActive(false)
            setIsExpired(true)
          }
        }
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [resetTimer])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  return (
    <CheckoutTimerContext.Provider
      value={{
        secondsLeft,
        formattedTime,
        isActive,
        isExpired,
        startTimer,
        resetTimer,
        extendTimer,
      }}
    >
      {children}
    </CheckoutTimerContext.Provider>
  )
}

export const useCheckoutTimer = () => {
  const context = useContext(CheckoutTimerContext)
  if (!context) {
    throw new Error('useCheckoutTimer must be used within a CheckoutTimerProvider')
  }
  return context
}
