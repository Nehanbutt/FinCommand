"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GetStartedButton() {
  const router = useRouter();

  // Warm the /pricing route the moment this button exists, so the click
  // itself never has to wait on a cold compile/fetch.
  useEffect(() => {
    router.prefetch("/pricing");
  }, [router]);

  return (
    <button
      onClick={() => router.push("/pricing")}
      className="rounded-lg bg-gloss-accent px-5 py-2.5 font-glossBody text-sm font-medium text-white shadow-gloss-glow transition hover:brightness-110 active:scale-[0.98]"
    >
      Get Started
    </button>
  );
}
