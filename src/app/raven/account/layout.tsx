"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { useAuth } from '@/lib/contexts/auth-context'

const navItems = [
  { href: '/raven/account/bookings', label: 'Booking Requests', icon: '📋' },
  { href: '/raven/account/payments', label: 'Invoices & Payments', icon: '💳' },
  { href: '/raven/account/details', label: 'Personal Details', icon: '👤' },
  { href: '/raven/account/security', label: 'Email & Password', icon: '🔒' },
  { href: '/raven/account/profile', label: 'Profile & Photo', icon: '📸' },
  { href: '/raven/account/notifications', label: 'Notifications', icon: '🔔' },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/raven" className="font-['PP_Editorial_New'] text-2xl text-white">
            Raven
          </Link>
          <div className="flex items-center gap-3">
            {user && (
              <span className="font-['Archivo'] text-sm text-[#d5d5d6] hidden sm:block">
                {user.user_metadata?.first_name} {user.user_metadata?.last_name}
              </span>
            )}
            <Link
              href="/raven"
              className="font-['Archivo'] text-sm text-[#9696a5] hover:text-white transition-colors"
            >
              Back to Raven
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar — Desktop */}
          <nav className="hidden lg:block w-[240px] flex-shrink-0">
            <div className="sticky top-24 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md overflow-hidden">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      className={`flex items-center gap-3 px-5 py-4 font-['Archivo'] text-sm transition-colors border-b border-white/5 last:border-b-0 ${
                        isActive
                          ? 'bg-blue-400/10 text-blue-400'
                          : 'text-[#d5d5d6] hover:bg-white/5 hover:text-white'
                      }`}
                      whileHover={{ x: isActive ? 0 : 2 }}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Top Tabs — Mobile */}
          <nav className="lg:hidden overflow-x-auto scrollbar-hide -mx-4 px-4" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex gap-2 min-w-max pb-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-['Archivo'] text-xs sm:text-sm whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-blue-400 text-white'
                          : 'bg-white/5 border border-white/10 text-[#d5d5d6]'
                      }`}
                    >
                      <span className="text-xs sm:text-sm">{item.icon}</span>
                      {item.label}
                    </div>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
