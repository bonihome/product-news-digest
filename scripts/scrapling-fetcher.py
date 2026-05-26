#!/usr/bin/env python3
import json, sys, os, argparse, time, re
from urllib.parse import urljoin
from scrapling.fetchers import Fetcher

try:
    from scrapling import __version__ as sc_version
except:
    sc_version = "unknown"

BRAND_CONFIGS = {
    "lv-prefall": {
        "brand": "Louis Vuitton", "category": "luxury", "subcategory": "服装",
        "urls": [("https://www.louisvuitton.cn/zhs-cn/new/for-men/pre-fall-2026/_/N-t1t8llmn",
                  ".lv-product-card__name a", "服装")],
    },
    "dior-beauty": {
        "brand": "Dior Beauty", "category": "beauty", "subcategory": "护肤",
        "urls": [("https://www.dior.com/en_us/beauty/page/whats-new.html",
                  "a.product-tile__link, .product-name, h2.product-title", "护肤")],
    },
    "prada-women": {
        "brand": "Prada", "category": "luxury", "subcategory": "皮包",
        "urls": [("https://www.prada.cn/cn/zh/womens/new-in/c/10111CN",
                  ".product-item a, a[href*=\"/p/\"]", "皮包")],
    },
}

def extract_items(resp, selector, max_items=15):
    if not resp or resp.status != 200:
        return []
    elements = resp.css(selector)
    items = []
    seen = set()
    for el in elements:
        text = el.extract_first()
        href = el.attrib.get("href", "") if hasattr(el, "attrib") else ""
        text_clean = re.sub(r"<[^>]+>", "", text).strip() if text else ""
        if not text_clean or len(text_clean) < 3:
            continue
        key = text_clean + href
        if key in seen:
            continue
        seen.add(key)
        items.append({
            "title": text_clean,
            "url": urljoin(resp.url, href) if href else "",
            "href": href,
        })
        if len(items) >= max_items:
            break
    return items

def fetch_brand(brand_key, config):
    f = Fetcher()
    results = []
    for url, selector, subcategory in config["urls"]:
        try:
            resp = f.get(url)
            items = extract_items(resp, selector)
            results.append({
                "url": url,
                "status": resp.status if resp else 0,
                "subcategory": subcategory,
                "items": items
            })
            short = url.split("/")[-1][:25]
            sys.stderr.write("  %s: status=%s items=%d\n" % (short, resp.status if resp else 0, len(items)))
        except Exception as e:
            sys.stderr.write("  ERROR: %s\n" % str(e))
            results.append({"url": url, "status": -1, "error": str(e), "items": []})
    return {
        "brand": config["brand"],
        "category": config["category"],
        "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "results": results,
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="/tmp/scrapling-results.json")
    parser.add_argument("--brands", nargs="*")
    args = parser.parse_args()
    brands_to_fetch = args.brands or list(BRAND_CONFIGS.keys())
    all_results = {"scrapling_version": sc_version, "brands": {}}
    for brand_key in brands_to_fetch:
        if brand_key not in BRAND_CONFIGS:
            continue
        c = BRAND_CONFIGS[brand_key]
        sys.stderr.write("Fetching " + c["brand"] + "...\n")
        all_results["brands"][brand_key] = fetch_brand(brand_key, c)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    sys.stderr.write("Done: " + args.output + "\n")

if __name__ == "__main__":
    main()
