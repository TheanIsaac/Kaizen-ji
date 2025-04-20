"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { TaskCard } from "./task-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { TaskData } from "../models/workout-model"

interface RoadmapProps {
  tasks: TaskData[]
  onWorkoutSelect: (task: TaskData, date: string) => void
}

export function Roadmap({ tasks, onWorkoutSelect }: RoadmapProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const currentTaskRef = useRef<HTMLDivElement>(null)
  const [visibleTaskCount, setVisibleTaskCount] = useState(3)
  const [sortedTasks, setSortedTasks] = useState<TaskData[]>([])
  const [scrollToTask, setScrollToTask] = useState(false)

  const cardWidth = 375 // Card width
  const cardSpacing = 16 // Gap between cards

  // Calculate how many tasks can be visible based on container width
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        setContainerWidth(width)

        // Calculate how many cards can fit in the container
        // Card width (375px) + spacing (16px)
        const cardTotalWidth = 375 + 16
        const visibleCards = Math.max(1, Math.floor(width / cardTotalWidth))
        setVisibleTaskCount(visibleCards)
      }
    }

    updateContainerWidth()
    window.addEventListener("resize", updateContainerWidth)

    return () => {
      window.removeEventListener("resize", updateContainerWidth)
    }
  }, [])

  // Scroll to the current task after a 500ms delay
  useEffect(() => {
    if (scrollToTask && currentTaskRef.current) {
      const timer = setTimeout(() => {
        currentTaskRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        })
        setScrollToTask(false)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [scrollToTask])

  // Sort tasks chronologically by day number
  useEffect(() => {
    const sorted = [...tasks].sort((a, b) => {
      const dayA = Number.parseInt(a.day || "0", 10)
      const dayB = Number.parseInt(b.day || "0", 10)
      return dayA - dayB
    })
    setSortedTasks(sorted)
  }, [tasks])

  const handleTaskComplete = (task: TaskData) => {
    console.log("Task completed!")
    // Mark the task as completed
    task.completed = true
    // Force a re-render
    setCurrentTaskIndex(currentTaskIndex)
  }

  const handleViewAnalysis = (task: TaskData) => {
    // Use the current date as a placeholder - in a real app, you'd use the task's date
    const date = new Date().toISOString().split("T")[0]
    onWorkoutSelect(task, date)
  }

  const handlePrevious = () => {
    setCurrentTaskIndex((prev) => (prev > 0 ? prev - 1 : prev))
    setScrollToTask(true)
  }

  const handleNext = () => {
    setCurrentTaskIndex((prev) => (prev < sortedTasks.length - 1 ? prev + 1 : prev))
    setScrollToTask(true)
  }

  // Scroll when currentTaskIndex changes
  useEffect(() => {
    if (scrollContainerRef.current && sortedTasks.length > 0) {
      const cardWidth = 375 + 16 // Card width + spacing
      const scrollPosition = currentTaskIndex * cardWidth

      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      })
    }
  }, [currentTaskIndex, sortedTasks.length])

  // If no tasks are provided, show a message
  if (!sortedTasks || sortedTasks.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#121824] to-[#121212] items-center justify-center">
        <div className="p-6 bg-gradient-to-b from-[#1E3A5F] to-[#121212] rounded-lg shadow-md border border-[#333]">
          <h1 className="text-2xl font-bold mb-4 text-[#E0E0E0] text-center">No tasks available yet.</h1>
          <p className="text-[#BDBDBD]">Your personalized roadmap will appear here once tasks are assigned.</p>
        </div>
      </div>
    )
  }

  // Find the index of the first incomplete task or default to 0
  const findFirstIncompleteTaskIndex = useCallback(() => {
    const index = sortedTasks.findIndex((task) => !task.completed)
    return index >= 0 ? index : 0
  }, [sortedTasks])

  // Set current task index to first incomplete task on initial load
  useEffect(() => {
    if (sortedTasks.length > 0) {
      setCurrentTaskIndex(findFirstIncompleteTaskIndex())
      setScrollToTask(true)
    }
  }, [sortedTasks, findFirstIncompleteTaskIndex])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#121824] to-[#121212]">
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4 text-[#E0E0E0] text-center">Your Personalized Health Roadmap</h1>

        {/* Task counter */}
        <div className="text-center mb-4 text-[#BDBDBD]">
          <span className="text-[#00BCD4] font-bold">{currentTaskIndex + 1}</span> of {sortedTasks.length} tasks
          {sortedTasks[currentTaskIndex]?.completed && <span className="ml-2 text-[#00FF85]">(Completed)</span>}
        </div>

        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={handlePrevious}
            disabled={currentTaskIndex === 0}
            className="p-2 bg-[#00BCD4] text-[#121212] rounded-full disabled:opacity-50 hover:bg-[#00ACC1] transition-colors duration-200"
            aria-label="Previous task"
          >
            <ChevronLeft size={24} />
          </button>

          <div
            ref={containerRef}
            className="relative overflow-hidden"
            style={{
              width: `${Math.min(sortedTasks.length, visibleTaskCount) * (cardWidth + 16)}px`,
              maxWidth: "100%",
            }}
          >
            <div
              ref={scrollContainerRef}
              className="flex transition-transform duration-300 ease-in-out overflow-x-auto scrollbar-hide"
            >
              {sortedTasks.map((task, index) => (
                <div
                  key={task.taskId || `task-${index}-${task.day}`}
                  ref={index === currentTaskIndex ? currentTaskRef : null}
                  className="flex-shrink-0 mr-4"
                  style={{ width: "375px" }}
                >
                  <TaskCard
                    {...task}
                    taskDate={task.day}
                    taskId={task.taskId || `task-${index}-${task.day}`}
                    onComplete={() => handleTaskComplete(task)}
                    onViewAnalysis={() => handleViewAnalysis(task)}
                    isCurrent={index === currentTaskIndex}
                    date={task.date || new Date().toISOString().split("T")[0]}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={currentTaskIndex === sortedTasks.length - 1}
            className="p-2 bg-[#00BCD4] text-[#121212] rounded-full disabled:opacity-50 hover:bg-[#00ACC1] transition-colors duration-200"
            aria-label="Next task"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Task navigation dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {sortedTasks.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTaskIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentTaskIndex
                  ? "bg-[#00BCD4] w-5"
                  : sortedTasks[index]?.completed
                    ? "bg-[#00FF85]"
                    : "bg-[#333]"
              }`}
              aria-label={`Go to task ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

