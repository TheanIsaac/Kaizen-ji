"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface UserIDModalProps {
  isOpen: boolean
  onSubmit: (userId: string) => void
  onClose?: () => void
  initialValue?: string
}

export function UserIDModal({ isOpen, onSubmit, onClose, initialValue = "" }: UserIDModalProps) {
  const [userId, setUserId] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)

  // Update userId when initialValue changes
  useEffect(() => {
    if (initialValue) {
      setUserId(initialValue)
    }
  }, [initialValue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId.trim()) {
      setError("Please enter a user ID")
      return
    }

    onSubmit(userId.trim())
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] rounded-lg shadow-lg max-w-md w-full p-6 border border-[#333]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#E0E0E0]">User Login</h2>
          {onClose && (
            <button onClick={handleClose} className="text-[#999] hover:text-[#E0E0E0] transition-colors duration-200">
              <X size={24} />
            </button>
          )}
        </div>
        <p className="text-[#BDBDBD] mb-6">Enter your user ID to access your personalized fitness dashboard.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="userId" className="block text-sm font-medium text-[#E0E0E0] mb-2">
              User ID
            </label>
            <input
              type="text"
              id="userId"
              className="w-full px-3 py-2 bg-[#252525] border border-[#444] rounded-md text-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value)
                setError(null)
              }}
              placeholder="Enter your user ID"
              autoFocus
            />
            {error && <p className="mt-2 text-[#FF5252] text-sm">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3">
            {onClose && (
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-[#333] text-[#E0E0E0] rounded-lg hover:bg-[#444] transition-colors duration-200"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-[#00FF85] text-[#121212] rounded-lg hover:bg-[#00E676] transition-colors duration-200 font-medium"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

