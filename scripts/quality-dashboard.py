#!/usr/bin/env python3
"""
方案 B 质量仪表盘 — newsofgift.com
扫描 published-feed.json，输出 6 个维度的质量指标：
  1. 基础库存（总条数 / 类别分布 / 品牌 Top10）
  2. 方案 B 一致性校验（title vs sourceUrl slug）
  3. 图片健康（缺图 / 占位图 / 远程外链 vs 本地）
  4. 来源可信度（sourceType 分布 + 重复 sourceUrl 探测）
  5. 时序健康（checkedAt 滞后 / publishedAt 集中爆发）
  6. 隔离区问题清单（重复 URL 分级 / 远程图 HEAD 探测）

输出：纯文本报告到 stdout + Markdown 摘要到 --md 指定的文件
"""
import argparse
import json
import re
import sys
import urllib.request
import urllib.error
import ssl
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

FEED_PATH = Path("/srv/product-news-digest/data/runtime/published-feed.json")
HEAD_TIMEOUT = 6
MAX_REMOTE_PROBE = 30

STOPWORDS = {
    "the","and","for","with","from","into","onto","this","that","these","those",
    "new","launch","launches","launched","introducing","introduce",
    "official","site","page","home","news","today","update","updates",
    "推出","新品","扩展","继续","阵容","联动","完善",
}
COLLECTION_PATTERNS = [
    "/fashion/collection/", "/fashion/handbags/", "/fashion/womens-fashion",
    "/fashion-jewellery/", "/accessories/", "/watches/", "/fragrance/",
    "/products/", "categories/", "new-arrivals", "all-shoes", "discover/",
    "whats-new", "skincolor", "collection/", "/c/", "Products", "/home",
    "himalaya", "h08", "W049",
]
ROOT_DOMAIN_PATTERNS = [
    "www.lamer.com.cn/", "www.lancome.com.cn/", "www.shuuemura.com.cn/",
    "www.sonystyle.com.cn/", "www.esteelauder.com.cn/",
    "www.cledepeau-beaute.com.cn/", "www.kolonsport.com/",
    "www.chanel.cn/cn/fragrance/",
]

def english_words_4plus(text: str) -> list[str]:
    return [w for w in re.findall(r"[A-Za-z]{4,}", text or "")]

def check_plan_b(story: dict) -> tuple[bool, list[str]]:
    title = story.get("title","") or ""
    url = story.get("sourceUrl","") or ""
    if not url:
        return False, ["<missing sourceUrl>"]
    slug = url.rstrip("/").split("/")[-1].lower()
    brand = (story.get("brand","") or "").lower()
    words = english_words_4plus(title)
    miss = []
    for w in words:
        wl = w.lower()
        if wl in STOPWORDS:
            continue
        if brand and wl in brand.lower():
            continue
        if wl not in slug:
            miss.append(w)
    return (len(miss) == 0), miss

def is_placeholder_image(image_path: str) -> bool:
    if not image_path:
        return False
    p = image_path.lower()
    return any(k in p for k in ("placeholder","default","missing","no-image","noimage","fallback","blank","gray"))

def classify_repeat_url(url: str, count: int) -> tuple[str, str]:
    u = url.lower()
    for pat in ROOT_DOMAIN_PATTERNS:
        if pat.lower() in u:
            return ("red", f"根域名/主页级 URL 误当单品 (匹配 {pat})")
    for pat in COLLECTION_PATTERNS:
        if pat.lower() in u:
            return ("green", f"分类页/系列页（{count} 个单品共享）")
    return ("yellow", f"未明确分类的 {count}x 重复")

def probe_remote_image(url: str) -> dict:
    result = {"url": url, "status": None, "content_type": None, "content_length": None,
              "verdict": "unknown", "note": ""}
    try:
        req = urllib.request.Request(url, method="HEAD", headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "image/*,*/*;q=0.8",
        })
        with urllib.request.urlopen(req, timeout=HEAD_TIMEOUT) as resp:
            result["status"] = resp.status
            result["content_type"] = resp.headers.get("Content-Type", "")
            cl = resp.headers.get("Content-Length")
            result["content_length"] = int(cl) if cl and cl.isdigit() else None
            ct = (result["content_type"] or "").lower()
            if "image" not in ct:
                result["verdict"] = "not-image"
                result["note"] = f"Content-Type={ct} 不是图片"
            elif result["content_length"] is not None and result["content_length"] < 1000:
                result["verdict"] = "placeholder"
                result["note"] = f"Content-Length={result['content_length']} 字节过小"
            else:
                result["verdict"] = "ok"
                result["note"] = f"{result['content_length']} 字节 {ct}"
    except urllib.error.HTTPError as e:
        result["status"] = e.code
        if e.code in (403, 407):
            result["verdict"] = "forbidden"
            result["note"] = f"HTTP {e.code}（Akamai 反爬/WAF）"
        else:
            result["verdict"] = "unreachable"
            result["note"] = f"HTTP {e.code} 资源不存在"
    except (TimeoutError, ssl.SSLError):
        result["verdict"] = "unreachable"
        result["note"] = "超时/SSL 错误"
    except Exception as e:
        result["verdict"] = "unreachable"
        result["note"] = f"异常: {type(e).__name__}: {str(e)[:50]}"
    return result

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--md", help="输出 Markdown 报告到指定路径", default=None)
    ap.add_argument("--feed", default=str(FEED_PATH))
    ap.add_argument("--no-head", action="store_true", help="跳过远程图 HEAD 探测（离线模式）")
    ap.add_argument("--no-plan-b", action="store_true", help="跳过方案 B 校验（已知高误报）")
    args = ap.parse_args()

    data = json.loads(Path(args.feed).read_text())
    stories = data.get("stories", [])
    N = len(stories)
    generated_at = data.get("generatedAt","")

    out = []
    sep = "=" * 70
    out.append(sep)
    out.append("📊 方案 B 质量仪表盘 — newsofgift.com")
    out.append(sep)
    out.append(f"feed: {args.feed}")
    out.append(f"generatedAt: {generated_at}")
    out.append(f"扫描时间: {datetime.utcnow().isoformat()}Z")
    out.append(f"总条数: {N}")
    out.append("")

    # ============== 1. 基础库存 ==============
    out.append("─" * 70)
    out.append("1️⃣  基础库存")
    out.append("─" * 70)
    cat = Counter(s.get("category") for s in stories)
    for c, n in cat.most_common():
        out.append(f"  {c:12s}  {n:4d}  {'█' * int(n/N*40)}")
    out.append("")
    br = Counter(s.get("brand") for s in stories)
    out.append("brand Top 10:")
    for c, n in br.most_common(10):
        out.append(f"  {c:20s}  {n:4d}  {'█' * int(n/N*40)}")
    out.append("")
    sub = Counter(s.get("subcategory") for s in stories)
    out.append("subcategory Top 10:")
    for c, n in sub.most_common(10):
        out.append(f"  {c:12s}  {n:4d}  {'█' * int(n/N*40)}")
    out.append("")

    # ============== 2. 方案 B 一致性校验 ==============
    if not args.no_plan_b:
        out.append("─" * 70)
        out.append("2️⃣  方案 B 一致性校验（title 关键词 ⊆ sourceUrl slug）")
        out.append("─" * 70)
        pass_cnt = 0
        fail_stories = []
        for s in stories:
            ok, miss = check_plan_b(s)
            if ok: pass_cnt += 1
            else: fail_stories.append((s, miss))
        out.append(f"通过: {pass_cnt}/{N}  ({pass_cnt/N*100:.1f}%)")
        out.append(f"未通过: {len(fail_stories)}/{N}  ({len(fail_stories)/N*100:.1f}%)")
        out.append("")
        if fail_stories:
            out.append("未通过样本（前 10 条）：")
            for s, miss in fail_stories[:10]:
                out.append(f"  ❌ {s.get('brand','')} | {s.get('title','')[:60]}")
                out.append(f"     miss={miss}")
                out.append(f"     url: {(s.get('sourceUrl','') or '')[:90]}")
            out.append("")
        out.append("⚠️  方案 B 校验规则有局限：品牌名 + 中文产品名 + 通用词不在 slug 是正常的，")
        out.append("   当前实现是「宁杀错不放过」的保守版，仅作参考，不作拒绝条件。")
        out.append("")

    # ============== 3. 图片健康 ==============
    out.append("─" * 70)
    out.append("3️⃣  图片健康")
    out.append("─" * 70)
    no_img = [s for s in stories if not s.get("image")]
    placeholder = [s for s in stories if is_placeholder_image(s.get("image","") or "")]
    local_img = [s for s in stories if (s.get("image","") or "").startswith("/")]
    remote_img = [s for s in stories if (s.get("image","") or "").startswith(("http://","https://"))]
    out.append(f"无 image 字段:    {len(no_img):4d}/{N}")
    out.append(f"占位图嫌疑:      {len(placeholder):4d}/{N}")
    out.append(f"本地图片:         {len(local_img):4d}/{N}  ({len(local_img)/N*100:.1f}%)")
    out.append(f"远程外链:         {len(remote_img):4d}/{N}  ({len(remote_img)/N*100:.1f}%)")
    out.append("")
    if no_img:
        out.append("无图样本（前 5）：")
        for s in no_img[:5]:
            out.append(f"  ⚠️  {s.get('brand','')} | {s.get('title','')[:60]}")
        out.append("")

    # ============== 4. 来源可信度 ==============
    out.append("─" * 70)
    out.append("4️⃣  来源可信度")
    out.append("─" * 70)
    st = Counter(s.get("sourceType") for s in stories)
    for c, n in st.most_common():
        out.append(f"  sourceType: {c:20s}  {n:4d}  ({n/N*100:.1f}%)")
    out.append("")
    url_groups = defaultdict(list)
    for s in stories:
        u = s.get("sourceUrl","")
        if u:
            url_groups[u].append(s)
    dups = {u:lst for u,lst in url_groups.items() if len(lst) > 1}
    out.append(f"重复 sourceUrl 数: {len(dups)}（详见 §6.1）")
    out.append("")
    official = sum(1 for s in stories if s.get("sourceType") == "Official Site")
    out.append(f"✅ Official Site 占比: {official/N*100:.1f}% （目标 >95%）")
    out.append("")

    # ============== 5. 时序健康 ==============
    out.append("─" * 70)
    out.append("5️⃣  时序健康")
    out.append("─" * 70)
    lag = sum(1 for s in stories if s.get("checkedAt") and s.get("publishedAt") and s["checkedAt"] < s["publishedAt"])
    out.append(f"checkedAt 早于 publishedAt: {lag}/{N}  (异常: 应≤0)")
    out.append("")
    dates = Counter()
    for s in stories:
        pub = s.get("publishedAt","") or ""
        dates[pub[:10]] += 1
    out.append("publishedAt 分布（Top 10）：")
    for d_, c in sorted(dates.items(), reverse=True)[:10]:
        out.append(f"  {d_}: {c:3d}  {'█' * c}")
    out.append("")
    spike_days = [(d,c) for d,c in dates.items() if c > 30]
    if spike_days:
        out.append("⚠️  单日爆发（>30 条）：")
        for d, c in spike_days:
            out.append(f"  {d}: {c} 条")
    out.append("")

    # ============== 6. 隔离区问题清单 ==============
    out.append("─" * 70)
    out.append("6️⃣  隔离区问题清单（只标记，不动数据）")
    out.append("─" * 70)

    # 6.1 重复 sourceUrl
    out.append("")
    out.append("§6.1 重复 sourceUrl 分级（32 组）")
    green_groups, red_groups, yellow_groups = [], [], []
    for u, lst in dups.items():
        verdict, reason = classify_repeat_url(u, len(lst))
        if verdict == "green": green_groups.append((u, lst, reason))
        elif verdict == "red": red_groups.append((u, lst, reason))
        else: yellow_groups.append((u, lst, reason))
    # 把 dups 存到变量里供 §6.1 复用

    out.append("")
    out.append(f"🟢 C-1 分类页/系列页共享（保留，{len(green_groups)} 组 / {sum(len(l) for _,l,_ in green_groups)} 条）")
    for u, lst, reason in sorted(green_groups, key=lambda x: -len(x[1]))[:6]:
        out.append(f"   • {len(lst)}x  {u[:90]}")
        out.append(f"     → {reason}")
    if len(green_groups) > 6:
        out.append(f"   ... 还有 {len(green_groups)-6} 组，详见 quarantine 报告")
    out.append("")

    if yellow_groups:
        out.append(f"🟡 未明确分类（{len(yellow_groups)} 组 / {sum(len(l) for _,l,_ in yellow_groups)} 条 — 待人工审视）")
        for u, lst, reason in sorted(yellow_groups, key=lambda x: -len(x[1])):
            out.append(f"   • {len(lst)}x  {u[:90]}")
            out.append(f"     → {reason}")
        out.append("")

    out.append(f"🔴 C-2 根域名/分类页误当单品 URL（{len(red_groups)} 组 / {sum(len(l) for _,l,_ in red_groups)} 条 — 待大扫除）")
    for u, lst, reason in sorted(red_groups, key=lambda x: -len(x[1])):
        out.append(f"   ❌ {len(lst)}x  {u[:90]}")
        out.append(f"     → {reason}")
        for s in lst:
            out.append(f"        - {s.get('brand','')} | {s.get('title','')[:55]}")
    out.append("")

    # 6.2 远程图 HEAD 探测
    out.append("§6.2 远程图 HEAD 探测")
    if args.no_head:
        out.append("  ⏭️  跳过（--no-head 模式）")
    else:
        out.append(f"  远程图总数: {len(remote_img)}  实际探测: {min(len(remote_img), MAX_REMOTE_PROBE)} 条")
        probes = []
        for i, s in enumerate(remote_img[:MAX_REMOTE_PROBE]):
            if i % 5 == 0 and i > 0:
                out.append(f"  ... 进度 {i}/{min(len(remote_img), MAX_REMOTE_PROBE)}")
            r = probe_remote_image(s.get("image",""))
            r["brand"] = s.get("brand","")
            r["title"] = s.get("title","")[:50]
            probes.append(r)
            icon = {"ok": "✅", "placeholder": "🟡", "forbidden": "🔴",
                    "unreachable": "🔴", "not-image": "🟡"}.get(r["verdict"], "❓")
            out.append(f"  {icon} [{r['verdict']:12s}] {r['brand']:20s} | {r['note']}")
        out.append("")
        verdict_cnt = Counter(p["verdict"] for p in probes)
        out.append("  探测结果汇总：")
        for v, c in verdict_cnt.most_common():
            out.append(f"    {v:15s}  {c} 条")
        bad = [p for p in probes if p["verdict"] in ("forbidden", "unreachable")]
        if bad:
            out.append(f"  🔴 重点：{len(bad)} 条图无法访问 — 下次大扫除时本地化或替换")
            for p in bad:
                out.append(f"     • {p['brand']:20s} | {p['title']:50s}")
        out.append("")

    # ============== 7. 健康评分 ==============
    out.append(sep)
    out.append("📋 健康评分")
    out.append(sep)
    score = 0
    total_checks = 0
    # 方案 B 通过率（仅作参考）
    if not args.no_plan_b:
        total_checks += 1
        if pass_cnt/N > 0.5:
            score += 1
        out.append(f"  方案 B 通过率 >50%      : {'✅' if pass_cnt/N > 0.5 else '❌'}  ({pass_cnt/N*100:.1f}%) [参考]")
    total_checks += 1
    if len(no_img)/N < 0.01: score += 1
    out.append(f"  无图 <1%                : {'✅' if len(no_img)/N < 0.01 else '❌'}  ({len(no_img)/N*100:.2f}%)")
    total_checks += 1
    if len(placeholder)/N < 0.05: score += 1
    out.append(f"  占位图 <5%              : {'✅' if len(placeholder)/N < 0.05 else '❌'}  ({len(placeholder)/N*100:.2f}%)")
    total_checks += 1
    if official/N > 0.9: score += 1
    out.append(f"  Official Site >90%      : {'✅' if official/N > 0.9 else '❌'}  ({official/N*100:.1f}%)")
    total_checks += 1
    if lag == 0: score += 1
    out.append(f"  checkedAt 滞后 = 0      : {'✅' if lag == 0 else '❌'}  ({lag})")
    out.append(f"\n  总分: {score}/{total_checks}")
    out.append("")

    # ============== 8. 下次大扫除清单 ==============
    out.append(sep)
    out.append("🎯 下次大扫除处理顺序建议")
    out.append(sep)
    out.append("  1. 🔴 C-2 根域名错位 → 找官网单品 URL 替换（最高优先）")
    out.append("  2. 🔴 D 远程图 404/超时 → 本地化或换 Akamai 友好源")
    out.append("  3. 🟡 C-1.5 黄名单 → 人工审视，确认是 C-1 还是 C-2")
    out.append("  4. 🟢 C-1 绿名单 → 保留，无需处理")
    out.append("")

    text = "\n".join(out)
    print(text)
    if args.md:
        Path(args.md).write_text(text)
        print(f"\n📝 Markdown 报告已写入: {args.md}")

if __name__ == "__main__":
    main()
