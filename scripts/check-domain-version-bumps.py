#!/usr/bin/env python3
"""Enforce the domain-version rule that README.md § Contributing already states.

    Bump the domain version — any change to a <domain>/index.json or the items
    under it needs registry.json's manifests.<domain>.version bumped (minor for
    added / removed items, patch for content-only edits). ... Refresh that
    domain's publishedAt in the same PR.

That rule had no gate, and it showed. Measured 2026-08-17: six commits sat on
`main`'s successor branch having changed 439 files under `skills/` — a
product-line restructure that renamed ids, five new install groups, `requires`
/ `aliases`, a sub-skill rename — while `manifests.skills.version` was still
the `1.0.0` that shipped with tag v1.0.0, and `skills/TuyaOpen/index.json`'s
`publishedAt` still said the v1.0.0 date. Nothing was red.

Why that matters rather than being untidy: the release workflow generates
`release.json#domains` **from these numbers**, the IDE stores them, and they are
what lights the per-page "this page has an update" dot. An unbumped domain means
an already-synced IDE downloads the new tarball and then tells the user nothing
changed. Per-skill `version` has had a gate (`check-skill-version-bumps.py`)
since it was introduced for the same reason one layer down; this is the missing
sibling.

Unlike that sibling, this script talks to git itself (`--base-ref`) instead of
having the workflow pre-extract files. The sibling's shape exists because it
needs *three* trees (base, HEAD, last release) and CI already had those SHAs;
here one ref is enough, and being runnable as a bare
`python3 scripts/check-domain-version-bumps.py` is worth more than symmetry —
the failure this exists for is a human forgetting, so the check has to be
trivial to run before opening the PR.

Checks, in order:

  1. Every registered domain's `url` resolves to a readable JSON file whose
     `domain` field equals the registry key. The IDE's own cacheIntegrity()
     refuses to start on a registry entry whose file is missing, so a typo here
     is a startup failure, not a cosmetic one.
  2. Every registered version is plain semver (same vocabulary as release.json).
  3. For each registered domain whose tracked content differs from `--base-ref`:
     the version must have strictly increased, and the domain's `publishedAt`
     must have changed.

Deliberately NOT checked: directories that are not registered domains.
`miniapp-templates` ships in the tarball but must never be registered (see the
release workflow's staging step for why — schemaVersion 2, no `domain` field,
and a registry entry would make cacheIntegrity() demand a file older than the
release). `peripheral-templates` ships nowhere; the IDE serves that catalogue
from its own bundled `media/` copy. Both are correct as they stand, so neither
gets a version and neither belongs in this script's scope.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# Same vocabulary as release.json's domains[].version and skills' per-item
# version: plain x.y.z, no pre-release/build suffix, no leading 'v', no leading
# zeros. Keeping the three identical is what lets a human compare them by eye.
VERSION_RE = re.compile(r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$")

errors: list[str] = []


def err(msg: str) -> None:
    errors.append(msg)


def semver(raw: str) -> tuple[int, int, int]:
    return tuple(int(p) for p in raw.split("."))  # type: ignore[return-value]


def git(*args: str) -> str | None:
    """Run git, returning stdout — or None when the object does not exist."""
    try:
        out = subprocess.run(
            ["git", "-C", str(REPO_ROOT), *args],
            capture_output=True,
            text=True,
            check=True,
        )
        return out.stdout
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None


def load_registry(text: str, label: str) -> dict | None:
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as e:
        err(f"{label}: not parseable as JSON ({e})")
        return None
    manifests = parsed.get("manifests")
    if not isinstance(manifests, dict):
        err(f"{label}: has no 'manifests' object")
        return None
    return parsed


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--base-ref",
        default="",
        help=(
            "Git ref to compare against — usually the PR base, or the last "
            "release tag when run by hand. Omit to run the structural checks "
            "(1 and 2) only."
        ),
    )
    args = ap.parse_args()

    head_registry = load_registry(
        (REPO_ROOT / "registry.json").read_text(encoding="utf-8"), "registry.json"
    )
    if head_registry is None:
        print("✗ domain version check: registry.json is unusable", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1

    manifests: dict = head_registry["manifests"]

    # ---- 1 + 2: structural, no base ref needed -----------------------------
    for key, entry in manifests.items():
        if not isinstance(entry, dict):
            err(f"registry.json: manifests.{key} is not an object")
            continue

        version = entry.get("version")
        if not isinstance(version, str) or not VERSION_RE.match(version):
            err(f"registry.json: manifests.{key}.version must be x.y.z, got {version!r}")

        url = entry.get("url")
        if not isinstance(url, str) or not url:
            err(f"registry.json: manifests.{key}.url is missing")
            continue

        path = REPO_ROOT / url
        if not path.is_file():
            err(
                f"registry.json: manifests.{key}.url points at {url!r}, which does "
                f"not exist — the IDE's cacheIntegrity() refuses to start on this"
            )
            continue
        try:
            domain_field = json.loads(path.read_text(encoding="utf-8")).get("domain")
        except json.JSONDecodeError as e:
            err(f"{url}: not parseable as JSON ({e})")
            continue
        if domain_field != key:
            err(
                f"{url}: 'domain' is {domain_field!r} but its registry key is "
                f"{key!r} — the two must match"
            )

    # ---- 3: bump enforcement, needs a base ref -----------------------------
    if args.base_ref:
        base_text = git("show", f"{args.base_ref}:registry.json")
        if base_text is None:
            err(
                f"--base-ref {args.base_ref!r}: cannot read registry.json at that "
                f"ref (unknown ref, or a shallow clone that lacks it)"
            )
        else:
            base_registry = load_registry(base_text, f"{args.base_ref}:registry.json")
            base_manifests = (base_registry or {}).get("manifests", {})

            for key, entry in manifests.items():
                url = entry.get("url")
                if not isinstance(url, str) or not url:
                    continue
                domain_dir = str(Path(url).parent)

                changed = git(
                    "diff", "--name-only", f"{args.base_ref}...HEAD", "--", domain_dir
                )
                # An unreadable diff must not silently pass — that is how a check
                # like this rots into a no-op on a runner with a shallow clone.
                if changed is None:
                    err(
                        f"{key}: could not diff {domain_dir}/ against "
                        f"{args.base_ref!r}; refusing to assume it is unchanged"
                    )
                    continue
                if not changed.strip():
                    continue

                base_entry = base_manifests.get(key)
                base_version = (base_entry or {}).get("version")
                head_version = entry.get("version")

                n_changed = len(changed.strip().splitlines())
                if not isinstance(base_version, str) or not VERSION_RE.match(base_version):
                    # New domain, or a base whose version was already malformed —
                    # nothing to compare, and check 2 already covers the shape.
                    pass
                elif not isinstance(head_version, str) or not VERSION_RE.match(head_version):
                    pass  # check 2 reported it
                elif semver(head_version) <= semver(base_version):
                    err(
                        f"{key}: {n_changed} file(s) under {domain_dir}/ changed "
                        f"since {args.base_ref} but manifests.{key}.version is "
                        f"still {head_version} — bump it (minor for added/removed "
                        f"items, patch for content-only edits), or an "
                        f"already-synced IDE never tells the user anything changed"
                    )

                # publishedAt lives in the domain's own index.json, and the README
                # asks for it in the same PR. Compared separately from the version
                # because forgetting exactly one of the two is the common case.
                index_rel = url
                base_index = git("show", f"{args.base_ref}:{index_rel}")
                if base_index is None:
                    continue
                try:
                    base_pub = json.loads(base_index).get("publishedAt")
                    head_pub = json.loads(
                        (REPO_ROOT / index_rel).read_text(encoding="utf-8")
                    ).get("publishedAt")
                except json.JSONDecodeError:
                    continue
                if base_pub is not None and base_pub == head_pub:
                    err(
                        f"{key}: {index_rel} still says publishedAt={head_pub!r}, "
                        f"unchanged since {args.base_ref} — refresh it in the same "
                        f"change as the version bump"
                    )

    if errors:
        print(f"✗ domain version check: {len(errors)} problem(s) found:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1

    scope = f" against {args.base_ref}" if args.base_ref else " (structure only)"
    print(f"✓ domain version check: OK — {len(manifests)} domain(s){scope}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
