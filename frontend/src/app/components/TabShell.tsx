"use client";

import { useCallback, useState } from "react";
import BottomTabBar, { type TabKey } from "./tabs/BottomTabBar";
import HomeTab from "./tabs/HomeTab";
import ResultTab from "./tabs/ResultTab";
import LearnTab from "./tabs/LearnTab";
import SettingsTab from "./tabs/SettingsTab";
import type { AnalyzeResponse } from "@/lib/types";

export default function TabShell() {
  const [active, setActive] = useState<TabKey>("home");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResult = useCallback((data: AnalyzeResponse) => {
    setResult(data);
    setActive("result");
  }, []);

  return (
    <>
      <main className="pb-24 md:pb-28">
        {active === "home" && (
          <HomeTab
            onResult={handleResult}
            loading={loading}
            setLoading={setLoading}
          />
        )}
        {active === "result" && (
          <ResultTab
            result={result}
            loading={loading}
            onGoHome={() => setActive("home")}
          />
        )}
        {active === "learn" && <LearnTab />}
        {active === "settings" && <SettingsTab />}
      </main>
      <BottomTabBar
        active={active}
        onChange={setActive}
        hasResult={result !== null}
      />
    </>
  );
}
