"""Generate PWA icons for the Portfolio Analysis app.

Produces four PNGs under frontend/public/:
  icon-192.png          192x192, iOS-rounded square
  icon-512.png          512x512, iOS-rounded square
  icon-180.png          180x180, iOS apple-touch-icon
  icon-512-maskable.png 512x512, full-bleed bg, content in 80% safe area

Run from the repo root:
  backend/.venv/Scripts/python.exe scripts/generate_icons.py

Uses Pillow + numpy only — no cairo/native deps, Windows-safe.
"""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "frontend" / "public"

# Colors
BG_FROM = "#1e3a8a"
BG_TO = "#3b0764"
CURVE_STOPS = [
    (0.0, "#06b6d4"),
    (0.5, "#10b981"),
    (1.0, "#fbbf24"),
]
SCATTER_COLORS = ["#06b6d4", "#22d3ee", "#10b981", "#34d399", "#facc15", "#fbbf24"]
STAR_COLOR = "#fbbf24"


def hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def make_bg_gradient(size: int) -> Image.Image:
    """Diagonal (top-left -> bottom-right) gradient."""
    c1 = np.array(hex_to_rgb(BG_FROM), dtype=np.float32)
    c2 = np.array(hex_to_rgb(BG_TO), dtype=np.float32)
    ys, xs = np.mgrid[0:size, 0:size].astype(np.float32)
    t = ((xs + ys) / (2 * (size - 1))).reshape(size, size, 1)
    rgb = (c1 + (c2 - c1) * t).astype(np.uint8)
    a = np.full((size, size, 1), 255, dtype=np.uint8)
    arr = np.concatenate([rgb, a], axis=-1)
    return Image.fromarray(arr, mode="RGBA")


def rounded_alpha_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return mask


def quad_bezier(p0, p1, p2, n: int = 60):
    pts = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        x = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0]
        y = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]
        pts.append((x, y))
    return pts


def gradient_at(t: float, stops):
    t = max(0.0, min(1.0, t))
    for i in range(len(stops) - 1):
        o0, c0 = stops[i]
        o1, c1 = stops[i + 1]
        if o0 <= t <= o1:
            if o1 == o0:
                return c0
            local = (t - o0) / (o1 - o0)
            return tuple(int(c0[j] + (c1[j] - c0[j]) * local) for j in range(3))
    return stops[-1][1]


def draw_gradient_polyline(img: Image.Image, points, stops_rgb, width: int):
    if len(points) < 2:
        return
    d = ImageDraw.Draw(img, "RGBA")
    r = max(width // 2, 1)
    n = len(points) - 1
    for i in range(n):
        t = i / n
        color = gradient_at(t, stops_rgb) + (255,)
        p1 = points[i]
        p2 = points[i + 1]
        d.line([p1, p2], fill=color, width=width)
        # Round the joint so adjacent segments blend smoothly.
        d.ellipse([p1[0] - r, p1[1] - r, p1[0] + r, p1[1] + r], fill=color)
    last = points[-1]
    last_color = gradient_at(1.0, stops_rgb) + (255,)
    d.ellipse([last[0] - r, last[1] - r, last[0] + r, last[1] + r], fill=last_color)


def draw_frontier_curve(img: Image.Image, size: int, stroke_width: int):
    """Smooth curve from bottom-left to top-right in a 512-grid, scaled to `size`."""
    s = size / 512
    p0 = (80 * s, 420 * s)
    p1 = (200 * s, 380 * s)
    p2 = (260 * s, 260 * s)
    # SVG T command: reflect previous control around current endpoint.
    cp2 = (2 * p2[0] - p1[0], 2 * p2[1] - p1[1])
    p3 = (440 * s, 100 * s)

    pts1 = quad_bezier(p0, p1, p2, n=80)
    pts2 = quad_bezier(p2, cp2, p3, n=80)
    all_pts = pts1 + pts2[1:]

    stops_rgb = [(off, hex_to_rgb(c)) for off, c in CURVE_STOPS]
    draw_gradient_polyline(img, all_pts, stops_rgb, stroke_width)
    return all_pts


def draw_scatter(img: Image.Image, all_pts, size: int):
    d = ImageDraw.Draw(img, "RGBA")
    s = size / 512
    n = len(all_pts)
    # Five evenly-spaced points along the curve. Skip the very ends so the
    # last point doesn't collide with the star in the top-right.
    indices = [int(n * i / 6) for i in range(1, 6)]
    base_radii_512 = [10, 10, 10, 11, 11]
    for idx, col_hex, base_r in zip(indices, SCATTER_COLORS, base_radii_512):
        idx = min(idx, n - 1)
        x, y = all_pts[idx]
        r = base_r * s
        col = hex_to_rgb(col_hex) + (255,)
        # White ring pops the dot off the curve.
        d.ellipse([x - r - 1.5, y - r - 1.5, x + r + 1.5, y + r + 1.5], fill=(255, 255, 255, 230))
        d.ellipse([x - r, y - r, x + r, y + r], fill=col)


def draw_star(img: Image.Image, size: int):
    """8-point star in the top-right corner, clear of the frontier curve."""
    s = size / 512
    cx, cy = 410 * s, 95 * s
    outer_r = 52 * s
    inner_r = 20 * s  # ratio ~2.6 — sharp, unambiguous star
    pts = []
    for i in range(16):
        # Start pointing up (90°) and step clockwise; alternate outer/inner.
        angle = math.pi / 2 - (i * math.pi / 8)
        r = outer_r if i % 2 == 0 else inner_r
        pts.append((cx + r * math.cos(angle), cy - r * math.sin(angle)))
    d = ImageDraw.Draw(img, "RGBA")
    d.polygon(pts, fill=hex_to_rgb(STAR_COLOR) + (255,))


def render(size: int, rounded: bool, safe_area: float) -> Image.Image:
    """Render an icon. If safe_area < 1.0, draw content into that fraction of
    the canvas over a full-bleed background (for maskable icons)."""
    bg = make_bg_gradient(size)

    if safe_area < 1.0:
        # Full-bleed bg + smaller inner canvas
        inner_size = int(size * safe_area)
        inner = Image.new("RGBA", (inner_size, inner_size), (0, 0, 0, 0))
        stroke = max(round(14 * inner_size / 512), 3)
        all_pts = draw_frontier_curve(inner, inner_size, stroke)
        draw_scatter(inner, all_pts, inner_size)
        draw_star(inner, inner_size)
        offset = (size - inner_size) // 2
        bg.paste(inner, (offset, offset), inner)
        return bg

    # Draw content directly on bg
    stroke = max(round(14 * size / 512), 3)
    all_pts = draw_frontier_curve(bg, size, stroke)
    draw_scatter(bg, all_pts, size)
    draw_star(bg, size)

    if rounded:
        radius = int(size * 0.225)
        mask = rounded_alpha_mask(size, radius)
        bg.putalpha(mask)

    return bg


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    outputs = {
        "icon-512.png": render(512, rounded=True, safe_area=1.0),
        "icon-192.png": render(192, rounded=True, safe_area=1.0),
        "icon-180.png": render(180, rounded=True, safe_area=1.0),
        "icon-512-maskable.png": render(512, rounded=False, safe_area=0.8),
    }
    for name, img in outputs.items():
        path = OUT_DIR / name
        img.save(path, format="PNG", optimize=True)
        print(f"  wrote {path.relative_to(ROOT)} ({path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
