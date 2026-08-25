#!/usr/bin/env python3
"""Build and run a TuyaOpen LINUX project. Cross-platform replacement for build_run_linux.sh.

Usage: python build_run.py [timeout_seconds]
  timeout_seconds: default 30. Pass 0 for no timeout.

Split of responsibility (2026-08-18): the *build* half now goes through the
`tuyaopen-cli` CLI (`firmware build --stream`) when it can be resolved, falling
back to `tos.py build` only when the CLI is not reachable — never because it
failed. `--stream` (rather than `--json`) is deliberate: a `--json` build
buffers the whole build's output into one envelope printed only at the end
(the CLI's `bufferedOut` path fires whenever its own stdout is not a TTY,
which a piped subprocess always is), so a human watching this script would
see nothing until the build was already over. `--stream` emits one ndjson
line per line of build output as it happens, and the exit code is still a
faithful success signal in that mode: `cli.ts` computes it from `result.ok`/
`result.type` before it checks whether to skip printing the envelope for a
streamed command. The *run + analyze* half (executing the LINUX ELF and
scanning its stdout for error/warning/watchdog patterns) is unchanged and
stays on `subprocess` directly: the CLI has no command that runs a built
LINUX binary, only one that builds it. See skill `tuyaopen-shared` § 4 for
the unavailable-vs-refused fallback rule this file follows, and § 7 for the
`tos.py` <-> `tuyaopen-cli` command mapping.
"""
import datetime
import glob
import json
import os
import shutil
import subprocess
import sys


def _python_exe():
    """Venv Python: $OPEN_SDK_PYTHON (set by export.sh/ps1/bat), else sys.executable."""
    return os.environ.get("OPEN_SDK_PYTHON") or sys.executable


def _tos_py():
    return os.path.join(os.environ.get("OPEN_SDK_ROOT", "."), "tos.py")


def _resolve_tuyaopen():
    """Return an argv prefix that invokes the `tuyaopen-cli` CLI, or None if it
    cannot be resolved. Mirrors the resolve-once recipe in skill
    `tuyaopen-shared` § 1 (explicit override -> PATH -> the IDE-written
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

    on_path = shutil.which("tuyaopen")
    if on_path:
        return [on_path]

    wrapper_name = "tuyaopen-cli.cmd" if os.name == "nt" else "tuyaopen"
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


def _run_build():
    """Build the firmware. Returns True on success, False on failure.

    Runs `tuyaopen-cli firmware build --stream` and relays each progress line's
    `msg` to stdout as it arrives — live output, not a single envelope
    printed after the fact (see the module docstring for why `--stream`
    replaces `--json` here). Success is read from the process exit code,
    which stays a faithful signal in `--stream` mode (see module docstring).

    Falls back to `tos.py build` only when `tuyaopen-cli` cannot be resolved at
    all — never on a CLI-reported failure (see the unavailable-vs-refused
    rule in skill `tuyaopen-shared` § 4). That fallback, immediately below,
    already decides success the same way: a plain exit-code check, no output
    parsing — the `--stream` path above just applies the identical test to
    the CLI's exit code instead of `tos.py`'s.
    """
    argv = _resolve_tuyaopen()
    if argv is None:
        print("[tuyaopen CLI not found — falling back to tos.py build]")
        ret = subprocess.run([_python_exe(), _tos_py(), "build"], check=False)
        return ret.returncode == 0

    proc = subprocess.Popen(
        argv + ["firmware", "build", "--stream"],
        stdout=subprocess.PIPE,
        stderr=None,  # the CLI's own logs already go to stderr — let them hit the terminal live
        text=True,
        bufsize=1,
    )
    for line in proc.stdout:
        line = line.rstrip("\n")
        if line:
            print(_stream_line_message(line))
    proc.wait()
    return proc.returncode == 0


def find_binary():
    for pattern in ["dist/**/*.elf", ".build/bin/*"]:
        matches = [
            f for f in glob.glob(pattern, recursive=True)
            if os.path.isfile(f) and os.access(f, os.X_OK)
        ]
        if matches:
            return matches[0]
    return None


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
        print("[ERROR] No executable found in dist/ or .build/bin/")
        sys.exit(1)

    if os.path.getmtime(binary) < build_start - 1.0:
        print(f"[ERROR] Binary '{binary}' predates this build — possible stale or injected file.")
        sys.exit(1)

    log_file = os.path.join(_log_dir(), f"device_{datetime.datetime.now():%Y%m%d_%H%M%S}.log")
    print(f"\n--- Running: {binary} (timeout: {timeout}s) ---\n")

    output_lines = []
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
