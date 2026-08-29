#!/usr/bin/env python3
"""
generate-brand-logo.py — 生成品牌纯文字 Logo SVG
当 pipeline 和截图都拿不到图时，用品牌名 SVG 作为最后兜底。

用法: python3 scripts/generate-brand-logo.py <brand-name>
输出: /srv/product-news-digest/public/news/logos/<slug>.svg
"""
import sys, os, hashlib, textwrap

LOGOS_DIR = "/srv/product-news-digest/public/news/logos"

# 品牌主色调映射（用于 Logo 背景色）
BRAND_COLORS: dict[str, str] = {
    "chanel": "#000000",
    "louis vuitton": "#8B6914",
    "gucci": "#1B4D3E",
    "hermes": "#FF6B00",
    "dior": "#000080",
    "prada": "#000000",
    "fendi": "#F4C542",
    "cartier": "#B22222",
    "tiffany": "#81D8D0",
    "bvlgari": "#8B4513",
    "burberry": "#8B4513",
    "balenciaga": "#000000",
    "bottega veneta": "#2E8B57",
    "celine": "#000000",
    "valentino": "#B22222",
    "saint laurent": "#000000",
    "van cleef": "#1B7A3D",
    "alexander mcqueen": "#000000",
    "audemars piguet": "#000000",
    "chopard": "#C9A84C",
    "longines": "#003399",
    "omega": "#B22222",
    "rolex": "#006039",
    "miu miu": "#000000",
    "nike": "#000000",
    "adidas": "#000000",
    "asics": "#0066CC",
    "descente": "#000000",
    "mizuno": "#000099",
    "on": "#000000",
    "wilson": "#B22222",
    "yonex": "#006600",
    "kolon sport": "#1B5E20",
    "arc'teryx": "#000000",
    "apple": "#000000",
    "samsung": "#1428A0",
    "huawei": "#CF0A2C",
    "xiaomi": "#FF6900",
    "honor": "#0866FF",
    "oppo": "#1EA446",
    "vivo": "#415FFF",
    "lenovo": "#E2231A",
    "microsoft": "#00A4EF",
    "sony": "#000000",
    "rog": "#FF0000",
    "nvidia": "#76B900",
    "sonos": "#000000",
    "est\u00e9e lauder": "#1A1A6B",
    "lanc\u00f4me": "#B8860B",
    "la mer": "#006B54",
    "kiehl's": "#8B0000",
    "clinique": "#426B65",
    "shiseido": "#B22222",
    "shu uemura": "#000000",
    "nars": "#000000",
    "bobbi brown": "#000000",
    "charlotte tilbury": "#8B1A1A",
    "yves saint laurent": "#000000",
    "prada beauty": "#000000",
    "dior beauty": "#000080",
    "chanel beauty": "#000000",
    "herm\u00e8s beauty": "#FF6B00",
    "givenchy beauty": "#000000",
    "proya": "#003399",
    "maogeping": "#B22222",
    "chando": "#5B8C5A",
    "winona": "#8B0000",
    "cle de peau": "#B8860B",
    "ipsa": "#000000",
    "lego": "#E3000B",
    "y8": "#FF6600",
    "gamepix": "#1A5276",
    "poki": "#2E86C1",
    "pacogames": "#117A65",
    "crazygames": "#8E44AD",
    "arcadrome": "#D35400",
    "deepseek": "#4A90D9",
    "openai": "#10A37F",
    "google": "#4285F4",
    "anthropic": "#D4A76A",
    "xai": "#000000",
    "kimi": "#5B2C82",
    "zhipu": "#2A82D2",
    "minimax": "#00B0F0",
    "microsoft copilot": "#0078D4",
}

def slugify(name: str) -> str:
    return name.lower().replace("'", "").replace("&", "and").replace(" ", "-").replace(".", "")

def get_initials(brand: str) -> str:
    """提取品牌名缩写"""
    # 特殊品牌缩写
    special = {
        "louis vuitton": "LV",
        "van cleef & arpels": "VCA",
        "ysl beauty": "YSL",
        "hermès beauty": "H",
        "hermes": "H",
        "chanel beauty": "CHANEL",
        "dior beauty": "DIOR",
        "prada beauty": "PRADA",
        "givenchy beauty": "GVC",
        "microsoft surface": "SURFACE",
        "microsoft copilot": "COPILOT",
        "alexander mcqueen": "AMQ",
        "bottega veneta": "BV",
        "saint laurent": "SL",
        "clé de peau beauté": "CPB",
        "estée lauder": "EL",
        "la mer": "LM",
        "shu uemura": "SU",
        "kolon sport": "KS",
        "van cleef & arpels": "VCA",
    }
    if brand.lower() in special:
        return special[brand.lower()]
    # 默认取首字母
    words = brand.split()
    if len(words) >= 2:
        return "".join(w[0].upper() for w in words[:2])
    return brand[:2].upper()

def generate_logo(brand: str, slug: str, color: str) -> str:
    initials = get_initials(brand)
    display_name = brand
    
    # 字体大小根据名称长度调整
    if len(initials) <= 2:
        font_size = 48
    elif len(initials) <= 4:
        font_size = 36
    else:
        font_size = 24

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="300" height="200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{color};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:{color}dd;stop-opacity:1"/>
    </linearGradient>
  </defs>
  <rect width="300" height="200" rx="12" fill="url(#bg)"/>
  <text x="150" y="95" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui,-apple-system,sans-serif" font-weight="700"
        font-size="{font_size}" fill="white" letter-spacing="2">
    {initials}
  </text>
  <text x="150" y="155" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui,-apple-system,sans-serif" font-weight="400"
        font-size="11" fill="rgba(255,255,255,0.7)">
    {display_name}
  </text>
</svg>'''
    return svg

def main():
    if len(sys.argv) < 2:
        print("Usage: generate-brand-logo.py <brand-name> [brand-name ...]")
        sys.exit(1)

    os.makedirs(LOGOS_DIR, exist_ok=True)
    
    for brand in sys.argv[1:]:
        slug = slugify(brand)
        color = BRAND_COLORS.get(brand.lower(), "#333333")
        svg = generate_logo(brand, slug, color)
        path = os.path.join(LOGOS_DIR, f"{slug}.svg")
        with open(path, "w") as f:
            f.write(svg)
        print(f"  ✅ {brand:30s} -> logos/{slug}.svg")

    # 复制到 dist/news/logos（nginx root）
    dist_dir = "/srv/product-news-digest/dist/news/logos"
    os.makedirs(dist_dir, exist_ok=True)
    import shutil
    for f in os.listdir(LOGOS_DIR):
        shutil.copy2(os.path.join(LOGOS_DIR, f), os.path.join(dist_dir, f))
    print(f"\nCopied {len(os.listdir(LOGOS_DIR))} logos to dist/news/logos/")

if __name__ == "__main__":
    main()
