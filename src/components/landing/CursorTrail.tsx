"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const TRAIL_COUNT = 6;

export default function CursorTrail() {
  const [enabled, setEnabled] = useState(false);
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);

  const hexX = useSpring(mx, { stiffness: 260, damping: 24, mass: 0.4 });
  const hexY = useSpring(my, { stiffness: 260, damping: 24, mass: 0.4 });

  // Plain DOM refs for the trail dots, updated directly in a rAF loop.
  // (Avoids calling hooks inside a loop/array, which would break the rules of hooks.)
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const trailPos = useRef(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 }))
  );

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setEnabled(canHover);
    if (!canHover) return;

    function onMove(e: MouseEvent) {
      mx.set(e.clientX);
      my.set(e.clientY);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    function loop() {
      let px = hexX.get();
      let py = hexY.get();
      trailPos.current.forEach((t, i) => {
        const ease = Math.max(0.35 - i * 0.03, 0.12);
        t.x += (px - t.x) * ease;
        t.y += (py - t.y) * ease;
        const el = dotRefs.current[i];
        if (el) el.style.transform = `translate(${t.x}px, ${t.y}px)`;
        px = t.x;
        py = t.y;
      });
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [enabled, hexX, hexY]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] mix-blend-screen">
      {trailPos.current.map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            dotRefs.current[i] = el;
          }}
          style={{ opacity: 1 - i / TRAIL_COUNT }}
          className="absolute left-0 top-0 -ml-[3px] -mt-[3px] h-[6px] w-[6px] rounded-full bg-gloss-accent2"
        />
      ))}

      <motion.div
        style={{ translateX: hexX, translateY: hexY }}
        className="absolute left-0 top-0 -ml-[13px] -mt-[13px]"
      >
        <svg width="26" height="26" viewBox="0 0 26 26" className="drop-shadow-[0_0_10px_rgba(124,155,255,0.9)]">
          <polygon
            points="13,1 24,7 24,19 13,25 2,19 2,7"
            fill="rgba(7,7,10,0.4)"
            stroke="#7C9BFF"
            strokeWidth="1.4"
          />
          <circle cx="13" cy="13" r="2.4" fill="#ECECF1" />
        </svg>
      </motion.div>
    </div>
  );
}
