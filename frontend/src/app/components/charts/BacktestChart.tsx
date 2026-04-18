"use client";

import PlotlyChart from "./PlotlyChart";
import type { BacktestData } from "@/lib/types";

interface Props {
  backtest: BacktestData;
}

export default function BacktestChart({ backtest }: Props) {
  return (
    <PlotlyChart
      data={[
        {
          type: "scatter",
          mode: "lines",
          x: backtest.dates,
          y: backtest.cumulative_returns,
          line: { color: "#1e40af", width: 2 },
          fill: "tozeroy",
          fillcolor: "rgba(59, 130, 246, 0.08)",
          name: "Optimal Portfolio",
          hovertemplate: "%{x}<br>Cumulative: %{y:.3f}<extra></extra>",
        },
      ]}
      layout={{
        title: { text: "Backtest — Cumulative Return (fixed optimal weights)" },
        xaxis: { title: { text: "Date" }, type: "date" },
        yaxis: { title: { text: "Cumulative Return" } },
        autosize: true,
        margin: { l: 60, r: 30, t: 50, b: 50 },
        paper_bgcolor: "#ffffff",
        plot_bgcolor: "#ffffff",
        font: { family: "ui-sans-serif, system-ui, sans-serif", color: "#18181b" },
        showlegend: false,
      }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: "100%", height: "360px" }}
      useResizeHandler
    />
  );
}
