# Build and Kconfig

Own compiling, cleaning, Kconfig, linker errors and third-party source integration. Do not select wiring or claim device behavior from a successful build.

1. Keep APP root, embedded root and SDK root separate. Project CLI firmware commands receive the absolute APP root; direct tos.py commands run in the actual embedded app.
2. Read the project's real CMakeLists.txt and SDK config. aux_source_directory scans one directory; register new source directories explicitly unless the actual build already recurses.
3. Probe `tos.py config -h`. Prefer supported config set/get/list/diff operations; use real headers and Kconfig to find symbols and dependencies.
4. Board selections may select device drivers. Check resolved values before adding redundant ENABLE_* entries. Raw SoC controllers and TDL devices are different configuration layers.
5. `config choice -l` only lists; switching a config can clean. Manual config edits may regenerate using.config while leaving derived using.cmake/header files stale. Prefer config set, which invalidates those artifacts; otherwise explicitly invalidate/rebuild using the current SDK's supported clean flow. Do not claim every option edit needs a complete toolchain rebuild.
6. `tos.py check` checks tools/submodules, not whether the application's driver configuration is correct.
7. Build through the available firmware command; choose a measured timeout suitable for initial downloads. --timeout is seconds. On failure classify the result and diagnose the actual source/config/link error; do not repeatedly full-clean unrelated failures.
8. Installed libraries still need the correct CMake include/source/link wiring. Read [dependency integration](references/cmake-dependencies.md).

Read [Kconfig semantics](references/KCONFIG_GUIDE.md) and [config CLI](references/CONFIG_CLI.md) only when needed. Report the actual artifact paths and tested configuration. Flash is a separate requested action.
