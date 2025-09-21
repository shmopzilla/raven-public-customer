"use client"

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/calendar/Calendar'
import { InstructorSwitcher } from '@/components/calendar/InstructorSwitcher'
import { DataInfoTooltip } from '@/components/calendar/DataInfoTooltip'
import { DisciplinesList } from '@/components/calendar/DisciplinesList'
import { ActionButton } from '@/components/calendar/ActionButton'
import { InstructorAvatar } from '@/components/calendar/InstructorAvatar'
import { InstructorCarousel } from '@/components/calendar/InstructorCarousel'

interface Instructor {
  id: string
  first_name: string
  last_name: string
  avatar_url?: string
}

export default function InstructorCalendarPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('')
  const [bookingItems, setBookingItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [instructorPricing, setInstructorPricing] = useState<{ minHourlyRate: number | null, offerCount: number } | null>(null)
  const [loadingPricing, setLoadingPricing] = useState(false)
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null)
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null)
  const [selectedDaysCount, setSelectedDaysCount] = useState(0)
  const [selectionMode, setSelectionMode] = useState<'single' | 'range'>('range')
  const [instructorResorts, setInstructorResorts] = useState<any[]>([])
  const [loadingResorts, setLoadingResorts] = useState(false)
  const [instructorImages, setInstructorImages] = useState<any[]>([])
  const [loadingImages, setLoadingImages] = useState(false)

  // Fetch all instructors via API on page load
  useEffect(() => {
    async function fetchInstructors() {
      console.log('Fetching instructors via API...')
      try {
        const response = await fetch('/api/calendar/instructors')
        const result = await response.json()
        console.log('API Instructors result:', result)

        if (!response.ok) {
          console.error('API Failed to fetch instructors:', result.error)
          setError('Failed to fetch instructors: ' + (result.details || result.error))
        } else if (result.data && result.data.length > 0) {
          console.log('Found instructors via API:', result.data)
          setInstructors(result.data)
          // Select first instructor by default
          setSelectedInstructorId(result.data[0].id)
        } else {
          console.log('No instructors found via API')
          setError('No instructors found')
        }
      } catch (err: any) {
        console.error('Error fetching instructors via API:', err)
        setError('Error fetching instructors: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInstructors()
  }, [])

  // Fetch booking items via API when instructor changes
  useEffect(() => {
    async function fetchBookingData() {
      if (!selectedInstructorId) {
        console.log('No instructor selected, skipping booking fetch')
        return
      }

      console.log('Fetching booking items via API for instructor:', selectedInstructorId)
      setLoadingBookings(true)
      setError(null)

      try {
        // Get current month date range
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

        console.log('Date range:', { startDate, endDate })

        const url = `/api/calendar/bookings?instructorId=${selectedInstructorId}&startDate=${startDate}&endDate=${endDate}`
        const response = await fetch(url)
        const result = await response.json()
        console.log('API Booking items result:', result)

        if (!response.ok) {
          console.error('API Failed to fetch booking items:', result.error)
          setError('Failed to fetch booking items: ' + (result.details || result.error))
          setBookingItems([])
        } else {
          console.log('Found booking items via API:', result.count)
          setBookingItems(result.data || [])
        }
      } catch (err: any) {
        console.error('Error fetching booking items via API:', err)
        setError('Error fetching booking items: ' + err.message)
        setBookingItems([])
      } finally {
        setLoadingBookings(false)
      }
    }

    fetchBookingData()
  }, [selectedInstructorId])

  // Fetch instructor pricing via API when instructor changes
  useEffect(() => {
    async function fetchInstructorPricing() {
      if (!selectedInstructorId) {
        console.log('No instructor selected, skipping pricing fetch')
        return
      }

      console.log('Fetching instructor pricing via API for instructor:', selectedInstructorId)
      setLoadingPricing(true)

      try {
        const url = `/api/calendar/offers?instructorId=${selectedInstructorId}`
        const response = await fetch(url)
        const result = await response.json()
        console.log('API Instructor pricing result:', result)

        if (!response.ok) {
          console.error('API Failed to fetch instructor pricing:', JSON.stringify(result))
          setInstructorPricing(null)
        } else {
          console.log('Found instructor pricing via API:', result.data)
          setInstructorPricing(result.data)
        }
      } catch (err: any) {
        console.error('Error fetching instructor pricing via API:', err)
        setInstructorPricing(null)
      } finally {
        setLoadingPricing(false)
      }
    }

    fetchInstructorPricing()
  }, [selectedInstructorId])

  // Fetch instructor resorts when instructor changes
  useEffect(() => {
    async function fetchInstructorResorts() {
      if (!selectedInstructorId) {
        console.log('No instructor selected, skipping resorts fetch')
        return
      }

      console.log('Fetching instructor resorts via API for instructor:', selectedInstructorId)
      setLoadingResorts(true)

      try {
        const url = `/api/calendar/instructor-resorts?instructorId=${selectedInstructorId}`
        const response = await fetch(url)
        const result = await response.json()
        console.log('API Instructor resorts result:', result)

        if (!response.ok) {
          console.error('API Failed to fetch instructor resorts:', JSON.stringify(result))
          setInstructorResorts([])
        } else {
          console.log('Found instructor resorts via API:', result.data)
          setInstructorResorts(result.data || [])
        }
      } catch (err: any) {
        console.error('Error fetching instructor resorts via API:', err)
        setInstructorResorts([])
      } finally {
        setLoadingResorts(false)
      }
    }

    fetchInstructorResorts()
  }, [selectedInstructorId])

  // Fetch instructor images when instructor changes
  useEffect(() => {
    async function fetchInstructorImages() {
      if (!selectedInstructorId) {
        console.log('No instructor selected, skipping images fetch')
        return
      }

      console.log('Fetching instructor images via API for instructor:', selectedInstructorId)
      setLoadingImages(true)

      try {
        const url = `/api/calendar/instructor-images?instructorId=${selectedInstructorId}`
        const response = await fetch(url)
        const result = await response.json()
        console.log('API Instructor images result:', result)

        if (!response.ok) {
          console.error('API Failed to fetch instructor images:', JSON.stringify(result))
          setInstructorImages([])
        } else {
          console.log('Found instructor images via API:', result.data?.length || 0)
          setInstructorImages(result.data || [])
        }
      } catch (err: any) {
        console.error('Error fetching instructor images via API:', err)
        setInstructorImages([])
      } finally {
        setLoadingImages(false)
      }
    }

    fetchInstructorImages()
  }, [selectedInstructorId])

  const handleInstructorChange = (instructorId: string) => {
    setSelectedInstructorId(instructorId)
  }

  // Clear selections when selection mode changes
  useEffect(() => {
    setSelectedStartDate(null)
    setSelectedEndDate(null)
    setSelectedDaysCount(0)
  }, [selectionMode])

  // Calculate number of days between two dates
  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const handleDayClick = (date: string) => {
    console.log('Day clicked:', date)
    // In range mode, this won't be called, but keeping for compatibility
    setSelectedStartDate(date)
    setSelectedEndDate(date)
    setSelectedDaysCount(1)
  }

  const handleRangeSelect = (startDate: string, endDate: string | null) => {
    console.log('Range selected:', startDate, 'to', endDate)
    setSelectedStartDate(startDate)
    setSelectedEndDate(endDate)

    // If endDate is null, it means we're starting a new selection - hide the button
    if (endDate === null) {
      setSelectedDaysCount(0)
      return
    }

    // Check if it's a single day selection (same start and end date)
    if (startDate === endDate) {
      setSelectedDaysCount(1)
    } else {
      const days = calculateDays(startDate, endDate)
      setSelectedDaysCount(days)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading instructors...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Sticky Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800/50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Title */}
            <h1 className="text-white text-xl font-bold">Instructor Calendar</h1>

            {/* Right side - Controls */}
            <div className="flex items-center gap-4">
              <InstructorSwitcher
                instructors={instructors}
                selectedInstructorId={selectedInstructorId}
                onInstructorChange={handleInstructorChange}
                loading={loadingBookings}
                compact={true}
              />

              <DataInfoTooltip
                instructors={instructors}
                selectedInstructorId={selectedInstructorId}
                bookingItemsCount={bookingItems.length}
                error={error}
                loading={loadingBookings}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - with top padding to account for fixed header */}
      <div className="pt-20 min-h-screen flex items-center justify-center">
        {/* Main Content Container */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 w-full max-w-[1920px] px-4 sm:px-6 lg:px-8">
          {/* Instructor Avatar and Info */}
          <div className="w-full lg:flex-1 lg:min-w-[400px] flex flex-col gap-8 lg:gap-10">
            {/* Profile Area */}
            <div className="flex items-center gap-3">
              <InstructorAvatar
                instructor={instructors.find(i => i.id === selectedInstructorId)}
              />
              {/* Instructor Name and Age */}
              {instructors.find(i => i.id === selectedInstructorId) && (
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <div
                    style={{
                      color: 'var(--Colors-Text-Main, #FFF)',
                      fontFamily: '"PP Editorial New"',
                      fontSize: '36px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '140%',
                      letterSpacing: '0.18px'
                    }}
                  >
                    {instructors.find(i => i.id === selectedInstructorId)?.first_name}
                  </div>
                  {instructors.find(i => i.id === selectedInstructorId)?.date_of_birth && (
                    <div
                      style={{
                        color: '#919191',
                        fontFamily: 'Archivo',
                        fontSize: '30px',
                        fontStyle: 'normal',
                        fontWeight: 300,
                        lineHeight: '140%',
                        letterSpacing: '0.15px'
                      }}
                    >
                      {(() => {
                        const instructor = instructors.find(i => i.id === selectedInstructorId);
                        if (instructor?.date_of_birth) {
                          const birthDate = new Date(instructor.date_of_birth);
                          const today = new Date();
                          let age = today.getFullYear() - birthDate.getFullYear();
                          const monthDiff = today.getMonth() - birthDate.getMonth();
                          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                          }
                          return age;
                        }
                        return '';
                      })()}
                    </div>
                  )}
                </div>

                {/* Instructor Location */}
                {instructorResorts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10C21 18 12 23 12 23C12 23 3 18 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" fill="url(#paint0_linear_207_2104)"/>
                      <path d="M12 14C14.2091 14 16 12.2091 16 10C16 7.79086 14.2091 6 12 6C9.79086 6 8 7.79086 8 10C8 12.2091 9.79086 14 12 14Z" fill="url(#paint1_linear_207_2104)"/>
                      <defs>
                        <linearGradient id="paint0_linear_207_2104" x1="12" y1="1.085" x2="12" y2="22.874" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#FF4867"/>
                          <stop offset="1" stopColor="#E50031"/>
                        </linearGradient>
                        <linearGradient id="paint1_linear_207_2104" x1="12" y1="6.021" x2="12" y2="13.979" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#F2F2F2"/>
                          <stop offset="1" stopColor="#DBDBDB"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div
                      style={{
                        color: '#FFF',
                        fontFamily: 'Archivo',
                        fontSize: '20px',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        lineHeight: '140%',
                        letterSpacing: '0.1px'
                      }}
                    >
                      {instructorResorts[0].name}
                    </div>
                    {instructorResorts.length > 1 && (
                      <div
                        className="relative group"
                      >
                        <div
                          className="px-2 py-1 bg-white rounded-full text-xs text-black font-medium cursor-help"
                          style={{
                            fontFamily: 'Archivo',
                            fontSize: '12px',
                            fontWeight: 500
                          }}
                        >
                          +{instructorResorts.length - 1}
                        </div>
                        {/* Tooltip */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="flex flex-col gap-1">
                            {instructorResorts.slice(1).map((resort, index) => (
                              <div key={resort.id || index}>{resort.name}</div>
                            ))}
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black/90"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                </div>
              )}
            </div>

            {/* About Section */}
            {instructors.find(i => i.id === selectedInstructorId) && (
              <div className="flex flex-col gap-4 w-full">
                <h3
                  style={{
                    color: '#FFF',
                    fontFamily: 'var(--type-font-family-headers, Archivo)',
                    fontSize: 'var(--font-size-display-h5, 20px)',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: 'var(--line-height-display-h5, 24px)',
                    letterSpacing: '0.1px'
                  }}
                >
                  About {instructors.find(i => i.id === selectedInstructorId)?.first_name}
                </h3>
                {/* Instructor Biography */}
                {instructors.find(i => i.id === selectedInstructorId)?.biography && (
                  <p
                    style={{
                      color: 'var(--Colors-Text-Subtle, #D5D5D6)',
                      fontFamily: 'Archivo',
                      fontSize: 'var(--Font-Size-md, 16px)',
                      fontStyle: 'normal',
                      fontWeight: 300,
                      lineHeight: '140%',
                      letterSpacing: '0.08px'
                    }}
                  >
                    {instructors.find(i => i.id === selectedInstructorId)?.biography}
                  </p>
                )}
              </div>
            )}

            {/* Instructor Images Carousel */}
            {selectedInstructorId && (
              <InstructorCarousel
                images={instructorImages}
                className="w-full"
              />
            )}
          </div>

          {/* Calendar Container - Responsive width */}
          <div className="w-full lg:w-[485px] lg:flex-shrink-0">
          <div
            className="w-full"
            style={{
              display: 'flex',
              maxWidth: '485px',
              padding: 'clamp(16px, 4vw, 32px)',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '28px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              background: 'rgba(255, 255, 255, 0.05)',
              boxShadow: '0 4px 34px 0 #000',
              backdropFilter: 'blur(32px)'
            }}
          >
            {/* Pricing Title */}
            <div
              style={{
                color: '#FFF',
                fontFamily: 'var(--type-font-family-headers, Archivo)',
                fontSize: '24px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: 'var(--line-height-display-h5, 24px)',
                letterSpacing: '0.12px'
              }}
            >
              {loadingPricing ? (
                'Loading pricing...'
              ) : instructorPricing?.minHourlyRate ? (
                <>
                  Starting from €{instructorPricing.minHourlyRate}
                  <span
                    style={{
                      color: '#7B7B7B',
                      fontFamily: 'var(--type-font-family-headers, Archivo)',
                      fontSize: '16px',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: 'var(--line-height-display-h5, 24px)',
                      letterSpacing: '0.08px'
                    }}
                  >
                    /hour
                  </span>
                </>
              ) : (
                'Error'
              )}
            </div>

            {/* Disciplines List */}
            <div style={{ width: '100%' }}>
              <DisciplinesList instructorId={selectedInstructorId || ''} />
            </div>

            {loadingBookings ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-white">Loading calendar data...</div>
              </div>
            ) : (
              <Calendar
                bookingItems={bookingItems}
                onDayClick={handleDayClick}
                onRangeSelect={handleRangeSelect}
                selectionMode={selectionMode}
                className="w-full"
              />
            )}

            {/* Action Button - Only show when days are selected */}
            {selectedDaysCount > 0 && (
              <div style={{ width: '100%' }}>
                <ActionButton
                  selectedDays={selectedDaysCount}
                  onClick={() => console.log(`Select sessions for ${selectedDaysCount} day(s) clicked`)}
                />
              </div>
            )}
          </div>
          {/* Error Display (only shown if error) */}
          {error && (
            <div className="mt-4">
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}