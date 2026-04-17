/**
 * Ambient Background
 * ----------------------------------------------------------------------------
 * A fixed, full-viewport background with soft, blurred "blobs" layered over a
 * black base. Creates a smokey, atmospheric feel that lifts dark pages out of
 * pure-black flatness without competing with content.
 *
 * Sits behind everything at `-z-10`. Pages that want this effect should NOT
 * apply their own `bg-black` on the top-level wrapper — let this shine
 * through. Intentional semi-transparent overlays like `bg-black/85` on
 * sticky headers are fine and continue to work as expected.
 */

export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black"
    >
      {/* Large, soft glow anchored top-left */}
      <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-white/[0.12] blur-[120px]" />

      {/* Mid-right diagonal blob */}
      <div className="absolute top-[25%] -right-48 h-[620px] w-[620px] rounded-full bg-white/[0.08] blur-[140px]" />

      {/* Bottom-left anchor blob, biggest and most diffuse */}
      <div className="absolute -bottom-32 left-[12%] h-[720px] w-[720px] rounded-full bg-white/[0.09] blur-[160px]" />

      {/* Subtle accent top-right */}
      <div className="absolute top-[8%] right-[18%] h-[360px] w-[360px] rounded-full bg-white/[0.06] blur-[100px]" />

      {/* Faint warm accent low-right for depth */}
      <div className="absolute bottom-[18%] right-[6%] h-[420px] w-[420px] rounded-full bg-white/[0.07] blur-[130px]" />
    </div>
  );
}
