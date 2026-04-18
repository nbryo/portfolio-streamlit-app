import type {
  AnalyzeRequest,
  AnalyzeResponse,
  BacktestForRequest,
  BacktestForResponse,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:8000");

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) detail = String(data.detail);
    } catch {}
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

export function analyzePortfolio(
  request: AnalyzeRequest,
): Promise<AnalyzeResponse> {
  return postJson<AnalyzeResponse>("/api/analyze", request);
}

export function backtestFor(
  request: BacktestForRequest,
): Promise<BacktestForResponse> {
  return postJson<BacktestForResponse>("/api/backtest_for", request);
}
