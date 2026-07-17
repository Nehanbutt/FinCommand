"use client";

import { motion } from "framer-motion";

export default function SignatureMark() {
  return (
    <div className="relative flex flex-col items-end">
      <span className="mb-0.5 font-glossMono text-[10px] uppercase tracking-[0.2em] text-gloss-muted">
        A product by
      </span>

      <div className="relative overflow-hidden px-1">
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="gloss-signature-shimmer font-glossSignature text-5xl sm:text-6xl"
        >
          Nehan
        </motion.span>
      </div>

      <motion.svg
        width="140"
        height="14"
        viewBox="0 0 140 14"
        className="-mt-1"
        aria-hidden="true"
      >
        <motion.path
          d="M2 8 C 30 2, 60 12, 90 5 S 130 3, 138 9"
          fill="none"
          stroke="#7C9BFF"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }}
        />
      </motion.svg>
    </div>
  );
}
