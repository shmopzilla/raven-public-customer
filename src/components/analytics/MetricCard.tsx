"use client"

import { motion } from 'motion/react'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'info'
  delay?: number
}

const variantStyles = {
  default: 'text-white',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400'
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  delay = 0
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-white/[0.05] backdrop-blur-sm border border-white/[0.1] rounded-xl p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${variantStyles[variant]}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-2 bg-white/[0.05] rounded-lg">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>
    </motion.div>
  )
}
