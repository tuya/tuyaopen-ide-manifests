# Running device diagnostics

Own log capture, runtime CLI, panic/stack decoding and behavior diagnosis. Host setup belongs to env-setup; flashing is a separate action.

1. Read existing logs and establish the current firmware/port/baud. Prefer interrogating an already running device over rebuilding it merely to obtain state.
2. Plain firmware monitor is read-only; headless --duration bounds capture. --reset restarts the device and requires its actual confirmation. It attempts sys_reboot and may fall back to hardware reset.
3. tal_cli_init starts the console. In the verified SDK sys_reboot is a base command outside CLI_CMD_SYS; extended sys/fs/kv commands need the relevant enabled options. Always ask help for this firmware's actual commands.
4. Capture before reset when a complete boot log is needed. On dual-port boards the log and CLI may use separate ports/bauds. On one port serialize monitor, CLI and flash access.
5. Read the command's returned logFile. A custom boot.log is not automatically under .target_logging. Background monitor_helper owns a different session/log protocol and may require a controlling terminal; verify readiness.
6. Use the matched debug ELF and toolchain for crash addresses. Do not relink a different build and claim it decodes the flashed binary.
7. Classify errors from source and evidence. client no active tests client activation, not necessarily missing credentials. A warning is investigated in context, not automatically a failed device.

Use this payload's [CLI reference](references/CLI_DEBUG.md), [crash decoding](references/CRASH_DECODE.md) and scripts/ only when needed. Never print AuthKey values from authorization/status output. Report observed behavior and unavailable physical checks separately.
