"use client"

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'

interface NotificationType {
  id: number
  title: string
  description: string
  display_order: number
  subscribed: boolean
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState<number | null>(null)

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/account/notifications')
        const data = await res.json()
        if (res.ok) {
          setNotifications(data.data || [])
        } else {
          setError(data.error || 'Failed to load notifications')
        }
      } catch {
        setError('Failed to load notifications')
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  const handleToggle = async (id: number, currentState: boolean) => {
    setToggling(id)
    try {
      const res = await fetch('/api/account/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationTypeId: id, subscribed: !currentState }),
      })
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, subscribed: !currentState } : n)
        )
      }
    } catch {
      // Silently fail — toggle will stay in old state
    } finally {
      setToggling(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-['PP_Editorial_New'] text-2xl sm:text-3xl text-white mb-2">Notifications</h1>
      <p className="font-['Archivo'] text-sm text-[#d5d5d6] mb-6 sm:mb-8">
        Choose which email notifications you receive
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
          <p className="font-['Archivo'] text-sm text-red-400">{error}</p>
        </div>
      )}

      {notifications.length === 0 && !error ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-12 text-center">
          <p className="font-['PP_Editorial_New'] text-xl text-white mb-2">No notification types</p>
          <p className="font-['Archivo'] text-sm text-[#d5d5d6]">
            Notification preferences will appear here when available.
          </p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {notifications.map((notification, idx) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.03 }}
              className={`flex items-center justify-between px-4 py-3 sm:px-6 sm:py-5 ${
                idx < notifications.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              <div className="flex-1 min-w-0 mr-3 sm:mr-4">
                <h3 className="font-['Archivo'] font-semibold text-white text-sm">
                  {notification.title}
                </h3>
                {notification.description && (
                  <p className="font-['Archivo'] text-xs text-[#9696a5] mt-0.5">
                    {notification.description}
                  </p>
                )}
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => handleToggle(notification.id, notification.subscribed)}
                disabled={toggling === notification.id}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                  notification.subscribed ? 'bg-blue-400' : 'bg-white/10'
                } ${toggling === notification.id ? 'opacity-50' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notification.subscribed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
