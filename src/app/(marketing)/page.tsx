'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import GetStartedButton from '@/components/landing/GetStartedButton';
import DottedBackground from '@/components/landing/DottedBackground';
import TypingText from '@/components/landing/TypingText';
import SignatureMark from '@/components/landing/SignatureMark';
import ReviewsMarquee from '@/components/landing/ReviewsMarquee';

const BELIEVE_PHRASES = [
  'your data should never leave your device.',
  "finance shouldn't need a finance degree.",
  'a dashboard should update the moment you do.',
];

const BELIEVE_POINTS = [
  'Health score, forecasts, and insights recalculate the instant you change an input.',
  'Runs entirely on your machine — nothing is sent to a server.',
  'Free and self-hosted. No subscription, ever.',
];

export default function MarketingHome() {
  const router = useRouter();
  const { company, hasHydrated } = useStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (hasHydrated) {
      if (company) router.replace('/app/dashboard');
      setChecked(true);
    }
  }, [hasHydrated, company]);

  if (!hasHydrated || (checked && company)) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-gloss-accent2 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden sm:h-[calc(100vh-2.25rem)] sm:min-h-0 sm:overflow-hidden">
      <DottedBackground />

      <main className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center gap-6 px-6 py-10 sm:px-14 sm:py-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gloss-line bg-gloss-panel2/60 px-3 py-1 font-glossMono text-[11px] tracking-widest text-gloss-accent2">
          <span className="h-1.5 w-1.5 rounded-full bg-gloss-accent2 shadow-gloss-glow-sm" />
          FREE. SELF-HOSTED. YOURS.
        </div>

        <div className="max-w-2xl">
          <h1 className="font-glossDisplay text-4xl font-semibold leading-[1.08] gloss-text-gradient sm:text-5xl lg:text-6xl">
            Fifteen numbers in.
            <br />A hundred answers out.
          </h1>
        </div>

        {/* Fixed-height, single-line box: whitespace-nowrap stops it from ever
            wrapping to a second line, overflow-hidden clips gracefully on the
            rare ultra-narrow screen instead of wrapping. Plain responsive
            text sizes — no fluid clamp/flex tricks, nothing fragile. */}
        <p className="mt-4 flex h-8 items-center overflow-hidden sm:h-9 lg:h-10">
          <span className="whitespace-nowrap font-glossBody text-base text-gloss-fg/90 sm:text-xl lg:text-2xl">
            <span className="font-semibold text-gloss-fg">We believe </span>
            <TypingText phrases={BELIEVE_PHRASES} className="text-gloss-accent2" />
          </span>
        </p>

        <ul className="grid max-w-xl gap-2.5">
          {BELIEVE_POINTS.map((point) => (
            <li key={point} className="flex items-start gap-3">
              <span className="mt-1.5 h-2 w-6 shrink-0 rounded-full bg-gradient-to-r from-gloss-accent to-gloss-accent2 shadow-gloss-glow-sm" />
              <span className="font-glossBody text-sm text-gloss-fg/90 sm:text-base">{point}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-5">
          <GetStartedButton />
          <a
            href="/onboarding"
            className="group flex items-center gap-2 font-glossBody text-sm text-gloss-muted transition hover:text-gloss-fg"
          >
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
              <svg
                className="gloss-comet-ring absolute inset-0 opacity-80 transition group-hover:opacity-100"
                viewBox="0 0 40 40"
              >
                <defs>
                  <linearGradient id="cometRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C9BFF" stopOpacity="0" />
                    <stop offset="45%" stopColor="#7C9BFF" stopOpacity="0.9" />
                    <stop offset="75%" stopColor="#ff9ecb" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#ECECF1" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <circle
                  cx="20"
                  cy="20"
                  r="17.2"
                  fill="none"
                  stroke="url(#cometRing)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeDasharray="26 82"
                />
              </svg>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gloss-line bg-gloss-panel2/50 transition group-hover:border-gloss-accent2">
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <polygon points="1,0 10,5 1,10" fill="currentColor" />
                </svg>
              </span>
            </span>
            See it in action
          </a>
        </div>

        <div className="mt-2 flex items-center gap-8">
          <div className="w-[65%] min-w-0">
            <ReviewsMarquee />
          </div>
          <div className="flex flex-1 justify-end">
            <SignatureMark />
          </div>
        </div>
      </main>

      <div className="pointer-events-none absolute bottom-3 left-6 z-10 font-glossBody text-[11px] text-gloss-muted/70 sm:left-14">
        © {new Date().getFullYear()} FinCommand
      </div>
    </div>
  );
}
