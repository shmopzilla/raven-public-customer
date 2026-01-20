"use client"

import { motion } from 'motion/react'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onPresetClick?: (preset: string) => void
}

const presets = [
  { label: '7D', value: '7days' },
  { label: '30D', value: '30days' },
  { label: '90D', value: '90days' },
  { label: 'All', value: 'all' }
]

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onPresetClick
}: DateRangePickerProps) {
  const handlePresetClick = (preset: string) => {
    const today = new Date()
    const end = today.toISOString().split('T')[0]
    let start = ''

    switch (preset) {
      case '7days':
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(today.getDate() - 7)
        start = sevenDaysAgo.toISOString().split('T')[0]
        break
      case '30days':
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(today.getDate() - 30)
        start = thirtyDaysAgo.toISOString().split('T')[0]
        break
      case '90days':
        const ninetyDaysAgo = new Date(today)
        ninetyDaysAgo.setDate(today.getDate() - 90)
        start = ninetyDaysAgo.toISOString().split('T')[0]
        break
      case 'all':
        start = ''
        break
    }

    onStartDateChange(start)
    onEndDateChange(preset === 'all' ? '' : end)
    onPresetClick?.(preset)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-center gap-3"
    >
      {/* Preset buttons */}
      <div className="flex gap-1">
        {presets.map(preset => (
          <button
            key={preset.value}
            onClick={() => handlePresetClick(preset.value)}
            className="px-3 py-1.5 text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded-lg transition-colors text-gray-300 hover:text-white"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Date inputs */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="px-3 py-1.5 text-sm bg-white/[0.05] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:border-white/[0.3] transition-colors [color-scheme:dark]"
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="px-3 py-1.5 text-sm bg-white/[0.05] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:border-white/[0.3] transition-colors [color-scheme:dark]"
        />
      </div>
    </motion.div>
  )
}
