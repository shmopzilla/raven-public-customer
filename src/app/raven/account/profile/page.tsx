"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { createBrowserAuthClient } from "@/lib/supabase/browser-auth";
import {
  Banner,
  Button,
  Field,
  Panel,
  SectionHeading,
  Textarea,
} from "@/components/raven/ui";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/account/profile");
        const data = await res.json();
        if (res.ok && data.data) {
          setAvatarUrl(data.data.avatar_url || null);
          setBio(data.data.bio || "");
        }
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setError(null);

    try {
      const supabase = createBrowserAuthClient();
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        setError("Failed to upload image: " + uploadError.message);
        setUploading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: publicUrl }),
      });

      if (res.ok) {
        setAvatarUrl(publicUrl);
        await refreshUser();
      } else {
        setError("Failed to save avatar");
      }
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveBio = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Profile"
        title="Photo & bio."
        description="A friendly photo and a quick intro help instructors prepare for your session."
      />

      <Panel className="p-6 sm:p-8">
        <h2 className="font-['PP_Editorial_New'] text-2xl text-white">
          Profile picture
        </h2>
        <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
          <div className="relative">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="h-24 w-24 flex-shrink-0 rounded-full border border-white/15 object-cover sm:h-28 sm:w-28"
              />
            ) : (
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 font-['PP_Editorial_New'] text-3xl text-white sm:h-28 sm:w-28">
                {user?.user_metadata?.first_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-black bg-white text-black">
              <Camera className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <Button
              variant="secondary"
              size="md"
              loading={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? "Uploading…" : "Upload new photo"}
            </Button>
            <p className="mt-2 font-['Archivo'] text-xs text-white/45">
              JPG, PNG or WebP. Max 5MB.
            </p>
          </div>
        </div>
      </Panel>

      <Panel className="p-6 sm:p-8">
        <h2 className="font-['PP_Editorial_New'] text-2xl text-white">
          About you
        </h2>
        <div className="mt-5 max-w-lg space-y-4">
          <Field label="Bio" hint={`${bio.length}/500`} htmlFor="bio">
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              maxLength={500}
              placeholder="Tell instructors about yourself, your experience level, and what you're hoping to learn…"
            />
          </Field>

          {error && <Banner tone="error">{error}</Banner>}
          {success && <Banner tone="success">Bio saved.</Banner>}

          <Button onClick={handleSaveBio} loading={saving}>
            {saving ? "Saving…" : "Save bio"}
          </Button>
        </div>
      </Panel>
    </div>
  );
}
