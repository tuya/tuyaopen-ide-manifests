| Credential | Macro | Purpose |
|-----------|-------|---------|
| Product ID (PID) | `TUYA_PRODUCT_ID` | Identifies the product type on the Tuya IoT platform |
| UUID | `TUYA_OPENSDK_UUID` | Unique device identifier |
| AuthKey | `TUYA_OPENSDK_AUTHKEY` | Device authentication key (paired with UUID) |

### Credential Resolution Priority

The SDK resolves credentials in this order (first success wins):

1. **KV storage** — previously written via CLI `auth` command (keys: `UUID_TUYAOPEN` / `AUTHKEY_TUYAOPEN`)
2. **OTP / module flash** — `tuya_iot_license_read()` reads from hardware (pre-burned modules)
3. **Source code macros** — `TUYA_OPENSDK_UUID` / `TUYA_OPENSDK_AUTHKEY` in `tuya_config.h`

If none succeed, the device cannot connect to the cloud.

## Configuring tuya_config.h

Each application has a `tuya_config.h` (in `include/` or `src/`). Edit it with your credentials:

```c
#define TUYA_PRODUCT_ID      "xxxxxxxxxxxxxxxx"
#define TUYA_OPENSDK_UUID    "uuidxxxxxxxxxxxxxxxx"
#define TUYA_OPENSDK_AUTHKEY "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

Optional for AP provisioning with QR code:

```c
#define TUYA_NETCFG_PINCODE  "12345678"
```

**File locations** (vary by project):
- `apps/tuya_cloud/switch_demo/src/tuya_config.h`
- `apps/tuya.ai/your_chat_bot/include/tuya_config.h`
- `apps/tuya_cloud/weather_get_demo/include/tuya_config.h`

> Note: some README files reference `TUYA_DEVICE_UUID` / `TUYA_DEVICE_AUTHKEY` — these are outdated names. The actual macros used in source code are `TUYA_OPENSDK_UUID` / `TUYA_OPENSDK_AUTHKEY`.

## Getting Credentials

### Product ID (PID)

1. Log in to [Tuya IoT Platform](https://platform.tuya.com).
2. Create a product matching your device type.
3. Copy the PID from the product page.

### UUID + AuthKey

> **This section is the catalogue's single home for "how do I get an
> authorization code".** Other skills that mention UUID/AuthKey (
> `tuyaopen-embedded-flash`, `tuyaopen-workflow-embedded-dev`,
> `tuyaopen-workflow-miniapp-dev`, `tuyaopen-start`) point here rather than
> repeating the routes — do not copy the two URLs below into them.

TuyaOpen-specific authorization codes come in three ways:

1. **Pre-burned modules** — some Tuya modules ship with credentials in OTP; no manual setup needed.
2. **Free developer codes — two of them, claimed on the web** —
   <https://tuyaopen.ai/zh/pricing-guide> documents the free allowance: during
   development you can claim **2 free device authorizations** from the Tuya
   Developer Platform. Read that page for the current claim steps (log in →
   create a product → pick the module → claim the codes from the product page)
   — it is the authoritative source, so do not reconstruct the steps from
   memory.
3. **Purchase from Tuya platform** — <https://platform.tuya.com/purchase/index?type=6>
   for any quantity beyond the two free codes.

**Both routes are web-only.** There is no `tuyaopen-cli` CLI command that claims,
buys, or fetches an authorization code — `tuyaopen-cli license add` / `import`
only *record* a UUID/AuthKey pair you already hold into the local CLI store,
and `tuyaopen-cli firmware authorize` only *writes* one you already hold to the
device. If the user has no code yet, send them to one of the two URLs above;
do not invent a command.

> Important: only **TuyaOpen-specific** authorization codes work. Standard Tuya module authorization codes are **not compatible**.

## Device ID (`devid`) — after provisioning, not before

**A device ID only exists once the device has finished network provisioning.**
Before that there is nothing to fetch: UUID/AuthKey identify the *hardware*,
`devid` identifies the *provisioned cloud device*. Panel development, DP
debugging and per-device APIs all key off `devid`, so "there is no devid yet"
usually means "this device has not been provisioned", not "the lookup failed".

**Method 1 — Smart Life app (no code, no rebuild).**
Provision the device with the app, then: device page → `···` (top right) →
**Device information** → **Virtual ID**. That value is the `devid`. This is the
method to reach for when you do not own the firmware.

**Method 2 — print it from firmware.** Add the call below and read it off the
serial log after provisioning completes:

```c
#include "tuya_iot.h"          /* src/tuya_cloud_service/cloud/tuya_iot.h */

const char *devid = tuya_iot_devid_get(tuya_iot_client_get());
PR_INFO("devid: %s", devid ? devid : "(null)");
```

`tuya_iot_devid_get(tuya_iot_client_t *client)` returns a `const char *` owned
by the client — do not free it, and do not cache it across a re-provision.
Call it **after** the device is activated; before that the client has no id to
return. An in-tree example of the same pairing is
`apps/tuya_t5_pocket/tuya_t5_pocket_ai/src/game_pet.c`, which passes the result
straight into `tuya_iot_dp_obj_report()`.

> Panel developers get this same pair, stated compactly, in skill
> `tuyaopen-workflow-miniapp-dev`. That is a deliberate duplication rather than a
> pointer: a panel developer often does not own the firmware, and forcing them
> through an embedded skill to learn a two-step app lookup is worse than
> repeating five lines.

## Writing Auth via Serial & Network Provisioning

For CLI-based serial authorization (port selection, baud rates, commands), provisioning modes (BLE / AP), and the full provisioning flow, see `references/PROVISIONING.md`.

### Serial port discovery (agents)

Before writing auth credentials over UART, identify the correct port:

1. List available ports, with the USB metadata that identifies them:
   ```bash
   $OPEN_SDK_ROOT/tools/tyutool/tyutool_cli list-ports --json
   ```
   Bare `ls /dev/ttyACM*` / `[System.IO.Ports.SerialPort]::GetPortNames()` gives
   names only — enough to see *that* ports exist, not which one to authorize on.

2. **Determine the board shape by grouping on `usbSerial`** — one physical board
   is one `usbSerial`, however many ports it exposes:

   | Ports sharing a `usbSerial` | Board | Auth port |
   |---|---|---|
   | 1 | **single-serial** | that port — flash, auth and log all share it |
   | 2+ | **dual-serial** | the one with the lowest `usbInterface`; the other carries the log |

   Rank by `usbInterface`, **not** by the `COM`/`ttyACM` number — the two
   orderings disagree (a board can present `COM34` = interface 0 = auth port
   alongside `COM33` = interface 2 = log port). Not guaranteed across vendors:
   if `auth` gets no `tuya> ` prompt, try the other port of the same `usbSerial`.

3. **Single-serial boards: free the port first.** Log output and the auth channel
   are the same OS resource, so any open monitor — including the IDE's serial
   panel — blocks authorization with `PermissionError 13` / `Access is denied` /
   `Device or resource busy`. Stop the monitor, authorize at 115200, then reopen
   it at the log baud. On dual-serial boards you can leave the monitor running.

4. On dual-serial boards, use skill `tuyaopen-embedded-cli-debug` to capture logs in the
   background while the auth flow runs on the other port:
   ```bash
   $OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py start -p <monitor-port>
   # ... run auth on auth port ...
   $OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py tail -n 100
   $OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py stop
   ```

## IDE Ledger — Reporting Auth Back to the IDE

The device and the TuyaOpen IDE keep **two independent records**. Confusing them
is the most common source of "I authorized it but the IDE disagrees":

| Record | Lives in | Changed by |
|---|---|---|
| Device credentials | **KV** (`UUID_TUYAOPEN` / `AUTHKEY_TUYAOPEN`, rewritable) | `tyutool_cli authorize`, the IDE's own serial-auth button, or `tuya_config.h` at build time |
| IDE license ledger | 授权码 panel status (`未使用` / `使用中` / `已绑定`) | IDE-side events **only** |

> **OTP is not a write location** — see the § *Shortcuts* note above
> (KV/OTP correction, `tuya_iot_license_read()`). This row means the same
> thing as that one: the chip's own state is **KV**, rewritable at any time.

**Authorizing from the command line does not update the panel.** A license the
device is genuinely running can still display `未使用`, because nothing told the
IDE it happened. This is a bookkeeping gap, not an authorization failure — do
not "fix" it by re-flashing credentials.

Status semantics differ by license source:

- **Cloud licenses** take their status from the Tuya backend, which flips it
  only once the device actually activates against the cloud. The IDE never
  overrides it, and neither can an agent.
- **Local (pasted) licenses** are the ones an agent can and should report.

### The `pending-auth.json` handback

After authorizing a device outside the IDE, write `pending-auth.json` at the
**IDE workspace root** — the `tuyaopen.workspaceRoot` setting, defaulting to
`<home>/TuyaOpenIDE/`. Note this is the workspace root *above* the project, not
the project directory itself.

```json
{ "uuid": "your_uuid_here", "mac": "AA:BB:CC:DD:EE:FF" }
```

| Field | Required | Meaning |
|---|---|---|
| `uuid` | YES | Must already exist in the IDE's license list, or the file is discarded |
| `mac` | no | Binds the device MAC to the license entry |

A file watcher consumes it, records an authorization event, flips a **local**
license from `未使用` to `已绑定`, stamps the last-used time, and then **deletes
the file**.

Two cautions:

1. **Deletion is not proof of success.** The "uuid not in the list" path deletes
   the file too. Ask the developer to confirm the panel label rather than
   inferring it from the file disappearing.
2. **Never put the AuthKey in this file.** The protocol needs only `uuid` and
   `mac`; the file sits on disk until the watcher fires.

If the developer would rather the IDE track it natively, point them at the
panel's own serial-auth button — that path records the event without a handback.

## Agent Strategy

### After authorizing outside the IDE

1. Write the `pending-auth.json` handback described above, so the IDE ledger
   matches the hardware.
2. Include the MAC when the firmware can give it — it is what lets the panel
   show which physical device a license went to. Send `read_mac` on the same
   port and baud you just authorized on (`references/PROVISIONING.md` → *CLI
   Auth Commands*); run `help` first if unsure the build has it. Skip the field
   if the command is absent — it is optional, and the boot log on the monitor
   port is a fallback, not a requirement.
3. Report the panel label as **unconfirmed** until the developer eyeballs it.

### When generating or modifying tuya_config.h

1. **Always use placeholder values** in generated code:
   ```c
   #define TUYA_PRODUCT_ID      "your_product_id_here"
   #define TUYA_OPENSDK_UUID    "your_uuid_here"
   #define TUYA_OPENSDK_AUTHKEY "your_authkey_here"
   ```
2. **Warn the user** if credentials appear to be placeholders when they attempt to build/flash for cloud testing.
3. **Never log, commit, or display** real UUID/AuthKey values in output, comments, or commit messages.
4. If the user provides real credentials, write them only to `tuya_config.h` and remind them not to commit the file with real values.

### Detecting placeholder values

Placeholder patterns to check: values containing `your_`, `xxx`, `here`, empty strings, or strings shorter than expected length (UUID ~20 chars, AuthKey ~32 chars).

## Not in scope

Flashing firmware or choosing a serial port for reasons unrelated to
