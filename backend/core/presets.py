"""Preset ticker lists.

S&P500 is fetched dynamically from a public GitHub CSV (cached for the process
lifetime). NASDAQ-100, FANG+, and Dow 30 are hardcoded constituent lists as of
April 2026.
"""

from __future__ import annotations

import csv
import io
import logging
from functools import lru_cache
from typing import Literal

import requests

logger = logging.getLogger(__name__)

SP500_CSV_URL = (
    "https://raw.githubusercontent.com/datasets/"
    "s-and-p-500-companies/main/data/constituents.csv"
)

Preset = Literal["sp500", "nasdaq100", "fang_plus", "dow30", "custom"]

# NASDAQ-100 constituents as of 2026-04 (101 tickers: 100 companies + GOOGL/GOOG).
# Cross-checked against stockanalysis.com and Wikipedia (Jan 2026 rebalance applied).
NASDAQ100: list[str] = [
    "AAPL", "ABNB", "ADBE", "ADI", "ADP", "ADSK", "AEP", "ALNY", "AMAT", "AMD",
    "AMGN", "AMZN", "APP", "ARM", "ASML", "AVGO", "AXON", "BKNG", "BKR", "CCEP",
    "CDNS", "CEG", "CHTR", "CMCSA", "COST", "CPRT", "CRWD", "CSCO", "CSGP", "CSX",
    "CTAS", "CTSH", "DASH", "DDOG", "DXCM", "EA", "EXC", "FANG", "FAST", "FER",
    "FTNT", "GEHC", "GILD", "GOOG", "GOOGL", "HON", "IDXX", "INSM", "INTC", "INTU",
    "ISRG", "KDP", "KHC", "KLAC", "LIN", "LRCX", "MAR", "MCHP", "MDLZ", "MELI",
    "META", "MNST", "MPWR", "MRVL", "MSFT", "MSTR", "MU", "NFLX", "NVDA", "NXPI",
    "ODFL", "ORLY", "PANW", "PAYX", "PCAR", "PDD", "PEP", "PLTR", "PYPL", "QCOM",
    "REGN", "ROP", "ROST", "SBUX", "SHOP", "SNPS", "STX", "TEAM", "TMUS", "TRI",
    "TSLA", "TTWO", "TXN", "VRSK", "VRTX", "WBD", "WDAY", "WDC", "WMT", "XEL",
    "ZS",
]

FANG_PLUS: list[str] = [
    "META", "AAPL", "AMZN", "NFLX", "GOOGL",
    "MSFT", "NVDA", "TSLA", "AVGO", "NOW",
]

# Dow Jones Industrial Average (30 components) as of 2026-04.
# Latest change: 2024-11-08 (NVDA replaced INTC, SHW replaced DOW).
DOW30: list[str] = [
    "AAPL", "AMGN", "AMZN", "AXP", "BA", "CAT", "CRM", "CSCO", "CVX", "DIS",
    "GS", "HD", "HON", "IBM", "JNJ", "JPM", "KO", "MCD", "MMM", "MRK",
    "MSFT", "NKE", "NVDA", "PG", "SHW", "TRV", "UNH", "V", "VZ", "WMT",
]


@lru_cache(maxsize=1)
def get_sp500_tickers() -> list[str]:
    """Fetch current S&P 500 constituents from a public GitHub CSV.

    Cached for the lifetime of the process. On fetch failure the caller sees
    the exception and decides how to handle it.
    """
    logger.info("Fetching S&P 500 constituents from GitHub CSV")
    resp = requests.get(SP500_CSV_URL, timeout=15)
    resp.raise_for_status()

    reader = csv.DictReader(io.StringIO(resp.text))
    tickers = [row["Symbol"].strip().upper() for row in reader if row.get("Symbol")]
    # Normalize class-share separators to yfinance format (e.g. "BRK.B" -> "BRK-B").
    tickers = [t.replace(".", "-") for t in tickers]

    logger.info("S&P 500: fetched %d tickers", len(tickers))
    return tickers


def get_preset_tickers(preset: Preset) -> list[str]:
    if preset == "sp500":
        return get_sp500_tickers()
    if preset == "nasdaq100":
        return list(NASDAQ100)
    if preset == "fang_plus":
        return list(FANG_PLUS)
    if preset == "dow30":
        return list(DOW30)
    if preset == "custom":
        return []
    raise ValueError(f"Unknown preset: {preset}")
