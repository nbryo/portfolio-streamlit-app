# Portfolio Analysis App

Migration in progress: **Streamlit (`d6.py`) → FastAPI + Next.js**, destined for
single-URL Vercel deployment.

## Layout

```
portfolio-streamlit-app/
├── api/                # Vercel Python Functions (production)
│   ├── analyze.py          # FastAPI ASGI: POST /api/analyze
│   ├── backtest_for.py     # FastAPI ASGI: POST /api/backtest_for
│   ├── health.py           # BaseHTTPRequestHandler (no fastapi/numpy)
│   └── core/
│       ├── backtest.py     # per-day weight renormalization
│       ├── data.py         # batched yfinance fetch
│       ├── models.py       # Pydantic request/response
│       ├── portfolio.py    # vectorized Monte Carlo
│       ├── presets.py      # S&P500 (GitHub CSV) + NASDAQ100/Dow30/FANG+ + 7 hedges
│       ├── runner.py       # run_analyze / run_backtest_for — pure functions
│       └── sml.py          # 3-benchmark average SML filter
├── backend/            # Local FastAPI dev server (unchanged, uses its own core/)
├── frontend/           # Next.js 16 (App Router) + TS + Tailwind 4 + Plotly
├── requirements.txt    # Vercel-side Python deps (root)
├── vercel.json         # legacy builds config: frontend/ + api/*.py
└── d6.py               # original Streamlit app (kept for reference)
```

Note: `api/core/` and `backend/core/` are duplicates for now; keep both in sync
or factor a shared package later.

## Local dev

- **Backend**: `cd backend && uv run uvicorn main:app --reload` → `http://127.0.0.1:8000`
- **Frontend**: `npm run dev --prefix frontend` → `http://localhost:3000`
- Frontend uses `NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"` in dev, falls
  back to same-origin `""` in production.

## API

- `POST /api/analyze` → runs SML filter on equities, adds hedge assets unconditionally,
  runs Monte Carlo on selected, backtests with per-day NaN-aware weight renormalization.
- `POST /api/backtest_for` → re-runs backtest for a custom weight vector (used by the
  interactive scatter-plot selection on the frontend).
- `GET /api/health` → `{"status":"ok"}`.

## Completed (this session)

- Streamlit → FastAPI refactor, `uv`-managed Python env
- Next.js + TypeScript + Tailwind + Plotly.js frontend (3 charts)
- 4 index presets (S&P500 via GitHub CSV, NASDAQ100/Dow30/FANG+ hardcoded)
  + 7 hedge assets (gold/silver/crypto/2x bonds/REIT/commodity) that bypass SML
- 3-benchmark average SML (SPY+QQQ+^NYFANG), rf=0 slope through origin
- Interactive scatter: click → recompute metrics, allocation, per-portfolio backtest
- Backtest handles short-history tickers (e.g. IBIT from 2024) via per-day weight
  renormalization; common-period dropna only for Monte Carlo
- Full Japanese localization (UI + chart axes/legends/hovers)
- Bloomberg-style sticky header, refined to Stripe/Linear-quality professional UI
  (flat cards w/ left-border accent, muted gradients on buttons, no emoji,
  tabular-nums, Noto Sans JP)
- Mobile responsive (preset row horizontal scroll, pie legend below on mobile
  via `useIsMobile`, responsive chart heights)
- Pie chart: clockwise descending from 12 o'clock, inside labels for ≥3%,
  side legend desktop / bottom mobile
- Vercel single-deployment restructure: `api/` Python Functions + `frontend/`
  Next.js share one URL

## Next up

- Run `vercel deploy` from repo root
- Verify production: cold-start time, S&P500 end-to-end < 60s, chart interactivity
- Optimize if needed (trim deps, lazy-import yfinance, cache S&P500 constituents CSV)

## Gotchas

- Working directory has a full-width space in the path (`渡邊　涼介`). Do not `cd`
  into it from bash — prefer absolute paths or stay in the project root.
- `frontend/AGENTS.md` warns Next.js 16 has breaking changes vs training data;
  consult `frontend/node_modules/next/dist/docs/` when unsure.
- Backend is usually already running in a separate terminal (user-managed); don't
  start/stop it yourself.
