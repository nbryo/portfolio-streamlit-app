"use client";

import PlotlyChart from "./PlotlyChart";
import { useIsDark } from "@/lib/useIsDark";
import { useIsMobile } from "@/lib/useIsMobile";

interface Props {
  weights: Record<string, number>;
}

// Slices smaller than this (in weight, not percent) get no inside label.
const LABEL_THRESHOLD = 0.03;

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
  const mobile = useIsMobile();
  const text = dark ? "#e4e4e7" : "#18181b";
  const bg = dark ? "#18181b" : "#ffffff";
  const palette = dark ? PALETTE_DARK : PALETTE_LIGHT;

  const entries = Object.entries(weights)
    .filter(([, w]) => w > 0)
    .sort((a, b) => b[1] - a[1]);
  const labels = entries.map(([t]) => t);
  const values = entries.map(([, w]) => w);
  const colors = labels.map((_, i) => palette[i % palette.length]);
  const insideText = entries.map(([t, w]) =>
    w >= LABEL_THRESHOLD ? `${t}<br>${(w * 100).toFixed(1)}%` : "",
  );

  return (
    <div className="h-[320px] md:h-[400px] w-full">
      <PlotlyChart
        data={[
          {
            type: "pie",
            labels,
            values,
            text: insideText,
            textinfo: "text",
            textposition: "inside",
            insidetextorientation: "horizontal",
            textfont: { size: 11, color: "#ffffff" },
            hole: 0.5,
            sort: false,
            direction: "clockwise",
            rotation: 0,
            marker: {
              colors,
              line: { color: bg, width: 2 },
            },
            hovertemplate: "%{label}<br>比率: %{percent}<extra></extra>",
          } as Plotly.Data,
        ]}
        layout={{
          autosize: true,
          margin: mobile
            ? { l: 10, r: 10, t: 20, b: 100 }
            : { l: 20, r: 140, t: 20, b: 20 },
          paper_bgcolor: bg,
          plot_bgcolor: bg,
          font: { family: "ui-sans-serif, system-ui, sans-serif", color: text },
          showlegend: true,
          legend: mobile
            ? {
                orientation: "h",
                x: 0.5,
                y: -0.05,
                xanchor: "center",
                yanchor: "top",
                bgcolor: "rgba(0,0,0,0)",
                font: { color: text, size: 10 },
              }
            : {
                orientation: "v",
                x: 1.02,
                y: 0.5,
                xanchor: "left",
                yanchor: "middle",
                bgcolor: "rgba(0,0,0,0)",
                font: { color: text, size: 10 },
              },
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler
      />
    </div>
  );
}
