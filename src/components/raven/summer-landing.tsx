"use client";

/**
 * Summer Landing Page — Raven
 *
 * A B2C marketplace home for booking sport instructors across
 * multiple disciplines. Inspired by Masterclass (editorial hero),
 * Fresha (search-first), and Wellfound (scannable scan-able content blocks).
 *
 * Design direction:
 * - Monochrome grunge base (deep black, hairline borders, noise texture)
 * - Summer warmth delivered via full-colour photography, not UI chrome
 * - Large editorial serif headlines (PP Editorial New)
 * - Fully responsive — mobile first, breakpoints at sm/md/lg/xl
 *
 * Preserves all existing search behaviour by using the shared
 * `useSearch` context + `<GlobalSearchModal shouldNavigate />`.
 */

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Search,
  Star,
  ShieldCheck,
  Sparkles,
  MapPin,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  CalendarCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useSearch } from "@/lib/contexts/search-context";
import { GlobalSearchModal } from "@/components/ui/global-search-modal";
import { SiteHeader } from "@/components/raven/site-header";
import { SiteFooter } from "@/components/raven/site-footer";

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------

// Sports showcased on the landing page. Each maps to a discipline that the
// existing search pipeline already understands. Images live under
// /public/images/sports/ — missing files fall back to a neutral gradient tile.
// NOTE: sport tile images are a mix of user-provided assets (horseriding,
// padel) and Unsplash placeholders (golf, kitesurfing, skiing, snowboarding)
// — swap the Unsplash URLs out as final photography becomes available.
const SPORTS: Array<{
  key: string;
  label: string;
  tagline: string;
  image: string;
  season: "summer" | "winter";
}> = [
  {
    key: "golf",
    label: "Golf",
    tagline: "Fairway fundamentals with PGA pros",
    image: "/images/sports/golf.png",
    season: "summer",
  },
  {
    key: "horse-riding",
    label: "Horse Riding",
    tagline: "Dressage, jumping & trail coaching",
    image: "/images/sports/horseriding.png",
    season: "summer",
  },
  {
    key: "kitesurfing",
    label: "Kitesurfing",
    tagline: "Beach launches to big air",
    image: "/images/sports/kitesurf.png",
    season: "summer",
  },
  {
    key: "padel",
    label: "Padel",
    tagline: "Court craft for every level",
    image: "/images/sports/padel.png",
    season: "summer",
  },
  {
    key: "skiing",
    label: "Skiing",
    tagline: "On- and off-piste expertise",
    image: "/images/sports/ski.png",
    season: "winter",
  },
  {
    key: "snowboarding",
    label: "Snowboarding",
    tagline: "All-mountain, park and powder",
    image: "/images/sports/snowboard.png",
    season: "winter",
  },
];

const TRUST_SIGNALS = [
  { label: "Vetted instructors", icon: ShieldCheck },
  { label: "4.9★ average rating", icon: Star },
  { label: "Instant booking", icon: Sparkles },
];

const STEPS: Array<{
  n: string;
  title: string;
  body: string;
  icon: typeof Search;
  hint: string;
}> = [
  {
    n: "01",
    title: "Search",
    body: "Tell us what you want to learn, where and when. We'll surface the instructors who fit.",
    icon: Search,
    hint: "Sport · location · dates",
  },
  {
    n: "02",
    title: "Compare",
    body: "Browse profiles, credentials, and real reviews. Message before you book if you need to.",
    icon: SlidersHorizontal,
    hint: "Profiles · ratings · pricing",
  },
  {
    n: "03",
    title: "Book",
    body: "Secure your sessions in seconds. Full schedule managed from your account — no back-and-forth.",
    icon: CalendarCheck,
    hint: "Instant confirmation",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Booked a week of padel coaching in Mallorca in under five minutes. Genuinely felt like a private concierge.",
    name: "Anya K.",
    role: "Booked padel · Spain",
  },
  {
    quote:
      "My kids went from shy beginners to cantering on day three. The trainer was incredible — found her right here.",
    name: "James R.",
    role: "Booked horse riding · UK",
  },
  {
    quote:
      "The kitesurfing instructor I matched with in Tarifa was next level. Rapid progression, zero faff.",
    name: "Lucas M.",
    role: "Booked kitesurfing · Tarifa",
  },
];

// Destination thumbnails — Unsplash placeholders showing the LOCATION,
// not the sport. Swap these out for proper licensed assets when ready.
const DESTINATIONS = [
  {
    name: "Mallorca",
    country: "Spain",
    sport: "Padel & Golf",
    thumb:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Tarifa",
    country: "Spain",
    sport: "Kitesurfing",
    thumb:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "St Andrews",
    country: "Scotland",
    sport: "Golf",
    thumb:
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Cotswolds",
    country: "England",
    sport: "Horse Riding",
    thumb:
      "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Tuscany",
    country: "Italy",
    sport: "Horse Riding",
    thumb:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Chamonix",
    country: "France",
    sport: "Skiing",
    thumb:
      "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?auto=format&fit=crop&w=400&q=80",
  },
];

// ---------------------------------------------------------------------------
// COMPONENTS
// ---------------------------------------------------------------------------

function GrainOverlay() {
  // Subtle grunge noise texture — purely decorative, pointer-events disabled.
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.06] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}

// Nav is now provided by the shared <SiteHeader transparent /> component.

function SearchPill({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group relative flex w-full items-center gap-3 rounded-full border border-white/15 bg-white/[0.06] px-4 py-3 text-left backdrop-blur-xl transition-colors hover:bg-white/[0.12] sm:gap-4 sm:px-5 sm:py-4"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black sm:h-11 sm:w-11">
        <Search className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.4} />
      </span>
      <span className="flex flex-1 flex-col min-w-0">
        <span className="font-['Archivo'] text-[11px] uppercase tracking-[0.18em] text-white/50">
          Find an instructor
        </span>
        <span className="truncate font-['Archivo'] text-sm text-white/90 sm:text-base">
          Sport · location · dates
        </span>
      </span>
      <span className="hidden shrink-0 items-center gap-1 rounded-full bg-white px-4 py-2 font-['Archivo'] text-sm font-semibold text-black sm:inline-flex">
        Search
        <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
      </span>
    </motion.button>
  );
}

function Hero({ onSearchClick }: { onSearchClick: () => void }) {
  return (
    <section className="relative isolate overflow-hidden bg-black pt-28 sm:pt-32 lg:pt-40">
      {/* Background photo collage — shows the "summer" feel via imagery */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/1604869/pexels-photo-1604869.jpeg?auto=compress&cs=tinysrgb&w=2000)",
          }}
        />
        {/* Lighter wash so the photography breathes; copy is still legible
            thanks to the bottom gradient + left-side darkening below. */}
        <div className="absolute inset-0 bg-black/35" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0) 100%), linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.95) 100%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6 sm:pb-28 lg:px-10 lg:pb-40">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 font-['Archivo'] text-[11px] uppercase tracking-[0.2em] text-white/80 sm:text-xs"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Now booking summer
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-['PP_Editorial_New'] text-[44px] leading-[0.95] tracking-[-0.01em] text-white sm:text-[64px] md:text-[80px] lg:text-[108px]"
          >
            Learn from
            <br />
            <span className="italic text-white/90">the best</span>{" "}
            in their sport.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 max-w-xl font-['Archivo'] text-base leading-7 text-white/75 sm:text-lg"
          >
            Raven is the marketplace for one-to-one coaching — golf, horse
            riding, kitesurfing, padel and more. Hand-picked instructors,
            transparent pricing, instant booking.
          </motion.p>

          <div className="mt-8 sm:mt-10 lg:mt-12">
            <SearchPill onClick={onSearchClick} />
          </div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-6 flex flex-wrap gap-x-5 gap-y-2 sm:mt-8"
          >
            {TRUST_SIGNALS.map(({ label, icon: Icon }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 font-['Archivo'] text-xs text-white/70 sm:text-sm"
              >
                <Icon className="h-4 w-4 text-white" strokeWidth={2} />
                {label}
              </li>
            ))}
          </motion.ul>
        </div>
      </div>

      {/* Marquee strip — social proof / logos stand-in */}
      <div className="border-y border-white/10 bg-black/75 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1400px] items-center gap-x-10 overflow-x-auto px-4 py-4 sm:px-6 lg:px-10">
          {[
            "As featured in",
            "The Times",
            "Condé Nast Traveller",
            "Monocle",
            "GQ",
            "Financial Times",
          ].map((label, i) => (
            <span
              key={label}
              className={cn(
                "whitespace-nowrap font-['PP_Editorial_New'] text-sm sm:text-base",
                i === 0 ? "text-white/40" : "text-white/70"
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SportsGrid({ onPick }: { onPick: (sportKey: string) => void }) {
  return (
    <section id="sports" className="bg-white py-20 text-black sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-black/50 sm:text-xs">
              What are you learning?
            </p>
            <h2 className="mt-3 font-['PP_Editorial_New'] text-4xl leading-[1.05] tracking-[-0.01em] sm:text-5xl lg:text-6xl">
              Pick your sport.
              <br />
              <span className="text-black/45">We'll bring the experts.</span>
            </h2>
          </div>
          <p className="max-w-sm font-['Archivo'] text-sm text-black/60 sm:text-base">
            From fairways to foils, coaches across Europe are a tap away. Tap a
            tile to search instructors in that discipline.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:mt-14 md:grid-cols-3 lg:grid-cols-3 lg:gap-6">
          {SPORTS.map((s, i) => (
            <motion.button
              key={s.key}
              type="button"
              onClick={() => onPick(s.key)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              viewport={{ once: true, margin: "-80px" }}
              whileHover={{ y: -4 }}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-black/10 bg-black/[0.03] text-left sm:aspect-[3/4]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${s.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-5">
                <span className="inline-flex items-center rounded-full border border-white/30 bg-black/40 px-2.5 py-1 font-['Archivo'] text-[10px] uppercase tracking-[0.15em] text-white/90 backdrop-blur-sm sm:text-[11px]">
                  {s.season === "summer" ? "Summer" : "Winter"}
                </span>
                <span className="hidden rounded-full border border-white/30 bg-black/40 px-2.5 py-1 font-['Archivo'] text-[11px] text-white/90 backdrop-blur-sm group-hover:inline-flex">
                  Explore →
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:p-6">
                <h3 className="font-['PP_Editorial_New'] text-2xl leading-tight text-white sm:text-3xl lg:text-4xl">
                  {s.label}
                </h3>
                <p className="mt-1 font-['Archivo'] text-xs text-white/75 sm:text-sm">
                  {s.tagline}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ onSearchClick }: { onSearchClick: () => void }) {
  return (
    <section id="how" className="relative border-y border-white/10 bg-black py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-white/50 sm:text-xs">
              How it works
            </p>
            <h2 className="mt-3 font-['PP_Editorial_New'] text-4xl leading-[1.05] tracking-[-0.01em] text-white sm:text-5xl lg:text-6xl">
              Three steps to your
              <br />
              <span className="text-white/60">next session.</span>
            </h2>
            <button
              type="button"
              onClick={onSearchClick}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-['Archivo'] text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
            >
              Start searching
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>

          <ol className="grid w-full gap-3 sm:gap-4 md:grid-cols-3 lg:max-w-[820px]">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  className="group relative z-10 flex flex-col gap-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-6 transition-all hover:border-white/25 hover:from-white/[0.09] sm:p-7"
                >
                  {/* Top row: icon disc + step number */}
                  <div className="flex items-center justify-between">
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 backdrop-blur-sm transition-colors group-hover:border-white/40 group-hover:bg-white/10">
                        <Icon
                          className="h-5 w-5 text-white"
                          strokeWidth={1.75}
                        />
                      </div>
                      {/* glow ring on hover */}
                      <div
                        aria-hidden
                        className="absolute inset-0 -z-10 rounded-full bg-white/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                      />
                    </div>
                    <span className="font-['PP_Editorial_New'] text-4xl leading-none text-white/30 transition-colors group-hover:text-white/55 sm:text-5xl">
                      {step.n}
                    </span>
                  </div>

                  {/* Title + body */}
                  <div className="flex-1">
                    <h3 className="font-['PP_Editorial_New'] text-2xl leading-tight text-white sm:text-3xl">
                      {step.title}
                    </h3>
                    <p className="mt-2 font-['Archivo'] text-sm leading-6 text-white/70 sm:text-[15px]">
                      {step.body}
                    </p>
                  </div>

                  {/* Footer: hint chip + segmented progress */}
                  <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <span className="truncate font-['Archivo'] text-[11px] uppercase tracking-[0.16em] text-white/40">
                      {step.hint}
                    </span>
                    <div
                      aria-hidden
                      className="flex shrink-0 items-center gap-1"
                    >
                      {STEPS.map((_, j) => (
                        <span
                          key={j}
                          className={cn(
                            "h-1 rounded-full transition-all",
                            j < i + 1 ? "w-6 bg-white" : "w-3 bg-white/15"
                          )}
                        />
                      ))}
                    </div>
                  </div>

                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

function InstructorsTeaser({ onSearchClick }: { onSearchClick: () => void }) {
  // Placeholder portraits — Unsplash. Replace with vetted instructor photos.
  // Roster card imagery — unique action/sport portraits from Pexels (all
  // CC0, verified 200). Each photo distinct from the hero/tile assets so
  // the roster feels like real, separate instructors rather than stock
  // reuse. Swap for licensed portraits when available.
  const roster = [
    {
      name: "Jono Clarke",
      role: "PGA Golf Pro",
      loc: "St Andrews",
      // pexels.com/photo/114972 — golfer mid-swing on fairway
      image:
        "https://images.pexels.com/photos/114972/pexels-photo-114972.jpeg?auto=compress&cs=tinysrgb&w=900",
      rating: 4.9,
      price: "£120/hr",
    },
    {
      name: "Marta Romero",
      role: "Padel Level 3",
      loc: "Mallorca",
      // pexels.com/photo/33641987 — portrait of padel player on indoor court
      image:
        "https://images.pexels.com/photos/33641987/pexels-photo-33641987.jpeg?auto=compress&cs=tinysrgb&w=900",
      rating: 5.0,
      price: "€85/hr",
    },
    {
      name: "Emma Fischer",
      role: "Equestrian Trainer",
      loc: "Cotswolds",
      // pexels.com/photo/4895011 — woman on horseback, indoor arena
      image:
        "https://images.pexels.com/photos/4895011/pexels-photo-4895011.jpeg?auto=compress&cs=tinysrgb&w=900",
      rating: 4.8,
      price: "£95/hr",
    },
    {
      name: "Luca Romano",
      role: "IKO Kitesurf",
      loc: "Tarifa",
      // pexels.com/photo/21855923 — man in wetsuit kitesurfing
      image:
        "https://images.pexels.com/photos/21855923/pexels-photo-21855923.jpeg?auto=compress&cs=tinysrgb&w=900",
      rating: 4.9,
      price: "€110/hr",
    },
  ];

  return (
    <section id="instructors" className="bg-white py-20 text-black sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-black/50 sm:text-xs">
              Meet the roster
            </p>
            <h2 className="mt-3 font-['PP_Editorial_New'] text-4xl leading-[1.05] tracking-[-0.01em] sm:text-5xl lg:text-6xl">
              Trusted instructors.
              <br />
              <span className="text-black/45">Real credentials.</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onSearchClick}
            className="inline-flex items-center gap-2 font-['Archivo'] text-sm text-black/70 underline-offset-4 hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:mt-14 md:grid-cols-4 lg:gap-6">
          {roster.map((i, idx) => (
            <motion.button
              key={idx}
              type="button"
              onClick={onSearchClick}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              viewport={{ once: true, margin: "-80px" }}
              whileHover={{ y: -4 }}
              className="group text-left"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black/5">
                <div
                  className="absolute inset-0 bg-cover bg-center grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                  style={{ backgroundImage: `url(${i.image})` }}
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-3 sm:p-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 font-['Archivo'] text-[11px] font-semibold text-black backdrop-blur">
                    <Star className="h-3 w-3 fill-current" />
                    {i.rating.toFixed(1)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-black/80 px-2 py-1 font-['Archivo'] text-[11px] text-white backdrop-blur">
                    {i.price}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <h3 className="font-['PP_Editorial_New'] text-lg leading-tight sm:text-xl">
                  {i.name}
                </h3>
                <p className="mt-1 font-['Archivo'] text-xs text-black/55 sm:text-sm">
                  {i.role} · {i.loc}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Destinations({ onSearchClick }: { onSearchClick: () => void }) {
  return (
    <section className="border-t border-white/10 bg-black py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-white/50 sm:text-xs">
              Popular destinations
            </p>
            <h2 className="mt-3 font-['PP_Editorial_New'] text-4xl leading-[1.05] tracking-[-0.01em] text-white sm:text-5xl lg:text-6xl">
              Go where the
              <br />
              <span className="text-white/60">coaches are.</span>
            </h2>
          </div>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:mt-14 lg:grid-cols-3">
          {DESTINATIONS.map((d, idx) => (
            <motion.li
              key={d.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
              viewport={{ once: true, margin: "-80px" }}
            >
              <button
                type="button"
                onClick={onSearchClick}
                className="group flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-3 pr-5 text-left transition-colors hover:bg-white/[0.06] sm:gap-5 sm:p-3 sm:pr-6"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Thumbnail — always full colour, subtle zoom on hover */}
                  <div
                    className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cover bg-center transition-transform duration-300 group-hover:scale-105 sm:h-16 sm:w-16"
                    style={{ backgroundImage: `url(${d.thumb})` }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <MapPin
                        className="h-3.5 w-3.5 shrink-0 text-white/50"
                        strokeWidth={2}
                      />
                      <p className="truncate font-['PP_Editorial_New'] text-lg text-white sm:text-xl">
                        {d.name}
                      </p>
                    </div>
                    <p className="mt-0.5 truncate font-['Archivo'] text-xs text-white/50 sm:text-sm">
                      {d.country} · {d.sport}
                    </p>
                  </div>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white"
                  strokeWidth={2.2}
                />
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Testimonials() {
  // Cream "light" interlude — breaks up the dark mass and adds summer warmth
  return (
    <section className="bg-white py-20 text-black sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl">
          <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-black/55 sm:text-xs">
            Word of mouth
          </p>
          <h2 className="mt-3 font-['PP_Editorial_New'] text-4xl leading-[1.05] tracking-[-0.01em] sm:text-5xl lg:text-6xl">
            Loved by thousands
            <br />
            <span className="text-black/55">of adventurers.</span>
          </h2>
        </div>

        <div className="mt-10 grid gap-3 sm:gap-4 md:mt-14 md:grid-cols-3 lg:gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <motion.figure
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              viewport={{ once: true, margin: "-80px" }}
              className="flex flex-col justify-between gap-8 rounded-2xl border border-black/10 bg-neutral-50 p-6 sm:p-8"
            >
              <div>
                <div className="mb-4 flex gap-1 text-black">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="font-['PP_Editorial_New'] text-xl leading-snug sm:text-2xl">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
              </div>
              <figcaption>
                <p className="font-['Archivo'] text-sm font-semibold">{t.name}</p>
                <p className="font-['Archivo'] text-xs text-black/55">
                  {t.role}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function InstructorCTA() {
  return (
    <section className="relative isolate overflow-hidden border-y border-white/10 bg-black">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-55"
        style={{ backgroundImage: "url(/images/sports/horseriding.png)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/70 to-black/10"
      />

      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-32">
        <div className="max-w-xl">
          <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-white/50 sm:text-xs">
            For coaches & pros
          </p>
          <h2 className="mt-3 font-['PP_Editorial_New'] text-4xl leading-[1.05] tracking-[-0.01em] text-white sm:text-5xl lg:text-6xl">
            Grow your
            <br />
            <span className="italic text-white/80">coaching business.</span>
          </h2>
          <p className="mt-5 font-['Archivo'] text-base leading-7 text-white/70">
            Set your own rates. Keep your own clients. We handle the
            scheduling, payments, and marketing — so you can focus on what you
            do best.
          </p>
          <ul className="mt-6 space-y-2">
            {[
              "Zero subscription fees",
              "Payouts within 24 hours",
              "Featured placement in your sport",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 font-['Archivo'] text-sm text-white/80"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
          <Link
            href="/raven/signup?type=instructor"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 font-['Archivo'] text-base font-semibold text-black transition-transform hover:scale-[1.02]"
          >
            Apply to coach
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Footer is now provided by the shared <SiteFooter /> component.

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function SummerLanding() {
  const { openSearchModal, updateSports, sportDisciplines } = useSearch();

  const handleSearchClick = () => openSearchModal();

  // When a sport tile is picked, try to preselect the matching discipline
  // before opening the modal. If no match is found we just open the modal.
  const handleSportPick = (sportKey: string) => {
    const match = sportDisciplines?.find((d) => {
      const name = d.name?.toLowerCase() ?? "";
      return (
        name.includes(sportKey.replace("-", " ")) ||
        name.replace(/\s+/g, "-") === sportKey
      );
    });
    if (match?.id) updateSports([match.id]);
    openSearchModal();
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <GrainOverlay />
      <SiteHeader transparent />
      <main className="relative z-[2]">
        <Hero onSearchClick={handleSearchClick} />
        <SportsGrid onPick={handleSportPick} />
        <HowItWorks onSearchClick={handleSearchClick} />
        <InstructorsTeaser onSearchClick={handleSearchClick} />
        <Destinations onSearchClick={handleSearchClick} />
        <Testimonials />
        <InstructorCTA />
      </main>
      <SiteFooter />

      {/* Retain existing search modal + navigate-to-results behaviour */}
      <GlobalSearchModal shouldNavigate={true} />
    </div>
  );
}
