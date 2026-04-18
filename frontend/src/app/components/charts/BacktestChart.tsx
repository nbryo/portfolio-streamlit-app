"use client";

import PlotlyChart from "./PlotlyChart";
import { useIsDark } from "@/lib/useIsDark";
import type { BacktestData } from "@/lib/types";

interface Props {
  backtest: BacktestData;
  loading?: boolean;
}

export default function BacktestChart({ backtest, loading }: Props) {
  const dark = useIsDark();
  const text = dark ? "#e4e4e7" : "#18181b";
  const grid = dark ? "#27272a" : "#e4e4e7";
  const bg = dark ? "#18181b" : "#ffffff";
  const axis = dark ? "#a1a1aa" : "#52525b";
  const line = dark ? "#60a5fa" : "#1d4ed8";
  const fill = dark ? "rgba(96,165,250,0.12)" : "rgba(37,99,235,0.08)";

  return (
    <div className="relative h-[280px] md:h-[340px] w-full">
      <PlotlyChart
        data={[
          {
            type: "scatter",
            mode: "lines",
            x: backtest.dates,
            y: backtest.cumulative_returns,
            line: { color: line, width: 2 },
            fill: "tozeroy",
            fillcolor: fill,
            name: "最適ポートフォリオ",
            hovertemplate: "%{x}<br>累積: %{y:.3f}<extra></extra>",
          },
        ]}
        layout={{
          xaxis: {
            type: "date",
            title: { text: "日付", font: { color: axis, size: 11 } },
            gridcolor: grid,
            tickfont: { color: axis, size: 10 },
            linecolor: grid,
          },
          yaxis: {
            title: { text: "累積リターン", font: { color: axis, size: 11 } },
            gridcolor: grid,
            zerolinecolor: grid,
            tickfont: { color: axis, size: 10 },
            linecolor: grid,
          },
          autosize: true,
          margin: { l: 60, r: 20, t: 20, b: 45 },
          paper_bgcolor: bg,
          plot_bgcolor: bg,
          font: { family: "ui-sans-serif, system-ui, sans-serif", color: text },
          showlegend: false,
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-zinc-900/60 backdrop-blur-[1px] rounded-b-xl">
          <span className="text-xs text-zinc-600 dark:text-zinc-300">再計算中...</span>
        </div>
      )}
    </div>
  );
}
