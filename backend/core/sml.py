import numpy as np
import pandas as pd


def select_tickers_above_sml(
    returns: pd.DataFrame,
    tickers: list[str],
    market_ticker: str = "SPY",
    growth_ticker: str = "^NYFANG",
) -> tuple[list[str], pd.Series, pd.Series, pd.DataFrame]:
    annual_ret = returns[tickers].mean() * 252
    annual_vol = returns[tickers].std() * np.sqrt(252)

    bench_tickers = [market_ticker, growth_ticker]
    bench_annual = pd.DataFrame(
        {
            "ticker": bench_tickers,
            "return": (returns[bench_tickers].mean() * 252).values,
            "risk": (returns[bench_tickers].std() * np.sqrt(252)).values,
        }
    )

    market = bench_annual[bench_annual["ticker"] == market_ticker].iloc[0]
    growth = bench_annual[bench_annual["ticker"] == growth_ticker].iloc[0]

    risk_spread = growth["risk"] - market["risk"]
    if risk_spread == 0:
        raise ValueError("Benchmark risks are identical; cannot compute SML slope.")

    slope = (growth["return"] - market["return"]) / risk_spread
    intercept = market["return"] - slope * market["risk"]

    is_above = annual_ret > (slope * annual_vol + intercept)
    selected = annual_ret[is_above].index.tolist()

    return selected, annual_ret, annual_vol, bench_annual
