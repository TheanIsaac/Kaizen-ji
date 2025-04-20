"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, LogIn } from "lucide-react"
import { HealthQuestionnaireModal } from "./health-questionnaire-modal"
import { UserIDModal } from "./user-id-modal"

interface NavigationBarDarkProps {
  userID?: string | null
  onUserIDChange?: (newUserID: string) => void
}

export function NavigationBarDark({ userID, onUserIDChange }: NavigationBarDarkProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleUserIdSubmit = (newUserId: string) => {
    if (onUserIDChange) {
      onUserIDChange(newUserId)
    }
    setIsLoginModalOpen(false)
  }

  return (
    <>
      <nav className="bg-[#121212] border-b border-[#333] fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-[#00FF85] neon-green">WHOOP</span>
              </Link>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link
                  href="#"
                  className="text-[#E0E0E0] hover:text-[#00BCD4] px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Products
                </Link>
                <Link
                  href="#"
                  className="text-[#E0E0E0] hover:text-[#00BCD4] px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Technology
                </Link>
                <Link
                  href="#"
                  className="text-[#E0E0E0] hover:text-[#00BCD4] px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Membership
                </Link>
                <Link
                  href="#"
                  className="text-[#E0E0E0] hover:text-[#00BCD4] px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Community
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setIsQuestionnaireOpen(true)}
                className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-[#121212] bg-[#00FF85] hover:bg-[#00E676] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00FF85] mr-4 transition-colors duration-200"
              >
                FREE HEALTH ROADMAP
              </button>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-[#E0E0E0] hover:text-[#00BCD4] px-3 py-2 text-sm font-medium hidden md:flex items-center transition-colors duration-200"
              >
                <LogIn className="w-4 h-4 mr-1" />
                {userID ? `User: ${userID.substring(0, 8)}...` : "Login"}
              </button>
              <Link
                href="#"
                className="hidden md:inline-flex items-center px-4 py-2 border border-[#00BCD4] text-sm font-medium rounded-full text-[#00BCD4] bg-transparent hover:bg-[#00BCD4]/10 transition-colors duration-200"
              >
                Join Now
              </Link>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-[#E0E0E0] hover:text-[#00BCD4] focus:outline-none transition-colors duration-200"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden bg-[#1A1A1A]`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="#"
              className="text-[#E0E0E0] hover:bg-[#252525] hover:text-[#00BCD4] block px-3 py-2 text-base font-medium transition-colors duration-200"
            >
              Products
            </Link>
            <Link
              href="#"
              className="text-[#E0E0E0] hover:bg-[#252525] hover:text-[#00BCD4] block px-3 py-2 text-base font-medium transition-colors duration-200"
            >
              Technology
            </Link>
            <Link
              href="#"
              className="text-[#E0E0E0] hover:bg-[#252525] hover:text-[#00BCD4] block px-3 py-2 text-base font-medium transition-colors duration-200"
            >
              Membership
            </Link>
            <Link
              href="#"
              className="text-[#E0E0E0] hover:bg-[#252525] hover:text-[#00BCD4] block px-3 py-2 text-base font-medium transition-colors duration-200"
            >
              Community
            </Link>
            <button
              onClick={() => {
                setIsQuestionnaireOpen(true)
                setIsMenuOpen(false)
              }}
              className="w-full text-left text-[#121212] bg-[#00FF85] hover:bg-[#00E676] block px-3 py-2 text-base font-medium transition-colors duration-200"
            >
              FREE HEALTH ROADMAP
            </button>
            <button
              onClick={() => {
                setIsLoginModalOpen(true)
                setIsMenuOpen(false)
              }}
              className="w-full text-left flex items-center text-[#E0E0E0] hover:bg-[#252525] hover:text-[#00BCD4] block px-3 py-2 text-base font-medium transition-colors duration-200"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {userID ? `User: ${userID.substring(0, 8)}...` : "Login"}
            </button>
            <Link
              href="#"
              className="text-[#E0E0E0] hover:bg-[#252525] hover:text-[#00BCD4] block px-3 py-2 text-base font-medium transition-colors duration-200"
            >
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      <HealthQuestionnaireModal isOpen={isQuestionnaireOpen} onClose={() => setIsQuestionnaireOpen(false)} />
      <UserIDModal
        isOpen={isLoginModalOpen}
        onSubmit={handleUserIdSubmit}
        onClose={() => setIsLoginModalOpen(false)}
        initialValue={userID || ""}
      />
    </>
  )
}

