"use client";

import { useEffect, useRef } from "react";

type Dot = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
};

export default function DottedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dots: Dot[] = [];
    const spacing = 34;
    const radius = 1.15;
    const influence = 110;
    const strength = 22;

    let width = 0;
    let height = 0;
    let dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

    function buildGrid() {
      dots = [];
      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;
          dots.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 });
        }
      }
    }

    function resize() {
      const parent = canvas!.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = width + "px";
      canvas!.style.height = height + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }

    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    }

    function onLeave() {
      mouse.current.x = -9999;
      mouse.current.y = -9999;
    }

    let raf = 0;
    function tick() {
      ctx!.clearRect(0, 0, width, height);
      for (const d of dots) {
        const dx = d.x - mouse.current.x;
        const dy = d.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < influence) {
          const force = (1 - dist / influence) * strength;
          const angle = Math.atan2(dy, dx);
          d.vx += Math.cos(angle) * force * 0.06;
          d.vy += Math.sin(angle) * force * 0.06;
        }

        // spring back to origin
        d.vx += (d.ox - d.x) * 0.06;
        d.vy += (d.oy - d.y) * 0.06;
        // damping
        d.vx *= 0.82;
        d.vy *= 0.82;

        d.x += d.vx;
        d.y += d.vy;

        const distFromOrigin = Math.hypot(d.x - d.ox, d.y - d.oy);
        const glow = Math.min(distFromOrigin / 14, 1);
        const r = radius + glow * 1.3;

        ctx!.beginPath();
        ctx!.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${124 + glow * 80}, ${155 + glow * 60}, 255, ${0.16 + glow * 0.55})`;
        ctx!.fill();
      }
      raf = requestAnimationFrame(tick);
    }

    resize();
    tick();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
