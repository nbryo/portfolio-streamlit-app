"use client";

import PlotlyChart from "./PlotlyChart";
import { useIsDark } from "@/lib/useIsDark";
import type { BacktestData } from "@/lib/types";

interface Props {
  backtest: BacktestData;
}

export default function BacktestChart({ backtest }: Props) {
  const dark = useIsDark();
  const text = dark ? "#e4e4e7" : "#18181b";
  const grid = dark ? "#27272a" : "#e4e4e7";
  const bg = dark ? "#111113" : "#ffffff";
  const axis = dark ? "#71717a" : "#52525b";
  const line = dark ? "#60a5fa" : "#1e40af";
  const fill = dark ? "rgba(96,165,250,0.12)" : "rgba(59,130,246,0.08)";

  return (
    <div className="h-[280px] md:h-[340px] w-full">
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
    </div>
  );
}
