import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約 | ポートフォリオ分析",
  description: "Portfolio Optimizer の利用規約",
};

export default function Terms() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <Link
          href="/"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block"
        >
          ← 戻る
        </Link>

        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          利用規約
        </h1>
        <p className="text-sm text-zinc-500 mb-8">最終更新日: 2026年4月18日</p>

        <section className="space-y-8 text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              第1条（適用）
            </h2>
            <p>
              本規約は、Portfolio Optimizer（以下「本ツール」）の利用に関する一切の関係に適用されます。ユーザーが本ツールを利用した時点で、本規約の全ての内容に同意したものとみなされます。本規約に同意いただけない場合は、本ツールをご利用いただけません。
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-800 rounded-xl p-5">
            <h2 className="text-xl font-bold text-red-900 dark:text-red-300 mb-3 flex items-center gap-2">
              <span aria-hidden>⚠️</span>
              第2条（免責事項 - 最重要）
            </h2>
            <div className="space-y-3 text-red-900 dark:text-red-200">
              <p className="font-bold text-base">
                本ツールは投資助言を行うものではありません。
              </p>
              <p>
                本ツールは、過去の公開株価データに基づく統計分析ツールであり、金融商品取引法第2条第8項第11号に定める投資助言業に該当する行為は一切行いません。
              </p>
              <ul className="list-disc pl-6 space-y-1.5 mt-2">
                <li>
                  本ツールが提示する情報は、過去データに基づく分析結果であり、将来の投資成果を保証するものではありません
                </li>
                <li>
                  本ツールの分析結果に基づく投資判断により生じた損失について、開発者は一切の責任を負いません
                </li>
                <li>
                  投資判断はユーザー自身の判断と責任において行ってください
                </li>
                <li>
                  投資にあたっては、証券会社等の金融商品取引業者または適切な資格を持つ専門家にご相談することを強く推奨します
                </li>
                <li>
                  本ツールは教育・学習目的、および個人的な資産分析の参考として提供されるものです
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              第3条（禁止事項）
            </h2>
            <p>
              ユーザーは、本ツールの利用にあたり、以下の行為を行ってはなりません。
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>法令または公序良俗に違反する行為</li>
              <li>本ツールの運営を妨害する行為</li>
              <li>他のユーザーまたは第三者に不利益・損害・不快感を与える行為</li>
              <li>
                本ツールのリバースエンジニアリング、スクレイピング、自動アクセス等の技術的な不正行為
              </li>
              <li>本ツールを商業目的で無許可に転載・再配布する行為</li>
              <li>
                本ツールの内容を、投資助言や金融商品の推奨として第三者に提供する行為
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              第4条（サービスの変更・停止）
            </h2>
            <p>
              開発者は、ユーザーに事前通知することなく、本ツールの内容を変更または停止することができます。これによってユーザーに生じた損害について、開発者は一切の責任を負いません。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              第5条（データの正確性）
            </h2>
            <p>
              本ツールは Yahoo Finance
              等の第三者データソースから株価情報を取得しています。データの正確性、完全性、最新性、継続的な可用性について、開発者は一切の保証をしません。データの遅延、欠損、または誤りが生じる場合があります。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              第6条（知的財産権）
            </h2>
            <p>
              本ツールに関する知的財産権は、開発者または正当な権利者に帰属します。本ツールのソースコードは
              MIT ライセンスの下、GitHub 上で公開されています。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              第7条（準拠法・管轄）
            </h2>
            <p>
              本規約は日本国の法律に準拠し、本ツールに関する紛争については、開発者の住所地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              第8条（規約の変更）
            </h2>
            <p>
              本規約は予告なく変更される場合があります。重要な変更がある場合は、本ページに掲示します。変更後も本ツールの利用を継続した場合、変更後の規約に同意したものとみなされます。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              第9条（お問い合わせ）
            </h2>
            <p>
              本規約に関するお問い合わせは、GitHub リポジトリの Issues
              を通じてお願いします。
              <br />
              <a
                href="https://github.com/nbryo/portfolio-streamlit-app/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                https://github.com/nbryo/portfolio-streamlit-app/issues
              </a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
