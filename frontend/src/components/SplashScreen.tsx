"use client";

import { useEffect, useState } from "react";

const SPLASH_KEY = "portfolio-splash-shown";

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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icon-512.png"
        alt=""
        width={128}
        height={128}
        className="w-32 h-32 splash-bounce"
        style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.3))" }}
      />
    </div>
  );
}
