"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import type { SignupDataPoint } from '@/lib/analytics/types'

interface SignupsChartProps {
  data: SignupDataPoint[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 backdrop-blur-sm border border-white/[0.1] rounded-lg p-3 shadow-xl">
        <p className="text-sm text-gray-300 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function SignupsChart({ data }: SignupsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        No signup data available for the selected period
      </div>
    )
  }

  // Format dates for display
  const formattedData = data.map(d => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric'
    })
  }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorInstructors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="displayDate"
            stroke="rgba(255,255,255,0.4)"
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.4)"
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span className="text-gray-300 text-sm">{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="instructorSignups"
            name="Instructors"
            stroke="#8B5CF6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorInstructors)"
          />
          <Area
            type="monotone"
            dataKey="customerSignups"
            name="Customers"
            stroke="#06B6D4"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCustomers)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
