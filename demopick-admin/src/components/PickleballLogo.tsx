import React from 'react'

interface PickleballLogoProps {
  className?: string
  size?: number
}

export default function PickleballLogo({ className = '', size = 32 }: PickleballLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* White Paddle Gradient */}
        <linearGradient id="whitePaddleGradAdmin" x1="18" y1="6" x2="63" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>

        {/* Yellow Pickleball Gradient */}
        <linearGradient id="yellowBallGradAdmin" x1="54" y1="40" x2="84" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>

        {/* Handle Gradient */}
        <linearGradient id="handleGradAdmin" x1="34" y1="54" x2="47" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Drop Shadow Filter */}
        <filter id="softShadowAdmin" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.25"/>
        </filter>
      </defs>

      <g filter="url(#softShadowAdmin)">
        {/* TILTED PADDLE GROUP (Tilted -22deg, enlarged racket) */}
        <g transform="rotate(-22 41 50)">
          {/* Handle */}
          <path 
            d="M 34.5 54 L 34.5 88 C 34.5 92 37.5 94.5 41 94.5 C 44.5 94.5 47.5 92 47.5 88 L 47.5 54 Z" 
            fill="url(#handleGradAdmin)" 
            stroke="#1E293B" 
            strokeWidth="1.5" 
          />
          {/* Handle Grip Wraps */}
          <line x1="34.5" y1="64" x2="47.5" y2="67" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="34.5" y1="73" x2="47.5" y2="76" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="34.5" y1="82" x2="47.5" y2="85" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />

          {/* Paddle Neck Collar */}
          <rect x="33" y="52" width="16" height="4.5" rx="1.5" fill="#475569" stroke="#334155" strokeWidth="1" />

          {/* Paddle Head (White - Enlarged) */}
          <rect 
            x="18" 
            y="5" 
            width="46" 
            height="50" 
            rx="15" 
            fill="url(#whitePaddleGradAdmin)" 
            stroke="#CBD5E1" 
            strokeWidth="2.2" 
          />

          {/* Right half subtle shading for 3D depth */}
          <path 
            d="M 41 5 L 49 5 C 57.5 5 64 11.5 64 20 L 64 40 C 64 48.5 57.5 55 49 55 L 41 55 Z" 
            fill="#CBD5E1" 
            opacity="0.3" 
          />

          {/* Inner Dashed Stitching Border */}
          <rect 
            x="22" 
            y="9" 
            width="38" 
            height="42" 
            rx="11" 
            fill="none" 
            stroke="#94A3B8" 
            strokeWidth="1.5" 
            strokeDasharray="3.5 2.5" 
            strokeLinecap="round" 
          />
        </g>

        {/* THE PICKLEBALL (Located at bottom-right edge of paddle) */}
        <g>
          {/* Ball Body */}
          <circle cx="69" cy="55" r="16.5" fill="url(#yellowBallGradAdmin)" stroke="#B45309" strokeWidth="1.2" />
          
          {/* Ball Light Highlight */}
          <path d="M 58 44 C 62 41 67 40 73 41" stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />

          {/* Ball Holes */}
          <circle cx="69" cy="55" r="3.2" fill="#78350F" />
          <circle cx="69" cy="55.3" r="2.3" fill="#451A03" />

          <circle cx="69" cy="44" r="2.3" fill="#78350F" />
          <circle cx="69" cy="66" r="2.3" fill="#78350F" />

          <circle cx="58" cy="51" r="2.3" fill="#78350F" />
          <circle cx="80" cy="51" r="2.3" fill="#78350F" />

          <circle cx="61.5" cy="46.5" r="2.1" fill="#78350F" />
          <circle cx="76.5" cy="46.5" r="2.1" fill="#78350F" />

          <circle cx="61" cy="61" r="2.3" fill="#78350F" />
          <circle cx="77" cy="61" r="2.3" fill="#78350F" />
        </g>
      </g>
    </svg>
  )
}
