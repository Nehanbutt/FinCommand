// Self-hosted fonts for the marketing pages only (via @fontsource) — avoids
// any build-time network request to Google Fonts, consistent with the
// system-font approach already used for the rest of the app.
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/caveat/600.css';
import '@fontsource/caveat/700.css';
import '@fontsource/jetbrains-mono/500.css';

import PromoBanner from '@/components/landing/PromoBanner';
import CursorLayer from '@/components/landing/CursorLayer';
import PageTransition from '@/components/PageTransition';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gloss-scope gloss-glossy-bg relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* persistent — never remounts when navigating between / and /pricing */}
      <PromoBanner />
      <CursorLayer />

      <div className="relative flex-1 overflow-x-hidden">
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}
