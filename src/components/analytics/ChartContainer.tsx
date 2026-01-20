"use client"

import { motion } from 'motion/react'
import { ReactNode } from 'react'

interface ChartContainerProps {
  title: string
  description?: string
  children: ReactNode
  isLoading?: boolean
  delay?: number
  className?: string
}

export function ChartContainer({
  title,
  description,
  children,
  isLoading = false,
  delay = 0,
  className = ''
}: ChartContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white/[0.05] backdrop-blur-sm border border-white/[0.1] rounded-xl p-6 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && (
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-[200px] bg-white/[0.05] rounded-lg flex items-center justify-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      ) : (
        children
      )}
    </motion.div>
  )
}
