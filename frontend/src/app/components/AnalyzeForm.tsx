"use client";

import { useState } from "react";
import { analyzePortfolio } from "@/lib/api";
import type { AnalyzeRequest, AnalyzeResponse, Period } from "@/lib/types";

const PERIOD_OPTIONS: Period[] = ["1mo", "3mo", "6mo", "1y", "2y", "3y", "4y", "5y"];

interface Props {
  onResult?: (data: AnalyzeResponse) => void;
}

export default function AnalyzeForm({ onResult }: Props) {
  const [tickersInput, setTickersInput] = useState("AAPL, MSFT, NVDA, GOOGL, AMZN");
  const [period, setPeriod] = useState<Period>("5y");
  const [nSimulations, setNSimulations] = useState(10000);
  const [marketBench, setMarketBench] = useState("SPY");
  const [growthBench, setGrowthBench] = useState("^NYFANG");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const tickers = tickersInput
      .split(",")
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);

    const req: AnalyzeRequest = {
      tickers,
      period,
      n_simulations: nSimulations,
      benchmarks: { market: marketBench, growth: growthBench },
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
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6 md:p-8 flex flex-col gap-6"
    >
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-900 dark:text-zinc-100">
          Configuration
        </h2>
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
          Inputs
        </span>
      </div>

      <Field label="Tickers">
        <input
          type="text"
          value={tickersInput}
          onChange={(e) => setTickersInput(e.target.value)}
          placeholder="AAPL, MSFT, NVDA"
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

        <Field label="Market Benchmark">
          <input
            type="text"
            value={marketBench}
            onChange={(e) => setMarketBench(e.target.value)}
            className="num w-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </Field>

        <Field label="Growth Benchmark">
          <input
            type="text"
            value={growthBench}
            onChange={(e) => setGrowthBench(e.target.value)}
            className="num w-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </Field>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          Output rendered below.
        </p>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 disabled:bg-zinc-400 dark:disabled:bg-zinc-700 text-white rounded px-6 py-2 text-sm font-medium uppercase tracking-wider transition-colors"
        >
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400 font-medium">
        {label}
      </span>
      {children}
    </label>
  );
}
