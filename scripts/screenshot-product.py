#!/usr/bin/env python3
"""
screenshot-product.py — 用 Playwright/Patchright 获取产品页面截图

用于 pipeline 图片回退：当官网 HTML 中提取不到产品图时，直接用浏览器渲染
产品页面并截图保存。

用法:
  python3 scripts/screenshot-product.py <source-url> <output-path> [--brand <brand>]
  
输出: JSON {ok: true, path: "/runtime/news-images/...", width: N, height: N}
      或 {ok: false, error: "..."}
"""
import sys, json, os, time, hashlib
from pathlib import Path
from urllib.parse import urlparse


def is_listing_or_homepage(url: str) -> bool:
    """判断 URL 是否是列表页/首页（这类页面不应截图，应留空走 logo 兜底）。

    产品页 URL 含具体产品标识（SKU/型号/slug），列表页/首页是分类/系列/新品列表，
    或域名根路径。截列表页/首页会产生"跨产品乱配"的错误图（如 Sony 两个产品共用
    同一个 sonystyle.com.cn 首页截图）。
    """
    path = urlparse(url).path.lower().rstrip('/')

    # 首页/根路径
    if path in ('', '/'):
        return True

    # index.html 结尾通常是列表页/首页（如 sonystyle 的 /products/xxx/index.html）
    if path.endswith('index.html'):
        return True

    # 明显的列表页/分类页关键词
    listing_markers = [
        '/new-arrivals', '/new-in', '/new/', '/the-latest',
        '/categories', '/category', '/collections', '/collection',
        '/featured', '/all-', '/shop', '/search', '/list',
        '/w/',   # Nike 列表页格式 /w/slug
        '/c/',   # 分类页（如 Miu Miu /cn/zh/new-arrivals/bags/c/10201CN）
    ]
    for marker in listing_markers:
        if marker in path:
            return True

    return False


def screenshot(url: str, output_path: str, brand: str = "") -> dict:
    """Take a screenshot of the product page and save it."""
    # 列表页/首页不截图：留空让前端品牌 logo 兜底，避免生成"列表页截图"错误图
    if is_listing_or_homepage(url):
        return {"ok": False, "error": "listing/homepage URL, skip screenshot (use logo fallback)"}

    try:
        from patchright.sync_api import sync_playwright
    except ImportError:
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            return {"ok": False, "error": "Playwright/Patchright not installed"}

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
            ]
        )
        context = browser.new_context(
            viewport={"width": 1200, "height": 900},
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/136.0.0.0 Safari/537.36"
            ),
            locale="zh-CN",
        )
        page = context.new_page()
        
        try:
            page.goto(url, wait_until="networkidle", timeout=30000)
            time.sleep(1.5)  # Wait for lazy-load images
            
            # Try to find a product image first
            product_img = page.evaluate("""() => {
                // Common product image selectors
                const selectors = [
                    'img[data-src]', 'img[data-original]', 'img[srcset]',
                    '.product-image img', '.product-img img', '.gallery img',
                    '.pdp-image img', '.main-image img', '.hero-image img',
                    'meta[property="og:image"]',
                    'img[class*="product"]', 'img[class*="main"]',
                    'img[class*="hero"]', 'img[class*="gallery"]',
                    'picture img', 'figure img',
                ]
                for (let i = 0; i < selectors.length; i++) {
                    try {
                        let el = document.querySelector(selectors[i])
                        if (el) {
                            if (el.tagName === 'META') return el.getAttribute('content')
                            let src = el.src || el.getAttribute('data-src') || el.getAttribute('data-original')
                            if (src && src.startsWith('http')) return src
                        }
                    } catch(e) {}
                }
                // Fallback: find largest visible img
                let imgs = [...document.querySelectorAll('img')]
                    .filter(i => i.naturalWidth > 200 && i.src.startsWith('http'))
                    .sort((a,b) => b.naturalWidth - a.naturalWidth)
                return imgs.length > 0 ? imgs[0].src : null
            }""")
            
            if product_img:
                # Try to download the image directly
                import urllib.request
                try:
                    req = urllib.request.Request(product_img, headers={
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                        'Referer': url,
                    })
                    with urllib.request.urlopen(req, timeout=15) as resp:
                        data = resp.read()
                        if len(data) > 5000:
                            ext = product_img.split('?')[0].split('.')[-1].lower()
                            if ext not in ('jpg','jpeg','png','webp'):
                                ext = 'jpg'
                            os.makedirs(os.path.dirname(output_path), exist_ok=True)
                            with open(output_path, 'wb') as f:
                                f.write(data)
                            return {
                                "ok": True,
                                "path": output_path,
                                "method": "direct-download",
                                "source": product_img,
                                "size": len(data),
                            }
                except Exception:
                    pass
            
            # Fallback: full page screenshot
            page.set_viewport_size({"width": 1200, "height": 1600})
            
            # Scroll to ensure lazy images load
            page.evaluate("window.scrollTo(0, 100)")
            time.sleep(0.5)
            page.evaluate("window.scrollTo(0, 300)")
            time.sleep(0.5)
            
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            page.screenshot(path=output_path, full_page=False, type='jpeg', quality=85)
            
            return {
                "ok": True,
                "path": output_path,
                "method": "page-screenshot",
                "source": url,
            }
            
        except Exception as e:
            return {"ok": False, "error": str(e)}
        finally:
            browser.close()


def main():
    if len(sys.argv) < 3:
        print(json.dumps({"ok": False, "error": "Usage: screenshot-product.py <url> <output-path> [--brand BRAND]"}))
        sys.exit(1)
    
    url = sys.argv[1]
    output_path = sys.argv[2]
    brand = sys.argv[4] if len(sys.argv) > 4 and sys.argv[3] == '--brand' else ""
    
    result = screenshot(url, output_path, brand)
    print(json.dumps(result, ensure_ascii=False))
    sys.exit(0 if result.get("ok") else 1)


if __name__ == "__main__":
    main()
