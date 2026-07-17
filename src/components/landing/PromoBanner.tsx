const MESSAGE = "100% FREE  —  SELF-HOSTED  —  YOUR DATA NEVER LEAVES YOUR DEVICE";

export default function PromoBanner() {
  const items = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="relative h-9 shrink-0 overflow-hidden border-b border-gloss-line bg-gloss-panel/80">
      <div className="flex h-full w-max animate-marquee items-center whitespace-nowrap font-glossMono text-[11px] tracking-[0.2em] text-gloss-accent2">
        {items.map((i) => (
          <span key={i} className="mx-6 flex items-center gap-6">
            {MESSAGE}
            <span className="text-gloss-muted">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
