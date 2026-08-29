#!/usr/bin/env python3
"""
scrapling-fetch.py — Fetch a URL via Scrapling and print HTML to stdout.

Modes:
  --html     (default)  Fast HTTP fetch via `Fetcher`
  --browser             Headless browser fetch via `StealthyFetcher` for SPA/JS-heavy pages

Usage:
  python3 scrapling-fetch.py <url>                   # HTML mode
  python3 scrapling-fetch.py --browser <url>          # Browser mode
"""
import sys, json
from scrapling.fetchers import Fetcher, StealthyFetcher


def fetch_html(url: str) -> int:
    """Plain HTTP fetch (fast, no JS render)."""
    f = Fetcher()
    resp = f.get(url)
    if resp and resp.status == 200:
        print(str(resp.body))
        return 0
    status = resp.status if resp else 0
    print(json.dumps({"error": "Scrapling fetch failed", "url": url, "status": status}))
    return 1


def fetch_browser(url: str, network_idle: bool = True, timeout_ms: int = 30000) -> int:
    """Headless browser fetch (renders JS, bypasses anti-bot)."""
    f = StealthyFetcher(auto_match=True)
    # Override page.goto timeout
    engine = f._engine if hasattr(f, '_engine') else None
    if engine:
        try:
            engine.context.set_default_timeout(timeout_ms)
        except Exception:
            pass
        try:
            engine.page.set_default_timeout(timeout_ms)
        except Exception:
            pass
    resp = f.fetch(url, headless=True, network_idle=network_idle)
    if resp and resp.status == 200:
        print(str(resp.body))
        return 0
    status = resp.status if resp else 0
    print(json.dumps({"error": "Scrapling browser fetch failed", "url": url, "status": status}))
    return 1


if __name__ == "__main__":
    args = sys.argv[1:]
    mode = "html"
    url = None
    network_idle = True
    timeout_ms = 30000

    for arg in args:
        if arg == "--browser":
            mode = "browser"
        elif arg == "--html":
            mode = "html"
        elif arg == "--no-network-idle":
            network_idle = False
        elif arg.startswith("--timeout="):
            try:
                timeout_ms = int(arg.split("=", 1)[1]) * 1000
            except ValueError:
                pass
        elif not arg.startswith("--"):
            url = arg

    if not url:
        print(json.dumps({"error": "Usage: python3 scrapling-fetch.py [--browser|--html] [--no-network-idle] [--timeout=seconds] <url>"}))
        sys.exit(1)

    if mode == "browser":
        sys.exit(fetch_browser(url, network_idle=network_idle, timeout_ms=timeout_ms))
    else:
        sys.exit(fetch_html(url))
