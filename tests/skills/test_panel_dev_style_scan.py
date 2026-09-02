"""Regression test for tuyaopen-workflow-miniapp-dev's rpx style-scale scanner.

WHAT WENT WRONG. `scripts/validate.mjs`'s scale scan read one declaration per
source line, because it used a non-global `line.match(...)`. A rule written on
a single line — `.card { border-radius: 26rpx; padding: 18rpx; }` — therefore
had everything after the first declaration silently skipped, while the very
same pair written across two lines was flagged. Measured, not hypothesised:
before the fix the one-line file reported only `border-radius`, the two-line
file reported both. The validator ships inside a skill payload installed into
downstream projects, so an under-scan there is a false "all clear" on someone
else's code.

WHY THIS TEST SHELLS OUT TO NODE. The validator is an ES module and this
repo's whole test harness is pytest — there is no JS test runner here, and
adding one for a single scanner would be more machinery than the check is
worth. Driving the real script end-to-end also covers the part a unit test of
the regex would miss: that successive matches on one line actually advance
(the leading delimiter class has to absorb the `;` or the space after it).
"""
import os
import shutil
import subprocess

import pytest

VALIDATE = os.path.normpath(
    os.path.join(
        os.path.dirname(__file__), "..", "..",
        "skills", "miniapp", "tuyaopen-workflow-miniapp-dev", "scripts", "validate.mjs",
    )
)

# CI declares node explicitly (see .github/workflows/skills-tests.yml); this
# guard only spares a local run that has no node, and says so rather than
# passing quietly.
pytestmark = pytest.mark.skipif(
    shutil.which("node") is None, reason="node not on PATH (CI installs it via setup-node)"
)


def _run(tmp_path, less_by_name):
    """Lay out a minimal Ray panel project and return the validator's output."""
    (tmp_path / "project.tuya.json").write_text('{"name":"fixture"}\n', encoding="utf8")
    src = tmp_path / "src"
    src.mkdir()
    for name, body in less_by_name.items():
        (src / name).write_text(body, encoding="utf8")
    proc = subprocess.run(
        ["node", VALIDATE, str(tmp_path)],
        capture_output=True, text=True, timeout=120,
    )
    return proc.stdout + proc.stderr


def test_every_declaration_on_a_single_line_is_scanned(tmp_path):
    """The bug: only the first declaration on the line used to be seen."""
    out = _run(tmp_path, {"one.less": ".card { border-radius: 26rpx; padding: 18rpx; }\n"})
    assert "one.less:1  border-radius: 26rpx" in out
    # This is the assertion that fails against the pre-fix `line.match`.
    assert "one.less:1  padding: 18rpx" in out


def test_a_single_line_matches_the_same_rule_split_across_lines(tmp_path):
    """Layout must not change the verdict — that asymmetry *was* the bug."""
    out = _run(tmp_path, {
        "flat.less": ".a { border-radius: 26rpx; padding: 18rpx; }\n",
        "tall.less": ".b {\n  border-radius: 26rpx;\n  padding: 18rpx;\n}\n",
    })
    for f in ("flat.less", "tall.less"):
        assert f"{f}" in out, f"{f} produced no findings at all"
    assert out.count("border-radius: 26rpx") == out.count("padding: 18rpx")


def test_no_space_after_semicolon_still_advances(tmp_path):
    """Successive matches rely on `;` or the space after it as the delimiter."""
    out = _run(tmp_path, {"tight.less": ".c { border-radius:26rpx;padding:18rpx;font-size:29rpx }\n"})
    assert "border-radius: 26rpx" in out
    assert "padding: 18rpx" in out
    assert "font-size: 29rpx" in out


def test_on_scale_values_are_not_flagged(tmp_path):
    """Guards the fix against becoming a false-positive machine."""
    out = _run(tmp_path, {
        "ok.less": ".a { border-radius: 24rpx; padding: 16rpx; font-size: 28rpx; }\n"
                   ".b { border-radius: var(--app-radius-md); gap: 8rpx }\n",
    })
    assert "off the rpx scale" not in out
