"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Filter,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import EfficientFrontierChart from "../charts/EfficientFrontierChart";
import BacktestChart from "../charts/BacktestChart";
import WeightsPieChart from "../charts/WeightsPieChart";
import { backtestFor } from "@/lib/api";
import {
  PERIOD_LABELS,
  PRESETS,
  type AnalyzeResponse,
  type BacktestData,
} from "@/lib/types";

function pct(x: number, digits = 2): string {
  const sign = x > 0 ? "+" : "";
  return `${sign}${(x * 100).toFixed(digits)}%`;
}

type Tone = "pos" | "neg" | "accent" | "neutral";

export default function ResultView({ result }: { result: AnalyzeResponse }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [dynamicBacktest, setDynamicBacktest] = useState<BacktestData | null>(null);
  const [backtestLoading, setBacktestLoading] = useState(false);

  // Reset selection when result changes.
  useEffect(() => {
    setSelectedIdx(null);
    setDynamicBacktest(null);
    setBacktestLoading(false);
  }, [result]);

  useEffect(() => {
    if (selectedIdx === null) {
      setDynamicBacktest(null);
      setBacktestLoading(false);
      return;
    }
    const tickers = result.scatter.tickers;
    const weights = result.scatter.weights[selectedIdx];
    if (!tickers || !weights) return;

    let cancelled = false;
    setBacktestLoading(true);
    backtestFor({ tickers, weights, period: result.metadata.period })
      .then((d) => {
        if (cancelled) return;
        setDynamicBacktest(d);
      })
      .catch(() => {
        if (cancelled) return;
        setDynamicBacktest(null);
      })
      .finally(() => {
        if (cancelled) return;
        setBacktestLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [result, selectedIdx]);

  const displayed = useMemo(() => {
    if (selectedIdx === null) {
      return {
        ret: result.optimal.return,
        risk: result.optimal.risk,
        sharpe: result.optimal.sharpe,
        maxDrawdown: result.optimal.max_drawdown as number | null,
        weights: result.optimal.weights,
        backtest: dynamicBacktest ?? result.backtest,
      };
    }
    const w = result.scatter.weights[selectedIdx] ?? [];
    const weightsMap: Record<string, number> = {};
    result.scatter.tickers.forEach((t, i) => {
      const v = w[i] ?? 0;
      if (v > 0) weightsMap[t] = v;
    });
    return {
      ret: result.scatter.return[selectedIdx],
      risk: result.scatter.risk[selectedIdx],
      sharpe: result.scatter.sharpe[selectedIdx],
      maxDrawdown: null as number | null,
      weights: weightsMap,
      backtest: dynamicBacktest ?? result.backtest,
    };
  }, [result, selectedIdx, dynamicBacktest]);

  const isSelected = selectedIdx !== null;

  return (
    <div className="flex flex-col gap-10 animate-fadeIn">
      <SectionTitle
        icon={<Filter className="w-4 h-4 text-zinc-500 dark:text-zinc-400" aria-hidden />}
        label="銘柄選別"
        right={`${PRESETS[result.metadata.preset].label} · ${PERIOD_LABELS[result.metadata.period]} · ${result.metadata.n_simulations.toLocaleString()}回 · ${result.metadata.elapsed_seconds.toFixed(1)}秒`}
      />

      <SelectionStats result={result} />

      {result.hedge_tickers.length > 0 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 -mt-4">
          ヘッジ資産:{" "}
          <span className="num text-purple-700 dark:text-purple-300 font-medium">
            {result.hedge_tickers.join(" · ")}
          </span>
        </p>
      )}

      <SelectedTickersChips
        tickers={result.filtered_tickers}
        hedgeTickers={result.hedge_tickers}
      />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionTitleSimple
          icon={<PieChartIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" aria-hidden />}
          label={isSelected ? "選択したポートフォリオ" : "最適ポートフォリオ"}
        />
        {isSelected && (
          <button
            type="button"
            onClick={() => setSelectedIdx(null)}
            className="inline-flex items-center gap-1.5 text-sm text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden />
            最大シャープ比に戻す
          </button>
        )}
      </div>

      <section
        key={selectedIdx ?? -1}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 animate-fadeIn"
      >
        <Stat label="期待リターン" value={pct(displayed.ret)} tone="pos" />
        <Stat label="リスク（σ）" value={pct(displayed.risk)} tone="neutral" />
        <Stat label="シャープ比" value={displayed.sharpe.toFixed(3)} tone="accent" />
        <Stat
          label="最大下落率"
          value={displayed.maxDrawdown !== null ? pct(displayed.maxDrawdown) : "—"}
          tone={displayed.maxDrawdown !== null ? "neg" : "neutral"}
        />
      </section>

      <ChartCard
        icon={<TrendingUp className="w-4 h-4 text-zinc-500 dark:text-zinc-400" aria-hidden />}
        title="効率的フロンティア"
        hint="点をクリックするとその配分が下に表示されます"
      >
        <EfficientFrontierChart
          scatter={result.scatter}
          optimal={result.optimal}
          benchmarksInfo={result.benchmarks_info}
          selectedIdx={selectedIdx}
          onSelect={(idx) => setSelectedIdx(idx)}
        />
      </ChartCard>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          icon={<LineChartIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" aria-hidden />}
          title="バックテスト"
          hint={isSelected ? "選択中の配分で累積" : "最適配分で固定"}
        >
          <BacktestChart backtest={displayed.backtest} loading={backtestLoading} />
        </ChartCard>
        <ChartCard
          icon={<PieChartIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" aria-hidden />}
          title="配分比率"
          hint={isSelected ? "選択中の配分" : "最大シャープ比の配分"}
        >
          <div key={selectedIdx ?? -1} className="animate-fadeIn">
            <WeightsPieChart weights={displayed.weights} />
          </div>
        </ChartCard>
      </section>
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
      <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
        選ばれた銘柄 ({tickers.length})
      </div>
      <div
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1"
        role="list"
        aria-label="選ばれた銘柄"
      >
        {tickers.map((t) => {
          const isHedge = hedgeSet.has(t);
          const cls = isHedge
            ? "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300"
            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300";
          return (
            <span
              key={t}
              role="listitem"
              className={"num shrink-0 px-2.5 py-1 text-xs font-medium rounded-md border " + cls}
              title={isHedge ? "ヘッジ資産" : "株式(SML通過)"}
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
    <div className="flex items-baseline justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
      <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        {icon}
        {label}
      </h2>
      {right && (
        <span className="num text-xs text-zinc-500 dark:text-zinc-400 truncate">
          {right}
        </span>
      )}
    </div>
  );
}

function SectionTitleSimple({
  label,
  icon,
}: {
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
      {icon}
      {label}
    </h2>
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
  const borderAccent: Record<Tone, string> = {
    pos: "border-l-4 border-l-[#ffb703]",
    neg: "border-l-4 border-l-[#fb8500]",
    accent: "border-l-4 border-l-[#219ebc]",
    neutral: "border-l-4 border-l-[#6c757d]",
  };
  const valueTone: Record<Tone, string> = {
    pos: "text-emerald-600 dark:text-emerald-400",
    neg: "text-[#fb8500] dark:text-[#fb8500]",
    accent: "text-[#219ebc] dark:text-[#8ecae6]",
    neutral: "text-zinc-900 dark:text-zinc-100",
  };
  return (
    <div
      className={
        "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-5 " +
        borderAccent[tone]
      }
    >
      <div className="text-sm text-zinc-600 dark:text-zinc-400">{label}</div>
      <div className="flex items-baseline gap-2 mt-2">
        <span className={`num text-3xl font-bold tabular-nums ${valueTone[tone]}`}>
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
    <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
      <header className="flex items-baseline justify-between gap-3 px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {icon}
          {title}
        </h3>
        {hint && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400 text-right">
            {hint}
          </span>
        )}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
