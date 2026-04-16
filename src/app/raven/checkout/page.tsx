"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, Lock } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
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

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const getCartTotal = useCartStore((state) => state.getCartTotal);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

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
    try {
      // TODO: real Stripe + booking creation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setShowSuccess(true);
      clearCart();
      setTimeout(() => router.push("/raven/search"), 3000);
    } catch {
      setBookingError("There was an error processing your booking. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-white">
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
              Booking confirmed.
            </h2>
            <p className="mt-3 font-['Archivo'] text-sm text-white/70 sm:text-base">
              We&apos;ve sent the details to your email. Your instructor will
              be in touch shortly.
            </p>
            <p className="mt-4 font-['Archivo'] text-xs uppercase tracking-[0.18em] text-white/40">
              Redirecting you back…
            </p>
          </Panel>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <SiteHeader />
      <HeaderSpacer />

      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-20">
        <div className="sticky top-0 z-10 bg-black pb-6">
          <Link href="/raven/cart" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-['Archivo'] text-sm mb-4">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back to Cart
          </Link>
          <SectionHeading
            eyebrow="Checkout"
            title="Confirm & pay."
            description="A few quick details and we'll lock in your sessions."
          />
        </div>

        {bookingError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
            <p className="font-['Archivo'] text-sm text-red-400">{bookingError}</p>
          </div>
        )}

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
                  placeholder="Anything your instructor should know — experience, goals, kit…"
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
                Order summary
              </h3>

              <div className="space-y-3 border-b border-white/10 pb-6 font-['Archivo'] text-sm">
                <Row label="Bookings" value={String(itemCount)} />
                <Row label="Hours" value={String(totalHours)} />
                <Row label="Subtotal" value={`€${total}`} />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-['Archivo'] text-sm uppercase tracking-[0.16em] text-white/55">
                  Total
                </span>
                <span className="font-['PP_Editorial_New'] text-3xl text-white">
                  €{total}
                </span>
              </div>

              <Button type="submit" fullWidth size="lg" loading={isProcessing}>
                {isProcessing ? "Processing…" : "Complete booking"}
              </Button>

              <p className="flex items-center justify-center gap-1.5 border-t border-white/10 pt-6 font-['Archivo'] text-xs text-white/45">
                <Lock className="h-3 w-3" />
                Secure booking · Instant confirmation
              </p>
            </Panel>
          </aside>
        </form>
      </div>

      <SiteFooter />
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
