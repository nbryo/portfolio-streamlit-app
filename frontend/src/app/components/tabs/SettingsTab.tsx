"use client";

import { Code2, ExternalLink, Info, ShieldAlert } from "lucide-react";

const REPO_URL = "https://github.com/nbryo/portfolio-streamlit-app";

export default function SettingsTab() {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <section className="mb-8">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">アプリ情報</p>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            設定
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
            バージョン情報とデータソース、ソースコードへのリンクです。
          </p>
        </section>

        <div className="flex flex-col gap-3">
          <InfoRow
            icon={<Info className="w-4 h-4 text-zinc-500 dark:text-zinc-400" aria-hidden />}
            label="バージョン"
            value="v0.1"
          />
          <InfoRow
            icon={<Info className="w-4 h-4 text-zinc-500 dark:text-zinc-400" aria-hidden />}
            label="データソース"
            value="Yahoo Finance (yfinance)"
            subvalue="S&P 500 構成銘柄は GitHub (datasets/s-and-p-500-companies) から取得"
          />

          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 px-5 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Code2 className="w-5 h-5 text-zinc-700 dark:text-zinc-300" aria-hidden />
              <div>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  GitHub リポジトリ
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 break-all">
                  {REPO_URL.replace("https://", "")}
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" aria-hidden />
          </a>

          <div className="mt-4 flex gap-3 items-start px-5 py-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl">
            <ShieldAlert
              className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5"
              aria-hidden
            />
            <div className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
              <div className="font-semibold mb-1">免責事項</div>
              本ツールは教育目的のシミュレーションです。過去のリターン・リスクは将来を保証しません。実際の投資判断はご自身の責任で行ってください。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  subvalue,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  subvalue?: string;
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
      {icon && <div className="pt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-0.5 num">
          {value}
        </div>
        {subvalue && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            {subvalue}
          </div>
        )}
      </div>
    </div>
  );
}
