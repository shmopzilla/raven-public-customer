"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { Banner, Panel, SectionHeading } from "@/components/raven/ui";
import { cn } from "@/lib/utils";

interface NotificationType {
  id: number;
  title: string;
  description: string;
  display_order: number;
  subscribed: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/account/notifications");
        const data = await res.json();
        if (res.ok) setNotifications(data.data || []);
        else setError(data.error || "Failed to load notifications");
      } catch {
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const handleToggle = async (id: number, currentState: boolean) => {
    setToggling(id);
    try {
      const res = await fetch("/api/account/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationTypeId: id,
          subscribed: !currentState,
        }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, subscribed: !currentState } : n,
          ),
        );
      }
    } catch {
      // silently fail
    } finally {
      setToggling(null);
    }
  };

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
        eyebrow="Notifications"
        title="Stay in the loop."
        description="Choose which Raven email updates you receive. You can change these any time."
      />

      {error && <Banner tone="error">{error}</Banner>}

      {notifications.length === 0 && !error ? (
        <Panel className="px-6 py-12 text-center sm:px-12">
          <p className="font-['PP_Editorial_New'] text-2xl text-white">
            Nothing here yet
          </p>
          <p className="mt-2 font-['Archivo'] text-sm text-white/55">
            Notification preferences will appear here when available.
          </p>
        </Panel>
      ) : (
        <Panel className="overflow-hidden">
          <ul>
            {notifications.map((n, idx) => (
              <motion.li
                key={n.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                className={cn(
                  "flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.03] sm:px-6 sm:py-5",
                  idx < notifications.length - 1 &&
                    "border-b border-white/[0.06]",
                )}
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-['Archivo'] text-sm font-semibold text-white">
                    {n.title}
                  </h3>
                  {n.description && (
                    <p className="mt-0.5 font-['Archivo'] text-xs text-white/55">
                      {n.description}
                    </p>
                  )}
                </div>

                <Toggle
                  checked={n.subscribed}
                  disabled={toggling === n.id}
                  onChange={() => handleToggle(n.id, n.subscribed)}
                />
              </motion.li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        checked
          ? "border-white bg-white"
          : "border-white/15 bg-white/[0.06]",
        disabled && "opacity-50",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full transition-transform",
          checked
            ? "translate-x-6 bg-black"
            : "translate-x-1 bg-white",
        )}
      />
    </button>
  );
}
