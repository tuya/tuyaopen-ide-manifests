## State: built — prove it runs, then bring it online

**Goal:** a device the user can control from their phone. This state existed
implicitly and that was the bug: the state machine above ended at "it
compiles", so nothing owned the question "when do we get the device onto the
cloud", and beta round 2's agent asked for an authorization code in its very
first turn — before the project directory existed.

Round 4 then showed the opposite failure: the agent reached `build` exit 0,
ran `license list`, saw `[]`, and wrote a **completion report** without
flashing anything. So read this first:

> ### Two things this state is NOT allowed to do
>
> 1. **Do not write a completion report before Step 6.** "Compiles" is not
>    "works". The Definition of Done is at the bottom of this section and it
>    is a checklist, not a suggestion.
> 2. **Do not treat "no authorization code" as a reason to stop.**
>    **Flashing needs no code.** Everything the user can see with their own
>    eyes — screen UI, LED, button, the state machine, KV persistence — runs
>    on a device that has never touched the cloud. Only the last two steps
>    need a code.

```
Steps 1-3   flash → capture a full boot log → verify the peripherals    ← no code, no cloud, no user
Steps 4-5   ask for a code → authorize → read it back                   ← needs the user to supply a code
Step  6     hand over provisioning + the evidence                       ← needs the user's phone
```

### Step 1 — Flash

**No authorization code is required to flash.** Do it now.

Delegate to `tuyaopen-embedded-flash`. Pick the port via `tuyaopen-cli firmware
list-ports` (multi-port boards: that command's `hint` tells you how to
disambiguate). Note the default baud can be slow enough to hit the build/flash
timeout on a large image — `--baud 921600` is the usual fix, and
`--timeout <ms>` raises the ceiling.

### Step 2 — Capture a **complete** boot log

A monitor attached to an already-running device joins mid-stream, and
everything that matters — board init, peripheral registration, the first
`client no active` — has already scrolled past. So: **attach first, then reset
the device**, and read from the reset line down.

One command does attach-then-reset in the right order for you:

```bash
tuyaopen-cli firmware monitor --port <log-port> \
    --reset --yes --duration 30 --log-file boot.log --json
```

It opens the port first, restarts the device, and keeps reading — so the log
starts at boot rather than wherever the device happened to be. Read `boot.log`
afterwards; stdout is a single JSON envelope.

The restart is a `sys_reboot` over the device's own CLI, which needs
`tal_cli_init()` in the app (**not** `CONFIG_ENABLE_SERIAL_CLI_CMD` — that
option adds *more* commands; `sys_reboot` ships without it). If no CLI answers,
it falls back to a DTR/RTS pulse and says so on stderr; on a USB-JTAG board that
fallback costs the first ~300 ms of the log. Details and the full command list:
skill `tuyaopen-embedded-cli-debug` § 0.1.

### Step 3 — Verify each peripheral you claimed

For every id in `.tuyaopen/used-peripherals.json`, find the evidence in the
boot log. A **warning is a failure**, not noise:

| Symptom in the log | What it means |
|---|---|
| `tdl_button_create` returns non-zero, or your own "failed to create button" | The driver Kconfig is off — go back to Step 5b |
| `tdl_led_find_dev` returned NULL | Same |
| Display init errors, or no display lines at all | Wrong board-device Kconfig — Step 5a |
| Nothing at all after the banner | Wrong port or wrong baud — try the other port and 115200 / 460800 / 921600 |
| `client no active` | **Expected here.** It means "no authorization code yet", not a fault. Steps 4-5 fix it |

Where a peripheral can be driven, **drive it over the device's own console
instead of reflashing**:

```bash
tuyaopen-cli firmware cli --port <port> --command help --quiet --yes
tuyaopen-cli firmware cli --port <port> --command sys_heap --quiet --yes
```

Ask `help` first — it prints what *this* firmware actually registered, which is
the only authoritative list. Measured: 2.2 s for a reply, against 121 s for a
reflash on the same board.

Or ask the user to press the button and tell you what the screen and the LED
did. **A peripheral you did not observe is not verified**, and you must say so
rather than implying it works.

### Flash once, then interrogate — this is a rule, not a suggestion

Beta round 6 spent **38 % of its wall clock in build + flash**: seven flash
cycles at ~121 s each. Most of what those cycles proved could have been asked
of the device that was already running.

**Before you rebuild, ask whether the running device can answer the question.**
The console is chip-independent — `tal_cli` is TuyaOpen's, not the vendor's —
so this works the same on every board.

| Instead of reflashing to check… | Ask the device |
|---|---|
| does the DP path work end to end | `--command "sys_iot_report_dp 101 bool true"` — then watch the panel |
| is there enough heap / did something leak | `--command sys_heap` |
| which thread is near its stack limit | `--command sys_thread` |
| what does it think of the AP | `--command sys_wifi_info` · `sys_wifi_scan` |
| did the setting persist | `--command kv_list` · `kv_get <key>` |
| what firmware is on it right now | `--command version` · `sys_version` |
| is it activated | `--command auth-read` |
| restart it to re-read the boot log | `firmware monitor --reset --yes --duration <s> --log-file boot.log` |

**Two prerequisites, and neither is guessable from a failure** — the console
answers nothing at all rather than erroring:

1. The app must call `tal_cli_init()`. `apps/tuya_cloud/switch_demo`'s skeleton
   does, so a project copied from it has a console; one written from scratch
   does not.
2. Everything past the base eight commands (`help` `cmd` `hello` `version`
   `sys_log_enable` `sys_reboot` `auth` `read_mac`) needs
   `CONFIG_ENABLE_SERIAL_CLI_CMD=y` — that is what adds the whole `sys_*` /
   `fs_*` / `kv_*` set above.

**Turn both on during bring-up**, in the same first build. It costs one Kconfig
line and a call, and it buys back most of the flash cycles for the rest of the
project. Turn the Kconfig off before production. Details: skill
`tuyaopen-embedded-cli-debug` § 0.1.

> `firmware cli` is P2 because it sends an **arbitrary** string — `sys_reboot`,
> `sys_iot_reset`, `kv_del` and `fs_rm` are all reachable through it. `--yes` is
> the whole gate. Use `--quiet` for anything whose reply you need to read, or it
> arrives interleaved with the device's own log flood.

### Step 4 — Authorization code (the FIRST time it is legitimate to ask, and you MUST ask)

Steps 1-3 are done, so the code is now the thing standing between the user and
a working device. **Ask now.** Do not defer it into a final report for the
user to act on alone.

```bash
tuyaopen-cli diag doctor --json          # deviceAuth.localLicenses — 0 means "none stored here"
tuyaopen-cli license list --json
```

If `localLicenses` is 0, ask — and make the ask self-contained, because the
user should not have to go read a skill to answer you. Say all of this:

> 设备已经烧录并跑起来了（附启动日志要点）。要让它连上涂鸦云、能用手机控制，
> 还差一组授权码（UUID + AuthKey）。**这一步只能你来拿**，两条路任选：
> 1. **开发者平台网页** 的产品「设备授权」页申领，导出 xlsx，把文件给我
> 2. 团队已有一批码 → 把那份 xlsx 给我
>
> 拿到文件我用 `tuyaopen-cli license import --xlsx <path>` 导入。只有一对码、
> 没有文件时也可以，走 stdin，不要贴进对话。
>
> 一组码同一时间**只能用在一台设备上**，请确认这组码当前没有被别的设备占用。

Then **stop and wait**. **Nothing issues codes from a command line** — not
`tuyaopen-cli` (whose `license` group only manages the local store) and not the
vendored `tuya-devplat-cli` either. Do not go looking for one, and do not read a
plausible-sounding command name as evidence that the path exists; it does not.
If the user cannot get a code, say exactly where it is stuck (no quota on the
platform / no xlsx to hand) and stop there.
Never invent a UUID, and never leave the device sitting at `client no active`
while reporting success.

Two hard rules, both from `tuyaopen-embedded-device-auth`: read its **§0**
before you ask, and never put an AuthKey on argv where it can be — it goes via
`TUYA_LICENSE_AUTHKEY` or stdin.

### Step 5 — Write it, then read it back

```bash
tuyaopen-cli firmware authorize --port <port> --yes
tuyaopen-cli firmware auth-status --port <port>
```

**A write you did not read back is not a completed step.** Then re-run Step 2's
capture: `client no active` must be gone.

### Step 6 — Hand over provisioning, with evidence

Provisioning is a **phone** action; no CLI can do it. Tell the user, explicitly,
that these three steps are theirs: install **智能生活 / Smart Life**, sign in
with an account in the **same region as the product**, then "Add device" and pair
while the device sits in provisioning mode.

**Deliver evidence, not adjectives.** Alongside the instructions, hand over a
short artefact the user can actually look at — a peripheral self-check table
and the device's state/data flow, written to a file in the project (Markdown,
or a single self-contained HTML page):

```
| 外设 | Kconfig | 启动日志证据 | 结论 |
|---|---|---|---|
| button (GPIO12) | select ENABLE_BUTTON | `button1 initialized` @ 00:00:01.2 | ✅ 已验证 |
| led (GPIO1)     | select ENABLE_LED    | `LED led initialized`                | ✅ 已验证 |
| display 3.5"    | TUYA_T5AI_BOARD_LCD_35565 | lv_vendor_init ok, 无报错      | ⚠️ 未目视确认 |
```

plus how the DPs move:

```
[按键 短按] ─▶ pet_core_feed() ─▶ 状态机 ─┬─▶ 屏幕重绘
                                          ├─▶ LED 状态
                                          └─▶ DP 105 feed ─▶ 云 ─▶ 手机面板
```

Your own success criterion is not "paired" — you cannot observe that. It is
`auth-status` reporting a code on the device and the serial log no longer
printing `client no active`.

### Definition of Done — check every line before you report

This state is complete when **all** of these are true. If any is false, say
which one and why, and do **not** call the work finished.

- [ ] `firmware build` exited 0
- [ ] `firmware flash` exited 0 on a real port
- [ ] A boot log was captured **from reset**, not joined mid-stream
- [ ] Every id in `used-peripherals.json` has either log evidence or an
      explicit "not observed" against it
- [ ] The user was **asked** for an authorization code (or `localLicenses` was
      already non-zero)
- [ ] `firmware auth-status` read the code back off the device
- [ ] `client no active` is gone from the log
- [ ] The user received provisioning instructions **and** the evidence artefact
- [ ] `project set-status --lifecycle flashed --yes` recorded the phase, so the
      next session (and `project info`) sees where this one got to
- [ ] `project info` reports `miniapp.scaffolded: true`, **or** you said in the
      report that the phone panel does not exist yet. A product with firmware
      and no panel is not finished — it is half finished, and the half that is
      missing is the half the user touches

**Writing the report.** Do not hand-assemble the environment facts:

```bash
tuyaopen-cli diag export --out handover.json
```

That is one file with the SDK, toolchain, board, platform, serial and project
state already in it — the same bundle a bug report would carry, and equally the
right attachment for "here is what I built and on what". Round 6 hand-wrote its
own summary of exactly this while the command existed.

**Blocked is a legitimate outcome; silent is not.** If you stop at the code,
report Steps 1-3 as done with their evidence, name the blocker, and stop —
that is a complete answer. What is never acceptable is a report that reads as
"全流程完成" while the device was never flashed.

---
