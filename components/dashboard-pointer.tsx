"use client"

import { useState, useEffect } from "react"
import { Hand, ArrowLeft } from "lucide-react"
import { loadFromLocalStorage, saveToLocalStorage } from "@/lib/localStorage-utils"

interface DashboardPointerProps {
  onClick?: () => void
}

export function DashboardPointer({ onClick }: DashboardPointerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {

    if (true) {
      // Show the pointer after a short delay
      const timer = setTimeout(() => {
        setVisible(true)
      }, 500)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [])

  const handleClick = () => {
    setVisible(false)
    saveToLocalStorage("dashboardPointerDismissed", true)
    if (onClick) onClick()
  }

  if (!visible) return null

  return (
    <div
      className="fixed top-16 left-[25%] flex items-center bg-[#121212]/80 text-[#00FF85] p-3 rounded-lg shadow-lg animate-pulse-horizontal cursor-pointer z-50"
      onClick={handleClick}
    >
    <ArrowLeft className="w-5 h-5 ml-2 animate-bounce-left" />
      
      <div>
        <p className="text-sm font-medium">Click on Dashboard</p>
        <p className="text-xs text-[#BDBDBD]">View your fitness data</p>
      </div>
      <Hand className="w-6 h-6 mr-2 animate-wave" />
    </div>
  )
}

