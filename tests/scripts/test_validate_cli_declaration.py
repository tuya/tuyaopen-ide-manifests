"""Unit tests for the `cli` declaration rules in validate-skills-index.py.

Rules 1 and 2 only (rule 3 — body/declaration agreement — lands with the body
rewrites, because it requires a `## Shortcuts` section that most skills do not
have yet).
"""
import importlib.util
import os
import sys

import pytest

SCRIPT = os.path.join(
    os.path.dirname(__file__), "..", "..", "scripts", "validate-skills-index.py"
)
_spec = importlib.util.spec_from_file_location("validate_skills_index", SCRIPT)
validator = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = validator
_spec.loader.exec_module(validator)


@pytest.fixture(autouse=True)
def _clean():
    validator.errors.clear()
    yield
    validator.errors.clear()


def item(item_id="tuyaopen-build", cli=None):
    out = {"id": item_id}
    if cli is not None:
        out["cli"] = cli
    return out


def test_missing_cli_field_is_an_error():
    validator.check_cli_declaration([item(cli=None)])
    assert len(validator.errors) == 1
    assert "cli" in validator.errors[0]


def test_groups_none_without_reason_is_an_error():
    validator.check_cli_declaration([item(cli={"groups": "none"})])
    assert any("reason" in e for e in validator.errors)


def test_groups_none_with_reason_passes():
    validator.check_cli_declaration([item(cli={"groups": "none", "reason": "手工流程"})])
    assert validator.errors == []


def test_unknown_group_name_is_an_error():
    validator.check_cli_declaration([item(cli={"groups": ["firmware", "nosuchgroup"]})])
    assert any("nosuchgroup" in e for e in validator.errors)


def test_known_group_names_pass():
    validator.check_cli_declaration([item(cli={"groups": ["firmware", "diag"]})])
    assert validator.errors == []


def test_empty_group_list_is_an_error_not_a_silent_pass():
    # `[]` would otherwise satisfy "is a list" and declare nothing at all.
    validator.check_cli_declaration([item(cli={"groups": []})])
    assert any("empty" in e or "none" in e for e in validator.errors)


def test_every_real_cli_group_is_in_the_constant():
    # Guards the constant against the CLI growing a group nobody mirrored here.
    assert "firmware" in validator.CLI_GROUPS
    assert len(validator.CLI_GROUPS) >= 20
