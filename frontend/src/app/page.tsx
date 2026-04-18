import AnalyzePanel from "./components/AnalyzePanel";
import Header from "./components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          <section>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400 mb-2">
              Equity Analysis
            </p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              Portfolio Optimizer
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-2xl">
              Configure a universe of tickers and benchmarks. The server filters
              via the Security Market Line, runs a Monte Carlo over portfolio
              weights, and returns the max-Sharpe allocation with a fixed-weight
              backtest.
            </p>
          </section>
          <AnalyzePanel />
        </div>
      </main>
    </>
  );
}
