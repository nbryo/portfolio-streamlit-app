"use client";

import { useState } from "react";
import AnalyzeForm from "./AnalyzeForm";
import EfficientFrontierChart from "./charts/EfficientFrontierChart";
import BacktestChart from "./charts/BacktestChart";
import WeightsPieChart from "./charts/WeightsPieChart";
import type { AnalyzeResponse } from "@/lib/types";

function pct(x: number): string {
  const sign = x > 0 ? "+" : "";
  return `${sign}${(x * 100).toFixed(2)}%`;
}

export default function AnalyzePanel() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  return (
    <div className="flex flex-col gap-10">
      <AnalyzeForm onResult={setResult} />

      {result && (
        <div className="flex flex-col gap-8">
          <SectionTitle label="Results" right={`${result.metadata.period} · ${result.metadata.n_simulations.toLocaleString()} simulations`} />

          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Expected Return" value={pct(result.optimal.return)} tone="pos" />
            <Stat label="Risk (σ)" value={pct(result.optimal.risk)} />
            <Stat label="Sharpe" value={result.optimal.sharpe.toFixed(3)} tone="accent" />
            <Stat label="Max Drawdown" value={pct(result.optimal.max_drawdown)} tone="neg" />
          </section>

          <ChartCard title="Efficient Frontier" hint="Max-Sharpe marked ★">
            <EfficientFrontierChart scatter={result.scatter} optimal={result.optimal} />
          </ChartCard>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Backtest" hint="Fixed optimal weights">
              <BacktestChart backtest={result.backtest} />
            </ChartCard>
            <ChartCard title="Allocation" hint="Max-Sharpe weights">
              <WeightsPieChart weights={result.optimal.weights} />
            </ChartCard>
          </section>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Filtered tickers (above SML):{" "}
            <span className="num text-zinc-700 dark:text-zinc-300">
              {result.filtered_tickers.join(" · ")}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ label, right }: { label: string; right?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-100">
        {label}
      </h2>
      {right && (
        <span className="num text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {right}
        </span>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "pos" | "neg" | "accent";
}) {
  const valueTone =
    tone === "pos"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "neg"
        ? "text-red-600 dark:text-red-400"
        : tone === "accent"
          ? "text-blue-700 dark:text-blue-400"
          : "text-zinc-900 dark:text-zinc-100";
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-4 py-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className={`num text-2xl font-semibold mt-2 ${valueTone}`}>{value}</div>
    </div>
  );
}

function ChartCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
      <header className="flex items-baseline justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
        {hint && (
          <span className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            {hint}
          </span>
        )}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
