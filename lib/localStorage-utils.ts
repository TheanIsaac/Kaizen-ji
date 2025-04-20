/**
 * Utility functions for working with localStorage
 */

// Generic function to save data to localStorage
export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    if (typeof window !== "undefined") {
      // If data is a string, store it directly, otherwise stringify it
      const valueToStore = typeof data === "string" ? data : JSON.stringify(data)
      localStorage.setItem(key, valueToStore)
    }
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
  }
}

// Generic function to load data from localStorage
export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key)
      if (!item) return defaultValue

      // If the default value is a string, return the item directly
      if (typeof defaultValue === "string") {
        return item as unknown as T
      }

      // Otherwise try to parse it as JSON
      try {
        return JSON.parse(item)
      } catch (e) {
        // If parsing fails, return the raw value
        return item as unknown as T
      }
    }
    return defaultValue
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error)
    return defaultValue
  }
}

// Clear all app data from localStorage
export function clearAppData(): void {
  try {
    if (typeof window !== "undefined") {
      // List of all keys used by the app
      const appKeys = [
        "workoutHistory",
        "roadmapTasks",
        "taskMap",
        "activeTab",
        "currentTaskIndex",
        "userID",
        "expandedSection",
        "mainActiveTab",
        "calendarSelectedDate",
        "calendarSelectedTaskIndex",
        "calendarCurrentMonth",
      ]

      appKeys.forEach((key) => localStorage.removeItem(key))
      console.log("All app data cleared from localStorage")
    }
  } catch (error) {
    console.error("Error clearing app data from localStorage:", error)
  }
}

// Clear only task-related data from localStorage (for user switching)
export function clearTaskData(): void {
  try {
    if (typeof window !== "undefined") {
      // List of task-related keys
      const taskKeys = [
        "workoutHistory",
        "roadmapTasks",
        "taskMap",
        "currentTaskIndex",
        "calendarSelectedDate",
        "calendarSelectedTaskIndex",
      ]

      taskKeys.forEach((key) => localStorage.removeItem(key))
      console.log("Task data cleared from localStorage")
    }
  } catch (error) {
    console.error("Error clearing task data from localStorage:", error)
  }
}

// Check if localStorage is available
export function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false

  try {
    const testKey = "__test__"
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}

