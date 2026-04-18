"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart3, Play, Search, Shield, X } from "lucide-react";
import { analyzePortfolio, searchTicker } from "@/lib/api";
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
  type TickerMatch,
} from "@/lib/types";

const PERIOD_OPTIONS: Period[] = ["1mo", "3mo", "6mo", "1y", "2y", "3y", "4y", "5y"];
const HEAVY_PRESETS: Preset[] = ["sp500", "nasdaq100"];

const SIMULATION_OPTIONS: { value: number; label: string }[] = [
  { value: 1000, label: "1,000回（高速）" },
  { value: 5000, label: "5,000回（標準）" },
  { value: 10000, label: "10,000回（推奨）" },
  { value: 20000, label: "20,000回（高精度）" },
  { value: 50000, label: "50,000回（最高精度）" },
];

// Unified blue-accent palette. Each preset keeps its hue across states; only
// border + shadow change when selected.
const PRESET_PALETTE: Record<
  Preset,
  { base: string; selected: string }
> = {
  sp500: {
    base: "border-transparent bg-[#8ecae6] text-[#023047] hover:brightness-105 dark:bg-[#1e3a52] dark:text-[#8ecae6]",
    selected:
      "border-[#023047] bg-[#8ecae6] text-[#023047] shadow-lg dark:bg-[#1e3a52] dark:text-[#8ecae6] dark:border-[#8ecae6]",
  },
  nasdaq100: {
    base: "border-transparent bg-[#219ebc] text-white hover:brightness-110 dark:bg-[#023047] dark:text-[#8ecae6]",
    selected:
      "border-[#023047] bg-[#219ebc] text-white shadow-lg dark:bg-[#023047] dark:text-[#8ecae6] dark:border-[#8ecae6]",
  },
  dow30: {
    base: "border-transparent bg-[#cdeefb] text-[#023047] hover:brightness-[0.98] dark:bg-[#0d2438] dark:text-[#8ecae6]",
    selected:
      "border-[#023047] bg-[#cdeefb] text-[#023047] shadow-lg dark:bg-[#0d2438] dark:text-[#8ecae6] dark:border-[#8ecae6]",
  },
  fang_plus: {
    base: "border-transparent bg-[#ffb703] text-[#023047] hover:brightness-105 dark:bg-[#5a3e00] dark:text-[#ffb703]",
    selected:
      "border-[#023047] bg-[#ffb703] text-[#023047] shadow-lg dark:bg-[#5a3e00] dark:text-[#ffb703] dark:border-[#ffb703]",
  },
  custom: {
    base: "border-transparent bg-[#f1f3f5] text-[#495057] hover:bg-[#e9ecef] dark:bg-[#2a2d31] dark:text-[#e0e0e0]",
    selected:
      "border-[#023047] bg-[#f1f3f5] text-[#495057] shadow-lg dark:bg-[#2a2d31] dark:text-[#e0e0e0] dark:border-[#8ecae6]",
  },
};

interface Props {
  onResult: (data: AnalyzeResponse) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function AnalyzeForm({ onResult, loading, setLoading }: Props) {
  const [preset, setPreset] = useState<Preset>("fang_plus");
  const [customTickers, setCustomTickers] = useState<string[]>([]);
  const [hedgeAssets, setHedgeAssets] = useState<HedgeAssetKey[]>([]);
  const [period, setPeriod] = useState<Period>("5y");
  const [nSimulations, setNSimulations] = useState(10000);
  const [bench1, setBench1] = useState("SPY");
  const [bench2, setBench2] = useState("QQQ");
  const [bench3, setBench3] = useState("^NYFANG");

  const [error, setError] = useState<string | null>(null);

  const presetMeta = PRESETS[preset];
  const isCustomOnly = preset === "custom";
  const isHeavy = HEAVY_PRESETS.includes(preset);

  function addCustomTicker(t: string) {
    const up = t.trim().toUpperCase();
    if (!up) return;
    setCustomTickers((prev) => (prev.includes(up) ? prev : [...prev, up]));
  }

  function removeCustomTicker(t: string) {
    setCustomTickers((prev) => prev.filter((x) => x !== t));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isCustomOnly && customTickers.length === 0) {
      setError("「カスタムのみ」選択時は銘柄を1つ以上追加してください。");
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
      <section className="flex flex-col gap-3">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          銘柄ユニバース
        </span>
        <div className="flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-visible scrollbar-hide gap-2 -mx-1 px-1 pb-1">
          {PRESET_ORDER.map((p) => {
            const meta = PRESETS[p];
            const active = p === preset;
            const palette = PRESET_PALETTE[p];
            const countLabel = meta.count > 0 ? ` (${meta.count})` : "";
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPreset(p)}
                aria-pressed={active}
                className={
                  "shrink-0 min-w-[108px] px-3.5 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-150 " +
                  (active ? palette.selected : palette.base)
                }
              >
                {meta.label}
                <span className="num">{countLabel}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {isCustomOnly ? "銘柄（必須）" : "追加銘柄（任意）"}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            日本語・英語・ティッカーで検索
          </span>
        </div>
        <TickerSearchBar onPick={(t) => addCustomTicker(t)} />
        {customTickers.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {customTickers.map((t) => (
              <span
                key={t}
                className="num inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300"
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeCustomTicker(t)}
                  aria-label={`${t} を削除`}
                  className="text-blue-600/60 hover:text-blue-700 dark:text-blue-400/70 dark:hover:text-blue-300"
                >
                  <X className="w-3 h-3" aria-hidden />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

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
          <select
            value={nSimulations}
            onChange={(e) => setNSimulations(Number(e.target.value))}
            className="num w-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
          >
            {SIMULATION_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <Shield className="w-4 h-4 text-zinc-500 dark:text-zinc-400" aria-hidden />
            ヘッジ資産（任意）
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            SMLフィルタ対象外 — 無条件で組み込まれます
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
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-[#219ebc] to-[#023047] hover:brightness-110 disabled:bg-none disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-lg px-8 py-3 text-sm font-medium shadow-lg shadow-[#023047]/20 transition-all duration-150"
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

function TickerSearchBar({ onPick }: { onPick: (ticker: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TickerMatch[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    const t = setTimeout(() => {
      searchTicker(query, controller.signal)
        .then((r) => setResults(r.results))
        .catch(() => {
          /* ignore aborts + errors */
        })
        .finally(() => setSearching(false));
    }, 180);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function pick(m: TickerMatch) {
    onPick(m.ticker);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500"
          aria-hidden
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="アップル、AAPL、ゴールド…"
          className="w-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
        />
      </div>
      {open && query.trim().length > 0 && (
        <ul className="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {searching && results.length === 0 && (
            <li className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
              検索中...
            </li>
          )}
          {!searching && results.length === 0 && (
            <li className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
              該当する銘柄が見つかりません
            </li>
          )}
          {results.map((m) => (
            <li key={m.ticker}>
              <button
                type="button"
                onClick={() => pick(m)}
                className="w-full text-left px-3 py-2 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {m.japanese}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {m.english}
                  </div>
                </div>
                <span className="num text-xs font-semibold text-blue-700 dark:text-blue-400 shrink-0">
                  {m.ticker}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
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
      <span className="num text-xs text-zinc-500 dark:text-zinc-400">{ticker}</span>
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
