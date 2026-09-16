#!/usr/bin/env python3
"""Validate and generate the release contract consumed by TuyaOpen IDE.

This module deliberately has no third-party dependencies so the release job and
the focused pytest suite exercise exactly the same contract implementation.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Mapping


ROOT = Path(__file__).resolve().parents[1]
VERSION_PATTERN = re.compile(
    r"^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$"
)
DOMAIN_NAMES = ("boardsAndChips", "demos", "platforms", "skills")
GITHUB_REPOSITORY = "tuya/tuyaopen-ide-manifests"
GITEE_REPOSITORY = "tuya-open/tuyaopen-ide-manifests"
TUYACN_ASSET_ROOT = (
    "https://images.tuyacn.com/tuyaopen/tuyaopen-ide-assets/"
    "tuyaopen-ide-manifests"
)


def validate_version(value: Any, field: str) -> str:
    """Return a strict numeric X.Y.Z version or raise ``ValueError``."""

    if not isinstance(value, str) or VERSION_PATTERN.fullmatch(value) is None:
        raise ValueError(f"invalid {field}: {value!r}")
    return value


def validate_ide_support(value: Any) -> dict[str, str]:
    """Validate the min-inclusive/max-exclusive IDE compatibility range."""

    if not isinstance(value, Mapping):
        raise ValueError("release metadata requires ideSupport object")
    minimum = validate_version(value.get("minVersion"), "ideSupport.minVersion")
    maximum = validate_version(
        value.get("maxVersionExclusive"), "ideSupport.maxVersionExclusive"
    )
    if tuple(map(int, minimum.split("."))) >= tuple(map(int, maximum.split("."))):
        raise ValueError("ideSupport.minVersion must be less than maxVersionExclusive")
    return {"minVersion": minimum, "maxVersionExclusive": maximum}


def load_ide_support(metadata_path: Path = ROOT / "release-metadata.json") -> dict[str, str]:
    """Read and validate versioned release metadata."""

    try:
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"cannot read {metadata_path}: {exc}") from exc
    if not isinstance(metadata, Mapping):
        raise ValueError("release-metadata.json must contain an object")
    return validate_ide_support(metadata.get("ideSupport"))


def read_domain_versions(registry_path: Path = ROOT / "registry.json") -> dict[str, dict[str, str]]:
    """Return the domain version envelopes in the stable release order."""

    try:
        registry = json.loads(registry_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"cannot read {registry_path}: {exc}") from exc
    manifests = registry.get("manifests") if isinstance(registry, Mapping) else None
    if not isinstance(manifests, Mapping):
        raise ValueError("registry.json requires manifests object")
    return {
        domain: {
            "version": str(entry.get("version", ""))
            if isinstance(entry, Mapping)
            else ""
        }
        for domain in DOMAIN_NAMES
        for entry in [manifests.get(domain, {})]
    }


def build_release_manifest(
    *,
    tag: str,
    version: str,
    sha256: str,
    size: int,
    registry_path: Path = ROOT / "registry.json",
    metadata_path: Path = ROOT / "release-metadata.json",
    published_at: str | None = None,
) -> dict[str, Any]:
    """Build the complete release.json object from release inputs."""

    ide_support = load_ide_support(metadata_path)
    domains = read_domain_versions(registry_path)
    validate_version(version, "version")
    if not isinstance(tag, str) or not tag:
        raise ValueError("tag must be a non-empty string")
    if not isinstance(sha256, str) or not sha256:
        raise ValueError("sha256 must be a non-empty string")
    if not isinstance(size, int) or size < 0:
        raise ValueError("size must be a non-negative integer")
    return {
        "schemaVersion": 1,
        "version": version,
        "tag": tag,
        "publishedAt": published_at
        or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "package": {
            "github": f"https://github.com/{GITHUB_REPOSITORY}/releases/download/{tag}/manifests.tar.gz",
            "gitee": f"https://gitee.com/{GITEE_REPOSITORY}/releases/download/{tag}/manifests.tar.gz",
            "tuyacn": f"{TUYACN_ASSET_ROOT}/manifests-{version}.tar.gz",
            "sha256": sha256,
            "size": size,
        },
        "ideSupport": ide_support,
        "domains": domains,
    }


def write_release_manifest(manifest: Mapping[str, Any], output_path: Path) -> None:
    """Write release.json with deterministic human-readable formatting."""

    output_path.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def _main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("validate", help="validate release-metadata.json and registry.json")
    generate = subparsers.add_parser("generate", help="generate release.json")
    generate.add_argument("--tag", required=True)
    generate.add_argument("--version", required=True)
    generate.add_argument("--sha256", required=True)
    generate.add_argument("--size", required=True, type=int)
    generate.add_argument("--output", type=Path, default=ROOT / "release.json")
    args = parser.parse_args()
    if args.command == "validate":
        support = load_ide_support()
        read_domain_versions()
        print(f"IDE compatibility: {support['minVersion']} <= IDE < {support['maxVersionExclusive']}")
        return 0
    manifest = build_release_manifest(
        tag=args.tag,
        version=args.version,
        sha256=args.sha256,
        size=args.size,
    )
    write_release_manifest(manifest, args.output)
    print(f"release.json generated at {args.output}")
    print(json.dumps(manifest, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(_main())
