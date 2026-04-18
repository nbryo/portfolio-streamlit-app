export type Period = "1mo" | "3mo" | "6mo" | "1y" | "2y" | "3y" | "4y" | "5y";

export interface Benchmarks {
  market: string;
  growth: string;
}

export interface AnalyzeRequest {
  tickers: string[];
  period: Period;
  n_simulations: number;
  benchmarks: Benchmarks;
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

export interface AnalyzeResponse {
  scatter: ScatterData;
  optimal: OptimalPortfolio;
  filtered_tickers: string[];
  backtest: BacktestData;
  metadata: {
    n_simulations: number;
    period: Period;
    benchmarks_used: Benchmarks;
  };
}
