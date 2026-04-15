"use client";

/**
 * Site-wide top navigation. Used on every page outside of the bare
 * auth split-screen. Mirrors the look of the landing page nav.
 *
 * `transparent` = sits above hero photography on the landing page,
 * goes solid on scroll. Set to false on routes without hero imagery
 * so the bar is solid from page load.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/contexts/auth-context";

interface SiteHeaderProps {
  transparent?: boolean;
}

const NAV_LINKS: Array<[string, string]> = [
  ["Sports", "/#sports"],
  ["How it works", "/#how"],
  ["Instructors", "/#instructors"],
  ["Become an instructor", "/raven/signup?type=instructor"],
];

export function SiteHeader({ transparent = false }: SiteHeaderProps) {
  const { user, loading: authLoading } = useAuth();
  const [scrolled, setScrolled] = useState(!transparent);

  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-white/10 bg-black/85 backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/assets/logos/raven-logo.svg"
            alt="Raven"
            width={128}
            height={32}
            className="block h-7 w-[112px] object-contain object-left sm:h-8 sm:w-[128px]"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="font-['Archivo'] text-sm text-white/70 transition-colors hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {!authLoading && user ? (
            <Link
              href="/raven/account"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-['Archivo'] text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
            >
              {user.user_metadata?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                  {(
                    user.user_metadata?.first_name?.[0] ||
                    user.email?.[0] ||
                    "U"
                  ).toUpperCase()}
                </span>
              )}
              <span className="hidden sm:inline">
                {user.user_metadata?.first_name || "Account"}
              </span>
            </Link>
          ) : !authLoading ? (
            <>
              <Link
                href="/raven/login"
                className="hidden rounded-full px-4 py-2 font-['Archivo'] text-sm text-white/80 transition-colors hover:text-white sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/raven/signup"
                className="inline-flex items-center rounded-full bg-white px-4 py-2 font-['Archivo'] text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
              >
                Get started
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

/** Spacer matching SiteHeader's height — use under non-hero pages so
 *  content isn't tucked behind the fixed bar. */
export function HeaderSpacer() {
  return <div aria-hidden className="h-16 sm:h-20" />;
}
