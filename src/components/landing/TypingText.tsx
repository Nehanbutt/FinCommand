"use client";

import { useEffect, useState } from "react";

export default function TypingText({
  phrases,
  typeSpeed = 45,
  deleteSpeed = 28,
  pause = 1600,
  className = "",
}: {
  phrases: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pause?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[index % phrases.length];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text.length < current.length) {
      timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), typeSpeed);
    } else if (!deleting && text.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text.length > 0) {
      timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), deleteSpeed);
    } else {
      setDeleting(false);
      setIndex((i) => (i + 1) % phrases.length);
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, index, phrases, typeSpeed, deleteSpeed, pause]);

  return (
    <span className={`whitespace-nowrap ${className}`}>
      {text}
      <span className="ml-0.5 inline-block h-[1em] w-[2px] animate-pulse bg-gloss-accent2 align-text-bottom" />
    </span>
  );
}
