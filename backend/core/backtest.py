import numpy as np
import pandas as pd


def backtest_fixed_weights(
    returns: pd.DataFrame,
    tickers: list[str],
    weights: dict[str, float],
) -> pd.Series:
    """Compute cumulative return with per-day weight renormalization.

    On days where a ticker has no data (NaN — e.g. before its IPO), its share
    of the weight is redistributed across the tickers that do have data that
    day. That lets long-history names (SPY, GLD) carry the early part of the
    curve while short-history names (BTC ETFs, recent IPOs) join in when
    their data starts. The curve is rebased to 1.0 on its first day.
    """
    rets = returns[tickers].copy()
    w = pd.Series(weights, dtype="float64").reindex(rets.columns).fillna(0.0)

    valid = rets.notna().astype("float64")
    daily_w = valid.mul(w, axis=1)
    row_sums = daily_w.sum(axis=1)
    # Re-normalize so each day's active weights sum to 1. Days where no ticker
    # has data (row_sum==0) become NaN here, then zero after fillna below — the
    # portfolio return for such days is 0 (no change).
    daily_w = daily_w.div(row_sums.replace(0.0, np.nan), axis=0)

    daily_returns = (rets.fillna(0.0) * daily_w.fillna(0.0)).sum(axis=1)
    cumulative = (1.0 + daily_returns).cumprod()

    if len(cumulative) > 0 and cumulative.iloc[0] != 0 and not np.isnan(cumulative.iloc[0]):
        cumulative = cumulative / cumulative.iloc[0]

    return cumulative
