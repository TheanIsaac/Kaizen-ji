export interface WorkoutData {
  date: string
  vo2max: number
  heartRate: number
  duration: number
  calories: number
  taskId?: string
  title?: string
  description?: string
}

export interface ActivityData {
  vo2max: number
  heartRate: number
  duration: number
  calories: number
}

export interface TaskData {
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
  date?: string
  taskId?: string
  activityData?: ActivityData
  taskDate?: string
  completionDate?: string
}

/**
 * Get workout data for a week, filling in missing days with zero values
 */
export function getWorkoutDataForWeek(date: string | undefined, workoutHistory: WorkoutData[]): WorkoutData[] {
  // Handle undefined or invalid date by using current date
  if (!date) {
    date = new Date().toISOString().split("T")[0]
  }

  try {
    // Validate the date string format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      console.error("Invalid date format:", date)
      date = new Date().toISOString().split("T")[0]
    }

    const weekDays = getWeekForDate(date)

    // For each day, use the workout from workoutHistory if available,
    // otherwise, provide a default workout with zero values.
    return weekDays.map((day) => {
      const dayStr = day.toISOString().split("T")[0] // YYYY-MM-DD format
      const found = workoutHistory.find((w) => {
        // Ensure w.date is a valid string before comparing
        if (!w.date || typeof w.date !== "string") return false
        return new Date(w.date).toISOString().split("T")[0] === dayStr
      })

      if (!found) {
        return {
          date: dayStr,
          vo2max: 0,
          heartRate: 0,
          duration: 0,
          calories: 0,
        }
      }

      // Return the found workout data
      return found
    })
  } catch (error) {
    console.error("Error in getWorkoutDataForWeek:", error)
    // Return a week of empty data if there's an error
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(today)
      day.setDate(today.getDate() - today.getDay() + i)
      return {
        date: day.toISOString().split("T")[0],
        vo2max: 0,
        heartRate: 0,
        duration: 0,
        calories: 0,
      }
    })
  }
}

/**
 * Get the week (Monday to Sunday) for a given date
 */
export function getWeekForDate(date: string): Date[] {
  try {
    const workoutDate = new Date(date)

    // Check if the date is valid
    if (isNaN(workoutDate.getTime())) {
      throw new Error(`Invalid date: ${date}`)
    }

    let dayOfWeek = workoutDate.getDay()
    if (dayOfWeek === 0) dayOfWeek = 7 // treat Sunday as 7

    const monday = new Date(workoutDate)
    monday.setDate(workoutDate.getDate() - (dayOfWeek - 1))

    // Generate an array representing each day of the week (Monday to Sunday)
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      return day
    })
  } catch (error) {
    console.error("Error in getWeekForDate:", error)
    // Return current week if there's an error
    const today = new Date()
    const currentDay = today.getDay() || 7 // Convert Sunday (0) to 7
    const monday = new Date(today)
    monday.setDate(today.getDate() - (currentDay - 1))

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      return day
    })
  }
}

/**
 * Find a workout for a specific date
 */
export function findWorkoutByDate(date: string, workoutHistory: WorkoutData[]): WorkoutData | undefined {
  return workoutHistory.find((w) => w.date === date)
}

/**
 * Get the most recent workout from history
 */
export function getMostRecentWorkout(workoutHistory: WorkoutData[]): WorkoutData | undefined {
  if (workoutHistory.length === 0) return undefined

  // Sort by date (newest first) and return the first item
  return [...workoutHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
}

/**
 * Generate sample task data for the roadmap
 */
export function generateSampleTasks(): TaskData[] {
  return [
    {
      title: "Morning Yoga Routine",
      day: "1",
      description: "Start your day with an energizing yoga session",
      warmup: {
        title: "Warm-up",
        content: "5 minutes of deep breathing exercises",
        purpose: "Prepares your body and mind for the yoga session, increases oxygen flow, and helps you focus.",
        tutorial:
          "Sit comfortably, close your eyes, and take slow, deep breaths. Inhale for 4 counts, hold for 4, exhale for 4, and repeat.",
      },
      workout: {
        title: "Workout",
        content: "20 minutes of sun salutations and standing poses",
        purpose: "Improves flexibility, builds strength, and enhances balance and coordination.",
        tutorial:
          "Start with 5 rounds of Sun Salutation A, followed by warrior poses, triangle pose, and tree pose. Hold each pose for 5 breaths.",
      },
      cooldown: {
        title: "Cool-down",
        content: "5 minutes of relaxation in savasana",
        purpose: "Allows your body to absorb the benefits of the practice, reduces stress, and promotes relaxation.",
        tutorial:
          "Lie on your back, close your eyes, and focus on relaxing each part of your body from toes to head. Stay here for 5 minutes.",
      },
      completed: false,
    },
    {
      title: "Cardio Blast",
      day: "2",
      description: "Get your heart pumping with this cardio workout",
      warmup: {
        title: "Warm-up",
        content: "5 minutes of light jogging",
        purpose: "Gradually increases heart rate and prepares muscles for more intense activity.",
        tutorial:
          "Start with a slow jog in place or around your space. Focus on maintaining a steady, comfortable pace for 5 minutes.",
      },
      workout: {
        title: "Workout",
        content: "20 minutes of high-intensity interval training",
        purpose: "Boosts cardiovascular fitness, burns calories, and improves overall endurance.",
        tutorial:
          "Alternate between 30 seconds of high-intensity exercises (like burpees, jump squats, or mountain climbers) and 30 seconds of rest. Repeat for 20 minutes.",
      },
      cooldown: {
        title: "Cool-down",
        content: "5 minutes of stretching",
        purpose: "Helps prevent muscle soreness, improves flexibility, and gradually brings heart rate back to normal.",
        tutorial:
          "Perform gentle stretches for major muscle groups, holding each stretch for 15-30 seconds. Focus on deep, steady breathing.",
      },
      completed: true,
    },
    {
      title: "Strength Training",
      day: "3",
      description: "Build muscle and increase strength",
      warmup: {
        title: "Warm-up",
        content: "5 minutes of dynamic stretches",
        purpose: "Increases blood flow to muscles, improves range of motion, and prepares the body for lifting.",
        tutorial: "Perform arm circles, leg swings, torso twists, and high knees for 5 minutes.",
      },
      workout: {
        title: "Workout",
        content: "30 minutes of weightlifting exercises",
        purpose: "Builds muscle mass, increases strength, and improves bone density.",
        tutorial:
          "Perform squats, deadlifts, bench press, and overhead press. Do 3 sets of 8-12 repetitions for each exercise.",
      },
      cooldown: {
        title: "Cool-down",
        content: "5 minutes of static stretches",
        purpose: "Reduces muscle soreness, improves flexibility, and promotes relaxation.",
        tutorial: "Hold stretches for major muscle groups for 30 seconds each. Focus on deep, steady breathing.",
      },
      completed: false,
    },
    {
      title: "Rest and Recovery",
      day: "4",
      description: "Give your body time to recover and rejuvenate",
      warmup: {
        title: "Gentle Movement",
        content: "10 minutes of gentle stretching",
        purpose: "Increases blood flow and reduces stiffness without straining the body.",
        tutorial:
          "Perform gentle neck rolls, shoulder stretches, and ankle rotations. Focus on slow, controlled movements.",
      },
      workout: {
        title: "Light Activity",
        content: "20 minutes of light walking or swimming",
        purpose: "Promotes circulation, reduces inflammation, and aids in muscle recovery.",
        tutorial: "Take a leisurely walk in a park or swim at a relaxed pace. Avoid pushing yourself too hard.",
      },
      cooldown: {
        title: "Mindful Relaxation",
        content: "10 minutes of meditation",
        purpose: "Reduces stress, promotes relaxation, and enhances mental clarity.",
        tutorial:
          "Find a quiet space, sit comfortably, and focus on your breath. Allow thoughts to come and go without judgment.",
      },
      completed: false,
    },
  ]
}

