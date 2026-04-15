"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Calendar, Loader2 } from "lucide-react";
import {
  Badge,
  Banner,
  LinkButton,
  Panel,
  SectionHeading,
} from "@/components/raven/ui";

const BOOKING_STATUS_MAP: Record<
  number,
  { label: string; tone: "success" | "warning" | "danger" | "muted" | "info" }
> = {
  1: { label: "Requested", tone: "warning" },
  2: { label: "Instructor request", tone: "warning" },
  3: { label: "Confirmed", tone: "success" },
  4: { label: "Declined", tone: "danger" },
  5: { label: "Expired", tone: "muted" },
  6: { label: "Cancelled", tone: "danger" },
  7: { label: "Cancelled", tone: "danger" },
  8: { label: "Completed", tone: "success" },
  9: { label: "Active", tone: "info" },
  10: { label: "Pending payment", tone: "warning" },
  11: { label: "Deposit paid", tone: "info" },
};

interface Booking {
  id: number;
  reference: string;
  start_date: string;
  end_date: string;
  price: number;
  status: number;
  payment_status: number;
  primary_name: string;
  created_at: string;
  instructors: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  booking_items: {
    id: number;
    date: string;
    day_slot_id: number;
    start_time: string;
    end_time: string;
    hourly_rate: number;
    total_minutes: number;
  }[];
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch("/api/account/bookings");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load bookings");
        } else {
          setBookings(data.data || []);
        }
      } catch {
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

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
        eyebrow="Bookings"
        title="Your sessions."
        description="Track upcoming and past bookings with your instructors."
      />

      {error && <Banner tone="error">{error}</Banner>}

      {bookings.length === 0 && !error ? (
        <Panel className="px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5">
            <Calendar className="h-5 w-5 text-white/70" />
          </div>
          <p className="mt-5 font-['PP_Editorial_New'] text-3xl text-white">
            No bookings yet.
          </p>
          <p className="mt-2 max-w-sm mx-auto font-['Archivo'] text-sm text-white/55">
            Browse instructors and book a session — your requests will appear
            here.
          </p>
          <div className="mt-6">
            <LinkButton href="/" size="md">
              Find an instructor
            </LinkButton>
          </div>
        </Panel>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking, idx) => {
            const statusInfo = BOOKING_STATUS_MAP[booking.status] || {
              label: "Unknown",
              tone: "muted" as const,
            };
            const instructor = booking.instructors;

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.4 }}
              >
                <Panel hoverable className="p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      {instructor?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={instructor.avatar_url}
                          alt=""
                          className="h-12 w-12 flex-shrink-0 rounded-full object-cover sm:h-14 sm:w-14"
                        />
                      ) : (
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 font-['PP_Editorial_New'] text-base text-white sm:h-14 sm:w-14">
                          {instructor?.first_name?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-['PP_Editorial_New'] text-xl text-white sm:text-2xl">
                          {instructor?.first_name} {instructor?.last_name}
                        </h3>
                        <p className="mt-0.5 font-['Archivo'] text-sm text-white/65">
                          {formatDate(booking.start_date)} —{" "}
                          {formatDate(booking.end_date)}
                        </p>
                        <p className="mt-1 truncate font-['Archivo'] text-[11px] uppercase tracking-[0.16em] text-white/40">
                          Ref · {booking.reference}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
                      <span className="font-['PP_Editorial_New'] text-2xl text-white">
                        €{booking.price}
                      </span>
                    </div>
                  </div>

                  {booking.booking_items?.length > 0 && (
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {booking.booking_items.map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-['Archivo'] text-xs text-white/75"
                          >
                            {new Date(item.date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                            <span className="text-white/40">
                              {item.start_time?.slice(0, 5)} -{" "}
                              {item.end_time?.slice(0, 5)}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Panel>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
