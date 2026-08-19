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


def item(item_id="tuyaopen-embedded-build", cli=None):
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


# Real skill bodies use an English "Intent | Command" header (verified against
# all 14 tables in skills/TuyaOpen/*/SKILL.md) — the fixture matches that,
# not a placeholder, so these tests exercise the same header text production
# actually uses.
SHORTCUTS_BODY = """---
name: tuyaopen-x
---

# X

## Shortcuts — `tuyaopen firmware`

| Intent | Command |
|---|---|
| Compile | `tuyaopen firmware build` |

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


def test_shortcuts_section_with_no_table_is_an_error():
    # Fails closed on the *first* of two now-distinguishable "nothing here"
    # states: a `## Shortcuts` heading with no markdown table under it at all
    # (prose-only, or blank) must not silently pass, and must say so via the
    # "no Command-column table" message — not the per-group "declared but
    # unused" wording, which is reserved for the *other* state (see next test).
    body = "---\nname: x\n---\n\n# X\n\n## Shortcuts\n\n## Other\n\n后面别的内容。\n"
    errs = validator.check_shortcuts_agreement("tuyaopen-x", ["firmware"], body)
    assert any("no table with a `Command` column" in e for e in errs)


def test_shortcuts_section_with_empty_table_is_an_error():
    # Fails closed on the *second* distinguishable state: a genuine
    # Command-column table that exists but has zero data rows. `[]` (table
    # found, nothing in it) must still flag the declared group as unused,
    # exactly like the no-table case, but via the per-group message since
    # there IS a table — just an empty one.
    body = (
        "---\nname: x\n---\n\n# X\n\n## Shortcuts\n\n"
        "| Intent | Command |\n|---|---|\n\n## Other\n\n后面别的内容。\n"
    )
    errs = validator.check_shortcuts_agreement("tuyaopen-x", ["firmware"], body)
    assert any("firmware" in e and "declared but unused" in e for e in errs)
    assert not any("no table with a `Command` column" in e for e in errs)


def test_section_boundary_stops_at_next_heading():
    # The extractor must stop at the next `##` heading, not run to EOF — proven
    # by the `## Other` section's `tuyaopen dp` mention not counting.
    section = validator.extract_shortcuts_section(SHORTCUTS_BODY)
    assert "dp" not in section
    assert "firmware" in section


# Scoped one level finer than the section: only the Command column of a real
# markdown table asserts "this skill invokes this". This fixture packs all
# three non-asserting shapes a real Shortcuts section can contain — a
# discovery-boilerplate prose line, a `> **No CLI?**` fallback blockquote, and
# steering-away prose — around ONE real table row that must still count. One
# fixture, both directions: this is what stops a later "just scan the section"
# simplification from reintroducing the false positives found in the real
# 28-skill run (schema-discovery lines, `tuyaopen config` "is a different,
# unrelated command", `tuyaopen device list-ports` "doesn't expose the
# grouping…").
TABLE_SCOPE_BODY = """---
name: tuyaopen-x
---

# X

## Shortcuts — `tuyaopen firmware`

| Intent | Command |
|---|---|
| Compile | `tuyaopen firmware build` |
| Look up flags | `tuyaopen diag doctor` |

Flags aren't listed here — run `tuyaopen schema get --group firmware --command build`
for the current set; `tuyaopen sdk env-init` runs automatically as part of the
build, it is not something you invoke here.

> **No CLI?** `tos.py build`. A related tool also offers `tuyaopen dependency
> check` for context, but that's not this skill's job.
"""


def test_prose_and_fallback_blockquote_mentions_do_not_count_only_table_rows_do():
    # `sdk` (discovery-boilerplate prose), and `dependency` (fallback
    # blockquote) are both named inside the Shortcuts section boundary but
    # never in a Command-column table row — none of the three must count.
    # `diag`, named in an actual table row, must still trip as used-but-
    # undeclared. `schema` is separately exempted (see next test) so its
    # absence here proves nothing about column-scoping specifically.
    errs = validator.check_shortcuts_agreement("tuyaopen-x", ["firmware"], TABLE_SCOPE_BODY)
    assert errs == [
        "item 'tuyaopen-x': Shortcuts Command column invokes `tuyaopen diag …` "
        "but 'diag' is not in cli.groups — used but undeclared"
    ]


def test_schema_is_exempt_from_the_reverse_direction_even_in_a_table_row():
    # `schema` is the catalogue-wide self-discovery idiom: exempted from the
    # reverse ("used but undeclared") direction regardless of whether it shows
    # up in prose or in an actual Command-column row.
    body = (
        "---\nname: x\n---\n\n# X\n\n## Shortcuts — `tuyaopen firmware`\n\n"
        "| Intent | Command |\n|---|---|\n"
        "| Compile | `tuyaopen firmware build` |\n"
        "| Inspect | `tuyaopen schema get --group firmware --command build` |\n"
    )
    errs = validator.check_shortcuts_agreement("tuyaopen-x", ["firmware"], body)
    assert errs == []


def test_schema_forward_check_still_applies_when_genuinely_declared():
    # The exemption only silences the reverse direction. A skill whose actual
    # subject IS schema introspection (tuyaopen-skill-maker, tuyaopen-shared)
    # must still be flagged if it declares `schema` but never has a
    # Command-column row that invokes it.
    errs = validator.check_shortcuts_agreement("tuyaopen-x", ["schema"], SHORTCUTS_BODY)
    assert any("schema" in e and "declared but unused" in e for e in errs)
