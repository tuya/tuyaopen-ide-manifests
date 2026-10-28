# SDK and host environment

Use for SDK acquisition, toolchain setup and host diagnostics. Do not diagnose a running device here.

1. Use the project wrapper/explicit CLI entry or the resolver in `scripts/resolve_cli.py`. Resolve an absolute entry before changing directories. Never require the CLI to locate itself.
2. Inspect `diag doctor` and `sdk platform` for the actual SDK path, target-platform checkout and toolchain. An unset shell variable is not proof the SDK is missing. Existing firmware CLI commands may self-initialize their SDK environment.
3. Reuse the user's current SDK checkout, including a non-master branch. Do not reset local modifications or synchronize a platform to a different commit without understanding the change.
4. If an SDK/platform/toolchain download is required, explain the required resource and resolve missing user choices before starting. Do not invent download sizes.
5. For direct SDK commands, activate the real export script in the same shell and use the SDK Python. Probe `tos.py config -h`; tool support comes from this checkout, not a tag guess.
6. `tos.py check` may update submodules and hooks. It is not an application Kconfig validator or a read-only query.
7. A CLI refusal for confirmation, policy, authentication, validation or configuration must not be bypassed with tos.py. Use a fallback only when the CLI/tool genuinely is unavailable.

Raw SDK projects can use their actual tos.py interface without an IDE project descriptor. A bare external agent with no CLI, installed skill or Host integration has no automatic catalogue discovery; provide a concrete IDE/CLI setup route instead of claiming a skill was loaded.

Build configuration belongs to `tuyaopen-embedded-build`; device logs belong to `tuyaopen-embedded-cli-debug`.
