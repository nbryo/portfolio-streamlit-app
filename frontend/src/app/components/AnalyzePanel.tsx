"use client";

import { useState } from "react";
import {
  Filter,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
} from "lucide-react";
import AnalyzeForm from "./AnalyzeForm";
import EfficientFrontierChart from "./charts/EfficientFrontierChart";
import BacktestChart from "./charts/BacktestChart";
import WeightsPieChart from "./charts/WeightsPieChart";
import { PRESETS, type AnalyzeResponse } from "@/lib/types";

function pct(x: number, digits = 2): string {
  const sign = x > 0 ? "+" : "";
  return `${sign}${(x * 100).toFixed(digits)}%`;
}

type Tone = "pos" | "neg" | "accent" | "neutral";

export default function AnalyzePanel() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <AnalyzeForm onResult={setResult} />

      {result && (
        <div key={result.metadata.elapsed_seconds} className="flex flex-col gap-8 animate-fadeIn">
          <SectionTitle
            icon={<Filter className="w-4 h-4 text-blue-500" aria-hidden />}
            label="銘柄選別"
            right={`${PRESETS[result.metadata.preset].label} · ${result.metadata.period} · ${result.metadata.n_simulations.toLocaleString()}回 · ${result.metadata.elapsed_seconds.toFixed(1)}秒`}
          />

          <SelectionStats result={result} />

          {result.hedge_tickers.length > 0 && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              ヘッジ資産:{" "}
              <span className="num text-purple-700 dark:text-purple-300">
                {result.hedge_tickers.join(" · ")}
              </span>
            </p>
          )}

          <SelectedTickersChips
            tickers={result.filtered_tickers}
            hedgeTickers={result.hedge_tickers}
          />

          <SectionTitle
            icon={<PieChartIcon className="w-4 h-4 text-blue-500" aria-hidden />}
            label="ポートフォリオ"
          />

          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            <Stat label="期待リターン" value={pct(result.optimal.return)} tone="pos" />
            <Stat label="リスク（σ）" value={pct(result.optimal.risk)} tone="neutral" />
            <Stat label="シャープ比" value={result.optimal.sharpe.toFixed(3)} tone="accent" />
            <Stat label="最大下落率" value={pct(result.optimal.max_drawdown)} tone="neg" />
          </section>

          <ChartCard
            icon={<TrendingUp className="w-4 h-4 text-blue-500" aria-hidden />}
            title="効率的フロンティア"
            hint="最大シャープ比 ★ · SML 点線"
          >
            <EfficientFrontierChart
              scatter={result.scatter}
              optimal={result.optimal}
              benchmarksInfo={result.benchmarks_info}
            />
          </ChartCard>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              icon={<LineChartIcon className="w-4 h-4 text-blue-500" aria-hidden />}
              title="バックテスト"
              hint="最適配分で固定"
            >
              <BacktestChart backtest={result.backtest} />
            </ChartCard>
            <ChartCard
              icon={<PieChartIcon className="w-4 h-4 text-blue-500" aria-hidden />}
              title="配分比率"
              hint="最大シャープ比の配分"
            >
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
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Stat label="候補銘柄" value={`${universe.toLocaleString()}`} suffix="銘柄" tone="neutral" />
      <Stat
        label="SML通過"
        value={`${kept.toLocaleString()}`}
        suffix={`/ ${universe} · ${pct(passRate, 1)}`}
        tone="accent"
      />
      <Stat label="ベンチマーク平均リターン" value={pct(info.mean.return)} tone="pos" />
      <Stat label="ベンチマーク平均リスク" value={pct(info.mean.risk)} tone="neutral" />
      <Stat label="SML傾き" value={info.sml_slope.toFixed(3)} tone="neutral" />
    </section>
  );
}

function SelectedTickersChips({
  tickers,
  hedgeTickers,
}: {
  tickers: string[];
  hedgeTickers: string[];
}) {
  if (!tickers.length) return null;
  const hedgeSet = new Set(hedgeTickers);
  return (
    <section>
      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400 font-medium mb-2">
        選ばれた銘柄 ({tickers.length})
      </div>
      <div
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
        role="list"
        aria-label="選ばれた銘柄"
      >
        {tickers.map((t) => {
          const isHedge = hedgeSet.has(t);
          const cls = isHedge
            ? "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300"
            : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300";
          return (
            <span
              key={t}
              role="listitem"
              className={"num shrink-0 px-2.5 py-1 text-xs font-medium rounded-lg border " + cls}
              title={isHedge ? "ヘッジ資産" : "株式（SML通過）"}
            >
              {t}
            </span>
          );
        })}
      </div>
    </section>
  );
}

function SectionTitle({
  label,
  right,
  icon,
}: {
  label: string;
  right?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-900 dark:text-zinc-100">
        {icon}
        {label}
      </h2>
      {right && (
        <span className="num text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate ml-3">
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
  tone = "neutral",
}: {
  label: string;
  value: string;
  suffix?: string;
  tone?: Tone;
}) {
  const gradient: Record<Tone, string> = {
    pos: "from-emerald-50 to-emerald-100/40 dark:from-emerald-950/30 dark:to-emerald-900/10",
    neg: "from-rose-50 to-rose-100/40 dark:from-rose-950/30 dark:to-rose-900/10",
    accent: "from-blue-50 to-blue-100/40 dark:from-blue-950/30 dark:to-blue-900/10",
    neutral: "from-zinc-50 to-zinc-100/40 dark:from-zinc-900 dark:to-zinc-900/50",
  };
  const valueTone: Record<Tone, string> = {
    pos: "text-emerald-600 dark:text-emerald-400",
    neg: "text-rose-600 dark:text-rose-400",
    accent: "text-blue-600 dark:text-blue-400",
    neutral: "text-zinc-900 dark:text-zinc-100",
  };
  return (
    <div
      className={
        "bg-gradient-to-br " +
        gradient[tone] +
        " border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 px-4 py-5"
      }
    >
      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="flex items-baseline gap-2 mt-3">
        <span className={`num text-2xl md:text-3xl font-semibold ${valueTone[tone]}`}>
          {value}
        </span>
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
  icon,
  children,
}: {
  title: string;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <header className="flex items-baseline justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-900 dark:text-zinc-100">
          {icon}
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
