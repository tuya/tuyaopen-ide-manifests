#!/usr/bin/env python3
"""
Search Tuya support.tuya.com help articles for panel miniapp (面板小程序).

Usage:
    python3 search_help.py "Ray 第三方库报错"
    python3 search_help.py "包体积" --limit 10
    python3 search_help.py --list-all          # dump all 面板小程序 articles
    python3 search_help.py "关键词" --url-only  # print only article URLs

The script auto-acquires the CSRF cookie from support.tuya.com on first run
(or when the cached cookie expires / returns auth errors).

Exit codes:
    0  results found and printed
    1  no results
    2  network / API error
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile
import time

# ── constants ────────────────────────────────────────────────────────────────
BASE_URL = "https://support.tuya.com"
SEARCH_API = f"{BASE_URL}/api/v2/search"
PANEL_CATE = "Cefowhf7gadrn"   # 面板小程序 category code
COOKIE_CACHE = os.path.join(tempfile.gettempdir(), "tuya_support_cookies.txt")

# Keyword sweep used when listing all articles (empty keyword returns 0 results)
SWEEP_KEYWORDS = [
    "a", "e", "i", "o", "u",
    "是", "的", "如何", "怎么", "什么",
    "Ray", "面板", "小程序", "开发", "上传",
    "支持", "使用", "问题", "配置", "调试",
]

# ── helpers ──────────────────────────────────────────────────────────────────

def _curl(*extra_args, timeout=15):
    """Run curl and return (stdout_bytes, returncode)."""
    cmd = [
        "curl", "-s", "--max-time", str(timeout),
        "-c", COOKIE_CACHE, "-b", COOKIE_CACHE,
        *extra_args,
    ]
    result = subprocess.run(cmd, capture_output=True)
    return result.stdout, result.returncode


def _refresh_csrf():
    """
    Fetch the help list page to seed cookies (including csrf-token).
    Returns the CSRF token string, or raises RuntimeError.
    """
    url = f"{BASE_URL}/zh/help/_list?category={PANEL_CATE}"
    out, rc = _curl(url, "-o", "/dev/null", "-D", "-")
    if rc != 0:
        raise RuntimeError(f"curl exit {rc} when fetching {url}")
    # Cookie jar file is updated by curl -c; parse csrf-token from it
    return _read_csrf_from_jar()


def _read_csrf_from_jar():
    """Read csrf-token value from the Netscape cookie jar file."""
    if not os.path.exists(COOKIE_CACHE):
        return None
    with open(COOKIE_CACHE) as f:
        for line in f:
            line = line.strip()
            if line.startswith("#") or not line:
                continue
            parts = line.split("\t")
            if len(parts) >= 7 and parts[5] == "csrf-token":
                return parts[6]
    return None


def _get_csrf():
    """Return cached CSRF token, refreshing if absent."""
    token = _read_csrf_from_jar()
    if token:
        return token
    return _refresh_csrf()


def _search(keyword, cate=PANEL_CATE, offset=0, limit=20, csrf=None):
    """
    Call POST /api/v2/search.
    Returns parsed JSON dict or raises RuntimeError.
    """
    if csrf is None:
        csrf = _get_csrf()

    body = json.dumps({
        "input": {
            "uri": "help",
            "cateCode": cate,
            "keyword": keyword,
            "offset": offset,
            "limit": limit,
        }
    })

    tmp = tempfile.NamedTemporaryFile(suffix=".json", delete=False)
    tmp.close()
    try:
        out, rc = _curl(
            SEARCH_API,
            "-X", "POST",
            "-H", "Content-Type: application/json",
            "-H", f"x-csrf-token: {csrf}",
            "--data-raw", body,
            "-o", tmp.name,
        )
        if rc != 0:
            raise RuntimeError(f"curl exit {rc}")
        with open(tmp.name) as f:
            return json.load(f)
    finally:
        os.unlink(tmp.name)


def _parse_articles(data):
    """Extract list of {code, title, url} from API response dict."""
    result = data.get("result", {})
    datas = result.get("datas", [])
    articles = []
    for item in datas:
        c = item.get("content", {})
        code = c.get("knowledgeCode", "")
        title = c.get("title", "")
        if code and title:
            articles.append({
                "code": code,
                "title": title,
                "url": f"{BASE_URL}/zh/help/_detail?id={code}",
            })
    return articles, result.get("totalCount", 0)


# ── main operations ───────────────────────────────────────────────────────────

def search(keyword, limit=10, url_only=False):
    """Search by keyword and print results."""
    try:
        csrf = _get_csrf()
        data = _search(keyword, limit=limit, csrf=csrf)
    except Exception as e:
        print(f"[search_help] error: {e}", file=sys.stderr)
        return 2

    articles, total = _parse_articles(data)
    if not articles:
        # CSRF may have expired — retry once
        try:
            csrf = _refresh_csrf()
            data = _search(keyword, limit=limit, csrf=csrf)
            articles, total = _parse_articles(data)
        except Exception as e:
            print(f"[search_help] retry error: {e}", file=sys.stderr)
            return 2

    if not articles:
        print(f"[search_help] no results for: {keyword!r}", file=sys.stderr)
        return 1

    print(f"[search_help] {len(articles)} result(s) (total={total}) for: {keyword!r}\n")
    for i, a in enumerate(articles, 1):
        if url_only:
            print(a["url"])
        else:
            print(f"{i:2}. {a['title']}")
            print(f"     {a['url']}\n")
    return 0


def list_all(url_only=False):
    """
    Sweep with multiple keywords to collect all articles in the
    面板小程序 category, deduplicated by knowledgeCode.
    """
    try:
        csrf = _get_csrf()
    except Exception as e:
        print(f"[search_help] error acquiring CSRF: {e}", file=sys.stderr)
        return 2

    seen = {}
    page_size = 20

    for kw in SWEEP_KEYWORDS:
        offset = 0
        while True:
            try:
                data = _search(kw, offset=offset, limit=page_size, csrf=csrf)
            except Exception as e:
                print(f"[search_help] warning: {e} (keyword={kw!r})", file=sys.stderr)
                break

            articles, total = _parse_articles(data)
            for a in articles:
                if a["code"] not in seen:
                    seen[a["code"]] = a

            if not articles or offset + page_size >= total:
                break
            offset += page_size
            if offset >= 160:   # guard against runaway pagination
                break

    if not seen:
        print("[search_help] no articles found", file=sys.stderr)
        return 1

    print(f"[search_help] {len(seen)} unique articles in 面板小程序 category\n")
    for i, a in enumerate(seen.values(), 1):
        if url_only:
            print(a["url"])
        else:
            print(f"{i:3}. {a['title']}")
            print(f"     {a['url']}\n")
    return 0


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Search Tuya panel miniapp help articles on support.tuya.com",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("keyword", nargs="?", help="Search keyword (Chinese or English)")
    parser.add_argument("--limit", type=int, default=10, help="Max results to show (default: 10)")
    parser.add_argument("--list-all", action="store_true", help="List all articles in the 面板小程序 category")
    parser.add_argument("--url-only", action="store_true", help="Print only article URLs (one per line)")

    args = parser.parse_args()

    if args.list_all:
        sys.exit(list_all(url_only=args.url_only))
    elif args.keyword:
        sys.exit(search(args.keyword, limit=args.limit, url_only=args.url_only))
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
