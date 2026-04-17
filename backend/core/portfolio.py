import numpy as np
import pandas as pd


def calculate_drawdown(series: pd.Series) -> float:
    cummax = series.cummax()
    return float((series / cummax - 1).min())


def run_monte_carlo(
    returns: pd.DataFrame,
    tickers: list[str],
    n_simulations: int = 10000,
    seed: int | None = None,
) -> dict:
    rng = np.random.default_rng(seed)
    n_tickers = len(tickers)
    ret_matrix = returns[tickers].values

    weights = rng.random((n_simulations, n_tickers))
    weights /= weights.sum(axis=1, keepdims=True)

    port_daily = ret_matrix @ weights.T
    port_cum = (1.0 + port_daily).cumprod(axis=0)

    mean_returns = returns[tickers].mean().values * 252
    cov_matrix = returns[tickers].cov().values * 252

    annual_ret = weights @ mean_returns
    annual_vol = np.sqrt(np.einsum("ij,jk,ik->i", weights, cov_matrix, weights))
    sharpe = np.where(annual_vol > 0, annual_ret / np.where(annual_vol > 0, annual_vol, 1), 0.0)

    running_max = np.maximum.accumulate(port_cum, axis=0)
    drawdowns = port_cum / running_max - 1.0
    max_dd = drawdowns.min(axis=0)

    return {
        "weights": weights,
        "return": annual_ret,
        "risk": annual_vol,
        "sharpe": sharpe,
        "max_drawdown": max_dd,
    }
