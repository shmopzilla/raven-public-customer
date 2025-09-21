"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
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
  const [isScrolling, setIsScrolling] = useState(false)
  const [dimensions, setDimensions] = useState({
    imageWidth: 300,
    imageHeight: 250,
    gap: 20,
    maxVisible: 3
  })

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)


  // Set up responsive dimensions based on container width
  useEffect(() => {
    console.log('InstructorCarousel: useEffect initializing, containerRef present:', !!containerRef.current)

    const updateDimensions = (containerWidth: number) => {
      console.log('InstructorCarousel: Container width:', containerWidth)

      // More aggressive sizing strategy: account for space constraints
      const preferredImageWidth = 300
      const minImageWidth = 200 // Reduced from 240 for better scaling
      const margin = 32 // Account for some margin

      let config = { maxVisible: 1, imageWidth: minImageWidth, gap: 12 }

      // Try 3 images at preferred size (300px each + gaps)
      const width3At300 = 3 * preferredImageWidth + 2 * 20 + margin // 980px total
      if (containerWidth >= width3At300) {
        config = { maxVisible: 3, imageWidth: preferredImageWidth, gap: 20 }
        console.log('InstructorCarousel: Using 3 images at 300px')
      }
      // Try 3 images scaled down
      else if (containerWidth >= 3 * minImageWidth + 2 * 16 + margin) { // 664px total
        const scaledWidth = Math.floor((containerWidth - margin - 2 * 16) / 3)
        config = { maxVisible: 3, imageWidth: Math.max(scaledWidth, minImageWidth), gap: 16 }
        console.log('InstructorCarousel: Using 3 scaled images at', config.imageWidth + 'px')
      }
      // Try 2 images at preferred size (300px each + gaps)
      else if (containerWidth >= 2 * preferredImageWidth + 1 * 20 + margin) { // 652px total
        config = { maxVisible: 2, imageWidth: preferredImageWidth, gap: 20 }
        console.log('InstructorCarousel: Using 2 images at 300px')
      }
      // Try 2 images scaled down
      else if (containerWidth >= 2 * minImageWidth + 1 * 16 + margin) { // 448px total
        const scaledWidth = Math.floor((containerWidth - margin - 16) / 2)
        config = { maxVisible: 2, imageWidth: Math.max(scaledWidth, minImageWidth), gap: 16 }
        console.log('InstructorCarousel: Using 2 scaled images at', config.imageWidth + 'px')
      }
      // Fall back to 1 image
      else {
        const singleWidth = Math.max(containerWidth - margin, minImageWidth)
        config = { maxVisible: 1, imageWidth: Math.min(singleWidth, preferredImageWidth), gap: 12 }
        console.log('InstructorCarousel: Using 1 image at', config.imageWidth + 'px')
      }

      const finalDimensions = {
        ...config,
        imageHeight: Math.round((config.imageWidth * 5) / 6) // Maintain 6:5 aspect ratio
      }

      console.log('InstructorCarousel: Final dimensions:', finalDimensions)
      setDimensions(finalDimensions)
    }

    if (!containerRef.current) {
      console.log('InstructorCarousel: containerRef is null, will retry on next render')
      return
    }

    console.log('InstructorCarousel: Setting up ResizeObserver')

    const resizeObserver = new ResizeObserver((entries) => {
      console.log('InstructorCarousel: ResizeObserver triggered with', entries.length, 'entries')
      for (const entry of entries) {
        const width = entry.contentRect.width
        console.log('InstructorCarousel: New container width from ResizeObserver:', width)
        updateDimensions(width)
      }
    })

    // Set initial dimensions
    const initialWidth = containerRef.current.offsetWidth
    console.log('InstructorCarousel: Initial container width:', initialWidth)
    updateDimensions(initialWidth)

    resizeObserver.observe(containerRef.current)

    return () => {
      console.log('InstructorCarousel: Cleaning up ResizeObserver')
      resizeObserver.disconnect()
    }
  }, [containerRef.current]) // Re-run when containerRef.current changes

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

  // Debug current dimensions
  console.log('InstructorCarousel: Current dimensions state:', dimensions)
  console.log('InstructorCarousel: Rendering with images count:', images.length)

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
          <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
            {dimensions.maxVisible} images at {dimensions.imageWidth}px (gap: {dimensions.gap}px)
          </div>
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
              </motion.div>
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
    </div>
  )
}