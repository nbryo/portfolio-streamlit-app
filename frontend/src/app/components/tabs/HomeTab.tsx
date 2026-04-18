"use client";

import AnalyzeForm from "../AnalyzeForm";
import type { AnalyzeResponse } from "@/lib/types";

interface Props {
  onResult: (data: AnalyzeResponse) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function HomeTab({ onResult, loading, setLoading }: Props) {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        <section>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">株式分析</p>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            ポートフォリオ最適化
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 max-w-2xl leading-relaxed">
            銘柄ユニバースとベンチマークを設定してください。証券市場線（SML）でフィルタし、モンテカルロ法でポートフォリオ配分を最適化、最大シャープ比の配分で過去バックテストを行います。
          </p>
        </section>
        <AnalyzeForm
          onResult={onResult}
          loading={loading}
          setLoading={setLoading}
        />
      </div>
    </div>
  );
}
