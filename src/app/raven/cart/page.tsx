"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { CartItemComponent } from "@/components/raven/cart-item";
import {
  Button,
  LinkButton,
  Panel,
  SectionHeading,
} from "@/components/raven/ui";
import { SiteHeader, HeaderSpacer } from "@/components/raven/site-header";
import { SiteFooter } from "@/components/raven/site-footer";
import { ToastNotification } from "@/components/raven/toast-notification";

export default function CartPage() {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const items = useCartStore((state) => state.items);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const getCartTotal = useCartStore((state) => state.getCartTotal);

  const total = getCartTotal();
  const itemCount = items.length;
  const totalHours = items.reduce((sum, item) => sum + item.totalHours, 0);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <SiteHeader />
      <HeaderSpacer />

      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-20">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Cart"
            title="Your sessions."
            description={
              itemCount > 0
                ? `${itemCount} ${itemCount === 1 ? "booking" : "bookings"} · ${totalHours} hours total`
                : "Add instructors to plan your trip."
            }
          />
          {itemCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearCart();
                setShowToast(true);
              }}
            >
              Clear cart
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <Panel className="px-6 py-20 text-center sm:px-12 sm:py-28">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/5"
            >
              <ShoppingBag className="h-6 w-6 text-white/70" strokeWidth={1.6} />
            </motion.div>
            <h2 className="mt-6 font-['PP_Editorial_New'] text-4xl text-white sm:text-5xl">
              Your cart is empty.
            </h2>
            <p className="mx-auto mt-3 max-w-md font-['Archivo'] text-sm text-white/55 sm:text-base">
              Find a coach and pick the slots that work for you — we&apos;ll
              line them up here.
            </p>
            <div className="mt-8">
              <LinkButton href="/raven/search" size="lg">
                Browse instructors
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </LinkButton>
            </div>
          </Panel>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="space-y-4 lg:col-span-2">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <CartItemComponent
                    key={item.id}
                    item={item}
                    variant="expanded"
                    onRemove={removeFromCart}
                  />
                ))}
              </AnimatePresence>
            </div>

            <aside className="lg:col-span-1">
              <Panel className="sticky top-28 space-y-6 p-6">
                <h3 className="font-['PP_Editorial_New'] text-2xl text-white">
                  Order summary
                </h3>

                <div className="space-y-3 border-b border-white/10 pb-6">
                  <SummaryRow label="Bookings" value={String(itemCount)} />
                  <SummaryRow label="Hours" value={String(totalHours)} />
                  <SummaryRow label="Subtotal" value={`€${total}`} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-['Archivo'] text-sm uppercase tracking-[0.16em] text-white/55">
                    Total
                  </span>
                  <span className="font-['PP_Editorial_New'] text-3xl text-white">
                    €{total}
                  </span>
                </div>

                <div className="space-y-3">
                  <Button
                    fullWidth
                    size="lg"
                    onClick={() => router.push("/raven/checkout")}
                  >
                    Proceed to checkout
                    <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                  </Button>
                  <Button
                    fullWidth
                    size="lg"
                    variant="secondary"
                    onClick={() => router.push("/raven/search")}
                  >
                    Continue browsing
                  </Button>
                </div>

                <p className="border-t border-white/10 pt-6 text-center font-['Archivo'] text-xs text-white/45">
                  Secure checkout · Bookings confirmed instantly
                </p>
              </Panel>
            </aside>
          </div>
        )}
      </div>

      <SiteFooter />

      <ToastNotification
        isVisible={showToast}
        message="Cart cleared"
        onClose={() => setShowToast(false)}
        type="success"
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between font-['Archivo'] text-sm">
      <span className="text-white/55">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
