"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  Code2,
  ExternalLink,
  FileText,
  Info,
  Shield,
} from "lucide-react";

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
            バージョン情報・データソース・法的書類、ソースコードへのリンクです。
          </p>
        </section>

        {/* Top-priority disclaimer — shown first so users see it before anything else */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800 rounded-xl p-4 mb-4">
          <h2 className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" aria-hidden />
            重要：免責事項
          </h2>
          <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
            本ツールは過去データに基づく<strong>分析ツール</strong>であり、
            <strong>投資助言を行うものではありません</strong>
            。分析結果は将来の投資成果を保証するものではなく、投資判断はユーザー自身の責任で行ってください。
          </p>
        </div>

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

          {/* Legal documents */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 pt-4 pb-2 text-xs text-zinc-500 dark:text-zinc-400">
              法的情報
            </div>
            <LegalLink
              href="/terms"
              icon={<FileText className="w-5 h-5 text-zinc-700 dark:text-zinc-300" aria-hidden />}
              label="利用規約"
              subvalue="本ツールの利用条件と免責事項"
            />
            <div className="border-t border-zinc-100 dark:border-zinc-800" />
            <LegalLink
              href="/privacy"
              icon={<Shield className="w-5 h-5 text-zinc-700 dark:text-zinc-300" aria-hidden />}
              label="プライバシーポリシー"
              subvalue="情報の取り扱いについて"
            />
          </div>

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

function LegalLink({
  href,
  icon,
  label,
  subvalue,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  subvalue: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {label}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {subvalue}
          </div>
        </div>
      </div>
      <ChevronRight
        className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0"
        aria-hidden
      />
    </Link>
  );
}
