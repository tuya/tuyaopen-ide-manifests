# Network Provisioning & CLI Authorization Details

## Writing Auth via Serial (CLI)

For devices with `tal_cli` enabled, you can write credentials at runtime via the serial console without recompiling.

### Which Serial Port to Use

| Platform / board | Auth port | How to connect |
|----------|----------|----------------|
| LINUX (Ubuntu, etc.) | N/A — use monitor port | `tos.py monitor` (stdout, no physical serial) |
| MCU, **single-serial** board (one port) | that single port — it is also the log port | `tos.py monitor -p <the_port> -b 115200` |
| MCU, **dual-serial** board (two ports) | **Flash/download port** (not the log port!) | `tos.py monitor -p <flash_port> -b 115200` |

> For MCU platforms, authorization is done through the **flash port** (the same port used for `tos.py flash`), **not** the monitor/log port. The authorization baud rate is **115200** regardless of chip type.

Tell the two board shapes apart by grouping `tyutool_cli list-ports --json` on
`usbSerial` — one board is one `usbSerial`, and the number of ports carrying it
is the answer. On dual-serial boards pick the lowest `usbInterface` for auth;
do **not** rank by `COM` / `ttyACM` number, which does not track interface order
on Windows. See skill `tyutool-cli` → *Port Selection* for the full rule.

> **Single-serial boards — release the port before authorizing.** The log stream
> and the auth shell are the same OS resource. An open monitor (the IDE's serial
> panel included) makes `auth` fail with `PermissionError 13` / `Access is denied`
> / `Device or resource busy` — which looks like a wiring or firmware fault but
> is not. Close the monitor, authorize at 115200, then reopen at the log baud.
> Dual-serial boards can keep the log port open throughout.

### Steps

1. Build and flash the firmware.
2. Connect to the correct serial port at 115200 baud:
   - **LINUX**: `tos.py monitor` (uses stdout directly)
   - **MCU platforms**: `tos.py monitor -p <flash_port> -b 115200`
3. At the `tuya> ` prompt, use the `auth` command:

```
tuya> auth <UUID> <AUTHKEY>
```

### CLI Auth Commands

| Command | Description |
|---------|-------------|
| `auth <uuid> <authkey>` | Write new credentials to KV storage |
| `auth-read` | Read and display current stored credentials |
| `auth-reset` | Clear stored credentials |
| `read_mac` | Print the device MAC address |
| `help` | List every command this firmware actually exposes |

Run `help` first — the command set depends on what the firmware was built with,
and a missing command means the build lacks it rather than the port being wrong.
Some builds gate extra commands (`sys_*`, `fs_*`, `kv_*`) behind
`ENABLE_SERIAL_CLI_CMD` in Kconfig.

`read_mac` is the cheapest way to get the MAC for the `pending-auth.json`
handback (see SKILL.md → *IDE Ledger*) — it needs no reboot and no log capture,
and it runs on the same port and baud you just used to authorize:

```
tuya> read_mac
mac: aa:bb:cc:dd:ee:ff
```

If the firmware has no `read_mac`, skip the MAC — it is an optional field.

### Authorization Fails?

If the `tuya> ` prompt does not appear or the `auth` command is not recognized:

1. **Check baud rate**: authorization uses **115200**, not the chip's monitor baud rate.
2. **Check port**: MCU platforms use the **flash port**, not the monitor port.
3. **Check firmware**: `tuya_authorize_init()` must be called in the application code. Most cloud demo apps call it in `user_main()`. If missing, add it before `tuya_iot_init()`.
4. **Check CLI init**: `tal_cli_init()` must also be called to enable the CLI subsystem. Without it, there is no `tuya> ` prompt at all.

## Network Provisioning

After authorization, WiFi devices need network provisioning to receive the router SSID/password.

### Provisioning Modes

| Mode | Kconfig flag | How it works |
|------|-------------|--------------|
| BLE | `NETCFG_TUYA_BLE` | Phone sends WiFi credentials via BLE; most common |
| AP | `NETCFG_TUYA_WIFI_AP` | Device creates a hotspot; phone connects and sends credentials |
| BLE + AP | Both flags | Supports both methods |

Applications configure this in their `user_main()`:

```c
netmgr_conn_set(NETCONN_WIFI, NETCONN_CMD_NETCFG,
    &(netcfg_args_t){ .type = NETCFG_TUYA_BLE | NETCFG_TUYA_WIFI_AP });
```

### PINCODE (AP Mode)

If `TUYA_NETCFG_PINCODE` is defined, AP provisioning uses PBKDF2(pincode, uuid) to derive a TLS-PSK, enabling QR-code-based secure pairing. Without PINCODE, AP uses a different TLS+PSK protocol.

### Provisioning Flow

1. Device starts in un-provisioned state (no saved WiFi credentials).
2. Device advertises via BLE and/or creates AP hotspot.
3. User opens Tuya Smart App / Smart Life App, scans for device.
4. App sends WiFi SSID + password + activation token.
5. Device connects to WiFi, activates with Tuya cloud.
6. `TUYA_EVENT_DIRECT_MQTT_CONNECTED` event fires — device is online.

### LINUX Target

LINUX platform devices use the host's network directly — no provisioning needed. The device connects to the cloud immediately after `tuya_iot_start()`.
