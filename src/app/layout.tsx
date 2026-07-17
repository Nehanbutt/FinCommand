import type { Metadata } from 'next';
import './globals.css';
import ThemeApplier from '@/components/ThemeApplier';

// Deliberately NOT using next/font/google: fetching fonts at build time adds
// a hard network dependency that can make `next build` fail on a locked-down
// or offline machine. System font stacks (defined in globals.css) render
// instantly, need zero network access, and still carry the intended
// "financial instrument" character (serif display + monospace numerals).

export const metadata: Metadata = {
  title: 'FinCommand',
  description: 'Executive financial intelligence for SME founders and operators. Enter 15 values, get 100+ insights.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeApplier />
        {children}
      </body>
    </html>
  );
}
