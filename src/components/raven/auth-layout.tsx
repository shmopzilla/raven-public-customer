"use client";

/**
 * Split-screen layout for /raven/login and /raven/signup.
 *
 * Left: form panel (white card on dark background — keeps the form
 *       comfortable to read and visually distinct).
 * Right: cinematic full-bleed photography (sport-of-the-day) with
 *        editorial pull-quote overlaid.
 *
 * Mobile (< lg): photo collapses to a hero strip above the form.
 */

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  /** Hero photo URL (right pane on desktop, top strip on mobile). */
  imageUrl?: string;
  /** Pull quote overlaid on the hero photo. */
  quote?: string;
  /** Quote attribution. */
  quoteAttribution?: string;
  /** Form contents. */
  children: React.ReactNode;
}

const DEFAULT_IMAGE =
  "https://images.pexels.com/photos/1604869/pexels-photo-1604869.jpeg?auto=compress&cs=tinysrgb&w=1600";
const DEFAULT_QUOTE =
  "The kitesurfing instructor I matched with in Tarifa was next level. Rapid progression, zero faff.";
const DEFAULT_ATTR = "Lucas M., booked via Raven";

export function AuthLayout({
  imageUrl = DEFAULT_IMAGE,
  quote = DEFAULT_QUOTE,
  quoteAttribution = DEFAULT_ATTR,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* ----------------------------------------------------------- */}
      {/* LEFT: form pane                                              */}
      {/* ----------------------------------------------------------- */}
      <div className="relative flex min-h-screen flex-col lg:min-h-0">
        {/* Top bar with logo + back-to-home */}
        <header className="flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2"
            aria-label="Back to Raven"
          >
            <img
              src="/assets/logos/raven-logo.svg"
              alt="Raven"
              width={112}
              height={28}
              className="block h-7 w-[112px] object-contain object-left"
            />
          </Link>
          <Link
            href="/"
            className="hidden items-center gap-1.5 font-['Archivo'] text-sm text-white/60 transition-colors hover:text-white sm:inline-flex"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
            Back to home
          </Link>
        </header>

        {/* Form body */}
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-[440px]"
          >
            {children}
          </motion.div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* RIGHT: cinematic photo pane (desktop only)                   */}
      {/* ----------------------------------------------------------- */}
      <aside className="relative hidden overflow-hidden lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        {/* Subtle darken so the quote reads */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.85) 100%)",
          }}
        />

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="absolute inset-x-0 bottom-0 p-10 xl:p-14"
        >
          <blockquote className="max-w-xl font-['PP_Editorial_New'] text-2xl leading-snug text-white xl:text-3xl">
            &ldquo;{quote}&rdquo;
          </blockquote>
          <p className="mt-4 font-['Archivo'] text-xs uppercase tracking-[0.22em] text-white/55">
            {quoteAttribution}
          </p>
        </motion.div>
      </aside>
    </div>
  );
}
