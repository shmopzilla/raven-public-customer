"use client"

import { motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import type { InstructorWithAvailability } from '@/lib/analytics/types'

interface InstructorDropdownProps {
  instructors: InstructorWithAvailability[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  isLoading?: boolean
}

export function InstructorDropdown({
  instructors,
  selectedId,
  onSelect,
  isLoading
}: InstructorDropdownProps) {
  const selectedInstructor = instructors.find(i => i.id === selectedId)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <label className="block text-sm text-gray-400 mb-2">
        Select Instructor to View Details
      </label>
      <div className="relative">
        <select
          value={selectedId || ''}
          onChange={(e) => onSelect(e.target.value || null)}
          disabled={isLoading}
          className="w-full appearance-none bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:border-white/[0.3] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" className="bg-gray-900">
            -- Select an instructor --
          </option>
          {instructors.map(instructor => (
            <option
              key={instructor.id}
              value={instructor.id}
              className="bg-gray-900"
            >
              {instructor.name} {instructor.slotTypeCount > 0
                ? `(${instructor.slotTypeCount} slot type${instructor.slotTypeCount > 1 ? 's' : ''})`
                : '(No slot types configured)'}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>

      {selectedInstructor && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-gray-500"
        >
          {selectedInstructor.slotTypeCount === 0 ? (
            <span className="text-yellow-500/70">This instructor has no slot types configured</span>
          ) : (
            <div className="space-y-1">
              <div>
                <span className="text-gray-400">Slot types: </span>
                <span className="text-white">{selectedInstructor.slotTypes.join(', ')}</span>
              </div>
              {selectedInstructor.dateRange && (
                <div>
                  Available from {new Date(selectedInstructor.dateRange.earliest).toLocaleDateString()} to{' '}
                  {new Date(selectedInstructor.dateRange.latest).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
