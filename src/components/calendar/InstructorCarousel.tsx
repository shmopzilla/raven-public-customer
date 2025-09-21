"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
  const [isVisible, setIsVisible] = useState(true)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Show maximum of 3 images, let photo count determine container width
  const maxVisibleImages = Math.min(3, images.length)
  const containerWidth = maxVisibleImages * 300 + (maxVisibleImages - 1) * 20 // 300px per image + 20px gap between

  // Navigation controls - cycle through but stop at boundaries
  const canGoNext = currentIndex < images.length - maxVisibleImages
  const canGoPrev = currentIndex > 0

  const nextSlide = () => {
    if (canGoNext) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const prevSlide = () => {
    if (canGoPrev) {
      setCurrentIndex((prev) => prev - 1)
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

        // Determine scroll direction and navigate
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
    <div className={`w-full ${className}`}>
      {/* Navigation arrows positioned above images */}
      <div className="flex justify-between items-center mb-4">
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

      {/* Images container - dynamic width based on photo count */}
      <div
        className="flex gap-5 overflow-hidden select-none"
        style={{
          width: `${containerWidth}px`
        }}
        onWheel={handleWheel}
      >
        <div
          ref={scrollContainerRef}
          className="flex gap-5 transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 320}px)` // 300px + 20px gap
          }}
        >
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex-shrink-0 group cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="relative overflow-hidden rounded-lg bg-gray-800"
                  style={{
                    width: '300px',
                    height: '250px'
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
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Dots indicator - only show if more images than visible */}
      {images.length > maxVisibleImages && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: images.length - maxVisibleImages + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-white'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}