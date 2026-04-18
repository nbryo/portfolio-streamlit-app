"use client";

import { BarChart3, Home } from "lucide-react";
import ResultView from "./ResultView";
import type { AnalyzeResponse } from "@/lib/types";

interface Props {
  result: AnalyzeResponse | null;
  loading: boolean;
  onGoHome: () => void;
}

export default function ResultTab({ result, loading, onGoHome }: Props) {
  if (result) {
    return (
      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <ResultView result={result} />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 md:py-12 min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="max-w-6xl mx-auto w-full">
        <EmptyState loading={loading} onGoHome={onGoHome} />
      </div>
    </div>
  );
}

function EmptyState({
  loading,
  onGoHome,
}: {
  loading: boolean;
  onGoHome: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-5">
        <BarChart3 className="w-8 h-8 text-zinc-700 dark:text-zinc-300" aria-hidden />
      </div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {loading ? "計算しています..." : "まだ結果がありません"}
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-sm leading-relaxed">
        {loading
          ? "ホームの分析が完了するとここに表示されます。"
          : "ホームタブで条件を設定し、「分析を実行」を押すとここに結果が出ます。"}
      </p>
      {!loading && (
        <button
          type="button"
          onClick={onGoHome}
          className="mt-6 inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 rounded-lg px-6 py-2.5 text-sm font-medium shadow-sm transition-colors"
        >
          <Home className="w-4 h-4" aria-hidden />
          ホームへ
        </button>
      )}
    </div>
  );
}
