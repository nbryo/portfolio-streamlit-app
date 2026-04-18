"use client";

import {
  BarChart3,
  BookOpen,
  Home,
  Settings as SettingsIcon,
} from "lucide-react";
import type { ComponentType } from "react";

export type TabKey = "home" | "result" | "learn" | "settings";

interface Props {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  hasResult?: boolean;
}

const TABS: { key: TabKey; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { key: "home", label: "ホーム", Icon: Home },
  { key: "result", label: "結果", Icon: BarChart3 },
  { key: "learn", label: "学ぶ", Icon: BookOpen },
  { key: "settings", label: "設定", Icon: SettingsIcon },
];

export default function BottomTabBar({ active, onChange, hasResult }: Props) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="タブナビゲーション"
    >
      <div className="max-w-6xl mx-auto flex items-stretch">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = active === key;
          const showDot = key === "result" && hasResult && !isActive;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
              className={
                "relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-colors " +
                (isActive
                  ? "text-blue-700 dark:text-blue-400"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200")
              }
            >
              <span className="relative">
                <Icon className="w-5 h-5" />
                {showDot && (
                  <span
                    aria-hidden
                    className="absolute -top-0.5 -right-1.5 w-2 h-2 rounded-full bg-blue-500"
                  />
                )}
              </span>
              <span>{label}</span>
              {isActive && (
                <span
                  aria-hidden
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b bg-blue-700 dark:bg-blue-400"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
