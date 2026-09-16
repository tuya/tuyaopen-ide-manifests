import json
import sys
from pathlib import Path

import pytest


ROOT = Path(__file__).parents[2]
sys.path.insert(0, str(ROOT / "scripts"))

from release_contract import (  # noqa: E402
    build_release_manifest,
    load_ide_support,
    validate_ide_support,
)


def test_release_metadata_is_strict_and_increasing():
    assert load_ide_support() == {
        "minVersion": "1.0.0",
        "maxVersionExclusive": "9.9.9",
    }


def test_current_release_embeds_identical_support():
    support = load_ide_support()
    release = json.loads((ROOT / "release.json").read_text(encoding="utf-8"))
    assert release["ideSupport"] == support


@pytest.mark.parametrize(
    "value",
    [
        None,
        {},
        {"minVersion": "1.0.0"},
        {"maxVersionExclusive": "9.9.9"},
        {"minVersion": "01.0.0", "maxVersionExclusive": "9.9.9"},
        {"minVersion": "1.0.0", "maxVersionExclusive": "09.9.9"},
        {"minVersion": "1.0", "maxVersionExclusive": "9.9.9"},
        {"minVersion": "1.0.0.0", "maxVersionExclusive": "9.9.9"},
        {"minVersion": "v1.0.0", "maxVersionExclusive": "9.9.9"},
        {"minVersion": "1.0.0", "maxVersionExclusive": "1.0.0"},
        {"minVersion": "9.9.9", "maxVersionExclusive": "1.0.0"},
    ],
)
def test_invalid_ide_support_is_rejected(value):
    with pytest.raises(ValueError):
        validate_ide_support(value)


def test_generate_release_manifest_uses_registry_and_all_package_mirrors(tmp_path):
    metadata = tmp_path / "release-metadata.json"
    metadata.write_text(
        json.dumps(
            {"ideSupport": {"minVersion": "1.0.0", "maxVersionExclusive": "9.9.9"}}
        ),
        encoding="utf-8",
    )
    registry = tmp_path / "registry.json"
    registry.write_text(
        json.dumps(
            {
                "manifests": {
                    "boardsAndChips": {"version": "1.2.3"},
                    "demos": {"version": "2.3.4"},
                    "platforms": {"version": "3.4.5"},
                    "skills": {"version": "4.5.6"},
                }
            }
        ),
        encoding="utf-8",
    )

    release = build_release_manifest(
        tag="v2.0.0",
        version="2.0.0",
        sha256="a" * 64,
        size=12345,
        registry_path=registry,
        metadata_path=metadata,
        published_at="2026-09-16T00:00:00Z",
    )

    assert release["ideSupport"] == json.loads(metadata.read_text())["ideSupport"]
    assert release["package"] == {
        "github": "https://github.com/tuya/tuyaopen-ide-manifests/releases/download/v2.0.0/manifests.tar.gz",
        "gitee": "https://gitee.com/tuya-open/tuyaopen-ide-manifests/releases/download/v2.0.0/manifests.tar.gz",
        "tuyacn": "https://images.tuyacn.com/tuyaopen/tuyaopen-ide-assets/tuyaopen-ide-manifests/manifests-2.0.0.tar.gz",
        "sha256": "a" * 64,
        "size": 12345,
    }
    assert release["domains"] == {
        "boardsAndChips": {"version": "1.2.3"},
        "demos": {"version": "2.3.4"},
        "platforms": {"version": "3.4.5"},
        "skills": {"version": "4.5.6"},
    }
