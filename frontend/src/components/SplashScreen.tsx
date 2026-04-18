"use client";

import { useEffect, useMemo, useState } from "react";

const SPLASH_KEY = "portfolio-splash-shown";

// Star geometry: 8-point star at the top-right of the icon. Computed once so
// the polygon points stay in sync with any size change (viewBox is 512×512).
function buildStarPoints(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
): string {
  return Array.from({ length: 16 }, (_, i) => {
    const angle = Math.PI / 2 - (i * Math.PI) / 8;
    const r = i % 2 === 0 ? outer : inner;
    const x = cx + r * Math.cos(angle);
    const y = cy - r * Math.sin(angle);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SPLASH_KEY) === "1") {
      setVisible(false);
      return;
    }
    sessionStorage.setItem(SPLASH_KEY, "1");
    const fade = setTimeout(() => setFading(true), 1500);
    const hide = setTimeout(() => setVisible(false), 2000);
    return () => {
      clearTimeout(fade);
      clearTimeout(hide);
    };
  }, []);

  const starPoints = useMemo(() => buildStarPoints(410, 95, 52, 20), []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className={
        "fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 " +
        (fading ? "opacity-0 pointer-events-none" : "opacity-100")
      }
      style={{
        background: "linear-gradient(135deg, #023047 0%, #219ebc 100%)",
      }}
    >
      <svg
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
        className="w-32 h-32 splash-bounce"
        style={{ filter: "drop-shadow(0 10px 28px rgba(0,0,0,0.35))" }}
      >
        <defs>
          <linearGradient id="splashBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#023047" />
            <stop offset="100%" stopColor="#05213a" />
          </linearGradient>
          <linearGradient id="splashCurve" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8ecae6" />
            <stop offset="50%" stopColor="#ffb703" />
            <stop offset="100%" stopColor="#fb8500" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="115" ry="115" fill="url(#splashBg)" />
        <path
          d="M 80 420 Q 200 380 260 260 T 440 100"
          stroke="url(#splashCurve)"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
        />
        <g stroke="#023047" strokeWidth="2">
          <circle cx="115" cy="405" r="11" fill="#8ecae6" />
          <circle cx="180" cy="370" r="11" fill="#8ecae6" />
          <circle cx="245" cy="300" r="11" fill="#ffb703" />
          <circle cx="310" cy="220" r="12" fill="#ffb703" />
          <circle cx="370" cy="155" r="12" fill="#fb8500" />
        </g>
        <polygon points={starPoints} fill="#ffb703" />
      </svg>
    </div>
  );
}
