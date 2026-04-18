"use client";

import PlotlyChart from "./PlotlyChart";
import { useIsDark } from "@/lib/useIsDark";
import type { ScatterData, OptimalPortfolio } from "@/lib/types";

interface Props {
  scatter: ScatterData;
  optimal: OptimalPortfolio;
}

export default function EfficientFrontierChart({ scatter, optimal }: Props) {
  const dark = useIsDark();
  const text = dark ? "#e4e4e7" : "#18181b";
  const grid = dark ? "#27272a" : "#e4e4e7";
  const bg = dark ? "#111113" : "#ffffff";
  const axis = dark ? "#71717a" : "#52525b";

  return (
    <PlotlyChart
      data={[
        {
          type: "scattergl",
          mode: "markers",
          x: scatter.risk,
          y: scatter.return,
          marker: {
            size: 5,
            color: scatter.sharpe,
            colorscale: "Viridis",
            colorbar: {
              title: { text: "Sharpe", font: { color: text } },
              tickfont: { color: text },
              outlinecolor: grid,
              bgcolor: bg,
            },
            opacity: 0.75,
          },
          name: "Portfolios",
          hovertemplate:
            "Risk: %{x:.2%}<br>Return: %{y:.2%}<br>Sharpe: %{marker.color:.3f}<extra></extra>",
        },
        {
          type: "scatter",
          mode: "markers",
          x: [optimal.risk],
          y: [optimal.return],
          marker: {
            size: 16,
            color: "#dc2626",
            symbol: "star",
            line: { width: 2, color: bg },
          },
          name: "Max Sharpe",
          hovertemplate:
            "Optimal<br>Risk: %{x:.2%}<br>Return: %{y:.2%}<extra></extra>",
        },
      ]}
      layout={{
        xaxis: {
          title: { text: "Risk (σ, annualized)", font: { color: axis, size: 11 } },
          tickformat: ".0%",
          gridcolor: grid,
          zerolinecolor: grid,
          tickfont: { color: axis, size: 10 },
          linecolor: grid,
        },
        yaxis: {
          title: { text: "Return (annualized)", font: { color: axis, size: 11 } },
          tickformat: ".0%",
          gridcolor: grid,
          zerolinecolor: grid,
          tickfont: { color: axis, size: 10 },
          linecolor: grid,
        },
        autosize: true,
        margin: { l: 70, r: 30, t: 20, b: 50 },
        paper_bgcolor: bg,
        plot_bgcolor: bg,
        font: { family: "ui-sans-serif, system-ui, sans-serif", color: text },
        showlegend: true,
        legend: {
          x: 0.01,
          y: 0.99,
          bgcolor: "rgba(0,0,0,0)",
          font: { color: text, size: 11 },
        },
      }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: "100%", height: "420px" }}
      useResizeHandler
    />
  );
}
