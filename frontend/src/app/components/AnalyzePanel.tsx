"use client";

import { useState } from "react";
import AnalyzeForm from "./AnalyzeForm";
import EfficientFrontierChart from "./charts/EfficientFrontierChart";
import BacktestChart from "./charts/BacktestChart";
import WeightsPieChart from "./charts/WeightsPieChart";
import { PRESETS, type AnalyzeResponse } from "@/lib/types";

function pct(x: number, digits = 2): string {
  const sign = x > 0 ? "+" : "";
  return `${sign}${(x * 100).toFixed(digits)}%`;
}

export default function AnalyzePanel() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  return (
    <div className="flex flex-col gap-10">
      <AnalyzeForm onResult={setResult} />

      {result && (
        <div className="flex flex-col gap-8">
          <SectionTitle
            label="Selection"
            right={`${PRESETS[result.metadata.preset].label} · ${result.metadata.period} · ${result.metadata.n_simulations.toLocaleString()} sims · ${result.metadata.elapsed_seconds.toFixed(1)}s`}
          />

          <SelectionStats result={result} />

          <SelectedTickersChips tickers={result.filtered_tickers} />

          <SectionTitle label="Portfolio" />

          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Expected Return" value={pct(result.optimal.return)} tone="pos" />
            <Stat label="Risk (σ)" value={pct(result.optimal.risk)} />
            <Stat label="Sharpe" value={result.optimal.sharpe.toFixed(3)} tone="accent" />
            <Stat label="Max Drawdown" value={pct(result.optimal.max_drawdown)} tone="neg" />
          </section>

          <ChartCard title="Efficient Frontier" hint="Max-Sharpe ★ · SML dashed">
            <EfficientFrontierChart
              scatter={result.scatter}
              optimal={result.optimal}
              benchmarksInfo={result.benchmarks_info}
            />
          </ChartCard>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Backtest" hint="Fixed optimal weights">
              <BacktestChart backtest={result.backtest} />
            </ChartCard>
            <ChartCard title="Allocation" hint="Max-Sharpe weights">
              <WeightsPieChart weights={result.optimal.weights} />
            </ChartCard>
          </section>
        </div>
      )}
    </div>
  );
}

function SelectionStats({ result }: { result: AnalyzeResponse }) {
  const universe = result.universe_size;
  const kept = result.filtered_count;
  const passRate = universe > 0 ? kept / universe : 0;
  const info = result.benchmarks_info;

  return (
    <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Stat label="Universe" value={`${universe.toLocaleString()}`} suffix="銘柄" />
      <Stat
        label="Above SML"
        value={`${kept.toLocaleString()}`}
        suffix={`/ ${universe} · ${pct(passRate, 1)}`}
        tone="accent"
      />
      <Stat label="Bench Return (avg)" value={pct(info.mean.return)} tone="pos" />
      <Stat label="Bench Risk (avg)" value={pct(info.mean.risk)} />
      <Stat label="SML Slope" value={info.sml_slope.toFixed(3)} />
    </section>
  );
}

function SelectedTickersChips({ tickers }: { tickers: string[] }) {
  if (!tickers.length) return null;
  return (
    <section>
      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400 font-medium mb-2">
        Filtered tickers ({tickers.length})
      </div>
      <div
        className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1"
        role="list"
        aria-label="Filtered tickers"
      >
        {tickers.map((t) => (
          <span
            key={t}
            role="listitem"
            className="num shrink-0 px-2.5 py-1 text-xs font-medium rounded border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300"
          >
            {t}
          </span>
        ))}
      </div>
    </section>
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
  suffix,
  tone,
}: {
  label: string;
  value: string;
  suffix?: string;
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
      <div className="flex items-baseline gap-2 mt-2">
        <span className={`num text-2xl font-semibold ${valueTone}`}>{value}</span>
        {suffix && (
          <span className="num text-xs text-zinc-500 dark:text-zinc-400">{suffix}</span>
        )}
      </div>
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
