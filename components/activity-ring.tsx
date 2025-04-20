"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface ActivityRingProps {
  value: number
  maxValue: number
  color: string
  label: string
  metric: string
  animate?: boolean
}

export const ActivityRing: React.FC<ActivityRingProps> = ({
  value = 0,
  maxValue = 100,
  color,
  label,
  metric,
  animate = false,
}) => {
  // Ensure value and maxValue are valid numbers
  const safeValue = isNaN(value) ? 0 : value
  const safeMaxValue = isNaN(maxValue) || maxValue <= 0 ? 100 : maxValue

  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (animate || displayValue !== safeValue) {
      setIsAnimating(true)

      // Animate the value change
      const start = displayValue
      const end = safeValue
      const duration = 200
      const startTime = Date.now()

      const animateValue = () => {
        const currentTime = Date.now()
        const elapsed = currentTime - startTime

        if (elapsed < duration) {
          const progress = elapsed / duration
          const currentValue = Math.floor(start + (end - start) * progress)
          setDisplayValue(currentValue)
          requestAnimationFrame(animateValue)
        } else {
          setDisplayValue(end)
          setIsAnimating(false)
        }
      }

      requestAnimationFrame(animateValue)
    }
  }, [safeValue, animate, displayValue])

  // Calculate percentage safely
  const percentage = Math.min((displayValue / safeMaxValue) * 100, 100)
  const strokeWidth = 8
  const radius = 40
  const circumference = 2 * Math.PI * radius

  // Calculate strokeDashoffset safely
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Background circle */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#333" strokeWidth={strokeWidth} />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${strokeDashoffset}`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-xl font-bold text-[#E0E0E0] ${isAnimating ? "animate-value-change" : ""}`}>
            {displayValue}
          </span>
          <span className="text-xs text-[#BDBDBD]">{metric}</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-[#E0E0E0]">{label}</span>
    </div>
  )
}

