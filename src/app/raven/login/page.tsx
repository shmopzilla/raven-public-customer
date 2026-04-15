"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createBrowserAuthClient } from "@/lib/supabase/browser-auth";
import { AuthLayout } from "@/components/raven/auth-layout";
import { Banner, Button, Field, Input } from "@/components/raven/ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/raven/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createBrowserAuthClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      imageUrl="/images/sports/horseriding.png"
      quote="My kids went from shy beginners to cantering on day three. The trainer was incredible — found her right here."
      quoteAttribution="James R. — booked horse riding"
    >
      <div className="space-y-2">
        <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-white/55">
          Welcome back
        </p>
        <h1 className="font-['PP_Editorial_New'] text-4xl leading-[1.05] text-white sm:text-5xl">
          Sign in to <span className="italic">Raven</span>.
        </h1>
        <p className="pt-1 font-['Archivo'] text-sm text-white/60">
          Pick up where you left off — bookings, messages and all.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
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

        <Field
          label="Password"
          required
          htmlFor="password"
          hint={
            <Link
              href="#"
              className="underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Forgot?
            </Link>
          }
        >
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Min 8 characters"
          />
        </Field>

        {error && <Banner tone="error">{error}</Banner>}

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-8 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="font-['Archivo'] text-[10px] uppercase tracking-[0.22em] text-white/40">
          or
        </span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <p className="mt-8 text-center font-['Archivo'] text-sm text-white/60">
        New to Raven?{" "}
        <Link
          href="/raven/signup"
          className="font-semibold text-white underline-offset-4 transition-colors hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <Loader2 className="h-6 w-6 animate-spin text-white/60" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
