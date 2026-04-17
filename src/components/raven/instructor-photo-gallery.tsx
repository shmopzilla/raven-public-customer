"use client"

/**
 * InstructorPhotoGallery
 * ----------------------------------------------------------------------------
 * Editorial, full-width photo gallery for instructor profile pages. Replaces
 * the old boxed carousel with a layout that gives photos real weight and
 * makes the instructor's style and personality the primary signal.
 *
 * Desktop (≥lg):
 *   Asymmetric grid — one feature tile (7/12 cols, aspect 4/5) + two stacked
 *   tiles (5/12 cols, aspect 4/3). When there are 5+ photos, a second 3-up
 *   row appears beneath with a "See all N photos" link bottom-right.
 *
 * Below lg:
 *   Horizontal scroll-snap strip. Each slide peeks at the next on the edge,
 *   creating a tactile, filmic feel. Progress bar replaces dots (scales past
 *   many photos).
 *
 * Lightbox:
 *   Grid-first on "See all" clicks (Airbnb pattern) — shows every photo as
 *   a thumbnail grid, tap one to enter single-photo mode with prev/next.
 *   Single-photo mode has a "Back to all photos" control.
 *
 * Graceful degradation: returns null at 0 photos. At 1-2 photos, the grid
 * collapses to a single hero or a 2-up without the stacked right column.
 */

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "motion/react"
import { ChevronLeft, ChevronRight, X, Grid3x3 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface InstructorPhoto {
  id: string
  instructor_id: string
  image_url: string
  caption?: string
  created_at: string
}

interface InstructorPhotoGalleryProps {
  images: InstructorPhoto[]
  instructorName?: string
  className?: string
}

type LightboxMode = "grid" | "single" | null

export function InstructorPhotoGallery({
  images,
  instructorName,
  className,
}: InstructorPhotoGalleryProps) {
  const [lightboxMode, setLightboxMode] = useState<LightboxMode>(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openGrid = () => {
    setLightboxMode("grid")
  }

  const openSingle = (index: number) => {
    setLightboxIndex(index)
    setLightboxMode("single")
  }

  const closeLightbox = () => {
    setLightboxMode(null)
  }

  // Keyboard + scroll lock while lightbox is open
  useEffect(() => {
    if (lightboxMode === null) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox()
        return
      }
      if (lightboxMode !== "single") return
      if (e.key === "ArrowRight") {
        setLightboxIndex((i) => Math.min(i + 1, images.length - 1))
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((i) => Math.max(i - 1, 0))
      }
      if (e.key === "Home") setLightboxIndex(0)
      if (e.key === "End") setLightboxIndex(images.length - 1)
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [lightboxMode, images.length])

  if (!images || images.length === 0) return null

  const displayTitle = instructorName ? `In the field with ${instructorName}` : "Photos"
  const totalCount = images.length

  return (
    <section
      className={cn("border-t border-white/10", className)}
      aria-label="Instructor photos"
    >
      <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        {/* Heading row — matches the Reviews section rhythm */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-white/50">
              Photos
            </p>
            <h2 className="mt-3 font-['PP_Editorial_New'] text-3xl leading-[1.05] text-white sm:text-4xl lg:text-5xl">
              {instructorName ? (
                <>
                  In the field with <span className="italic">{instructorName}</span>.
                </>
              ) : (
                <>On the mountain.</>
              )}
            </h2>
          </div>

          {totalCount > 1 && (
            <button
              type="button"
              onClick={openGrid}
              className="group/all inline-flex items-center gap-2 font-['Archivo'] text-sm text-white/75 transition-colors hover:text-white"
            >
              <span className="underline decoration-white/30 underline-offset-[6px] group-hover/all:decoration-white">
                See all {totalCount} photos
              </span>
              <Grid3x3 className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Desktop / tablet asymmetric grid */}
        <div className="mt-10 hidden lg:block sm:mt-12">
          <DesktopGrid images={images} onOpen={openSingle} />
        </div>

        {/* Tablet fallback — simpler grid */}
        <div className="mt-10 hidden sm:block lg:hidden">
          <TabletGrid images={images} onOpen={openSingle} />
        </div>

        {/* Mobile scroll-snap strip */}
        <div className="mt-8 sm:hidden">
          <MobileStrip images={images} onOpen={openSingle} />
        </div>
      </div>

      {/* Lightbox portalled to body so it escapes any transform ancestors */}
      {typeof window !== "undefined" &&
        lightboxMode !== null &&
        createPortal(
          <Lightbox
            images={images}
            mode={lightboxMode}
            index={lightboxIndex}
            onClose={closeLightbox}
            onSelect={(i) => openSingle(i)}
            onBackToGrid={() => setLightboxMode("grid")}
            onNext={() =>
              setLightboxIndex((i) => Math.min(i + 1, images.length - 1))
            }
            onPrev={() => setLightboxIndex((i) => Math.max(i - 1, 0))}
          />,
          document.body,
        )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Desktop grid — editorial asymmetric layout
// ---------------------------------------------------------------------------

function DesktopGrid({
  images,
  onOpen,
}: {
  images: InstructorPhoto[]
  onOpen: (index: number) => void
}) {
  const count = images.length

  // 1 photo — single hero
  if (count === 1) {
    return (
      <Tile
        image={images[0]}
        index={0}
        onOpen={onOpen}
        className="aspect-[16/9] w-full"
      />
    )
  }

  // 2 photos — two 4:5 side-by-side
  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Tile image={images[0]} index={0} onOpen={onOpen} className="aspect-[4/5]" />
        <Tile image={images[1]} index={1} onOpen={onOpen} className="aspect-[4/5]" />
      </div>
    )
  }

  // 3+ photos — feature left + 2 stacked right
  const feature = images[0]
  const stack = images.slice(1, 3)
  const secondRow = images.slice(3, 6) // up to 3 more in a second row

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <Tile
          image={feature}
          index={0}
          onOpen={onOpen}
          className="col-span-7 row-span-2 aspect-[4/5]"
        />
        <div className="col-span-5 flex flex-col gap-4">
          {stack.map((image, i) => (
            <Tile
              key={image.id}
              image={image}
              index={i + 1}
              onOpen={onOpen}
              className="aspect-[4/3] flex-1"
            />
          ))}
        </div>
      </div>

      {secondRow.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {secondRow.map((image, i) => (
            <Tile
              key={image.id}
              image={image}
              index={i + 3}
              onOpen={onOpen}
              className="aspect-[4/3]"
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tablet grid — feature on top, 2-up below
// ---------------------------------------------------------------------------

function TabletGrid({
  images,
  onOpen,
}: {
  images: InstructorPhoto[]
  onOpen: (index: number) => void
}) {
  const count = images.length

  if (count === 1) {
    return (
      <Tile
        image={images[0]}
        index={0}
        onOpen={onOpen}
        className="aspect-[16/9] w-full"
      />
    )
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Tile image={images[0]} index={0} onOpen={onOpen} className="aspect-[4/5]" />
        <Tile image={images[1]} index={1} onOpen={onOpen} className="aspect-[4/5]" />
      </div>
    )
  }

  const feature = images[0]
  const rest = images.slice(1, 5) // up to 4 more below

  return (
    <div className="space-y-3">
      <Tile
        image={feature}
        index={0}
        onOpen={onOpen}
        className="aspect-[16/9] w-full"
      />
      <div className="grid grid-cols-2 gap-3">
        {rest.map((image, i) => (
          <Tile
            key={image.id}
            image={image}
            index={i + 1}
            onOpen={onOpen}
            className="aspect-[4/3]"
          />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mobile scroll-snap strip
// ---------------------------------------------------------------------------

function MobileStrip({
  images,
  onOpen,
}: {
  images: InstructorPhoto[]
  onOpen: (index: number) => void
}) {
  return (
    <div className="-mx-4">
      <div
        className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            onClick={() => onOpen(i)}
            className="relative aspect-[4/5] w-[82%] flex-shrink-0 snap-start overflow-hidden rounded-lg bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
            aria-label={`Open photo ${i + 1} of ${images.length}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.image_url}
              alt={image.caption || `Photo ${i + 1}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tile — the reusable photo button (subtle lift on hover, focus ring, no
// double-scale)
// ---------------------------------------------------------------------------

function Tile({
  image,
  index,
  onOpen,
  className,
}: {
  image: InstructorPhoto
  index: number
  onOpen: (index: number) => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className={cn(
        "group/tile relative overflow-hidden rounded-lg bg-white/5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black motion-reduce:hover:translate-y-0",
        className,
      )}
      aria-label={image.caption ? `Open photo: ${image.caption}` : "Open photo"}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.image_url}
        alt={image.caption || ""}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      {image.caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover/tile:opacity-100">
          <p className="font-['Archivo'] text-sm text-white">{image.caption}</p>
        </div>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Lightbox — grid mode + single-photo mode, portalled
// ---------------------------------------------------------------------------

function Lightbox({
  images,
  mode,
  index,
  onClose,
  onSelect,
  onBackToGrid,
  onNext,
  onPrev,
}: {
  images: InstructorPhoto[]
  mode: "grid" | "single"
  index: number
  onClose: () => void
  onSelect: (index: number) => void
  onBackToGrid: () => void
  onNext: () => void
  onPrev: () => void
}) {
  const total = images.length
  const current = images[index]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "grid" ? "All photos" : "Photo viewer"}
    >
      {/* Top bar — close + counter + back-to-grid */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          {mode === "single" && total > 1 && (
            <button
              type="button"
              onClick={onBackToGrid}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-['Archivo'] text-xs text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Grid3x3 className="h-3.5 w-3.5" strokeWidth={1.8} />
              All photos
            </button>
          )}
          <span className="font-['Archivo'] text-xs uppercase tracking-[0.2em] text-white/55">
            {mode === "single" ? `${index + 1} / ${total}` : `${total} photos`}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Body */}
      <AnimatePresence mode="wait">
        {mode === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-10"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {images.map((image, i) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => onSelect(i)}
                  className="group/thumb relative aspect-[4/5] overflow-hidden rounded-lg bg-white/5 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black motion-reduce:hover:translate-y-0"
                  aria-label={`View photo ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.image_url}
                    alt={image.caption || `Photo ${i + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {image.caption && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 opacity-0 transition-opacity group-hover/thumb:opacity-100">
                      <p className="font-['Archivo'] text-xs text-white">
                        {image.caption}
                      </p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="single"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-[calc(100vh-64px)] items-center justify-center px-4 sm:px-16"
          >
            {/* Prev / Next */}
            {index > 0 && (
              <button
                type="button"
                onClick={onPrev}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/80 hover:text-white sm:left-6"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
              </button>
            )}
            {index < total - 1 && (
              <button
                type="button"
                onClick={onNext}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/80 hover:text-white sm:right-6"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2} />
              </button>
            )}

            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex h-full w-full items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.image_url}
                alt={current.caption || `Photo ${index + 1}`}
                className="max-h-full max-w-full object-contain"
              />
            </motion.div>

            {current.caption && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[80%] rounded-full border border-white/15 bg-black/60 px-4 py-2 backdrop-blur-sm">
                <p className="font-['Archivo'] text-xs text-white/85 sm:text-sm">
                  {current.caption}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
