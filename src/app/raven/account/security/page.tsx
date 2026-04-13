"use client"

import { useState } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '@/lib/contexts/auth-context'

export default function SecurityPage() {
  const { user } = useAuth()

  // Email change
  const [newEmail, setNewEmail] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailSuccess, setEmailSuccess] = useState(false)

  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailSaving(true)
    setEmailError(null)
    setEmailSuccess(false)

    try {
      const res = await fetch('/api/account/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change-email', newEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        setEmailError(data.error)
      } else {
        setEmailSuccess(true)
        setNewEmail('')
        setTimeout(() => setEmailSuccess(false), 3000)
      }
    } catch {
      setEmailError('Failed to update email')
    } finally {
      setEmailSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setPasswordSaving(true)

    try {
      const res = await fetch('/api/account/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change-password', currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPasswordError(data.error)
      } else {
        setPasswordSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordSuccess(false), 3000)
      }
    } catch {
      setPasswordError('Failed to update password')
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div>
      <h1 className="font-['PP_Editorial_New'] text-2xl sm:text-3xl text-white mb-2">Email & Password</h1>
      <p className="font-['Archivo'] text-sm text-[#d5d5d6] mb-6 sm:mb-8">
        Manage your login credentials
      </p>

      <div className="space-y-6">
        {/* Email Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="font-['Archivo'] font-semibold text-lg text-white mb-1">Change Email</h2>
          <p className="font-['Archivo'] text-sm text-[#d5d5d6] mb-5">
            Current: <span className="text-white break-all">{user?.email || '—'}</span>
          </p>
          <form onSubmit={handleEmailChange} className="space-y-4 max-w-lg">
            <div>
              <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">New email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] placeholder:text-[#9696a5] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder="new@email.com"
              />
            </div>
            {emailError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="font-['Archivo'] text-sm text-red-400">{emailError}</p>
              </div>
            )}
            {emailSuccess && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
                <p className="font-['Archivo'] text-sm text-green-400">Email updated</p>
              </motion.div>
            )}
            <button
              type="submit"
              disabled={emailSaving}
              className={`px-8 py-3 rounded-xl font-['Archivo'] font-semibold transition-all ${
                emailSaving ? 'bg-blue-400/50 text-white/50 cursor-not-allowed' : 'bg-blue-400 text-white hover:bg-blue-500'
              }`}
            >
              {emailSaving ? 'Updating...' : 'Update email'}
            </button>
          </form>
        </div>

        {/* Password Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="font-['Archivo'] font-semibold text-lg text-white mb-5">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
            <div>
              <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] placeholder:text-[#9696a5] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] placeholder:text-[#9696a5] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder="Min 8 characters"
              />
            </div>
            <div>
              <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] placeholder:text-[#9696a5] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
            {passwordError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="font-['Archivo'] text-sm text-red-400">{passwordError}</p>
              </div>
            )}
            {passwordSuccess && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
                <p className="font-['Archivo'] text-sm text-green-400">Password updated</p>
              </motion.div>
            )}
            <button
              type="submit"
              disabled={passwordSaving}
              className={`px-8 py-3 rounded-xl font-['Archivo'] font-semibold transition-all ${
                passwordSaving ? 'bg-blue-400/50 text-white/50 cursor-not-allowed' : 'bg-blue-400 text-white hover:bg-blue-500'
              }`}
            >
              {passwordSaving ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
