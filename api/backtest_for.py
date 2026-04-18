"""Vercel Serverless Function: POST /api/backtest_for."""

from fastapi import FastAPI

from core.models import BacktestForRequest
from core.runner import run_backtest_for

app = FastAPI()


@app.post("/api/backtest_for")
def backtest_for(req: BacktestForRequest) -> dict:
    return run_backtest_for(req)
