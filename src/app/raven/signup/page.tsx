"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createBrowserAuthClient } from "@/lib/supabase/browser-auth";
import { AuthLayout } from "@/components/raven/auth-layout";
import {
  Banner,
  Button,
  Field,
  Input,
  Textarea,
} from "@/components/raven/ui";

type Step = 1 | 2;

export default function SignUpPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>(1);

  const goNext = () => {
    if (!firstName || !lastName || !email || !password || !dateOfBirth) {
      setError("Please fill in all required fields");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
          dateOfBirth,
          bio: bio.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create account");
        setLoading(false);
        return;
      }

      const supabase = createBrowserAuthClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        setError(
          "Account created but sign-in failed. Please go to the login page.",
        );
        setLoading(false);
        return;
      }

      router.push("/raven/account");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      imageUrl="/images/sports/golf.png"
      quote="Booked a week of padel coaching in Mallorca in under five minutes. Genuinely felt like a private concierge."
      quoteAttribution="Anya K. — Raven member"
    >
      <div className="space-y-2">
        <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-white/55">
          Step {step} of 2
        </p>
        <h1 className="font-['PP_Editorial_New'] text-4xl leading-[1.05] text-white sm:text-5xl">
          {step === 1 ? (
            <>
              Create your <span className="italic">account</span>.
            </>
          ) : (
            <>
              Tell us a <span className="italic">little</span> about you.
            </>
          )}
        </h1>
        <p className="pt-1 font-['Archivo'] text-sm text-white/60">
          {step === 1
            ? "Bookings, messages, and instructor matching — all in one place."
            : "Optional — gives instructors helpful context before your first session."}
        </p>
      </div>

      {/* Step indicator */}
      <div
        aria-hidden
        className="mt-8 flex items-center gap-2"
      >
        <span
          className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-white" : "bg-white/15"}`}
        />
        <span
          className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-white" : "bg-white/15"}`}
        />
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" required htmlFor="firstName">
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                  placeholder="Josh"
                />
              </Field>
              <Field label="Last name" required htmlFor="lastName">
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                  placeholder="Wade"
                />
              </Field>
            </div>

            <Field label="Email" required htmlFor="email">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@email.com"
              />
            </Field>

            <Field label="Password" required htmlFor="password">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
                placeholder="Min 8 characters"
              />
            </Field>

            <Field label="Date of birth" required htmlFor="dob">
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </Field>

            {error && <Banner tone="error">{error}</Banner>}

            <Button type="button" onClick={goNext} size="lg" fullWidth>
              Continue
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Field
              label="About you"
              hint={`${bio.length}/500`}
              htmlFor="bio"
            >
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                maxLength={500}
                placeholder="Experience level, what you're hoping to learn, anything an instructor should know…"
              />
            </Field>

            {error && <Banner tone="error">{error}</Banner>}

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
                Back
              </Button>
              <Button
                type="submit"
                size="md"
                fullWidth
                loading={loading}
              >
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-center font-['Archivo'] text-xs text-white/50 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Skip and create account
            </button>
          </>
        )}
      </form>

      <p className="mt-8 text-center font-['Archivo'] text-sm text-white/60">
        Already have an account?{" "}
        <Link
          href="/raven/login"
          className="font-semibold text-white underline-offset-4 transition-colors hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
