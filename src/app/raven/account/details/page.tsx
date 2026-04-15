"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Banner,
  Button,
  Field,
  Input,
  Panel,
  SectionHeading,
} from "@/components/raven/ui";

export default function DetailsPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch("/api/account/details");
        const data = await res.json();
        if (res.ok && data.data) {
          setFirstName(data.data.first_name || "");
          setLastName(data.data.last_name || "");
          setDateOfBirth(data.data.date_of_birth || "");
          setEmail(data.data.email || "");
        }
      } catch {
        setError("Failed to load details");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/account/details", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, dateOfBirth }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      setError("Failed to save changes");
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
        eyebrow="Personal"
        title="Your details."
        description="Keep this up to date — instructors see your name on bookings."
      />

      <Panel className="p-6 sm:p-8">
        <form onSubmit={handleSave} className="max-w-lg space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First name" htmlFor="firstName">
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Field>
            <Field label="Last name" htmlFor="lastName">
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Field>
          </div>

          <Field
            label="Email"
            hint="Change in Security"
            htmlFor="email"
          >
            <Input id="email" type="email" value={email} disabled />
          </Field>

          <Field label="Date of birth" htmlFor="dob">
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </Field>

          {error && <Banner tone="error">{error}</Banner>}
          {success && <Banner tone="success">Changes saved.</Banner>}

          <div className="pt-2">
            <Button type="submit" loading={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
