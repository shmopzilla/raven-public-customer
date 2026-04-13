"use client"

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'

const PAYMENT_STATUS_MAP: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'None', color: 'text-[#9696a5]', bg: 'bg-white/5 border-white/10' },
  2: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30' },
  3: { label: 'Paid', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
  4: { label: 'Void', color: 'text-[#9696a5]', bg: 'bg-white/5 border-white/10' },
  5: { label: 'Deposit Paid', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
  6: { label: 'Refunded', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' },
}

interface Payment {
  id: number
  booking_id: number
  price: number
  status: number
  payment_type: string
  is_deposit: boolean
  deposit_amount: number | null
  balance_amount: number | null
  created_at: string
  booking: {
    reference: string
    start_date: string
    end_date: string
    price: number
    instructor_name: string
  } | null
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch('/api/account/payments')
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Failed to load payments')
        } else {
          setPayments(data.data || [])
        }
      } catch {
        setError('Failed to load payments')
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-['PP_Editorial_New'] text-2xl sm:text-3xl text-white mb-2">Invoices & Payments</h1>
      <p className="font-['Archivo'] text-sm text-[#d5d5d6] mb-6 sm:mb-8">
        View your payment history and invoices
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
          <p className="font-['Archivo'] text-sm text-red-400">{error}</p>
        </div>
      )}

      {payments.length === 0 && !error ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-12 text-center">
          <p className="font-['PP_Editorial_New'] text-xl text-white mb-2">No payments yet</p>
          <p className="font-['Archivo'] text-sm text-[#d5d5d6]">
            Payment records will appear here once you make a booking.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment, idx) => {
            const statusInfo = PAYMENT_STATUS_MAP[payment.status] || { label: 'Unknown', color: 'text-[#9696a5]', bg: 'bg-white/5 border-white/10' }

            return (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-['Archivo'] font-semibold text-white text-sm sm:text-base">
                      {payment.booking?.instructor_name || 'Unknown Instructor'}
                    </h3>
                    {payment.booking && (
                      <p className="font-['Archivo'] text-xs sm:text-sm text-[#d5d5d6] mt-0.5">
                        {formatDate(payment.booking.start_date)} — {formatDate(payment.booking.end_date)}
                      </p>
                    )}
                    <p className="font-['Archivo'] text-xs text-[#9696a5] mt-1 truncate">
                      Ref: {payment.booking?.reference || '—'} &middot; {payment.payment_type}
                      {payment.is_deposit && ' (deposit)'}
                    </p>
                    <p className="font-['Archivo'] text-xs text-[#9696a5] mt-0.5">
                      {formatDate(payment.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 sm:flex-col sm:items-end flex-shrink-0">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-['Archivo'] font-semibold border ${statusInfo.bg} ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <span className="font-['Archivo'] text-lg font-bold text-white">
                      &euro;{payment.price}
                    </span>
                  </div>
                </div>

                {payment.is_deposit && (payment.deposit_amount || payment.balance_amount) && (
                  <div className="mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-white/5 flex gap-4 sm:gap-6">
                    {payment.deposit_amount && (
                      <div>
                        <p className="font-['Archivo'] text-xs text-[#9696a5]">Deposit</p>
                        <p className="font-['Archivo'] text-sm font-semibold text-white">&euro;{payment.deposit_amount}</p>
                      </div>
                    )}
                    {payment.balance_amount && (
                      <div>
                        <p className="font-['Archivo'] text-xs text-[#9696a5]">Balance due</p>
                        <p className="font-['Archivo'] text-sm font-semibold text-white">&euro;{payment.balance_amount}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
