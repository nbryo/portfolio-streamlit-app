export type Period = "1mo" | "3mo" | "6mo" | "1y" | "2y" | "3y" | "4y" | "5y";

export type Preset = "sp500" | "nasdaq100" | "dow30" | "fang_plus" | "custom";

export interface PresetMeta {
  label: string;
  count: number;
}

export const PRESETS: Record<Preset, PresetMeta> = {
  sp500: { label: "S&P 500", count: 503 },
  nasdaq100: { label: "NASDAQ 100", count: 101 },
  dow30: { label: "ダウ30", count: 30 },
  fang_plus: { label: "FANG+", count: 10 },
  custom: { label: "カスタムのみ", count: 0 },
};

export const PRESET_ORDER: Preset[] = [
  "sp500",
  "nasdaq100",
  "dow30",
  "fang_plus",
  "custom",
];

export interface AnalyzeRequest {
  preset: Preset;
  custom_tickers: string[];
  period: Period;
  n_simulations: number;
  benchmarks: string[];
}

export interface ScatterData {
  risk: number[];
  return: number[];
  sharpe: number[];
}

export interface OptimalPortfolio {
  weights: Record<string, number>;
  return: number;
  risk: number;
  sharpe: number;
  max_drawdown: number;
}

export interface BacktestData {
  dates: string[];
  cumulative_returns: number[];
}

export interface BenchmarkStat {
  ticker: string;
  return: number;
  risk: number;
}

export interface BenchmarksInfo {
  individual: BenchmarkStat[];
  mean: { return: number; risk: number };
  sml_slope: number;
  requested: string[];
  missing: string[];
}

export interface AnalyzeResponse {
  scatter: ScatterData;
  optimal: OptimalPortfolio;
  filtered_tickers: string[];
  universe_size: number;
  filtered_count: number;
  benchmarks_info: BenchmarksInfo;
  backtest: BacktestData;
  metadata: {
    preset: Preset;
    n_simulations: number;
    period: Period;
    benchmarks_used: string[];
    elapsed_seconds: number;
  };
}
