"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { TaskCard } from "./task-card"

// Define the task data structure
interface TaskData {
  title: string
  day: string
  description: string
  warmup: {
    title: string
    content: string
    purpose: string
    tutorial: string
  }
  workout: {
    title: string
    content: string
    purpose: string
    tutorial: string
  }
  cooldown: {
    title: string
    content: string
    purpose: string
    tutorial: string
  }
  completed: boolean
  taskId?: string
  date?: string
  taskDate?: string
  completionDate?: string
}

interface WorkoutData {
  date: string
  vo2max: number
  heartRate: number
  duration: number
  calories: number
}

interface TaskCalendarProps {
  taskMap: Record<string, TaskData[]> // Date string (YYYY-MM-DD) -> array of tasks
  workoutData?: WorkoutData[]
  onViewAnalysis?: (date: string, taskId?: string) => void
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({ taskMap, workoutData = [], onViewAnalysis }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const calendarContainerRef = useRef<HTMLDivElement>(null)

  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("calendarSelectedDate")
    }
    return null
  })

  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const savedIndex = localStorage.getItem("calendarSelectedTaskIndex")
      return savedIndex ? Number.parseInt(savedIndex, 10) : 0
    }
    return 0
  })

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (typeof window !== "undefined") {
      const savedMonth = localStorage.getItem("calendarCurrentMonth")
      return savedMonth ? new Date(savedMonth) : new Date()
    }
    return new Date()
  })

  // Save to localStorage when state changes
  useEffect(() => {
    if (typeof window !== "undefined" && selectedDate) {
      localStorage.setItem("calendarSelectedDate", selectedDate)
    }
  }, [selectedDate])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("calendarSelectedTaskIndex", selectedTaskIndex.toString())
    }
  }, [selectedTaskIndex])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("calendarCurrentMonth", currentMonth.toISOString())
    }
  }, [currentMonth])

  // Calculate the number of completed tasks for each date
  const getCompletedTaskCount = (date: string): number => {
    // Count tasks that were completed on this specific date
    let count = 0

    // Check all dates in the taskMap
    Object.values(taskMap).forEach((tasks) => {
      // For each date, count tasks that were completed on the specified date
      tasks.forEach((task) => {
        if (task.completed && task.completionDate === date) {
          count++
        }
      })
    })

    return count
  }

  // Get all tasks for a date
  const getTasksForDate = (date: string): TaskData[] => {
    // Collect all tasks that were completed on this date
    const tasksForDate: TaskData[] = []

    // Check all dates in the taskMap
    Object.values(taskMap).forEach((tasks) => {
      // For each date, find tasks that were completed on the specified date
      tasks.forEach((task) => {
        if (task.completed && task.completionDate === date) {
          tasksForDate.push(task)
        }
      })
    })

    return tasksForDate
  }

  // Get the current selected task
  const getCurrentTask = (): TaskData | null => {
    if (!selectedDate) return null
    const tasks = getTasksForDate(selectedDate)
    if (tasks.length === 0) return null
    return tasks[selectedTaskIndex]
  }

  // Handle navigation between tasks for the same date
  const handlePreviousTask = () => {
    if (!selectedDate) return
    const tasks = getTasksForDate(selectedDate)
    if (selectedTaskIndex > 0) {
      setSelectedTaskIndex(selectedTaskIndex - 1)
    }
  }

  const handleNextTask = () => {
    if (!selectedDate) return
    const tasks = getTasksForDate(selectedDate)
    if (selectedTaskIndex < tasks.length - 1) {
      setSelectedTaskIndex(selectedTaskIndex + 1)
    }
  }

  // Close the task popup
  const handleClosePopup = () => {
    setSelectedDate(null)
    setSelectedTaskIndex(0)
  }

  // Mark a task as completed
  const handleCompleteTask = () => {
    const currentTask = getCurrentTask()
    if (currentTask && !currentTask.completed) {
      currentTask.completed = true
      // In a real app, you would update this in your state management or backend
      console.log(`Task "${currentTask.title}" marked as completed`)
      // Force a re-render to update the calendar
      forceUpdate()
    }
  }

  // Handle view analysis
  const handleViewAnalysis = () => {
    if (selectedDate && currentTask?.taskId && onViewAnalysis) {
      // Use completionDate if available, otherwise fall back to selectedDate
      const dateToUse = currentTask.completionDate || selectedDate
      onViewAnalysis(dateToUse, currentTask?.taskId)
      handleClosePopup()
    }
  }

  // Helper function to force a re-render
  const [, updateState] = useState<object>({})
  const forceUpdate = () => updateState({})

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth)
      newMonth.setMonth(newMonth.getMonth() - 1)
      return newMonth
    })
  }

  // Navigate to next month
  const goToNextMonth = () => {
    const today = new Date()
    const nextMonth = new Date(currentMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    // Only allow navigation to months that are not in the future
    if (
      nextMonth.getFullYear() < today.getFullYear() ||
      (nextMonth.getFullYear() === today.getFullYear() && nextMonth.getMonth() <= today.getMonth())
    ) {
      setCurrentMonth(nextMonth)
    }
  }

  // Check if next month navigation should be disabled
  const isNextMonthDisabled = () => {
    const today = new Date()
    const nextMonth = new Date(currentMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    return (
      nextMonth.getFullYear() > today.getFullYear() ||
      (nextMonth.getFullYear() === today.getFullYear() && nextMonth.getMonth() > today.getMonth())
    )
  }

  useEffect(() => {
    if (!svgRef.current || !calendarContainerRef.current) return

    // Get container dimensions
    const containerWidth = calendarContainerRef.current.clientWidth

    // Clear any existing elements
    d3.select(svgRef.current).selectAll("*").remove()

    // Set up dimensions
    const margin = { top: 30, right: 20, bottom: 10, left: 40 }
    const width = Math.min(containerWidth - margin.left - margin.right, 900)
    const height = 180 - margin.top - margin.bottom
    const cellSize = 24
    const cellPadding = 2

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Get dates for the current month
    const today = new Date()
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    // Limit to today if we're in the current month
    const endDate =
      currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()
        ? today
        : lastDayOfMonth

    const dates = d3.timeDays(firstDayOfMonth, new Date(endDate.getTime() + 86400000)) // Add one day to include the end date

    // Create color scale
    const colorScale = d3
      .scaleSequential()
      .domain([0, 5]) // Assuming max 5 tasks per day
      .interpolator(d3.interpolateGreens)

    // Calculate the number of weeks in the month
    const firstDayOfWeek = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()
    const weeksInMonth = Math.ceil((firstDayOfWeek + daysInMonth) / 7)

    // Create day cells
    svg
      .selectAll(".day")
      .data(dates)
      .enter()
      .append("rect")
      .attr("class", "day")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", (d) => {
        // Position based on day of week (0 = Sunday, 6 = Saturday)
        return d.getDay() * (cellSize + cellPadding)
      })
      .attr("y", (d) => {
        // Position based on week of month
        const weekOfMonth = Math.floor((d.getDate() + firstDayOfWeek - 1) / 7)
        return weekOfMonth * (cellSize + cellPadding)
      })
      .attr("fill", (d) => {
        const dateStr = d.toISOString().split("T")[0]
        const count = getCompletedTaskCount(dateStr)
        return count === 0 ? "#ebedf0" : colorScale(count)
      })
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 0.5)
      .on("mouseover", function (event, d) {
        const dateStr = d.toISOString().split("T")[0]
        const count = getCompletedTaskCount(dateStr)
        const tasks = getTasksForDate(dateStr)
        const hasWorkoutData = workoutData.some((w) => w.date === dateStr)

        // Calculate tooltip position
        const rect = this.getBoundingClientRect()
        const containerRect = calendarContainerRef.current!.getBoundingClientRect()
        const tooltipX = rect.left - containerRect.left + cellSize / 2
        const tooltipY = rect.top - containerRect.top - 10

        // Show tooltip
        const tooltip = d3.select(tooltipRef.current)
        tooltip
          .style("opacity", 1)
          .style("left", `${tooltipX}px`)
          .style("top", `${tooltipY}px`)
          .style("transform", "translate(-50%, -100%)")
          .html(`
            <div class="font-semibold">${d.toLocaleDateString()}</div>
            <div>${count} task${count !== 1 ? "s" : ""} completed on this date</div>
            ${hasWorkoutData ? '<div class="text-blue-500">Workout data available</div>' : ""}
          `)
      })
      .on("mouseout", () => {
        // Hide tooltip
        d3.select(tooltipRef.current).style("opacity", 0)
      })
      .on("click", (event, d) => {
        const dateStr = d.toISOString().split("T")[0]
        const tasks = getTasksForDate(dateStr)
        if (tasks.length > 0) {
          setSelectedDate(dateStr)
          setSelectedTaskIndex(0)
        }
      })

    // Add day of week labels
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    svg
      .selectAll(".day-label")
      .data(dayLabels)
      .enter()
      .append("text")
      .attr("class", "day-label")
      .attr("x", (d, i) => i * (cellSize + cellPadding) + cellSize / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#FFF")
      .text((d) => d)

    // Add date labels inside cells
    svg
      .selectAll(".date-label")
      .data(dates)
      .enter()
      .append("text")
      .attr("class", "date-label")
      .attr("x", (d) => d.getDay() * (cellSize + cellPadding) + cellSize / 2)
      .attr("y", (d) => {
        const weekOfMonth = Math.floor((d.getDate() + firstDayOfWeek - 1) / 7)
        return weekOfMonth * (cellSize + cellPadding) + cellSize / 2 + 4
      })
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#333")
      .text((d) => d.getDate())
  }, [taskMap, workoutData, currentMonth])

  const currentTask = getCurrentTask()
  const tasksForSelectedDate = selectedDate ? getTasksForDate(selectedDate) : []
  const hasWorkoutData = selectedDate ? workoutData.some((w) => w.date === selectedDate) : false

  // Format the current month for display
  const formattedMonth = currentMonth.toLocaleString("default", { month: "long", year: "numeric" })

  return (
    <div className="bg-[#1A1A1A] text-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-white font-bold">Task Completion Calendar</h2>
        <div className="flex items-center space-x-2">
          <button onClick={goToPreviousMonth} className="p-1 rounded-full hover:bg-gray-200">
            <ChevronLeft size={20} />
          </button>
          <span className="font-medium">{formattedMonth}</span>
          <button
            onClick={goToNextMonth}
            disabled={isNextMonthDisabled()}
            className={`p-1 rounded-full ${isNextMonthDisabled() ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-200"}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="relative" ref={calendarContainerRef}>
        <svg ref={svgRef}></svg>
        <div
          ref={tooltipRef}
          className="absolute bg-black text-white p-2 rounded opacity-0 pointer-events-none transition-opacity z-20"
          style={{
            position: "absolute",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderRadius: "4px",
            color: "white",
            padding: "8px",
            fontSize: "12px",
            zIndex: 100,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        ></div>
      </div>

      {/* Task Popup */}
      {selectedDate && currentTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] rounded-lg shadow-lg max-w-md w-full relative border border-[#333]">
            <button
              onClick={handleClosePopup}
              className="absolute top-2 right-2 text-[#999] hover:text-[#E0E0E0] transition-colors duration-200"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center p-6">
              <h3 className="text-lg font-bold mb-2 text-[#E0E0E0]">
                {new Date(selectedDate).toLocaleDateString()} - Task {selectedTaskIndex + 1} of{" "}
                {tasksForSelectedDate.length}
              </h3>

              {/* Task Card */}
              <div className="mt-5">
                <TaskCard
                  title={currentTask.title}
                  taskDate={currentTask.day}
                  taskId={currentTask.taskId || currentTask.day}
                  description={currentTask.description}
                  warmup={currentTask.warmup}
                  workout={currentTask.workout}
                  cooldown={currentTask.cooldown}
                  onComplete={handleCompleteTask}
                  onViewAnalysis={hasWorkoutData ? handleViewAnalysis : undefined}
                  isCurrent={true}
                  completed={currentTask.completed}
                  date={selectedDate}
                />
              </div>

              {/* Navigation buttons for multiple tasks */}
              {tasksForSelectedDate.length > 1 && (
                <div className="flex justify-between space-x-4 mt-4">
                  <button
                    onClick={handlePreviousTask}
                    disabled={selectedTaskIndex === 0}
                    className="p-2 bg-[#00BCD4] text-[#121212] rounded-full disabled:opacity-50 hover:bg-[#00ACC1] transition-colors duration-200"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNextTask}
                    disabled={selectedTaskIndex === tasksForSelectedDate.length - 1}
                    className="p-2 bg-[#00BCD4] text-[#121212] rounded-full disabled:opacity-50 hover:bg-[#00ACC1] transition-colors duration-200"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

