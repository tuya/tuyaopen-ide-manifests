"""Unit tests for the `sdks` rule and its validator.

The rule itself (scripts/sdk_applicability.py) is a plain module, so most of
this exercises it directly. The two things worth going through the real files
for are at the bottom: the four shipped indexes must pass, and the validator
must actually fail — with a message a maintainer can act on — when one of them
does not.

Why the rule is strict: from IDE 1.0.1 on, an entry that names no product line
is hidden from *both* products with no user-visible error. A manifest that ships
one publishes a board or demo nobody can see and nothing explains, so "CI caught
it" is the only cheap moment.
"""

import importlib.util
import json
import os
import subprocess
import sys

import pytest

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SCRIPTS = os.path.join(REPO_ROOT, "scripts")
sys.path.insert(0, SCRIPTS)

import sdk_applicability as rule  # noqa: E402

VALIDATOR = os.path.join(SCRIPTS, "validate-sdk-applicability.py")
_spec = importlib.util.spec_from_file_location("validate_sdk_applicability", VALIDATOR)
validator = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = validator
_spec.loader.exec_module(validator)


def item(item_id="t5ai-board", **extra):
    return {"id": item_id, **extra}


# --- the rule, per entry ---------------------------------------------------

def test_named_lines_pass():
    assert rule.check_item_sdks(item(sdks=["tuyaopen"]), 0) == []
    assert rule.check_item_sdks(item(sdks=["tuyaos"]), 0) == []
    assert rule.check_item_sdks(item(sdks=["tuyaopen", "tuyaos"]), 0) == []


def test_missing_field_is_an_error_naming_the_entry():
    errors = rule.check_item_sdks(item(), 3)
    assert len(errors) == 1
    assert "item 't5ai-board'" in errors[0]
    assert "'sdks' is required" in errors[0]
    # The consequence belongs in the message: the author cannot see it anywhere else.
    assert "hidden from every IDE build" in errors[0]


def test_empty_array_is_not_a_wildcard():
    errors = rule.check_item_sdks(item(sdks=[]), 0)
    assert len(errors) == 1
    assert "empty array" in errors[0]


def test_unknown_line_is_rejected_and_the_typo_case_is_named():
    errors = rule.check_item_sdks(item(sdks=["tuyaOS"]), 0)
    assert len(errors) == 1
    assert "unknown line(s)" in errors[0]
    # A misspelt line is the same outcome as no line at all, which is why it is
    # an error here rather than a warning: `tuyaOS` shipped once already.
    assert "hides the entry" in errors[0]


def test_partially_unknown_still_fails():
    errors = rule.check_item_sdks(item(sdks=["tuyaopen", "nosuchline"]), 0)
    assert len(errors) == 1
    assert "nosuchline" in errors[0]


def test_repeated_line_is_rejected():
    errors = rule.check_item_sdks(item(sdks=["tuyaopen", "tuyaopen"]), 0)
    assert len(errors) == 1
    assert "repeats a line" in errors[0]


def test_non_array_is_rejected():
    assert "must be an array" in rule.check_item_sdks(item(sdks="tuyaopen"), 0)[0]


def test_entry_without_id_is_reported_by_position():
    errors = rule.check_item_sdks({}, 7)
    assert "items[7]" in errors[0]


def test_non_object_entry_is_reported_rather_than_skipped():
    assert rule.check_item_sdks("not-an-object", 2) == ["items[2]: must be an object"]


# --- the rule, per domain -------------------------------------------------

def test_check_items_prefixes_the_domain_and_reports_every_offender():
    errors = rule.check_items(
        [item("a", sdks=["tuyaopen"]), item("b"), item("c", sdks=[])], "demos"
    )
    assert len(errors) == 2
    assert all(e.startswith("demos: ") for e in errors)
    assert "item 'b'" in errors[0] and "item 'c'" in errors[1]


def test_check_items_rejects_a_non_array():
    assert rule.check_items({"items": []}, "demos") == ["demos: 'items' must be an array"]


def test_every_filtered_domain_is_covered():
    # If a fifth filtered domain is ever added to the IDE, this list is what has
    # to grow with it — a domain missing here is simply never validated.
    assert set(rule.DOMAIN_INDEXES) == {"platforms", "boardsAndChips", "demos", "skills"}


# --- the validator, over files -------------------------------------------

def test_the_shipped_catalogue_passes():
    for rel in rule.DOMAIN_INDEXES.values():
        path = os.path.join(REPO_ROOT, rel)
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
        assert rule.check_items(data["items"], rel) == []


def test_validator_reports_a_missing_field_in_a_written_index(tmp_path):
    bad = tmp_path / "index.json"
    bad.write_text(
        json.dumps({"schemaVersion": 1, "domain": "demos", "items": [item("forgotten")]}),
        encoding="utf-8",
    )
    count, errors = validator.validate_file(bad)
    assert count == 1
    assert len(errors) == 1
    assert "item 'forgotten'" in errors[0]


def test_validator_rejects_an_empty_items_array(tmp_path):
    empty = tmp_path / "index.json"
    empty.write_text(json.dumps({"schemaVersion": 1, "items": []}), encoding="utf-8")
    count, errors = validator.validate_file(empty)
    # Zero entries reported as "OK" would let a wiped index through this gate.
    assert count == 0
    assert "'items' is empty" in errors[0]


def test_validator_reports_unreadable_and_missing_files(tmp_path):
    broken = tmp_path / "index.json"
    broken.write_text("{not json", encoding="utf-8")
    assert "invalid JSON" in validator.validate_file(broken)[1][0]
    assert "not found" in validator.validate_file(tmp_path / "nope.json")[1][0]


@pytest.mark.parametrize("items,expected_exit", [
    ([{"id": "ok", "sdks": ["tuyaopen"]}], 0),
    ([{"id": "bad"}], 1),
])
def test_validator_exit_code_end_to_end(tmp_path, items, expected_exit):
    # The exit code is the whole contract with CI, so run it as CI runs it.
    target = tmp_path / "index.json"
    target.write_text(json.dumps({"schemaVersion": 1, "items": items}), encoding="utf-8")
    proc = subprocess.run(
        [sys.executable, VALIDATOR, str(target)],
        capture_output=True,
        text=True,
        # Explicit, not inherited: the script prints ✓/✗ and an em dash, and a
        # Windows maintainer's default locale codec (GBK) cannot decode them —
        # which turns both streams into None and the assertions into a TypeError.
        encoding="utf-8",
    )
    assert proc.returncode == expected_exit
    if expected_exit:
        # A failure has to say what to write, not just what is wrong.
        assert '"sdks": ["tuyaopen"]' in proc.stderr


def test_default_run_covers_the_real_repo():
    proc = subprocess.run(
        [sys.executable, VALIDATOR],
        capture_output=True,
        text=True,
        encoding="utf-8",
        cwd=REPO_ROOT,
    )
    assert proc.returncode == 0, proc.stderr
    assert "entries across 4 domain(s)" in proc.stdout
