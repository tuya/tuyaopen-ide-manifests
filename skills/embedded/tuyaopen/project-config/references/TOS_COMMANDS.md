# tos.py Command Reference

Rows marked **†** exist only on newer SDKs. Confirm with `tos.py config -h` (its subcommand list is the answer) before using them — never infer availability from `tos.py version`. See `../SKILL.md` § *Which config commands does this SDK have? — ask the SDK*.

| Command | Interactive | Description |
|---------|:-----------:|-------------|
| `tos.py version` | No | Show version (git tag-commit) |
| `tos.py check` | No | Verify tool versions + download submodules |
| `tos.py new project` | **Yes** | Create new app project from template |
| `tos.py new board` | **Yes** | Create new board BSP |
| `tos.py new platform` | **Yes** | Scaffold new platform port |
| `tos.py config choice` | **Yes** | Select a verified config (interactive) |
| `tos.py config choice -c <name>` | No | Select config by name (Agent/CI, non-interactive) |
| `tos.py config choice -d` | **Yes** | Select from board default configs only |
| `tos.py config choice -d -c <name>` | No | Select board default config by name (Agent/CI) |
| `tos.py config choice -l` | No | List available config names and exit (no clean) — **†** |
| `tos.py config menu` | **Yes** | Visual Kconfig editor |
| `tos.py config save` | **Yes** | Save current config as named preset (prompts for name) |
| `tos.py config save -n <name> [-f]` | No | Save preset non-interactively; `-f` to overwrite — **†** |
| `tos.py config set NAME=VALUE ...` | No | Dependency-aware assignment, all-or-nothing — **†** |
| `tos.py config set -u NAME` | No | Revert a symbol to its Kconfig default — **†** |
| `tos.py config get NAME ...` | No | Print value(s); `-a` for type/prompt/deps, `-j` for JSON — **†** |
| `tos.py config list [-p PATTERN]` | No | Dump effective config; substring or glob filter, `-j` for JSON — **†** |
| `tos.py config diff A [B]` | No | Semantic diff of two configs, expanded through Kconfig — **†** |
| `tos.py build` | No | Build current project (see skill `tuyaopen/build`) |
| `tos.py build -v` | No | Build with verbose output |
| `tos.py clean` | No | Clean build artifacts (ninja clean) |
| `tos.py clean -f` | No | Full clean (delete `.build/`) |
| `tos.py flash -p <port>` | No | Flash firmware non-interactively (see skill `tuyaopen/dev-loop`) |
| `tos.py flash` | **Yes** | Flash firmware (prompts for port if not specified) |
| `tos.py monitor -p <port>` | No | View serial logs non-interactively (see skill `tuyaopen/dev-loop`) |
| `tos.py monitor` | **Yes** | View serial logs (prompts for port if not specified) |
| `tos.py update` | No | Sync platform dependencies to pinned commits |
| `tos.py dev bac` | No | Build all configs (testing) |
| `tos.py idf <cmd>` | Varies | Pass-through to ESP-IDF `idf.py` (ESP32 only) |
| `tos.py -d <cmd>` | — | Run any command with debug logging |

## `tos.py new platform` Details

Scaffolds a new platform port with toolchain templates.

Flow:
1. Prompts for platform name.
2. Creates `platform/<name>/` with adapter templates and `.gitignore`.
3. Opens menuconfig to select platform capabilities.
4. Generates porting skeleton (`tuyaos_adapter/`) based on selected features.
5. Creates `boards/<name>/` with board Kconfig.

This is an advanced operation — see official docs for the full porting guide.
