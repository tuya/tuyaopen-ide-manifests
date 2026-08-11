#!/usr/bin/env python3
"""Fail when a skill payload changed but its index.json 'version' did not.

Why this exists: the IDE cannot tell "upstream shipped a new version of this
skill" apart from "the user hand-edited their installed copy" — both look like
a content-hash mismatch. `version` is what separates them, so a version that
nobody bumps is *worse* than no version at all: the IDE would confidently
report "up to date" while the payload changed underneath it. This check is what
makes the field trustworthy.

Deliberately does no git plumbing of its own — the caller (CI) supplies the two
inputs, which keeps the whole decision testable without a repository:

  --base-index  skills/index.json as of the base commit
                (`git show <base>:skills/index.json`); an empty/missing file
                means "no baseline", and the check passes
  --changed     newline-separated repo-relative paths changed by the PR
                (`git diff --name-only --no-renames <base>...HEAD -- skills/`),
                or '-' to read them from stdin

Rules, per item in the *head* index:
  - payload changed (a file under source.localPath, or localPath itself moved)
    and the item existed at base ⇒ version must be strictly greater than base
  - item is new at head ⇒ nothing to compare, passes
  - base entry had no/invalid version (pre-versioning baseline) ⇒ passes
  - a version that moves backwards fails even without a payload change

Usage: python3 scripts/check-skill-version-bumps.py --base-index B --changed C
       [--head-index skills/index.json]
Exits 0 on success, 1 on any error.
"""

import argparse
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
VERSION_RE = re.compile(r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$")


def parse_version(value):
    """(major, minor, patch) tuple, or None when not a plain x.y.z string."""
    if not isinstance(value, str):
        return None
    m = VERSION_RE.match(value.strip())
    if not m:
        return None
    return tuple(int(part) for part in m.groups())


def payload_dir(item) -> str:
    if not isinstance(item, dict):
        return ""
    source = item.get("source")
    local_path = source.get("localPath") if isinstance(source, dict) else None
    if isinstance(local_path, str) and local_path.strip():
        return local_path.strip().rstrip("/")
    return ""


def items_by_id(data) -> dict:
    items = data.get("items") if isinstance(data, dict) else None
    out: dict = {}
    if not isinstance(items, list):
        return out
    for item in items:
        if isinstance(item, dict) and isinstance(item.get("id"), str) and item["id"]:
            out[item["id"]] = item
    return out


def touches(changed: list, directory: str) -> bool:
    """True when any changed path is the payload dir itself or sits under it."""
    if not directory:
        return False
    prefix = directory + "/"
    return any(path == directory or path.startswith(prefix) for path in changed)


def check(base_data, head_data, changed: list) -> list:
    """Return the list of problems; empty means the change is fine."""
    errors: list = []
    base = items_by_id(base_data)
    if not base:
        # No baseline to compare against (first commit, or the base ref did not
        # carry skills/index.json). Nothing this check can honestly assert.
        return errors

    changed = [p.strip().replace("\\", "/") for p in changed if p.strip()]

    for item_id, head_item in items_by_id(head_data).items():
        base_item = base.get(item_id)
        if base_item is None:
            continue  # brand-new item: no previous version to bump

        base_version = parse_version(base_item.get("version"))
        head_version = parse_version(head_item.get("version"))
        head_dir = payload_dir(head_item)
        base_dir = payload_dir(base_item)

        if head_version is None:
            # Shape is validate-skills-index.py's job; say so rather than
            # duplicating its message, and don't pretend the bump was checked.
            errors.append(
                f"item '{item_id}': 'version' is missing or malformed "
                f"({head_item.get('version')!r}) — cannot verify a bump"
            )
            continue

        if base_version is None:
            continue  # baseline predates the field; nothing to compare

        if head_version < base_version:
            errors.append(
                f"item '{item_id}': version moved backwards "
                f"({base_item['version']} → {head_item['version']})"
            )
            continue

        payload_changed = touches(changed, head_dir) or (base_dir != head_dir)
        if payload_changed and head_version == base_version:
            errors.append(
                f"item '{item_id}': payload {head_dir or '(unknown path)'} changed but "
                f"'version' is still {head_item['version']} — bump it (patch for a wording "
                f"or fix, minor for new behaviour) or the IDE will report installed copies "
                f"as up to date"
            )

    return errors


def read_json(path: Path):
    """Parsed JSON, or None when the file is absent/empty (= no baseline)."""
    if not path.is_file():
        return None
    text = path.read_text(encoding="utf-8").strip()
    if not text:
        return None
    return json.loads(text)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-index", required=True, help="index.json at the base commit")
    parser.add_argument("--changed", required=True, help="file of changed paths, or '-' for stdin")
    parser.add_argument(
        "--head-index",
        default=str(REPO_ROOT / "skills" / "index.json"),
        help="index.json under review (default: skills/index.json)",
    )
    args = parser.parse_args()

    head_path = Path(args.head_index)
    try:
        head_data = read_json(head_path)
    except json.JSONDecodeError as e:
        print(f"✗ {head_path}: invalid JSON: {e}", file=sys.stderr)
        return 1
    if head_data is None:
        print(f"✗ index file not found: {head_path}", file=sys.stderr)
        return 1

    try:
        base_data = read_json(Path(args.base_index))
    except json.JSONDecodeError as e:
        print(f"✗ {args.base_index}: invalid JSON: {e}", file=sys.stderr)
        return 1
    if base_data is None:
        print("• no base skills/index.json to compare against — version bump check skipped")
        return 0

    if args.changed == "-":
        changed = sys.stdin.read().splitlines()
    else:
        changed_path = Path(args.changed)
        changed = changed_path.read_text(encoding="utf-8").splitlines() if changed_path.is_file() else []

    errors = check(base_data, head_data, changed)
    if errors:
        print(f"✗ skill version bump check: {len(errors)} problem(s) found:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1

    print(f"✓ skill version bump check: OK ({len(changed)} changed path(s) considered)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
