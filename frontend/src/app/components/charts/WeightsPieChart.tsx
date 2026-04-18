"use client";

import PlotlyChart from "./PlotlyChart";
import { useIsDark } from "@/lib/useIsDark";

interface Props {
  weights: Record<string, number>;
}

const PALETTE_LIGHT = [
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

const PALETTE_DARK = [
  "#60a5fa",
  "#3b82f6",
  "#93c5fd",
  "#bfdbfe",
  "#2563eb",
  "#1d4ed8",
  "#38bdf8",
  "#0ea5e9",
  "#7dd3fc",
  "#1e40af",
];

export default function WeightsPieChart({ weights }: Props) {
  const dark = useIsDark();
  const text = dark ? "#e4e4e7" : "#18181b";
  const bg = dark ? "#111113" : "#ffffff";
  const palette = dark ? PALETTE_DARK : PALETTE_LIGHT;

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
          hole: 0.5,
          marker: {
            colors: palette.slice(0, labels.length),
            line: { color: bg, width: 2 },
          },
          textinfo: "label+percent",
          textfont: { size: 12, color: text },
          hovertemplate: "%{label}<br>Weight: %{percent}<extra></extra>",
          sort: false,
        },
      ]}
      layout={{
        autosize: true,
        margin: { l: 10, r: 10, t: 20, b: 10 },
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
