#!/usr/bin/env python3
import sys, json
from scrapling.fetchers import Fetcher

def fetch_url(url):
    """Fetch a URL via Scrapling and print the HTML to stdout."""
    f = Fetcher()
    resp = f.get(url)
    if resp and resp.status == 200:
        print(str(resp.body))
        return 0
    else:
        status = resp.status if resp else 0
        print(json.dumps({"error": "Scrapling fetch failed", "url": url, "status": status}))
        return 1

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python3 scrapling-fetch.py <url>"}))
        sys.exit(1)
    sys.exit(fetch_url(sys.argv[1]))
