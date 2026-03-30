"use client"

import { cn } from "@/lib/utils"
import type { SlotIndicatorProps } from "@/lib/calendar/types"

export function SlotIndicator({ slotState, className }: SlotIndicatorProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-start overflow-hidden rounded-lg shrink-0 w-[34px]",
        className
      )}
      data-name="slots"
    >
      {/* Morning Slot */}
      <div 
        className={cn(
          "basis-0 grow h-2 min-h-px min-w-px shrink-0 transition-colors duration-200",
          slotState.morning ? "bg-[#8CDBFB]" : "bg-[#050506]"
        )}
        data-name="morning-slot"
      />
      
      {/* Lunch Slot */}
      <div 
        className={cn(
          "basis-0 grow h-2 min-h-px min-w-px shrink-0 transition-colors duration-200",
          slotState.lunch ? "bg-[#8CDBFB]" : "bg-[#050506]"
        )}
        data-name="lunch-slot"
      />
      
      {/* Afternoon Slot */}
      <div 
        className={cn(
          "basis-0 grow h-2 min-h-px min-w-px shrink-0 transition-colors duration-200",
          slotState.afternoon ? "bg-[#8CDBFB]" : "bg-[#050506]"
        )}
        data-name="afternoon-slot"
      />
      
      {/* Evening Slot */}
      <div
        className={cn(
          "basis-0 grow h-2 min-h-px min-w-px shrink-0 transition-colors duration-200",
          slotState.evening ? "bg-[#8CDBFB]" : "bg-[#050506]"
        )}
        data-name="evening-slot"
      />

      {/* Night Slot */}
      <div
        className={cn(
          "basis-0 grow h-2 min-h-px min-w-px shrink-0 transition-colors duration-200",
          slotState.night ? "bg-[#8CDBFB]" : "bg-[#050506]"
        )}
        data-name="night-slot"
      />
    </div>
  )
}