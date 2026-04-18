"use client";

import Link from "next/link";
import AnalyzeForm from "../AnalyzeForm";
import TypewriterTitle from "../TypewriterTitle";
import type { AnalyzeResponse } from "@/lib/types";

interface Props {
  onResult: (data: AnalyzeResponse) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function HomeTab({ onResult, loading, setLoading }: Props) {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 md:py-14">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        <section>
          <TypewriterTitle />
          <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 font-light mt-3 leading-relaxed">
            最適な配分を、数秒で。
          </p>
        </section>

        <AnalyzeForm
          onResult={onResult}
          loading={loading}
          setLoading={setLoading}
        />

        <p className="text-xs text-zinc-500 dark:text-zinc-500 text-center mt-4 leading-relaxed max-w-md mx-auto">
          本ツールは投資助言ではありません。分析結果は過去データに基づくもので、将来の投資成果を保証しません。
          <br className="hidden sm:inline" />
          <Link
            href="/terms"
            className="underline hover:text-zinc-700 dark:hover:text-zinc-300 mx-1"
          >
            利用規約
          </Link>
          ·
          <Link
            href="/privacy"
            className="underline hover:text-zinc-700 dark:hover:text-zinc-300 mx-1"
          >
            プライバシーポリシー
          </Link>
        </p>
      </div>
    </div>
  );
}
