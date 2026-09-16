import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "skills", "embedded", "tuyaopen-workflow-embedded-dev", "scripts"))
import build_run


def test_analyze_log_counts_errors():
    lines = [
        "[05-25 10:00:00 ty E][main.c:10] something failed\n",
        "[05-25 10:00:01 ty W][main.c:20] minor warning\n",
        "[05-25 10:00:02 ty I][main.c:30] feed watchdog\n",
        "[05-25 10:00:03 ty I][main.c:31] feed watchdog\n",
    ]
    errors, warns, wdts = build_run.analyze_log(lines)
    assert errors == 1
    assert warns == 1
    assert wdts == 2


def test_analyze_log_empty():
    errors, warns, wdts = build_run.analyze_log([])
    assert errors == 0
    assert warns == 0
    assert wdts == 0


def test_analyze_log_no_errors():
    lines = [
        "[05-25 10:00:02 ty I][main.c:30] feed watchdog\n",
        "[05-25 10:00:03 ty I][main.c:31] mqtt connected\n",
    ]
    errors, warns, wdts = build_run.analyze_log(lines)
    assert errors == 0
    assert warns == 0
    assert wdts == 1


class _FakeEnvelopeStream:
    """The `.stdout` half: `_run_build` calls `.read()` on it once, after the
    frames are drained, so a plain string reader is the whole contract."""

    def __init__(self, text):
        self._text = text

    def read(self):
        return self._text


class _FakePopen:
    """Stand-in for `subprocess.Popen`, just enough for `_run_build`'s use.

    **The two streams carry different things.** ndjson `--stream` frames come
    off `.stderr` (iterated line by line, as real text-mode Popen would yield
    them); the single JSON envelope comes off `.stdout` and is `.read()` in
    one go. They shared stdout until 2026-08-27; this fake modelled the old
    shape until 2026-08-31, which made every test that used it raise
    `AttributeError: no attribute 'stderr'` rather than exercise anything.
    """

    def __init__(self, frames, returncode, envelope=""):
        self.stderr = iter(frames)
        self.stdout = _FakeEnvelopeStream(envelope)
        self._returncode = returncode
        self.returncode = None

    def wait(self):
        self.returncode = self._returncode
        return self._returncode


class _FakeCompletedProcess:
    def __init__(self, returncode):
        self.returncode = returncode


def _forbid_run(*args, **kwargs):
    raise AssertionError("tos.py fallback must not run here")


def _forbid_popen(*args, **kwargs):
    raise AssertionError("the tuyaopen CLI must not be spawned here")


def test_run_build_cli_present_success_streams_and_returns_true(monkeypatch, capsys):
    """CLI present, build succeeds: `--stream` lines are relayed live and
    success comes from the exit code, not a parsed envelope (there is none
    in --stream mode).
    """
    monkeypatch.setattr(build_run, "_resolve_tuyaopen", lambda: ["tuyaopen-cli"])
    captured = {}

    def fake_popen(argv, **kwargs):
        captured["argv"] = argv
        lines = [
            '{"ts": 1, "phase": "stdout", "msg": "Compiling main.c"}\n',
            '{"ts": 2, "phase": "done", "msg": "build completed"}\n',
        ]
        return _FakePopen(lines, 0)

    monkeypatch.setattr(build_run.subprocess, "Popen", fake_popen)
    monkeypatch.setattr(build_run.subprocess, "run", _forbid_run)

    assert build_run._run_build() is True
    assert captured["argv"][-3:] == ["firmware", "build", "--stream"]
    out = capsys.readouterr().out
    assert "Compiling main.c" in out
    assert "build completed" in out


def test_run_build_cli_present_failure_returns_false_without_fallback(monkeypatch):
    """CLI present, build fails: the non-zero exit code is propagated as
    False, and the tos.py fallback must never run — a CLI-reported failure
    is not the same as the CLI being unavailable.
    """
    monkeypatch.setattr(build_run, "_resolve_tuyaopen", lambda: ["tuyaopen-cli"])

    def fake_popen(argv, **kwargs):
        lines = ['{"ts": 1, "phase": "stderr", "msg": "main.c:10: error: expected \';\'"}\n']
        return _FakePopen(lines, 1)

    monkeypatch.setattr(build_run.subprocess, "Popen", fake_popen)
    monkeypatch.setattr(build_run.subprocess, "run", _forbid_run)

    assert build_run._run_build() is False


def test_run_build_falls_back_to_tos_py_when_cli_unresolvable(monkeypatch):
    """CLI cannot be resolved at all: this is the one case that legitimately
    falls back, and the fallback is a plain exit-code check on tos.py.
    """
    monkeypatch.setattr(build_run, "_resolve_tuyaopen", lambda: None)
    monkeypatch.setattr(build_run.subprocess, "Popen", _forbid_popen)

    calls = {}

    def fake_run(argv, check=False, **kwargs):
        calls["argv"] = argv
        return _FakeCompletedProcess(0)

    monkeypatch.setattr(build_run.subprocess, "run", fake_run)

    assert build_run._run_build() is True
    assert calls["argv"][-1] == "build"


def test_run_build_cli_refusal_is_not_treated_as_unavailable(monkeypatch):
    """A `confirmation`-type refusal is the CLI working correctly and
    declining on purpose (see `tuyaopen-start` § 4's unavailable-vs-refused
    rule) — it still exits non-zero, so `_run_build` reports failure, but it
    must not reach for the tos.py fallback just because the CLI said no.
    This is the scenario the fallback rule exists for, more than the plain
    happy path above.
    """
    monkeypatch.setattr(build_run, "_resolve_tuyaopen", lambda: ["tuyaopen-cli"])

    def fake_popen(argv, **kwargs):
        lines = [
            '{"ts": 1, "phase": "error", '
            '"msg": "confirmation required: re-run with --confirm <token>"}\n'
        ]
        return _FakePopen(lines, 7)  # EXIT_BY_CATEGORY['confirmation'], non-zero

    monkeypatch.setattr(build_run.subprocess, "Popen", fake_popen)
    monkeypatch.setattr(build_run.subprocess, "run", _forbid_run)

    assert build_run._run_build() is False


def test_stream_line_message_extracts_msg_field():
    assert build_run._stream_line_message('{"ts": 1, "phase": "stdout", "msg": "hello"}') == "hello"


def test_stream_line_message_falls_back_to_raw_line_when_not_json():
    assert build_run._stream_line_message("not json at all") == "not json at all"


def test_resolve_tuyaopen_prefers_explicit_env_override(monkeypatch, tmp_path):
    cli_path = tmp_path / "cli.js"
    cli_path.write_text("// fake cli entry\n")
    monkeypatch.setenv("TUYAOPEN_CLI_PATH", str(cli_path))

    assert build_run._resolve_tuyaopen() == ["node", str(cli_path)]


def test_resolve_tuyaopen_falls_back_to_path(monkeypatch, tmp_path):
    monkeypatch.delenv("TUYAOPEN_CLI_PATH", raising=False)
    monkeypatch.setattr(
        build_run.shutil, "which", lambda name: "/usr/local/bin/tuyaopen-cli" if name == "tuyaopen-cli" else None
    )

    assert build_run._resolve_tuyaopen() == ["/usr/local/bin/tuyaopen-cli"]


def test_resolve_tuyaopen_walks_up_to_project_wrapper(monkeypatch, tmp_path):
    monkeypatch.delenv("TUYAOPEN_CLI_PATH", raising=False)
    monkeypatch.setattr(build_run.shutil, "which", lambda name: None)

    wrapper_dir = tmp_path / ".tuyaopen" / "ide" / "bin"
    wrapper_dir.mkdir(parents=True)
    wrapper = wrapper_dir / "tuyaopen-cli"
    wrapper.write_text("#!/bin/sh\n")

    nested = tmp_path / "source" / "embedded"
    nested.mkdir(parents=True)
    monkeypatch.chdir(nested)

    assert build_run._resolve_tuyaopen() == [str(wrapper)]


def test_resolve_tuyaopen_returns_none_when_nothing_found(monkeypatch, tmp_path):
    monkeypatch.delenv("TUYAOPEN_CLI_PATH", raising=False)
    monkeypatch.setattr(build_run.shutil, "which", lambda name: None)
    monkeypatch.chdir(tmp_path)

    assert build_run._resolve_tuyaopen() is None
