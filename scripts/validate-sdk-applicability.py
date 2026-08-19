#!/usr/bin/env python3
"""Every catalogue entry must name the product line(s) it applies to.

Checks all four domain indexes (`platforms`, `boardsAndChips`, `demos`,
`skills`) against the one rule in `scripts/sdk_applicability.py`: `sdks` is
required, non-empty, drawn from the known line ids, without repeats.

Why this is a CI gate and not a convention: from IDE 1.0.1 on, an entry that
names no line is hidden from **both** products — it appears in no build, and the
only trace is a log line no end user reads. The failure mode is therefore "the
board I just added never showed up", days later, with nothing pointing back
here. Every entry in this repo has carried the field since v0.0.18; this keeps
that true instead of hoping it stays true.

Usage:
  python3 scripts/validate-sdk-applicability.py            # all four domains
  python3 scripts/validate-sdk-applicability.py demos/index.json [...]

Exits 0 on success, 1 on any problem.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from sdk_applicability import DOMAIN_INDEXES, check_items  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parent.parent


def validate_file(path: Path) -> tuple[int, list[str]]:
    """(entries checked, errors) for one index file."""
    if not path.is_file():
        return 0, [f"{path}: index file not found"]
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        return 0, [f"{path}: invalid JSON: {e}"]
    if not isinstance(data, dict):
        return 0, [f"{path}: top-level must be a JSON object"]

    items = data.get("items")
    if not isinstance(items, list):
        return 0, [f"{path}: 'items' must be an array"]
    # An index that lost its items is a different bug, but reporting zero
    # entries as "OK" would let it pass this gate silently.
    if not items:
        return 0, [f"{path}: 'items' is empty — nothing would render from this domain"]

    return len(items), [f"{path.name if path.parent == REPO_ROOT else path}: {e}"
                        for e in check_items(items)]


def main() -> int:
    if len(sys.argv) > 1:
        targets = [Path(a) for a in sys.argv[1:]]
    else:
        targets = [REPO_ROOT / rel for rel in DOMAIN_INDEXES.values()]

    total = 0
    errors: list[str] = []
    for path in targets:
        count, problems = validate_file(path)
        total += count
        errors.extend(problems)
        rel = path.relative_to(REPO_ROOT) if REPO_ROOT in path.resolve().parents else path
        status = f"{len(problems)} problem(s)" if problems else f"{count} entries OK"
        print(f"  {rel}: {status}")

    if errors:
        print(f"\n✗ sdk applicability: {len(errors)} problem(s) found:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        print(
            "\nFix the data, not this check: name the line(s) each entry belongs to.\n"
            '  TuyaOpen-only   → "sdks": ["tuyaopen"]\n'
            '  TuyaOS-only     → "sdks": ["tuyaos"]\n'
            '  both product lines → "sdks": ["tuyaopen", "tuyaos"]',
            file=sys.stderr,
        )
        return 1

    print(f"✓ sdk applicability: OK ({total} entries across {len(targets)} domain(s))")
    return 0


if __name__ == "__main__":
    sys.exit(main())
