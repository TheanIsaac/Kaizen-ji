"use client"

import { useState, useCallback, useLayoutEffect, useRef, useEffect } from "react"
import { TaskCalendar } from "./task-calendar"
import { AnalysisDashboard } from "./analysis-dashboard"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { getMostRecentWorkout, findWorkoutByDate, type TaskData, type WorkoutData } from "../models/workout-model"
import { TaskCard } from "./task-card"
// First, import the UserIDModal component at the top of the file
import { UserIDModalLight } from "./user-id-modal-light"

function useWorkoutController() {
  // Initialize workoutHistory with a sample workout for today, checking localStorage first
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutData[]>(() => {
    if (typeof window !== "undefined") {
      const savedWorkoutHistory = localStorage.getItem("workoutHistory")
      if (savedWorkoutHistory) {
        try {
          return JSON.parse(savedWorkoutHistory)
        } catch (error) {
          console.error("Error parsing workout history from localStorage:", error)
        }
      }
    }

    // Default data if nothing in localStorage
    const today = new Date().toISOString().split("T")[0]
    return [
      {
        date: today,
        vo2max: 45,
        heartRate: 140,
        duration: 30,
        calories: 300,
      },
    ]
  })

  // Roadmap tasks represent the tasks for the upcoming days.
  const [roadmapTasks, setRoadmapTasks] = useState<TaskData[]>(() => {
    if (typeof window !== "undefined") {
      const savedRoadmapTasks = localStorage.getItem("roadmapTasks")
      if (savedRoadmapTasks) {
        try {
          return JSON.parse(savedRoadmapTasks)
        } catch (error) {
          console.error("Error parsing roadmap tasks from localStorage:", error)
        }
      }
    }
    return []
  })

  // taskMap holds the completed tasks keyed by date.
  const [taskMap, setTaskMap] = useState<Record<string, TaskData[]>>(() => {
    if (typeof window !== "undefined") {
      const savedTaskMap = localStorage.getItem("taskMap")
      if (savedTaskMap) {
        try {
          return JSON.parse(savedTaskMap)
        } catch (error) {
          console.error("Error parsing task map from localStorage:", error)
        }
      }
    }
    return {}
  })

  const [selectedWorkoutDate, setSelectedWorkoutDate] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"calendar" | "roadmap">(() => {
    if (typeof window !== "undefined") {
      const savedActiveTab = localStorage.getItem("activeTab")
      return (savedActiveTab as "calendar" | "roadmap") || "calendar"
    }
    return "calendar"
  })

  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  const [currentTaskIndex, setCurrentTaskIndex] = useState(() => {
    if (typeof window !== "undefined") {
      const savedIndex = localStorage.getItem("currentTaskIndex")
      return savedIndex ? Number.parseInt(savedIndex, 10) : 0
    }
    return 0
  })
  const [taskGenerationError, setTaskGenerationError] = useState<string | null>(null)
  // In the useWorkoutController hook, modify the userID state:
  const [userID, setUserID] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userID") || null
    }
    return null
  })

  // Add a new state for controlling the modal visibility
  const [showUserIdModal, setShowUserIdModal] = useState<boolean>(false)

  // Add an effect to check if userID is null and show the modal
  useEffect(() => {
    if (userID === null) {
      setShowUserIdModal(true)
    }
  }, [userID])

  // Add a function to handle the userID submission
  const handleUserIdSubmit = (newUserId: string) => {
    setUserID(newUserId)
    if (typeof window !== "undefined") {
      localStorage.setItem("userID", newUserId)
    }
    setShowUserIdModal(false)
  }

  // Save to localStorage when state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("workoutHistory", JSON.stringify(workoutHistory))
    }
  }, [workoutHistory])

  useEffect(() => {
    if (typeof window !== "undefined" && roadmapTasks.length > 0) {
      localStorage.setItem("roadmapTasks", JSON.stringify(roadmapTasks))
    }
  }, [roadmapTasks])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("taskMap", JSON.stringify(taskMap))
    }
  }, [taskMap])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("activeTab", activeTab)
    }
  }, [activeTab])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentTaskIndex", currentTaskIndex.toString())
    }
  }, [currentTaskIndex])

  useEffect(() => {
    if (typeof window !== "undefined" && userID) {
      localStorage.setItem("userID", userID)
    }
  }, [userID])

  const mostRecentWorkout = getMostRecentWorkout(workoutHistory)
  const selectedWorkout = selectedWorkoutDate
    ? findWorkoutByDate(selectedWorkoutDate, workoutHistory)
    : mostRecentWorkout

  // Memoized event handlers
  const handleViewAnalysis = useCallback((date: string) => {
    setSelectedWorkoutDate(date)
    document.getElementById("analysis-section")?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleRoadmapTaskSelect = useCallback((task: TaskData, date: string) => {
    setSelectedWorkoutDate(date)
    setActiveTab("calendar")
    document.getElementById("analysis-section")?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const getFormattedDate = (daysToAdd = 0) => {
    const date = new Date()
    date.setDate(date.getDate() + daysToAdd)
    return date.toISOString().split("T")[0]
  }

  const startDate = getFormattedDate(0) // Today's date
  const endDate = getFormattedDate(60) // 60 days from today for more comprehensive view

  // Update the generateTasks function to use the userID state
  const generateTasks = async () => {
    console.log("Starting task generation process...")
    setIsGeneratingTasks(true)
    setTaskGenerationError(null)

    // Check if userID is available
    if (!userID) {
      setTaskGenerationError("User ID is required. Please enter your User ID first.")
      setIsGeneratingTasks(false)
      setShowUserIdModal(true)
      return
    }

    try {
      console.log("Fetching existing tasks...")
      const API_URL = `https://j3g2wfs5yg.execute-api.us-east-1.amazonaws.com/test/tasks?userID=${userID}&date=${startDate}&endDate=${endDate}`

      let response = await fetch(API_URL, {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error("Failed to fetch tasks:", response.status, response.statusText)
        throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`)
      }

      let tasks = await response.json()
      console.log("Received tasks:", tasks)

      // If no tasks exist, generate new tasks
      if (!tasks || tasks.length === 0) {
        console.log("No existing tasks found, generating new tasks...")
        const createResponse = await fetch(
          `https://j3g2wfs5yg.execute-api.us-east-1.amazonaws.com/test/create?userID=${userID}&startDate=${startDate}`,
          {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        if (!createResponse.ok) {
          console.error("Failed to generate tasks:", createResponse.status, createResponse.statusText)
          throw new Error(`Failed to generate tasks: ${createResponse.status} ${createResponse.statusText}`)
        }

        console.log("Tasks generated successfully, fetching new tasks...")
        response = await fetch(API_URL, {
          method: "GET",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
        })

        if (!response.ok) {
          console.error("Failed to fetch tasks after generation:", response.status, response.statusText)
          throw new Error(`Failed to fetch tasks after generation: ${response.status} ${response.statusText}`)
        }

        tasks = await response.json()
        console.log("Received newly generated tasks:", tasks)
      }

      // Process tasks to ensure they have proper date fields
      // Create a map to track tasks by their unique identifiers
      const uniqueTasks = new Map<string, TaskData>()

      tasks.forEach((task: TaskData) => {
        // If task is completed but doesn't have a date, use taskDate or today's date
        if (task.completed && !task.date) {
          task.date = task.taskDate || new Date().toISOString().split("T")[0]
        }

        // Ensure each task has a unique identifier
        const taskId = task.taskId || `task-${task.day}-${task.title.replace(/\s+/g, "-").toLowerCase()}`
        task.taskId = taskId

        // Use taskId as the unique key
        uniqueTasks.set(taskId, task)
      })

      // Convert map values to array and sort by day
      const processedTasks = Array.from(uniqueTasks.values()).sort((a, b) => {
        const dayA = Number.parseInt(a.day || "0", 10)
        const dayB = Number.parseInt(b.day || "0", 10)
        return dayA - dayB
      })

      console.log("Setting roadmap tasks:", processedTasks)
      setRoadmapTasks(processedTasks)
    } catch (error) {
      console.error("Error in task generation process:", error)
      setTaskGenerationError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      console.log("Task generation process completed")
      setIsGeneratingTasks(false)
    }
  }

  // Refactored handleTaskComplete function using useCallback:
  // Marks a task as completed by updating its state and adding it to the completed tasks map.
  const handleTaskComplete = useCallback(
    (task: TaskData) => {
      // Create a deep copy to prevent reference issues
      const updatedTask = JSON.parse(JSON.stringify(task))
      updatedTask.completed = true

      // Set the completion date to today
      const today = new Date().toISOString().split("T")[0]
      updatedTask.completionDate = today

      // Ensure the task has a unique identifier
      if (!updatedTask.taskId) {
        // If no taskId exists, create a composite key using day and title
        updatedTask.taskId = `task-${updatedTask.day}-${updatedTask.title.replace(/\s+/g, "-").toLowerCase()}`
      }

      // Update the roadmapTasks array with more precise matching
      const updatedRoadmapTasks = roadmapTasks.map((t) => {
        // If we have taskIds, use those for exact matching
        if (updatedTask.taskId && t.taskId) {
          return t.taskId === updatedTask.taskId ? updatedTask : t
        }
        // Fallback to matching on day AND title to ensure uniqueness
        return t.day === updatedTask.day && t.title === updatedTask.title ? updatedTask : t
      })

      setRoadmapTasks(updatedRoadmapTasks)

      // Add the updated task to the completed tasks for today's date in taskMap
      const currentCompletedTasks = taskMap[today] || []

      // Check if this task is already in the completed tasks
      const taskAlreadyCompleted = currentCompletedTasks.some(
        (t) =>
          (t.taskId && t.taskId === updatedTask.taskId) || (t.day === updatedTask.day && t.title === updatedTask.title),
      )

      if (!taskAlreadyCompleted) {
        const updatedTaskMap = {
          ...taskMap,
          [today]: [...currentCompletedTasks, updatedTask],
        }
        setTaskMap(updatedTaskMap)
      }

      // Optionally simulate adding a new workout entry
      const newWorkout: WorkoutData = {
        date: today,
        vo2max: Math.floor(Math.random() * 10) + 40,
        heartRate: Math.floor(Math.random() * 30) + 130,
        duration: Math.floor(Math.random() * 30) + 20,
        calories: Math.floor(Math.random() * 300) + 200,
        // Add reference to the task
        taskId: updatedTask.taskId,
        title: updatedTask.title,
        description: updatedTask.description,
      }

      setWorkoutHistory((prev) => [...prev, newWorkout])
    },
    [roadmapTasks, taskMap],
  )

  // Update the return object to include the new state and function
  return {
    selectedWorkout,
    selectedWorkoutDate,
    workoutHistory,
    taskMap,
    roadmapTasks,
    activeTab,
    setActiveTab,
    handleViewAnalysis,
    handleRoadmapTaskSelect,
    generateTasks,
    isGeneratingTasks,
    currentTaskIndex,
    setCurrentTaskIndex,
    handleTaskComplete,
    taskGenerationError,
    userID,
    showUserIdModal,
    handleUserIdSubmit,
  }
}

export function Dashboard() {
  // In the Dashboard component, destructure the new properties
  const {
    workoutHistory,
    taskMap,
    roadmapTasks,
    activeTab,
    setActiveTab,
    handleViewAnalysis,
    handleRoadmapTaskSelect,
    generateTasks,
    isGeneratingTasks,
    currentTaskIndex,
    setCurrentTaskIndex,
    handleTaskComplete,
    taskGenerationError,
    userID,
    showUserIdModal,
    handleUserIdSubmit,
  } = useWorkoutController()

  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  // Create refs for each task card
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [visibleTaskCount, setVisibleTaskCount] = useState(3)

  // Measure container width on mount/resize
  useLayoutEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        setContainerWidth(width)

        // Calculate how many cards can fit in the container
        // Card width (300px) + spacing (16px)
        const cardTotalWidth = 300 + 16
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

  // When roadmapTasks are first loaded, ensure the active item is centered
  useEffect(() => {
    if (roadmapTasks.length > 0) {
      const activeItem = itemRefs.current[currentTaskIndex]
      if (activeItem) {
        activeItem.scrollIntoView({
          behavior: "auto", // immediate centering on mount
          inline: "center",
          block: "nearest",
        })
      }
    }
  }, [roadmapTasks])

  // Also scroll when currentTaskIndex changes (for subsequent navigations)
  useEffect(() => {
    const activeItem = itemRefs.current[currentTaskIndex]
    if (activeItem) {
      activeItem.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      })
    }
  }, [currentTaskIndex])

  const handlePrevious = useCallback(() => {
    setCurrentTaskIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }, [])

  const handleNext = useCallback(() => {
    setCurrentTaskIndex((prev) => (prev < roadmapTasks.length - 1 ? prev + 1 : prev))
  }, [roadmapTasks.length])

  const cardWidth = 300 // Must match the width in TaskCard component
  const cardSpacing = 16 // Should match your spacing (e.g., space-x-4)
  const totalCardWidth = cardWidth + cardSpacing

  // Sort tasks chronologically by day number
  const sortedTasks = [...roadmapTasks].sort((a, b) => {
    const dayA = Number.parseInt(a.day || "0", 10)
    const dayB = Number.parseInt(b.day || "0", 10)
    return dayA - dayB
  })

  // Add the UserIDModal component at the end of the return statement, just before the closing div
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Fitness Dashboard</h1>

      {/* Roadmap Section */}
      <div className="mb-10 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Your Health Roadmap</h2>

        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">You don't have any tasks in your roadmap yet.</p>
            {taskGenerationError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <p className="font-medium">Error generating tasks:</p>
                <p>{taskGenerationError}</p>
                <p className="text-sm mt-1">Please try again or contact support if the issue persists.</p>
              </div>
            )}
            <button
              onClick={generateTasks}
              disabled={isGeneratingTasks}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isGeneratingTasks ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating Tasks...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-5 w-5" />
                  Generate Your Roadmap
                </>
              )}
            </button>
            {isGeneratingTasks && (
              <div className="mt-4 text-sm text-gray-600 animate-pulse">
                <p>Creating your personalized fitness roadmap...</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Task counter */}
            <div className="text-center mb-4 text-gray-600">
              <span className="text-blue-600 font-bold">{currentTaskIndex + 1}</span> of {sortedTasks.length} tasks
              {sortedTasks[currentTaskIndex]?.completed && <span className="ml-2 text-green-600">(Completed)</span>}
            </div>

            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={handlePrevious}
                disabled={currentTaskIndex === 0}
                className="p-2 bg-green-500 text-white rounded-full disabled:opacity-50"
                aria-label="Previous task"
              >
                <ChevronLeft size={24} />
              </button>

              <div
                ref={containerRef}
                className="relative overflow-hidden"
                style={{
                  width: `${Math.min(sortedTasks.length, visibleTaskCount) * totalCardWidth}px`,
                  maxWidth: "100%",
                }}
              >
                <div className="flex overflow-x-auto scrollbar-hide">
                  {sortedTasks.map((task, index) => (
                    <div
                      key={task.taskId || `task-${index}-${task.day}`}
                      ref={(el) => (itemRefs.current[index] = el)}
                      className="flex-shrink-0 px-2"
                      style={{ width: `${cardWidth}px` }}
                    >
                      <TaskCard
                        {...task}
                        taskId={task.taskId || `task-${index}-${task.day}`}
                        taskDate={task.day}
                        onComplete={() => handleTaskComplete(task)}
                        onViewAnalysis={() => handleRoadmapTaskSelect(task, new Date().toISOString().split("T")[0])}
                        isCurrent={index === currentTaskIndex}
                        date={task.date || new Date().toISOString().split("T")[0]}
                        completed={task.completed}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={currentTaskIndex === sortedTasks.length - 1}
                className="p-2 bg-green-500 text-white rounded-full disabled:opacity-50"
                aria-label="Next task"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Task navigation dots */}
            <div className="flex justify-center mt-6 space-x-2 overflow-x-auto py-2 scrollbar-hide">
              {sortedTasks.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTaskIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentTaskIndex
                      ? "bg-blue-500 w-5"
                      : sortedTasks[index]?.completed
                        ? "bg-green-500"
                        : "bg-gray-300"
                  }`}
                  aria-label={`Go to task ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "calendar" ? "border-b-2 border-green-500 text-green-600" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("calendar")}
        >
          Calendar View
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "roadmap" ? "border-b-2 border-green-500 text-green-600" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("roadmap")}
        >
          Roadmap View
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "calendar" ? (
        <TaskCalendar taskMap={taskMap} workoutData={workoutHistory} onViewAnalysis={handleViewAnalysis} />
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Roadmap Calendar View</h2>
          <p className="text-gray-600">
            This view shows your roadmap tasks in a calendar format. You can see your progress and upcoming tasks.
          </p>
        </div>
      )}

      {/* Analysis Dashboard */}
      <div id="analysis-section" className="mt-12">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold">Workout Analysis</h2>
          {/* Additional analysis details */}
        </div>
        <AnalysisDashboard selectedWorkout={null} workoutHistory={workoutHistory} />
      </div>
      {/* Add this at the end, just before the closing div */}
      <UserIDModalLight isOpen={showUserIdModal} onSubmit={handleUserIdSubmit} />
    </div>
  )
}

