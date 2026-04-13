"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'motion/react'
import { createBrowserAuthClient } from '@/lib/supabase/browser-auth'

export default function SignUpPage() {
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
          dateOfBirth,
          bio: bio.trim() || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to create account')
        setLoading(false)
        return
      }

      // Sign in the user after account creation
      const supabase = createBrowserAuthClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (signInError) {
        setError('Account created but sign-in failed. Please go to the login page.')
        setLoading(false)
        return
      }

      router.push('/raven/account')
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/raven" className="block text-center mb-10">
          <h1 className="font-['PP_Editorial_New'] text-4xl text-white">Raven</h1>
        </Link>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-8 backdrop-blur-md">
          <h2 className="font-['PP_Editorial_New'] text-2xl text-white mb-2">
            Create your account
          </h2>
          <p className="font-['Archivo'] text-sm text-[#d5d5d6] mb-8">
            {step === 1 ? 'Enter your details to get started' : 'Optional — tell us about yourself'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">
                      First name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] placeholder:text-[#9696a5] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      placeholder="Josh"
                    />
                  </div>
                  <div>
                    <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">
                      Last name *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] placeholder:text-[#9696a5] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      placeholder="Wade"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] placeholder:text-[#9696a5] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] placeholder:text-[#9696a5] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="Min 8 characters"
                  />
                </div>

                <div>
                  <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">
                    Date of birth *
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] placeholder:text-[#9696a5] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all [color-scheme:dark]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!firstName || !lastName || !email || !password || !dateOfBirth) {
                      setError('Please fill in all required fields')
                      return
                    }
                    if (password.length < 8) {
                      setError('Password must be at least 8 characters')
                      return
                    }
                    setError(null)
                    setStep(2)
                  }}
                  className="w-full py-4 rounded-xl font-['Archivo'] font-semibold bg-blue-400 text-white hover:bg-blue-500 transition-all"
                >
                  Continue
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block font-['Archivo'] text-sm text-[#d5d5d6] mb-2">
                    About yourself
                    <span className="text-[#9696a5] ml-1">(optional)</span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] placeholder:text-[#9696a5] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                    placeholder="Tell instructors a bit about yourself, your experience level, what you're looking for..."
                  />
                  <p className="font-['Archivo'] text-xs text-[#9696a5] mt-1 text-right">
                    {bio.length}/500
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 rounded-xl font-['Archivo'] font-semibold bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-4 rounded-xl font-['Archivo'] font-semibold transition-all ${
                      loading
                        ? 'bg-blue-400/50 text-white/50 cursor-not-allowed'
                        : 'bg-blue-400 text-white hover:bg-blue-500'
                    }`}
                  >
                    {loading ? 'Creating...' : 'Create account'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-center font-['Archivo'] text-sm text-[#9696a5] hover:text-white transition-colors"
                >
                  Skip and create account
                </button>
              </>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3"
              >
                <p className="font-['Archivo'] text-sm text-red-400">{error}</p>
              </motion.div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="font-['Archivo'] text-sm text-[#d5d5d6]">
              Already have an account?{' '}
              <Link
                href="/raven/login"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
