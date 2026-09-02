---
name: tuyaopen-embedded-cli-debug
description: >-
  Debug a running TuyaOpen device: register firmware features as device CLI
  commands and drive them over the serial shell (`tal_cli`), capture serial
  logs in the background without blocking, and decode a crash dump's PC/LR/
  stack addresses to source `file:line` via addr2line. Use when the firmware
  builds and runs but does the wrong thing, when you want to exercise a
  feature on the device without reflashing, or when a panic dump needs
  decoding. **Environment triage is not here** — `diag doctor` / `diag export`
  diagnose the CLI and the host, and live in skill `tuyaopen-start`.
  调试正在运行的设备：把固件功能注册成设备 CLI 命令并通过串口驱动它们、
  非阻塞后台抓串口日志、把崩溃转储的 PC/LR/栈地址用 addr2line 还原成
  源码文件与行号。环境诊断（diag doctor / diag export）不在这里，在
  tuyaopen-start。
license: Apache-2.0
compatibility:
  - tuyaopen CLI, either form — see skill `tuyaopen-start` § 1
  - TuyaOpen environment activated (export.sh / export.ps1 / export.bat) for the device-side tools
  - Python 3 (stdlib only for background log capture; pyserial for the CLI-debug script — `pip install pyserial`)
  - Device connected via USB serial, for the device-facing sections
---

# TuyaOpen Diagnose

Covers the CLI groups `diag doctor` / `diag export` / `diag doctor` /
`firmware list-ports` / `firmware monitor`, plus three absorbed
device-debugging skills that all answer "something's wrong, now what" and
used to overlap without a clear boundary: serial log capture, sending
ad-hoc commands to the device's CLI, and decoding a crash dump. Pick
the section that matches the symptom:

| Symptom | Section |
|---|---|
| "Is my dev environment set up right?" / "which CLI am I even running?" | § 1 `diag doctor` |
| "I need to attach diagnostics to a bug report" | § 2 `diag export` |
| "I just want to watch device logs live" | § 3 Foreground |
| "I want the device's boot/runtime log without blocking my terminal" | § 3 Background / non-blocking |
| "I want to poke the running device — dump KV, check heap, force a reset" | § 4 Send commands to the device CLI |
| "The device pasted a panic/hard-fault dump with hex addresses" | § 5 Decode a crash dump |

For the CLI's envelope, exit codes, and self-discovery (`schema get`), see
skill `tuyaopen-start` — not repeated here.

## Shortcuts — `tuyaopen-cli firmware`

| Intent | Command |
|---|---|
| List serial ports (for § 2/§ 3 port selection) | `tuyaopen-cli firmware list-ports --chip <chip>` |
| Foreground serial monitor | `tuyaopen-cli firmware monitor --port <port>` |

Flags aren't listed here — run `tuyaopen-cli schema get --group <g> --command <c>`
for the current set. Resolve `tuyaopen-cli` first per skill `tuyaopen-start` § 1
(it is usually not on `PATH`).

> **Looking for `diag doctor` / `diag export` / `diag doctor`?** They moved to
> skill `tuyaopen-start` — they diagnose the CLI and the host, not the device.
>
> **No CLI?** `tos.py monitor -p <port>` covers the foreground monitor. See
> skill `tuyaopen-start` § 7 for the rest of the coverage map.

## 0. 先把设备 CLI 打开、初始化，再谈调试

设备端的串口 CLI **默认是关的**，而且"编进固件"和"跑起来"是两件事 —— 两件都做了它才应答。
本节是这个技能所有内容的前置。

### 0.1 两道独立的门，别只看一道

设备上有没有 CLI，取决于**两件互不相干的事**。调试时"没反应"先分清是哪一道没过。

#### 门 1：应用得调 `tal_cli_init()` —— 决定有没有 `tuya> ` 提示符

CLI 子系统**不会自动起来**。应用的 main 里必须有：

```c
#include "tal_cli.h"
...
tal_cli_init();          // 默认 UART0；或 tal_cli_init_with_uart(n)
```

没有这一句，串口上**一个提示符都不会有**，跟 Kconfig 怎么配没有关系。
`apps/tuya_cloud/switch_demo` 的骨架里带了这句，所以从它抄来的工程会"莫名其妙就有
CLI"；从零写的 main 则没有。

#### 门 2：`CONFIG_ENABLE_SERIAL_CLI_CMD` —— 决定有多少条命令

过了门 1 之后，**默认只有八条**：

```
help  cmd  hello  version  sys_log_enable  sys_reboot  auth  read_mac
```

`sys_log_enable` 和 `sys_reboot` 在 `cli_cmd.c` 命令表里位于
`#if defined(CLI_CMD_SYS)` **之上**，所以这两条不受 Kconfig 影响；`auth` /
`auth-read` / `read_mac` 来自 `tuya_authorize.c`，同样无条件注册。ESP32-S3 实测：
`# CONFIG_ENABLE_SERIAL_CLI_CMD is not set` 的固件上 `help` 回的正是这八条，固件自己
还打了一句
`if you want to see more commands(sys_*, fs_*, kv_*), please turn on ENABLE_SERIAL_CLI_CMD in Kconfig`。

打开总开关才有另外三组：

```
CONFIG_ENABLE_SERIAL_CLI_CMD=y     # 总开关，SDK 里 default n
CONFIG_SERIAL_CLI_STACK_SIZE=3072  # CLI 线程栈，默认 3072
CONFIG_CLI_CMD_SYS=y               # sys_* 组：状态/堆/线程/版本/IoT/WiFi，默认 y
CONFIG_CLI_CMD_FS=y                # fs_*  组：ls/cat/write/rm…，默认 y
CONFIG_CLI_CMD_KV=y                # kv_*  组：get/set/del/list，默认 y
```

三个 `CLI_CMD_*` 都 `default y`，但**只在总开关打开时才存在**（Kconfig 里它们包在
`if (ENABLE_SERIAL_CLI_CMD)` 内）。所以某条 `sys_*` 找不到有三种成因，按这个顺序查：
应用没调 `tal_cli_init()` → 总开关没开 → 那一组被单独关了。完整命令清单见
[references/CLI_DEBUG.md](references/CLI_DEBUG.md)。

**开发期两道门都打开。** 打开之后 agent 可以直接驱动设备验证功能，而不是只能
"编译→烧录→读日志猜"：`sys_iot_report_dp` 上报一个 DP 看面板反应、`sys_wifi_info`
看设备眼里的 AP、`sys_heap` / `sys_thread` 查内存和栈、`kv_list` 看持久化。量产前
关掉总开关（`tal_cli_init()` 是否保留另行决定）。

写进工程的 `app_default.config`（或 `config/<BOARD>.config`），**不要**去改 SDK 里的
`Kconfig`：那是 vendored 文件，`tuyaopen-cli sdk update` 会把你的改动冲掉。

### 0.2 初始化：Kconfig 只负责编进去，还得有人调它

**这是最容易漏的一步**，而且症状和"没开 Kconfig"一模一样：串口敲命令没有任何回应。

```c
#include "tal_cli.h"

// 在 tuya_main.c 的初始化流程里，串口可用之后
tal_cli_init();                    // 默认走 TUYA_UART_NUM_0
// 或者指定串口：
tal_cli_init_with_uart(1);
```

SDK 里的实例：`apps/tuya.ai/your_chat_bot/src/tuya_main.c`、`your_otto_robot`、
`your_desk_emoji`、`your_robot_dog`、`duo_eye_mood` 都在 `tuya_main.c` 里调了
`tal_cli_init()`。

> **反例值得记住**：`apps/tuya.ai/your_serial_chat_bot/src/tuya_main.c` 里这一行是
> **被注释掉的** —— 那个 app 把串口用作聊天通道，CLI 会和它抢同一个 UART。
> 如果你的应用也在用 UART0 做别的事，用 `tal_cli_init_with_uart(<其他串口号>)`，
> 不要两个都往 UART0 上挂。

### 0.3 把功能注册成 CLI 命令 —— 这是本技能的主要用法

不用为了试一个功能就重新烧一遍板子：把它注册成一条 CLI 命令，烧一次，之后从串口反复触发。

```c
#include "tal_cli.h"

static void cmd_led(int argc, char *argv[])
{
    if (argc < 2) { PR_NOTICE("usage: led <on|off>"); return; }
    led_set(strcmp(argv[1], "on") == 0);
    PR_NOTICE("led -> %s", argv[1]);
}

static void cmd_dp_report(int argc, char *argv[])
{
    // 手动上报一个 DP，免去"改代码 → 编译 → 烧录"一整轮
    ...
}

static const cli_cmd_t s_app_cmds[] = {
    { .name = "led",       .help = "led <on|off> — toggle the indicator", .func = cmd_led },
    { .name = "dp_report", .help = "dp_report <code> <value>",            .func = cmd_dp_report },
};

// 紧跟在 tal_cli_init() 之后
tal_cli_cmd_register(s_app_cmds, sizeof(s_app_cmds) / sizeof(s_app_cmds[0]));
```

契约就三样（`src/tal_cli/include/tal_cli.h`）：

| | 签名 |
|---|---|
| 回调 | `typedef void (*cli_cmd_func_cb_t)(int argc, char *argv[]);` |
| 命令项 | `cli_cmd_t { char *name; char *help; cli_cmd_func_cb_t func; }` |
| 注册 | `int tal_cli_cmd_register(const cli_cmd_t *cmd, uint8_t num)` |

**几条实践约束：**

- `argv[0]` 是命令名本身，参数从 `argv[1]` 起 —— 和 `main()` 一样。
- 数组要 `static`（或全局）：`tal_cli_cmd_register` 记的是指针，**栈上的数组注册完就悬空**。
- 回调在 CLI 线程上跑，栈是 `CONFIG_SERIAL_CLI_STACK_SIZE`（默认 3072）。里面**不要**做长阻塞
  或深递归 —— 要么栈溢出，要么把 CLI 卡死，表现又是"没有回应"。
- 一条命令做一件事，把状态打出来。你和后面的 `cli_debug.py` 都靠 stdout 判断结果。

**为什么值得做**：一轮"改代码 → 编译 → 烧录"在真板子上是分钟级；一条 CLI 命令是秒级。
只要要试的东西超过一次，注册成命令就是划算的。

## 1. Environment triage is **not** here

`tuyaopen-cli diag doctor` and `diag export` diagnose the **CLI and the host** —
which binary is running, whether the SDK env is warm, whether credentials
exist. That is not device debugging, and it is needed by every skill rather
than by this one, so it lives in skill `tuyaopen-start` § *Environment and
diagnostics*. Go there when the question is "why is my setup wrong".

This skill starts one step later: **the firmware builds and runs, and you need
to see or steer what it is doing.**

## 2. Monitor / capture device serial logs

`tuyaopen-cli firmware monitor` behaves differently depending on whether it has
a terminal, and the difference is the whole point of this section.

### With a terminal (a human at a shell)

```bash
tuyaopen-cli firmware monitor --port <port> [--baud <rate>] [--log]
```

Blocking — it inherits your terminal's stdin, Ctrl+C to exit. Pass `--log`
to also tee output to `source/embedded/monitor.log` (or `--log-file <path>`).
No gate for a plain capture; `--reset` needs `--yes`, because it restarts the
device. It is also **exempt from the CLI's task kill-timer** (the timeout its
`firmware` siblings `build`/`clean`/`flash` get) because it is meant to run
indefinitely in the foreground — don't treat it as a bounded command that will
eventually return on its own.

### Without a terminal (you, in almost every case)

**The same command.** With no terminal — or whenever you pass `--log-file`,
`--reset`, `--duration` or `--stream`, or pipe stdout — it does not spawn
`tos.py monitor` at all; it captures the port directly instead:

```bash
tuyaopen-cli firmware monitor --port <port> \
    --log-file boot.log --reset --yes --duration 20 --json
```

`--reset` needs `--yes` (it restarts the device) and `--duration` bounds the
capture — without it the command runs until something kills it, and a caller
reaching for `timeout` gets exit 124 and no result envelope.

- `--reset` restarts the device first, so the log starts at boot rather than
  mid-session. It sends **`sys_reboot` over the device's own CLI** — the soft
  path, which keeps the serial port open all the way through the restart. Only
  if no CLI answers does it fall back to pulsing DTR/RTS.
- `--log-file` is what you read afterwards; stdout stays a single JSON envelope.

**Why this exists.** `tos.py monitor` is pyserial's `miniterm`, whose
`Console()` constructor calls `termios.tcgetattr(stdin)`. With no controlling
terminal that raises `termios.error: (25, 'Inappropriate ioctl for device')`
before a single line is printed — and inheriting a *non*-TTY stdin reproduces
the crash rather than avoiding it. Beta round 6 hit exactly this, found the
`monitor_helper.py` fallback below had the same dependency, and ended up
hand-writing a pyserial capture script. Don't repeat that: the CLI does it now.

**Why `--reset` prefers the soft path.** On a USB-JTAG board (ESP32-S3 and
friends) a DTR/RTS reset re-enumerates the USB device — the port disappears and
comes back, and roughly the first 300 ms of the boot log is gone with it.
Measured: three consecutive hard-reset captures all opened at
`I (310) esp_image`, byte-identical, with no `ESP-ROM:` banner. The same
captures via `sys_reboot` include the banner. See § 0.1: `sys_reboot` needs no
Kconfig option, but it does need the application to have called
`tal_cli_init()` — when that call is missing there is no console to answer and
the DTR/RTS fallback is what actually runs. That is the practical argument for
putting `tal_cli_init()` in your main during bring-up.

### Background / non-blocking


For capturing logs while doing something else — e.g. flashing on another port —
neither the CLI nor `tos.py` has a detached/background monitor mode. A helper
script wraps `tos.py monitor -l` as a detached background process so an agent
can flash on one port while a monitor keeps logging on another.

> **Prefer the headless `firmware monitor` above when you only need a capture.**
> `monitor_helper.py` wraps `tos.py monitor`, so it inherits the termios
> requirement described above and dies the same way in a sandbox with no TTY.
> Reach for it only for the genuinely-concurrent case (two ports at once), and
> expect to check that it actually started.

Installed at:

```
.agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py
```

```bash
# Start (auto-names the log file if -l is omitted)
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py start -p /dev/ttyACM1

# Read the last 200 lines (JSON output for agent parsing)
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py --json tail -n 200

# Stop — releases the serial port
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py stop

# Check whether a session is already running
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py status
```

Add `--json` before the subcommand for machine-readable output. No extra
dependencies — Python stdlib only.

**`start` blocks until the monitor is actually up — never follow it with a
`sleep`.** It returns only once the process is alive *and* the log file it was
told to write exists (up to `--ready-timeout`, default 8 s), and reports:

| field | meaning |
|---|---|
| `ready: true`, `reason: "ready"` | logging has begun — go straight to `tail` |
| `ready: false`, `reason: "log-not-created-yet"` | alive, nothing written yet. A silent device is legitimate; poll `tail` |
| `ok: false`, `reason: "exited"` | it died on startup. `exit_code` + `startup_tail` carry the reason, and no session is left behind |

`status` answers the same question after the fact, with `reason` one of
`running` / `stopped` / `exited-before-logging` / `exited` / `no-session` —
so a monitor **you** stopped is distinguishable from one that crashed, which a
bare `running: false` never was. When it is not running and you did not stop
it, `startup_tail` is included.

<code data-type="tag" style="color:#faad14">内测第五轮：`start` 报成功，`.target_logging/` 里什么都没有</code>

This is why. `start` used to answer the instant the process was spawned, with
the child's stdout and stderr on `DEVNULL` — so a monitor that died immediately
(wrong cwd, port already held) reported `ok: true` with an already-dead PID and
threw away every word explaining why, while `status` kept serving the stale PID.
Callers compensated with `sleep 8`, which is a guess that fails in both
directions: too short and you read an empty log, too long and you wait for
nothing.

### 从头抓启动日志 —— 先起监控，再复位

<code data-type="tag" style="color:#faad14">内测第四轮：日志从中间抓起，启动阶段全在可见窗口之外</code>

A monitor attached to an already-running device **joins mid-stream**. Everything
that decides whether the firmware is healthy has already scrolled past: the
board banner, peripheral registration (`tdl_button_create` / `tdl_led_find_dev`
succeeding or not), and the first `client no active`. Tailing more lines does
not help — the device is not reprinting them.

So make the log start where you want it to. **Attach first, then reset:**

```bash
# 1. background monitor on the log port — does not hold your terminal
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py start -p /dev/ttyACM1

# 2. reset over the device CLI (§ 3) — the log now begins at the boot banner
python .agents/skills/tuyaopen-embedded-cli-debug/scripts/cli_debug.py --json send "sys_reboot"

# 3. read from the reset line down
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py --json tail -n 400
```

**Two ports, two roles** — `sys_reboot` goes to the **CLI port at 115200**, the
monitor sits on the **log port at the platform's own baud**. On a dual-serial
board (T5AI: `ttyACM0` + `ttyACM1`) both can be open at once, which is the whole
point. On a single-serial board they contend: reset by power-cycling instead,
or `stop` the monitor, send the reset, and restart it — accepting that you lose
the first few lines.

**No serial CLI in this firmware?** `sys_reboot` needs
`CONFIG_ENABLE_SERIAL_CLI_CMD=y` plus `tal_cli_init()` — see § 0. Until then,
power-cycle the board by hand and say in your report that the log starts at a
power-on rather than a software reset. Turning the CLI on is usually worth it:
it is also what lets you *drive* a peripheral instead of only watching it boot.

**Log location**: `<project_dir>/.target_logging/` (found by searching upward
from the cwd for `app_default.config`), gitignored by the SDK's unanchored
`.target_logging` rule regardless of project depth:

```
<project_dir>/.target_logging/
├── session.json              # active session: PID + log path
└── YYYYMMDD_HHMMSS.log       # auto-named per session
```

Only one session runs at a time — starting a new one stops the previous.

**Port selection** — group `tuyaopen-cli firmware list-ports --chip <chip> --json`
output the same way as skill `tuyaopen-embedded-flash`: a single-serial board's one
port carries flash, auth, and log together (so `stop` this session before a
flash on that board); a dual-serial board (e.g. T5AI) can keep this monitor
running on the log port while flashing the other. `tuyaopen-cli firmware
list-ports` output is coarser than the raw `tyutool_cli list-ports --json`
(no `usbSerial`/`usbInterface`) — see skill `tuyaopen-embedded-flash` § 1 / § 4 when
you need the authoritative grouping.

**Log analysis patterns**:

| Pattern | Meaning | Action |
|---|---|---|
| `[... ty E]` | Error-level log | Analyze message and source location |
| `[... ty W]` | Warning | Usually non-fatal; investigate if repeated |
| `feed watchdog` | Heartbeat (~10s) | **Normal** — device is alive |
| `OPRT_` + negative number | SDK operation failed | Cross-reference the code (device firmware source) |
| `mqtt connected` | Cloud connected | **Success** |
| No output after start | Wrong port or wrong baud | Swap ports; check the chip's monitor baud (§ 2.3 `list-ports --chip`) |

## 3. Send commands to the device CLI (`tal_cli` over UART)

For inspecting live device state (heap, KV store, filesystem, threads) without
opening a foreground monitor — `sys_reboot`, `kv_list`, `fs_ls`, or any custom
command the firmware registers. Full reference, options, and troubleshooting:
[references/CLI_DEBUG.md](references/CLI_DEBUG.md). Script installed at
`.agents/skills/tuyaopen-embedded-cli-debug/scripts/cli_debug.py` (needs `pip install
pyserial`; requires firmware built with `CONFIG_ENABLE_SERIAL_CLI_CMD=y`).

```bash
python .agents/skills/tuyaopen-embedded-cli-debug/scripts/cli_debug.py --json help
python .agents/skills/tuyaopen-embedded-cli-debug/scripts/cli_debug.py --json send "sys_heap"
```

**Baud is always 115200** — `tal_cli` hardcodes it on every platform,
independent of the platform-specific log/monitor baud used in § 2. If the
port is busy, stop the § 2 monitor session (or any foreground `tos.py
monitor`) first — see [references/CLI_DEBUG.md](references/CLI_DEBUG.md) for
the full port-busy / port-selection detail.

## 4. Decode a crash dump (PC/LR/stack → source `file:line`)

When firmware panics, the serial log dumps raw register values (`PC`, `LR`,
sometimes `EPC1/2/3` for Xtensa) plus stack frame snapshots. Turning those
into source locations needs the **debug ELF** from the same build and the
matching per-platform `addr2line` — both already sit in the TuyaOpen tree
after one `tos.py build`. Full step-by-step (platform identification,
locating the toolchain and ELF, the `addr2line` invocation, extracting
candidate addresses from a raw dump, common gotchas):
[references/CRASH_DECODE.md](references/CRASH_DECODE.md).

```bash
ADDR2LINE=TuyaOpen/platform/tools/gcc-arm-none-eabi-10.3-2021.10/bin/arm-none-eabi-addr2line
$ADDR2LINE -e <debug.elf> -f -C -i 0x021d8e96 0x021d5863
```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Background monitor shows no output | Wrong port or baud | Check with `firmware list-ports --chip <chip>`; swap ports on a dual-serial board |
| **No response to any command** | Three distinct causes, in the order to check them: (1) `CONFIG_ENABLE_SERIAL_CLI_CMD=y` missing from the project `.config`; (2) **`tal_cli_init()` never called** in `tuya_main.c` — compiled in but never started, identical symptom; (3) wrong port/baud | § 0.1, § 0.2, then `firmware list-ports` |
| A specific group is missing (`sys_*` / `fs_*` / `kv_*`) but others answer | That group's own switch is off — `CONFIG_CLI_CMD_SYS` / `_FS` / `_KV` | § 0.1 |
| CLI works, then the app's own serial output garbles it | Two things on the same UART | `tal_cli_init_with_uart(<other>)` — see the `your_serial_chat_bot` counter-example in § 0.2 |
| A registered command hangs the CLI, or resets the device | Callback blocks, or overruns `CONFIG_SERIAL_CLI_STACK_SIZE` (default 3072) | Keep callbacks short and non-blocking; raise the stack only if you know why |
| Registered command not found after a rebuild | Command array was on the stack — `tal_cli_cmd_register` stores the pointer | Make the array `static` (§ 0.3) |
| `addr2line` output is all `??` | Debug ELF doesn't match the flashed binary | Re-flash + reproduce, or checkout the exact commit and rebuild — see [references/CRASH_DECODE.md](references/CRASH_DECODE.md) |
| Port busy across § 3/§ 4 | Single-serial board — only one of monitor/CLI-debug/flash can hold the port at a time | `stop` whichever session is running before starting the next |

## Scripts

| Script | Absorbed from | Purpose |
|---|---|---|
| `scripts/monitor_helper.py` | `tuyaopen-debug-helper` | Non-blocking background serial log capture (§ 3) |
| `scripts/cli_debug.py` (+ `requirements.txt`) | `tuyaopen-cli-debug` | Send commands to the device's `tal_cli` over UART (§ 4) |

> The "Absorbed from" ids are **retired**. They survive only as aliases in the
> catalogue, so `skills install --ids tuyaopen-debug-helper` still resolves —
> but nothing is ever installed *under* those names. The scripts live at
> `.agents/skills/tuyaopen-embedded-cli-debug/scripts/…`, and a path built from
> a retired id points at nothing. (That is not hypothetical: the downstream
> project template shipped `…/tuyaopen-debug-helper/scripts/monitor_helper.py`
> to every new project until 2026-08-20.)

## References

- [references/CLI_DEBUG.md](references/CLI_DEBUG.md) — full `tal_cli` command reference, absorbed from `tuyaopen-cli-debug`.
- [references/CRASH_DECODE.md](references/CRASH_DECODE.md) — full crash-decode walkthrough, absorbed from `tuyaopen-crash-decode`.
