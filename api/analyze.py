"""Vercel Serverless Function: POST /api/analyze.

Thin ASGI wrapper — Vercel detects `app` and runs it. Business logic lives in
`core.runner.run_analyze` so this stays tiny.
"""

from fastapi import FastAPI

from core.models import AnalyzeRequest
from core.runner import run_analyze

app = FastAPI()


@app.post("/api/analyze")
def analyze(req: AnalyzeRequest) -> dict:
    return run_analyze(req)
