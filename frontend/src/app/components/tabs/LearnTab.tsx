"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Card {
  title: string;
  summary: string;
  detail: string;
}

const CARDS: Card[] = [
  {
    title: "ポートフォリオ理論とは",
    summary: "分散投資でリスクを抑えながらリターン効率を高める",
    detail:
      "ハリー・マーコウィッツ（1952）の現代ポートフォリオ理論がベース。\n\n核心は「相関の低い資産を組み合わせると、個々の資産のリスクの平均より、ポートフォリオ全体のリスクが小さくなる」という数学的事実。\n\n例: 株式単体のリスク = 20% / 株式 + 債券のリスク = 15%（債券との相関が低いため）\n\nこの「分散効果」を最大化するのがポートフォリオ最適化です。",
  },
  {
    title: "シャープ比",
    summary: "リスク1単位あたりのリターン効率",
    detail:
      "計算式: シャープ比 = (リターン − 無リスク金利) / リスク（標準偏差）\n\n意味:「同じリスクを取るなら、より多くのリターンを得られるポートフォリオが優れている」を数値化。\n\n目安:\n・S&P500: 0.4–0.6（歴史的）\n・優秀なヘッジファンド: 1.0–2.0\n・このツールで 5 以上: 過去データへの過剰最適化に注意\n\n本ツールでは Risk-free rate を 0 として計算しています。",
  },
  {
    title: "効率的フロンティア",
    summary: "同じリスクで最大のリターンを得られる配分の集合",
    detail:
      "横軸: リスク、縦軸: リターンの平面上で、「ある一定のリスクで最大のリターン」を実現する配分点を結んだ曲線。\n\nフロンティアより下は「無駄」（同じリスクでもっと稼げる配分がある）。\n\n本ツールでは 10,000 回のモンテカルロでこの曲線を描画。色はシャープ比でグラデーション（黄色 = 高シャープ比）。\n\n赤い★が「最大シャープ比 = 接点ポートフォリオ」。クリックで他の点も検討できます。",
  },
  {
    title: "SML（証券市場線）",
    summary: "市場平均のリスク・リターン関係を示す直線",
    detail:
      "CAPM（資本資産価格モデル）の中核概念。「市場平均ベンチマークのリターンとリスクを通る直線」。\n\n本ツールでは SPY（S&P500）+ QQQ（NASDAQ100）+ ^NYFANG（FANG+）の3指数の平均で SML を定義。\n\nSML より上 =「市場平均より効率の良い銘柄」(α)\nSML より下 =「市場平均より効率の悪い銘柄」\n\n本ツールは SML を上回る株式のみを最適化対象とすることで、市場平均を超える可能性を高めます。",
  },
  {
    title: "モンテカルロ法",
    summary: "ランダムなシミュレーションで最適解を探す手法",
    detail:
      "数学的に解析的に解けない問題を、大量の乱数で近似する手法。\n\n本ツール: 10,000 通りのランダムな配分（合計 100%）を生成 → それぞれのリターン・リスク・シャープ比を計算 → 最大シャープ比の配分を選定。\n\n回数を増やすほど精度向上（ただし時間も増加）。\n\n5000 回でも近似値は出ますが、安定性のため 10,000 を推奨。",
  },
  {
    title: "ヘッジ資産の役割",
    summary: "株式と相関の低い資産で分散効果を高める",
    detail:
      "株式だけでポートフォリオを組むと、市場暴落時に全銘柄が同じ方向に動くリスクがあります。\n\n対策: 株式と相関の低いヘッジ資産（金、国債、REIT、コモディティ等）を組み込む。\n\n本ツールが対応するヘッジ資産:\n・GLD（金）: 危機時に上昇\n・TLT（長期米国債）: 株式と逆相関\n・IBIT（BTC ETF）: 一部期間で非相関\n・VNQ（REIT）: インフレヘッジ\n・DBC（コモディティ）: インフレヘッジ\n\nヘッジ資産は SML フィルタを通さず、無条件で候補に含めます。",
  },
];

export default function LearnTab() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <section className="mb-8">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">投資理論</p>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            投資を学ぶ
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
            このツールが使っている概念を短くまとめました。カードをタップで詳細が開きます。
          </p>
        </section>

        <div className="flex flex-col gap-3">
          {CARDS.map((card, i) => {
            const open = openIdx === i;
            return (
              <article
                key={card.title}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : i)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {card.title}
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      {card.summary}
                    </p>
                  </div>
                  <ChevronDown
                    aria-hidden
                    className={
                      "w-5 h-5 shrink-0 text-zinc-500 dark:text-zinc-400 transition-transform " +
                      (open ? "rotate-180" : "")
                    }
                  />
                </button>
                {open && (
                  <div className="px-5 pb-5 pt-1 border-t border-zinc-100 dark:border-zinc-800 animate-fadeIn">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                      {card.detail}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
