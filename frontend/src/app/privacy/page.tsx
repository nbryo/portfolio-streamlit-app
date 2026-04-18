import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー | ポートフォリオ分析",
  description: "Portfolio Optimizer のプライバシーポリシー",
};

export default function PrivacyPolicy() {
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
          プライバシーポリシー
        </h1>
        <p className="text-sm text-zinc-500 mb-8">最終更新日: 2026年4月18日</p>

        <section className="space-y-8 text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              1. はじめに
            </h2>
            <p>
              Portfolio Optimizer（以下「本ツール」）は、ユーザーのプライバシー保護を重要視しています。本プライバシーポリシーは、本ツールにおける情報の取り扱いについて説明するものです。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              2. 収集する情報
            </h2>
            <p>本ツールは、以下の情報を処理する場合があります。</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                ユーザーが入力した銘柄ティッカー（一時的にメモリ内で処理、永続保存はしません）
              </li>
              <li>
                ブラウザのローカルストレージに保存される設定情報（テーマ設定、インストールプロンプトの表示状態等）
              </li>
              <li>
                Vercel によるアクセスログ（IPアドレス、User-Agent、アクセス日時）
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              3. 収集しない情報
            </h2>
            <p>本ツールは以下の情報を一切収集しません。</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>氏名、メールアドレス、電話番号等の個人を特定する情報</li>
              <li>証券口座情報、保有銘柄情報、取引履歴</li>
              <li>クレジットカード情報、金融資産情報</li>
              <li>位置情報</li>
              <li>カメラ、マイク、連絡先等のデバイス情報</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              4. 第三者への提供
            </h2>
            <p>
              本ツールは、ユーザー情報を第三者に販売・提供しません。ただし、以下の場合を除きます。
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>法令に基づく開示要求があった場合</li>
              <li>ユーザーの同意がある場合</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              5. 外部サービスの利用
            </h2>
            <p>本ツールは以下の外部サービスを利用しています。</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Yahoo Finance (yfinance)</strong>:
                株価データの取得に使用。ユーザー個人情報は送信しません。
              </li>
              <li>
                <strong>Vercel</strong>:
                ホスティングサービス。アクセスログが記録されます。詳細は{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Vercel プライバシーポリシー
                </a>{" "}
                をご参照ください。
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              6. Cookie およびローカルストレージ
            </h2>
            <p>
              本ツールはユーザー体験向上のため、ブラウザのローカルストレージおよびセッションストレージを使用します。これらは個人を特定する情報を含みません。ブラウザ設定から削除することができます。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              7. お子様のプライバシー
            </h2>
            <p>
              本ツールは 13 歳未満の子供を対象としていません。13
              歳未満の方の個人情報を意図的に収集することはありません。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              8. セキュリティ
            </h2>
            <p>
              本ツールは HTTPS
              通信を使用し、データの送受信を暗号化します。ただし、インターネット通信の完全な安全性を保証するものではありません。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              9. プライバシーポリシーの変更
            </h2>
            <p>
              本ポリシーは予告なく変更される場合があります。重要な変更がある場合は、本ページに掲示します。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              10. お問い合わせ
            </h2>
            <p>
              本ポリシーに関するお問い合わせは、GitHub リポジトリの Issues
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
