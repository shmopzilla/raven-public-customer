"use client"

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { SupabaseTableCard } from '@/components/ui/supabase-table-card'

interface TableStat {
  name: string
  count: number
}

interface StatsResponse {
  success: boolean
  connection: boolean
  totalTables: number
  totalRows: number
  tables: TableStat[]
  error?: string
  details?: string
}

export default function SupabaseDashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/supabase/stats')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to fetch statistics')
      }
      
      setStats(data)
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to fetch Supabase stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const filteredTables = stats?.tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent font-['Inter'] mb-4">
            Supabase Dashboard
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-['Inter']">
            Monitor your database tables and verify MCP integration
          </p>
        </motion.div>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center mb-8"
        >
          <div className="flex items-center space-x-3 bg-white/[0.05] backdrop-blur-sm border border-white/[0.1] rounded-full px-6 py-3">
            <div className={`w-3 h-3 rounded-full ${
              stats?.connection ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`} />
            <span className="text-sm font-medium">
              {loading ? 'Connecting...' : stats?.connection ? 'Connected' : 'Disconnected'}
            </span>
            {stats?.connection && (
              <button
                onClick={fetchStats}
                className="text-xs bg-white/[0.1] hover:bg-white/[0.2] transition-colors px-3 py-1 rounded-full"
              >
                Refresh
              </button>
            )}
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8 text-center"
          >
            <p className="text-red-400 font-medium">Error: {error}</p>
            <button
              onClick={fetchStats}
              className="mt-3 bg-red-500/20 hover:bg-red-500/30 transition-colors px-4 py-2 rounded-lg text-sm"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Stats Overview */}
        {stats && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-white/[0.05] backdrop-blur-sm border border-white/[0.1] rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.totalTables}</div>
              <div className="text-gray-400">Total Tables</div>
            </div>
            <div className="bg-white/[0.05] backdrop-blur-sm border border-white/[0.1] rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.totalRows.toLocaleString()}</div>
              <div className="text-gray-400">Total Rows</div>
            </div>
            <div className="bg-white/[0.05] backdrop-blur-sm border border-white/[0.1] rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {stats.tables.filter(t => t.count > 0).length}
              </div>
              <div className="text-gray-400">Active Tables</div>
            </div>
          </motion.div>
        )}

        {/* Search */}
        {stats && stats.tables.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-8"
          >
            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/[0.3] transition-colors"
              />
            </div>
          </motion.div>
        )}

        {/* Tables Grid */}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredTables.map((table, index) => (
              <motion.div
                key={table.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <SupabaseTableCard
                  name={table.name}
                  count={table.count}
                  isLoading={loading}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="bg-white/[0.05] backdrop-blur-sm border border-white/[0.1] rounded-xl p-6 animate-pulse"
              >
                <div className="space-y-4">
                  <div className="h-6 bg-white/[0.1] rounded"></div>
                  <div className="h-8 bg-white/[0.1] rounded w-20"></div>
                  <div className="h-2 bg-white/[0.1] rounded"></div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {stats && filteredTables.length === 0 && !loading && searchTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-400 text-lg">No tables found matching &quot;{searchTerm}&quot;</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}