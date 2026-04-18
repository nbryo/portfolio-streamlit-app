"use client";

import { useMemo, useState } from "react";
import { analyzePortfolio } from "@/lib/api";
import {
  PRESETS,
  PRESET_ORDER,
  type AnalyzeRequest,
  type AnalyzeResponse,
  type Period,
  type Preset,
} from "@/lib/types";

const PERIOD_OPTIONS: Period[] = ["1mo", "3mo", "6mo", "1y", "2y", "3y", "4y", "5y"];
const HEAVY_PRESETS: Preset[] = ["sp500", "nasdaq100"];

interface Props {
  onResult?: (data: AnalyzeResponse) => void;
}

export default function AnalyzeForm({ onResult }: Props) {
  const [preset, setPreset] = useState<Preset>("fang_plus");
  const [customInput, setCustomInput] = useState("");
  const [period, setPeriod] = useState<Period>("5y");
  const [nSimulations, setNSimulations] = useState(10000);
  const [bench1, setBench1] = useState("SPY");
  const [bench2, setBench2] = useState("QQQ");
  const [bench3, setBench3] = useState("^NYFANG");

  const [loading, setLoading] = useState(false);
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
      setError("カスタムのみを選んだ場合は、銘柄を1つ以上入力してください。");
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
      period,
      n_simulations: nSimulations,
      benchmarks,
    };

    try {
      const data = await analyzePortfolio(req);
      console.log("Analyze response:", data);
      onResult?.(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Analyze failed:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6 md:p-8 flex flex-col gap-7"
    >
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-900 dark:text-zinc-100">
          Configuration
        </h2>
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
          Inputs
        </span>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400 font-medium">
            銘柄ユニバース
          </span>
          <span className="num text-[11px] text-zinc-600 dark:text-zinc-400">
            現在の選択:{" "}
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
              {presetMeta.label}
            </span>
            {!isCustomOnly && (
              <>
                {" "}
                <span className="text-zinc-500 dark:text-zinc-400">
                  ({presetMeta.count}銘柄)
                </span>
              </>
            )}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
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
                  "px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded border transition-colors " +
                  (active
                    ? "bg-blue-700 border-blue-700 text-white hover:bg-blue-800 dark:bg-blue-600 dark:border-blue-600 dark:hover:bg-blue-500"
                    : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500")
                }
              >
                {meta.label}
                {countLabel}
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
          className="num w-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Period">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="num w-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Simulations">
          <input
            type="number"
            min={100}
            max={50000}
            step={100}
            value={nSimulations}
            onChange={(e) => setNSimulations(Number(e.target.value))}
            className="num w-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </Field>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400 font-medium">
            ベンチマーク（3指数）
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-500">
            3指数のリスク/リターン平均で SML を引きます
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

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {loading
            ? isHeavy
              ? `分析中... ${presetMeta.label} は最大30秒程度かかります。`
              : "分析中..."
            : isHeavy
              ? `${presetMeta.label} は${presetMeta.count}銘柄を処理するため、最大30秒ほどかかります。`
              : "実行すると結果が下に表示されます。"}
        </p>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:bg-zinc-400 dark:disabled:bg-zinc-700 text-white rounded px-6 py-2 text-sm font-medium uppercase tracking-wider transition-colors"
        >
          {loading && <Spinner />}
          {loading ? "Running…" : "Run Analysis"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 px-3 py-2 rounded text-sm"
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
      <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400 font-medium">
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-snug">
          {hint}
        </span>
      )}
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
      className="num w-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
