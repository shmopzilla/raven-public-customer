"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface Instructor {
  id: string
  first_name: string
  last_name: string
}

interface DataInfoTooltipProps {
  instructors: Instructor[]
  selectedInstructorId: string
  bookingItemsCount: number
  error?: string | null
  loading?: boolean
}

export function DataInfoTooltip({
  instructors,
  selectedInstructorId,
  bookingItemsCount,
  error,
  loading = false
}: DataInfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedInstructor = instructors.find(inst => inst.id === selectedInstructorId)

  return (
    <div className="relative">
      {/* Info Icon Button */}
      <motion.button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="text-gray-300"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-1/2 right-full transform -translate-y-1/2 mr-2 w-80 z-50"
          >
            <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-lg p-4 shadow-xl">
              {/* Arrow pointing right */}
              <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-800/95 border-r border-b border-gray-600/50 rotate-45"></div>

              {/* Content */}
              <div className="space-y-3">
                <h4 className="text-white font-medium text-sm mb-3">Data Information</h4>

                {/* Loading State */}
                {loading && (
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                    <span>Loading data...</span>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded p-2">
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Error
                    </div>
                    <p className="mt-1 text-xs">{error}</p>
                  </div>
                )}

                {/* Data Details */}
                {!loading && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Selected Instructor:</span>
                      <span className="text-white">
                        {selectedInstructor
                          ? selectedInstructor.first_name
                          : 'None'
                        }
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Instructor ID:</span>
                      <span className="text-gray-300 font-mono text-xs">
                        {selectedInstructorId ? selectedInstructorId.substring(0, 8) + '...' : 'None'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Booking Items:</span>
                      <span className="text-white">{bookingItemsCount} found</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Instructors:</span>
                      <span className="text-white">{instructors.length}</span>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-600/30">
                      <div className={`w-2 h-2 rounded-full ${
                        error ? 'bg-red-400' :
                        loading ? 'bg-yellow-400' :
                        bookingItemsCount > 0 ? 'bg-green-400' : 'bg-gray-400'
                      }`}></div>
                      <span className="text-xs text-gray-400">
                        {error ? 'Error occurred' :
                         loading ? 'Loading...' :
                         bookingItemsCount > 0 ? 'Data loaded' : 'No data found'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}