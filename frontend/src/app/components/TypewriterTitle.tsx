"use client";

import { useEffect, useState } from "react";

const FULL_TITLE = "ポートフォリオを最適化したいあなたに";
const CHAR_MS = 60;

export default function TypewriterTitle() {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      idx += 1;
      if (idx >= FULL_TITLE.length) {
        setDisplayed(FULL_TITLE);
        setDone(true);
        clearInterval(interval);
        return;
      }
      setDisplayed(FULL_TITLE.slice(0, idx));
    }, CHAR_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setShowCursor(false), 1400);
    return () => clearTimeout(t);
  }, [done]);

  return (
    <h1
      className="text-3xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 tracking-tight leading-tight"
      aria-label={FULL_TITLE}
    >
      <span>{displayed}</span>
      {showCursor && (
        <span
          aria-hidden
          className={
            "inline-block w-[0.08em] h-[0.9em] bg-blue-600 dark:bg-blue-400 ml-1 align-[-0.1em] " +
            (done ? "animate-pulse" : "")
          }
        />
      )}
    </h1>
  );
}
