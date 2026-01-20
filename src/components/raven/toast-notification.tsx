"use client"

import { motion, AnimatePresence } from "motion/react"
import { useEffect } from "react"

interface ToastNotificationProps {
  isVisible: boolean
  message: string
  onClose: () => void
  duration?: number
  type?: "success" | "info" | "error"
}

export function ToastNotification({
  isVisible,
  message,
  onClose,
  duration = 3000,
  type = "success"
}: ToastNotificationProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  }

  const colors = {
    success: "bg-green-500/20 border-green-500/40 text-green-400",
    info: "bg-blue-500/20 border-blue-500/40 text-blue-400",
    error: "bg-red-500/20 border-red-500/40 text-red-400"
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed top-8 right-8 z-[100] pointer-events-auto"
        >
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-md shadow-2xl ${colors[type]}`}>
            <div className="flex-shrink-0">
              {icons[type]}
            </div>
            <p className="font-['Archivo'] font-medium text-white">
              {message}
            </p>
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-2 text-white/60 hover:text-white transition-colors"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
