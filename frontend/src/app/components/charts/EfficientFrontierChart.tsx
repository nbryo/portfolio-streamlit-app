"use client";

import PlotlyChart from "./PlotlyChart";
import type { ScatterData, OptimalPortfolio } from "@/lib/types";

interface Props {
  scatter: ScatterData;
  optimal: OptimalPortfolio;
}

export default function EfficientFrontierChart({ scatter, optimal }: Props) {
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
            colorbar: { title: { text: "Sharpe" } },
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
          marker: { size: 14, color: "#dc2626", symbol: "star", line: { width: 2, color: "#ffffff" } },
          name: "Max Sharpe",
          hovertemplate:
            "Optimal<br>Risk: %{x:.2%}<br>Return: %{y:.2%}<extra></extra>",
        },
      ]}
      layout={{
        title: { text: "Efficient Frontier" },
        xaxis: { title: { text: "Risk (Annualized Std Dev)" }, tickformat: ".0%" },
        yaxis: { title: { text: "Annualized Return" }, tickformat: ".0%" },
        autosize: true,
        margin: { l: 60, r: 30, t: 50, b: 50 },
        paper_bgcolor: "#ffffff",
        plot_bgcolor: "#ffffff",
        font: { family: "ui-sans-serif, system-ui, sans-serif", color: "#18181b" },
        showlegend: true,
        legend: { x: 0.01, y: 0.99 },
      }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: "100%", height: "420px" }}
      useResizeHandler
    />
  );
}
