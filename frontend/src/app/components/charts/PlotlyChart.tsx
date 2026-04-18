"use client";

import dynamic from "next/dynamic";
import type { PlotParams } from "react-plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full flex items-center justify-center text-sm text-zinc-500">
      Loading chart…
    </div>
  ),
});

export default function PlotlyChart(props: PlotParams) {
  return <Plot {...props} />;
}
