import Link from 'next/link';
import EtherealBackground from '@/components/landing/EtherealBackground';
import CometCard from '@/components/landing/CometCard';

const CHECK = (
  <svg width="14" height="14" viewBox="0 0 14 14" className="mt-0.5 shrink-0 text-gloss-accent2">
    <path
      d="M2 7.2L5.2 10.4L12 3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CARDS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Everything on this page, unlimited employees, unlimited scenarios.',
    features: [
      'Health score & smart insights',
      'Employee intelligence',
      '12-month forecasting',
      'Scenario simulator',
      'CSV import & reports',
    ],
    cta: 'Start free',
    highlighted: true,
  },
  {
    name: 'Self-hosted',
    price: 'Always included',
    period: 'no server, no bill',
    description: "Your financial data lives on your own machine — never on someone else's server.",
    features: [
      'Local-first storage',
      'Nothing sent to a third party',
      'No vendor lock-in',
      'Works without a connection',
    ],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Community',
    price: 'Free forever',
    period: 'no paywalled features',
    description: 'Shaped by real SME founders and operators, not a sales team.',
    features: [
      'Regular feature updates',
      'Founder-led support',
      'Public roadmap input',
      'Nothing to upgrade to',
    ],
    cta: 'Start free',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden sm:h-[calc(100vh-2.25rem)] sm:min-h-0 sm:overflow-hidden">
      <EtherealBackground />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center px-6 pb-2 pt-6 sm:px-10 sm:pt-8">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-glossBody text-sm text-gloss-muted transition hover:text-gloss-fg"
        >
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path
              d="M9 2L3 7l6 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to home
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-6 px-6 pb-10 pt-2 sm:px-10 sm:pb-8">
        <div className="mb-2 text-center">
          <h1 className="font-glossDisplay text-3xl font-semibold gloss-text-gradient sm:text-4xl">
            Free, because your data should stay yours.
          </h1>
          <p className="mt-2.5 font-glossBody text-sm text-gloss-muted sm:text-base">
            FinCommand runs as a single local app — there's no server bill to pass on, so there's no subscription either.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-7">
          {CARDS.map((card) => (
            <CometCard key={card.name} highlighted={card.highlighted}>
              <div className="flex h-full flex-col gap-5 p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="font-glossDisplay text-sm font-semibold tracking-wide text-gloss-fg">
                    {card.name}
                  </span>
                  {card.highlighted && (
                    <span className="rounded-full border border-[#F5B942]/40 bg-[#F5B942]/10 px-2.5 py-0.5 font-glossMono text-[10px] tracking-wider text-[#F5B942]">
                      RECOMMENDED
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-end gap-1">
                    <span className="font-glossDisplay text-3xl font-semibold text-gloss-fg sm:text-4xl">
                      {card.price}
                    </span>
                  </div>
                  <p className="mt-1 font-glossBody text-xs text-gloss-muted">{card.period}</p>
                </div>

                <p className="font-glossBody text-sm text-gloss-muted">{card.description}</p>

                <div className="gloss-hairline" />

                <ul className="flex flex-col gap-2.5">
                  {card.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 font-glossBody text-sm text-gloss-fg/90">
                      {CHECK}
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/onboarding"
                  className={`mt-auto rounded-lg py-2.5 text-center font-glossBody text-sm font-medium transition ${
                    card.highlighted
                      ? 'bg-[#F5B942] text-[#1A1300] shadow-gloss-glow-gold-sm hover:brightness-110'
                      : 'border border-gloss-line text-gloss-fg hover:border-gloss-accent2 hover:text-gloss-accent2'
                  }`}
                >
                  {card.cta}
                </Link>
              </div>
            </CometCard>
          ))}
        </div>
      </main>
    </div>
  );
}
