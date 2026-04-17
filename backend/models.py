from typing import Literal

from pydantic import BaseModel, Field

Period = Literal["1mo", "3mo", "6mo", "1y", "2y", "3y", "4y", "5y"]


class Benchmarks(BaseModel):
    market: str = "SPY"
    growth: str = "^NYFANG"


class AnalyzeRequest(BaseModel):
    tickers: list[str] = Field(..., min_length=1)
    period: Period = "1y"
    n_simulations: int = Field(10000, ge=100, le=50000)
    benchmarks: Benchmarks = Field(default_factory=Benchmarks)
