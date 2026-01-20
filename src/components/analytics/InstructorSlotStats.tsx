"use client"

import { motion } from 'motion/react'
import { Clock, Calendar, Sun, Moon, Coffee, Sunset } from 'lucide-react'
import type { InstructorSlotDetails } from '@/lib/analytics/types'

interface InstructorSlotStatsProps {
  data: InstructorSlotDetails | null
  isLoading?: boolean
}

// Icon mapping for slot types
const SLOT_TYPE_ICONS: Record<string, typeof Sun> = {
  'Full day': Sun,
  'Morning': Coffee,
  'Lunch': Sun,
  'Afternoon': Sunset,
  'Evening': Moon,
  'Night': Moon
}

const SLOT_TYPE_COLORS: Record<string, string> = {
  'Full day': 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  'Morning': 'bg-orange-500/20 border-orange-500/30 text-orange-400',
  'Lunch': 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
  'Afternoon': 'bg-purple-500/20 border-purple-500/30 text-purple-400',
  'Evening': 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
  'Night': 'bg-blue-500/20 border-blue-500/30 text-blue-400'
}

function formatTime(time: string): string {
  if (!time) return '--:--'
  const [hours, minutes] = time.split(':')
  return `${hours}:${minutes}`
}

export function InstructorSlotStats({ data, isLoading }: InstructorSlotStatsProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-[200px] bg-white/[0.05] rounded-lg" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 py-8">
        Select an instructor to view their slot configuration
      </div>
    )
  }

  const { instructor, slotTypes, dateRange } = data

  if (slotTypes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-yellow-500/70 py-8"
      >
        This instructor has no slot types configured
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-medium text-white">{instructor.name}</h4>
          <p className="text-sm text-gray-400">
            {slotTypes.length} slot type{slotTypes.length > 1 ? 's' : ''} configured
          </p>
        </div>
        {dateRange && (
          <div className="text-right text-sm text-gray-500">
            <div className="flex items-center gap-1 justify-end">
              <Calendar className="w-4 h-4" />
              <span>Available Period</span>
            </div>
            <p className="text-white">
              {new Date(dateRange.earliest).toLocaleDateString()} - {new Date(dateRange.latest).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Slot Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slotTypes.map((slotType, index) => {
          const Icon = SLOT_TYPE_ICONS[slotType.name] || Clock
          const colorClasses = SLOT_TYPE_COLORS[slotType.name] || 'bg-gray-500/20 border-gray-500/30 text-gray-400'

          return (
            <motion.div
              key={slotType.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`rounded-lg border p-4 ${colorClasses}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon className="w-5 h-5" />
                <h5 className="font-medium text-white">{slotType.name}</h5>
              </div>

              <div className="space-y-2 text-sm">
                {/* Time Range */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 opacity-60" />
                  <span className="text-gray-300">
                    {formatTime(slotType.startTime)} - {formatTime(slotType.endTime)}
                  </span>
                </div>

                {/* Days Configured */}
                {slotType.daysConfigured.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 opacity-60 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {slotType.daysConfigured.map(day => (
                        <span
                          key={day}
                          className="px-2 py-0.5 bg-white/[0.1] rounded text-xs text-gray-300"
                        >
                          {day.substring(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="bg-white/[0.03] rounded-lg p-4">
        <h5 className="text-sm font-medium text-gray-400 mb-2">Configured Slot Types</h5>
        <div className="flex flex-wrap gap-2">
          {slotTypes.map(st => (
            <span
              key={st.id}
              className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300"
            >
              {st.name}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
