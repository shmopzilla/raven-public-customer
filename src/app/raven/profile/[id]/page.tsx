"use client"

import { use, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar } from '@/components/calendar/Calendar'
import { DisciplinesList } from '@/components/calendar/DisciplinesList'
import { ActionButton } from '@/components/calendar/ActionButton'
import { InstructorAvatar } from '@/components/calendar/InstructorAvatar'
import { InstructorPhotoGallery } from '@/components/raven/instructor-photo-gallery'
import { GlobalSearchModal } from '@/components/ui/global-search-modal'
import { SiteHeader } from '@/components/raven/site-header'
import { SiteFooter } from '@/components/raven/site-footer'
import { Panel } from '@/components/raven/ui'
import { useSearch } from '@/lib/contexts/search-context'
import {
  Star,
  ArrowLeft,
  Search,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Users,
} from 'lucide-react'
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
  const [instructorDisciplines, setInstructorDisciplines] = useState<any[]>([])
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

  // Fetch instructor disciplines
  useEffect(() => {
    async function fetchDisciplines() {
      if (!instructorId) return
      try {
        const response = await fetch(`/api/calendar/disciplines?instructorId=${instructorId}`)
        const result = await response.json()
        if (response.ok && result.data) {
          setInstructorDisciplines(result.data)
        }
      } catch {
        setInstructorDisciplines([])
      }
    }
    fetchDisciplines()
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
  // Prefers the new `languages: string[]` shape from /api/calendar/instructors,
  // falls back to legacy `primary_language` + `other_languages` fields.
  const allLanguages = (() => {
    const fromArray = (instructor as unknown as { languages?: string[] })?.languages
    if (fromArray && fromArray.length) return fromArray

    const langs: string[] = []
    if (instructor?.primary_language) langs.push(instructor.primary_language)
    if (instructor?.other_languages?.length) langs.push(...instructor.other_languages)
    return langs
  })()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4 h-full">
          <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span className="font-['Archivo'] text-sm text-[#d5d5d6]">Loading instructor profile...</span>
        </div>
      </div>
    )
  }

  if (error && !instructor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="relative min-h-screen">
      <SiteHeader transparent unpinned />

      {/* Hero Banner — identity block has different treatments per breakpoint:
          - Mobile: banner is a pure photograph, identity block sits BELOW the
            banner with the avatar pulled up via a negative margin so its top
            edge breaks into the gradient fade. Everything centre-aligned.
          - lg+: identity block is overlaid at bottom-left of the hero, left-
            aligned, classic "hero card" pattern. */}
      <div
        ref={bannerRef}
        className="relative w-full h-[260px] sm:h-[340px] lg:h-[440px]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 82%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 82%, transparent 100%)",
        }}
      >
        {instructor?.banner_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${instructor.banner_url})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black" />
        )}
        {/* Gradient darkens bottom of image for desktop identity block legibility.
            The mask-image on the wrapper fades the whole thing into ambient at the
            very bottom edge so there's no hard line against the page background. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {/* Desktop-only: overlaid identity at bottom-left of the banner */}
        {instructor && (
          <div className="absolute inset-x-0 bottom-0 hidden lg:block">
            <div className="mx-auto max-w-[1100px] px-4 pb-10 sm:px-6 lg:px-8 lg:pb-12">
              <div className="flex items-end gap-6">
                <InstructorAvatar
                  instructor={instructor ?? undefined}
                  size="lg"
                  className="flex-shrink-0 rounded-full"
                />
                <div className="min-w-0 flex-1 space-y-3">
                  <h1 className="font-['PP_Editorial_New'] text-5xl leading-[1.05] tracking-[-0.01em] text-white lg:text-[56px]">
                    {instructor.first_name}
                  </h1>

                  {instructorResorts.length > 0 && (
                    <LocationLine resorts={instructorResorts} />
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <TrustChips instructor={instructor} />
                    {instructorResorts.length > 0 && (
                      <HeroChip>
                        {instructorResorts.length}{' '}
                        {instructorResorts.length === 1 ? 'resort' : 'resorts'}
                      </HeroChip>
                    )}
                    {languageCount > 0 && (
                      <HeroChip>
                        {languageCount}{' '}
                        {languageCount === 1 ? 'language' : 'languages'}
                      </HeroChip>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile identity block — sits below banner, avatar overlaps the fade */}
      {instructor && (
        <div className="relative z-10 px-6 text-center lg:hidden">
          <div className="-mt-14 flex flex-col items-center sm:-mt-16">
            <InstructorAvatar
              instructor={instructor ?? undefined}
              size="lg"
              className="flex-shrink-0 rounded-full"
            />
            <h1 className="mt-5 font-['PP_Editorial_New'] text-4xl leading-[1.05] tracking-[-0.01em] text-white sm:text-5xl">
              {instructor.first_name}
            </h1>

            {instructorResorts.length > 0 && (
              <div className="mt-3">
                <LocationLine resorts={instructorResorts} />
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <TrustChips instructor={instructor} />
              {instructorResorts.length > 0 && (
                <HeroChip>
                  {instructorResorts.length}{' '}
                  {instructorResorts.length === 1 ? 'resort' : 'resorts'}
                </HeroChip>
              )}
              {languageCount > 0 && (
                <HeroChip>
                  {languageCount}{' '}
                  {languageCount === 1 ? 'language' : 'languages'}
                </HeroChip>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sub-nav: back-to-results + search summary + edit search */}
      <ProfileSubNav />

      {/* Profile Section */}
      <div className="relative max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10">
        {/* Two Column from the start on Desktop */}
        <div className="flex flex-col lg:flex-row gap-8 pb-32 lg:pb-8">
          {/* Left Column - Profile content (identity lives in hero above) */}
          <div className="w-full lg:flex-1 lg:min-w-0 flex flex-col gap-6">
            {/* Pricing Section */}
            <Panel className="p-5 sm:p-6">
              <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-white/45">
                Pricing
              </p>
              <div className="mt-2 font-['PP_Editorial_New'] text-3xl leading-tight text-white sm:text-4xl">
                {loadingPricing ? (
                  <span className="text-white/55">Loading…</span>
                ) : instructorPricing?.minHourlyRate ? (
                  <>
                    €{instructorPricing.minHourlyRate}
                    <span className="ml-1 font-['Archivo'] text-base font-normal text-white/50">
                      / hour
                    </span>
                  </>
                ) : (
                  <span className="text-white/55">Pricing unavailable</span>
                )}
              </div>
              <div className="mt-4">
                <DisciplinesList instructorId={instructorId || ''} />
              </div>
            </Panel>

            {/* About Section */}
            {instructor?.biography && (
              <Panel className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-white/45">
                      About
                    </p>
                    <h3 className="mt-2 font-['PP_Editorial_New'] text-2xl leading-tight text-white sm:text-3xl">
                      Meet{' '}
                      <span className="italic text-white/85">
                        {instructor.first_name}
                      </span>
                    </h3>
                  </div>
                  {instructor.years_of_experience &&
                    instructor.years_of_experience > 0 && (
                      <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 font-['Archivo'] text-xs text-white/80">
                        {instructor.years_of_experience} yrs experience
                      </span>
                    )}
                </div>
                <div className="relative mt-4">
                  <p
                    className={`font-['Archivo'] text-[15px] leading-relaxed text-white/70 ${
                      !bioExpanded && instructor.biography.length > 300
                        ? 'line-clamp-4'
                        : ''
                    }`}
                  >
                    {instructor.biography}
                  </p>
                  {instructor.biography.length > 300 && (
                    <button
                      onClick={() => setBioExpanded(!bioExpanded)}
                      className="mt-3 font-['Archivo'] text-sm font-medium text-white underline-offset-4 transition-colors hover:underline"
                    >
                      {bioExpanded ? 'Read less' : 'Read more'}
                    </button>
                  )}
                </div>
              </Panel>
            )}

            {/* Languages Section */}
            {allLanguages.length > 0 && (
              <Panel className="p-5 sm:p-6">
                <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-white/45">
                  Languages
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {allLanguages.map((lang, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-['Archivo'] text-sm ${
                        i === 0
                          ? 'border-white/25 bg-white/10 text-white'
                          : 'border-white/10 bg-white/[0.04] text-white/70'
                      }`}
                    >
                      <span className="text-base leading-none" aria-hidden>
                        {languageFlag(lang)}
                      </span>
                      {lang}
                    </span>
                  ))}
                </div>
              </Panel>
            )}

          </div>

          {/* Right Column - Calendar Panel (Desktop only) */}
          <div className="hidden lg:block w-[485px] flex-shrink-0">
            {/* top-20/24 leaves room for the fixed SiteHeader (h-16 mobile, h-20 desktop) plus a little breathing space */}
            <div className="sticky top-24">
              <div
                className="w-full relative flex flex-col"
                style={{
                  maxWidth: '485px',
                  /* 96px sticky-offset + 16px breathing space below = 112px */
                  maxHeight: 'calc(100vh - 112px)',
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
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="font-['Archivo'] text-sm text-[#d5d5d6]">Loading calendar...</span>
                      </div>
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
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setMobileSheetOpen(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] bg-[rgba(20,20,24,0.95)] rounded-t-3xl border-t border-[#3B3B40] overflow-hidden flex flex-col animate-slide-up backdrop-blur-[25px]">
            {/* Handle */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="w-8" />
              <div className="w-10 h-1 rounded-full bg-white/20" />
              <button
                onClick={() => setMobileSheetOpen(false)}
                aria-label="Close calendar"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            {/* Sheet Content */}
            <div className="overflow-y-auto flex-1 px-4 pb-8">
              <div className="flex flex-col gap-6">
                {/* Calendar */}
                {loadingBookings ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="font-['Archivo'] text-sm text-[#d5d5d6]">Loading calendar...</span>
                    </div>
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
              discipline: instructorDisciplines[0]?.name || 'Ski Instruction',
              resortId: instructorResorts[0]?.resorts?.id || 0,
              disciplineId: instructorDisciplines[0]?.id || 0,
              selectedSlots,
              pricePerHour: instructorPricing.minHourlyRate
            })

            setToastMessage(`Added ${selectedSlots.length} ${selectedSlots.length === 1 ? 'session' : 'sessions'} to cart`)
            setShowToast(true)
          }}
        />
      )}

      {/* Photos — full-width editorial gallery */}
      {instructor && instructorImages.length > 0 && (
        <InstructorPhotoGallery
          images={instructorImages}
          instructorName={instructor.first_name}
        />
      )}

      {/* Reviews — placeholder data until reviews schema lands */}
      {instructor && (
        <ReviewsSection instructorName={instructor.first_name} />
      )}

      {/* Submitting the search from a profile page should always send the
          user to /raven/search so they actually see results. */}
      <GlobalSearchModal shouldNavigate={true} />

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

// ---------------------------------------------------------------------------
// HERO IDENTITY HELPERS
// ---------------------------------------------------------------------------
// Small, self-contained bits reused by the desktop + mobile hero blocks.

function LocationLine({
  resorts,
}: {
  resorts: Array<{ id?: string | number; name: string }>
}) {
  if (!resorts.length) return null
  return (
    <div className="flex items-center gap-2">
      <MapPinIcon className="h-4 w-4 text-white/70" strokeWidth={2} />
      <span className="font-['Archivo'] text-sm text-white/85 sm:text-base">
        {resorts[0].name}
      </span>
      {resorts.length > 1 && (
        <div className="group relative">
          <span className="cursor-help rounded-full border border-white/15 bg-white/10 px-2 py-0.5 font-['Archivo'] text-[11px] text-white/80">
            +{resorts.length - 1} more
          </span>
          <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-3 py-2 text-sm text-black opacity-0 transition-opacity group-hover:opacity-100">
            {resorts.slice(1).map((resort, i) => (
              <div key={resort.id || i}>{resort.name}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TrustChips({ instructor }: { instructor: Instructor }) {
  return (
    <>
      {instructor.id_verified && (
        <HeroChip
          tone="success"
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        >
          Verified
        </HeroChip>
      )}
      {instructor.instant_booking && (
        <HeroChip
          tone="warning"
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          }
        >
          Instant booking
        </HeroChip>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// LANGUAGE -> FLAG EMOJI
// ---------------------------------------------------------------------------
// Maps a language name (case-insensitive) to a Unicode flag emoji. Covers
// the languages most commonly spoken by European ski/watersport instructors
// plus a few extras. Falls back to a globe glyph for anything unknown.

function languageFlag(language: string): string {
  const key = language.trim().toLowerCase()
  const map: Record<string, string> = {
    english: '🇬🇧',
    british: '🇬🇧',
    american: '🇺🇸',
    french: '🇫🇷',
    italian: '🇮🇹',
    spanish: '🇪🇸',
    castilian: '🇪🇸',
    catalan: '🇪🇸',
    portuguese: '🇵🇹',
    brazilian: '🇧🇷',
    german: '🇩🇪',
    dutch: '🇳🇱',
    flemish: '🇧🇪',
    greek: '🇬🇷',
    russian: '🇷🇺',
    ukrainian: '🇺🇦',
    polish: '🇵🇱',
    swedish: '🇸🇪',
    norwegian: '🇳🇴',
    danish: '🇩🇰',
    finnish: '🇫🇮',
    icelandic: '🇮🇸',
    czech: '🇨🇿',
    slovak: '🇸🇰',
    hungarian: '🇭🇺',
    romanian: '🇷🇴',
    bulgarian: '🇧🇬',
    croatian: '🇭🇷',
    slovenian: '🇸🇮',
    serbian: '🇷🇸',
    turkish: '🇹🇷',
    arabic: '🇸🇦',
    hebrew: '🇮🇱',
    chinese: '🇨🇳',
    mandarin: '🇨🇳',
    cantonese: '🇭🇰',
    japanese: '🇯🇵',
    korean: '🇰🇷',
    thai: '🇹🇭',
    vietnamese: '🇻🇳',
    hindi: '🇮🇳',
    afrikaans: '🇿🇦',
    zulu: '🇿🇦',
    swahili: '🇰🇪',
  }
  return map[key] ?? '🌐'
}

// ---------------------------------------------------------------------------
// HERO CHIP
// ---------------------------------------------------------------------------
// Small pill used on the hero-image identity overlay. Neutral by default;
// success (verified) and warning (instant booking) tones match the existing
// semantic colours. All live over photography so slightly richer fills than
// the in-panel chips elsewhere.

function HeroChip({
  icon,
  children,
  tone = 'neutral',
}: {
  icon?: React.ReactNode
  children: React.ReactNode
  tone?: 'neutral' | 'success' | 'warning'
}) {
  const toneClasses = {
    neutral:
      'border-white/20 bg-black/40 text-white/90 backdrop-blur-sm',
    success:
      'border-emerald-400/30 bg-emerald-500/15 text-emerald-200 backdrop-blur-sm',
    warning:
      'border-amber-400/30 bg-amber-500/15 text-amber-200 backdrop-blur-sm',
  }[tone]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-['Archivo'] text-xs font-medium ${toneClasses}`}
    >
      {icon}
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// PROFILE SUB-NAV
// ---------------------------------------------------------------------------
// Sits between the hero banner and the profile content. Gives the user
// an explicit "back to results" link AND exposes the current search
// criteria + an "Edit search" affordance that opens GlobalSearchModal.
// Matches the bar used on /raven/search so navigation feels cohesive.

function ProfileSubNav() {
  const { searchCriteria, openSearchModal } = useSearch()

  const formatDateRange = () => {
    if (!searchCriteria?.startDate || !searchCriteria?.endDate) return null
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
    const a = new Date(searchCriteria.startDate).toLocaleDateString('en-GB', opts)
    const b = new Date(searchCriteria.endDate).toLocaleDateString('en-GB', opts)
    return `${a} – ${b}`
  }

  const dateRange = formatDateRange()
  const adults = searchCriteria?.participants?.adults ?? 0
  const children = searchCriteria?.participants?.children ?? 0
  const totalParticipants = adults + children

  return (
    <div className="sticky top-0 z-40 backdrop-blur-md">
      {/* Always a single row — on mobile the pills compact and context pills
          collapse to icon-only to fit on one line. */}
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        {/* Back link */}
        <Link
          href="/raven/search"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-2 font-['Archivo'] text-xs text-white/85 transition-colors hover:bg-white/[0.1] hover:text-white sm:bg-white sm:px-4 sm:text-sm sm:font-semibold sm:text-black sm:hover:bg-white/90 sm:hover:text-black"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to results</span>
        </Link>

        {/* Context pills — desktop only, they'd eat the whole row on mobile */}
        <div className="hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-2 md:flex">
          {searchCriteria?.location && (
            <SubNavPill icon={<MapPinIcon className="h-3.5 w-3.5" strokeWidth={2} />}>
              {searchCriteria.location}
            </SubNavPill>
          )}
          {dateRange && (
            <SubNavPill icon={<CalendarIcon className="h-3.5 w-3.5" strokeWidth={2} />}>
              {dateRange}
            </SubNavPill>
          )}
          {totalParticipants > 0 && (
            <SubNavPill icon={<Users className="h-3.5 w-3.5" strokeWidth={2} />}>
              {totalParticipants} {totalParticipants === 1 ? 'person' : 'people'}
            </SubNavPill>
          )}
        </div>

        {/* Edit / new search — label hidden on mobile, icon only */}
        <button
          type="button"
          onClick={() => openSearchModal()}
          aria-label={searchCriteria ? 'Edit search' : 'New search'}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-2 font-['Archivo'] text-xs font-semibold text-black transition-transform hover:scale-[1.02] sm:px-4 sm:text-sm"
        >
          <Search className="h-3.5 w-3.5" strokeWidth={2.4} />
          <span className="hidden sm:inline">
            {searchCriteria ? 'Edit search' : 'New search'}
          </span>
        </button>
      </div>
    </div>
  )
}

function SubNavPill({
  icon,
  children,
}: {
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/75 px-3 py-1.5 font-['Archivo'] text-xs text-white/90 backdrop-blur-md sm:text-sm">
      {icon}
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// REVIEWS SECTION
// ---------------------------------------------------------------------------
// Placeholder data until the reviews table is wired up to the API.
// Render-only — designed to slot in cleanly once real reviews exist.

const PLACEHOLDER_REVIEWS = [
  {
    name: 'Alexandra K.',
    location: 'Mallorca · Padel',
    date: 'Booked Mar 2026',
    rating: 5,
    body: 'A genuinely brilliant coach. Patient, technical, and pushed me to a level I didn’t think I could reach in a week. Already booked again for the autumn.',
  },
  {
    name: 'James R.',
    location: 'Cotswolds · Family booking',
    date: 'Booked Feb 2026',
    rating: 5,
    body: 'My kids went from shy beginners to confidently riding by day three. The trainer was incredible. Calm with the kids, and clear with feedback for me too.',
  },
  {
    name: 'Lucas M.',
    location: 'Tarifa · Kitesurf',
    date: 'Booked Jan 2026',
    rating: 4,
    body: 'Rapid progression and zero faff. The lessons were structured perfectly. Body drag, water start, riding upwind in three sessions.',
  },
  {
    name: 'Sofia D.',
    location: 'Chamonix · Off-piste',
    date: 'Booked Jan 2026',
    rating: 5,
    body: 'I’d been hesitant to leave the groomers, but left feeling like I could ski anywhere. Outstanding awareness of conditions and great rapport.',
  },
]

function ReviewsSection({ instructorName }: { instructorName: string }) {
  const totalReviews = PLACEHOLDER_REVIEWS.length
  const avgRating =
    PLACEHOLDER_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / totalReviews

  return (
    <section className="border-t border-white/10">
      <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        {/* Header row */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-white/50">
              Reviews
            </p>
            <h2 className="mt-3 font-['PP_Editorial_New'] text-3xl leading-[1.05] tracking-[-0.01em] text-white sm:text-4xl lg:text-5xl">
              What people say about{' '}
              <span className="italic text-white/85">{instructorName}.</span>
            </h2>
          </div>

          {/* Rating summary */}
          <div className="flex items-center gap-4 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(avgRating)
                      ? 'fill-white text-white'
                      : 'fill-transparent text-white/25'
                  }`}
                />
              ))}
            </div>
            <span className="font-['PP_Editorial_New'] text-2xl text-white">
              {avgRating.toFixed(1)}
            </span>
            <span className="font-['Archivo'] text-xs uppercase tracking-[0.18em] text-white/50">
              {totalReviews} reviews
            </span>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="mt-10 grid gap-4 sm:gap-5 md:grid-cols-2 md:mt-12">
          {PLACEHOLDER_REVIEWS.map((review, idx) => (
            <Panel key={idx} hoverable className="flex flex-col gap-5 p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < review.rating
                          ? 'fill-white text-white'
                          : 'fill-transparent text-white/25'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-['Archivo'] text-[11px] uppercase tracking-[0.18em] text-white/40">
                  {review.date}
                </span>
              </div>

              <blockquote className="flex-1 font-['PP_Editorial_New'] text-lg leading-snug text-white sm:text-xl">
                &ldquo;{review.body}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 font-['PP_Editorial_New'] text-sm text-white">
                  {review.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-['Archivo'] text-sm font-semibold text-white">
                    {review.name}
                  </p>
                  <p className="truncate font-['Archivo'] text-xs text-white/50">
                    {review.location}
                  </p>
                </div>
              </div>
            </Panel>
          ))}
        </div>

      </div>
    </section>
  )
}
