"""Unit tests for scripts/check-domain-version-bumps.py.

Unlike its sibling `check-skill-version-bumps.py`, this script reads the repo
and git itself, so most of its behaviour needs a real repository to exercise —
CI does that end-to-end. What is unit-testable, and what is tested here, is the
part that decides *whether to complain*: the semver comparison, the fail-closed
branches, and the structural checks over a synthetic `registry.json`.

The fail-closed cases matter more than the happy paths. A gate like this rots
into a no-op the moment an unreadable git object is treated as "nothing
changed" — so `git()` returning None must produce an error, never silence.
"""

import importlib.util
import json
import os
import sys

import pytest

SCRIPT = os.path.join(
    os.path.dirname(__file__), "..", "..", "scripts", "check-domain-version-bumps.py"
)
_spec = importlib.util.spec_from_file_location("check_domain_version_bumps", SCRIPT)
checker = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = checker
_spec.loader.exec_module(checker)


@pytest.fixture(autouse=True)
def _clean_errors():
    """The module accumulates into a module-level list; reset between tests."""
    checker.errors.clear()
    yield
    checker.errors.clear()


# --------------------------------------------------------------------------
# semver comparison — the whole point of the version half
# --------------------------------------------------------------------------


def test_semver_parses_to_a_comparable_tuple():
    assert checker.semver("1.2.3") == (1, 2, 3)


def test_semver_compare_is_numeric_not_lexicographic():
    # The bug this guards: "1.10.0" < "1.9.0" under string comparison, so a
    # legitimate tenth minor release would read as a version going backwards.
    assert checker.semver("1.10.0") > checker.semver("1.9.0")
    assert checker.semver("2.0.0") > checker.semver("1.99.99")


@pytest.mark.parametrize("good", ["0.0.0", "1.0.0", "1.1.0", "10.20.30"])
def test_version_re_accepts_plain_semver(good):
    assert checker.VERSION_RE.match(good)


@pytest.mark.parametrize(
    "bad",
    [
        "v1.0.0",  # leading v — release.json's tag carries that, the version does not
        "1.0",  # two components
        "1.0.0-rc1",  # pre-release suffix
        "1.0.0+build",  # build metadata
        "01.0.0",  # leading zero
        "1.0.0 ",  # trailing space
        "",
    ],
)
def test_version_re_rejects_everything_else(bad):
    assert not checker.VERSION_RE.match(bad)


# --------------------------------------------------------------------------
# load_registry — the shapes a hand-edited registry.json actually takes
# --------------------------------------------------------------------------


def test_load_registry_accepts_a_well_formed_registry():
    text = json.dumps({"manifests": {"skills": {"url": "skills/TuyaOpen/index.json"}}})
    assert checker.load_registry(text, "x") is not None
    assert checker.errors == []


def test_load_registry_reports_unparseable_json():
    assert checker.load_registry("{not json", "x") is None
    assert len(checker.errors) == 1
    assert "not parseable" in checker.errors[0]


def test_load_registry_reports_a_missing_manifests_object():
    assert checker.load_registry(json.dumps({"schemaVersion": 1}), "x") is None
    assert "no 'manifests' object" in checker.errors[0]


def test_load_registry_rejects_a_manifests_array():
    # A list would pass a bare truthiness check and then break iteration over
    # .items() much later, with a traceback instead of a message.
    assert checker.load_registry(json.dumps({"manifests": []}), "x") is None
    assert "no 'manifests' object" in checker.errors[0]


# --------------------------------------------------------------------------
# git() — must fail closed
# --------------------------------------------------------------------------


def test_git_returns_none_for_an_unknown_object():
    # Fail-closed contract: the caller turns None into an error rather than
    # into "unchanged". A gate that silently passes on a shallow clone is worse
    # than no gate, because it reports success.
    assert checker.git("show", "definitely-not-a-ref:registry.json") is None


def test_git_reads_a_real_tracked_file():
    out = checker.git("show", "HEAD:registry.json")
    assert out is not None
    assert "manifests" in out


# --------------------------------------------------------------------------
# end-to-end against the real repo — the state this script was written for
# --------------------------------------------------------------------------


def test_structure_only_run_passes_on_the_current_tree(capsys):
    argv = sys.argv
    sys.argv = ["check-domain-version-bumps.py"]
    try:
        assert checker.main() == 0
    finally:
        sys.argv = argv
    assert "OK" in capsys.readouterr().out


def test_unknown_base_ref_fails_rather_than_passing_vacuously(capsys):
    argv = sys.argv
    sys.argv = ["check-domain-version-bumps.py", "--base-ref", "no-such-ref-xyz"]
    try:
        assert checker.main() == 1
    finally:
        sys.argv = argv
    assert "cannot read registry.json" in capsys.readouterr().err
