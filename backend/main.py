import logging
import os
import time

import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from core.backtest import backtest_fixed_weights
from core.data import fetch_prices_and_returns
from core.portfolio import run_monte_carlo
from core.presets import get_hedge_tickers, get_preset_tickers
from core.sml import select_tickers_above_sml
from models import AnalyzeRequest, BacktestForRequest

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s | %(message)s",
)
logger = logging.getLogger("portfolio")

app = FastAPI(title="Portfolio Analysis API", version="0.3.0")

origins = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/backtest_for")
def backtest_for(req: BacktestForRequest) -> dict:
    if len(req.tickers) != len(req.weights):
        raise HTTPException(
            status_code=400,
            detail="tickers と weights の長さが一致しません",
        )

    tickers = [t.strip().upper() for t in req.tickers if t.strip()]
    if not tickers:
        raise HTTPException(status_code=400, detail="tickers が空です")

    try:
        _prices, returns = fetch_prices_and_returns(tickers, req.period)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch price data: {e}")

    available = [t for t in tickers if t in returns.columns]
    if not available:
        raise HTTPException(status_code=400, detail="利用可能な価格データがありません")

    idx = {t: i for i, t in enumerate(tickers)}
    w = np.array([float(req.weights[idx[t]]) for t in available])
    w = np.clip(w, 0.0, None)
    if w.sum() <= 0:
        raise HTTPException(status_code=400, detail="重みが全て 0 です")
    w = w / w.sum()
    weights_dict = {t: float(wi) for t, wi in zip(available, w)}

    cumulative = backtest_fixed_weights(returns, available, weights_dict)
    return {
        "dates": [d.strftime("%Y-%m-%d") for d in cumulative.index],
        "cumulative_returns": cumulative.values.tolist(),
    }


def _resolve_equity_universe(preset: str, custom: list[str]) -> list[str]:
    try:
        base = get_preset_tickers(preset)  # type: ignore[arg-type]
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to resolve preset '{preset}': {exc}",
        )

    extra = [t.strip().upper() for t in custom if t and t.strip()]
    combined: list[str] = []
    seen: set[str] = set()
    for t in (*base, *extra):
        up = t.upper()
        if up not in seen:
            seen.add(up)
            combined.append(up)
    return combined


@app.post("/api/analyze")
def analyze(req: AnalyzeRequest) -> dict:
    t_start = time.perf_counter()

    equity_universe = _resolve_equity_universe(req.preset, req.custom_tickers)

    try:
        hedge_tickers = get_hedge_tickers(req.hedge_assets)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if not equity_universe and not hedge_tickers:
        raise HTTPException(
            status_code=400,
            detail="Empty portfolio. Pick a preset, custom tickers, or hedge assets.",
        )

    logger.info(
        "analyze: preset=%s, equities=%d, custom=%d, hedges=%d, period=%s, sims=%d",
        req.preset,
        len(equity_universe),
        len(req.custom_tickers),
        len(hedge_tickers),
        req.period,
        req.n_simulations,
    )
    if hedge_tickers:
        logger.info(
            "Hedge assets added: %d (%s)", len(hedge_tickers), hedge_tickers
        )

    benchmarks = list(req.benchmarks) if req.benchmarks else ["SPY", "QQQ", "^NYFANG"]
    all_tickers = list(
        dict.fromkeys([*equity_universe, *hedge_tickers, *benchmarks])
    )

    try:
        _prices, returns = fetch_prices_and_returns(all_tickers, req.period)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch price data: {e}")

    if returns.empty:
        raise HTTPException(
            status_code=400, detail="No return data available for given inputs."
        )

    available_equities = [t for t in equity_universe if t in returns.columns]
    available_hedges = [t for t in hedge_tickers if t in returns.columns]

    if available_equities:
        try:
            selected_equities, bench_info = select_tickers_above_sml(
                returns, available_equities, benchmarks
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        # No equities at all — still need bench_info for the response.
        try:
            _empty, bench_info = select_tickers_above_sml(
                returns, available_hedges or benchmarks, benchmarks
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        selected_equities = []

    logger.info(
        "SML filter: %d/%d equities above line (slope=%.4f); hedges bypass filter: %d",
        len(selected_equities),
        len(available_equities),
        bench_info["sml_slope"],
        len(available_hedges),
    )

    seen: set[str] = set()
    selected: list[str] = []
    for t in (*selected_equities, *available_hedges):
        if t not in seen:
            seen.add(t)
            selected.append(t)

    if not selected:
        raise HTTPException(
            status_code=400,
            detail="No tickers available for optimization after SML filter.",
        )

    mc = run_monte_carlo(returns, selected, req.n_simulations)
    sharpe_arr = mc["sharpe"]
    optimal_idx = int(np.argmax(sharpe_arr))
    opt_weights = {t: float(w) for t, w in zip(selected, mc["weights"][optimal_idx])}

    cumulative = backtest_fixed_weights(returns, selected, opt_weights)

    elapsed = time.perf_counter() - t_start
    logger.info("analyze complete in %.1fs", elapsed)

    scatter_weights = np.round(mc["weights"], 6).tolist()

    return {
        "scatter": {
            "risk": mc["risk"].tolist(),
            "return": mc["return"].tolist(),
            "sharpe": mc["sharpe"].tolist(),
            "weights": scatter_weights,
            "tickers": selected,
        },
        "optimal": {
            "weights": opt_weights,
            "return": float(mc["return"][optimal_idx]),
            "risk": float(mc["risk"][optimal_idx]),
            "sharpe": float(mc["sharpe"][optimal_idx]),
            "max_drawdown": float(mc["max_drawdown"][optimal_idx]),
        },
        "filtered_tickers": selected,
        "hedge_tickers": available_hedges,
        "universe_size": len(available_equities),
        "filtered_count": len(selected),
        "benchmarks_info": bench_info,
        "backtest": {
            "dates": [d.strftime("%Y-%m-%d") for d in cumulative.index],
            "cumulative_returns": cumulative.values.tolist(),
        },
        "metadata": {
            "preset": req.preset,
            "n_simulations": req.n_simulations,
            "period": req.period,
            "benchmarks_used": benchmarks,
            "elapsed_seconds": elapsed,
        },
    }
