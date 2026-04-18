"use client";

import { useState } from "react";
import AnalyzeForm from "./AnalyzeForm";
import EfficientFrontierChart from "./charts/EfficientFrontierChart";
import BacktestChart from "./charts/BacktestChart";
import WeightsPieChart from "./charts/WeightsPieChart";
import type { AnalyzeResponse } from "@/lib/types";

function pct(x: number): string {
  return `${(x * 100).toFixed(2)}%`;
}

export default function AnalyzePanel() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <AnalyzeForm onResult={setResult} />

      {result && (
        <div className="flex flex-col gap-6">
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Expected Return" value={pct(result.optimal.return)} />
            <Stat label="Risk" value={pct(result.optimal.risk)} />
            <Stat label="Sharpe" value={result.optimal.sharpe.toFixed(3)} />
            <Stat label="Max Drawdown" value={pct(result.optimal.max_drawdown)} />
          </section>

          <section className="bg-white rounded border border-zinc-200 p-4">
            <EfficientFrontierChart
              scatter={result.scatter}
              optimal={result.optimal}
            />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded border border-zinc-200 p-4">
              <BacktestChart backtest={result.backtest} />
            </div>
            <div className="bg-white rounded border border-zinc-200 p-4">
              <WeightsPieChart weights={result.optimal.weights} />
            </div>
          </section>

          <p className="text-xs text-zinc-500">
            Filtered tickers (above SML): {result.filtered_tickers.join(", ")} ·
            Period {result.metadata.period} · {result.metadata.n_simulations.toLocaleString()} sims
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded border border-zinc-200 p-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-xl font-mono text-zinc-900 mt-1">{value}</div>
    </div>
  );
}
