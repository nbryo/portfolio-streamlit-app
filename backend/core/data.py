import pandas as pd
import yfinance as yf


def fetch_prices_and_returns(
    tickers: list[str], period: str
) -> tuple[pd.DataFrame, pd.DataFrame]:
    data = yf.download(tickers, period=period, auto_adjust=True, progress=False)[
        "Close"
    ].dropna(how="all")
    returns = data.pct_change().dropna()
    return data, returns
