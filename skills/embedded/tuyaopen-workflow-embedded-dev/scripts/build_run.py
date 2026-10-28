#!/usr/bin/env python3
"""Build and run a TuyaOpen LINUX project. Cross-platform replacement for build_run_linux.sh.

Usage: python build_run.py [timeout_seconds]
  timeout_seconds: default 30. Pass 0 for no timeout.

IDE projects pass their descriptor root explicitly to firmware build. Raw SDK
applications use tos.py directly even when a global CLI exists. A resolved CLI
failure is never retried through a lower-level tool. Progress is read from
stderr; stdout carries one result envelope. Only an unambiguous local ELF
produced by the current build is eligible for execution.
"""
import datetime
import glob
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path


def _python_exe():
    """Venv Python: $OPEN_SDK_PYTHON (set by export.sh/ps1/bat), else sys.executable."""
    return os.environ.get("OPEN_SDK_PYTHON") or sys.executable


def _tos_py():
    return os.path.join(os.environ.get("OPEN_SDK_ROOT", "."), "tos.py")


def _resolve_tuyaopen():
    """Return an argv prefix that invokes the `tuyaopen-cli` CLI, or None if it
    cannot be resolved. Mirrors the resolve-once recipe in skill
    `tuyaopen-start` § 1 (explicit override -> PATH -> the IDE-written
    per-project wrapper found by walking up from the current directory),
    reimplemented in stdlib Python since that skill's shell-function version
    only works from a shell. Deliberately does not shell out to `node
    --version` or otherwise probe further than "does a file/executable
    exist" — a missing or broken Node install just falls through to "not
    resolved", which this script's caller already treats as the CLI-
    unavailable case.
    """
    cli_path = os.environ.get("TUYAOPEN_CLI_PATH")
    if cli_path and os.path.isfile(cli_path):
        return ["node", cli_path]

    on_path = shutil.which("tuyaopen-cli")
    if on_path:
        return [on_path]

    wrapper_name = "tuyaopen-cli.cmd" if os.name == "nt" else "tuyaopen-cli"
    current = os.getcwd()
    while True:
        candidate = os.path.join(current, ".tuyaopen", "ide", "bin", wrapper_name)
        if os.path.isfile(candidate):
            return [candidate]
        parent = os.path.dirname(current)
        if parent == current:
            return None
        current = parent


def _log_dir():
    """Write logs to <project_dir>/.target_logging/ — gitignored by SDK .gitignore."""
    log_dir = os.path.join(os.getcwd(), ".target_logging")
    os.makedirs(log_dir, exist_ok=True)
    return log_dir


def _stream_line_message(line):
    """Extract the human-readable text from one `--stream` ndjson line
    (`{"ts": ..., "phase": ..., "msg": "..."}`). Falls back to the raw line
    when it isn't JSON we understand, so an unexpected stdout line is still
    relayed rather than swallowed.
    """
    try:
        event = json.loads(line)
    except ValueError:
        return line
    msg = event.get("msg")
    return msg if msg is not None else line


def _project_root():
    current = Path.cwd()
    for candidate in [current, *current.parents]:
        if (candidate / 'tuyaopen.project.ini').is_file():
            return str(candidate)
    return None


def _run_build():
    """Use CLI only for descriptor-backed projects; never fall back after refusal."""
    project_root = _project_root()
    argv = _resolve_tuyaopen()
    if argv is None or project_root is None:
        print("[Using tos.py for this SDK application / unavailable CLI]")
        ret = subprocess.run([_python_exe(), _tos_py(), "build"], check=False)
        return ret.returncode == 0

    # Frames come off **stderr**, the envelope off stdout. They shared stdout
    # until 2026-08-27; reading frames from stdout now yields one JSON envelope
    # at the very end and nothing live, while the frames go straight to the
    # terminal as raw ndjson.
    proc = subprocess.Popen(
        argv + ["firmware", "build", "--stream", "--project-root", project_root],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
    )
    for line in proc.stderr:
        line = line.rstrip("\n")
        if line:
            print(_stream_line_message(line))
    envelope = proc.stdout.read() if proc.stdout else ""
    proc.wait()
    # The exit code is the verdict; the envelope is only worth printing when it
    # says something the frames did not (i.e. the build failed).
    if proc.returncode != 0 and envelope.strip():
        print(envelope.strip())
    return proc.returncode == 0


def find_binary():
    candidates = set()
    for pattern in ["dist/**/*.elf", ".build/bin/*"]:
        for name in glob.glob(pattern, recursive=True):
            file = Path(name)
            if file.is_symlink() or not file.is_file() or not os.access(file, os.X_OK):
                continue
            if not file.resolve().is_relative_to(Path.cwd().resolve()):
                continue
            with file.open('rb') as stream:
                if stream.read(4) == b'\x7fELF':
                    candidates.add(str(file))
    return next(iter(candidates)) if len(candidates) == 1 else None


def analyze_log(lines):
    error_count = sum(1 for l in lines if "ty E]" in l)
    warn_count  = sum(1 for l in lines if "ty W]" in l)
    wdt_count   = sum(1 for l in lines if "feed watchdog" in l)
    return error_count, warn_count, wdt_count


def main():
    timeout = int(sys.argv[1]) if len(sys.argv) > 1 else 30

    print("=== TuyaOpen LINUX Build & Run ===")

    if not os.environ.get("OPEN_SDK_ROOT"):
        print("[ERROR] Environment not activated. Source export.sh / export.bat / export.ps1 first.")
        sys.exit(1)

    if not os.path.isfile("app_default.config"):
        print("[ERROR] No app_default.config found. Run 'tos.py config choice' first.")
        sys.exit(1)

    print("--- Building ---")
    build_start = datetime.datetime.now().timestamp()
    if not _run_build():
        print("\nRESULT: Build FAILED.")
        sys.exit(1)

    binary = find_binary()
    if not binary:
        print("[ERROR] No unique executable ELF found in dist/ or .build/bin/")
        sys.exit(1)

    if os.path.getmtime(binary) < build_start - 1.0:
        print(f"[ERROR] Binary '{binary}' predates this build — possible stale or injected file.")
        sys.exit(1)

    log_file = os.path.join(_log_dir(), f"device_{datetime.datetime.now():%Y%m%d_%H%M%S}.log")
    print(f"\n--- Running: {binary} (timeout: {timeout}s) ---\n")

    output_lines = []
    timed_out = False
    try:
        with open(log_file, "w") as lf:
            proc = subprocess.Popen(
                [binary],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
            )
            try:
                out, _ = proc.communicate(timeout=timeout if timeout else None)
            except subprocess.TimeoutExpired:
                timed_out = True
                proc.kill()
                out, _ = proc.communicate()
            print(out, end="")
            lf.write(out)
            output_lines = out.splitlines(keepends=True)
    except Exception as e:
        print(f"[ERROR] Failed to run binary: {e}")
        sys.exit(1)

    print("\n--- Log Analysis ---")
    error_count, warn_count, wdt_count = analyze_log(output_lines)
    print(f"Errors (ty E): {error_count}")
    print(f"Warnings (ty W): {warn_count}")
    print(f"Watchdog feeds: {wdt_count}")
    print(f"Log saved to: {log_file}")

    if not timed_out and proc.returncode != 0:
        print(f"RESULT: Runtime failed with exit code {proc.returncode}.")
        sys.exit(1)

    if error_count > 0:
        print("\n--- Error lines ---")
        for l in output_lines:
            if "ty E]" in l:
                print(l, end="")
        print("\nRESULT: Runtime ERRORS detected.")
        sys.exit(1)

    print("\nRESULT: Run completed. No errors detected.")


if __name__ == "__main__":
    main()
