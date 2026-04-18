"use client";

import PlotlyChart from "./PlotlyChart";

interface Props {
  weights: Record<string, number>;
}

const PALETTE = [
  "#1e40af",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#1d4ed8",
  "#2563eb",
  "#0ea5e9",
  "#0369a1",
  "#0c4a6e",
  "#1e3a8a",
];

export default function WeightsPieChart({ weights }: Props) {
  const entries = Object.entries(weights).sort((a, b) => b[1] - a[1]);
  const labels = entries.map(([t]) => t);
  const values = entries.map(([, w]) => w);

  return (
    <PlotlyChart
      data={[
        {
          type: "pie",
          labels,
          values,
          hole: 0.4,
          marker: { colors: PALETTE.slice(0, labels.length), line: { color: "#ffffff", width: 2 } },
          textinfo: "label+percent",
          textfont: { size: 13 },
          hovertemplate: "%{label}<br>Weight: %{percent}<extra></extra>",
          sort: false,
        },
      ]}
      layout={{
        title: { text: "Optimal Allocation" },
        autosize: true,
        margin: { l: 10, r: 10, t: 50, b: 10 },
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
