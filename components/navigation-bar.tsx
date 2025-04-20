"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { HealthQuestionnaireModal } from "./health-questionnaire-modal"

export function NavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false)

  return (
    <>
      <nav className="bg-white border-b border-gray-200 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-black">WHOOP</span>
              </Link>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link href="#" className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium">
                  Products
                </Link>
                <Link href="#" className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium">
                  Technology
                </Link>
                <Link href="#" className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium">
                  Membership
                </Link>
                <Link href="#" className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium">
                  Community
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setIsQuestionnaireOpen(true)}
                className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-4"
              >
                FREE HEALTH ROADMAP
              </button>
              <Link
                href="#"
                className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium hidden md:block"
              >
                Login
              </Link>
              <Link
                href="#"
                className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-black bg-white hover:bg-gray-100 border-black"
              >
                Join Now
              </Link>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-900 hover:text-gray-600 focus:outline-none"
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
        <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link href="#" className="text-gray-900 hover:bg-gray-50 block px-3 py-2 text-base font-medium">
              Products
            </Link>
            <Link href="#" className="text-gray-900 hover:bg-gray-50 block px-3 py-2 text-base font-medium">
              Technology
            </Link>
            <Link href="#" className="text-gray-900 hover:bg-gray-50 block px-3 py-2 text-base font-medium">
              Membership
            </Link>
            <Link href="#" className="text-gray-900 hover:bg-gray-50 block px-3 py-2 text-base font-medium">
              Community
            </Link>
            <button
              onClick={() => {
                setIsQuestionnaireOpen(true)
                setIsMenuOpen(false)
              }}
              className="w-full text-left text-white bg-green-500 hover:bg-green-600 block px-3 py-2 text-base font-medium"
            >
              FREE HEALTH ROADMAP
            </button>
            <Link href="#" className="text-gray-900 hover:bg-gray-50 block px-3 py-2 text-base font-medium">
              Login
            </Link>
            <Link href="#" className="text-gray-900 hover:bg-gray-50 block px-3 py-2 text-base font-medium">
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      <HealthQuestionnaireModal isOpen={isQuestionnaireOpen} onClose={() => setIsQuestionnaireOpen(false)} />
    </>
  )
}

