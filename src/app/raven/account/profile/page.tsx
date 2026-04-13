"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '@/lib/contexts/auth-context'
import { createBrowserAuthClient } from '@/lib/supabase/browser-auth'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/account/profile')
        const data = await res.json()
        if (res.ok && data.data) {
          setAvatarUrl(data.data.avatar_url || null)
          setBio(data.data.bio || '')
        }
      } catch {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    setError(null)

    try {
      const supabase = createBrowserAuthClient()
      const ext = file.name.split('.').pop()
      const filePath = `${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        setError('Failed to upload image: ' + uploadError.message)
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Save URL to profile
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: publicUrl }),
      })

      if (res.ok) {
        setAvatarUrl(publicUrl)
        await refreshUser()
      } else {
        setError('Failed to save avatar')
      }
    } catch {
      setError('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveBio = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio }),
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save')
      }
    } catch {
      setError('Failed to save')
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
      <h1 className="font-['PP_Editorial_New'] text-2xl sm:text-3xl text-white mb-2">Profile & Photo</h1>
      <p className="font-['Archivo'] text-sm text-[#d5d5d6] mb-6 sm:mb-8">
        Manage your profile picture and bio
      </p>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="font-['Archivo'] font-semibold text-lg text-white mb-5">Profile Picture</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white/10 flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-400/20 flex items-center justify-center border-2 border-white/10 flex-shrink-0">
                <span className="font-['Archivo'] text-xl sm:text-2xl font-bold text-blue-400">
                  {user?.user_metadata?.first_name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <div className="flex flex-col items-center sm:items-start">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`px-5 sm:px-6 py-2.5 rounded-xl font-['Archivo'] text-sm font-semibold transition-all ${
                  uploading
                    ? 'bg-white/10 text-white/50 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                {uploading ? 'Uploading...' : 'Upload new photo'}
              </button>
              <p className="font-['Archivo'] text-xs text-[#9696a5] mt-2">
                JPG, PNG or WebP. Max 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="font-['Archivo'] font-semibold text-lg text-white mb-5">About You</h2>
          <div className="max-w-lg space-y-4">
            <div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-['Archivo'] placeholder:text-[#9696a5] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                placeholder="Tell instructors about yourself, your experience level, and what you're looking for..."
              />
              <p className="font-['Archivo'] text-xs text-[#9696a5] mt-1 text-right">{bio.length}/500</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="font-['Archivo'] text-sm text-red-400">{error}</p>
              </div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
                <p className="font-['Archivo'] text-sm text-green-400">Bio saved</p>
              </motion.div>
            )}

            <button
              onClick={handleSaveBio}
              disabled={saving}
              className={`px-8 py-3 rounded-xl font-['Archivo'] font-semibold transition-all ${
                saving ? 'bg-blue-400/50 text-white/50 cursor-not-allowed' : 'bg-blue-400 text-white hover:bg-blue-500'
              }`}
            >
              {saving ? 'Saving...' : 'Save bio'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
