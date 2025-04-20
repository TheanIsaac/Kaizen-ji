"\"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { type WorkoutData, getWorkoutDataForWeek } from "../models/workout-model"
import { ActivityRing } from "./activity-ring"

interface AnalysisDashboardProps {
  selectedWorkout?: WorkoutData
  workoutHistory: WorkoutData[]
}

// Metric Chart component
const MetricChart: React.FC<{
  data: WorkoutData[]
  metric: keyof WorkoutData
  color: string
  label: string
  unit: string
  selectedDate?: string
}> = ({ data, metric, color, label, unit, selectedDate }) => {
  const chartRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove()

    // Set up dimensions
    const margin = { top: 20, right: 20, bottom: 30, left: 40 }
    const width = 300 - margin.left - margin.right
    const height = 150 - margin.top - margin.bottom

    // Create SVG
    const svg = d3
      .select(chartRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Set up scales
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.date))
      .range([0, width])
      .padding(0.2)

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[metric] as number) || 0])
      .nice()
      .range([height, 0])

    // Add x-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(x).tickFormat((d) => {
          const date = new Date(d as string)
          return date.getDate().toString()
        }),
      )
      .selectAll("text")
      .attr("font-size", "8px")
      .attr("fill", "#E0E0E0")

    // Add y-axis
    svg.append("g").call(d3.axisLeft(y).ticks(5)).selectAll("text").attr("font-size", "8px").attr("fill", "#E0E0E0")

    // Add bars
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.date) || 0)
      .attr("y", (d) => y(d[metric] as number))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d[metric] as number))
      .attr("fill", (d) => (d.date === selectedDate ? color : `${color}80`))
      .attr("rx", 2)
  }, [data, metric, color, selectedDate])

  return (
    <div className="bg-[#1A1A1A] p-4 rounded-lg shadow border border-[#333]">
      <div className="flex items-center mb-2">
        <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color }}></div>
        <h3 className="text-sm font-medium text-[#E0E0E0]">{label}</h3>
      </div>
      <svg ref={chartRef}></svg>
    </div>
  )
}

export const AnalysisDashboardDark: React.FC<AnalysisDashboardProps> = ({ selectedWorkout, workoutHistory }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "vo2max" | "heartRate" | "duration">("overview")

  // If no selected workout and no workout history, show a message
  if (!selectedWorkout && (!workoutHistory || workoutHistory.length === 0)) {
    return (
      <div className="bg-[#1A1A1A] rounded-lg shadow-lg p-6 text-center border border-[#333]">
        <h3 className="text-lg font-semibold mb-4 text-[#E0E0E0]">No Workout Data Available</h3>
        <p className="text-[#BDBDBD]">Complete a workout task from your roadmap to see your analysis here.</p>
      </div>
    )
  }

  // If no selected workout, use the most recent one
  const workout = selectedWorkout || workoutHistory[workoutHistory.length - 1]

  // Get the week data using our model function
  const last7Days = workout ? getWorkoutDataForWeek(workout.date, workoutHistory) : []

  return (
    <div className="bg-[#1A1A1A] rounded-lg shadow-lg p-6 border border-[#333]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left side - Activity rings */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-[#E0E0E0]">Today's Metrics</h3>
          <div className="flex flex-col items-center space-y-6">
            <ActivityRing value={workout.vo2max} maxValue={60} color="#8b5cf6" label="VO2 Max" metric="ml" />
            <ActivityRing value={workout.heartRate} maxValue={200} color="#ef4444" label="Heart Rate" metric="bpm" />
            <ActivityRing value={workout.duration} maxValue={60} color="#10b981" label="Duration" metric="min" />
          </div>

          <div className="mt-6 pt-6 border-t border-[#333]">
            <h4 className="text-sm font-medium mb-2 text-[#E0E0E0]">Workout Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#BDBDBD]">Date:</span>
                <span className="text-[#E0E0E0]">{new Date(workout.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#BDBDBD]">Calories:</span>
                <span className="text-[#E0E0E0]">{workout.calories} kcal</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#BDBDBD]">Recovery Score:</span>
                <span className="text-[#00FF85] font-medium">74%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Charts */}
        <div className="lg:col-span-3">
          <div className="flex mb-4 border-b border-[#333]">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "overview" ? "border-b-2 border-[#00FF85] text-[#00FF85]" : "text-[#BDBDBD]"
              } transition-colors duration-200`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "vo2max" ? "border-b-2 border-[#00FF85] text-[#00FF85]" : "text-[#BDBDBD]"
              } transition-colors duration-200`}
              onClick={() => setActiveTab("vo2max")}
            >
              VO2 Max
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "heartRate" ? "border-b-2 border-[#00FF85] text-[#00FF85]" : "text-[#BDBDBD]"
              } transition-colors duration-200`}
              onClick={() => setActiveTab("heartRate")}
            >
              Heart Rate
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "duration" ? "border-b-2 border-[#00FF85] text-[#00FF85]" : "text-[#BDBDBD]"
              } transition-colors duration-200`}
              onClick={() => setActiveTab("duration")}
            >
              Duration
            </button>
          </div>

          {/* Charts based on active tab */}
          <div className="space-y-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricChart
                  data={last7Days}
                  metric="vo2max"
                  color="#8b5cf6"
                  label="VO2 Max"
                  unit="ml"
                  selectedDate={workout.date}
                />
                <MetricChart
                  data={last7Days}
                  metric="heartRate"
                  color="#ef4444"
                  label="Heart Rate"
                  unit="bpm"
                  selectedDate={workout.date}
                />
                <MetricChart
                  data={last7Days}
                  metric="duration"
                  color="#10b981"
                  label="Duration"
                  unit="min"
                  selectedDate={workout.date}
                />
                <MetricChart
                  data={last7Days}
                  metric="calories"
                  color="#f59e0b"
                  label="Calories"
                  unit="kcal"
                  selectedDate={workout.date}
                />
              </div>
            )}

            {activeTab === "vo2max" && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-[#E0E0E0]">VO2 Max Trend</h3>
                <p className="text-sm text-[#BDBDBD] mb-4">
                  VO2 max is the maximum rate of oxygen consumption measured during exercise. Higher values indicate
                  better cardiovascular fitness.
                </p>
                <MetricChart
                  data={last7Days}
                  metric="vo2max"
                  color="#8b5cf6"
                  label="VO2 Max"
                  unit="ml"
                  selectedDate={workout.date}
                />
              </div>
            )}

            {activeTab === "heartRate" && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-[#E0E0E0]">Heart Rate Analysis</h3>
                <p className="text-sm text-[#BDBDBD] mb-4">
                  Average heart rate during your workout. A lower resting heart rate generally indicates better
                  cardiovascular fitness.
                </p>
                <MetricChart
                  data={last7Days}
                  metric="heartRate"
                  color="#ef4444"
                  label="Heart Rate"
                  unit="bpm"
                  selectedDate={workout.date}
                />
              </div>
            )}

            {activeTab === "duration" && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-[#E0E0E0]">Workout Duration</h3>
                <p className="text-sm text-[#BDBDBD] mb-4">
                  Total time spent working out. Consistent workout durations help establish a routine.
                </p>
                <MetricChart
                  data={last7Days}
                  metric="duration"
                  color="#10b981"
                  label="Duration"
                  unit="min"
                  selectedDate={workout.date}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

