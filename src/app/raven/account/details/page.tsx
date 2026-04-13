"use client"

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'

export default function DetailsPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch('/api/account/details')
        const data = await res.json()
        if (res.ok && data.data) {
          setFirstName(data.data.first_name || '')
          setLastName(data.data.last_name || '')
          setDateOfBirth(data.data.date_of_birth || '')
          setEmail(data.data.email || '')
        }
      } catch {
        setError('Failed to load details')
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/account/details', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, dateOfBirth }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to save')
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch {
      setError('Failed to save changes')
    } finally {
      setSaving(false)
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
      <h1 className="font-['PP_Editorial_New'] text-2xl sm:text-3xl text-white mb-2">Personal Details</h1>
      <p className="font-['Archivo'] text-sm text-[#d5d5d6] mb-6 sm:mb-8">
        Update your personal information
      </p>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-5 max-w-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[#9696a5] font-['Archivo'] cursor-not-allowed"
            />
            <p className="font-['Archivo'] text-xs text-[#9696a5] mt-1">
              Email can be changed in the Email & Password section
            </p>
          </div>

          <div>
            <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">Date of birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all [color-scheme:dark]"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <p className="font-['Archivo'] text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3"
            >
              <p className="font-['Archivo'] text-sm text-green-400">Changes saved successfully</p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={saving}
            className={`px-8 py-3 rounded-xl font-['Archivo'] font-semibold transition-all ${
              saving
                ? 'bg-blue-400/50 text-white/50 cursor-not-allowed'
                : 'bg-blue-400 text-white hover:bg-blue-500'
            }`}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
