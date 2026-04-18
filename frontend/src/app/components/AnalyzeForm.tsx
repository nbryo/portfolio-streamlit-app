"use client";

import { useMemo, useState } from "react";
import { BarChart3, Play, Settings, Shield } from "lucide-react";
import { analyzePortfolio } from "@/lib/api";
import {
  HEDGE_ASSETS,
  PERIOD_LABELS,
  PRESETS,
  PRESET_ORDER,
  type AnalyzeRequest,
  type AnalyzeResponse,
  type HedgeAssetKey,
  type Period,
  type Preset,
} from "@/lib/types";

const PERIOD_OPTIONS: Period[] = ["1mo", "3mo", "6mo", "1y", "2y", "3y", "4y", "5y"];
const HEAVY_PRESETS: Preset[] = ["sp500", "nasdaq100"];

interface Props {
  onResult: (data: AnalyzeResponse) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function AnalyzeForm({ onResult, loading, setLoading }: Props) {
  const [preset, setPreset] = useState<Preset>("fang_plus");
  const [customInput, setCustomInput] = useState("");
  const [hedgeAssets, setHedgeAssets] = useState<HedgeAssetKey[]>([]);
  const [period, setPeriod] = useState<Period>("5y");
  const [nSimulations, setNSimulations] = useState(10000);
  const [bench1, setBench1] = useState("SPY");
  const [bench2, setBench2] = useState("QQQ");
  const [bench3, setBench3] = useState("^NYFANG");

  const [error, setError] = useState<string | null>(null);

  const customTickers = useMemo(
    () =>
      customInput
        .split(",")
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean),
    [customInput],
  );

  const presetMeta = PRESETS[preset];
  const isCustomOnly = preset === "custom";
  const isHeavy = HEAVY_PRESETS.includes(preset);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isCustomOnly && customTickers.length === 0) {
      setError("「カスタムのみ」選択時は銘柄を1つ以上入力してください。");
      return;
    }

    const benchmarks = [bench1, bench2, bench3]
      .map((b) => b.trim())
      .filter(Boolean);
    if (benchmarks.length !== 3) {
      setError("ベンチマークは3つ指定してください。");
      return;
    }

    setLoading(true);

    const req: AnalyzeRequest = {
      preset,
      custom_tickers: customTickers,
      hedge_assets: hedgeAssets,
      period,
      n_simulations: nSimulations,
      benchmarks,
    };

    try {
      const data = await analyzePortfolio(req);
      onResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6 md:p-8 flex flex-col gap-8"
    >
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <Settings className="w-4 h-4 text-zinc-500 dark:text-zinc-400" aria-hidden />
          設定
        </h2>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">入力</span>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            銘柄ユニバース
          </span>
          <span className="num text-xs text-zinc-600 dark:text-zinc-400">
            現在の選択:{" "}
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
              {presetMeta.label}
            </span>
            {!isCustomOnly && (
              <span className="text-zinc-500 dark:text-zinc-400">
                {" "}
                ({presetMeta.count}銘柄)
              </span>
            )}
          </span>
        </div>
        <div className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-2 -mx-1 px-1 pb-1">
          {PRESET_ORDER.map((p) => {
            const meta = PRESETS[p];
            const active = p === preset;
            const countLabel = meta.count > 0 ? ` (${meta.count})` : "";
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPreset(p)}
                aria-pressed={active}
                className={
                  "shrink-0 min-w-[108px] px-3.5 py-2 text-sm rounded-lg border transition-colors duration-150 " +
                  (active
                    ? "bg-blue-700 border-blue-700 text-white font-medium dark:bg-blue-600 dark:border-blue-600"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-blue-700")
                }
              >
                {meta.label}
                <span className="num">{countLabel}</span>
              </button>
            );
          })}
        </div>
      </section>

      <Field
        label={isCustomOnly ? "銘柄（必須）" : "追加銘柄（カスタム、任意）"}
        hint={
          isCustomOnly
            ? "カンマ区切りでティッカーを入力（例: AAPL, MSFT, NVDA）"
            : "プリセットに追加して分析したい銘柄をカンマ区切りで入力"
        }
      >
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder={isCustomOnly ? "AAPL, MSFT, NVDA" : "例: TLT, GLD"}
          className="num w-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="期間">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="num w-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {PERIOD_LABELS[p]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="シミュレーション回数">
          <input
            type="number"
            min={100}
            max={50000}
            step={100}
            value={nSimulations}
            onChange={(e) => setNSimulations(Number(e.target.value))}
            className="num w-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
          />
        </Field>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <Shield className="w-4 h-4 text-zinc-500 dark:text-zinc-400" aria-hidden />
            ヘッジ資産（任意）
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            SMLフィルタ対象外 — 分散効果のため無条件で組み込まれます
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {HEDGE_ASSETS.map((h) => {
            const checked = hedgeAssets.includes(h.key);
            return (
              <HedgeCheckbox
                key={h.key}
                checked={checked}
                label={h.label}
                ticker={h.ticker}
                onToggle={() =>
                  setHedgeAssets((prev) =>
                    prev.includes(h.key)
                      ? prev.filter((k) => k !== h.key)
                      : [...prev, h.key],
                  )
                }
              />
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <BarChart3 className="w-4 h-4 text-zinc-500 dark:text-zinc-400" aria-hidden />
            ベンチマーク（3指数）
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            3指数の平均で SML を引きます
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="ベンチマーク 1">
            <BenchmarkInput value={bench1} onChange={setBench1} />
          </Field>
          <Field label="ベンチマーク 2">
            <BenchmarkInput value={bench2} onChange={setBench2} />
          </Field>
          <Field label="ベンチマーク 3">
            <BenchmarkInput value={bench3} onChange={setBench3} />
          </Field>
        </div>
      </section>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {loading
            ? "計算しています..."
            : isHeavy
              ? `${presetMeta.label}（${presetMeta.count}銘柄）は計算に30秒ほどかかります。`
              : "下に結果が表示されます。"}
        </p>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-zinc-300 disabled:to-zinc-400 dark:disabled:from-zinc-700 dark:disabled:to-zinc-800 text-white rounded-lg px-8 py-3 text-sm font-medium shadow-sm shadow-blue-600/10 transition-colors duration-150"
        >
          {loading ? <Spinner /> : <Play className="w-4 h-4" aria-hidden />}
          {loading ? "分析中..." : "分析を実行"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 px-3 py-2 rounded-lg text-sm"
        >
          {error}
        </div>
      )}
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
          {hint}
        </span>
      )}
    </label>
  );
}

function HedgeCheckbox({
  checked,
  label,
  ticker,
  onToggle,
}: {
  checked: boolean;
  label: string;
  ticker: string;
  onToggle: () => void;
}) {
  return (
    <label
      className={
        "flex items-center gap-3 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors select-none " +
        (checked
          ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100"
          : "border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-700 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-blue-700")
      }
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="sr-only"
      />
      <span
        aria-hidden
        className={
          "flex items-center justify-center h-4 w-4 rounded border shrink-0 transition-colors " +
          (checked
            ? "bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500"
            : "bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-600")
        }
      >
        {checked && (
          <svg
            viewBox="0 0 16 16"
            className="h-3 w-3 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 8.5 7 12 13 4.5" />
          </svg>
        )}
      </span>
      <span className="flex-1">{label}</span>
      <span className="num text-xs text-zinc-500 dark:text-zinc-400">
        {ticker}
      </span>
    </label>
  );
}

function BenchmarkInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="num w-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
    />
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
