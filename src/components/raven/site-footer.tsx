"use client";

/**
 * Site-wide footer. Mirrors the look extracted from summer-landing.
 */

import React from "react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <img
              src="/assets/logos/raven-logo.svg"
              alt="Raven"
              width={128}
              height={36}
              className="block h-8 w-[128px] object-contain object-left"
            />
            <p className="mt-4 max-w-xs font-['Archivo'] text-sm text-white/60">
              One-to-one coaching, booked in seconds. Tell us the sport,
              location, and dates. We&apos;ll do the rest.
            </p>
          </div>
          <FooterCol
            title="Explore"
            links={[
              ["Sports", "/#sports"],
              ["Instructors", "/#instructors"],
              ["Destinations", "/#destinations"],
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              ["How it works", "/#how"],
              ["Become a coach", "/raven/signup?type=instructor"],
              ["Careers", "#"],
            ]}
          />
          <FooterCol
            title="Support"
            links={[
              ["Help centre", "#"],
              ["Contact", "#"],
              ["Trust & safety", "#"],
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row sm:items-center">
          <p className="font-['Archivo']">
            © {new Date().getFullYear()} Raven. All rights reserved.
          </p>
          <div className="flex gap-6 font-['Archivo']">
            <Link href="#" className="transition-colors hover:text-white">
              Terms
            </Link>
            <Link href="#" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="#" className="transition-colors hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<[string, string]>;
}) {
  return (
    <div>
      <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-white/40">
        {title}
      </p>
      <ul className="mt-4 space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="font-['Archivo'] text-sm text-white/75 transition-colors hover:text-white"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
