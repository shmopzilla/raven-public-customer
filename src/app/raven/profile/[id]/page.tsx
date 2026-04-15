"use client"

import { use, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar } from '@/components/calendar/Calendar'
import { DisciplinesList } from '@/components/calendar/DisciplinesList'
import { ActionButton } from '@/components/calendar/ActionButton'
import { InstructorAvatar } from '@/components/calendar/InstructorAvatar'
import { InstructorCarousel } from '@/components/calendar/InstructorCarousel'
import { GlobalSearchModal } from '@/components/ui/global-search-modal'
import { SiteFooter } from '@/components/raven/site-footer'
import { SlotSelectionModal } from '@/components/raven/slot-selection-modal'
import { ToastNotification } from '@/components/raven/toast-notification'
import type { SelectedSlot } from '@/lib/types/cart'
import { useCartStore } from '@/lib/stores/cart-store'

interface Instructor {
  id: string
  first_name: string
  last_name: string
  avatar_url?: string
  banner_url?: string
  biography?: string
  years_of_experience?: number
  instant_booking?: boolean
  id_verified?: boolean
  primary_language?: string
  other_languages?: string[]
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
  const [scrolled, setScrolled] = useState(false)
  const [bioExpanded, setBioExpanded] = useState(false)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [configuredSlotIds, setConfiguredSlotIds] = useState<number[]>([])
  const bannerRef = useRef<HTMLDivElement>(null)

  // Scroll-aware header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 200)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch instructor data on page load
  useEffect(() => {
    async function fetchInstructor() {
      try {
        const response = await fetch('/api/calendar/instructors')
        const result = await response.json()

        if (!response.ok) {
          setError('Failed to fetch instructor: ' + (result.details || result.error))
        } else if (result.data && result.data.length > 0) {
          const foundInstructor = result.data.find((i: Instructor) => i.id === instructorId)
          if (foundInstructor) {
            setInstructor(foundInstructor)
          } else {
            setError('Instructor not found')
          }
        } else {
          setError('Instructor not found')
        }
      } catch (err: any) {
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
      if (!instructorId) return

      setLoadingBookings(true)
      setError(null)

      try {
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

        const url = `/api/calendar/bookings?instructorId=${instructorId}&startDate=${startDate}&endDate=${endDate}`
        const response = await fetch(url)
        const result = await response.json()

        if (!response.ok) {
          setError('Failed to fetch booking items: ' + (result.details || result.error))
          setBookingItems([])
        } else {
          setBookingItems(result.data || [])
        }
      } catch (err: any) {
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
      if (!instructorId) return

      setLoadingPricing(true)

      try {
        const url = `/api/calendar/offers?instructorId=${instructorId}`
        const response = await fetch(url)
        const result = await response.json()

        if (!response.ok) {
          setInstructorPricing(null)
        } else {
          setInstructorPricing(result.data)
        }
      } catch (err: any) {
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
      if (!instructorId) return

      setLoadingResorts(true)

      try {
        const url = `/api/calendar/instructor-resorts?instructorId=${instructorId}`
        const response = await fetch(url)
        const result = await response.json()

        if (!response.ok) {
          setInstructorResorts([])
        } else {
          setInstructorResorts(result.data || [])
        }
      } catch (err: any) {
        setInstructorResorts([])
      } finally {
        setLoadingResorts(false)
      }
    }

    fetchInstructorResorts()
  }, [instructorId])

  // Fetch instructor's configured slot types
  useEffect(() => {
    async function fetchConfiguredSlots() {
      if (!instructorId) return

      try {
        const url = `/api/calendar/configured-slots?instructorId=${instructorId}`
        const response = await fetch(url)
        const result = await response.json()

        if (response.ok && result.data) {
          setConfiguredSlotIds(result.data)
        } else {
          setConfiguredSlotIds([])
        }
      } catch {
        setConfiguredSlotIds([])
      }
    }

    fetchConfiguredSlots()
  }, [instructorId])

  // Fetch instructor images
  useEffect(() => {
    async function fetchInstructorImages() {
      if (!instructorId) return

      setLoadingImages(true)

      try {
        const url = `/api/calendar/instructor-images?instructorId=${instructorId}`
        const response = await fetch(url)
        const result = await response.json()

        if (!response.ok) {
          setInstructorImages([])
        } else {
          setInstructorImages(result.data || [])
        }
      } catch (err: any) {
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

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const handleDayClick = (date: string) => {
    setSelectedStartDate(date)
    setSelectedEndDate(date)
    setSelectedDaysCount(1)
  }

  const handleRangeSelect = (startDate: string, endDate: string | null) => {
    setSelectedStartDate(startDate)
    setSelectedEndDate(endDate)

    if (endDate === null) {
      setSelectedDaysCount(0)
      return
    }

    if (startDate === endDate) {
      setSelectedDaysCount(1)
    } else {
      setSelectedDaysCount(calculateDays(startDate, endDate))
    }
  }

  // Count languages
  const languageCount = (() => {
    let count = 0
    if (instructor?.primary_language) count++
    if (instructor?.other_languages?.length) count += instructor.other_languages.length
    return count
  })()

  // All languages list
  const allLanguages = (() => {
    const langs: string[] = []
    if (instructor?.primary_language) langs.push(instructor.primary_language)
    if (instructor?.other_languages?.length) langs.push(...instructor.other_languages)
    return langs
  })()

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
      {/* Scroll-aware Header */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/95 backdrop-blur-sm border-b border-gray-800/50'
          : 'bg-gradient-to-b from-black/60 to-transparent'
      }`}>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/raven/search"
              className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-['Archivo'] font-medium">Back to Search</span>
            </Link>
            {scrolled && instructor && (
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full bg-cover bg-center bg-gray-600"
                  style={{ backgroundImage: `url(${instructor.avatar_url || '/assets/images/instructor-1.png'})` }}
                />
                <span className="text-white font-['Archivo'] font-medium text-sm">{instructor.first_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div
        ref={bannerRef}
        className="relative w-full h-[260px] lg:h-[320px]"
      >
        {instructor?.banner_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${instructor.banner_url})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-slate-900 to-black" />
        )}
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Profile Section - overlaps banner */}
      <div className="relative max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        {/* Two Column from the start on Desktop */}
        <div className="flex flex-col lg:flex-row gap-8 pb-32 lg:pb-8">
          {/* Left Column - Identity + Profile Info */}
          <div className="w-full lg:flex-1 lg:min-w-0 flex flex-col gap-6">
            {/* Mobile: centered vertical stack */}
            <div className="flex flex-col items-center lg:hidden">
              <InstructorAvatar
                instructor={instructor ?? undefined}
                size="lg"
                className="ring-4 ring-black rounded-full"
              />
              {instructor && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  <h1 style={{ color: '#FFF', fontFamily: '"PP Editorial New"', fontSize: '32px', fontWeight: 400, lineHeight: '1.2', letterSpacing: '0.16px' }}>
                    {instructor.first_name}
                  </h1>
                  {instructorResorts.length > 0 && (
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10C21 18 12 23 12 23C12 23 3 18 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" fill="url(#paint0_loc_m)"/>
                        <path d="M12 14C14.2091 14 16 12.2091 16 10C16 7.79086 14.2091 6 12 6C9.79086 6 8 7.79086 8 10C8 12.2091 9.79086 14 12 14Z" fill="url(#paint1_loc_m)"/>
                        <defs>
                          <linearGradient id="paint0_loc_m" x1="12" y1="1" x2="12" y2="23" gradientUnits="userSpaceOnUse"><stop stopColor="#FF4867"/><stop offset="1" stopColor="#E50031"/></linearGradient>
                          <linearGradient id="paint1_loc_m" x1="12" y1="6" x2="12" y2="14" gradientUnits="userSpaceOnUse"><stop stopColor="#F2F2F2"/><stop offset="1" stopColor="#DBDBDB"/></linearGradient>
                        </defs>
                      </svg>
                      <span className="text-white/80 font-['Archivo'] text-[15px]">{instructorResorts[0].name}</span>
                      {instructorResorts.length > 1 && (
                        <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/70 font-['Archivo'] font-medium">
                          +{instructorResorts.length - 1} more
                        </span>
                      )}
                    </div>
                  )}
                  {/* Mobile Trust Badges */}
                  <div className="mt-2 flex flex-wrap items-center gap-2 justify-center">
                    {instructor.id_verified && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-['Archivo'] font-medium">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        Verified
                      </span>
                    )}
                    {instructor.instant_booking && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-['Archivo'] font-medium">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        Instant Booking
                      </span>
                    )}
                  </div>
                  {/* Mobile Stats */}
                  <div className="mt-2 flex items-center rounded-xl bg-white/5 border border-white/10 overflow-hidden w-fit">
                    {instructor.years_of_experience && instructor.years_of_experience > 0 && (
                      <div className="flex flex-col items-center px-6 py-3">
                        <span className="text-white font-['Archivo'] font-semibold text-lg">{instructor.years_of_experience}</span>
                        <span className="text-white/50 font-['Archivo'] text-xs uppercase tracking-wider">Years exp.</span>
                      </div>
                    )}
                    {languageCount > 0 && (<><div className="w-px h-10 bg-white/10" /><div className="flex flex-col items-center px-6 py-3"><span className="text-white font-['Archivo'] font-semibold text-lg">{languageCount}</span><span className="text-white/50 font-['Archivo'] text-xs uppercase tracking-wider">{languageCount === 1 ? 'Language' : 'Languages'}</span></div></>)}
                    {instructorResorts.length > 0 && (<><div className="w-px h-10 bg-white/10" /><div className="flex flex-col items-center px-6 py-3"><span className="text-white font-['Archivo'] font-semibold text-lg">{instructorResorts.length}</span><span className="text-white/50 font-['Archivo'] text-xs uppercase tracking-wider">{instructorResorts.length === 1 ? 'Resort' : 'Resorts'}</span></div></>)}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop: horizontal avatar + info layout */}
            <div className="hidden lg:flex items-start gap-5">
              <div className="flex-shrink-0">
                <InstructorAvatar
                  instructor={instructor ?? undefined}
                  size="lg"
                  className="ring-4 ring-black rounded-full"
                />
              </div>
              {instructor && (
                <div className="flex flex-col gap-2 pt-2">
                  <h1 style={{ color: '#FFF', fontFamily: '"PP Editorial New"', fontSize: '32px', fontWeight: 400, lineHeight: '1.2', letterSpacing: '0.16px' }}>
                    {instructor.first_name}
                  </h1>
                  {instructorResorts.length > 0 && (
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10C21 18 12 23 12 23C12 23 3 18 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" fill="url(#paint0_loc_d)"/>
                        <path d="M12 14C14.2091 14 16 12.2091 16 10C16 7.79086 14.2091 6 12 6C9.79086 6 8 7.79086 8 10C8 12.2091 9.79086 14 12 14Z" fill="url(#paint1_loc_d)"/>
                        <defs>
                          <linearGradient id="paint0_loc_d" x1="12" y1="1" x2="12" y2="23" gradientUnits="userSpaceOnUse"><stop stopColor="#FF4867"/><stop offset="1" stopColor="#E50031"/></linearGradient>
                          <linearGradient id="paint1_loc_d" x1="12" y1="6" x2="12" y2="14" gradientUnits="userSpaceOnUse"><stop stopColor="#F2F2F2"/><stop offset="1" stopColor="#DBDBDB"/></linearGradient>
                        </defs>
                      </svg>
                      <span className="text-white/80 font-['Archivo'] text-[15px]">{instructorResorts[0].name}</span>
                      {instructorResorts.length > 1 && (
                        <div className="relative group">
                          <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/70 font-['Archivo'] font-medium cursor-help">
                            +{instructorResorts.length - 1} more
                          </span>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-white text-black text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                            {instructorResorts.slice(1).map((resort: any, i: number) => (
                              <div key={resort.id || i}>{resort.name}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Desktop Trust Badges + Stats inline */}
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {instructor.id_verified && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-['Archivo'] font-medium">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        Verified
                      </span>
                    )}
                    {instructor.instant_booking && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-['Archivo'] font-medium">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        Instant Booking
                      </span>
                    )}
                    {instructor.years_of_experience && instructor.years_of_experience > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-['Archivo'] font-medium">
                        {instructor.years_of_experience} yrs experience
                      </span>
                    )}
                    {instructorResorts.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-['Archivo'] font-medium">
                        {instructorResorts.length} {instructorResorts.length === 1 ? 'resort' : 'resorts'}
                      </span>
                    )}
                    {languageCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-['Archivo'] font-medium">
                        {languageCount} {languageCount === 1 ? 'language' : 'languages'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Section */}
            <div className="flex flex-col gap-3">
              <div className="text-white font-['Archivo'] font-medium text-xl">
                {loadingPricing ? (
                  'Loading pricing...'
                ) : instructorPricing?.minHourlyRate ? (
                  <>
                    Starting from €{instructorPricing.minHourlyRate}
                    <span className="text-[#7B7B7B] text-base ml-1">/hour</span>
                  </>
                ) : (
                  'Pricing unavailable'
                )}
              </div>
              <DisciplinesList instructorId={instructorId || ''} />
            </div>

            {/* About Section */}
            {instructor?.biography && (
              <div className="flex flex-col gap-3">
                <h3 className="text-white font-['Archivo'] font-medium text-xl">
                  About {instructor.first_name}
                </h3>
                <div className="relative">
                  <p
                    className={`text-white/70 font-['Archivo'] font-light text-[15px] leading-relaxed ${
                      !bioExpanded && instructor.biography.length > 300 ? 'line-clamp-4' : ''
                    }`}
                  >
                    {instructor.biography}
                  </p>
                  {instructor.biography.length > 300 && (
                    <button
                      onClick={() => setBioExpanded(!bioExpanded)}
                      className="mt-2 text-white font-['Archivo'] text-sm font-medium underline-offset-4 hover:underline transition-colors"
                    >
                      {bioExpanded ? 'Read less' : 'Read more'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Languages Section */}
            {allLanguages.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-white font-['Archivo'] font-medium text-xl">
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allLanguages.map((lang, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1.5 rounded-full font-['Archivo'] text-sm ${
                        i === 0
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'bg-white/5 text-white/70 border border-white/10'
                      }`}
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Photos Carousel */}
            {instructorId && (
              <InstructorCarousel
                images={instructorImages}
                className="w-full"
              />
            )}
          </div>

          {/* Right Column - Calendar Panel (Desktop only) */}
          <div className="hidden lg:block w-[485px] flex-shrink-0">
            <div className="sticky top-4">
              <div
                className="w-full relative flex flex-col"
                style={{
                  maxWidth: '485px',
                  maxHeight: 'calc(100vh - 32px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.10)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  boxShadow: '0 4px 34px 0 #000',
                  backdropFilter: 'blur(32px)'
                }}
              >
                {/* Scrollable content */}
                <div
                  className="overflow-y-auto flex-1 min-h-0"
                  style={{
                    padding: 'clamp(16px, 3vw, 24px)',
                    paddingBottom: selectedDaysCount > 0 ? '12px' : 'clamp(16px, 3vw, 24px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '20px',
                  }}
                >
                  {/* Calendar */}
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

                {/* Action Button - pinned at bottom, outside scroll */}
                {selectedDaysCount > 0 && (
                  <div
                    className="flex-shrink-0"
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.10)',
                      padding: 'clamp(12px, 3vw, 20px)',
                      paddingTop: '16px'
                    }}
                  >
                    <ActionButton
                      selectedDays={selectedDaysCount}
                      onClick={() => setIsSlotModalOpen(true)}
                    />
                  </div>
                )}
              </div>

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

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-white/10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            {loadingPricing ? (
              <span className="text-white/50 font-['Archivo'] text-sm">Loading...</span>
            ) : instructorPricing?.minHourlyRate ? (
              <div className="flex flex-col">
                <span className="text-white font-['Archivo'] font-semibold text-lg">
                  From €{instructorPricing.minHourlyRate}<span className="text-white/50 text-sm font-normal">/hr</span>
                </span>
              </div>
            ) : (
              <span className="text-white/50 font-['Archivo'] text-sm">Pricing unavailable</span>
            )}
          </div>
          <button
            onClick={() => setMobileSheetOpen(true)}
            className="px-6 py-3 bg-white text-black rounded-full font-['Archivo'] font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            Check Availability
          </button>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      {mobileSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSheetOpen(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] bg-[#0A0A0A] rounded-t-2xl border-t border-white/10 overflow-hidden flex flex-col animate-slide-up">
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            {/* Sheet Content */}
            <div className="overflow-y-auto flex-1 px-4 pb-8">
              <div className="flex flex-col gap-6">
                {/* Calendar */}
                {loadingBookings ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-white text-sm">Loading calendar...</div>
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

                {/* Action Button */}
                {selectedDaysCount > 0 && (
                  <ActionButton
                    selectedDays={selectedDaysCount}
                    onClick={() => {
                      setMobileSheetOpen(false)
                      setIsSlotModalOpen(true)
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slot Selection Modal */}
      {selectedStartDate && selectedEndDate && instructor && instructorPricing?.minHourlyRate && (
        <SlotSelectionModal
          isOpen={isSlotModalOpen}
          onClose={() => setIsSlotModalOpen(false)}
          instructorId={instructorId}
          instructorName={instructor.first_name}
          startDate={selectedStartDate}
          endDate={selectedEndDate}
          bookingItems={bookingItems}
          hourlyRate={instructorPricing.minHourlyRate}
          configuredSlotIds={configuredSlotIds}
          onAddToCart={(selectedSlots: SelectedSlot[]) => {
            if (!instructor || !instructorPricing?.minHourlyRate) return

            addToCart({
              instructorId,
              instructorName: instructor.first_name,
              instructorAvatar: instructor.avatar_url || '',
              location: instructorResorts[0]?.resorts?.name || 'Unknown Location',
              discipline: 'Ski Instruction',
              selectedSlots,
              pricePerHour: instructorPricing.minHourlyRate
            })

            setToastMessage(`Added ${selectedSlots.length} ${selectedSlots.length === 1 ? 'session' : 'sessions'} to cart`)
            setShowToast(true)
          }}
        />
      )}

      <GlobalSearchModal shouldNavigate={false} />

      <ToastNotification
        isVisible={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
        type="success"
      />

      <SiteFooter />
    </div>
  )
}
