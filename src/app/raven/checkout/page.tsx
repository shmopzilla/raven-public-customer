"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, Lock } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { useAuth } from "@/lib/contexts/auth-context";
import { useSearch } from "@/lib/contexts/search-context";
import { createBrowserAuthClient } from "@/lib/supabase/browser-auth";
import {
  Button,
  Field,
  Input,
  Panel,
  SectionHeading,
  Textarea,
} from "@/components/raven/ui";
import { SiteHeader, HeaderSpacer } from "@/components/raven/site-header";
import { SiteFooter } from "@/components/raven/site-footer";

/**
 * DEMO MODE
 * ----------------------------------------------------------------------------
 * While we're in production but not ready to send real booking requests to
 * live instructors, we keep the Edge Function integration fully built but
 * gated behind this flag. When DEMO_MODE is true, the form simulates the
 * request and shows the success screen with a fake reference. The real
 * handler below stays intact so we can flip this to false when we're ready.
 *
 * To enable real bookings: set NEXT_PUBLIC_BOOKING_DEMO_MODE="false" in env.
 */
const DEMO_MODE = process.env.NEXT_PUBLIC_BOOKING_DEMO_MODE !== "false";

function generateFakeBookingRef(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `RVN${suffix}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { participantCounts } = useSearch();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const getCartTotal = useCartStore((state) => state.getCartTotal);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingRefs, setBookingRefs] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  });

  const total = getCartTotal();
  const itemCount = items.length;
  const totalHours = items.reduce((sum, item) => sum + item.totalHours, 0);

  useEffect(() => {
    if (items.length === 0 && !showSuccess) router.push("/raven/cart");
  }, [items.length, showSuccess, router]);

  useEffect(() => {
    if (!user && !showSuccess) {
      router.push(`/raven/login?redirect=${encodeURIComponent('/raven/checkout')}`);
    }
  }, [user, showSuccess, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setIsProcessing(true);

    // ------------------------------------------------------------------------
    // DEMO MODE: simulate the request without touching the live DB.
    // The real submission logic below is kept intact. Flip the DEMO_MODE flag
    // (see top of file) to switch to real bookings.
    // ------------------------------------------------------------------------
    if (DEMO_MODE) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const fakeRefs = items.map(() => generateFakeBookingRef());
        setBookingRefs(fakeRefs);
        setShowSuccess(true);
        clearCart();
      } catch {
        setBookingError("Something went wrong. Please try again.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // ------------------------------------------------------------------------
    // REAL SUBMISSION (currently gated by DEMO_MODE). When enabled, this
    // calls the `bookings` Supabase Edge Function which creates the booking,
    // booking_items, and queues a push notification to the instructor app.
    // ------------------------------------------------------------------------
    try {
      // Get fresh session token
      const supabase = createBrowserAuthClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.push(`/raven/login?redirect=${encodeURIComponent('/raven/checkout')}`);
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const refs: string[] = [];

      for (const item of items) {
        // Find earliest and latest dates from slots
        const dates = item.selectedSlots.map(s => s.date).sort();
        const startDate = dates[0];
        const endDate = dates[dates.length - 1];

        const response = await fetch(
          `${supabaseUrl}/functions/v1/bookings`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              instructor_id: item.instructorId,
              resort_id: item.resortId,
              discipline_id: item.disciplineId,
              price: item.totalPrice,
              start_date: startDate,
              end_date: endDate,
              primary_name: `${formData.firstName} ${formData.lastName}`.trim(),
              primary_email: formData.email,
              adults_nr: participantCounts.adults || 1,
              adolescents_nr: participantCounts.teenagers || 0,
              children_nr: participantCounts.children || 0,
              items: item.selectedSlots.map(slot => ({
                day_slot_id: slot.daySlotId,
                date: slot.date,
                start_time: slot.startTime,
                end_time: slot.endTime,
                total_minutes: slot.hours * 60,
                hourly_rate: item.pricePerHour,
              })),
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create booking request');
        }

        const result = await response.json();
        if (result.booking?.reference) {
          refs.push(result.booking.reference);
        }
      }

      setBookingRefs(refs);
      setShowSuccess(true);
      clearCart();
    } catch (err: any) {
      setBookingError(err.message || "There was an error processing your booking. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex min-h-screen flex-col text-white">
        <SiteHeader />
        <HeaderSpacer />
        <div className="flex flex-1 items-center justify-center p-4">
          <Panel className="max-w-md p-8 text-center sm:p-10">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white text-black"
            >
              <Check className="h-8 w-8" strokeWidth={2.5} />
            </motion.div>
            <h2 className="mt-6 font-['PP_Editorial_New'] text-4xl text-white sm:text-5xl">
              Request sent.
            </h2>
            <p className="mt-3 font-['Archivo'] text-sm text-white/70 sm:text-base">
              Your instructor will review your request and respond shortly. We&apos;ll email you as soon as they accept, with a secure link to complete payment and lock in your sessions.
            </p>
            {bookingRefs.length > 0 && (
              <div className="mt-4 space-y-1">
                {bookingRefs.map(ref => (
                  <p key={ref} className="font-['Archivo'] text-xs uppercase tracking-[0.18em] text-white/50">
                    Ref: {ref}
                  </p>
                ))}
              </div>
            )}
            <Link
              href="/raven/account/bookings"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-['Archivo'] text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
            >
              View my bookings
            </Link>
          </Panel>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col text-white">
      <SiteHeader />
      <HeaderSpacer />

      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-20">
        <div className="pb-6">
          <Link href="/raven/cart" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-['Archivo'] text-sm mb-4">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back to Cart
          </Link>
          <SectionHeading
            eyebrow="Request a booking"
            title="Confirm your request."
            description="No payment yet. We'll send your instructor the details, and you only pay once they accept."
          />
        </div>

        {bookingError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
            <p className="font-['Archivo'] text-sm text-red-400">{bookingError}</p>
          </div>
        )}

        {/* How the request flow works — sets expectations before submit */}
        <Panel className="mb-6 p-5 sm:mb-8 sm:p-6">
          <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-white/50">
            How it works
          </p>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
            <RequestStep
              num="1"
              title="You send a request"
              body="Your instructor gets the details the moment you submit. No card charged yet."
            />
            <RequestStep
              num="2"
              title="They accept or decline"
              body="Most instructors respond within a few hours. You'll get an email either way."
            />
            <RequestStep
              num="3"
              title="Pay once accepted"
              body="When your instructor confirms, we'll send a secure payment link to lock in your sessions."
            />
          </div>
        </Panel>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8"
        >
          <div className="space-y-6 lg:col-span-2">
            <Panel className="space-y-5 p-6 sm:p-8">
              <h2 className="font-['PP_Editorial_New'] text-2xl text-white">
                Contact information
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="First name" required htmlFor="firstName">
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="Josh"
                  />
                </Field>
                <Field label="Last name" required htmlFor="lastName">
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Wade"
                  />
                </Field>
              </div>

              <Field label="Email" required htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="you@email.com"
                />
              </Field>

              <Field label="Phone" required htmlFor="phone">
                <Input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+33 6 12 34 56 78"
                />
              </Field>

              <Field label="Special requests" htmlFor="notes" hint="Optional">
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Anything your instructor should know. Experience, goals, kit..."
                />
              </Field>
            </Panel>

            <Panel className="space-y-4 p-6 sm:p-8">
              <h2 className="font-['PP_Editorial_New'] text-2xl text-white">
                Your bookings
              </h2>

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b border-white/[0.06] pb-4 last:border-0 last:pb-0"
                  >
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      {item.instructorAvatar ? (
                        <Image
                          src={item.instructorAvatar}
                          alt={item.instructorName}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-['PP_Editorial_New'] text-xl text-white/70">
                          {item.instructorName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-['PP_Editorial_New'] text-lg text-white">
                        {item.instructorName}
                      </h3>
                      <p className="font-['Archivo'] text-xs text-white/55">
                        {item.location} · {item.discipline}
                      </p>
                      <p className="mt-1 font-['Archivo'] text-xs text-white/45">
                        {item.totalHours} hrs · {item.selectedSlots.length}{" "}
                        slots
                      </p>
                    </div>
                    <p className="font-['PP_Editorial_New'] text-lg text-white">
                      €{item.totalPrice}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <aside className="lg:col-span-1">
            <Panel className="sticky top-28 space-y-6 p-6">
              <h3 className="font-['PP_Editorial_New'] text-2xl text-white">
                Request summary
              </h3>

              <div className="space-y-3 border-b border-white/10 pb-6 font-['Archivo'] text-sm">
                <Row label="Bookings" value={String(itemCount)} />
                <Row label="Hours" value={String(totalHours)} />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="font-['Archivo'] text-sm uppercase tracking-[0.16em] text-white/55">
                    Total
                  </span>
                  <span className="font-['PP_Editorial_New'] text-3xl text-white">
                    €{total}
                  </span>
                </div>
                <p className="mt-2 font-['Archivo'] text-xs text-white/45">
                  You won&apos;t be charged yet. Payment is only taken after your instructor accepts.
                </p>
              </div>

              <Button type="submit" fullWidth size="lg" loading={isProcessing}>
                {isProcessing ? "Sending request…" : "Send booking request"}
              </Button>

              <p className="flex items-center justify-center gap-1.5 border-t border-white/10 pt-6 font-['Archivo'] text-xs text-white/45">
                <Lock className="h-3 w-3" />
                No charge until your instructor accepts
              </p>
            </Panel>
          </aside>
        </form>
      </div>

      <SiteFooter />
    </div>
  );
}

function RequestStep({
  num,
  title,
  body,
}: {
  num: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 font-['Archivo'] text-xs font-semibold text-white">
        {num}
      </span>
      <div>
        <p className="font-['PP_Editorial_New'] text-lg text-white">{title}</p>
        <p className="mt-1 font-['Archivo'] text-sm text-white/60">{body}</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/55">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
