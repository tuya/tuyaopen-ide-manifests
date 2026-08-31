# Crash dump decoding reference (`addr2line`)

> Absorbed from the former standalone `tuyaopen-crash-decode` skill (merged
> 2026-08-14, see `../SKILL.md` § *Decode a crash dump*).

When firmware panics on a TuyaOpen device, the serial log dumps raw register
values (`PC`, `LR`, sometimes `EPC1/2/3` for Xtensa) plus stack frame snapshots.
These addresses point into the `.text` section of the flashed firmware — to
turn them into useful information you need the **debug ELF** produced by the
same build and a `*-addr2line` from the **same toolchain** that built it.

There is no shared Python wrapper. Just call the toolchain binary directly —
the path is fully determined by the platform and is sitting in the TuyaOpen
tree after the first `tos.py build`.

## 1. Identify the platform, then the ISA

Two lookups, not one. `tos.py` builds against **eight platform repos**
(`platform/platform_config.yaml` is the authoritative list: T2, T3, T5AI,
ESP32, LN882H, BK7231X, GD32, LINUX), and the 16 chip ids the IDE offers map
onto those eight. What decides which `addr2line` you need is the **ISA**, and
one platform repo can carry more than one.

| Dump signal | Platform repo | Chip ids | ISA → toolchain prefix |
|---|---|---|---|
| `Firmware name: app@cpu0` / `app@cpu1`, `bk7258` in a path | **T5AI** | `t5ai` | ARM Cortex-M33 → `arm-none-eabi-` |
| Cortex-M registers (`PC`, `LR`, `xPSR`, `CFSR`), no `app@cpu`, no ESP-IDF | **T2** · **T3** · **LN882H** · **BK7231X** | `t1` `t2` `t2ai` `t3` `t3ai` `bk7231n` `rtl8720cf` `rtl8720cf-vu2` | ARM Cortex-M → `arm-none-eabi-` |
| `ESP-IDF`, `EPC1/2/3`, `EXCVADDR`, `Guru Meditation Error` | **ESP32** | `esp32` `esp32s3` | **Xtensa** → `xtensa-esp32-elf-` / `xtensa-esp32s3-elf-` |
| `ESP-IDF` / `Guru Meditation`, but registers are `MEPC` / `MTVAL` / `MCAUSE` and there is **no** `EPC1` | **ESP32** | `esp32c3` `esp32c6` `esp32p4c6` | **RISC-V** → `riscv32-esp-elf-` |
| RISC-V registers (`mepc`, `mcause`), GigaDevice in the build path | **GD32** | `gd32vw553` | **RISC-V** → toolchain ships with the GD32 platform repo (see §2) |
| `RIP`, `RSP`, x86-64 backtrace, or a plain glibc `SIGSEGV` dump | **LINUX** | `linux` | host → system `addr2line`; aarch64 targets (Raspberry Pi and friends) → `aarch64-none-linux-gnu-` |

> **The ESP32 row splits, and getting it wrong silently wastes an hour.**
> `esp32` / `esp32s3` are Xtensa; `esp32c3` / `esp32c6` / `esp32p4c6` are
> **RISC-V** and need `riscv32-esp-elf-addr2line`. An Xtensa `addr2line`
> pointed at a RISC-V ELF does not usually refuse — it prints `??:0` or
> plausible-looking garbage. Verified against the ESP32 platform's own
> toolchain files: `platform/ESP32/tools/{esp32c3,esp32c6,esp32p4}/toolchain_*.cmake`
> all resolve `riscv32-esp-elf`, and `.espressif/tools/` on a built tree
> contains both `xtensa-esp-elf/` and `riscv32-esp-elf/`.
>
> This reference named only the two Xtensa prefixes until 2026-08-19, so it was
> wrong for three of the five ESP chip ids the catalogue offers.

For T5AI dual-core: `app@cpu0` ↔ CP core ↔ `bk7258/app.elf`, `app@cpu1` ↔ AP core ↔ `bk7258_ap/app.elf`. Pick the matching one.

**Don't guess the prefix from the chip name.** Every platform repo carries a
`toolchain_file.cmake` that states it — that file is the answer, and it stays
right when a platform bumps its toolchain:

```bash
grep -rn 'TOOLCHAIN_PRE\|xtensa-\|riscv32-\|aarch64-' \
  TuyaOpen/platform/<PLATFORM>/toolchain_file.cmake \
  TuyaOpen/platform/<PLATFORM>/tools/*/toolchain_*.cmake 2>/dev/null
```

## 2. Locate `addr2line`

After `tos.py build` runs once for any platform, the matching toolchain lives under `TuyaOpen/platform/tools/`. Search order:

```bash
# One search that covers every platform — let the filename tell you what you
# have, instead of guessing which prefix to look for:
find TuyaOpen/platform -type f -name '*addr2line*' -perm -u+x 2>/dev/null

# ARM Cortex-M (T5AI, T2, T3, LN882H, BK7231X)
find TuyaOpen/platform/tools -name 'arm-none-eabi-addr2line' -perm -u+x | head -1
# Measured path: platform/tools/gcc-arm-none-eabi-10.3-2021.10/bin/arm-none-eabi-addr2line

# ESP32 — the toolchains live under the platform's own .espressif, and the
# DIRECTORY name is the unified ESP-IDF 5.x one while the BINARY keeps the
# per-chip prefix. Measured on a built tree:
#   platform/ESP32/.espressif/tools/xtensa-esp-elf/esp-14.2.0_20241119/xtensa-esp-elf/bin/xtensa-esp32-elf-addr2line
#   platform/ESP32/.espressif/tools/riscv32-esp-elf/.../bin/riscv32-esp-elf-addr2line
find TuyaOpen/platform/ESP32/.espressif/tools -name 'xtensa-esp32*-elf-addr2line' 2>/dev/null | head -1   # esp32 / esp32s3
find TuyaOpen/platform/ESP32/.espressif/tools -name 'riscv32-esp-elf-addr2line'   2>/dev/null | head -1   # esp32c3 / c6 / p4c6
# Fall back to a system-wide ESP-IDF only if the platform copy is absent:
find ~/.espressif/tools "$IDF_PATH/tools" /opt/esp/tools -name '*-esp*-elf-addr2line' 2>/dev/null | head -3

# GD32 (RISC-V) — prefix comes from the platform repo's toolchain_file.cmake;
# this reference does not hardcode it because the GD32 platform is fetched on
# demand and was not present on the machine this was verified on.
find TuyaOpen/platform/GD32 -name '*addr2line*' -perm -u+x 2>/dev/null | head -1

# LINUX — host build uses the system binutils; an aarch64 target (Raspberry Pi,
# DshanPi, TaishanPi) uses the cross toolchain under platform/tools/
which addr2line
find TuyaOpen/platform/tools -name 'aarch64-none-linux-gnu-addr2line' -perm -u+x | head -1
```

**`-perm -u+x` rather than `-executable`**: the same directories also ship
`*-addr2line.1` man pages, and on some trees a non-executable duplicate — both
match a bare `-name` search and neither runs.

If `find` returns empty for an embedded platform, run `tos.py build` once to trigger the toolchain download. The same directory also contains `*-nm`, `*-objdump`, `*-readelf` — useful for the steps below.

## 3. Locate the debug ELF

Search order (highest priority first):

```bash
# T5AI (dual-core, two ELFs)
ls -t dist/*/debug/bk7258_ap/app.elf 2>/dev/null | head -1     # CPU1 / AP
ls -t dist/*/debug/bk7258/app.elf    2>/dev/null | head -1     # CPU0 / CP

# Single-CPU platforms (ESP32, T2, T3, LN882H)
ls -t dist/*/*/*.elf 2>/dev/null | head -3

# Build tree (if dist/ is empty / not regenerated yet)
find TuyaOpen/platform -type f -name '*.elf' -path '*/build/*' 2>/dev/null | head -3
ls -t .build/bin/debug/*/app.elf .build/bin/*.elf 2>/dev/null | head -3
```

**The ELF must match the flashed binary exactly.** If the user rebuilt after the panic, ask them to either re-flash + reproduce the panic, OR `git checkout` the exact commit they flashed and `tos.py clean -f && tos.py build` to regenerate the matching ELF.

## 4. Decode

Single command — `addr2line` in inline mode (`-i`), with function name (`-f`) and demangled C++ symbols (`-C`):

```bash
ADDR2LINE=TuyaOpen/platform/tools/gcc-arm-none-eabi-10.3-2021.10/bin/arm-none-eabi-addr2line
ELF=dist/MyProject_1.0.0/debug/bk7258_ap/app.elf

# Decode PC + LR
$ADDR2LINE -e $ELF -f -C -i 0x021d8e96 0x021d5863

# Decode the saved stack frame return addresses (skip non-code stack values)
$ADDR2LINE -e $ELF -f -C -i  \
   0x021d139d 0x021b838d 0x0219be41 0x0219c423 0x0219bfd1 0x021d10e3
```

Example real output (T5AI, DuckyClaw wechat UI null deref):

```
lv_obj_get_scrollbar_mode
TuyaOpen/src/liblvgl/v9/lvgl/src/core/lv_obj_scroll.c:94
lv_obj_get_scrollbar_area
TuyaOpen/src/liblvgl/v9/lvgl/src/core/lv_obj_scroll.c:453
lv_obj_remove_flag
TuyaOpen/src/liblvgl/v9/lvgl/src/core/lv_obj.c:159
```

That's it. PC was inside `lv_obj_get_scrollbar_mode`, called from `lv_obj_get_scrollbar_area`, called from `lv_obj_remove_flag`.

## 5. Extract addresses from the dump

Crash dumps have a specific layout per platform — when assisting a user, copy the dump verbatim and apply these rules:

- **PC / LR** (Cortex-M T5AI/T2/T3/LN882H): lines like
  ```
  pc x 0x21d8e96
  lr x 0x21d5863
  ```
  (sometimes `PC:` and `LR:` capitalized — both forms appear).

- **PC / EPC** (Xtensa ESP32): `PC : 0x420f3a11`, `EPC1 : 0x...`, etc.

- **Stack frame return addresses** (any platform): the dump prints lines like
  ```
  addr: 60fdfde0    data: 2801cc54
  addr: 60fdfde4    data: 00000000
  addr: 60fdfdb4    data: 021d5873   ← code pointer
  ```
  Filter `data:` values to keep only those in the same 16 MB region as PC/LR
  (looser: same upper byte). Drop NULL (`0x00000000`), small integers
  (`< 0x00010000`), and obvious stack/heap pointers (`0x3fc...`, `0x60f...`,
  `0x2801....` for T5 SRAM/PSRAM).

After filtering, batch all candidate code pointers into one `addr2line -i` call.

## 6. Get symbol context (optional)

If `addr2line` returns `??` for an address but you know the ELF matches, the
address may sit between functions (e.g. in a literal pool). Use the matching
`*-nm` to find the nearest symbol:

```bash
NM=TuyaOpen/platform/tools/gcc-arm-none-eabi-10.3-2021.10/bin/arm-none-eabi-nm
$NM --size-sort --print-size $ELF | awk -v a=0x021d8e96 'BEGIN{a=strtonum(a)} \
   { s=strtonum("0x"$1); if (a >= s && a < s + strtonum("0x"$2)) print }'
```

Or dump the disassembly around the address:

```bash
OBJDUMP=TuyaOpen/platform/tools/gcc-arm-none-eabi-10.3-2021.10/bin/arm-none-eabi-objdump
$OBJDUMP -d --start-address=0x021d8e80 --stop-address=0x021d8ec0 $ELF
```

## 7. Common gotchas

| Symptom | Likely cause | Fix |
|---|---|---|
| All addresses decode to `??` | ELF doesn't match flashed binary | Re-flash + reproduce, or `git checkout` to the matching commit and rebuild |
| Some addresses decode, some don't | Some `data:` values aren't return addresses (data on stack) | Expected — only PC/LR + filtered code pointers are reliable |
| `addr2line: command not found` | Toolchain not downloaded yet | Run `tos.py build` once for any board → toolchain downloads to `TuyaOpen/platform/tools/` |
| ESP32: `xtensa-esp32s3-elf-addr2line` missing | ESP-IDF not installed | Install ESP-IDF, source `export.sh`, or use the toolchain bundled in `TuyaOpen/platform/ESP32/` after first build |
| Wrong T5AI core decoded (results don't make sense) | Picked `bk7258/app.elf` for an `app@cpu1` dump | Use `bk7258_ap/app.elf` for cpu1, `bk7258/app.elf` for cpu0 |
| `??:0` for inlined function | `addr2line` resolved the outermost but missed inlined frames | Make sure `-i` flag is present (inline mode); also re-build with `-g` if missing |

## See also

- Background log capture (to grab the dump hands-off) and sending CLI commands
  once the device is responsive again are covered in `../SKILL.md` (this same
  skill, `tuyaopen-embedded-cli-debug`).
- Rebuilding firmware with debug info enabled, and the full build → flash →
  monitor loop, are out of scope here — see skill `tuyaopen-start`'s routing
  table.
