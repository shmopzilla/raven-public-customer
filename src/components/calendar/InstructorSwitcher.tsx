"use client"

import { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface Instructor {
  id: string
  first_name: string
  last_name: string
}

interface InstructorSwitcherProps {
  instructors: Instructor[]
  selectedInstructorId: string
  onInstructorChange: (instructorId: string) => void
  loading?: boolean
  compact?: boolean
}

export function InstructorSwitcher({
  instructors,
  selectedInstructorId,
  onInstructorChange,
  loading = false,
  compact = false
}: InstructorSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedInstructor = instructors.find(inst => inst.id === selectedInstructorId)

  const handleInstructorSelect = (instructor: Instructor) => {
    onInstructorChange(instructor.id)
    setIsOpen(false)
  }

  return (
    <div className={cn("relative", compact ? "w-64" : "w-80")}>
      {!compact && (
        <label className="block text-gray-400 text-sm mb-2">
          Select Instructor
        </label>
      )}

      {/* Dropdown Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-gray-800/50 border border-gray-700 rounded-lg text-white flex items-center justify-between hover:bg-gray-800/70 transition-colors",
          compact ? "px-3 py-2" : "px-4 py-3",
          loading && "opacity-50 cursor-not-allowed"
        )}
        disabled={loading}
        whileHover={!loading ? { scale: 1.01 } : {}}
        whileTap={!loading ? { scale: 0.99 } : {}}
      >
        <span className="text-left">
          {selectedInstructor ?
            selectedInstructor.first_name :
            'Select an instructor'
          }
        </span>

        {loading ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
        ) : (
          <svg
            className={cn("w-5 h-5 transition-transform", isOpen && "rotate-180")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </motion.button>

      {/* Dropdown Menu */}
      {isOpen && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl z-50 max-h-64 overflow-y-auto"
        >
          {instructors.length === 0 ? (
            <div className="px-4 py-3 text-gray-400 text-sm">
              No instructors found
            </div>
          ) : (
            instructors.map((instructor) => (
              <motion.button
                key={instructor.id}
                onClick={() => handleInstructorSelect(instructor)}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center justify-between",
                  instructor.id === selectedInstructorId && "bg-gray-700/50"
                )}
                whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.7)" }}
              >
                <span className="text-white">
                  {instructor.first_name}
                </span>

                {instructor.id === selectedInstructorId && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                )}
              </motion.button>
            ))
          )}
        </motion.div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}