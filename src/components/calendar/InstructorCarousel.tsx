"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface InstructorImage {
  id: string
  instructor_id: string
  image_url: string
  caption?: string
  created_at: string
}

interface InstructorCarouselProps {
  images: InstructorImage[]
  className?: string
}

export function InstructorCarousel({ images, className = '' }: InstructorCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [dimensions, setDimensions] = useState({
    imageWidth: 300,
    imageHeight: 250,
    gap: 20,
    maxVisible: 3
  })

  // Lightbox keyboard + scroll-lock
  useEffect(() => {
    if (lightboxIndex === null) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') {
        setLightboxIndex((i) =>
          i === null ? null : Math.min(i + 1, images.length - 1),
        )
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((i) => (i === null ? null : Math.max(i - 1, 0)))
      }
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [lightboxIndex, images.length])

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)


  // Set up responsive dimensions based on container width
  useEffect(() => {
    const updateDimensions = (containerWidth: number) => {
      const preferredImageWidth = 300
      const minImageWidth = 200
      const margin = 32

      let config = { maxVisible: 1, imageWidth: minImageWidth, gap: 12 }

      const width3At300 = 3 * preferredImageWidth + 2 * 20 + margin
      if (containerWidth >= width3At300) {
        config = { maxVisible: 3, imageWidth: preferredImageWidth, gap: 20 }
      }
      else if (containerWidth >= 3 * minImageWidth + 2 * 16 + margin) {
        const scaledWidth = Math.floor((containerWidth - margin - 2 * 16) / 3)
        config = { maxVisible: 3, imageWidth: Math.max(scaledWidth, minImageWidth), gap: 16 }
      }
      else if (containerWidth >= 2 * preferredImageWidth + 1 * 20 + margin) {
        config = { maxVisible: 2, imageWidth: preferredImageWidth, gap: 20 }
      }
      else if (containerWidth >= 2 * minImageWidth + 1 * 16 + margin) {
        const scaledWidth = Math.floor((containerWidth - margin - 16) / 2)
        config = { maxVisible: 2, imageWidth: Math.max(scaledWidth, minImageWidth), gap: 16 }
      }
      else {
        const singleWidth = Math.max(containerWidth - margin, minImageWidth)
        config = { maxVisible: 1, imageWidth: Math.min(singleWidth, preferredImageWidth), gap: 12 }
      }

      const finalDimensions = {
        ...config,
        imageHeight: Math.round((config.imageWidth * 5) / 6)
      }

      setDimensions(finalDimensions)
    }

    if (!containerRef.current) {
      return
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width
        updateDimensions(width)
      }
    })

    const initialWidth = containerRef.current.offsetWidth
    updateDimensions(initialWidth)

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  // Don't render if no images
  if (!images || images.length === 0) {
    return null
  }

  // Use responsive dimensions for layout calculations
  const maxVisibleImages = Math.min(dimensions.maxVisible, images.length)
  const calculatedContainerWidth = maxVisibleImages * dimensions.imageWidth + (maxVisibleImages - 1) * dimensions.gap

  // Calculate total pages for page-based navigation
  const totalPages = Math.ceil(images.length / maxVisibleImages)
  const currentPage = Math.floor(currentIndex / maxVisibleImages)

  // Navigation controls - page-based navigation
  const canGoNext = currentPage < totalPages - 1
  const canGoPrev = currentPage > 0

  const nextSlide = () => {
    if (canGoNext) {
      const nextPageStartIndex = (currentPage + 1) * maxVisibleImages
      setCurrentIndex(Math.min(nextPageStartIndex, images.length - maxVisibleImages))
    }
  }

  const prevSlide = () => {
    if (canGoPrev) {
      const prevPageStartIndex = (currentPage - 1) * maxVisibleImages
      setCurrentIndex(Math.max(prevPageStartIndex, 0))
    }
  }

  // Handle horizontal scrolling with trackpad/mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    // Detect horizontal scroll (trackpad swipe or shift+wheel)
    const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey

    if (isHorizontalScroll && images.length > maxVisibleImages) {
      e.preventDefault()

      // Prevent rapid scrolling with debouncing
      if (isScrolling) return

      const scrollThreshold = 30
      const deltaX = e.shiftKey ? e.deltaY : e.deltaX // Use deltaY when shift is pressed

      if (Math.abs(deltaX) > scrollThreshold) {
        setIsScrolling(true)

        // Clear existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }

        // Determine scroll direction and navigate by page
        if (deltaX > 0 && canGoNext) {
          nextSlide()
        } else if (deltaX < 0 && canGoPrev) {
          prevSlide()
        }

        // Reset scrolling state after delay
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false)
        }, 150)
      }
    }
  }

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {/* Navigation arrows positioned above images */}
      <div className="flex justify-between items-center mb-4">
        <div>
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
            Photos
          </h3>
        </div>

        {images.length > maxVisibleImages && (
          <div className="flex gap-2">
            <motion.button
              onClick={prevSlide}
              disabled={!canGoPrev}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft size={20} />
            </motion.button>

            <motion.button
              onClick={nextSlide}
              disabled={!canGoNext}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>
        )}
      </div>

      {/* Images container - fully responsive width */}
      <div
        className="flex overflow-hidden select-none transition-all duration-300 ease-in-out w-full"
        style={{ gap: `${dimensions.gap}px` }}
        onWheel={handleWheel}
      >
        <div
          ref={scrollContainerRef}
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            gap: `${dimensions.gap}px`,
            transform: `translateX(-${currentIndex * (dimensions.imageWidth + dimensions.gap)}px)`
          }}
        >
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.button
                type="button"
                onClick={() => setLightboxIndex(index)}
                key={image.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group flex-shrink-0 cursor-zoom-in"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label={`Open photo ${index + 1}`}
              >
                <div
                  className="relative overflow-hidden rounded-lg bg-gray-800 transition-all duration-300 ease-in-out"
                  style={{
                    width: `${dimensions.imageWidth}px`,
                    height: `${dimensions.imageHeight}px`
                  }}
                >
                  <img
                    src={image.image_url}
                    alt={image.caption || `Instructor photo ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    style={{
                      maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)'
                    }}
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Caption if available */}
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {image.caption}
                      </p>
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Dots indicator - show pages, only if more than one page */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <button
              key={pageIndex}
              onClick={() => {
                const targetIndex = pageIndex === totalPages - 1
                  ? Math.max(images.length - maxVisibleImages, 0)
                  : pageIndex * maxVisibleImages
                setCurrentIndex(targetIndex)
              }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                pageIndex === currentPage
                  ? 'bg-white'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Lightbox overlay — portalled to <body> so it escapes any Framer
          `transform` ancestor that would otherwise contain `position:fixed` */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {lightboxIndex !== null && (
              <motion.div
                key="lightbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8"
                onClick={() => setLightboxIndex(null)}
                role="dialog"
                aria-modal="true"
                aria-label="Photo viewer"
              >
            {/* Close */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex(null)
              }}
              aria-label="Close photo viewer"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-white/85 backdrop-blur transition-colors hover:bg-white/[0.18] hover:text-white sm:right-6 sm:top-6"
            >
              <X className="h-5 w-5" strokeWidth={2.2} />
            </button>

            {/* Prev */}
            {lightboxIndex > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((i) => (i === null ? null : Math.max(i - 1, 0)))
                }}
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-white/85 backdrop-blur transition-colors hover:bg-white/[0.18] hover:text-white sm:left-6"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
              </button>
            )}

            {/* Next */}
            {lightboxIndex < images.length - 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((i) =>
                    i === null ? null : Math.min(i + 1, images.length - 1),
                  )
                }}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-white/85 backdrop-blur transition-colors hover:bg-white/[0.18] hover:text-white sm:right-6"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2.2} />
              </button>
            )}

                {/* Image + caption */}
                <motion.div
                  key={images[lightboxIndex].id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="relative flex max-h-[88vh] max-w-[92vw] flex-col items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={images[lightboxIndex].image_url}
                    alt={
                      images[lightboxIndex].caption ||
                      `Photo ${lightboxIndex + 1}`
                    }
                    className="max-h-[82vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
                  />
                  <div className="mt-4 flex items-center gap-4 font-['Archivo'] text-xs uppercase tracking-[0.22em] text-white/55">
                    <span>
                      {lightboxIndex + 1} / {images.length}
                    </span>
                    {images[lightboxIndex].caption && (
                      <>
                        <span className="h-px w-6 bg-white/20" />
                        <span className="normal-case tracking-normal text-white/80">
                          {images[lightboxIndex].caption}
                        </span>
                      </>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  )
}