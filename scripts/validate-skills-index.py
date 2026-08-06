#!/usr/bin/env python3
"""Validate skills/index.json structure and references.

Checks (all local / deterministic, no network):
  - JSON parses and required top-level keys exist with correct types
  - devSkillsRelease is optional and no longer published; when present its fields are checked
  - Each item has required fields with correct types
  - Bilingual fields (name/summary/whenToUse) carry both 'en' and 'zh-CN'
  - 'id' is unique; 'surface' is one of the known surfaces
  - 'source' must be {localPath}; {devSkills + subpath} is rejected (dev-skills is archived)
  - For local skills: source.localPath holds a SKILL.md, sits under skills/<surface>/,
    and installPayload == localPath minus 'skills/'
  - No orphan skills: every top-level skills/**/SKILL.md dir is referenced by
    exactly one item's source.localPath
  - Every '.agents/skills/<x>' path written in skills/**/*.md names a known item id
    (installs are flat: .agents/skills/<id>)
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
# SDK applicability flag. Optional per item; omitted ⇒ ["tuyaopen"] (default).
SDKS = {"tuyaopen", "tuyaos"}
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
    for key in ("schemaVersion", "domain", "publishedAt", "publishedBy", "items"):
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
    # No longer published: TuyaOpen-dev-skills is archived and its content is now
    # inlined under skills/embedded/tuyaopen/, so the field is normally absent.
    # Kept lenient rather than forbidden so an old index can still be validated.
    if dsr is None:
        return
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

    # Optional SDK applicability flag. Omitted ⇒ ["tuyaopen"]; when present
    # it must be a non-empty array of known SDK ids.
    sdks = item.get("sdks")
    if sdks is not None:
        if not isinstance(sdks, list) or not sdks or not all(s in SDKS for s in sdks):
            err(f"{label}: 'sdks' when present must be a non-empty array of {sorted(SDKS)}, got {sdks!r}")

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
        err(f"{label}: 'source' must declare localPath")
        return

    if has_dev:
        err(
            f"{label}: 'source.devSkills' is no longer supported — TuyaOpen-dev-skills is "
            f"archived and this index no longer publishes a devSkillsRelease block, so the IDE "
            f"has no tarball to resolve it from. Put the payload under skills/ and use "
            f"source.localPath."
        )
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
    elif not (REPO_ROOT / local_path / "SKILL.md").is_file():
        # Without this an entry can point at a parent directory: the payload
        # would install empty, and every real skill nested below it would be
        # excused by the orphan check as a "bundled sub-skill".
        err(f"{label}: source.localPath has no SKILL.md directly inside: {local_path}")

    # surface must match the directory the payload actually sits in, since the
    # IDE copies skills/<surface>/ trees into its cache per surface.
    segments = local_path.split("/")
    if len(segments) > 1 and item.get("surface") in SURFACES and segments[1] != item.get("surface"):
        err(
            f"{label}: surface {item['surface']!r} disagrees with source.localPath "
            f"{local_path!r} (expected it under skills/{item['surface']}/)"
        )

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


def check_orphan_skill_dirs(items: list) -> None:
    """Every skill payload on disk must be reachable from the index.

    A "top-level" skill dir is one holding a SKILL.md whose ancestors are not
    themselves referenced by the index — sub-skills bundled inside a parent
    (e.g. hardware-vibe-coding/peripheral-drivers/*) ship with the parent and
    are intentionally not indexed.

    This exists because tuyaopen-cli-debug and tuyaopen-crash-decode sat in the
    payload for months, shipped in every package, and were never installable
    because nothing referenced them.
    """
    referenced: dict[str, list[str]] = {}
    for item in items:
        if not isinstance(item, dict):
            continue
        local_path = (item.get("source") or {}).get("localPath")
        if is_str(local_path):
            referenced.setdefault(local_path.rstrip("/"), []).append(str(item.get("id")))

    for path, ids in sorted(referenced.items()):
        if len(ids) > 1:
            err(f"source.localPath {path!r} is claimed by multiple items: {', '.join(sorted(ids))}")

    skills_root = REPO_ROOT / "skills"
    for skill_md in sorted(skills_root.rglob("SKILL.md")):
        rel = skill_md.parent.relative_to(REPO_ROOT).as_posix()
        if rel in referenced:
            continue
        # Bundled inside an indexed parent skill? Then it is not an orphan.
        if any(rel.startswith(parent + "/") for parent in referenced):
            continue
        err(
            f"orphan skill payload: {rel} holds a SKILL.md but no index item references it "
            f"via source.localPath — it would ship in the package and never be installed"
        )


# Both separators: Windows instructions in SKILL.md legitimately use backslashes.
AGENT_SKILL_PATH_RE = re.compile(r"\.agents[/\\]skills[/\\]([A-Za-z0-9._-]+)")


def check_agent_skill_paths(ids: set) -> None:
    """Markdown must reference the INSTALLED path, which is `.agents/skills/<id>`.

    The IDE installs a skill to `path.join('.agents/skills', item.id)` — flat,
    keyed off the id, not off localPath/installPayload. `.agents/skills/tuyaopen/build/`
    is the old nested layout the IDE now repairs away from, so a SKILL.md telling
    the agent to run a script there sends it to a path that does not exist.
    """
    for md in sorted((REPO_ROOT / "skills").rglob("*.md")):
        rel = md.relative_to(REPO_ROOT).as_posix()
        try:
            text = md.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError) as e:
            err(f"{rel}: unreadable as UTF-8: {e}")
            continue
        for lineno, line in enumerate(text.splitlines(), start=1):
            for segment in AGENT_SKILL_PATH_RE.findall(line):
                if segment not in ids:
                    err(
                        f"{rel}:{lineno}: '.agents/skills/{segment}' is not an installed skill "
                        f"path — the first segment must be an index item id (installs are flat: "
                        f".agents/skills/<id>)"
                    )


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
    check_orphan_skill_dirs(items)
    check_agent_skill_paths(seen_ids)

    if errors:
        print(f"✗ {index_path}: {len(errors)} problem(s) found:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1

    print(f"✓ {index_path}: OK ({len(items)} items validated)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
