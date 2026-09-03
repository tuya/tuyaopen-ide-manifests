#!/usr/bin/env python3
"""Deterministic CLI detection and forwarder for TuyaOpen AI Agent Skills.

Locates the `tuyaopen-cli` binary or Node.js entry point across environments
without assuming it exists on PATH.

Usage:
  # Inspect CLI location and readiness:
  python3 resolve_cli.py --info
  python3 resolve_cli.py --json

  # Directly execute any tuyaopen-cli command through the resolved CLI:
  python3 resolve_cli.py <group> <command> [flags...]
  python3 resolve_cli.py firmware list-ports --json
"""

import glob
import json
import os
import shutil
import subprocess
import sys


def find_node() -> str:
    """Locates node executable on PATH or common locations."""
    node_bin = shutil.which("node")
    if node_bin:
        return node_bin
    for candidate in [
        "/usr/local/bin/node",
        "/usr/bin/node",
        "/opt/homebrew/bin/node",
        os.path.expanduser("~/.nvm/current/bin/node"),
    ]:
        if os.path.isfile(candidate) and os.access(candidate, os.X_OK):
            return candidate
    return "node"


def resolve_cli():
    """Detects tuyaopen-cli in order of deterministic priority.

    Returns:
        dict with keys:
            - ok: bool
            - type: str ("env" | "path" | "wrapper" | "extension" | "npm")
            - command: list of strings to run (e.g. ['node', '/path/to/cli.js'] or ['/path/to/tuyaopen-cli'])
            - executable: str path to the target executable / script
            - version: str or None
            - details: dict with extra diagnostic info
    """
    node_path = find_node()

    # 1. Environment variable override
    env_cli = os.environ.get("TUYAOPEN_CLI_PATH")
    if env_cli and os.path.isfile(env_cli):
        abs_path = os.path.abspath(env_cli)
        cmd = [node_path, abs_path] if abs_path.endswith(".js") else [abs_path]
        return {
            "ok": True,
            "type": "env",
            "command": cmd,
            "executable": abs_path,
            "node": node_path,
            "details": {"source": "TUYAOPEN_CLI_PATH environment variable"},
        }

    # 2. System PATH
    cli_on_path = shutil.which("tuyaopen-cli")
    if not cli_on_path and sys.platform == "win32":
        cli_on_path = shutil.which("tuyaopen-cli.cmd") or shutil.which("tuyaopen-cli.ps1")
    if cli_on_path and os.path.isfile(cli_on_path):
        return {
            "ok": True,
            "type": "path",
            "command": [cli_on_path],
            "executable": cli_on_path,
            "node": node_path,
            "details": {"source": "PATH"},
        }

    # 3. Search upward from cwd for IDE-generated project wrapper / pointer
    curr_dir = os.path.abspath(os.getcwd())
    while True:
        ide_dir = os.path.join(curr_dir, ".tuyaopen", "ide")
        pointer_file = os.path.join(ide_dir, "tuyaopen-cli-pointer.json")
        if os.path.isfile(pointer_file):
            try:
                with open(pointer_file, "r", encoding="utf-8") as f:
                    pdata = json.load(f)
                entry = pdata.get("entry")
                if entry and os.path.isfile(entry):
                    cmd = [node_path, entry] if entry.endswith(".js") else [entry]
                    return {
                        "ok": True,
                        "type": "wrapper-pointer",
                        "command": cmd,
                        "executable": entry,
                        "node": node_path,
                        "details": {"project_root": curr_dir, "pointer": pointer_file},
                    }
            except Exception:
                pass

        bin_wrapper = os.path.join(ide_dir, "bin", "tuyaopen-cli.cmd" if sys.platform == "win32" else "tuyaopen-cli")
        if os.path.isfile(bin_wrapper) and os.access(bin_wrapper, os.X_OK):
            return {
                "ok": True,
                "type": "wrapper",
                "command": [bin_wrapper],
                "executable": bin_wrapper,
                "node": node_path,
                "details": {"project_root": curr_dir, "wrapper": bin_wrapper},
            }

        parent = os.path.dirname(curr_dir)
        if parent == curr_dir:
            break
        curr_dir = parent

    # 4. Search standard extension directories (VSCode / Cursor / Windsurf)
    home = os.path.expanduser("~")
    ext_globs = [
        os.path.join(home, ".vscode", "extensions", "tuya.tuyaopen-ide-*", "out", "cli", "cli.js"),
        os.path.join(home, ".vscode-server", "extensions", "tuya.tuyaopen-ide-*", "out", "cli", "cli.js"),
        os.path.join(home, ".cursor", "extensions", "tuya.tuyaopen-ide-*", "out", "cli", "cli.js"),
        os.path.join(home, ".cursor-server", "extensions", "tuya.tuyaopen-ide-*", "out", "cli", "cli.js"),
        os.path.join(home, ".windsurf", "extensions", "tuya.tuyaopen-ide-*", "out", "cli", "cli.js"),
    ]
    # Also check local repo dev build if standing in/near tuyaopen_ide repo
    ext_globs.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../../out/cli/cli.js")))

    for pattern in ext_globs:
        matches = sorted(glob.glob(pattern), reverse=True)
        for candidate in matches:
            if os.path.isfile(candidate):
                return {
                    "ok": True,
                    "type": "extension",
                    "command": [node_path, candidate],
                    "executable": candidate,
                    "node": node_path,
                    "details": {"source": "IDE extension directory", "path": candidate},
                }

    # 5. Global npm / tnpm package search
    try:
        npm_root = subprocess.check_output(["npm", "root", "-g"], text=True, timeout=3).strip()
        pkg_cli = os.path.join(npm_root, "@tuya", "tuyaopen-cli", "dist", "cli", "cli.js")
        if os.path.isfile(pkg_cli):
            return {
                "ok": True,
                "type": "npm",
                "command": [node_path, pkg_cli],
                "executable": pkg_cli,
                "node": node_path,
                "details": {"source": "global npm module", "path": pkg_cli},
            }
    except Exception:
        pass

    return {
        "ok": False,
        "resolved": False,
        "error": "TuyaOpen CLI not found in environment, PATH, project wrapper, or extensions.",
        "remediation": [
            "1. Open this project in TuyaOpen IDE once to auto-generate the .tuyaopen/ide/bin wrapper",
            "2. Or install globally: npm i -g @tuya/tuyaopen-cli --registry https://registry-npm.tuya-inc.top/",
            "3. Or set environment variable TUYAOPEN_CLI_PATH=/path/to/cli.js",
        ],
    }


def main():
    res = resolve_cli()

    # If asking for detection info
    if len(sys.argv) > 1 and sys.argv[1] in ("--info", "--json", "-j"):
        if res.get("ok"):
            # Probe version
            try:
                ver_out = subprocess.check_output(res["command"] + ["--version", "--json"], text=True, timeout=5)
                vdata = json.loads(ver_out)
                res["version"] = vdata.get("version") or vdata.get("data", {}).get("version")
            except Exception:
                res["version"] = "unknown"
        print(json.dumps(res, indent=2, ensure_ascii=False))
        sys.exit(0 if res.get("ok") else 1)

    # If not found
    if not res.get("ok"):
        sys.stderr.write(f"Error: {res['error']}\n\nRemediation:\n")
        for rem in res.get("remediation", []):
            sys.stderr.write(f"  {rem}\n")
        sys.exit(1)

    # If no args passed, print usage and detection result
    if len(sys.argv) == 1:
        print(f"TuyaOpen CLI resolved successfully via {res['type']}:")
        print(f"  Command: {' '.join(res['command'])}\n")
        print("Usage:")
        print(f"  python3 {os.path.basename(__file__)} <group> <command> [flags...]")
        print("  Example: python3 resolve_cli.py firmware list-ports --json")
        sys.exit(0)

    # Forward all args to the resolved CLI
    cmd = res["command"] + sys.argv[1:]
    try:
        # On POSIX, exec replaces current process; on Windows, use subprocess
        if hasattr(os, "execv") and sys.platform != "win32":
            os.execv(cmd[0], cmd)
        else:
            proc = subprocess.run(cmd)
            sys.exit(proc.returncode)
    except Exception as e:
        sys.stderr.write(f"Failed to execute {cmd}: {e}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
