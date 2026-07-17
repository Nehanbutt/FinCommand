'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

// Applies the persisted app-section theme to <html data-theme="...">.
// Scoped CSS in globals.css only reacts to this attribute inside
// elements carrying the `.app-scope` class, so the always-dark marketing
// pages are never affected by the toggle in Settings.
export default function ThemeApplier() {
  const { theme, hasHydrated } = useStore();

  useEffect(() => {
    if (!hasHydrated) return;
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme, hasHydrated]);

  return null;
}
