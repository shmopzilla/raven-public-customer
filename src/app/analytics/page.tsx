"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { Users, UserCheck, UserPlus, Calendar, Clock, Layers } from 'lucide-react'
import {
  MetricCard,
  ChartContainer,
  DateRangePicker,
  SignupsChart,
  InstructorSlotStats,
  ProfileCompletenessCard,
  InstructorDropdown
} from '@/components/analytics'
import type {
  OverviewData,
  SignupsData,
  InstructorsAnalyticsData,
  InstructorSlotDetails,
  ProfileCompletenessData
} from '@/lib/analytics/types'

export default function AnalyticsDashboard() {
  // Overview data
  const [overview, setOverview] = useState<OverviewData | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [overviewLoading, setOverviewLoading] = useState(true)

  // Signups data
  const [signups, setSignups] = useState<SignupsData | null>(null)
  const [signupsLoading, setSignupsLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Instructors data
  const [instructors, setInstructors] = useState<InstructorsAnalyticsData | null>(null)
  const [instructorsLoading, setInstructorsLoading] = useState(true)
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null)
  const [instructorSlots, setInstructorSlots] = useState<InstructorSlotDetails | null>(null)
  const [instructorSlotsLoading, setInstructorSlotsLoading] = useState(false)

  // Profile completeness data
  const [profileData, setProfileData] = useState<ProfileCompletenessData | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // Error state
  const [error, setError] = useState<string | null>(null)

  // Fetch overview data
  const fetchOverview = useCallback(async () => {
    try {
      setOverviewLoading(true)
      const response = await fetch('/api/analytics/overview')
      const result = await response.json()
      if (!result.success) throw new Error(result.details || result.error)
      setOverview(result.data)
    } catch (err) {
      console.error('Failed to fetch overview:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setOverviewLoading(false)
    }
  }, [])

  // Fetch signups data
  const fetchSignups = useCallback(async () => {
    try {
      setSignupsLoading(true)
      const params = new URLSearchParams()
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)

      const response = await fetch(`/api/analytics/signups?${params}`)
      const result = await response.json()
      if (!result.success) throw new Error(result.details || result.error)
      setSignups(result.data)
    } catch (err) {
      console.error('Failed to fetch signups:', err)
    } finally {
      setSignupsLoading(false)
    }
  }, [startDate, endDate])

  // Fetch instructors data
  const fetchInstructors = useCallback(async () => {
    try {
      setInstructorsLoading(true)
      const response = await fetch('/api/analytics/instructors')
      const result = await response.json()
      if (!result.success) throw new Error(result.details || result.error)
      setInstructors(result.data)
    } catch (err) {
      console.error('Failed to fetch instructors:', err)
    } finally {
      setInstructorsLoading(false)
    }
  }, [])

  // Fetch instructor slots
  const fetchInstructorSlots = useCallback(async (instructorId: string) => {
    try {
      setInstructorSlotsLoading(true)
      const response = await fetch(`/api/analytics/instructors/${instructorId}/slots`)
      const result = await response.json()
      if (!result.success) throw new Error(result.details || result.error)
      setInstructorSlots(result.data)
    } catch (err) {
      console.error('Failed to fetch instructor slots:', err)
      setInstructorSlots(null)
    } finally {
      setInstructorSlotsLoading(false)
    }
  }, [])

  // Fetch profile completeness
  const fetchProfileCompleteness = useCallback(async () => {
    try {
      setProfileLoading(true)
      const response = await fetch('/api/analytics/profile-completeness')
      const result = await response.json()
      if (!result.success) throw new Error(result.details || result.error)
      setProfileData(result.data)
    } catch (err) {
      console.error('Failed to fetch profile completeness:', err)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchOverview()
    fetchSignups()
    fetchInstructors()
    fetchProfileCompleteness()
  }, [fetchOverview, fetchSignups, fetchInstructors, fetchProfileCompleteness])

  // Refetch signups when date range changes
  useEffect(() => {
    fetchSignups()
  }, [startDate, endDate, fetchSignups])

  // Fetch instructor slots when selection changes
  useEffect(() => {
    if (selectedInstructorId) {
      // Check if selected instructor has any slot types
      const selectedInstructor = instructors?.instructors.find(i => i.id === selectedInstructorId)
      if (selectedInstructor && selectedInstructor.slotTypeCount > 0) {
        fetchInstructorSlots(selectedInstructorId)
      } else {
        // Instructor has no slot types, clear the slot details
        setInstructorSlots(null)
      }
    } else {
      setInstructorSlots(null)
    }
  }, [selectedInstructorId, fetchInstructorSlots, instructors])

  const handleInstructorSelect = (id: string | null) => {
    setSelectedInstructorId(id)
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent font-['Inter'] mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-400">
              Monitor user growth, availability configuration, and profile completeness
            </p>
          </div>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </motion.div>

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8 text-center"
          >
            <p className="text-red-400 font-medium">Error: {error}</p>
            <button
              onClick={() => {
                setError(null)
                fetchOverview()
              }}
              className="mt-3 bg-red-500/20 hover:bg-red-500/30 transition-colors px-4 py-2 rounded-lg text-sm"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Overview Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <MetricCard
            title="Total Users"
            value={overview?.totalUsers || 0}
            icon={Users}
            delay={0}
          />
          <MetricCard
            title="Instructors"
            value={overview?.totalInstructors || 0}
            icon={UserCheck}
            variant="info"
            delay={0.1}
          />
          <MetricCard
            title="Customers"
            value={overview?.totalCustomers || 0}
            icon={UserPlus}
            variant="success"
            delay={0.2}
          />
          <MetricCard
            title="With Availability"
            value={overview?.instructorsWithAvailability || 0}
            subtitle={`of ${overview?.totalInstructors || 0} instructors`}
            icon={Calendar}
            delay={0.3}
          />
          <MetricCard
            title="Avg Slot Types"
            value={overview?.averageSlotTypesPerInstructor || 0}
            subtitle="per instructor"
            icon={Layers}
            delay={0.4}
          />
        </div>

        {/* Slot Types Used */}
        {overview?.slotTypesUsed && overview.slotTypesUsed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.1] rounded-xl p-4 mb-8"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-400">Slot types in use:</span>
              <div className="flex flex-wrap gap-2">
                {overview.slotTypesUsed.map(type => (
                  <span
                    key={type}
                    className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Signups Chart */}
        <ChartContainer
          title="Sign-ups Over Time"
          description="Track user registrations by type"
          isLoading={signupsLoading}
          delay={0.6}
          className="mb-8"
        >
          <SignupsChart data={signups?.series || []} />
        </ChartContainer>

        {/* Availability Configuration Section */}
        <ChartContainer
          title="Availability Configuration"
          description="Instructor slot type setup details"
          isLoading={instructorsLoading}
          delay={0.7}
          className="mb-8"
        >
          <div className="space-y-6">
            <InstructorDropdown
              instructors={instructors?.instructors || []}
              selectedId={selectedInstructorId}
              onSelect={handleInstructorSelect}
              isLoading={instructorsLoading}
              totalWithSlotTypes={instructors?.summary.totalInstructorsWithSlotTypes}
            />
            <InstructorSlotStats
              data={instructorSlots}
              isLoading={instructorSlotsLoading}
              showAggregate={!selectedInstructorId}
              aggregateData={instructors?.aggregate ? {
                slotTypes: instructors.aggregate.slotTypes,
                dateRange: instructors.aggregate.dateRange,
                totalInstructors: instructors.summary.totalInstructorsWithSlotTypes
              } : null}
            />
          </div>
        </ChartContainer>

        {/* Profile Completeness */}
        <ChartContainer
          title="Profile Completeness"
          description="Track instructor profile completion metrics"
          isLoading={profileLoading}
          delay={0.8}
        >
          <ProfileCompletenessCard
            data={profileData}
            isLoading={profileLoading}
          />
        </ChartContainer>
      </div>
    </div>
  )
}
