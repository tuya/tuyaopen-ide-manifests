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
    # Guards the constant against the CLI growing a group nobody mirrored here,
    # and (via the exact count) against it growing a group nobody *uses* — see
    # the task-12 report for how 20 was derived.
    assert "firmware" in validator.CLI_GROUPS
    assert len(validator.CLI_GROUPS) == 20


SHORTCUTS_BODY = """---
name: tuyaopen-x
---

# X

## Shortcuts — `tuyaopen firmware`

| 干什么 | 命令 |
|---|---|
| 编译 | `tuyaopen firmware build` |

## Other

这里提到 `tuyaopen dp list` 但它在 Shortcuts 之外，不该被算进声明。
"""


def test_declared_group_missing_from_shortcuts_is_an_error(tmp_path):
    body = SHORTCUTS_BODY
    errs = validator.check_shortcuts_agreement("tuyaopen-x", ["firmware", "diag"], body)
    assert any("diag" in e for e in errs)


def test_declared_groups_all_present_passes(tmp_path):
    errs = validator.check_shortcuts_agreement("tuyaopen-x", ["firmware"], SHORTCUTS_BODY)
    assert errs == []


def test_group_mentioned_only_outside_shortcuts_does_not_count(tmp_path):
    # `tuyaopen dp list` appears under `## Other`. Scoping to the Shortcuts
    # section is what keeps tuyaopen-shared's §7 mapping table from forcing it to
    # declare seven groups it does not own.
    errs = validator.check_shortcuts_agreement("tuyaopen-x", ["dp"], SHORTCUTS_BODY)
    assert any("dp" in e for e in errs)


def test_undeclared_group_in_shortcuts_is_an_error():
    errs = validator.check_shortcuts_agreement("tuyaopen-x", [], SHORTCUTS_BODY)
    assert any("firmware" in e for e in errs)


def test_shared_is_exempt_from_the_reverse_direction():
    errs = validator.check_shortcuts_agreement("tuyaopen-shared", [], SHORTCUTS_BODY)
    assert errs == []


def test_none_requires_the_no_coverage_sentence():
    body = "---\nname: x\n---\n\n# X\n\n随便写点什么。\n"
    errs = validator.check_shortcuts_agreement("tuyaopen-x", "none", body)
    assert any("No `tuyaopen` CLI coverage" in e for e in errs)


def test_none_with_the_sentence_passes():
    body = "---\nname: x\n---\n\n# X\n\n## No `tuyaopen` CLI coverage\n\n手工流程。\n"
    assert validator.check_shortcuts_agreement("tuyaopen-x", "none", body) == []


def test_missing_shortcuts_section_entirely_is_an_error():
    # Fails closed: a declared group with no `## Shortcuts` section at all
    # (not even an empty one) must not silently pass.
    body = "---\nname: x\n---\n\n# X\n\n没有 Shortcuts 一节。\n"
    errs = validator.check_shortcuts_agreement("tuyaopen-x", ["firmware"], body)
    assert any("Shortcuts" in e for e in errs)


def test_empty_shortcuts_section_is_an_error():
    # Fails closed: a `## Shortcuts` heading with nothing under it (section
    # exists but names no groups) must still flag the declared-but-unused group.
    body = "---\nname: x\n---\n\n# X\n\n## Shortcuts\n\n## Other\n\n后面别的内容。\n"
    errs = validator.check_shortcuts_agreement("tuyaopen-x", ["firmware"], body)
    assert any("firmware" in e for e in errs)


def test_section_boundary_stops_at_next_heading():
    # The extractor must stop at the next `##` heading, not run to EOF — proven
    # by the `## Other` section's `tuyaopen dp` mention not counting.
    section = validator.extract_shortcuts_section(SHORTCUTS_BODY)
    assert "dp" not in section
    assert "firmware" in section
