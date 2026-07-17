'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

// A light, consistent entrance for every route. Keyed by pathname so it
// re-triggers on navigation without needing AnimatePresence/exit choreography
// (the old page is already gone by the time the new one mounts under the
// App Router, so an exit animation has nothing to animate against).
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      className="w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
