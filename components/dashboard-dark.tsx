"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { TaskCalendar } from "./task-calendar"
import { AnalysisDashboardDark } from "./analysis-dashboard-dark"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import type { TaskData, ActivityData, WorkoutData } from "../models/workout-model"
import { TaskCard } from "./task-card"
import { UserIDModal } from "./user-id-modal"
import { ActivityDataModal } from "./activity-data-modal"
import { HealthQuestionnaireModal } from "./health-questionnaire-modal"
import { clearTaskData } from "@/lib/localStorage-utils"

// Update the props interface at the top of the file
interface DashboardDarkProps {
  initialUserID?: string | null
  onUserIDChange?: (newUserID: string) => void
}

// API endpoints
const API_BASE_URL = "https://j3g2wfs5yg.execute-api.us-east-1.amazonaws.com/test"

function useWorkoutController(initialUserID?: string) {
  // State for activity data modal
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [currentTaskForActivity, setCurrentTaskForActivity] = useState<TaskData | null>(null)

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
    return []
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

  // Track both the date and task ID for selection
  const [selectedWorkoutDate, setSelectedWorkoutDate] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<"calendar" | "roadmap">(() => {
    if (typeof window !== "undefined") {
      const savedActiveTab = localStorage.getItem("activeTab")
      return (savedActiveTab as "calendar" | "roadmap") || "calendar"
    }
    return "calendar"
  })

  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTaskIndex, setCurrentTaskIndex] = useState(() => {
    if (typeof window !== "undefined") {
      const savedIndex = localStorage.getItem("currentTaskIndex")
      return savedIndex ? Number.parseInt(savedIndex, 10) : 0
    }
    return 0
  })
  const [taskGenerationError, setTaskGenerationError] = useState<string | null>(null)
  // In the useWorkoutController hook, modify the userID state:
  const [userID, setUserID] = useState<string>(() => {
    if (initialUserID) return initialUserID
    if (typeof window !== "undefined") {
      return localStorage.getItem("userID") || ""
    }
    return ""
  })

  // Add a new state for controlling the modal visibility
  const [showUserIdModal, setShowUserIdModal] = useState<boolean>(false)

  // First, add a new state for the health questionnaire modal at the top of the useWorkoutController function
  // Add this after the showUserIdModal state:

  const [showHealthQuestionnaireModal, setShowHealthQuestionnaireModal] = useState<boolean>(false)

  // Add an effect to check if userID is null and show the modal
  useEffect(() => {
    if (!userID) {
      setShowUserIdModal(true)
    } else if (roadmapTasks.length === 0 && !isLoading) {
      // If we have a userID but no tasks, fetch them from the backend
      fetchUserTasks()
    }
  }, [userID])

  // Listen for health questionnaire submission events
  useEffect(() => {
    const handleQuestionnaireSubmitted = () => {
      console.log("Health questionnaire submitted, generating tasks...")
      // Automatically generate tasks after questionnaire submission
      generateTasks()
    }

    window.addEventListener("healthQuestionnaireSubmitted", handleQuestionnaireSubmitted)

    return () => {
      window.removeEventListener("healthQuestionnaireSubmitted", handleQuestionnaireSubmitted)
    }
  }, [])

  // Function to convert TaskData with activityData to WorkoutData
  const taskToWorkoutData = (task: TaskData): WorkoutData | null => {
    // Use completionDate as the date if available, otherwise fall back to date, taskDate or today
    const date = task.completionDate || task.date || task.taskDate || new Date().toISOString().split("T")[0]

    if (!task.activityData) return null

    return {
      date: date,
      vo2max: task.activityData.vo2max || 0,
      heartRate: task.activityData.heartRate || 0,
      duration: task.activityData.duration || 0,
      calories: task.activityData.calories || 0,
      taskId: task.taskId,
      title: task.title,
      description: task.description,
    }
  }

  // Function to fetch user tasks from the backend
  const fetchUserTasks = async () => {
    if (!userID) return

    setIsLoading(true)
    try {
      // Fetch tasks for a longer period to ensure we get all tasks
      const startDate = getFormattedDate(0) // Today's date
      const endDate = getFormattedDate(60) // 60 days from today for more comprehensive view

      const API_URL = `${API_BASE_URL}/tasks?userID=${userID}&date=${startDate}&endDate=${endDate}`

      const response = await fetch(API_URL, {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`)
      }

      const tasks = await response.json()

      if (tasks && tasks.length > 0) {
        console.log("Fetched tasks from backend:", tasks)

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

        console.log("Processed tasks:", processedTasks)
        setRoadmapTasks(processedTasks)

        // Update taskMap with completed tasks
        const completedTasksMap: Record<string, TaskData[]> = {}
        const workoutDataArray: WorkoutData[] = []

        processedTasks.forEach((task: TaskData) => {
          if (task.completed) {
            // Use task.date as the key for taskMap, falling back to taskDate if needed
            const dateKey = task.date || task.taskDate || new Date().toISOString().split("T")[0]

            // Add to taskMap
            if (!completedTasksMap[dateKey]) {
              completedTasksMap[dateKey] = []
            }
            completedTasksMap[dateKey].push(task)

            // Convert to WorkoutData if it has activity data
            if (task.activityData) {
              const workoutData = taskToWorkoutData(task)
              if (workoutData) {
                workoutDataArray.push(workoutData)
              }
            }
          }
        })

        console.log("Completed tasks map:", completedTasksMap)
        setTaskMap(completedTasksMap)

        // Update workout history with tasks that have activity data
        if (workoutDataArray.length > 0) {
          console.log("Workout history data:", workoutDataArray)
          setWorkoutHistory(workoutDataArray)
        }
      }
    } catch (error) {
      console.error("Error fetching user tasks:", error)
      setTaskGenerationError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Add a function to handle the userID submission
  const handleUserIdSubmit = (newUserId: string) => {
    // If the userID is changing, clear task data
    if (userID !== newUserId) {
      clearTaskData()

      // Reset state
      setRoadmapTasks([])
      setWorkoutHistory([])
      setTaskMap({})
      setSelectedWorkoutDate(null)
    }

    setUserID(newUserId)
    if (typeof window !== "undefined") {
      localStorage.setItem("userID", newUserId)
    }
    setShowUserIdModal(false)

    // Fetch tasks after setting the user ID
    fetchUserTasks()
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

  // Then modify the selectedWorkout determination
  const selectedWorkout = (() => {
    if (selectedWorkoutDate && selectedTaskId) {
      // First try to find by both date and taskId
      const byBoth = workoutHistory.find(
        (workout) => workout.date === selectedWorkoutDate && workout.taskId === selectedTaskId,
      )
      if (byBoth) return byBoth
    }

    if (selectedWorkoutDate) {
      // Fall back to date only
      const byDate = workoutHistory.find((workout) => workout.date === selectedWorkoutDate)
      if (byDate) return byDate
    }

    // Default to most recent
    return workoutHistory.length > 0 ? workoutHistory[workoutHistory.length - 1] : undefined
  })()

  // Now update the handleViewAnalysis function to accept and store taskId
  const handleViewAnalysis = useCallback((date: string, taskId?: string) => {
    setSelectedWorkoutDate(date)
    if (taskId) setSelectedTaskId(taskId)
    document.getElementById("analysis-section")?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // And update the handleRoadmapTaskSelect function
  const handleRoadmapTaskSelect = useCallback(
    (task: TaskData, date: string) => {
      // If the task is completed and has activity data, use its date
      if (task.completed && task.activityData) {
        const taskDate = task.date || task.taskDate || date
        setSelectedWorkoutDate(taskDate)
        if (task.taskId) setSelectedTaskId(task.taskId)

        // Find the corresponding workout data
        const workout = workoutHistory.find(
          (w) => (w.date === taskDate && w.taskId === task.taskId) || w.taskId === task.taskId,
        )
        if (!workout && task.activityData) {
          // If no workout found but task has activity data, create one and add it to history
          const newWorkout = taskToWorkoutData(task)
          if (newWorkout) {
            setWorkoutHistory((prev) => [...prev, newWorkout])
            setSelectedWorkoutDate(newWorkout.date)
            if (newWorkout.taskId) setSelectedTaskId(newWorkout.taskId)
          }
        }
      } else {
        // Otherwise use the provided date (usually today's date)
        setSelectedWorkoutDate(date)
        if (task.taskId) setSelectedTaskId(task.taskId)
      }

      setActiveTab("calendar")
      document.getElementById("analysis-section")?.scrollIntoView({ behavior: "smooth" })
    },
    [workoutHistory],
  )

  const getFormattedDate = (daysToAdd = 0) => {
    const date = new Date()
    date.setDate(date.getDate() + daysToAdd)
    return date.toISOString().split("T")[0]
  }

  // Then, update the generateTasks function with the timeout and error handling:

  // Updated generateTasks function using API calls with CORS enabled
  const generateTasks = async () => {
    console.log("Starting task generation process...")
    setIsGeneratingTasks(true)
    setTaskGenerationError(null)

    if (!userID) {
      setTaskGenerationError("User ID is required. Please enter your User ID first.")
      setIsGeneratingTasks(false)
      setShowUserIdModal(true)
      return
    }

    const startDate = getFormattedDate(0) // Today's date
    const endDate = getFormattedDate(60) // 60 days from today for more comprehensive view
    const API_URL = `${API_BASE_URL}/tasks?userID=${userID}&date=${startDate}&endDate=${endDate}`

    let tasks = []

    // --- First fetch: Check for existing tasks ---
    try {
      console.log("Fetching existing tasks...")
      const response = await fetch(API_URL, {
        method: "GET",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
      })
      tasks = await response.json()
      console.log("Received tasks:", tasks)
    } catch (error) {
      console.error("Error fetching existing tasks:", error)
      // Set tasks to an empty array so that generation proceeds
      tasks = []
    }

    // If tasks already exist, process them and finish.
    if (tasks && tasks.length > 0) {
      processTasks(tasks)
      setIsGeneratingTasks(false)
      return
    }

    // --- Second fetch: Initiate task generation ---
    try {
      console.log("No existing tasks found, generating new tasks...")
      const createResponse = await fetch(`${API_BASE_URL}/create?userID=${userID}&startDate=${startDate}`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
      })

      if (createResponse.status === 404) {
        console.log("User data not found (404). User needs to complete health questionnaire.")
        setTaskGenerationError("We need some information about your health goals to create your personalized roadmap.")
        setShowHealthQuestionnaireModal(true)
        setIsGeneratingTasks(false)
        return
      } else if (!createResponse.ok) {
        console.error("Failed to generate tasks:", createResponse.status, createResponse.statusText)
        setTaskGenerationError("Failed to generate tasks. Please try again later.")
        setIsGeneratingTasks(false)
        return
      }
    } catch (error) {
      console.error("Error during task generation (POST request):", error)
      // Even if this fails, we proceed to polling in case tasks eventually get created.
    }

    // --- Third: Poll for newly generated tasks ---
    console.log("Task generation initiated. Polling for new tasks...")
    const maxAttempts = 15 // Adjust as needed
    const delay = 2000 // 2-second delay between attempts
    let attempts = 0
    tasks = []

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delay))

      try {
        const response = await fetch(API_URL, {
          method: "GET",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
        })

        if (response.ok) {
          tasks = await response.json()
          if (tasks && tasks.length > 0) {
            console.log("New tasks are available:", tasks)
            break
          } else {
            console.log(`Attempt ${attempts + 1}: Tasks not yet generated.`)
          }
        } else {
          console.error(
            `Attempt ${attempts + 1}: Error fetching tasks during polling - ${response.status} ${response.statusText}`,
          )
        }
      } catch (pollError) {
        console.error(`Attempt ${attempts + 1}: Polling error:`, pollError)
      }

      attempts++
    }

    if (!tasks || tasks.length === 0) {
      setTaskGenerationError("Tasks are still being generated. Please try again in a moment.")
      setIsGeneratingTasks(false)
      return
    }

    // Process tasks once they're available
    processTasks(tasks)
    setIsGeneratingTasks(false)
  }

  // --- Helper function to process tasks ---
  const processTasks = (tasks) => {
    // Create a map to track tasks by their unique identifiers
    const uniqueTasks = new Map()

    tasks.forEach((task) => {
      // If task is completed but doesn't have a completionDate, use date, taskDate or today's date
      if (task.completed && !task.completionDate) {
        task.completionDate = task.date || task.taskDate || new Date().toISOString().split("T")[0]
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

    // Process completed tasks
    const completedTasksMap = {}
    const workoutDataArray = []

    processedTasks.forEach((task) => {
      if (task.completed) {
        // Use task.completionDate as the key for taskMap, falling back to date, taskDate or today
        const dateKey = task.completionDate || task.date || task.taskDate || new Date().toISOString().split("T")[0]

        // Add to taskMap
        if (!completedTasksMap[dateKey]) {
          completedTasksMap[dateKey] = []
        }
        completedTasksMap[dateKey].push(task)

        // Convert to WorkoutData if it has activity data
        if (task.activityData) {
          const workoutData = taskToWorkoutData(task)
          if (workoutData) {
            workoutDataArray.push(workoutData)
          }
        }
      }
    })

    console.log("Completed tasks map:", completedTasksMap)
    setTaskMap(completedTasksMap)

    // Update workout history with tasks that have activity data
    if (workoutDataArray.length > 0) {
      console.log("Workout history data:", workoutDataArray)
      setWorkoutHistory(workoutDataArray)
    }
  }

  // Find the initiateTaskCompletion function and update it to ensure we're capturing the exact task

  // With this enhanced version:
  const initiateTaskCompletion = useCallback((task: TaskData) => {
    // Create a deep copy of the task to prevent reference issues
    const taskCopy = JSON.parse(JSON.stringify(task))

    // Ensure the task has a unique identifier
    if (!taskCopy.taskId) {
      // If no taskId exists, create a composite key using day and title
      taskCopy.taskId = `task-${taskCopy.day}-${taskCopy.title.replace(/\s+/g, "-").toLowerCase()}`
    }

    setCurrentTaskForActivity(taskCopy)
    setShowActivityModal(true)
  }, [])

  // Function to handle activity data submission and complete the task
  const handleActivitySubmit = useCallback(
    async (activityData: ActivityData) => {
      if (!currentTaskForActivity || !userID) return

      try {
        const today = new Date().toISOString().split("T")[0]

        // Create updated task with activity data and completion date
        const updatedTask: TaskData = {
          ...currentTaskForActivity,
          completed: true,
          date: today, // Use today's date for the date
          completionDate: today, // Set the completion date explicitly
          activityData: activityData,
        }

        // Update backend - ensure we're sending exactly what the Lambda function expects
        const updateResponse = await fetch(`${API_BASE_URL}/tasks`, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userID: userID,
            taskDate: currentTaskForActivity.day || currentTaskForActivity.taskDate,
            activityData: activityData,
            completionDate: today,
          }),
        })

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text()
          console.error("Error response:", errorText)
          throw new Error(`Failed to update task: ${updateResponse.status} ${errorText}`)
        }

        // Update local state
        // 1. Update roadmapTasks - only match on exact taskId, or if no taskId exists, use a combination of day and title
        setRoadmapTasks((prevTasks) =>
          prevTasks.map((t) => {
            // If we have taskIds, use those for exact matching
            if (updatedTask.taskId && t.taskId) {
              return t.taskId === updatedTask.taskId ? updatedTask : t
            }
            // Fallback to matching on day AND title to ensure uniqueness
            return t.day === updatedTask.day && t.title === updatedTask.title ? updatedTask : t
          }),
        )

        // 2. Update taskMap - use today's date as the key
        setTaskMap((prevMap) => {
          const currentCompletedTasks = prevMap[today] || []
          if (!currentCompletedTasks.some((t) => t.taskId === updatedTask.taskId)) {
            return {
              ...prevMap,
              [today]: [...currentCompletedTasks, updatedTask],
            }
          }
          return prevMap
        })

        // 3. Update workoutHistory with properly formatted WorkoutData
        const newWorkoutData: WorkoutData = {
          date: today,
          vo2max: activityData.vo2max,
          heartRate: activityData.heartRate,
          duration: activityData.duration,
          calories: activityData.calories,
          // Make sure we have a valid taskId
          taskId:
            updatedTask.taskId || `task-${updatedTask.day}-${updatedTask.title?.replace(/\s+/g, "-").toLowerCase()}`,
          title: updatedTask.title,
          description: updatedTask.description,
        }

        setWorkoutHistory((prev) => [...prev, newWorkoutData])

        // Set the selected workout date to show the newly completed workout
        setSelectedWorkoutDate(today)

        // Close the modal
        setShowActivityModal(false)
        setCurrentTaskForActivity(null)
      } catch (error) {
        console.error("Error completing task:", error)
        // Show error to user
        alert("Failed to complete task. Please try again.")
      }
    },
    [currentTaskForActivity, userID],
  )

  // Update the return statement of the useWorkoutController hook to include the new state:
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
    isLoading,
    currentTaskIndex,
    setCurrentTaskIndex,
    initiateTaskCompletion,
    taskGenerationError,
    userID,
    showUserIdModal,
    handleUserIdSubmit,
    showActivityModal,
    setShowActivityModal,
    currentTaskForActivity,
    handleActivitySubmit,
    showHealthQuestionnaireModal,
    setShowHealthQuestionnaireModal,
    // Add these two functions to the return object
    setUserID,
    fetchUserTasks,
    selectedTaskId,
  }
}

export function DashboardDark({ initialUserID, onUserIDChange }: DashboardDarkProps) {
  // In the DashboardDark component, update the destructuring to include selectedWorkout
  const {
    selectedWorkout,
    workoutHistory,
    taskMap,
    roadmapTasks,
    activeTab,
    setActiveTab,
    handleViewAnalysis,
    handleRoadmapTaskSelect,
    generateTasks,
    isGeneratingTasks,
    isLoading,
    currentTaskIndex,
    setCurrentTaskIndex,
    initiateTaskCompletion,
    taskGenerationError,
    userID,
    showUserIdModal,
    handleUserIdSubmit,
    showActivityModal,
    setShowActivityModal,
    currentTaskForActivity,
    handleActivitySubmit,
    showHealthQuestionnaireModal,
    setShowHealthQuestionnaireModal,
    setUserID,
    fetchUserTasks,
    selectedWorkoutDate,
    selectedTaskId,
  } = useWorkoutController(initialUserID)

  // Add effect to handle userID changes from parent
  useEffect(() => {
    if (initialUserID && initialUserID !== userID) {
      // Clear task data when userID changes from parent
      clearTaskData()
      setUserID(initialUserID)
      // This will trigger the useEffect in useWorkoutController that fetches tasks
    }
  }, [initialUserID, userID, setUserID])

  // Update the handleUserIdSubmit function to also call the parent's onUserIDChange
  const handleUserIdSubmitWithCallback = (newUserId: string) => {
    handleUserIdSubmit(newUserId)
    if (onUserIDChange) {
      onUserIDChange(newUserId)
    }
  }

  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  // Create refs for each task card
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Measure container width on mount/resize
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
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

  const cardWidth = 375 // Increased by 25% from 300
  const cardSpacing = 16 // Should match your spacing (e.g., space-x-4)
  const totalCardWidth = cardWidth + cardSpacing

  // Calculate how many cards can be visible based on container width
  const visibleCardCount = Math.max(1, Math.floor((containerWidth || 1200) / totalCardWidth))

  // Add the UserIDModal component at the end of the return statement, just before the closing div
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#E0E0E0]">Fitness Dashboard</h1>

      {/* Roadmap Section */}
      <div className="mb-10 bg-[#1A1A1A] p-6 rounded-lg shadow-md border border-[#333]">
        <h2 className="text-xl font-bold mb-4 text-[#E0E0E0]">Your Health Roadmap</h2>

        {roadmapTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-[#121212] rounded-lg border border-[#333]">
            <p className="text-[#BDBDBD] mb-4">You don't have any tasks in your roadmap yet.</p>
            {taskGenerationError && (
              <div className="mb-4 p-3 bg-[#2D1A1A] border border-[#FF5252] text-[#FF5252] rounded-md">
                <p className="font-medium">
                  {taskGenerationError.includes("We need some information")
                    ? "Complete Your Profile"
                    : "Error generating tasks:"}
                </p>
                <p>{taskGenerationError}</p>
                <p className="text-sm mt-1">
                  {taskGenerationError.includes("We need some information")
                    ? "Please complete the health questionnaire when prompted."
                    : "Please try again or contact support if the issue persists."}
                </p>
              </div>
            )}
            <button
              onClick={generateTasks}
              disabled={isGeneratingTasks || isLoading}
              className="flex items-center px-4 py-2 bg-[#00FF85] text-[#121212] rounded-lg hover:bg-[#00E676] transition-colors duration-200 disabled:opacity-50 font-medium"
            >
              {isGeneratingTasks || isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#121212]"
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
                  {isGeneratingTasks ? "Generating Tasks..." : "Loading Tasks..."}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-5 w-5" />
                  Generate Your Roadmap
                </>
              )}
            </button>
            {isGeneratingTasks && (
              <div className="mt-4 text-sm text-[#BDBDBD] text-center">
                <p>
                  {isLoading
                    ? "Fetching your personalized fitness tasks..."
                    : "Creating your personalized fitness roadmap..."}
                </p>
                <p className="mt-2 text-[#999] text-center">This might take about 30 seconds.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Task counter */}
            <div className="text-center mb-4 text-[#BDBDBD]">
              <span className="text-[#00BCD4] font-bold">{currentTaskIndex + 1}</span> of {roadmapTasks.length} tasks
              {roadmapTasks[currentTaskIndex]?.completed && <span className="ml-2 text-[#00FF85]">(Completed)</span>}
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
                  width: `${Math.min(roadmapTasks.length, visibleCardCount) * totalCardWidth}px`,
                  maxWidth: "100%",
                }}
              >
                <div className="flex overflow-x-auto scrollbar-hide">
                  {roadmapTasks.map((task, index) => (
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
                        onComplete={() => initiateTaskCompletion(task)}
                        onViewAnalysis={() =>
                          handleViewAnalysis(task.date || new Date().toISOString().split("T")[0], task.taskId)
                        }
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
                disabled={currentTaskIndex === roadmapTasks.length - 1}
                className="p-2 bg-[#00BCD4] text-[#121212] rounded-full disabled:opacity-50 hover:bg-[#00ACC1] transition-colors duration-200"
                aria-label="Next task"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Task navigation dots */}
            <div className="flex justify-center mt-6 space-x-2 overflow-x-auto py-2 scrollbar-hide">
              {roadmapTasks.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTaskIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentTaskIndex
                      ? "bg-[#00BCD4] w-5"
                      : roadmapTasks[index]?.completed
                        ? "bg-[#00FF85]"
                        : "bg-[#333]"
                  }`}
                  aria-label={`Go to task ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 border-b border-[#333]">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "calendar" ? "border-b-2 border-[#00FF85] text-[#00FF85]" : "text-[#BDBDBD]"
          } transition-colors duration-200`}
          onClick={() => setActiveTab("calendar")}
        >
          Calendar View
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "roadmap" ? "border-b-2 border-[#00FF85] text-[#00FF85]" : "text-[#BDBDBD]"
          } transition-colors duration-200`}
          onClick={() => setActiveTab("roadmap")}
        >
          Roadmap View
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "calendar" ? (
        <TaskCalendar taskMap={taskMap} workoutData={workoutHistory} onViewAnalysis={handleViewAnalysis} />
      ) : (
        <div className="bg-[#1A1A1A] p-6 rounded-lg shadow-md border border-[#333]">
          <h2 className="text-xl font-bold mb-4 text-[#E0E0E0]">Roadmap Calendar View</h2>
          <p className="text-[#BDBDBD]">
            This view shows your roadmap tasks in a calendar format. You can see your progress and upcoming tasks.
          </p>
        </div>
      )}

      {/* Analysis Dashboard */}
      <div id="analysis-section" className="mt-12">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold text-[#E0E0E0]">Workout Analysis</h2>
        </div>
        <AnalysisDashboardDark selectedWorkout={selectedWorkout} workoutHistory={workoutHistory} />
      </div>

      {/* Modals */}
      <UserIDModal
        isOpen={showUserIdModal}
        onSubmit={handleUserIdSubmitWithCallback}
        onClose={() => (userID ? setShowUserIdModal(false) : null)}
        initialValue={userID || ""}
      />
      <ActivityDataModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onSubmit={handleActivitySubmit}
        initialData={currentTaskForActivity?.activityData}
      />
      <HealthQuestionnaireModal
        isOpen={showHealthQuestionnaireModal}
        onClose={() => setShowHealthQuestionnaireModal(false)}
        userId={userID}
      />
    </div>
  )
}

