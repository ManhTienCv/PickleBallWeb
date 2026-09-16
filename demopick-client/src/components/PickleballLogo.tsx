import React from 'react'

interface PickleballLogoProps {
  className?: string
  size?: number
}

export default function PickleballLogo({ className = '', size = 32 }: PickleballLogoProps) {
  return (
    <img
      src="/pickleball-logo.svg"
      alt="Pickleball Logo"
      width={size}
      height={size}
      className={`select-none pointer-events-none object-contain inline-block ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    />
  )
}
