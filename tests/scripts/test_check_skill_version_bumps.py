"""Unit tests for scripts/check-skill-version-bumps.py.

The script deliberately takes the base index and the changed-file list as
inputs instead of shelling out to git, so the whole decision is exercised here
without a repository. What CI adds on top is only the two git commands that
produce those inputs.
"""

import importlib.util
import os
import sys

import pytest

SCRIPT = os.path.join(
    os.path.dirname(__file__), "..", "..", "scripts", "check-skill-version-bumps.py"
)
_spec = importlib.util.spec_from_file_location("check_skill_version_bumps", SCRIPT)
checker = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = checker
_spec.loader.exec_module(checker)


def index(*items):
    return {"schemaVersion": 1, "domain": "skills", "items": list(items)}


def item(item_id="tuyaopen-build", version="1.0.0", local_path=None):
    return {
        "id": item_id,
        "version": version,
        "surface": "embedded",
        "installPayload": "embedded/tuyaopen/build",
        "source": {"localPath": local_path or f"skills/embedded/tuyaopen/{item_id}"},
    }


def test_payload_changed_without_bump_fails():
    base = index(item(version="1.0.0"))
    head = index(item(version="1.0.0"))
    errors = checker.check(base, head, ["skills/embedded/tuyaopen/tuyaopen-build/SKILL.md"])
    assert len(errors) == 1
    assert "still 1.0.0" in errors[0]


def test_payload_changed_with_bump_passes():
    base = index(item(version="1.0.0"))
    head = index(item(version="1.0.1"))
    assert checker.check(base, head, ["skills/embedded/tuyaopen/tuyaopen-build/SKILL.md"]) == []


def test_nested_file_under_payload_counts_as_a_change():
    base = index(item(version="1.0.0"))
    head = index(item(version="1.0.0"))
    errors = checker.check(
        base, head, ["skills/embedded/tuyaopen/tuyaopen-build/scripts/helper.py"]
    )
    assert len(errors) == 1


def test_sibling_payload_change_does_not_implicate_this_skill():
    base = index(item(version="1.0.0"))
    head = index(item(version="1.0.0"))
    # A prefix that is not a path boundary must not match.
    assert checker.check(base, head, ["skills/embedded/tuyaopen/tuyaopen-build-extra/SKILL.md"]) == []


def test_untouched_payload_needs_no_bump():
    base = index(item(version="1.0.0"))
    head = index(item(version="1.0.0"))
    assert checker.check(base, head, ["skills/index.json", "README.md"]) == []


def test_new_item_needs_no_bump():
    base = index(item("tuyaopen-build"))
    head = index(item("tuyaopen-build"), item("brand-new", version="1.0.0"))
    assert checker.check(base, head, ["skills/embedded/tuyaopen/brand-new/SKILL.md"]) == []


def test_moved_payload_requires_a_bump_even_with_no_file_diff():
    base = index(item(version="1.0.0", local_path="skills/embedded/old-home"))
    head = index(item(version="1.0.0", local_path="skills/embedded/new-home"))
    errors = checker.check(base, head, [])
    assert len(errors) == 1
    assert "new-home" in errors[0]


def test_version_moving_backwards_fails():
    base = index(item(version="1.2.0"))
    head = index(item(version="1.1.0"))
    errors = checker.check(base, head, [])
    assert len(errors) == 1
    assert "backwards" in errors[0]


def test_version_compare_is_numeric_not_lexicographic():
    base = index(item(version="1.9.0"))
    head = index(item(version="1.10.0"))
    assert checker.check(base, head, ["skills/embedded/tuyaopen/tuyaopen-build/SKILL.md"]) == []


def test_missing_head_version_is_reported():
    base = index(item(version="1.0.0"))
    head_item = item()
    del head_item["version"]
    errors = checker.check(base, index(head_item), [])
    assert len(errors) == 1
    assert "cannot verify a bump" in errors[0]


def test_baseline_without_versions_is_skipped():
    base_item = item()
    del base_item["version"]
    head = index(item(version="1.0.0"))
    assert checker.check(index(base_item), head, ["skills/embedded/tuyaopen/tuyaopen-build/SKILL.md"]) == []


def test_empty_baseline_skips_entirely():
    head = index(item(version="1.0.0"))
    assert checker.check(None, head, ["skills/embedded/tuyaopen/tuyaopen-build/SKILL.md"]) == []
    assert checker.check({}, head, ["skills/embedded/tuyaopen/tuyaopen-build/SKILL.md"]) == []


def test_windows_style_changed_paths_are_normalized():
    base = index(item(version="1.0.0"))
    head = index(item(version="1.0.0"))
    errors = checker.check(
        base, head, ["skills\\embedded\\tuyaopen\\tuyaopen-build\\SKILL.md"]
    )
    assert len(errors) == 1


@pytest.mark.parametrize(
    "raw,expected",
    [
        ("1.0.0", (1, 0, 0)),
        ("0.10.3", (0, 10, 3)),
        ("v1.0.0", None),
        ("1.0", None),
        ("1.0.0-beta", None),
        ("01.0.0", None),
        (1, None),
        (None, None),
    ],
)
def test_parse_version(raw, expected):
    assert checker.parse_version(raw) == expected


def test_real_index_items_all_carry_a_parseable_version():
    """The shipped index must be comparable by this checker, not just by eye."""
    import json

    path = os.path.join(os.path.dirname(__file__), "..", "..", "skills", "index.json")
    with open(path, encoding="utf-8") as fh:
        data = json.load(fh)
    for entry in data["items"]:
        assert checker.parse_version(entry.get("version")) is not None, entry.get("id")
