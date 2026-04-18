# Portfolio Analysis API

FastAPI backend for portfolio analysis (effective frontier, SML filtering, Monte Carlo, backtest).
Returns JSON only — the frontend (Next.js) handles rendering.

## Setup (uv)

Prerequisite: [uv](https://docs.astral.sh/uv/) installed (`winget install astral-sh.uv` on Windows).

```bash
cd backend
uv venv --python 3.10
uv sync                 # installs dependencies from pyproject.toml + uv.lock
cp .env.example .env
```

Adding dependencies later:
```bash
uv add <package>
```

## Run

```bash
uv run uvicorn main:app --reload
```

## Deploy (Render etc.)

`pyproject.toml` + `uv.lock` are the source of truth. `requirements.txt` is regenerated
as a fallback for platforms that don't yet support uv:

```bash
uv pip compile pyproject.toml -o requirements.txt
```

- API: http://127.0.0.1:8000
- Interactive docs: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

## Endpoint

### `POST /api/analyze`

Request:
```json
{
  "tickers": ["AAPL", "MSFT", "NVDA"],
  "period": "5y",
  "n_simulations": 10000,
  "benchmarks": { "market": "SPY", "growth": "^NYFANG" }
}
```

Response (shape):
```json
{
  "scatter": { "risk": [...], "return": [...], "sharpe": [...] },
  "optimal": {
    "weights": {"AAPL": 0.4, ...},
    "return": 0.32, "risk": 0.22, "sharpe": 1.45, "max_drawdown": -0.18
  },
  "filtered_tickers": ["AAPL", "NVDA"],
  "backtest": { "dates": ["2021-01-04", ...], "cumulative_returns": [1.0, ...] },
  "metadata": { "n_simulations": 10000, "period": "5y", "benchmarks_used": {...} }
}
```

## Layout

```
backend/
├── core/
│   ├── data.py        # Yahoo Finance fetch + daily returns
│   ├── sml.py         # Security Market Line filter
│   ├── portfolio.py   # Vectorized Monte Carlo + drawdown
│   └── backtest.py    # Fixed-weights backtest
├── models.py          # Pydantic request schema
├── main.py            # FastAPI app, CORS, /api/analyze
├── pyproject.toml     # uv-managed project + dependencies
├── uv.lock            # locked dependency versions
├── requirements.txt   # fallback for Render (regenerated via uv pip compile)
├── .env.example
└── README.md
```
