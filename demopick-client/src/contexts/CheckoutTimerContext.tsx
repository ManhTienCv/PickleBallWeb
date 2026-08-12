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

const CheckoutTimerContext = createContext<CheckoutTimerContextType | undefined>(undefined)

export const CheckoutTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL_SECONDS)
  const [isActive, setIsActive] = useState<boolean>(false)
  const [isExpired, setIsExpired] = useState<boolean>(false)

  // Start timer if not already active
  const startTimer = useCallback(() => {
    if (!isActive) {
      setIsActive(true)
      setIsExpired(false)
    }
  }, [isActive])

  // Reset timer to full 20 minutes & stop
  const resetTimer = useCallback(() => {
    setSecondsLeft(TOTAL_SECONDS)
    setIsActive(false)
    setIsExpired(false)
  }, [])

  // Optional extend timer back to 20m
  const extendTimer = useCallback(() => {
    setSecondsLeft(TOTAL_SECONDS)
    setIsExpired(false)
    setIsActive(true)
  }, [])

  useEffect(() => {
    let interval: any = null
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1)
      }, 1000)
    } else if (isActive && secondsLeft === 0) {
      setIsActive(false)
      setIsExpired(true)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, secondsLeft])

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
