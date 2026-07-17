'use client';

/**
 * Single-element conic-gradient loading ring.
 * ------------------------------------------------------------------------
 * Replaces the old `border-t-transparent animate-spin` spinners everywhere
 * (app boot, onboarding boot, sample-data buttons). One element, pure CSS,
 * no JS animation loop, and it inherits the app's indigo→periwinkle brand.
 *
 * The ring is drawn with a conic gradient and then "hollowed out" with a
 * radial-gradient mask so only the spinning arc shows — this is what gives
 * it that clean premium-arc look instead of a flat colored disc.
 *
 * Motion respects the global `prefers-reduced-motion` rule in globals.css,
 * which clamps all animations to ~0ms; in that case the ring still renders
 * (as a static arc) so the UI never looks empty/broken.
 */

type LoaderSize = 'lg' | 'sm';

const SIZE: Record<LoaderSize, number> = { lg: 52, sm: 18 };

export function LoaderRing({ size = 'lg' }: { size?: LoaderSize }) {
  const px = SIZE[size];
  return (
    <span
      role="status"
      aria-label="Loading"
      className="fc-loader-ring inline-block align-middle"
      style={{ width: px, height: px }}
    />
  );
}

/**
 * Full-screen boot loader — used while the persisted store hydrates
 * (app layout + onboarding). Centers the ring over the app background
 * with a soft brand glow behind it.
 */
export function FullScreenLoader({ label = 'Loading FinCommand…' }: { label?: string }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center gap-5" style={{ background: 'var(--bg-primary)' }}>
      <div className="relative flex items-center justify-center">
        {/* soft brand glow behind the ring */}
        <div
          className="absolute rounded-full blur-xl"
          style={{ width: 80, height: 80, background: 'radial-gradient(circle, rgba(59,91,255,0.35), transparent 70%)' }}
        />
        <LoaderRing size="lg" />
      </div>
      {label && <p className="relative text-sm text-slate-500 font-medium tracking-wide">{label}</p>}
    </div>
  );
}
