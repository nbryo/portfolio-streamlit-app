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
          name: "Optimal Portfolio",
          hovertemplate: "%{x}<br>Cumulative: %{y:.3f}<extra></extra>",
        },
      ]}
      layout={{
        xaxis: {
          type: "date",
          gridcolor: grid,
          tickfont: { color: axis, size: 10 },
          linecolor: grid,
        },
        yaxis: {
          title: { text: "Cumulative Return", font: { color: axis, size: 11 } },
          gridcolor: grid,
          zerolinecolor: grid,
          tickfont: { color: axis, size: 10 },
          linecolor: grid,
        },
        autosize: true,
        margin: { l: 60, r: 20, t: 20, b: 40 },
        paper_bgcolor: bg,
        plot_bgcolor: bg,
        font: { family: "ui-sans-serif, system-ui, sans-serif", color: text },
        showlegend: false,
      }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: "100%", height: "340px" }}
      useResizeHandler
    />
  );
}
