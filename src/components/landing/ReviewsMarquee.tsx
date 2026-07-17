const REVIEWS = [
  { name: "Mara Ellison", role: "Product Lead, Fenwick", quote: "Feels inevitable in hindsight — obvious once you see it." },
  { name: "Theo Kwan", role: "Founder, Loop Studio", quote: "The most considered onboarding we've shipped." },
  { name: "Priya Nandan", role: "Design Director, Arc", quote: "Every detail earns its place. Nothing feels bolted on." },
  { name: "Sam Ortiz", role: "Head of Growth, Vela", quote: "Our activation rate jumped the week we switched." },
  { name: "Julia Ferns", role: "CEO, Northlane", quote: "It's rare that 'fast' and 'polished' aren't a trade-off." },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

function ReviewCard({ r }: { r: (typeof REVIEWS)[number] }) {
  return (
    <div className="mx-2.5 flex w-[280px] shrink-0 items-start gap-3 rounded-xl border border-gloss-line bg-gloss-panel2/60 px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gloss-accent to-gloss-accent2 font-glossDisplay text-[11px] font-semibold text-white">
        {initials(r.name)}
      </div>
      <div className="min-w-0">
        <p className="truncate font-glossBody text-xs text-gloss-fg/90">
          <span className="font-medium">{r.name}</span>
          <span className="text-gloss-muted"> · {r.role}</span>
        </p>
        <p className="mt-0.5 line-clamp-2 font-glossBody text-xs leading-snug text-gloss-muted">
          {r.quote}
        </p>
      </div>
    </div>
  );
}

export default function ReviewsMarquee() {
  const track = [...REVIEWS, ...REVIEWS];

  return (
    <div
      className="relative overflow-hidden py-1"
      style={{
        maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div
        className="flex w-max animate-marquee"
        style={{ animationDuration: "42s" }}
      >
        {track.map((r, i) => (
          <ReviewCard key={i} r={r} />
        ))}
      </div>
    </div>
  );
}
