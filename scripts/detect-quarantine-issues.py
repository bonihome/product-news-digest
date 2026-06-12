#!/usr/bin/env python3
"""
隔离区问题探测 — newsofgift.com 质量仪表盘 §6
扫描 published-feed.json，探测三类「标记但不删」问题：
  C-1 系列页/分类页被多个单品共享（绿色，保留）
  C-2 根域名/分类页误当单品 URL（红色，待人工补）
  D   远程占位图 HEAD 探测（黄色/红色，看结果）

所有问题**只标记、不改数据**。等下次大扫除统一处理。
"""
import json
import sys
import urllib.request
import urllib.error
import ssl
from collections import defaultdict, Counter
from datetime import datetime
from pathlib import Path

FEED_PATH = Path("/srv/product-news-digest/data/runtime/published-feed.json")
TIMEOUT = 6  # HEAD 请求超时
MAX_REMOTE_PROBE = 30  # 最多探测 30 条远程图，避免被反爬拖死

# 分类页/系列页 URL 模式（C-1 绿名单）
COLLECTION_PATTERNS = [
    "/fashion/collection/",
    "/fashion/handbags/",
    "/fashion/womens-fashion",
    "/fashion-jewellery/",
    "/accessories/",
    "/watches/",
    "/fragrance/",
    "/products/",
    "categories/",
    "new-arrivals",
    "all-shoes",
    "discover/",
    "whats-new",
    "skincolor",
    "collection/",
    "/c/",
    "Products",
    "/home",
    "himalaya",
    "h08",
    "W049",  # Hermes 共有 H08 表链
]

# 根域名/主页模式（C-2 红名单 — 错把根域名当单品 URL）
ROOT_DOMAIN_PATTERNS = [
    "www.lamer.com.cn/",
    "www.lancome.com.cn/",
    "www.shuuemura.com.cn/",
    "www.sonystyle.com.cn/",
    "www.esteelauder.com.cn/",
    "www.cledepeau-beaute.com.cn/",
    "www.kolonsport.com/",
    "www.chanel.cn/cn/fragrance/",  # 根域名级分类页
]

def classify_repeat_url(url: str, count: int) -> tuple[str, str]:
    """
    分类重复 URL：
      ('green', 'C-1 分类页/系列页语义清晰')
      ('yellow', 'C-1.5 共享但需要审视')
      ('red', 'C-2 根域名/分类页误当单品 URL')
    """
    u = url.lower()
    # 根域名/主页 → 红色
    for pat in ROOT_DOMAIN_PATTERNS:
        if pat.lower() in u:
            return ("red", f"根域名/主页级 URL 误当单品 (匹配 {pat})")
    # 明显系列页/分类页 → 绿色
    for pat in COLLECTION_PATTERNS:
        if pat.lower() in u:
            return ("green", f"分类页/系列页（{count} 个单品共享）")
    # 其它重复 → 黄色（需人工审视）
    return ("yellow", f"未明确分类的 {count}x 重复")

def probe_remote_image(url: str) -> dict:
    """
    对远程图发 HEAD 请求，探测真实状态。
    返回 { url, status, content_type, content_length, verdict }
    verdict: 'ok' / 'placeholder' / 'unreachable' / 'forbidden' / 'not-image'
    """
    result = {
        "url": url,
        "status": None,
        "content_type": None,
        "content_length": None,
        "verdict": "unknown",
        "note": "",
    }
    try:
        # Akamai 友好的 UA
        req = urllib.request.Request(
            url, method="HEAD",
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Accept": "image/*,*/*;q=0.8",
            },
        )
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            result["status"] = resp.status
            result["content_type"] = resp.headers.get("Content-Type", "")
            cl = resp.headers.get("Content-Length")
            result["content_length"] = int(cl) if cl and cl.isdigit() else None

            # 判定
            ct = (result["content_type"] or "").lower()
            if "image" not in ct:
                result["verdict"] = "not-image"
                result["note"] = f"Content-Type={ct} 不是图片"
            elif result["content_length"] is not None and result["content_length"] < 1000:
                result["verdict"] = "placeholder"
                result["note"] = f"Content-Length={result['content_length']} 字节过小（疑似占位）"
            else:
                result["verdict"] = "ok"
                result["note"] = f"{result['content_length']} 字节 {ct}"
    except urllib.error.HTTPError as e:
        result["status"] = e.code
        if e.code in (403, 407):
            result["verdict"] = "forbidden"
            result["note"] = f"HTTP {e.code}（Akamai 反爬/WAF）"
        elif e.code == 404:
            result["verdict"] = "unreachable"
            result["note"] = "HTTP 404 资源不存在"
        else:
            result["verdict"] = "unreachable"
            result["note"] = f"HTTP {e.code}"
    except urllib.error.URLError as e:
        result["verdict"] = "unreachable"
        result["note"] = f"网络错误: {str(e.reason)[:60]}"
    except (TimeoutError, ssl.SSLError, ssl.CertificateError) as e:
        result["verdict"] = "unreachable"
        result["note"] = f"超时/SSL: {str(e)[:60]}"
    except Exception as e:
        result["verdict"] = "unreachable"
        result["note"] = f"异常: {type(e).__name__}: {str(e)[:60]}"
    return result

def main():
    md_mode = "--md" in sys.argv
    md_path = None
    if md_mode:
        for i, arg in enumerate(sys.argv):
            if arg == "--md" and i + 1 < len(sys.argv):
                md_path = sys.argv[i + 1]
                break

    data = json.loads(FEED_PATH.read_text())
    stories = data["stories"]
    N = len(stories)

    out = []
    out.append("=" * 70)
    out.append("🚧 隔离区问题清单 — newsofgift.com 质量仪表盘 §6")
    out.append("=" * 70)
    out.append(f"feed: {FEED_PATH}")
    out.append(f"扫描时间: {datetime.utcnow().isoformat()}Z")
    out.append(f"总条数: {N}")
    out.append("")
    out.append("📌 本清单只标记、不动数据。下次大扫除（backlog 抓取时）统一处理。")
    out.append("")

    # ============== C-1 / C-2 重复 sourceUrl 探测 ==============
    out.append("─" * 70)
    out.append("📂 §6.1 重复 sourceUrl 探测（32 组）")
    out.append("─" * 70)

    url_groups = defaultdict(list)
    for s in stories:
        u = s.get("sourceUrl", "")
        if u:
            url_groups[u].append(s)

    dups = {u: lst for u, lst in url_groups.items() if len(lst) > 1}

    green_groups = []
    red_groups = []
    yellow_groups = []
    for u, lst in dups.items():
        verdict, reason = classify_repeat_url(u, len(lst))
        if verdict == "green":
            green_groups.append((u, lst, reason))
        elif verdict == "red":
            red_groups.append((u, lst, reason))
        else:
            yellow_groups.append((u, lst, reason))

    # 绿色：保留
    out.append("")
    out.append(f"🟢 C-1 分类页/系列页共享（保留，{len(green_groups)} 组，共 {sum(len(l) for _,l,_ in green_groups)} 条新闻）")
    for u, lst, reason in sorted(green_groups, key=lambda x: -len(x[1])):
        out.append(f"   • {len(lst)}x  {u[:90]}")
        out.append(f"     → {reason}")
    out.append("")

    # 黄色：需审视
    if yellow_groups:
        out.append(f"🟡 未明确分类（{len(yellow_groups)} 组，{sum(len(l) for _,l,_ in yellow_groups)} 条新闻 — 待人工审视）")
        for u, lst, reason in sorted(yellow_groups, key=lambda x: -len(x[1])):
            out.append(f"   • {len(lst)}x  {u[:90]}")
            out.append(f"     → {reason}")
        out.append("")

    # 红色：根域名错位
    out.append(f"🔴 C-2 根域名/分类页误当单品 URL（{len(red_groups)} 组，{sum(len(l) for _,l,_ in red_groups)} 条新闻 — 待大扫除时处理）")
    for u, lst, reason in sorted(red_groups, key=lambda x: -len(x[1])):
        out.append(f"   ❌ {len(lst)}x  {u[:90]}")
        out.append(f"     → {reason}")
        for s in lst:
            out.append(f"        - {s.get('brand','')} | {s.get('title','')[:60]}")
    out.append("")

    # ============== D 远程占位图 HEAD 探测 ==============
    out.append("─" * 70)
    out.append(f"📂 §6.2 远程图 HEAD 探测（最多 {MAX_REMOTE_PROBE} 条）")
    out.append("─" * 70)

    remote_stories = [s for s in stories if (s.get("image", "") or "").startswith(("http://", "https://"))]
    out.append(f"远程图总数: {len(remote_stories)}")
    out.append(f"实际探测: {min(len(remote_stories), MAX_REMOTE_PROBE)} 条")
    out.append("")

    probes = []
    for i, s in enumerate(remote_stories[:MAX_REMOTE_PROBE]):
        if i % 5 == 0 and i > 0:
            out.append(f"  ... 进度 {i}/{min(len(remote_stories), MAX_REMOTE_PROBE)}")
        result = probe_remote_image(s.get("image", ""))
        result["story_id"] = s.get("id", "")
        result["brand"] = s.get("brand", "")
        result["title"] = s.get("title", "")[:50]
        probes.append(result)
        # 实时打印
        icon = {"ok": "✅", "placeholder": "🟡", "forbidden": "🔴",
                "unreachable": "🔴", "not-image": "🟡", "unknown": "❓"}.get(result["verdict"], "❓")
        out.append(f"  {icon} {result['story_id'][:32]:32s} [{result['verdict']:12s}] {result['note']}")
        out.append(f"     {s.get('image','')[:100]}")
    out.append("")

    # 探测结果汇总
    verdict_cnt = Counter(p["verdict"] for p in probes)
    out.append("探测结果汇总：")
    for v, c in verdict_cnt.most_common():
        out.append(f"  {v:15s}  {c} 条")
    out.append("")

    # 重点关注：forbidden + unreachable
    bad = [p for p in probes if p["verdict"] in ("forbidden", "unreachable")]
    if bad:
        out.append(f"🔴 重点：{len(bad)} 条图无法访问（forbidden/unreachable）— 需在下次抓取时本地化或替换")
        for p in bad:
            out.append(f"   • {p['brand']:20s} | {p['title']:50s} | {p['url'][:80]}")
        out.append("")

    # ============== 总结 ==============
    out.append("=" * 70)
    out.append("📋 隔离区总结")
    out.append("=" * 70)
    out.append(f"  C-1 绿（保留）:       {len(green_groups)} 组 / {sum(len(l) for _,l,_ in green_groups)} 条新闻")
    out.append(f"  C-1.5 黄（待审视）:   {len(yellow_groups)} 组 / {sum(len(l) for _,l,_ in yellow_groups)} 条新闻")
    out.append(f"  C-2 红（待补 URL）:   {len(red_groups)} 组 / {sum(len(l) for _,l,_ in red_groups)} 条新闻")
    out.append(f"  D   远程图（实测）:   {len(probes)} 条探测 / {verdict_cnt.get('ok',0)} OK / {verdict_cnt.get('forbidden',0)+verdict_cnt.get('unreachable',0)} 失败")
    out.append("")
    out.append("🎯 下次大扫除处理顺序建议：")
    out.append("   1. C-2 红名单 → 找官网单品 URL 替换（最高优先）")
    out.append("   2. D 失败图 → 本地化或换 Akamai 友好源")
    out.append("   3. C-1.5 黄名单 → 人工看每组，确认是 C-1 还是 C-2")
    out.append("")

    text = "\n".join(out)
    print(text)
    if md_path:
        Path(md_path).write_text(text)
        print(f"\n📝 Markdown 报告已写入: {md_path}")

if __name__ == "__main__":
    main()
