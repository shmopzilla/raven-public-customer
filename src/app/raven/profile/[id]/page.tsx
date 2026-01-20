"use client"

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar } from '@/components/calendar/Calendar'
import { DisciplinesList } from '@/components/calendar/DisciplinesList'
import { ActionButton } from '@/components/calendar/ActionButton'
import { InstructorAvatar } from '@/components/calendar/InstructorAvatar'
import { InstructorCarousel } from '@/components/calendar/InstructorCarousel'
import { GlobalSearchModal } from '@/components/ui/global-search-modal'
import { SlotSelectionModal } from '@/components/raven/slot-selection-modal'
import { ToastNotification } from '@/components/raven/toast-notification'
import type { SelectedSlot } from '@/lib/types/cart'
import { useCartStore } from '@/lib/stores/cart-store'

interface Instructor {
  id: string
  first_name: string
  last_name: string
  avatar_url?: string
  date_of_birth?: string
  biography?: string
}

export default function InstructorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const unwrappedParams = use(params)
  const instructorId = unwrappedParams.id
  const addToCart = useCartStore((state) => state.addToCart)

  const [instructor, setInstructor] = useState<Instructor | null>(null)
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
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false)
  const [instructorResorts, setInstructorResorts] = useState<any[]>([])
  const [loadingResorts, setLoadingResorts] = useState(false)
  const [instructorImages, setInstructorImages] = useState<any[]>([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Fetch instructor data on page load
  useEffect(() => {
    async function fetchInstructor() {
      console.log('Fetching instructor via API:', instructorId)
      try {
        const response = await fetch('/api/calendar/instructors')
        const result = await response.json()
        console.log('API Instructors result:', result)

        if (!response.ok) {
          console.error('API Failed to fetch instructors:', result.error)
          setError('Failed to fetch instructor: ' + (result.details || result.error))
        } else if (result.data && result.data.length > 0) {
          // Find the specific instructor by ID
          const foundInstructor = result.data.find((i: Instructor) => i.id === instructorId)
          if (foundInstructor) {
            console.log('Found instructor via API:', foundInstructor)
            setInstructor(foundInstructor)
          } else {
            console.log('Instructor not found with ID:', instructorId)
            setError('Instructor not found')
          }
        } else {
          console.log('No instructors found via API')
          setError('Instructor not found')
        }
      } catch (err: any) {
        console.error('Error fetching instructor via API:', err)
        setError('Error fetching instructor: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInstructor()
  }, [instructorId])

  // Fetch booking items via API when instructor is loaded
  useEffect(() => {
    async function fetchBookingData() {
      if (!instructorId) {
        console.log('No instructor ID, skipping booking fetch')
        return
      }

      console.log('Fetching booking items via API for instructor:', instructorId)
      setLoadingBookings(true)
      setError(null)

      try {
        // Get current month date range
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

        console.log('Date range:', { startDate, endDate })

        const url = `/api/calendar/bookings?instructorId=${instructorId}&startDate=${startDate}&endDate=${endDate}`
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
  }, [instructorId])

  // Fetch instructor pricing via API
  useEffect(() => {
    async function fetchInstructorPricing() {
      if (!instructorId) {
        console.log('No instructor ID, skipping pricing fetch')
        return
      }

      console.log('Fetching instructor pricing via API for instructor:', instructorId)
      setLoadingPricing(true)

      try {
        const url = `/api/calendar/offers?instructorId=${instructorId}`
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
  }, [instructorId])

  // Fetch instructor resorts
  useEffect(() => {
    async function fetchInstructorResorts() {
      if (!instructorId) {
        console.log('No instructor ID, skipping resorts fetch')
        return
      }

      console.log('Fetching instructor resorts via API for instructor:', instructorId)
      setLoadingResorts(true)

      try {
        const url = `/api/calendar/instructor-resorts?instructorId=${instructorId}`
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
  }, [instructorId])

  // Fetch instructor images
  useEffect(() => {
    async function fetchInstructorImages() {
      if (!instructorId) {
        console.log('No instructor ID, skipping images fetch')
        return
      }

      console.log('Fetching instructor images via API for instructor:', instructorId)
      setLoadingImages(true)

      try {
        const url = `/api/calendar/instructor-images?instructorId=${instructorId}`
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
  }, [instructorId])

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
    setSelectedStartDate(date)
    setSelectedEndDate(date)
    setSelectedDaysCount(1)
  }

  const handleRangeSelect = (startDate: string, endDate: string | null) => {
    console.log('Range selected:', startDate, 'to', endDate)
    setSelectedStartDate(startDate)
    setSelectedEndDate(endDate)

    // If endDate is null, we're starting a new selection - hide the button
    if (endDate === null) {
      setSelectedDaysCount(0)
      return
    }

    // Check if it's a single day selection
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
        <div className="text-white text-lg">Loading instructor profile...</div>
      </div>
    )
  }

  if (error && !instructor) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-white text-xl">Instructor not found</div>
          <Link
            href="/raven/search"
            className="px-6 py-3 bg-white text-black rounded-full font-['Archivo'] font-medium hover:bg-white/90 transition-colors"
          >
            Back to Search
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Sticky Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800/50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <Link
              href="/raven/search"
              className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-['Archivo'] font-medium">Back to Search</span>
            </Link>

            {/* Instructor Name */}
            <h1 className="text-white text-xl font-bold">{instructor?.first_name} {instructor?.last_name}</h1>

            {/* Spacer to balance layout */}
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Main Content - with top padding to account for fixed header */}
      <div className="pt-20 min-h-screen flex items-center justify-center">
        {/* Main Content Container */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 w-full max-w-[1920px] px-4 sm:px-6 lg:px-8">
          {/* Instructor Avatar and Info */}
          <div className="w-full lg:max-w-[calc(100%-485px-2rem)] lg:min-w-[400px] flex flex-col gap-8 lg:gap-10">
            {/* Profile Area */}
            <div className="flex items-center gap-3">
              <InstructorAvatar instructor={instructor} />
              {/* Instructor Name and Age */}
              {instructor && (
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
                    {instructor.first_name}
                  </div>
                  {instructor.date_of_birth && (
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
                        if (instructor.date_of_birth) {
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
                      <div className="relative group">
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
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-white text-black text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {instructorResorts.slice(1).map((resort, index) => (
                              <div key={resort.id || index} className="whitespace-nowrap">{resort.name}</div>
                            ))}
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                </div>
              )}
            </div>

            {/* About Section */}
            {instructor && (
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
                  About {instructor.first_name}
                </h3>
                {/* Instructor Biography */}
                {instructor.biography && (
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
                    {instructor.biography}
                  </p>
                )}
              </div>
            )}

            {/* Instructor Images Carousel */}
            {instructorId && (
              <InstructorCarousel
                images={instructorImages}
                className="w-full"
              />
            )}
          </div>

          {/* Calendar Container - Responsive width */}
          <div className="w-full lg:w-[485px] lg:flex-shrink-0">
          <div
            className="w-full relative overflow-hidden"
            style={{
              display: 'flex',
              maxWidth: '485px',
              maxHeight: 'calc(100vh - 120px)',
              flexDirection: 'column',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              background: 'rgba(255, 255, 255, 0.05)',
              boxShadow: '0 4px 34px 0 #000',
              backdropFilter: 'blur(32px)'
            }}
          >
            {/* Scrollable Content Area */}
            <div
              className="overflow-y-auto"
              style={{
                padding: 'clamp(16px, 4vw, 32px)',
                paddingBottom: selectedDaysCount > 0 ? '32px' : 'clamp(16px, 4vw, 32px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '28px',
                flex: 1
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
                'Pricing unavailable'
              )}
            </div>

            {/* Disciplines List */}
            <div style={{ width: '100%' }}>
              <DisciplinesList instructorId={instructorId || ''} />
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
            </div>

            {/* Sticky Action Button Container - Only show when days are selected */}
            {selectedDaysCount > 0 && (
              <div
                className="sticky bottom-0 left-0 right-0 z-10"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(32px)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.10)',
                  padding: 'clamp(16px, 4vw, 32px)',
                  paddingTop: '20px'
                }}
              >
                <ActionButton
                  selectedDays={selectedDaysCount}
                  onClick={() => setIsSlotModalOpen(true)}
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

      {/* Slot Selection Modal */}
      {selectedStartDate && selectedEndDate && instructor && instructorPricing?.minHourlyRate && (
        <SlotSelectionModal
          isOpen={isSlotModalOpen}
          onClose={() => setIsSlotModalOpen(false)}
          instructorId={instructorId}
          instructorName={`${instructor.first_name} ${instructor.last_name}`}
          startDate={selectedStartDate}
          endDate={selectedEndDate}
          bookingItems={bookingItems}
          hourlyRate={instructorPricing.minHourlyRate}
          onAddToCart={(selectedSlots: SelectedSlot[]) => {
            if (!instructor || !instructorPricing?.minHourlyRate) return

            addToCart({
              instructorId,
              instructorName: `${instructor.first_name} ${instructor.last_name}`,
              instructorAvatar: instructor.avatar_url || '',
              location: instructorResorts[0]?.resorts?.name || 'Unknown Location',
              discipline: 'Ski Instruction', // Generic for now - can be enhanced later
              selectedSlots,
              pricePerHour: instructorPricing.minHourlyRate
            })

            // Show success toast
            setToastMessage(`Added ${selectedSlots.length} ${selectedSlots.length === 1 ? 'session' : 'sessions'} to cart`)
            setShowToast(true)
          }}
        />
      )}

      {/* Global Search Modal - accessible from profile pages */}
      {/* shouldNavigate=false means it stays on current page, doesn't navigate to search */}
      <GlobalSearchModal shouldNavigate={false} />

      {/* Toast Notification */}
      <ToastNotification
        isVisible={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
        type="success"
      />
    </div>
  )
}
