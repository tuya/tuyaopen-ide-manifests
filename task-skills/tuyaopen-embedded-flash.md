# Firmware and target device

Own firmware selection, identifying the target board/port, flashing, flash readback and explicit hardware reset. Runtime capture belongs to `tuyaopen-embedded-cli-debug`; credentials belong to `tuyaopen-embedded-device-auth`.

1. Establish the actual project, board/chip and current build artifact. Never choose another project's image just because its filename looks plausible.
2. Enumerate current ports. Use evidenced role/interface labels and USB identity; OS port numbers are not stable. If several physical boards remain ambiguous, ask which is the target.
3. A single-serial board shares flash/log/CLI; release the monitor before a write. On a dual-serial board distinguish flash/auth, application console and log roles; do not infer all roles solely from one number.
4. Query the installed flash schema, preview the exact target and follow its confirmation contract. --timeout is seconds; baud comes from the actual chip/link. A refusal is not permission to use an ungated fallback.
5. Flash the selected image and inspect the result. Exit zero proves the write operation, not that the application works. Hand runtime verification to debug only when requested or included in the agreed workflow.
6. Direct tyutool read/reset operations are separate actions. See [tool reference](references/TYUTOOL_CLI.md), checking the installed tool's help before using historical examples.

No ports means enumeration found no usable serial device; investigate attachment, passthrough and access rather than guessing a port or declaring the physical board absent with certainty.
