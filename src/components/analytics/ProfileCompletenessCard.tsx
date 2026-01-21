"use client"

import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { User, Image, Languages, FileText, ChevronDown, CreditCard } from 'lucide-react'
import type { ProfileCompletenessData } from '@/lib/analytics/types'

interface ProfileCompletenessCardProps {
  data: ProfileCompletenessData | null
  isLoading?: boolean
}

interface ProgressBarProps {
  label: string
  value: number
  total: number
  percentage: number
  icon: React.ReactNode
  bgColor: string
  barColor: string
  delay: number
}

function ProgressBar({ label, value, total, percentage, icon, bgColor, barColor, delay }: ProgressBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${bgColor}`}>
            {icon}
          </div>
          <span className="text-sm text-gray-300">{label}</span>
        </div>
        <span className="text-sm text-gray-400">
          {value}/{total} ({percentage}%)
        </span>
      </div>
      <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          key={percentage} // Force re-animation when value changes
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: delay + 0.2, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
    </motion.div>
  )
}

export function ProfileCompletenessCard({ data, isLoading }: ProfileCompletenessCardProps) {
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null)

  // Calculate metrics based on selection
  const { metrics, overallPercentage, displayCount, displayLabel } = useMemo(() => {
    if (!data) {
      return { metrics: [], overallPercentage: 0, displayCount: 0, displayLabel: 'All Instructors' }
    }

    if (selectedInstructorId === null) {
      // All instructors - use summary data
      const { summary, percentages } = data
      return {
        metrics: [
          {
            label: 'Profile Avatar',
            value: summary.withAvatar,
            total: summary.totalInstructors,
            percentage: percentages.avatar,
            icon: <User className="w-3.5 h-3.5 text-purple-400" />,
            bgColor: 'bg-purple-500/20',
            barColor: 'bg-purple-500'
          },
          {
            label: 'Gallery Photos',
            value: summary.withGallery,
            total: summary.totalInstructors,
            percentage: percentages.gallery,
            icon: <Image className="w-3.5 h-3.5 text-cyan-400" />,
            bgColor: 'bg-cyan-500/20',
            barColor: 'bg-cyan-500'
          },
          {
            label: 'Languages Added',
            value: summary.withLanguages,
            total: summary.totalInstructors,
            percentage: percentages.languages,
            icon: <Languages className="w-3.5 h-3.5 text-green-400" />,
            bgColor: 'bg-green-500/20',
            barColor: 'bg-green-500'
          },
          {
            label: 'Biography Written',
            value: summary.withBiography,
            total: summary.totalInstructors,
            percentage: percentages.biography,
            icon: <FileText className="w-3.5 h-3.5 text-amber-400" />,
            bgColor: 'bg-amber-500/20',
            barColor: 'bg-amber-500'
          },
          {
            label: 'Stripe Connected',
            value: summary.withStripeAccount ?? 0,
            total: summary.totalInstructors,
            percentage: percentages.stripeAccount ?? 0,
            icon: <CreditCard className="w-3.5 h-3.5 text-emerald-400" />,
            bgColor: 'bg-emerald-500/20',
            barColor: 'bg-emerald-500'
          }
        ],
        overallPercentage: Math.round(
          (percentages.avatar + percentages.gallery + percentages.languages + percentages.biography + (percentages.stripeAccount ?? 0)) / 5
        ),
        displayCount: summary.totalInstructors,
        displayLabel: 'All Instructors'
      }
    }

    // Single instructor selected
    const instructor = data.details.find(d => d.id === selectedInstructorId)
    if (!instructor) {
      return { metrics: [], overallPercentage: 0, displayCount: 0, displayLabel: 'Unknown' }
    }

    const hasAvatar = instructor.hasAvatar ? 1 : 0
    const hasGallery = instructor.galleryCount > 0 ? 1 : 0
    const hasLanguages = instructor.languageCount > 0 ? 1 : 0
    const hasBio = instructor.hasBiography ? 1 : 0
    const hasStripe = instructor.hasStripeAccount ? 1 : 0

    const avatarPct = hasAvatar * 100
    const galleryPct = hasGallery * 100
    const languagesPct = hasLanguages * 100
    const bioPct = hasBio * 100
    const stripePct = hasStripe * 100

    return {
      metrics: [
        {
          label: 'Profile Avatar',
          value: hasAvatar,
          total: 1,
          percentage: avatarPct,
          icon: <User className="w-3.5 h-3.5 text-purple-400" />,
          bgColor: 'bg-purple-500/20',
          barColor: 'bg-purple-500'
        },
        {
          label: 'Gallery Photos',
          value: hasGallery,
          total: 1,
          percentage: galleryPct,
          icon: <Image className="w-3.5 h-3.5 text-cyan-400" />,
          bgColor: 'bg-cyan-500/20',
          barColor: 'bg-cyan-500'
        },
        {
          label: 'Languages Added',
          value: hasLanguages,
          total: 1,
          percentage: languagesPct,
          icon: <Languages className="w-3.5 h-3.5 text-green-400" />,
          bgColor: 'bg-green-500/20',
          barColor: 'bg-green-500'
        },
        {
          label: 'Biography Written',
          value: hasBio,
          total: 1,
          percentage: bioPct,
          icon: <FileText className="w-3.5 h-3.5 text-amber-400" />,
          bgColor: 'bg-amber-500/20',
          barColor: 'bg-amber-500'
        },
        {
          label: 'Stripe Connected',
          value: hasStripe,
          total: 1,
          percentage: stripePct,
          icon: <CreditCard className="w-3.5 h-3.5 text-emerald-400" />,
          bgColor: 'bg-emerald-500/20',
          barColor: 'bg-emerald-500'
        }
      ],
      overallPercentage: Math.round((avatarPct + galleryPct + languagesPct + bioPct + stripePct) / 5),
      displayCount: 1,
      displayLabel: instructor.name
    }
  }, [data, selectedInstructorId])

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-white/[0.05] rounded w-1/3" />
            <div className="h-2 bg-white/[0.05] rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 py-8">
        No profile data available
      </div>
    )
  }

  // Sort instructors by name for dropdown
  const sortedInstructors = [...data.details].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="space-y-6">
      {/* Instructor Dropdown */}
      <div className="relative">
        <label className="block text-sm text-gray-400 mb-2">
          Select Instructor to View Details
        </label>
        <div className="relative">
          <select
            value={selectedInstructorId || ''}
            onChange={(e) => setSelectedInstructorId(e.target.value || null)}
            className="w-full appearance-none bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:border-white/[0.3] transition-colors cursor-pointer"
          >
            <option value="" className="bg-gray-900">
              All Instructors (Aggregate)
            </option>
            {sortedInstructors.map(instructor => {
              // Calculate completeness for this instructor
              const complete = [
                instructor.hasAvatar,
                instructor.galleryCount > 0,
                instructor.languageCount > 0,
                instructor.hasBiography,
                instructor.hasStripeAccount
              ].filter(Boolean).length
              return (
                <option
                  key={instructor.id}
                  value={instructor.id}
                  className="bg-gray-900"
                >
                  {instructor.name} ({complete}/5 complete)
                </option>
              )
            })}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Overall score */}
      <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            {selectedInstructorId ? 'Profile Completeness' : 'Overall Completeness'}
          </p>
          <p className="text-2xl font-bold text-white">{overallPercentage}%</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">
            {selectedInstructorId ? 'Selected' : 'Total Instructors'}
          </p>
          <p className="text-lg font-medium text-white">{displayLabel}</p>
        </div>
      </div>

      {/* Individual metrics */}
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <ProgressBar
            key={`${selectedInstructorId}-${metric.label}`}
            {...metric}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Individual instructor details when selected */}
      {selectedInstructorId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white/[0.03] rounded-lg space-y-2 text-sm"
        >
          {data.details.find(d => d.id === selectedInstructorId) && (
            <>
              <div className="flex justify-between text-gray-400">
                <span>Gallery photos:</span>
                <span className="text-white">
                  {data.details.find(d => d.id === selectedInstructorId)?.galleryCount || 0}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Languages:</span>
                <span className="text-white">
                  {data.details.find(d => d.id === selectedInstructorId)?.languageCount || 0}
                </span>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  )
}
