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

export type HedgeAssetKey =
  | "gold"
  | "silver"
  | "crypto"
  | "bonds_long"
  | "bonds_mid"
  | "reit"
  | "commodity";

export interface HedgeAssetMeta {
  key: HedgeAssetKey;
  ticker: string;
  label: string;
}

export const HEDGE_ASSETS: HedgeAssetMeta[] = [
  { key: "gold", ticker: "GLD", label: "金" },
  { key: "silver", ticker: "SLV", label: "銀" },
  { key: "crypto", ticker: "IBIT", label: "暗号資産（BTC ETF）" },
  { key: "bonds_long", ticker: "TLT", label: "長期米国債" },
  { key: "bonds_mid", ticker: "IEF", label: "中期米国債" },
  { key: "reit", ticker: "VNQ", label: "米国REIT" },
  { key: "commodity", ticker: "DBC", label: "コモディティ総合" },
];

export interface AnalyzeRequest {
  preset: Preset;
  custom_tickers: string[];
  hedge_assets: HedgeAssetKey[];
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
  hedge_tickers: string[];
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
