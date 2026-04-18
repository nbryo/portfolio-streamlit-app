import logging
import time

import pandas as pd
import yfinance as yf

logger = logging.getLogger(__name__)

BATCH_SIZE = 50
SLOW_FETCH_WARN_SECONDS = 120.0


def fetch_prices_and_returns(
    tickers: list[str],
    period: str,
    batch_size: int = BATCH_SIZE,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Fetch adjusted close prices in batches and return (prices, daily_returns).

    Tickers whose batch download fails are dropped — the rest of the universe
    continues through. Timing and success counts are logged.
    """
    unique = list(dict.fromkeys(t.strip().upper() for t in tickers if t.strip()))
    if not unique:
        raise ValueError("No tickers to fetch.")

    batches = [unique[i : i + batch_size] for i in range(0, len(unique), batch_size)]
    logger.info(
        "Fetching %d tickers in %d batch(es) of up to %d (period=%s)",
        len(unique),
        len(batches),
        batch_size,
        period,
    )

    frames: list[pd.DataFrame] = []
    t0 = time.perf_counter()

    for i, batch in enumerate(batches, start=1):
        b_start = time.perf_counter()
        try:
            raw = yf.download(
                batch,
                period=period,
                auto_adjust=True,
                progress=False,
                group_by="ticker",
                threads=True,
            )
        except Exception as exc:
            logger.warning("Batch %d/%d failed (%s); skipping %d tickers", i, len(batches), exc, len(batch))
            continue

        closes = _extract_close(raw, batch)
        if closes is None or closes.empty:
            logger.warning("Batch %d/%d returned no usable data; skipping", i, len(batches))
            continue

        frames.append(closes)
        logger.info(
            "Batch %d/%d: %d/%d tickers in %.1fs",
            i,
            len(batches),
            closes.shape[1],
            len(batch),
            time.perf_counter() - b_start,
        )

    if not frames:
        raise ValueError("All batches failed; no price data available.")

    prices = pd.concat(frames, axis=1)
    prices = prices.loc[:, ~prices.columns.duplicated()]
    prices = prices.dropna(how="all")

    returns = prices.pct_change().dropna(how="all")
    returns = returns.dropna(axis=1, how="all")

    elapsed = time.perf_counter() - t0
    succeeded = list(returns.columns)
    logger.info(
        "Fetched %d/%d tickers successfully in %.1fs",
        len(succeeded),
        len(unique),
        elapsed,
    )
    if elapsed > SLOW_FETCH_WARN_SECONDS:
        logger.warning("yfinance fetch exceeded %.0fs threshold (%.1fs)", SLOW_FETCH_WARN_SECONDS, elapsed)

    missing = set(unique) - set(succeeded)
    if missing:
        logger.info("Missing after fetch: %d tickers (e.g. %s)", len(missing), sorted(missing)[:10])

    return prices, returns


def _extract_close(raw: pd.DataFrame, batch: list[str]) -> pd.DataFrame | None:
    """Pull the Close column out of a yfinance download, handling both single-ticker
    and multi-ticker frame shapes."""
    if raw is None or raw.empty:
        return None

    if isinstance(raw.columns, pd.MultiIndex):
        if len(batch) == 1 or "Close" in raw.columns.get_level_values(-1):
            try:
                closes = raw.xs("Close", axis=1, level=-1)
            except KeyError:
                return None
        else:
            return None
    else:
        if "Close" in raw.columns:
            closes = raw[["Close"]]
            closes.columns = [batch[0]]
        else:
            return None

    if isinstance(closes, pd.Series):
        closes = closes.to_frame(name=batch[0] if batch else "Close")

    return closes.dropna(how="all", axis=1)
