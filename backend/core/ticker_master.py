"""Master list of searchable tickers for the frontend ticker search.

Each entry is (ticker, english_name, japanese_name, kana). Kana is used to
catch variants (for example "エーエムディー" in full-width katakana when the
japanese_name is just "AMD"). Search normalizes hiragana to katakana so a
user typing "あっぷる" still matches "アップル".
"""

from __future__ import annotations

from typing import TypedDict

# (ticker, english, japanese, kana)
TICKER_MASTER: list[tuple[str, str, str, str]] = [
    # FAANG / Big Tech
    ("AAPL", "Apple Inc.", "アップル", "アップル"),
    ("MSFT", "Microsoft Corporation", "マイクロソフト", "マイクロソフト"),
    ("GOOGL", "Alphabet Inc. (Class A)", "アルファベット", "アルファベット"),
    ("GOOG", "Alphabet Inc. (Class C)", "アルファベット", "アルファベット"),
    ("AMZN", "Amazon.com Inc.", "アマゾン", "アマゾン"),
    ("META", "Meta Platforms Inc.", "メタ", "メタ"),
    ("NFLX", "Netflix Inc.", "ネットフリックス", "ネットフリックス"),
    ("NVDA", "NVIDIA Corporation", "エヌビディア", "エヌビディア"),
    ("TSLA", "Tesla Inc.", "テスラ", "テスラ"),
    # Semiconductors
    ("AMD", "Advanced Micro Devices", "AMD", "エーエムディー"),
    ("INTC", "Intel Corporation", "インテル", "インテル"),
    ("AVGO", "Broadcom Inc.", "ブロードコム", "ブロードコム"),
    ("TSM", "Taiwan Semiconductor", "TSMC", "ティーエスエムシー"),
    ("ASML", "ASML Holding", "ASML", "エーエスエムエル"),
    ("LRCX", "Lam Research", "ラムリサーチ", "ラムリサーチ"),
    ("AMAT", "Applied Materials", "アプライドマテリアルズ", "アプライドマテリアルズ"),
    ("QCOM", "Qualcomm Inc.", "クアルコム", "クアルコム"),
    ("MU", "Micron Technology", "マイクロン", "マイクロン"),
    ("TXN", "Texas Instruments", "テキサスインスツルメンツ", "テキサスインスツルメンツ"),
    # AI / Cloud / Enterprise
    ("ORCL", "Oracle Corporation", "オラクル", "オラクル"),
    ("CRM", "Salesforce", "セールスフォース", "セールスフォース"),
    ("PLTR", "Palantir Technologies", "パランティア", "パランティア"),
    ("SNOW", "Snowflake Inc.", "スノーフレーク", "スノーフレーク"),
    ("NOW", "ServiceNow Inc.", "サービスナウ", "サービスナウ"),
    ("ADBE", "Adobe Inc.", "アドビ", "アドビ"),
    ("SHOP", "Shopify Inc.", "ショッピファイ", "ショッピファイ"),
    ("CRWD", "CrowdStrike Holdings", "クラウドストライク", "クラウドストライク"),
    ("PANW", "Palo Alto Networks", "パロアルト", "パロアルト"),
    # Financials
    ("JPM", "JPMorgan Chase", "JPモルガン", "ジェーピーモルガン"),
    ("BAC", "Bank of America", "バンクオブアメリカ", "バンクオブアメリカ"),
    ("V", "Visa Inc.", "ビザ", "ビザ"),
    ("MA", "Mastercard Inc.", "マスターカード", "マスターカード"),
    ("BRK-B", "Berkshire Hathaway B", "バークシャーハサウェイ", "バークシャーハサウェイ"),
    ("GS", "Goldman Sachs", "ゴールドマンサックス", "ゴールドマンサックス"),
    ("MS", "Morgan Stanley", "モルガンスタンレー", "モルガンスタンレー"),
    # Healthcare / Pharma
    ("JNJ", "Johnson & Johnson", "ジョンソンエンドジョンソン", "ジョンソンエンドジョンソン"),
    ("UNH", "UnitedHealth Group", "ユナイテッドヘルス", "ユナイテッドヘルス"),
    ("PFE", "Pfizer Inc.", "ファイザー", "ファイザー"),
    ("LLY", "Eli Lilly", "イーライリリー", "イーライリリー"),
    ("MRK", "Merck & Co.", "メルク", "メルク"),
    ("ABBV", "AbbVie Inc.", "アッヴィ", "アッヴィ"),
    # Consumer
    ("KO", "Coca-Cola", "コカコーラ", "コカコーラ"),
    ("PEP", "PepsiCo", "ペプシコ", "ペプシコ"),
    ("MCD", "McDonald's", "マクドナルド", "マクドナルド"),
    ("SBUX", "Starbucks", "スターバックス", "スターバックス"),
    ("WMT", "Walmart Inc.", "ウォルマート", "ウォルマート"),
    ("COST", "Costco Wholesale", "コストコ", "コストコ"),
    ("NKE", "Nike Inc.", "ナイキ", "ナイキ"),
    ("HD", "The Home Depot", "ホームデポ", "ホームデポ"),
    ("PG", "Procter & Gamble", "プロクターアンドギャンブル", "プロクターアンドギャンブル"),
    ("DIS", "Walt Disney", "ディズニー", "ディズニー"),
    # Industrial / Energy / Materials
    ("BA", "Boeing Company", "ボーイング", "ボーイング"),
    ("CAT", "Caterpillar Inc.", "キャタピラー", "キャタピラー"),
    ("XOM", "Exxon Mobil", "エクソンモービル", "エクソンモービル"),
    ("CVX", "Chevron Corporation", "シェブロン", "シェブロン"),
    ("GE", "General Electric", "ゼネラルエレクトリック", "ゼネラルエレクトリック"),
    ("HON", "Honeywell International", "ハネウェル", "ハネウェル"),
    # ETFs / Indices
    ("SPY", "SPDR S&P 500", "S&P500 ETF", "エスアンドピー"),
    ("QQQ", "Invesco QQQ", "NASDAQ100 ETF", "ナスダック"),
    ("DIA", "SPDR Dow Jones", "ダウ平均 ETF", "ダウ"),
    ("VTI", "Vanguard Total Stock", "全米株式 ETF", "バンガード"),
    ("VOO", "Vanguard S&P 500", "S&P500 ETF", "バンガード"),
    ("IWM", "iShares Russell 2000", "ラッセル2000 ETF", "ラッセル"),
    ("^NYFANG", "NYSE FANG+ Index", "FANG+ 指数", "ファング"),
    # Hedge / Alt
    ("GLD", "SPDR Gold Trust", "金 ETF", "ゴールド"),
    ("SLV", "iShares Silver Trust", "銀 ETF", "シルバー"),
    ("IBIT", "iShares Bitcoin Trust", "ビットコイン ETF", "ビットコイン"),
    ("TLT", "iShares 20+ Year Treasury", "長期米国債", "ロングターム"),
    ("IEF", "iShares 7-10 Year Treasury", "中期米国債", "ミディアム"),
    ("VNQ", "Vanguard REIT", "REIT", "リート"),
    ("DBC", "Invesco DB Commodity", "コモディティ", "コモディティ"),
]


class TickerMatch(TypedDict):
    ticker: str
    english: str
    japanese: str


def _hira_to_kata(s: str) -> str:
    """Convert hiragana to katakana so "あっぷる" matches "アップル"."""
    return "".join(
        chr(ord(c) + 0x60) if "\u3041" <= c <= "\u3096" else c for c in s
    )


def _normalize(s: str) -> str:
    return _hira_to_kata(s.strip().lower())


def search_tickers(query: str, limit: int = 10) -> list[TickerMatch]:
    """Return up to `limit` ticker matches ranked by prefix-match first."""
    if not query or not query.strip():
        return []
    q = _normalize(query)

    prefix: list[TickerMatch] = []
    substring: list[TickerMatch] = []

    for ticker, english, japanese, kana in TICKER_MASTER:
        fields = [
            _normalize(ticker),
            _normalize(english),
            _normalize(japanese),
            _normalize(kana),
        ]
        match: TickerMatch = {
            "ticker": ticker,
            "english": english,
            "japanese": japanese,
        }
        if any(f.startswith(q) for f in fields):
            prefix.append(match)
        elif any(q in f for f in fields):
            substring.append(match)

    return (prefix + substring)[:limit]
