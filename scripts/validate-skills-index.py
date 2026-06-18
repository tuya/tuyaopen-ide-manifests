#!/usr/bin/env python3
"""Validate skills/index.json structure and references.

Checks (all local / deterministic, no network):
  - JSON parses and required top-level keys exist with correct types
  - devSkillsRelease has required fields; github/gitee are well-formed URLs
  - Each item has required fields with correct types
  - Bilingual fields (name/summary/whenToUse) carry both 'en' and 'zh-CN'
  - 'id' is unique; 'surface' is one of the known surfaces
  - 'source' is exactly one of {localPath} or {devSkills + subpath}
  - For local skills: source.localPath dir exists and installPayload == localPath minus 'skills/'
  - Every related[] entry resolves to a known item id

Usage: python3 scripts/validate-skills-index.py [path/to/index.json]
Exits 0 on success, 1 on any error.
"""

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SURFACES = {"embedded", "cloud", "miniapp"}
BILINGUAL_FIELDS = ("name", "summary", "whenToUse")
LANGS = ("en", "zh-CN")
URL_RE = re.compile(r"^https?://[^\s]+$")

errors: list[str] = []


def err(msg: str) -> None:
    errors.append(msg)


def is_str(v) -> bool:
    return isinstance(v, str) and v.strip() != ""


def check_bilingual(item_label: str, field: str, value) -> None:
    if not isinstance(value, dict):
        err(f"{item_label}: '{field}' must be an object with {LANGS}")
        return
    for lang in LANGS:
        if not is_str(value.get(lang)):
            err(f"{item_label}: '{field}.{lang}' missing or not a non-empty string")


def check_top_level(data: dict) -> None:
    for key in ("schemaVersion", "domain", "publishedAt", "publishedBy", "items", "devSkillsRelease"):
        if key not in data:
            err(f"top-level: missing required key '{key}'")
    if "schemaVersion" in data and not isinstance(data["schemaVersion"], int):
        err("top-level: 'schemaVersion' must be an integer")
    for key in ("domain", "publishedAt", "publishedBy"):
        if key in data and not is_str(data[key]):
            err(f"top-level: '{key}' must be a non-empty string")
    if "items" in data and not isinstance(data["items"], list):
        err("top-level: 'items' must be an array")


def check_dev_skills_release(dsr) -> None:
    if not isinstance(dsr, dict):
        err("devSkillsRelease: must be an object")
        return
    for key in ("version", "github", "gitee", "sha256", "size"):
        if key not in dsr:
            err(f"devSkillsRelease: missing required key '{key}'")
    for url_key in ("github", "gitee"):
        url = dsr.get(url_key)
        if url is not None and not (isinstance(url, str) and URL_RE.match(url)):
            err(f"devSkillsRelease.{url_key}: not a well-formed URL: {url!r}")
    if "size" in dsr and not isinstance(dsr["size"], int):
        err("devSkillsRelease.size: must be an integer")


def check_item(item, index: int, seen_ids: set) -> None:
    label = f"items[{index}]"
    if not isinstance(item, dict):
        err(f"{label}: must be an object")
        return

    item_id = item.get("id")
    if not is_str(item_id):
        err(f"{label}: 'id' missing or not a non-empty string")
    else:
        label = f"item '{item_id}'"
        if item_id in seen_ids:
            err(f"{label}: duplicate id")
        seen_ids.add(item_id)

    if not isinstance(item.get("order"), (int, float)):
        err(f"{label}: 'order' missing or not numeric")

    surface = item.get("surface")
    if surface not in SURFACES:
        err(f"{label}: 'surface' must be one of {sorted(SURFACES)}, got {surface!r}")

    for field in BILINGUAL_FIELDS:
        check_bilingual(label, field, item.get(field))

    if not isinstance(item.get("tags"), list):
        err(f"{label}: 'tags' must be an array")
    if not isinstance(item.get("defaultEnabled"), bool):
        err(f"{label}: 'defaultEnabled' must be a boolean")
    if not is_str(item.get("installPayload")):
        err(f"{label}: 'installPayload' missing or not a non-empty string")

    check_source(label, item)


def check_source(label: str, item: dict) -> None:
    source = item.get("source")
    if not isinstance(source, dict):
        err(f"{label}: 'source' must be an object")
        return

    has_local = "localPath" in source
    has_dev = source.get("devSkills") is True

    if "devSkills" in source and not isinstance(source["devSkills"], bool):
        err(f"{label}: 'source.devSkills' must be a boolean")

    if has_local and has_dev:
        err(f"{label}: 'source' must be exactly one of localPath or devSkills, not both")
        return
    if not has_local and not has_dev:
        err(f"{label}: 'source' must declare either localPath or devSkills")
        return

    if has_dev:
        if not is_str(source.get("subpath")):
            err(f"{label}: dev-skill 'source.subpath' missing or not a non-empty string")
        return

    # Local skill: dir must exist, installPayload must match localPath minus 'skills/'
    local_path = source.get("localPath")
    if not is_str(local_path):
        err(f"{label}: 'source.localPath' missing or not a non-empty string")
        return
    if not local_path.startswith("skills/"):
        err(f"{label}: source.localPath must begin with 'skills/', got {local_path!r}")
        return
    if not (REPO_ROOT / local_path).is_dir():
        err(f"{label}: source.localPath does not exist: {local_path}")
    expected_payload = re.sub(r"^skills/", "", local_path)
    if is_str(item.get("installPayload")) and item["installPayload"] != expected_payload:
        err(
            f"{label}: installPayload {item['installPayload']!r} does not match "
            f"localPath-derived {expected_payload!r}"
        )


def check_related(items: list, ids: set) -> None:
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            continue
        related = item.get("related")
        if related is None:
            continue
        label = f"item '{item.get('id', index)}'"
        if not isinstance(related, list):
            err(f"{label}: 'related' must be an array")
            continue
        for ref in related:
            if not is_str(ref):
                err(f"{label}: related entry must be a non-empty string, got {ref!r}")
            elif ref not in ids:
                err(f"{label}: related id {ref!r} does not resolve to a known item")


def main() -> int:
    index_path = Path(sys.argv[1]) if len(sys.argv) > 1 else REPO_ROOT / "skills" / "index.json"
    if not index_path.is_file():
        print(f"✗ index file not found: {index_path}", file=sys.stderr)
        return 1

    try:
        data = json.loads(index_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"✗ {index_path}: invalid JSON: {e}", file=sys.stderr)
        return 1

    if not isinstance(data, dict):
        print(f"✗ {index_path}: top-level must be a JSON object", file=sys.stderr)
        return 1

    check_top_level(data)
    check_dev_skills_release(data.get("devSkillsRelease"))

    items = data.get("items") if isinstance(data.get("items"), list) else []
    seen_ids: set = set()
    for index, item in enumerate(items):
        check_item(item, index, seen_ids)
    check_related(items, seen_ids)

    if errors:
        print(f"✗ {index_path}: {len(errors)} problem(s) found:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1

    print(f"✓ {index_path}: OK ({len(items)} items validated)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
