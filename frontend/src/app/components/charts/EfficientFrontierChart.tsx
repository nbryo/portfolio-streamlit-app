"use client";

import type { PlotMouseEvent } from "plotly.js";
import PlotlyChart from "./PlotlyChart";
import { useIsDark } from "@/lib/useIsDark";
import type {
  ScatterData,
  OptimalPortfolio,
  BenchmarksInfo,
} from "@/lib/types";

interface Props {
  scatter: ScatterData;
  optimal: OptimalPortfolio;
  benchmarksInfo: BenchmarksInfo;
  selectedIdx: number | null;
  onSelect?: (idx: number) => void;
}

export default function EfficientFrontierChart({
  scatter,
  optimal,
  benchmarksInfo,
  selectedIdx,
  onSelect,
}: Props) {
  const dark = useIsDark();
  const text = dark ? "#e4e4e7" : "#18181b";
  const grid = dark ? "#27272a" : "#e4e4e7";
  const bg = dark ? "#18181b" : "#ffffff";
  const axis = dark ? "#a1a1aa" : "#52525b";
  const smlColor = dark ? "#f59e0b" : "#dc2626";
  const meanColor = dark ? "#60a5fa" : "#1d4ed8";

  const benchRisks = benchmarksInfo.individual.map((b) => b.risk);
  const benchReturns = benchmarksInfo.individual.map((b) => b.return);

  const maxRisk = Math.max(
    ...scatter.risk,
    ...benchRisks,
    benchmarksInfo.mean.risk,
    optimal.risk,
  );
  const lineRight = maxRisk * 1.05;

  const traces: Partial<Plotly.Data>[] = [
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
          title: { text: "シャープ比", font: { color: text } },
          tickfont: { color: text },
          outlinecolor: grid,
          bgcolor: bg,
        },
        opacity: 0.75,
      },
      name: "ポートフォリオ候補",
      hovertemplate:
        "リスク: %{x:.2%}<br>リターン: %{y:.2%}<br>シャープ比: %{marker.color:.3f}<extra></extra>",
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
      name: "最大シャープ比",
      hoverinfo: "skip",
    },
    {
      type: "scatter",
      mode: "lines",
      x: [0, lineRight],
      y: [0, benchmarksInfo.sml_slope * lineRight],
      line: { color: smlColor, width: 2, dash: "dash" },
      name: "SML",
      hoverinfo: "skip",
    },
    {
      type: "scatter",
      mode: "markers",
      x: benchRisks,
      y: benchReturns,
      text: benchmarksInfo.individual.map((b) => b.ticker),
      marker: {
        size: 12,
        color: "#71717a",
        symbol: "diamond",
        line: { width: 1, color: bg },
      },
      name: "ベンチマーク",
      hovertemplate:
        "%{text}<br>リスク: %{x:.2%}<br>リターン: %{y:.2%}<extra></extra>",
    },
    {
      type: "scatter",
      mode: "markers",
      x: [benchmarksInfo.mean.risk],
      y: [benchmarksInfo.mean.return],
      marker: {
        size: 14,
        color: meanColor,
        symbol: "triangle-up",
        line: { width: 2, color: bg },
      },
      name: "ベンチマーク平均",
      hoverinfo: "skip",
    },
  ];

  if (selectedIdx !== null && selectedIdx >= 0 && selectedIdx < scatter.risk.length) {
    traces.push({
      type: "scatter",
      mode: "markers",
      x: [scatter.risk[selectedIdx]],
      y: [scatter.return[selectedIdx]],
      marker: {
        size: 16,
        color: "#fbbf24",
        symbol: "diamond",
        line: { width: 2, color: bg },
      },
      name: "選択中",
      hoverinfo: "skip",
    });
  }

  function handleClick(e: Readonly<PlotMouseEvent>) {
    if (!onSelect) return;
    const pt = e.points?.[0];
    if (!pt) return;
    if (pt.curveNumber !== 0) return;
    if (typeof pt.pointNumber !== "number") return;
    onSelect(pt.pointNumber);
  }

  return (
    <div className="h-[360px] md:h-[460px] w-full cursor-pointer">
      <PlotlyChart
        data={traces as Plotly.Data[]}
        layout={{
          xaxis: {
            title: { text: "リスク（年率）", font: { color: axis, size: 11 } },
            tickformat: ".0%",
            gridcolor: grid,
            zerolinecolor: grid,
            tickfont: { color: axis, size: 10 },
            linecolor: grid,
            rangemode: "tozero",
          },
          yaxis: {
            title: { text: "リターン（年率）", font: { color: axis, size: 11 } },
            tickformat: ".0%",
            gridcolor: grid,
            zerolinecolor: grid,
            tickfont: { color: axis, size: 10 },
            linecolor: grid,
            rangemode: "tozero",
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
            bgcolor: dark ? "rgba(24,24,27,0.8)" : "rgba(255,255,255,0.8)",
            bordercolor: grid,
            borderwidth: 1,
            font: { color: text, size: 11 },
          },
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler
        onClick={handleClick}
      />
    </div>
  );
}
