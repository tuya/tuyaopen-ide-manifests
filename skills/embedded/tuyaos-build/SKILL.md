---
name: tuyaos-build
description: >-
  Use when the user asks to build, compile, rebuild, or clean a TuyaOS
  (tuyaos-legacy) app — including Chinese prompts like「编译 tuyaos xxx 应用」
  「清理编译产物」「重新编译当前 app」, or English "build/compile/clean the TuyaOS
  app". Also use when adding custom .c/.h paths to apps/*/local.mk, wiring
  directories under software/TuyaOS/vendor/, or fixing missing headers / undefined
  references after adding sources. Runs build_app.sh/bat like Project Details
  Build / Clean. Do NOT use for TuyaOpen (tos.py) or flash/monitor.
when_to_use: >-
  Trigger on: 编译/构建/清理 + tuyaos/应用; build/compile/clean TuyaOS app;
  加入源文件/头文件/local.mk/vendor 路径; add .c/.h to TuyaOS build.
id: tuyaos-build
surfaces: [embedded]
tags: [build, clean, build_app, tuyaos, compile, local.mk, vendor, sources, headers]
default_enabled: true
related: [tyutool-cli, smart-product-dev]
---

# TuyaOS Build / Clean

Compile or clean the active **TuyaOS** app with the same command the IDE
uses on **Project Details → Build / Clean**. Also guides **custom source /
header paths** in `apps/<app>/local.mk` (including files under
`software/TuyaOS/vendor/`).

**Do not use `tos.py`** — that is TuyaOpen only.

Canonical app `local.mk` reference:
`software/TuyaOS/apps/tuyaos_demo_wukong_ai/local.mk` (complex multi-dir
pattern). Simpler apps (e.g. `tuyaos_demo_diy`) use a single
`find $(LOCAL_PATH)/src` for sources and `$(LOCAL_PATH)/include` for headers.

## Hard rules (read before any shell call)

1. **`build_app.sh` lives only under `software/TuyaOS/`.** Running
   `./build_app.sh` from the workspace root, app dir, or home will fail with
   **exit 127** / `no such file or directory: ./build_app.sh`.
2. **One shell invocation only.** Agent shells do **not** keep `cd` across
   tool calls. Never send `cd ...` as call 1 and `./build_app.sh ...` as call 2.
3. **Prefer the absolute-path form** (safest). The `cd && ./build_app.sh`
   form is allowed only if both halves are in the **same** command string.
4. **Preflight before build/clean.** If the script path does not exist, stop
   and fix `projectRoot` — do not retry the same relative path.

### Forbidden (causes exit 127)

```bash
# BAD — wrong cwd (workspace root / app folder / random)
./build_app.sh "apps/tuyaos_demo_diy" "tuyaos_demo_diy" "1.0.0"

# BAD — cd in a previous tool call; cwd is lost
cd "<projectRoot>/software/TuyaOS"
# (later tool call)
./build_app.sh "apps/..." "..." "1.0.0"
```

### Required forms

```bash
# GOOD — absolute script path (preferred)
"<projectRoot>/software/TuyaOS/build_app.sh" \
  "apps/<appName>" "<appName>" "<version>"

# GOOD — single-line cd && (also OK)
cd "<projectRoot>/software/TuyaOS" && \
  ./build_app.sh "apps/<appName>" "<appName>" "<version>"
```

## When to use

- User:「编译 tuyaos xxx 应用」「构建 / 编译 / 重新编译 tuyaos_demo_quickstart」
- User:「清理 tuyaos 编译」「clean the TuyaOS app」
- User asks to build after editing sources under `software/TuyaOS/apps/<app>/`
- User:「把 vendor 下的 .c/.h 加进编译」「local.mk 加源文件/头文件路径」
- Build fails with missing header / undefined ref after adding files outside default `src/`

## When NOT to use

| Situation | Use instead |
|-----------|-------------|
| TuyaOpen project (`tos.py`, `source/embedded/`) | `tuyaopen-build` / `tos.py build` |
| Flash firmware / serial monitor | `tyutool-cli` or Project Details Flash/Monitor |
| Create product / DP on cloud | `tuya-iot-platform` |
| End-to-end product orchestration | `smart-product-dev` |

## Project layout (quick check)

```text
<projectRoot>/
  tuya.json                          # sdk/chip metadata
  software/TuyaOS/
    build_app.sh | build_app.bat     # required — ONLY valid cwd for ./ form
    prepare_app.sh
    Makefile
    apps/
      <appName>/                     # e.g. tuyaos_demo_quickstart
        local.mk                     # ★ source/header registration lives here
        src/
        include/
        output/<version>/*.bin       # build products (after success)
    vendor/
      <TARGET_PLATFORM>/             # e.g. T5 — platform kernel/toolchain
        ... optional .c/.h you may wire from app local.mk
  .tuyaos/status.json                # optional: { "activeApp": "..." }
```

## Resolve parameters

### 1. `projectRoot`

Workspace folder that contains `software/TuyaOS/` and preferably `tuya.json`.

If the open folder is already `.../software/TuyaOS`, then
`projectRoot` is its parent parent (`../..` from TuyaOS), and the script is
still `./build_app.sh` only when your shell cwd is that TuyaOS directory.
When unsure, resolve the absolute path to `build_app.sh` with a preflight.

### 2. `appName` (directory under `apps/`)

Priority:

1. **Explicit in the user message** — e.g.「编译 tuyaos_demo_quickstart」→ `tuyaos_demo_quickstart`.
2. `.tuyaos/status.json` → `activeApp` (if non-empty string).
3. Exactly one directory under `software/TuyaOS/apps/` → use it.
4. Otherwise list `apps/*` and **ask the user** which app to build.

Verify: `software/TuyaOS/apps/<appName>/` exists. If not, stop with a clear error.

### 3. `version` (semver `x.y.z`)

Same spirit as the IDE (`normalizeFirmwareVersionForBuild`):

1. Exact git tag at HEAD of the **app** directory (strip leading `v`).
2. Else version from app `package.json` / `app.json` if present.
3. Else user-stated version, or default **`1.0.0`**.

Normalize: trim, strip leading `v`, keep first `digits.digits.digits` match;
if unparseable → `1.0.0`.

## Preflight (mandatory, same shell session as build if possible)

```bash
# 1) Prove the script exists (adjust projectRoot)
test -f "<projectRoot>/software/TuyaOS/build_app.sh" \
  || test -f "<projectRoot>/software/TuyaOS/build_app.bat"

# 2) Prove the app directory exists
test -d "<projectRoot>/software/TuyaOS/apps/<appName>"

# 3) Optional: list apps if app name is ambiguous
ls "<projectRoot>/software/TuyaOS/apps"
```

If step 1 fails: you are using the wrong `projectRoot`. Search for
`build_app.sh` under the workspace (e.g. `find . -name build_app.sh -print -quit`)
and retry with that directory as `.../software/TuyaOS`.

## Commands (authoritative)

Mirror `handleLegacyBuildAction` in the IDE (`src/tuyaos/legacyActions.ts`).

### Linux / macOS (preferred: absolute path)

```bash
# Build
"<projectRoot>/software/TuyaOS/build_app.sh" \
  "apps/<appName>" "<appName>" "<version>"

# Clean
"<projectRoot>/software/TuyaOS/build_app.sh" \
  "apps/<appName>" "<appName>" "<version>" clean
```

Equivalent single-line form (cwd set only for this process):

```bash
cd "<projectRoot>/software/TuyaOS" && ./build_app.sh "apps/<appName>" "<appName>" "<version>"
cd "<projectRoot>/software/TuyaOS" && ./build_app.sh "apps/<appName>" "<appName>" "<version>" clean
```

### Windows (CMD / agent shell)

```bat
"<projectRoot>\software\TuyaOS\build_app.bat" "apps\<appName>" "<appName>" "<version>"
"<projectRoot>\software\TuyaOS\build_app.bat" "apps\<appName>" "<appName>" "<version>" clean
```

Or:

```bat
cd /d "<projectRoot>\software\TuyaOS" && build_app.bat "apps\<appName>" "<appName>" "<version>"
cd /d "<projectRoot>\software\TuyaOS" && build_app.bat "apps\<appName>" "<appName>" "<version>" clean
```

**Argument order (required):**

| # | Arg | Example |
|---|-----|---------|
| 1 | App path relative to `software/TuyaOS` | `apps/tuyaos_demo_quickstart` |
| 2 | App name | `tuyaos_demo_quickstart` |
| 3 | Firmware version | `1.0.0` |
| 4 | Optional user cmd | omit = build; `clean` = clean |

Do not invent extra flags. Do not `cd` into `apps/<appName>` to run the script.
Arg 1 is always `apps/<appName>` relative to the **TuyaOS tree**, not an absolute path.

## Custom sources & headers (`local.mk`)

When the user adds code **outside** the paths already listed in
`apps/<app>/local.mk`, the file will **not** compile until you register it.
Edit **`software/TuyaOS/apps/<appName>/local.mk` only** (do not invent a
top-level CMakeLists for TuyaOS apps).

### Variable roles (from wukong / diy apps)

| Variable | What it holds | Notes |
|----------|---------------|--------|
| `LOCAL_PATH` | App root (`apps/<app>`) | Always `$(call my-dir)` at top; **do not reassign** |
| `LOCAL_SRC_FILES` | `.c` / `.cpp` / `.cc` **files** to compile | Explicit paths and/or `$(shell find ...)` |
| `LOCAL_TUYA_SDK_INC` | **Directories** of public headers | Dirs only — build system may recurse for `-I` |
| `LOCAL_TUYA_SDK_CFLAGS` | Extra CFLAGS for this module | Use `-I<path>` when you need **non-recursive** includes; also `-D...` |
| `LOCAL_CFLAGS` | Private CFLAGS for this module only | Prefer for flags that must not leak |
| `TUYA_SDK_INC += $(LOCAL_TUYA_SDK_INC)` | Export includes | **Required** near bottom — do not remove |
| `TUYA_SDK_CFLAGS += $(LOCAL_TUYA_SDK_CFLAGS)` | Export cflags | **Required** near bottom — do not remove |

Always keep the trailing block intact:

```makefile
TUYA_SDK_INC += $(LOCAL_TUYA_SDK_INC)  # 此行勿修改
TUYA_SDK_CFLAGS += $(LOCAL_TUYA_SDK_CFLAGS)  # 此行勿修改
include $(BUILD_STATIC_LIBRARY)
include $(BUILD_SHARED_LIBRARY)
include $(OUT_COMPILE_INFO)
```

### Path anchors

All paths in `local.mk` should be rooted on make variables — **never** hardcode
machine-absolute paths (`/home/...`).

| Location of files | Use this prefix in `local.mk` |
|-------------------|-------------------------------|
| Under the app (`apps/<app>/...`) | `$(LOCAL_PATH)/...` |
| Under TuyaOS tree (`software/TuyaOS/...`) | `$(LOCAL_PATH)/../../...` |
| Under `software/TuyaOS/vendor/...` | `$(LOCAL_PATH)/../../vendor/...` |
| Platform dir when `TUYA_PLATFORM_DIR` is set | `$(TUYA_PLATFORM_DIR)/...` (optional; prefer relative `../../vendor` when unsure) |

`LOCAL_PATH` = `software/TuyaOS/apps/<appName>`, so:

```text
$(LOCAL_PATH)/../../vendor/<platform>/...
  == software/TuyaOS/vendor/<platform>/...
```

### Recipes — add `.c` sources

**A. Single file (precise, preferred for vendor / one-off files):**

```makefile
LOCAL_SRC_FILES += $(LOCAL_PATH)/src/my_feature/foo.c
# vendor example:
LOCAL_SRC_FILES += $(LOCAL_PATH)/../../vendor/T5/some_component/src/bar.c
```

**B. Whole directory (app-local tree):**

```makefile
LOCAL_SRC_FILES += $(shell find $(LOCAL_PATH)/src/my_feature -name "*.c" -o -name "*.cpp" -o -name "*.cc")
```

**C. Whole directory under vendor:**

```makefile
LOCAL_SRC_FILES += $(shell find $(LOCAL_PATH)/../../vendor/<platform>/<component>/src \
  -name "*.c" -o -name "*.cpp" -o -name "*.cc")
```

**D. Cap depth / avoid tests & stubs** (wukong pattern — prevents shadowing real headers):

```makefile
# only top-level .c in that folder
LOCAL_SRC_FILES += $(shell find $(LOCAL_PATH)/src/wukong -maxdepth 1 -name "*.c")
```

**E. Exclude files from a broad find:**

```makefile
LOCAL_SRC_FILES := $(filter-out \
  $(LOCAL_PATH)/src/path/unwanted.c \
  , $(LOCAL_SRC_FILES))
```

Use `:=` only when intentionally **replacing** the list (board selection in
wukong). For additive wiring always prefer `+=`.

### Recipes — add `.h` include paths

**A. Public / shared headers → `LOCAL_TUYA_SDK_INC` (directory only):**

```makefile
LOCAL_TUYA_SDK_INC += $(LOCAL_PATH)/include
LOCAL_TUYA_SDK_INC += $(LOCAL_PATH)/src/my_feature/include
# vendor headers:
LOCAL_TUYA_SDK_INC += $(LOCAL_PATH)/../../vendor/<platform>/<component>/include
```

**B. Non-recursive / sensitive trees → `-I` via `LOCAL_TUYA_SDK_CFLAGS`:**

Wukong uses this so a recursive include walk does **not** pull in
`tests/` / `stubs/` that shadow real headers:

```makefile
LOCAL_TUYA_SDK_CFLAGS += -I$(LOCAL_PATH)/src/wukong
LOCAL_TUYA_SDK_CFLAGS += -I$(LOCAL_PATH)/../../vendor/<platform>/<component>/include
```

**Rule of thumb:**

- Safe, small header dirs → `LOCAL_TUYA_SDK_INC`
- Large trees with tests/stubs, or exact one-level include → `-I...` on `LOCAL_TUYA_SDK_CFLAGS`
- Always list the **directory that contains the `.h`**, not the `.h` file itself

### Worked example — wire a vendor component into the app

User:「把 `software/TuyaOS/vendor/T5/my_lib` 的源码和头文件加进 `tuyaos_demo_diy` 编译」

1. Confirm layout:

```bash
find "<projectRoot>/software/TuyaOS/vendor/T5/my_lib" \( -name '*.c' -o -name '*.h' \) | head
```

2. Edit `apps/tuyaos_demo_diy/local.mk` **before** the `TUYA_SDK_INC +=` export lines:

```makefile
# --- my_lib from vendor (agent-added) ---
LOCAL_TUYA_SDK_INC += $(LOCAL_PATH)/../../vendor/T5/my_lib/include
LOCAL_SRC_FILES += $(shell find $(LOCAL_PATH)/../../vendor/T5/my_lib/src \
  -name "*.c" -o -name "*.cpp" -o -name "*.cc")
# if only one .c:
# LOCAL_SRC_FILES += $(LOCAL_PATH)/../../vendor/T5/my_lib/src/my_lib.c
```

3. Rebuild with the absolute `build_app.sh` form (see Commands).

4. If `fatal error: xxx.h: No such file or directory` → add the **parent
   directory of that header** via `LOCAL_TUYA_SDK_INC` or
   `LOCAL_TUYA_SDK_CFLAGS += -I...`, then rebuild.
5. If `undefined reference to ...` → `.c` not in `LOCAL_SRC_FILES`; add it
   and rebuild (clean first if the link line looks stale).

### Agent workflow when user asks to “add custom paths”

1. Read current `apps/<app>/local.mk` end-to-end (or at least all
   `LOCAL_SRC_FILES` / `LOCAL_TUYA_SDK_INC` / `LOCAL_TUYA_SDK_CFLAGS` lines).
2. Locate the real `.c` / `.h` on disk (`find` under app and/or `vendor/`).
3. Choose app-relative (`$(LOCAL_PATH)/...`) vs vendor
   (`$(LOCAL_PATH)/../../vendor/...`) prefixes.
4. Append with `+=` near similar entries; **never** delete the export /
   `BUILD_*` tail.
5. Prefer explicit file lists for vendor; use `find` only when the tree is
   owned and free of tests/stubs — otherwise add `-maxdepth` or switch to
   `-I` for headers.
6. Build; on missing header / undefined ref, fix `local.mk` again (do not
   paper over with random `-I` to the workspace root).

### Do / Don't

| Do | Don't |
|----|--------|
| Edit `apps/<app>/local.mk` | Expect files under `vendor/` to auto-compile into the app |
| Use `$(LOCAL_PATH)/../../vendor/...` | Hardcode `/home/user/.../vendor/...` |
| Register **both** `.c` and header dirs | Add only sources and forget `-I` / `LOCAL_TUYA_SDK_INC` |
| Keep `TUYA_SDK_INC +=` / `BUILD_*` tail | Remove or reorder the mandatory export block |
| `+=` for additive custom paths | Blind `LOCAL_SRC_FILES := $(shell find entire vendor)` |
| Clean + rebuild after large `local.mk` changes | Assume incremental make picked up new sources |

## Worked example

User:「编译 tuyaos tuyaos_demo_quickstart 应用」

```bash
# projectRoot = .../TuyaOS-3.11.5-T5
# appName = tuyaos_demo_quickstart
# version = 1.0.0

test -f "/home/cys/TuyaOSIDE/projects/TuyaOS-3.11.5-T5/software/TuyaOS/build_app.sh"
test -d "/home/cys/TuyaOSIDE/projects/TuyaOS-3.11.5-T5/software/TuyaOS/apps/tuyaos_demo_quickstart"

"/home/cys/TuyaOSIDE/projects/TuyaOS-3.11.5-T5/software/TuyaOS/build_app.sh" \
  "apps/tuyaos_demo_quickstart" "tuyaos_demo_quickstart" "1.0.0"
```

User:「清理 tuyaos_demo_quickstart 编译」

```bash
"/home/cys/TuyaOSIDE/projects/TuyaOS-3.11.5-T5/software/TuyaOS/build_app.sh" \
  "apps/tuyaos_demo_quickstart" "tuyaos_demo_quickstart" "1.0.0" clean
```

## Success signal

- Process **exit code 0**.
- After **build**: binaries under  
  `software/TuyaOS/apps/<appName>/output/<version>/` (or `.../output/` if flat)  
  — look for `*.bin`. Report the path and names to the user.
- After **clean**: that output tree is removed or emptied; say clean finished.

First-time builds may download vendor/toolchain (can take minutes). Let the
command run; do not kill it early unless the user aborts.

## Common failures

| Symptom | Likely cause | What to do |
|---------|--------------|------------|
| **exit 127** / `no such file or directory: ./build_app.sh` | Ran `./build_app.sh` outside `software/TuyaOS`, or `cd` was a separate tool call | Use **absolute path** to `build_app.sh`, or one-line `cd ... && ./build_app.sh`; re-run preflight |
| `no app path!` / `no app name!` | Wrong args or empty app | Re-check arg order and `appName` |
| App directory not found | Typo / wrong project root | `ls "<projectRoot>/software/TuyaOS/apps"` |
| `Build script not found` / preflight `test -f` fails | Not a TuyaOS tree / wrong root | `find <workspace> -name build_app.sh` and use that parent as TuyaOS dir |
| Toolchain / vendor download fail | Network | Retry; check `vendor/` under TuyaOS |
| Build fails after code change | Stale objects | Run **clean**, then **build** |
| Used `tos.py` by mistake | TuyaOpen habit | Switch to `build_app.sh` as above |
| `fatal error: *.h: No such file` after adding code | Header dir not registered | Add dir to `LOCAL_TUYA_SDK_INC` or `-I` on `LOCAL_TUYA_SDK_CFLAGS` in app `local.mk` |
| `undefined reference to ...` after adding `.c` | Source not in `LOCAL_SRC_FILES` | `+=` the `.c` (or `find` its dir) in app `local.mk` |
| Vendor `.c` edited but not rebuilt into app | Never wired from app `local.mk` | Use `$(LOCAL_PATH)/../../vendor/...` recipes above |

## Agent checklist

1. Confirm TuyaOS project (not TuyaOpen).
2. Resolve absolute `projectRoot` and `appName` (user phrase > status.json > sole app > ask).
3. Resolve `version` → `x.y.z`.
4. If task is **add sources/headers / vendor wire-up**: edit `apps/<app>/local.mk` first (see Custom sources & headers), then build.
5. **Preflight:** `test -f .../software/TuyaOS/build_app.sh` and `test -d .../apps/<appName>`.
6. Run build/clean with **absolute script path** (or single-line `cd &&`) — never bare `./build_app.sh` from unknown cwd.
7. On success, report output `*.bin` paths (build) or clean done.
8. On exit 127: do **not** repeat the same relative command; fix path first.
9. On missing header / undefined ref after custom paths: fix `local.mk`, then clean→build.

## Related skills

- `tyutool-cli` — flash / UART after a successful build
- `smart-product-dev` — broader product workflow (not a substitute for this command card)

_Maintained in the TuyaOpen IDE skills registry (`tuyaopen-ide-manifests`). Reinstall from the IDE Skills page after registry updates._
