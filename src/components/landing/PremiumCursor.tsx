"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const TRAIL_COUNT = 7;

export default function PremiumCursor() {
  const [enabled, setEnabled] = useState(false);
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const coreX = useSpring(mx, { stiffness: 300, damping: 26, mass: 0.35 });
  const coreY = useSpring(my, { stiffness: 300, damping: 26, mass: 0.35 });

  const ringRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const trailPos = useRef(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 }))
  );
  const hueRef = useRef(220);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setEnabled(canHover);
    if (!canHover) return;

    function onMove(e: MouseEvent) {
      mx.set(e.clientX);
      my.set(e.clientY);

      const tx = e.clientX / window.innerWidth;
      const ty = e.clientY / window.innerHeight;
      const hue = 205 + tx * 110 + ty * 25; // blue -> violet -> pink, never green/yellow
      hueRef.current = hue % 360;

      const color = `hsl(${hueRef.current}, 90%, 70%)`;
      if (ringRef.current) ringRef.current.style.borderColor = color;
      if (glowRef.current)
        glowRef.current.style.background = `radial-gradient(circle, ${color}55, transparent 70%)`;
    }

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    function loop() {
      let px = coreX.get();
      let py = coreY.get();
      trailPos.current.forEach((t, i) => {
        const ease = Math.max(0.32 - i * 0.025, 0.1);
        t.x += (px - t.x) * ease;
        t.y += (py - t.y) * ease;
        const el = dotRefs.current[i];
        if (el) {
          el.style.transform = `translate(${t.x}px, ${t.y}px)`;
          const dotHue = (hueRef.current + i * 18) % 360;
          el.style.background = `hsl(${dotHue}, 92%, 72%)`;
        }
        px = t.x;
        py = t.y;
      });
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [enabled, coreX, coreY]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] mix-blend-screen">
      {trailPos.current.map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            dotRefs.current[i] = el;
          }}
          style={{ opacity: 0.85 - i / (TRAIL_COUNT + 1) }}
          className="absolute left-0 top-0 -ml-[3.5px] -mt-[3.5px] h-[7px] w-[7px] rounded-full"
        />
      ))}

      {/* soft glow */}
      <motion.div
        ref={glowRef}
        style={{ translateX: coreX, translateY: coreY }}
        className="absolute left-0 top-0 -ml-7 -mt-7 h-14 w-14 rounded-full blur-lg"
      />

      {/* simple ring core — no filled shape, just a clean outline */}
      <motion.div
        ref={ringRef}
        style={{ translateX: coreX, translateY: coreY }}
        className="absolute left-0 top-0 -ml-[9px] -mt-[9px] h-[18px] w-[18px] rounded-full border-2"
      />
    </div>
  );
}
