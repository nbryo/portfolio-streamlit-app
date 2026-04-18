import numpy as np
import pandas as pd

DEFAULT_BENCHMARKS: list[str] = ["SPY", "QQQ", "^NYFANG"]


def select_tickers_above_sml(
    returns: pd.DataFrame,
    tickers: list[str],
    benchmarks: list[str] | None = None,
) -> tuple[list[str], dict]:
    """Filter tickers lying strictly above the Security Market Line.

    The SML is defined as the straight line from the origin (risk=0, return=0)
    through the mean (risk, return) of the supplied benchmark indices. A ticker
    is kept if its annualized return exceeds slope * its annualized risk, i.e.
    its Sharpe (with rf=0) beats the benchmark-average Sharpe.
    """
    if benchmarks is None:
        benchmarks = list(DEFAULT_BENCHMARKS)

    available_bench = [b for b in benchmarks if b in returns.columns]
    if not available_bench:
        raise ValueError(
            f"None of the benchmarks {benchmarks} are present in returns data."
        )

    available_tickers = [t for t in tickers if t in returns.columns]
    if not available_tickers:
        raise ValueError("No candidate tickers are present in returns data.")

    annual_ret = returns[available_tickers].mean() * 252
    annual_vol = returns[available_tickers].std() * np.sqrt(252)

    bench_ret = returns[available_bench].mean() * 252
    bench_vol = returns[available_bench].std() * np.sqrt(252)

    mean_return = float(bench_ret.mean())
    mean_risk = float(bench_vol.mean())
    if mean_risk <= 0:
        raise ValueError("Mean benchmark risk is non-positive; cannot compute SML.")

    slope = mean_return / mean_risk
    is_above = annual_ret > slope * annual_vol
    selected = annual_ret[is_above].index.tolist()

    benchmarks_info = {
        "individual": [
            {
                "ticker": b,
                "return": float(bench_ret[b]),
                "risk": float(bench_vol[b]),
            }
            for b in available_bench
        ],
        "mean": {"return": mean_return, "risk": mean_risk},
        "sml_slope": slope,
        "requested": list(benchmarks),
        "missing": [b for b in benchmarks if b not in available_bench],
    }

    return selected, benchmarks_info
