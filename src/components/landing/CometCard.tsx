"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function CometCard({
  children,
  highlighted = false,
}: {
  children: React.ReactNode;
  highlighted?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(py, [0, 1], [7, -7]), {
    stiffness: 180,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-7, 7]), {
    stiffness: 180,
    damping: 20,
  });

  // Softer, smaller glare than before — a hint of light instead of a shine.
  const glareBackground = useTransform([px, py], ([gx, gy]: number[]) =>
    `radial-gradient(circle at ${gx * 100}% ${gy * 100}%, rgba(255,255,255,0.06), transparent 45%)`
  );

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function handleLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      whileHover={{ scale: 1.015 }}
      className={`relative rounded-2xl p-[1.5px] transition-shadow duration-300 ${
        highlighted ? "shadow-gloss-glow-gold" : ""
      }`}
    >
      {/* rotating comet-trail border — recommended card gets a warm gold
          trail so it reads as distinct from the blue used everywhere else */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div
          className="absolute inset-[-60%] animate-spin"
          style={{
            animationDuration: highlighted ? "4.5s" : "7s",
            background: highlighted
              ? "conic-gradient(from 0deg, transparent 0deg, #F5B942 55deg, rgba(255,224,153,0.55) 90deg, transparent 130deg, transparent 360deg)"
              : "conic-gradient(from 0deg, transparent 0deg, #7C9BFF 55deg, rgba(236,236,241,0.5) 90deg, transparent 130deg, transparent 360deg)",
          }}
        />
      </div>

      {/* card body */}
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-gloss-panel/95">
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          style={{ background: glareBackground }}
        />
        <div className="relative z-0 flex h-full flex-col">{children}</div>
      </div>
    </motion.div>
  );
}
