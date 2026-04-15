"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CreditCard, Loader2 } from "lucide-react";
import {
  Badge,
  Banner,
  Panel,
  SectionHeading,
} from "@/components/raven/ui";

const PAYMENT_STATUS_MAP: Record<
  number,
  { label: string; tone: "success" | "warning" | "danger" | "muted" | "info" }
> = {
  1: { label: "None", tone: "muted" },
  2: { label: "Pending", tone: "warning" },
  3: { label: "Paid", tone: "success" },
  4: { label: "Void", tone: "muted" },
  5: { label: "Deposit paid", tone: "info" },
  6: { label: "Refunded", tone: "danger" },
};

interface Payment {
  id: number;
  booking_id: number;
  price: number;
  status: number;
  payment_type: string;
  is_deposit: boolean;
  deposit_amount: number | null;
  balance_amount: number | null;
  created_at: string;
  booking: {
    reference: string;
    start_date: string;
    end_date: string;
    price: number;
    instructor_name: string;
  } | null;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch("/api/account/payments");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load payments");
        } else {
          setPayments(data.data || []);
        }
      } catch {
        setError("Failed to load payments");
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
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
        eyebrow="Invoices"
        title="Payment history."
        description="Every payment, refund and outstanding balance — all in one place."
      />

      {error && <Banner tone="error">{error}</Banner>}

      {payments.length === 0 && !error ? (
        <Panel className="px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5">
            <CreditCard className="h-5 w-5 text-white/70" />
          </div>
          <p className="mt-5 font-['PP_Editorial_New'] text-3xl text-white">
            No payments yet.
          </p>
          <p className="mt-2 font-['Archivo'] text-sm text-white/55">
            Payment records appear here once you book a session.
          </p>
        </Panel>
      ) : (
        <div className="space-y-3">
          {payments.map((payment, idx) => {
            const statusInfo = PAYMENT_STATUS_MAP[payment.status] || {
              label: "Unknown",
              tone: "muted" as const,
            };

            return (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.4 }}
              >
                <Panel hoverable className="p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-['PP_Editorial_New'] text-xl text-white sm:text-2xl">
                        {payment.booking?.instructor_name || "Unknown Instructor"}
                      </h3>
                      {payment.booking && (
                        <p className="mt-0.5 font-['Archivo'] text-sm text-white/65">
                          {formatDate(payment.booking.start_date)} —{" "}
                          {formatDate(payment.booking.end_date)}
                        </p>
                      )}
                      <p className="mt-1 truncate font-['Archivo'] text-[11px] uppercase tracking-[0.16em] text-white/40">
                        Ref · {payment.booking?.reference || "—"} ·{" "}
                        {payment.payment_type}
                        {payment.is_deposit && " · deposit"}
                      </p>
                      <p className="mt-1 font-['Archivo'] text-xs text-white/40">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
                      <span className="font-['PP_Editorial_New'] text-2xl text-white">
                        €{payment.price}
                      </span>
                    </div>
                  </div>

                  {payment.is_deposit &&
                    (payment.deposit_amount || payment.balance_amount) && (
                      <div className="mt-4 flex gap-6 border-t border-white/10 pt-4">
                        {payment.deposit_amount != null && (
                          <div>
                            <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.18em] text-white/40">
                              Deposit
                            </p>
                            <p className="mt-0.5 font-['PP_Editorial_New'] text-lg text-white">
                              €{payment.deposit_amount}
                            </p>
                          </div>
                        )}
                        {payment.balance_amount != null && (
                          <div>
                            <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.18em] text-white/40">
                              Balance due
                            </p>
                            <p className="mt-0.5 font-['PP_Editorial_New'] text-lg text-white">
                              €{payment.balance_amount}
                            </p>
                          </div>
                        )}
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
