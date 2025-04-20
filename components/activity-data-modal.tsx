"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import type { ActivityData } from "../models/workout-model"

interface ActivityDataModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (activityData: ActivityData) => void
  initialData?: ActivityData
}

export function ActivityDataModal({ isOpen, onClose, onSubmit, initialData }: ActivityDataModalProps) {
  const [activityData, setActivityData] = useState<ActivityData>(
    initialData || {
      vo2max: 0,
      heartRate: 0,
      duration: 0,
      calories: 0,
    },
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (activityData.vo2max <= 0) {
      newErrors.vo2max = "VO2 Max must be greater than 0"
    }

    if (activityData.heartRate <= 0) {
      newErrors.heartRate = "Heart Rate must be greater than 0"
    }

    if (activityData.duration <= 0) {
      newErrors.duration = "Duration must be greater than 0"
    }

    if (activityData.calories <= 0) {
      newErrors.calories = "Calories must be greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)
      onSubmit(activityData)
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ActivityData, value: string) => {
    const numValue = Number.parseFloat(value)
    setActivityData({
      ...activityData,
      [field]: isNaN(numValue) ? 0 : numValue,
    })

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] rounded-lg shadow-lg max-w-md w-full p-6 border border-[#333]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#E0E0E0]">Enter Your Activity Data</h2>
          <button onClick={onClose} className="text-[#999] hover:text-[#E0E0E0] transition-colors duration-200">
            <X size={24} />
          </button>
        </div>

        <p className="text-[#BDBDBD] mb-6">Please enter your activity metrics to complete this task.</p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="vo2max" className="block text-sm font-medium text-[#E0E0E0] mb-2">
                VO2 Max (ml/kg/min)
              </label>
              <input
                type="number"
                id="vo2max"
                min="0"
                step="0.1"
                className="w-full px-3 py-2 bg-[#252525] border border-[#444] rounded-md text-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent"
                value={activityData.vo2max || ""}
                onChange={(e) => handleInputChange("vo2max", e.target.value)}
              />
              {errors.vo2max && <p className="mt-1 text-[#FF5252] text-sm">{errors.vo2max}</p>}
            </div>

            <div>
              <label htmlFor="heartRate" className="block text-sm font-medium text-[#E0E0E0] mb-2">
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                id="heartRate"
                min="0"
                step="1"
                className="w-full px-3 py-2 bg-[#252525] border border-[#444] rounded-md text-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent"
                value={activityData.heartRate || ""}
                onChange={(e) => handleInputChange("heartRate", e.target.value)}
              />
              {errors.heartRate && <p className="mt-1 text-[#FF5252] text-sm">{errors.heartRate}</p>}
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-[#E0E0E0] mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                id="duration"
                min="0"
                step="1"
                className="w-full px-3 py-2 bg-[#252525] border border-[#444] rounded-md text-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent"
                value={activityData.duration || ""}
                onChange={(e) => handleInputChange("duration", e.target.value)}
              />
              {errors.duration && <p className="mt-1 text-[#FF5252] text-sm">{errors.duration}</p>}
            </div>

            <div>
              <label htmlFor="calories" className="block text-sm font-medium text-[#E0E0E0] mb-2">
                Calories Burned
              </label>
              <input
                type="number"
                id="calories"
                min="0"
                step="1"
                className="w-full px-3 py-2 bg-[#252525] border border-[#444] rounded-md text-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent"
                value={activityData.calories || ""}
                onChange={(e) => handleInputChange("calories", e.target.value)}
              />
              {errors.calories && <p className="mt-1 text-[#FF5252] text-sm">{errors.calories}</p>}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#333] text-[#E0E0E0] rounded-lg hover:bg-[#444] transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#00FF85] text-[#121212] rounded-lg hover:bg-[#00E676] transition-colors duration-200 font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Complete Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

