"use client";

/**
 * Raven UI primitives — the shared design system.
 *
 * Pulled from the summer-landing baseline so every page (auth, account,
 * cart, checkout, search, profile) uses the same look + feel.
 *
 * Aesthetic: monochrome (true black + white), grunge-editorial,
 * PP Editorial New for headlines, Archivo for body. No blues anywhere.
 */

import * as React from "react";
import Link from "next/link";
import { motion, type HTMLMotionProps } from "motion/react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// BUTTON
// ---------------------------------------------------------------------------

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const buttonClasses = (
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  fullWidth = false,
  loading = false,
) =>
  cn(
    "group inline-flex items-center justify-center gap-2 rounded-full font-['Archivo'] font-semibold transition-all",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "active:scale-[0.98]",
    {
      // sizes
      "px-3 py-1.5 text-xs": size === "sm",
      "px-5 py-2.5 text-sm": size === "md",
      "px-6 py-3.5 text-base": size === "lg",
      // variants — primary is the white pill across the whole site
      "bg-white text-black hover:bg-white/90": variant === "primary",
      "border border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10":
        variant === "secondary",
      "text-white/70 hover:text-white": variant === "ghost",
      "border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20":
        variant === "danger",
    },
    fullWidth && "w-full",
    loading && "cursor-progress",
  );

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "ref">,
    ButtonBaseProps {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...rest
    },
    ref,
  ) {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        disabled={disabled || loading}
        className={cn(buttonClasses(variant, size, fullWidth, loading), className)}
        {...rest}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    );
  },
);

// Link-styled button (anchor element). Uses next/link.
export interface LinkButtonProps extends ButtonBaseProps {
  href: string;
  target?: string;
  rel?: string;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  href,
  target,
  rel,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={cn(buttonClasses(variant, size, fullWidth), className)}
    >
      {children}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// FORM PRIMITIVES
// ---------------------------------------------------------------------------

interface FieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  className?: string;
  htmlFor?: string;
  children: React.ReactNode;
}

export function Field({
  label,
  hint,
  error,
  required,
  className,
  htmlFor,
  children,
}: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="flex items-baseline justify-between font-['Archivo'] text-[11px] uppercase tracking-[0.16em] text-white/55"
        >
          <span>
            {label}
            {required && <span className="ml-1 text-white/30">*</span>}
          </span>
          {hint && (
            <span className="text-[10px] normal-case tracking-normal text-white/35">
              {hint}
            </span>
          )}
        </label>
      )}
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-['Archivo'] text-xs text-red-300"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

const baseInputClasses = cn(
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5",
  "font-['Archivo'] text-[15px] text-white placeholder:text-white/30",
  "transition-all duration-200 outline-none",
  "hover:border-white/20 hover:bg-white/[0.06]",
  "focus:border-white/40 focus:bg-white/[0.08]",
  "disabled:cursor-not-allowed disabled:opacity-50",
  // browser-native date/time controls — use white scheme
  "[color-scheme:dark]",
);

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...rest }, ref) {
  return (
    <input ref={ref} className={cn(baseInputClasses, className)} {...rest} />
  );
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(baseInputClasses, "min-h-[120px] resize-y", className)}
      {...rest}
    />
  );
});

// Error / Success / Info banner
interface BannerProps {
  tone?: "error" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}

export function Banner({ tone = "info", children, className }: BannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border px-4 py-3 font-['Archivo'] text-sm",
        {
          "border-red-500/30 bg-red-500/10 text-red-200": tone === "error",
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-200":
            tone === "success",
          "border-white/15 bg-white/5 text-white/80": tone === "info",
        },
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// SURFACES
// ---------------------------------------------------------------------------

interface PanelProps {
  className?: string;
  children: React.ReactNode;
  hoverable?: boolean;
}

/** Standard glass-on-black panel used across forms, cards, lists. */
export function Panel({ className, children, hoverable }: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.015] backdrop-blur-sm",
        hoverable &&
          "transition-colors hover:border-white/25 hover:from-white/[0.08]",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

/** Standard page/section heading (eyebrow → big serif title → muted description). */
export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {eyebrow && (
        <p className="font-['Archivo'] text-[11px] uppercase tracking-[0.22em] text-white/50">
          {eyebrow}
        </p>
      )}
      <h1 className="font-['PP_Editorial_New'] text-3xl leading-[1.05] tracking-[-0.01em] text-white sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-xl font-['Archivo'] text-sm leading-6 text-white/65 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// STATUS BADGES
// ---------------------------------------------------------------------------

type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted";

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-['Archivo'] text-[11px] font-medium",
        {
          "border border-white/20 bg-white/5 text-white/85": tone === "neutral",
          "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200":
            tone === "success",
          "border border-amber-500/30 bg-amber-500/10 text-amber-200":
            tone === "warning",
          "border border-red-500/30 bg-red-500/10 text-red-200":
            tone === "danger",
          "border border-white/30 bg-white/10 text-white": tone === "info",
          "border border-white/10 bg-white/[0.03] text-white/55":
            tone === "muted",
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
