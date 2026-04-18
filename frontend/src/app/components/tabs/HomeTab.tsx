"use client";

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
      </div>
    </div>
  );
}
