"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { CartBadge } from "@/components/raven/cart-badge"
import { CartPanel } from "@/components/raven/cart-panel"
import { AmbientBackground } from "@/components/raven/ambient-background"

// Routes that keep their own signature background — they should NOT get the
// shared ambient gradient on top. Everything else under /raven/* gets it.
const AMBIENT_EXCLUDED_PATHS = new Set<string>([
  "/raven", // Homepage hero photography
  "/raven/login", // Split-screen AuthLayout with imagery
  "/raven/signup", // Split-screen AuthLayout with imagery
])

export default function RavenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isCartPanelOpen, setIsCartPanelOpen] = useState(false)

  const showAmbient = !AMBIENT_EXCLUDED_PATHS.has(pathname ?? "")

  return (
    <>
      {showAmbient && <AmbientBackground />}

      {children}

      {/* Floating Cart Badge */}
      <CartBadge onClick={() => setIsCartPanelOpen(true)} />

      {/* Slide-out Cart Panel */}
      <CartPanel
        isOpen={isCartPanelOpen}
        onClose={() => setIsCartPanelOpen(false)}
      />
    </>
  )
}
