#!/usr/bin/env python3
"""
Fetch and search developer.tuya.com/cn/miniapp documentation pages.

The site is a statically-exported Next.js app (nextExport: true). Page HTML is
an empty shell; actual content lives in a per-page JS chunk (compiled MDX → JSX).

── FETCH a specific page ────────────────────────────────────────────────────
    python3 fetch_doc.py "https://developer.tuya.com/cn/miniapp/develop/ray/guide/overview"
    python3 fetch_doc.py "/cn/miniapp/develop/ray/guide/overview"   # path-only OK

── SEARCH across all 4500+ doc pages ────────────────────────────────────────
    python3 fetch_doc.py --search "useProps"
    python3 fetch_doc.py --search "多语言"
    python3 fetch_doc.py --search "publishDps" --fetch             # fetch top result too
    python3 fetch_doc.py --search "OTA" --fetch --limit 5          # show 5 matches, fetch top

Search matches against page URL paths (fast, no network per page).
Use --fetch to also fetch and print the content of the best match.

Exit codes:
    0  success
    1  not found / no results
    2  network error
"""

import re
import sys
import subprocess
import json
import html as html_lib
import os
import time

BASE         = "https://developer.tuya.com"
ASSET_BASE   = "https://static1.tuyacn.com/static/tuya-miniapp-doc"
SCHEMA_CDN   = "https://images.tuyacn.com/smart/doc/schemas"
UA           = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120"

_SCRIPT_DIR      = os.path.dirname(os.path.abspath(__file__))
_MANIFEST_CACHE  = os.path.join(_SCRIPT_DIR, ".doc_manifest_cache.json")
_SCHEMA_CACHE    = os.path.join(_SCRIPT_DIR, ".doc_schema_cache")   # dir, one file per source


# ── network ──────────────────────────────────────────────────────────────────

def _get(url, timeout=20):
    r = subprocess.run(
        ["curl", "-s", "--max-time", str(timeout), "-A", UA,
         "-L", "--compressed", url],
        capture_output=True
    )
    if r.returncode != 0:
        raise RuntimeError(f"curl exit {r.returncode} for {url}")
    return r.stdout.decode("utf-8", errors="replace")


# ── locate chunk ─────────────────────────────────────────────────────────────

def _find_chunk_url(html_text, page_path):
    """
    Find the page-specific JS chunk URL.
    HTML contains:  <script src="{assetPrefix}/_next/static/chunks/pages/{path}-{hash}.js">
    """
    # Normalize path: strip leading slash, keep as-is
    path = page_path.lstrip("/")

    # Escape for regex — path may contain slashes
    path_re = re.escape(path)

    # Match the script tag for this specific page
    m = re.search(
        r'src="(https://[^"]+/_next/static/chunks/pages/' + path_re + r'-[a-f0-9]+\.js)"',
        html_text
    )
    if m:
        return m.group(1)

    # Fallback: assetPrefix from __NEXT_DATA__ + path
    m_prefix = re.search(r'"assetPrefix":"([^"]+)"', html_text)
    m_build  = re.search(r'"buildId":"([^"]+)"', html_text)
    if m_prefix and m_build:
        prefix   = m_prefix.group(1)
        build_id = m_build.group(1)
        # Try guessing — list manifest
        manifest_url = f"{prefix}/_next/static/{build_id}/_buildManifest.js"
        manifest = _get(manifest_url, timeout=10)
        # buildManifest maps route → chunks array
        key = "/" + path
        m2 = re.search(re.escape(json.dumps(key)) + r':\["([^"]+)"', manifest)
        if m2:
            chunk_hash = m2.group(1)
            return f"{prefix}/_next/static/chunks/{chunk_hash}.js"

    return None


# ── text extraction ───────────────────────────────────────────────────────────

def _unescape(s):
    """Unescape JS string escapes and HTML entities."""
    # Common JS escape sequences
    s = s.replace("\\n", "\n").replace("\\t", "\t").replace('\\"', '"').replace("\\'", "'")
    s = s.replace("\\\\", "\\")
    return html_lib.unescape(s)


def _extract_toc(js):
    """Extract __toc export: [{depth, value, id}, ...]"""
    m = re.search(r'__toc:\s*function[^{]*{[^}]*return\s*(\[.*?\])\s*}', js, re.DOTALL)
    if not m:
        # Try direct assignment: var l=[{depth:...
        m = re.search(r'(?:var\s+\w+\s*=|,\w+=)\s*(\[(?:{depth:\d+,value:"[^"]*"[^}]*},?\s*)+\])', js)
    if m:
        raw = m.group(1)
        entries = re.findall(r'{depth:(\d+),value:"((?:[^"\\]|\\.)*)",id:"([^"]*)"', raw)
        return [{"depth": int(d), "value": _unescape(v), "id": i} for d, v, i in entries]
    return []


def _extract_text_nodes(js):
    """
    Extract content text from compiled MDX/JSX chunk.
    Strategy: scan for JSX element calls and extract `children:` string values.
    Handles both direct strings and arrays of strings.
    Returns list of (element_type, text) tuples in document order.
    """
    # Narrow scope to just the MDX content function
    m = re.search(r'function _createMdxContent\b', js)
    scope = js[m.start():] if m else js

    results = []

    # Pattern: (jsx/jsxs)(ELEM_VAR, {... children:"TEXT" ...})
    # We look for `children:"..."` and then inspect what element it belongs to
    # by finding the nearest preceding element variable reference.
    ELEM_TAGS = {"h1","h2","h3","h4","h5","h6","p","li","th","td","strong","em","code","a","span","pre"}

    # All `children:"TEXT"` occurrences
    for cm in re.finditer(r'children:"((?:[^"\\]|\\.)+)"', scope):
        text = _unescape(cm.group(1)).strip()
        if not text or len(text) < 2:
            continue

        # Look back up to 150 chars to find the element type
        look_back = scope[max(0, cm.start()-150):cm.start()]
        elem = "span"
        # Find the last element variable like e.p, n.h2, e.li ...
        for em2 in re.finditer(r'[a-z]\.(h[1-6]|p|li|th|td|strong|em|code|a|span|pre)\b', look_back):
            elem = em2.group(1)
        results.append((elem, text))

    # Also collect strings from mixed children arrays (e.g., ["text", jsx(...), "more"])
    # These are string literals that appear between JSX calls inside children arrays.
    # Pattern: ,"TEXT", or ["TEXT", — inside the _createMdxContent scope
    array_str_pat = re.compile(r'(?:,|\[)"((?:[^"\\]|\\.){3,})"(?:,|\])')
    for am in array_str_pat.finditer(scope):
        text = _unescape(am.group(1)).strip()
        if not text or len(text) < 3:
            continue
        # Skip strings that look like HTML attributes, CSS, or code imports
        if re.match(r'^[a-z@][\w./@-]*$', text):   # looks like identifier/path
            continue
        if text.startswith('#') or text.startswith('http'):
            continue
        # Look back for element type
        look_back = scope[max(0, am.start()-200):am.start()]
        elem = "p"
        for em2 in re.finditer(r'[a-z]\.(h[1-6]|p|li|th|td)\b', look_back):
            elem = em2.group(1)
        # Avoid duplicates — only add if not already in results nearby
        if not any(t == text for _, t in results[-3:]):
            results.append((elem, text))

    # Internal links (href + children both present)
    for lm in re.finditer(r'href:"(/[^"]+)",children:"((?:[^"\\]|\\.){2,})"', scope):
        href = lm.group(1)
        link_text = _unescape(lm.group(2))
        results.append(("a_ref", f"[{link_text}](https://developer.tuya.com{href})"))

    return results


def _reconstruct_markdown(toc, text_nodes):
    """Build a readable Markdown document from extracted data."""
    lines = []
    seen  = set()

    def out(line):
        if line not in seen or line == "":
            seen.add(line)
            lines.append(line)

    buf = []

    def flush():
        if buf:
            for b in buf:
                out(b)
            out("")
            buf.clear()

    toc_values = {e["value"] for e in toc}

    for elem, text in text_nodes:
        text = text.strip()
        if not text:
            continue
        if text in seen and elem not in ("h1","h2","h3","h4","h5","h6"):
            continue

        if elem in ("h1","h2","h3","h4","h5","h6"):
            flush()
            level = int(elem[1])
            heading = "#" * level + " " + text
            if heading not in seen:
                out(heading)
                out("")
                seen.add(text)
        elif elem == "p":
            buf.append(text)
            buf.append("")
        elif elem == "li":
            buf.append("- " + text)
        elif elem == "code":
            buf.append(f"`{text}`")
        elif elem in ("th", "td"):
            buf.append(text + " | ")
        elif elem == "strong":
            buf.append(f"**{text}**")
        elif elem == "a_ref":
            flush()
            out(text)
        else:
            if len(text) > 3:
                buf.append(text)

    flush()
    return "\n".join(lines)


# ── schema-doc support (API reference pages) ─────────────────────────────────

def _load_schema(source):
    """
    Load the full API schema JSON for a source (e.g. 'ray-js', 'panel-sdk').
    Caches to disk for 24 h.
    """
    os.makedirs(_SCHEMA_CACHE, exist_ok=True)
    cache_file = os.path.join(_SCHEMA_CACHE, f"{source}.json")

    if os.path.exists(cache_file):
        age = time.time() - os.path.getmtime(cache_file)
        if age < 86400:
            with open(cache_file) as f:
                return json.load(f)

    print(f"[fetch_doc] downloading schema index for '{source}'…", file=sys.stderr)
    try:
        raw = _get(f"{SCHEMA_CDN}/{source}.json", timeout=30)
    except RuntimeError as e:
        raise RuntimeError(f"cannot fetch schema for {source}: {e}")

    data = json.loads(raw)
    with open(cache_file, 'w') as f:
        json.dump(data, f)
    return data


def _format_type(type_obj, indent=0):
    """Recursively format a type definition object as readable text."""
    if not isinstance(type_obj, dict):
        return str(type_obj)
    kind = type_obj.get('kind', '')
    if kind == 'primitive':
        return type_obj.get('value', '?')
    if kind == 'reference':
        return type_obj.get('name', '?')
    if kind == 'array':
        elem = _format_type(type_obj.get('elementType', {}))
        return f"{elem}[]"
    if kind == 'generic':
        name = type_obj.get('name', '')
        args = type_obj.get('typeArguments', [])
        if args:
            return f"{name}<{', '.join(_format_type(a) for a in args)}>"
        return name
    if kind == 'union':
        members = type_obj.get('members', [])
        return ' | '.join(_format_type(m) for m in members)
    if kind == 'object':
        props = type_obj.get('properties', [])
        if not props:
            return 'object'
        lines = ['{']
        for p in props:
            req = '' if p.get('required') else '?'
            lines.append(f"  {p['name']}{req}: {_format_type(p.get('type', {}))}")
        lines.append('}')
        return '\n'.join(lines)
    if kind == 'function':
        params = type_obj.get('parameters', [])
        ret    = _format_type(type_obj.get('returnType', {'kind': 'primitive', 'value': 'void'}))
        param_str = ', '.join(f"{p['name']}: {_format_type(p.get('type', {}))}" for p in params)
        return f"({param_str}) => {ret}"
    return json.dumps(type_obj)


def _render_schema_item(item):
    """Format a single schema item (API / hook / component) as Markdown."""
    lines = []
    name = item.get('name', item.get('id', ''))
    desc_zh = item.get('description', {}).get('zh', '')
    desc_en = item.get('description', {}).get('en', '')
    item_type = item.get('type', '')

    lines.append(f"# {name}")
    if desc_zh:
        lines.append(f"\n{desc_zh}")
    if desc_en and desc_en != desc_zh:
        lines.append(f"\n*{desc_en}*")
    lines.append(f"\n**类型**: {item_type}")

    # Parameters
    params = item.get('params', item.get('parameters', []))
    if params:
        lines.append("\n## 参数 (Parameters)\n")
        lines.append("| 参数 | 类型 | 必填 | 说明 |")
        lines.append("|---|---|---|---|")
        for p in params:
            pname = p.get('name', '')
            ptype = _format_type(p.get('type', {}))
            req   = '✓' if p.get('required') else ''
            pdesc = p.get('description', {})
            pdesc_str = pdesc.get('zh', pdesc.get('en', '')) if isinstance(pdesc, dict) else str(pdesc)
            lines.append(f"| `{pname}` | `{ptype}` | {req} | {pdesc_str} |")

    # Return type
    ret = item.get('returns', item.get('returnType'))
    if ret:
        lines.append("\n## 返回值 (Returns)\n")
        if isinstance(ret, dict) and 'type' in ret:
            lines.append(f"```\n{_format_type(ret['type'])}\n```")
            desc = ret.get('description', {})
            if isinstance(desc, dict):
                d = desc.get('zh', desc.get('en', ''))
                if d:
                    lines.append(d)
        elif isinstance(ret, dict):
            lines.append(f"```\n{_format_type(ret)}\n```")

    # Code example
    example = item.get('example', item.get('examples'))
    if example:
        if isinstance(example, list):
            example = example[0]
        if isinstance(example, dict):
            code = example.get('code', example.get('content', ''))
            lang = example.get('lang', 'ts')
        else:
            code = str(example)
            lang = 'ts'
        if code:
            lines.append(f"\n## 示例 (Example)\n\n```{lang}\n{code}\n```")

    # Deprecated / version info
    since = item.get('minVersion', item.get('since'))
    if since:
        lines.append(f"\n**最低版本**: {since}")
    if item.get('deprecated'):
        dep_msg = item['deprecated']
        lines.append(f"\n> ⚠️ **已废弃**: {dep_msg if isinstance(dep_msg, str) else ''}")

    return '\n'.join(lines)


def fetch_schema_doc(source, name):
    """
    Fetch API documentation for a specific item from the schema CDN.
    source: e.g. 'ray-js', 'panel-sdk'
    name:   e.g. 'publishDps', 'useProps'
    """
    try:
        schema_data = _load_schema(source)
    except RuntimeError as e:
        print(f"[fetch_doc] error: {e}", file=sys.stderr)
        return 2

    items = schema_data.get('items', [])
    # Find by name (case-insensitive)
    name_lower = name.lower()
    matches = [it for it in items if it.get('name', '').lower() == name_lower
               or it.get('id', '').lower() == name_lower]

    if not matches:
        # Fuzzy: contains
        matches = [it for it in items if name_lower in it.get('name', '').lower()
                   or name_lower in it.get('id', '').lower()]

    if not matches:
        print(f"[fetch_doc] '{name}' not found in {source} schema", file=sys.stderr)
        # Show similar names
        all_names = sorted(set(it.get('name', '') for it in items if it.get('name')))
        similar = [n for n in all_names if any(kw in n.lower() for kw in name_lower.split())][:10]
        if similar:
            print(f"[fetch_doc] similar items: {', '.join(similar)}", file=sys.stderr)
        return 1

    for item in matches[:3]:  # show up to 3 matches
        print(_render_schema_item(item))
        print("\n---\n")
    return 0


# ── search support ────────────────────────────────────────────────────────────

def _load_manifest():
    """
    Return list of all doc page paths from the Next.js _buildManifest.js.
    Caches result to disk; refreshes if cache is older than 24 h.
    """
    # Use cache if fresh
    if os.path.exists(_MANIFEST_CACHE):
        age = time.time() - os.path.getmtime(_MANIFEST_CACHE)
        if age < 86400:
            with open(_MANIFEST_CACHE) as f:
                return json.load(f)

    print("[fetch_doc] downloading page index (first run, cached for 24h)…", file=sys.stderr)

    # Get build ID from any doc page HTML
    try:
        html_text = _get(f"{BASE}/cn/miniapp/develop/ray/guide/overview")
    except RuntimeError as e:
        raise RuntimeError(f"cannot fetch doc index: {e}")

    m = re.search(r'"buildId":"([^"]+)"', html_text)
    if not m:
        raise RuntimeError("buildId not found in page HTML")
    build_id = m.group(1)

    manifest_url = f"{ASSET_BASE}/_next/static/{build_id}/_buildManifest.js"
    try:
        manifest_js = _get(manifest_url)
    except RuntimeError as e:
        raise RuntimeError(f"cannot fetch manifest: {e}")

    # Extract all /cn/miniapp/... routes
    routes = re.findall(r'"(/cn/miniapp/[^"]+)"', manifest_js)
    # Deduplicate, exclude 404/special pages
    routes = sorted(set(r for r in routes if not r.endswith('/404') and '__' not in r))

    with open(_MANIFEST_CACHE, 'w') as f:
        json.dump(routes, f)

    print(f"[fetch_doc] indexed {len(routes)} pages", file=sys.stderr)
    return routes


def _score_route(route, keywords):
    """
    Score a route path against a list of keywords.
    Returns (score, matched_terms) — higher is better.
    """
    route_lower = route.lower()
    # Normalize: replace - and / with space for matching
    route_words = re.split(r'[-/]', route_lower)

    score = 0
    matched = []
    for kw in keywords:
        kw_lower = kw.lower()
        # Exact segment match → highest score
        if kw_lower in route_words:
            score += 10
            matched.append(kw)
        # Substring in route → moderate score
        elif kw_lower in route_lower:
            score += 5
            matched.append(kw)
        # Partial: route segment starts with keyword
        elif any(w.startswith(kw_lower) for w in route_words if len(w) > 2):
            score += 2
            matched.append(kw)
    return score, matched


def search_docs(query, limit=10, fetch_top=False):
    """Search doc pages by keyword and print matching URLs."""
    try:
        routes = _load_manifest()
    except RuntimeError as e:
        print(f"[fetch_doc] error: {e}", file=sys.stderr)
        return 2

    # Tokenize query: split on spaces and Chinese word boundaries
    # Also try the full query as one token
    tokens = query.split()
    # Add pinyin-friendly: split on camelCase
    extra = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?=[A-Z]|$)|[0-9]+|[一-鿿]+', query)
    keywords = list(dict.fromkeys(tokens + extra + [query]))

    scored = []
    for route in routes:
        score, matched = _score_route(route, keywords)
        if score > 0:
            scored.append((score, route, matched))

    scored.sort(key=lambda x: -x[0])
    top = scored[:limit]

    if not top:
        print(f"[fetch_doc] no pages found matching: {query!r}", file=sys.stderr)
        print(f"[fetch_doc] tip: try shorter keywords or English equivalents", file=sys.stderr)
        return 1

    print(f"\n[fetch_doc] {len(scored)} match(es) for {query!r}, showing top {len(top)}:\n")
    for i, (score, route, matched) in enumerate(top, 1):
        url = BASE + route
        print(f"{i:2}. {url}")
        print(f"     matched: {', '.join(matched)}")
    print()

    if fetch_top:
        best_url = BASE + top[0][1]
        print(f"[fetch_doc] fetching top result: {best_url}\n", file=sys.stderr)
        return fetch_doc(best_url)

    return 0


# ── main ──────────────────────────────────────────────────────────────────────

def fetch_doc(url):
    if url.startswith("/"):
        url = BASE + url
    elif not url.startswith("http"):
        url = BASE + "/" + url

    # Derive page path for chunk lookup
    page_path = url.replace(BASE, "").lstrip("/")

    print(f"[fetch_doc] fetching page HTML: {url}", file=sys.stderr)
    try:
        html_text = _get(url)
    except RuntimeError as e:
        print(f"[fetch_doc] error: {e}", file=sys.stderr)
        return 2

    chunk_url = _find_chunk_url(html_text, page_path)
    if not chunk_url:
        print(f"[fetch_doc] could not locate JS chunk for path: /{page_path}", file=sys.stderr)
        print("[fetch_doc] hint: check that the URL exists on developer.tuya.com", file=sys.stderr)
        return 1

    print(f"[fetch_doc] downloading chunk: {chunk_url}", file=sys.stderr)
    try:
        js = _get(chunk_url, timeout=30)
    except RuntimeError as e:
        print(f"[fetch_doc] error: {e}", file=sys.stderr)
        return 2

    # Detect SchemaDoc pages — they delegate content to an external schema CDN
    schema_m = re.search(r'source:"([^"]+)",name:"([^"]+)",mode:', js)
    if schema_m:
        source = schema_m.group(1)
        name   = schema_m.group(2)
        print(f"[fetch_doc] API reference page — fetching schema: {source}/{name}", file=sys.stderr)
        return fetch_schema_doc(source, name)

    toc        = _extract_toc(js)
    text_nodes = _extract_text_nodes(js)

    if not text_nodes:
        print("[fetch_doc] no content extracted — page may be dynamic or format changed",
              file=sys.stderr)
        return 1

    # Print TOC summary
    if toc:
        print("\n=== TABLE OF CONTENTS ===")
        for entry in toc:
            indent = "  " * (entry["depth"] - 1)
            print(f"{indent}- {entry['value']}")
        print()

    # Print full content
    print("=== CONTENT ===\n")
    md = _reconstruct_markdown(toc, text_nodes)
    print(md)
    return 0


def main():
    import argparse
    parser = argparse.ArgumentParser(
        description="Fetch or search developer.tuya.com/cn/miniapp documentation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("url", nargs="?",
                        help="Full URL or path to fetch (e.g. /cn/miniapp/develop/ray/guide/overview)")
    parser.add_argument("--search", metavar="QUERY",
                        help="Search doc pages by keyword (matches URL paths)")
    parser.add_argument("--api", metavar="NAME",
                        help="Fetch API/hook docs by name directly, e.g. --api publishDps")
    parser.add_argument("--source", default="ray-js",
                        help="Schema source for --api (default: ray-js). Also: panel-sdk, mothra-framework")
    parser.add_argument("--fetch", action="store_true",
                        help="With --search: also fetch and print content of the top result")
    parser.add_argument("--limit", type=int, default=10,
                        help="Max search results to show (default: 10)")
    parser.add_argument("--refresh-index", action="store_true",
                        help="Force refresh the cached page index and schema cache")

    args = parser.parse_args()

    if args.refresh_index:
        for cache in [_MANIFEST_CACHE]:
            if os.path.exists(cache):
                os.unlink(cache)
        import shutil
        if os.path.exists(_SCHEMA_CACHE):
            shutil.rmtree(_SCHEMA_CACHE)
        print("[fetch_doc] all caches cleared", file=sys.stderr)

    if args.api:
        sys.exit(fetch_schema_doc(args.source, args.api))
    elif args.search:
        sys.exit(search_docs(args.search, limit=args.limit, fetch_top=args.fetch))
    elif args.url:
        sys.exit(fetch_doc(args.url))
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
