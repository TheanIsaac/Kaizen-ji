"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

type QuestionnaireStep = {
  title: string
  questions: {
    id: string
    question: string
    type: "radio" | "checkbox" | "text" | "select"
    options?: string[]
    required?: boolean
  }[]
}

// Add a new first step for User ID input
const QUESTIONNAIRE_STEPS: QuestionnaireStep[] = [
  {
    title: "Let's Start with Your ID",
    questions: [
      {
        id: "userID",
        question: "Please enter your User ID to access your personalized plan",
        type: "text",
        required: true,
      },
    ],
  },
  {
    title: "What Is Your Age",
    questions: [
      {
        id: "age",
        question: "",
        type: "radio",
        options: ["Under 18", "18-25", "25-30", "30-40", "50-60", "60+"],
      },
    ],
  },
  {
    title: "Your Current Activity",
    questions: [
      {
        id: "current_activity",
        question: "How would you describe your current activity level?",
        type: "radio",
        options: [
          "Sedentary (little to no exercise)",
          "Lightly active (light exercise 1-3 days/week)",
          "Moderately active (moderate exercise 3-5 days/week)",
          "Very active (hard exercise 6-7 days/week)",
          "Extremely active (very hard exercise & physical job or training twice/day)",
        ],
      },
      {
        id: "activities",
        question: "What activities do you currently enjoy? (Select all that apply)",
        type: "checkbox",
        options: [
          "Walking",
          "Running",
          "Cycling",
          "Swimming",
          "Weight training",
          "Yoga/Pilates",
          "Team sports",
          "HIIT/CrossFit",
          "Other",
        ],
      },
    ],
  },
  {
    title: "Your Health Metrics",
    questions: [
      {
        id: "track_metrics",
        question: "Which health metrics do you currently track? (Select all that apply)",
        type: "checkbox",
        options: [
          "Heart rate",
          "Sleep",
          "Steps",
          "Calories",
          "Weight",
          "Blood pressure",
          "Stress levels",
          "None of the above",
        ],
      },
      {
        id: "sleep_quality",
        question: "How would you rate your sleep quality?",
        type: "radio",
        options: ["Excellent", "Good", "Fair", "Poor", "Very poor"],
      },
    ],
  },
  {
    title: "What Is Your Health Goal",
    questions: [
      {
        id: "Goal",
        question: "Examples: I want to run the Boston marathon.",
        type: "text",
      },
    ],
  },
  {
    title: "Do You Currently Work At Whoop",
    questions: [
      {
        id: "whoop",
        question: "",
        type: "radio",
        options: ["Yes", "No"],
      },
    ],
  },
]

interface HealthQuestionnaireModalProps {
  isOpen: boolean
  onClose: () => void
  resetData?: boolean
  userId?: string | null
}

export function HealthQuestionnaireModal({
  isOpen,
  onClose,
  resetData = false,
  userId = null,
}: HealthQuestionnaireModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Initialize answers with userId if provided
  useEffect(() => {
    if (userId) {
      setAnswers((prev) => ({
        ...prev,
        userID: userId,
      }))
      // If we have a userId, we can skip the first step
      if (currentStep === 0) {
        setCurrentStep(1)
      }
    }
  }, [userId, currentStep])

  useEffect(() => {
    if (resetData && userId) {
      setCurrentStep(1) // Skip user ID step if we already have it
      setAnswers((prev) => ({
        ...prev,
        userID: userId,
      }))
      console.log("Health questionnaire reset for user:", userId)
    }
  }, [resetData, userId])

  useEffect(() => {
    const handleResetQuestionnaire = (event: CustomEvent) => {
      if (event.detail && event.detail.userId) {
        setCurrentStep(1)
        setAnswers((prev) => ({
          ...prev,
          userID: event.detail.userId,
        }))
        console.log("Health questionnaire reset via event for user:", event.detail.userId)
      }
    }

    window.addEventListener("resetQuestionnaire", handleResetQuestionnaire as EventListener)

    return () => {
      window.removeEventListener("resetQuestionnaire", handleResetQuestionnaire as EventListener)
    }
  }, [])

  if (!isOpen) return null

  const handleInputChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))

    // Clear validation error for this field if it exists
    if (validationErrors[questionId]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const validateStep = () => {
    const currentQuestions = QUESTIONNAIRE_STEPS[currentStep].questions
    const errors: Record<string, string> = {}

    currentQuestions.forEach((question) => {
      if (question.required) {
        const answer = answers[question.id]
        if (!answer || (Array.isArray(answer) && answer.length === 0) || answer === "") {
          errors[question.id] = "This field is required"
        }
      }

      // Special validation for userID field
      if (question.id === "userID" && (!answers.userID || answers.userID.trim() === "")) {
        errors.userID = "Please enter your User ID"
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get the user ID from the answers
      const userIDFromAnswers = answers.userID

      // Save to localStorage
      if (typeof window !== "undefined" && userIDFromAnswers) {
        localStorage.setItem("userID", userIDFromAnswers)

        // Dispatch user ID changed event
        const event = new CustomEvent("userIDChanged", {
          detail: userIDFromAnswers,
          bubbles: true,
        })
        window.dispatchEvent(event)
      }

      const response = await fetch("https://j3g2wfs5yg.execute-api.us-east-1.amazonaws.com/test/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID: userIDFromAnswers, answers }),
      })

      if (!response.ok) {
        throw new Error(`Submission failed: ${response.status} ${response.statusText}`)
      }
      console.log("Form submitted successfully with answers:", answers)
      setSubmitted(true)

      // Dispatch an event to trigger task generation
      if (typeof window !== "undefined") {
        const event = new CustomEvent("healthQuestionnaireSubmitted", {
          bubbles: true,
        })
        window.dispatchEvent(event)
      }
    } catch (err) {
      console.error("Submission error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (!validateStep()) {
      return // Don't proceed if validation fails
    }

    if (currentStep === 0) {
      // If we're moving from the User ID step, save to localStorage
      const userIDValue = answers.userID
      if (typeof window !== "undefined" && userIDValue) {
        localStorage.setItem("userID", userIDValue)
      }
    }

    if (currentStep < QUESTIONNAIRE_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentStepData = QUESTIONNAIRE_STEPS[currentStep]
  const isLastStep = currentStep === QUESTIONNAIRE_STEPS.length - 1
  const isFirstStep = currentStep === 0

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={!isFirstStep ? onClose : undefined}
        ></div>

        <div className="inline-block w-full max-w-md px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-black rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          {!isFirstStep && ( // Only show close button if not on first step
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                className="text-white-400 bg-white rounded-md hover:text-white-500 focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
          )}

          {submitted ? (
            // ...existing submitted state UI...
            <div className="text-center">
              <h3 className="text-lg font-medium leading-6 text-white">Thank You!</h3>
              <div className="mt-2">
                <p className="text-sm text-white-500">Your personalized roadmap is being generated...</p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-green-500 border border-transparent rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium leading-6 text-white">{currentStepData.title}</h3>

                  {/* Step indicator */}
                  {!isFirstStep && (
                    <span className="text-sm text-gray-400">
                      Step {currentStep}/{QUESTIONNAIRE_STEPS.length - 1}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  {currentStepData.questions.map((q) => (
                    <div key={q.id} className="mb-6">
                      <label className="block text-sm font-light text-white mb-2">
                        {q.question}
                        {q.required && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      {q.type === "text" && (
                        <>
                          <input
                            type="text"
                            id={q.id}
                            className={`block w-full px-3 py-2 border ${validationErrors[q.id] ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-black`}
                            value={answers[q.id] || ""}
                            onChange={(e) => handleInputChange(q.id, e.target.value)}
                          />
                          {validationErrors[q.id] && (
                            <p className="mt-1 text-sm text-red-500">{validationErrors[q.id]}</p>
                          )}
                        </>
                      )}

                      {q.type === "radio" && q.options && (
                        <div className="space-y-2">
                          {q.options.map((option) => (
                            <div key={option} className="flex items-center">
                              <input
                                id={`${q.id}-${option}`}
                                name={q.id}
                                type="radio"
                                className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                                checked={answers[q.id] === option}
                                onChange={() => handleInputChange(q.id, option)}
                              />
                              <label htmlFor={`${q.id}-${option}`} className="ml-3 block text-sm text-white">
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === "checkbox" && q.options && (
                        <div className="space-y-2">
                          {q.options.map((option) => (
                            <div key={option} className="flex items-center">
                              <input
                                id={`${q.id}-${option}`}
                                name={`${q.id}-${option}`}
                                type="checkbox"
                                className="h-4 w-4 text-white border-gray-300 rounded focus:ring-green-500"
                                checked={Array.isArray(answers[q.id]) && answers[q.id]?.includes(option)}
                                onChange={() => {
                                  const currentValues = Array.isArray(answers[q.id]) ? [...answers[q.id]] : []
                                  const newValues = currentValues.includes(option)
                                    ? currentValues.filter((v) => v !== option)
                                    : [...currentValues, option]
                                  handleInputChange(q.id, newValues)
                                }}
                              />
                              <label htmlFor={`${q.id}-${option}`} className="ml-3 block text-sm text-white">
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === "select" && q.options && (
                        <select
                          id={q.id}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          value={answers[q.id] || ""}
                          onChange={(e) => handleInputChange(q.id, e.target.value)}
                        >
                          <option value="">Select an option</option>
                          {q.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                {currentStep > 0 && (
                  <button
                    type="button"
                    className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-black bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={handlePrevious}
                  >
                    Previous
                  </button>
                )}
                <button
                  type="button"
                  className={`inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-green-500 border border-transparent rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm ${
                    currentStep === 0 && !userId ? "sm:col-span-2" : ""
                  }`}
                  onClick={handleNext}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : isLastStep ? "Submit" : "Next"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

