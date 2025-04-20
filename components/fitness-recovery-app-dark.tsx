"use client"

import { useState, useEffect } from "react"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Home,
  Info,
  LineChart,
  Plus,
  Share2,
  Users,
} from "lucide-react"
import { NavigationBarDark } from "./navigation-bar-dark"
import { DashboardDark } from "./dashboard-dark"
import { UserIDModal } from "./user-id-modal"
import { loadFromLocalStorage, saveToLocalStorage, clearTaskData } from "@/lib/localStorage-utils"
import { DashboardPointer } from "./dashboard-pointer"

export default function FitnessRecoveryAppDark() {
  const [expandedSection, setExpandedSection] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<"home" | "dashboard">("home")

  // Add global userID state - use empty string as default for string type
  const [userID, setUserID] = useState<string>(() => {
    return loadFromLocalStorage<string>("userID", "")
  })

  // Add state for controlling the modal visibility
  const [showUserIdModal, setShowUserIdModal] = useState<boolean>(false)

  // Check if userID exists on component mount
  useEffect(() => {
    if (!userID) {
      setShowUserIdModal(true)
    }
  }, [userID])

  // Handle userID submission
  const handleUserIdSubmit = (newUserId: string) => {
    // If the userID is changing, clear task data
    if (userID !== newUserId) {
      clearTaskData()
    }

    setUserID(newUserId)
    saveToLocalStorage("userID", newUserId)
    setShowUserIdModal(false)

    // If user is on dashboard tab, this will trigger a refresh of the data
    if (activeTab === "dashboard") {
      // Force a re-render by toggling the tab
      setActiveTab("home")
      setTimeout(() => {
        setActiveTab("dashboard")
      }, 50)
    }
  }

  const toggleSection = (sectionNumber: number) => {
    if (expandedSection === sectionNumber) {
      setExpandedSection(0)
    } else {
      setExpandedSection(sectionNumber)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#121212]">
      <NavigationBarDark userID={userID} onUserIDChange={handleUserIdSubmit} />

      {/* Tab Navigation */}
      <div className="border-b border-[#333] pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "home"
                  ? "border-[#00FF85] text-[#00FF85]"
                  : "border-transparent text-[#BDBDBD] hover:text-[#E0E0E0] hover:border-[#333]"
              } transition-colors duration-200`}
              onClick={() => setActiveTab("home")}
            >
              Home
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "dashboard"
                  ? "border-[#00FF85] text-[#00FF85]"
                  : "border-transparent text-[#BDBDBD] hover:text-[#E0E0E0] hover:border-[#333]"
              } transition-colors duration-200`}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "home" && (
        <>
          <div className="flex flex-col lg:flex-row min-h-screen bg-[#121212]">
            {/* Left side - Information */}
            <div className="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-12 text-[#E0E0E0]">
                Your personal fuel gauge
              </h1>

              <div className="space-y-4 flex-grow">
                {/* Section 01 */}
                <div className="border-b border-[#333] pb-4">
                  <button className="w-full flex justify-between items-center py-4" onClick={() => toggleSection(1)}>
                    <h2 className="text-xl md:text-2xl font-bold text-[#E0E0E0]">
                      <span className="font-bold mr-2 text-[#00BCD4]">01</span> How we calculate recovery
                    </h2>
                    {expandedSection === 1 ? (
                      <ChevronUp className="h-6 w-6 text-[#00BCD4]" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-[#00BCD4]" />
                    )}
                  </button>

                  {expandedSection === 1 && (
                    <div className="py-4 text-base md:text-lg space-y-4 animate-fade-in">
                      <p className="text-[#BDBDBD]">
                        WHOOP calculates your recovery on a scale of 0 to 100% during your sleep, looking at your heart
                        rate variability (HRV), resting heart rate, respiratory rate, SpO2, sleep performance, and skin
                        temperature to see how your body is adapting to physiological and psychological stress.
                      </p>
                      <p className="text-[#BDBDBD]">
                        The biggest influence is by far your HRV but it also considers your health, behaviors, stress
                        levels, hydration, and more.
                      </p>
                    </div>
                  )}
                </div>

                {/* Section 02 */}
                <div className="border-b border-[#333] pb-4">
                  <button className="w-full flex justify-between items-center py-4" onClick={() => toggleSection(2)}>
                    <h2 className="text-xl md:text-2xl font-bold text-[#E0E0E0]">
                      <span className="font-bold mr-2 text-[#00BCD4]">02</span> Know your body's readiness
                    </h2>
                    {expandedSection === 2 ? (
                      <ChevronUp className="h-6 w-6 text-[#00BCD4]" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-[#00BCD4]" />
                    )}
                  </button>

                  {expandedSection === 2 && (
                    <div className="py-4 text-base md:text-lg animate-fade-in">
                      <p className="text-[#BDBDBD]">
                        Your recovery score is a personalized daily metric that indicates how ready your body is to
                        perform. A high recovery (green) means your body is primed for peak performance, while a low
                        recovery (red) suggests you might need more rest.
                      </p>
                    </div>
                  )}
                </div>

                {/* Section 03 */}
                <div className="border-b border-[#333] pb-4">
                  <button className="w-full flex justify-between items-center py-4" onClick={() => toggleSection(3)}>
                    <h2 className="text-xl md:text-2xl font-bold text-[#E0E0E0]">
                      <span className="font-bold mr-2 text-[#00BCD4]">03</span> See trends over time
                    </h2>
                    {expandedSection === 3 ? (
                      <ChevronUp className="h-6 w-6 text-[#00BCD4]" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-[#00BCD4]" />
                    )}
                  </button>

                  {expandedSection === 3 && (
                    <div className="py-4 text-base md:text-lg animate-fade-in">
                      <p className="text-[#BDBDBD]">
                        Track your performance metrics over time to identify patterns and optimize your training.
                        WHOOP's analytics help you understand how your body responds to different workouts, recovery
                        strategies, and lifestyle choices.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-center lg:justify-start">
                <button
                  className="bg-[#00FF85] text-[#121212] rounded-full px-8 py-4 text-lg font-medium hover:bg-[#00E676] transition-colors duration-200"
                  onClick={() => setActiveTab("dashboard")}
                >
                  GO TO DASHBOARD
                </button>
              </div>
            </div>

            {/* Right side - App mockup */}
            <div className="w-full lg:w-1/2 p-6 lg:p-12 flex items-center justify-center">
              <div className="relative w-full max-w-[320px] aspect-[9/19] rounded-[40px] bg-[#121212] overflow-hidden border-8 border-black shadow-xl">
                {/* Status bar */}
                <div className="flex justify-between items-center px-5 py-2 text-[#E0E0E0] text-xs">
                  <div>9:41</div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-[#E0E0E0]"></div>
                    <div className="h-3 w-3 rounded-full bg-[#E0E0E0]"></div>
                    <div className="h-3 w-3 rounded-full bg-[#E0E0E0]"></div>
                    <div>
                      44% <span className="inline-block w-3 h-4 ml-1 bg-[#00FF85] rounded-sm"></span>
                    </div>
                  </div>
                </div>

                {/* App header */}
                <div className="flex justify-between items-center px-5 py-3">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-[#E0E0E0] text-xs">
                    W
                  </div>
                  <div className="flex items-center gap-4">
                    <ChevronLeft className="w-5 h-5 text-[#E0E0E0]" />
                    <span className="text-[#E0E0E0] font-medium">TODAY</span>
                    <ChevronRight className="w-5 h-5 text-[#E0E0E0]" />
                  </div>
                  <div className="w-8 h-8 rounded-full border border-[#00FF85] flex items-center justify-center text-[#E0E0E0] text-xs">
                    <span className="text-[#00FF85]">44%</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-between px-5 border-b border-[#333]">
                  <button className="py-3 text-[#999] text-xs">OVERVIEW</button>
                  <button className="py-3 text-[#999] text-xs">SLEEP</button>
                  <button className="py-3 text-[#00FF85] text-xs border-b-2 border-[#00FF85]">RECOVERY</button>
                  <button className="py-3 text-[#999] text-xs">STRAIN</button>
                </div>

                {/* Recovery gauge */}
                <div className="relative flex flex-col items-center justify-center py-8">
                  <div className="relative w-48 h-48">
                    {/* Background circle */}
                    <div className="absolute inset-0 rounded-full border-8 border-[#333] opacity-30"></div>

                    {/* Progress circle */}
                    <div
                      className="absolute inset-0 rounded-full border-8 border-transparent"
                      style={{
                        borderTopColor: "#00FF85",
                        borderRightColor: "#00FF85",
                        transform: "rotate(45deg)",
                        clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%, 50% 50%)",
                      }}
                    ></div>

                    {/* Info button */}
                    <div className="absolute top-0 right-0 translate-x-4 -translate-y-4">
                      <Info className="w-5 h-5 text-[#999]" />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-xs text-[#E0E0E0] mb-1">RECOVERY</div>
                      <div className="text-6xl font-bold text-[#E0E0E0]">
                        74<span className="text-3xl">%</span>
                      </div>
                      <button className="mt-2 flex items-center text-xs text-[#999]">
                        <Share2 className="w-4 h-4 mr-1" /> SHARE
                      </button>
                    </div>
                  </div>
                </div>

                {/* HRV Status */}
                <div className="px-5 py-3 bg-[#1A1A1A] mx-5 rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-[#E0E0E0] text-[8px]">
                      W
                    </div>
                    <span className="text-[#E0E0E0] text-xs font-medium">ELEVATED HRV</span>
                  </div>
                  <p className="text-[#999] text-[10px] leading-tight">
                    Your HRV is 20% higher than usual. A high HRV indicates your nervous system is ready to handle
                    stress, your body is in balance, and you are ready to take on strain.
                  </p>
                </div>

                {/* Recovery Statistics */}
                <div className="px-5">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-xs text-[#999]">RECOVERY STATISTICS</div>
                    <div className="text-xs text-[#999]">VS. PREVIOUS 30 DAYS</div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <LineChart className="w-4 h-4 text-[#999]" />
                      <span className="text-xs text-[#999]">HRV</span>
                    </div>
                    <div className="flex-grow h-1 bg-[#333] rounded-full"></div>
                    <div className="text-[#E0E0E0] font-medium">108</div>
                  </div>
                </div>

                {/* Add button */}
                <div className="absolute bottom-16 right-5">
                  <button className="w-12 h-12 rounded-full bg-[#00FF85] flex items-center justify-center shadow-lg hover:bg-[#00E676] transition-colors duration-200">
                    <Plus className="w-6 h-6 text-[#121212]" />
                  </button>
                </div>

                {/* Bottom navigation */}
                <div className="absolute bottom-0 inset-x-0 flex justify-between items-center px-8 py-3 border-t border-[#333]">
                  <button className="flex flex-col items-center">
                    <Home className="w-5 h-5 text-[#E0E0E0]" />
                    <span className="text-[10px] text-[#E0E0E0] mt-1">Home</span>
                  </button>
                  <button className="flex flex-col items-center">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-3 h-4 border border-[#999] rounded-sm"></div>
                    </div>
                    <span className="text-[10px] text-[#999] mt-1">Coaching</span>
                  </button>
                  <button className="flex flex-col items-center">
                    <Users className="w-5 h-5 text-[#999]" />
                    <span className="text-[10px] text-[#999] mt-1">Community</span>
                  </button>
                  <button className="flex flex-col items-center">
                    <div className="flex flex-col items-center justify-center w-5 h-5">
                      <div className="w-4 h-[2px] bg-[#999] mb-[2px]"></div>
                      <div className="w-4 h-[2px] bg-[#999] mb-[2px]"></div>
                      <div className="w-4 h-[2px] bg-[#999]"></div>
                    </div>
                    <span className="text-[10px] text-[#999] mt-1">More</span>
                  </button>
                </div>

                {/* Bottom indicator */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-[#E0E0E0] rounded-full"></div>
              </div>
            </div>
          </div>
          <DashboardPointer onClick={() => setActiveTab("dashboard")} />
        </>
      )}

      {activeTab === "dashboard" && <DashboardDark initialUserID={userID} onUserIDChange={handleUserIdSubmit} />}

      {/* Global UserID Modal */}
      <UserIDModal
        isOpen={showUserIdModal}
        onSubmit={handleUserIdSubmit}
        onClose={() => (userID ? setShowUserIdModal(false) : null)}
        initialValue={userID || ""}
      />
    </div>
  )
}

