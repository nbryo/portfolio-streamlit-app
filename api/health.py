"""Vercel Serverless Function: GET /api/health.

Uses BaseHTTPRequestHandler (stdlib only) to keep this Lambda's cold start
and bundle size minimal — no FastAPI or numpy dependency here.
"""

from http.server import BaseHTTPRequestHandler
import json


class handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        body = json.dumps({"status": "ok"}).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
