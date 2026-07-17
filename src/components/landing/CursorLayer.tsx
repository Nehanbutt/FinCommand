"use client";

import { usePathname } from "next/navigation";
import CursorTrail from "@/components/landing/CursorTrail";
import PremiumCursor from "@/components/landing/PremiumCursor";

export default function CursorLayer() {
  const pathname = usePathname();
  return pathname === "/pricing" ? <PremiumCursor /> : <CursorTrail />;
}
