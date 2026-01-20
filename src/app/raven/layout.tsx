"use client"

import { useState } from "react"
import { CartBadge } from "@/components/raven/cart-badge"
import { CartPanel } from "@/components/raven/cart-panel"

export default function RavenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCartPanelOpen, setIsCartPanelOpen] = useState(false)

  return (
    <>
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
