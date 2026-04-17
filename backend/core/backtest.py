import numpy as np
import pandas as pd


def backtest_fixed_weights(
    returns: pd.DataFrame, tickers: list[str], weights: dict[str, float]
) -> pd.Series:
    weight_arr = np.array([weights[t] for t in tickers])
    cumulative = (returns[tickers] @ weight_arr + 1.0).cumprod()
    return cumulative
