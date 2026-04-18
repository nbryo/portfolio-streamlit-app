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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Tickers (comma-separated)</span>
        <input
          type="text"
          value={tickersInput}
          onChange={(e) => setTickersInput(e.target.value)}
          placeholder="AAPL, MSFT, NVDA"
          className="border border-zinc-300 rounded px-3 py-2 font-mono"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Period</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="border border-zinc-300 rounded px-3 py-2"
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Simulations</span>
          <input
            type="number"
            min={100}
            max={50000}
            step={100}
            value={nSimulations}
            onChange={(e) => setNSimulations(Number(e.target.value))}
            className="border border-zinc-300 rounded px-3 py-2 font-mono"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Market benchmark</span>
          <input
            type="text"
            value={marketBench}
            onChange={(e) => setMarketBench(e.target.value)}
            className="border border-zinc-300 rounded px-3 py-2 font-mono"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Growth benchmark</span>
          <input
            type="text"
            value={growthBench}
            onChange={(e) => setGrowthBench(e.target.value)}
            className="border border-zinc-300 rounded px-3 py-2 font-mono"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-700 hover:bg-blue-800 disabled:bg-zinc-400 text-white rounded px-4 py-2 font-medium"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {error && (
        <p className="text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
