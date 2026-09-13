import React from 'react'

interface LogoProps {
  size?: number
  className?: string
  showText?: boolean
  tagline?: string
}

export function LegalSenseLogo({ size = 32, className = '', showText = false, tagline = 'AI Contract Intelligence' }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo.svg"
        alt="LegalSense Logo"
        width={size}
        height={size}
        className="rounded-full object-contain transition-transform hover:scale-105 shrink-0"
        style={{ width: size, height: size }}
      />
      {showText && (
        <div className="min-w-0">
          <div className="font-extrabold tracking-tight text-slate-900 leading-none" style={{ fontSize: Math.max(13, size * 0.45) }}>
            LegalSense
          </div>
          {tagline && (
            <div className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate tracking-wide">
              {tagline}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
