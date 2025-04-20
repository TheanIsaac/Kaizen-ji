"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { BarChart, X } from "lucide-react"

interface MiniCardContent {
  title: string
  content: string
  purpose: string
  tutorial: string
}

interface TaskCardProps {
  title: string
  taskDate: string
  taskId: string
  description: string
  warmup: MiniCardContent
  workout: MiniCardContent
  cooldown: MiniCardContent
  onComplete: () => void
  onViewAnalysis?: (task: TaskData, date?: string) => void
  isCurrent: boolean
  completed?: boolean
  date?: string
}

// Define the TaskData interface
interface TaskData {
  taskId: string
  // Add other properties as needed based on your actual TaskData structure
}

const MiniCard: React.FC<{ content: MiniCardContent; onExpand: () => void }> = ({ content, onExpand }) => (
  <div
    className="bg-[#1A1A1A]/80 backdrop-blur-sm p-3 rounded-lg cursor-pointer hover:bg-[#252525] transition-colors duration-200 border border-[#333]"
    onClick={onExpand}
  >
    <h4 className="font-semibold text-sm mb-1 text-[#00BCD4]">{content.title}</h4>
    <p className="text-sm text-[#E0E0E0]">{content.content}</p>
  </div>
)

const ExpandedCard: React.FC<{ content: MiniCardContent; onClose: () => void }> = ({ content, onClose }) => (
  <div className="absolute inset-0 bg-[#1A1A1A]/90 backdrop-blur-sm z-20 p-6 rounded-lg overflow-y-auto border border-[#333] animate-scale-in">
    <button
      onClick={onClose}
      className="absolute top-2 right-2 text-[#999] hover:text-[#E0E0E0] transition-colors duration-200"
    >
      <X size={24} />
    </button>
    <h3 className="text-xl font-bold mb-4 text-[#00BCD4]">{content.title}</h3>
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2 text-[#E0E0E0]">Description</h4>
        <p className="text-[#BDBDBD]">{content.content}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-[#E0E0E0]">Purpose</h4>
        <p className="text-[#BDBDBD]">{content.purpose}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-[#E0E0E0]">How to do it</h4>
        <p className="text-[#BDBDBD]">{content.tutorial}</p>
      </div>
    </div>
  </div>
)

export const TaskCard: React.FC<TaskCardProps> = ({
  title,
  taskDate,
  taskId,
  description,
  warmup,
  workout,
  cooldown,
  onComplete,
  onViewAnalysis,
  isCurrent,
  completed = false,
  date,
}) => {
  const [expandedCard, setExpandedCard] = useState<"warmup" | "workout" | "cooldown" | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isCompletionAnimating, setIsCompletionAnimating] = useState(false)
  const [showCompletedBadge, setShowCompletedBadge] = useState(completed)
  const cardRef = useRef<HTMLDivElement>(null)

  // Add animation when card becomes current
  useEffect(() => {
    if (isCurrent) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isCurrent])

  // Update showCompletedBadge when completed prop changes
  useEffect(() => {
    setShowCompletedBadge(completed)
  }, [completed])

  // Ensure we have valid objects for warmup, workout, and cooldown
  const safeWarmup = warmup || {
    title: "Warm-up",
    content: "No warm-up details available",
    purpose: "",
    tutorial: "",
  }

  const safeWorkout = workout || {
    title: "Workout",
    content: "No workout details available",
    purpose: "",
    tutorial: "",
  }

  const safeCooldown = cooldown || {
    title: "Cool-down",
    content: "No cool-down details available",
    purpose: "",
    tutorial: "",
  }

  // Handler for View Analysis button
  const handleViewAnalysis = () => {
    if (onViewAnalysis) {
      // Pass the task ID along with the date to identify the specific workout
      onViewAnalysis({ taskId: taskId }, date || new Date().toISOString().split("T")[0])
    }
  }

  // Handler for Mark as Completed button with animation
  const handleComplete = () => {
    if (!isCurrent) return // Prevent non-current cards from being completed

    setIsCompletionAnimating(true)
    setShowCompletedBadge(true)

    // Wait for animation to complete before calling the actual onComplete
    setTimeout(() => {
      onComplete()
      // Keep the animation a bit longer for visual effect
      setTimeout(() => {
        setIsCompletionAnimating(false)
      }, 1000)
    }, 1000)
  }

  return (
    <div
      ref={cardRef}
      className={`bg-gradient-to-b from-[#525961] to-[#03070d] shadow-lg rounded-lg p-6 w-[375px] h-[680px] flex flex-col justify-between relative
  transition-all duration-300 ease-in-out
  ${isCurrent ? "opacity-100 z-10" : "opacity-40 blur-[1px] z-0 pointer-events-none"}
  ${isAnimating ? "animate-scale-in" : ""}
  ${isCompletionAnimating ? "animate-border-glow border-2 border-[#00FF85]" : ""}
  ${completed && !isCompletionAnimating ? "border-2 border-[#00FF85]" : !isCompletionAnimating ? "border border-[#333]" : ""}
`}
    >
      <div>
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-sm font-bold text-[#FFFFFF]">{taskDate}</h3>
          </div>
          <span
            className={`bg-[#00FF85] text-[#121212] text-xs px-2 py-1 rounded-full font-medium
            ${showCompletedBadge && !completed ? "animate-fade-in-badge" : ""}
            ${showCompletedBadge ? "opacity-100" : "opacity-0"}`}
          >
            Completed
          </span>
        </div>
        <h2 className="text-l font-bold mb-2 text-[#E0E0E0]">{title}</h2>
        <p className="text-[#BDBDBD] mb-4">{description}</p>
        <div className="space-y-3">
          <MiniCard content={safeWarmup} onExpand={() => setExpandedCard("warmup")} />
          <MiniCard content={safeWorkout} onExpand={() => setExpandedCard("workout")} />
          <MiniCard content={safeCooldown} onExpand={() => setExpandedCard("cooldown")} />
        </div>
      </div>
      {isCurrent &&
        (completed ? (
          <button
            onClick={handleViewAnalysis}
            className="w-full bg-gradient-to-r from-[#002757] to-[#0071ff] text-white py-2 px-4 rounded-lg hover:opacity-90 transition duration-200 mt-4 flex items-center justify-center"
          >
            <BarChart className="mr-2 h-5 w-5" />
            View Analysis
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={isCompletionAnimating}
            className={`w-full bg-[#00FF85] text-[#121212] py-2 px-4 rounded-lg hover:bg-[#00E676] transition duration-200 mt-4 font-medium ${
              isCompletionAnimating ? "opacity-50" : ""
            }`}
          >
            {isCompletionAnimating ? "Completing..." : "Mark as Completed"}
          </button>
        ))}
      {expandedCard === "warmup" && <ExpandedCard content={safeWarmup} onClose={() => setExpandedCard(null)} />}
      {expandedCard === "workout" && <ExpandedCard content={safeWorkout} onClose={() => setExpandedCard(null)} />}
      {expandedCard === "cooldown" && <ExpandedCard content={safeCooldown} onClose={() => setExpandedCard(null)} />}
    </div>
  )
}

