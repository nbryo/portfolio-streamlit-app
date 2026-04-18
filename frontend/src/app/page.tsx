import AnalyzePanel from "./components/AnalyzePanel";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Portfolio Analysis
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Efficient frontier, SML filtering, and Monte Carlo backtest.
          </p>
        </header>
        <AnalyzePanel />
      </div>
    </main>
  );
}
