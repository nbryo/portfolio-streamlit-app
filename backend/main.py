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
from core.presets import get_preset_tickers
from core.sml import select_tickers_above_sml
from models import AnalyzeRequest

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s | %(message)s",
)
logger = logging.getLogger("portfolio")

app = FastAPI(title="Portfolio Analysis API", version="0.2.0")

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


def _resolve_universe(preset: str, custom: list[str]) -> list[str]:
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

    universe = _resolve_universe(req.preset, req.custom_tickers)
    if not universe:
        raise HTTPException(
            status_code=400,
            detail="Empty universe. Pick a preset or provide custom_tickers.",
        )

    logger.info(
        "analyze: preset=%s, universe=%d, custom=%d, period=%s, sims=%d",
        req.preset,
        len(universe),
        len(req.custom_tickers),
        req.period,
        req.n_simulations,
    )

    benchmarks = list(req.benchmarks) if req.benchmarks else ["SPY", "QQQ", "^NYFANG"]
    all_tickers = list(dict.fromkeys([*universe, *benchmarks]))

    try:
        _prices, returns = fetch_prices_and_returns(all_tickers, req.period)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch price data: {e}")

    if returns.empty:
        raise HTTPException(
            status_code=400, detail="No return data available for given inputs."
        )

    available_universe = [t for t in universe if t in returns.columns]
    if not available_universe:
        raise HTTPException(
            status_code=400,
            detail="None of the universe tickers have return data.",
        )

    try:
        selected, bench_info = select_tickers_above_sml(
            returns, available_universe, benchmarks
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not selected:
        raise HTTPException(
            status_code=400,
            detail="No tickers lie above the Security Market Line.",
        )

    logger.info(
        "SML filter: %d/%d tickers above line (slope=%.4f)",
        len(selected),
        len(available_universe),
        bench_info["sml_slope"],
    )

    mc = run_monte_carlo(returns, selected, req.n_simulations)
    sharpe_arr = mc["sharpe"]
    optimal_idx = int(np.argmax(sharpe_arr))
    opt_weights = {t: float(w) for t, w in zip(selected, mc["weights"][optimal_idx])}

    cumulative = backtest_fixed_weights(returns, selected, opt_weights)

    elapsed = time.perf_counter() - t_start
    logger.info("analyze complete in %.1fs", elapsed)

    return {
        "scatter": {
            "risk": mc["risk"].tolist(),
            "return": mc["return"].tolist(),
            "sharpe": mc["sharpe"].tolist(),
        },
        "optimal": {
            "weights": opt_weights,
            "return": float(mc["return"][optimal_idx]),
            "risk": float(mc["risk"][optimal_idx]),
            "sharpe": float(mc["sharpe"][optimal_idx]),
            "max_drawdown": float(mc["max_drawdown"][optimal_idx]),
        },
        "filtered_tickers": selected,
        "universe_size": len(available_universe),
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
