from typing import Literal

from pydantic import BaseModel, Field

Period = Literal["1mo", "3mo", "6mo", "1y", "2y", "3y", "4y", "5y"]
Preset = Literal["sp500", "nasdaq100", "fang_plus", "dow30", "custom"]


class AnalyzeRequest(BaseModel):
    preset: Preset = "custom"
    custom_tickers: list[str] = Field(default_factory=list)
    hedge_assets: list[str] = Field(default_factory=list)
    period: Period = "1y"
    n_simulations: int = Field(10000, ge=100, le=50000)
    benchmarks: list[str] = Field(
        default_factory=lambda: ["SPY", "QQQ", "^NYFANG"]
    )


class BacktestForRequest(BaseModel):
    tickers: list[str] = Field(..., min_length=1)
    weights: list[float] = Field(..., min_length=1)
    period: Period = "1y"
