"use client"

import type React from "react"

import { useState } from "react"

interface UserIDModalProps {
  isOpen: boolean
  onSubmit: (userId: string) => void
}

export function UserIDModalLight({ isOpen, onSubmit }: UserIDModalProps) {
  const [userId, setUserId] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId.trim()) {
      setError("Please enter a user ID")
      return
    }

    onSubmit(userId.trim())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Welcome to WHOOP</h2>
        <p className="text-gray-600 mb-6">Please enter your user ID to access your personalized fitness dashboard.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              id="userId"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value)
                setError(null)
              }}
              placeholder="Enter your user ID"
              autoFocus
            />
            {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}

