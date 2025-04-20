import type { WorkoutData, TaskData } from "../models/workout-model"

// Sample workout data generation
export function generateSampleWorkoutData(): WorkoutData[] {
  const workoutData: WorkoutData[] = []

  // Generate dates for the last 30 days
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 30)

  // Helper to format date as YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split("T")[0]

  // Generate random workout data
  const currentDate = new Date(startDate)

  while (currentDate <= today) {
    // Skip some days to simulate rest days (about 30% of days)
    if (Math.random() > 0.3) {
      workoutData.push({
        date: formatDate(currentDate),
        vo2max: Math.floor(Math.random() * 10) + 40, // 40-50
        heartRate: Math.floor(Math.random() * 30) + 130, // 130-160
        duration: Math.floor(Math.random() * 30) + 20, // 20-50 minutes
        calories: Math.floor(Math.random() * 300) + 200, // 200-500 calories
      })
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return workoutData.sort((a, b) => a.date.localeCompare(b.date))
}

// Sample task data generation
export function generateSampleTaskMap(): Record<string, TaskData[]> {
  const taskMap: Record<string, TaskData[]> = {}

  // Generate dates for the last year
  const today = new Date()
  const startDate = new Date(today)
  startDate.setFullYear(today.getFullYear() - 1)

  // Helper to format date as YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split("T")[0]

  // Sample task templates
  const taskTemplates = [
    {
      title: "Morning Yoga Routine",
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
    },
    {
      title: "Cardio Blast",
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
    },
    {
      title: "Strength Training",
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
    },
  ]

  // Generate random tasks for some dates
  const currentDate = new Date(startDate)
  let dayCounter = 1

  while (currentDate <= today) {
    const dateStr = formatDate(currentDate)

    // Add 0-3 tasks for this date (with higher probability on weekdays)
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6
    const taskCount = isWeekend
      ? Math.floor(Math.random() * 2) // 0-1 tasks on weekends
      : Math.floor(Math.random() * 3) // 0-2 tasks on weekdays

    if (taskCount > 0) {
      taskMap[dateStr] = []

      for (let i = 0; i < taskCount; i++) {
        // Pick a random task template
        const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)]

        // Create a task with a random completion status
        // More recent tasks are less likely to be completed
        const daysAgo = Math.floor((today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
        const completionProbability = daysAgo > 30 ? 0.8 : 0.5

        taskMap[dateStr].push({
          ...template,
          day: dayCounter.toString(),
          completed: Math.random() < completionProbability,
        })

        dayCounter++
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return taskMap
}

