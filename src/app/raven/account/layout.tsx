"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  CalendarCheck,
  CreditCard,
  UserRound,
  ShieldCheck,
  ImageIcon,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteHeader, HeaderSpacer } from "@/components/raven/site-header";
import { SiteFooter } from "@/components/raven/site-footer";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/raven/account/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/raven/account/payments", label: "Invoices", icon: CreditCard },
  { href: "/raven/account/details", label: "Personal", icon: UserRound },
  { href: "/raven/account/security", label: "Security", icon: ShieldCheck },
  { href: "/raven/account/profile", label: "Profile", icon: ImageIcon },
  { href: "/raven/account/notifications", label: "Notifications", icon: Bell },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <SiteHeader />
      <HeaderSpacer />

      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-20">
        {/* Page heading */}
        <header className="mb-10 sm:mb-14">
          <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-white/50">
            Your account
          </p>
          <h1 className="mt-2 font-['PP_Editorial_New'] text-4xl leading-[1.05] tracking-[-0.01em] text-white sm:text-5xl">
            Manage your{" "}
            <span className="italic text-white/85">Raven.</span>
          </h1>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Sidebar — desktop */}
          <nav className="hidden w-[240px] flex-shrink-0 lg:block">
            <ul className="sticky top-28 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <motion.div
                        whileHover={{ x: isActive ? 0 : 2 }}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-3 font-['Archivo'] text-sm transition-colors",
                          isActive
                            ? "bg-white text-black"
                            : "text-white/65 hover:bg-white/[0.06] hover:text-white",
                        )}
                      >
                        <Icon className="h-4 w-4" strokeWidth={2} />
                        {item.label}
                      </motion.div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Pills nav — mobile */}
          <nav
            className="-mx-4 overflow-x-auto px-4 lg:hidden"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <ul className="flex min-w-max gap-2 pb-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 font-['Archivo'] text-xs transition-colors sm:text-sm",
                        isActive
                          ? "bg-white text-black"
                          : "border border-white/10 bg-white/[0.04] text-white/70",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Content */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
