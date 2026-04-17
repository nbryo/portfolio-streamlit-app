import os

import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from core.backtest import backtest_fixed_weights
from core.data import fetch_prices_and_returns
from core.portfolio import run_monte_carlo
from core.sml import select_tickers_above_sml
from models import AnalyzeRequest

load_dotenv()

app = FastAPI(title="Portfolio Analysis API", version="0.1.0")

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


@app.post("/api/analyze")
def analyze(req: AnalyzeRequest) -> dict:
    user_tickers = [t.strip().upper() for t in req.tickers if t.strip()]
    if not user_tickers:
        raise HTTPException(status_code=400, detail="No valid tickers provided.")

    market = req.benchmarks.market
    growth = req.benchmarks.growth
    all_tickers = list(set(user_tickers + [market, growth]))

    try:
        _prices, returns = fetch_prices_and_returns(all_tickers, req.period)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch price data: {e}")

    if returns.empty:
        raise HTTPException(status_code=400, detail="No return data available for given tickers/period.")

    missing = [t for t in all_tickers if t not in returns.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"No data for tickers: {', '.join(missing)}",
        )

    try:
        selected, _ann_ret, _ann_vol, _bench = select_tickers_above_sml(
            returns, user_tickers, market, growth
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not selected:
        raise HTTPException(
            status_code=400, detail="No tickers are above the Security Market Line."
        )

    mc = run_monte_carlo(returns, selected, req.n_simulations)

    sharpe_arr = mc["sharpe"]
    optimal_idx = int(np.argmax(sharpe_arr))
    opt_weights = {t: float(w) for t, w in zip(selected, mc["weights"][optimal_idx])}

    cumulative = backtest_fixed_weights(returns, selected, opt_weights)

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
        "backtest": {
            "dates": [d.strftime("%Y-%m-%d") for d in cumulative.index],
            "cumulative_returns": cumulative.values.tolist(),
        },
        "metadata": {
            "n_simulations": req.n_simulations,
            "period": req.period,
            "benchmarks_used": {"market": market, "growth": growth},
        },
    }
