---
name: tuyaos/ble
description: >-
  TuyaOS Bluetooth LE via tal_bluetooth: peripheral advertising, central scan,
  and Tuya BLE remote service hooks.
  BLE、蓝牙、广播、扫描、从机、主机、tal_ble、蓝牙遥控器。
when_to_use: >-
  Use for TuyaOS BLE peripheral/central work, advertising, scanning, GATT-style
  events, or Tuya BLE remote binding. Prefer os_ble demos before inventing stack calls.
id: tuyaos-ble
surfaces: [embedded]
tags: [ble, bluetooth, peripheral, central, tuyaos, tal_bluetooth]
---

# TuyaOS BLE (`tal_bluetooth` / `tal_ble_*`)

**Demos:** `software/TuyaOS/apps/tuyaos_demo_examples/src/examples/os_ble/`

| Role | File | Entry |
|------|------|-------|
| Peripheral (advertise + accept connect) | `example_os_ble_peripheral.c` | `example_ble_peripheral` |
| Central (scan) | `example_os_ble_central.c` | `example_ble_central` |

**Product BLE remote (framework-level, after device online):**

`…/service_ble_remote/` — `tuya_ble_reg_app_scan_adv_cb`, bind window APIs.  
Requires product/device init order described in that README (remote hooks before / with `example_soc_init`).

## Confirm first

- **Role:** peripheral (被连) / central (扫描|主) / Tuya BLE remote?
- Adv payload / device name if peripheral.
- Scan filters / timeout if central.
- Whether the product already owns BLE (TuyaOS link-layer for pairing). Avoid dual stack init.

## Core APIs

| Function | Role |
|----------|------|
| `tal_ble_bt_init(role, event_cb)` | `TAL_BLE_ROLE_PERIPERAL` or `TAL_BLE_ROLE_CENTRAL` + callback |
| `tal_ble_advertising_data_set(&adv, &rsp)` | set ADV + scan response |
| `tal_ble_advertising_start(param)` | start ADV (`TUYAOS_BLE_DEFAULT_ADV_PARAM` in demo) |
| `tal_ble_scan_start(&scan_cfg)` / `tal_ble_scan_stop` | central scan |
| `tal_ble_server_common_read_update` | peripheral read-char update after connect |
| Event types | `TAL_BLE_STACK_INIT`, `TAL_BLE_EVT_PERIPHERAL_CONNECT`, `TAL_BLE_EVT_DISCONNECT`, `TAL_BLE_EVT_ADV_REPORT`, `TAL_BLE_EVT_WRITE_REQ`, … |

Headers: `tal_bluetooth.h` (and related). Log with `tal_log.h`.

## Peripheral pattern (from demo)

```c
#include "tuya_cloud_types.h"
#include "tal_bluetooth.h"
#include "tal_system.h"
#include "tal_log.h"

static void ble_peripheral_event_callback(TAL_BLE_EVT_PARAMS_T *p_event)
{
    switch (p_event->type) {
    case TAL_BLE_STACK_INIT:
        if (p_event->ble_event.init == 0) {
            TAL_BLE_DATA_T adv_data = { .p_data = /* your adv */, .len = /* */ };
            TAL_BLE_DATA_T rsp_data = { .p_data = /* scan rsp */, .len = /* */ };
            tal_system_sleep(1000);
            tal_ble_advertising_data_set(&adv_data, &rsp_data);
            tal_ble_advertising_start(TUYAOS_BLE_DEFAULT_ADV_PARAM);
        }
        break;
    case TAL_BLE_EVT_PERIPHERAL_CONNECT:
        TAL_PR_DEBUG("BLE connected");
        break;
    case TAL_BLE_EVT_DISCONNECT:
        tal_ble_advertising_start(TUYAOS_BLE_DEFAULT_ADV_PARAM);
        break;
    case TAL_BLE_EVT_WRITE_REQ:
        /* handle p_event->ble_event.write_report.report */
        break;
    default:
        break;
    }
}

void app_ble_peripheral_start(void)
{
    tal_ble_bt_init(TAL_BLE_ROLE_PERIPERAL, ble_peripheral_event_callback);
}
```

Copy **adv / scan_rsp byte layouts** from the demo or product protocol docs — do not invent Tuya frame control fields unless the user provides a format.

## Central / scan pattern

```c
void app_ble_central_scan(void)
{
    TAL_BLE_SCAN_PARAMS_T scan_cfg;
    memset(&scan_cfg, 0, sizeof(scan_cfg));
    scan_cfg.type = TAL_BLE_SCAN_TYPE_ACTIVE;
    scan_cfg.scan_interval = 0x400;
    scan_cfg.scan_window = 0x400;
    scan_cfg.timeout = 0xFFFF;
    scan_cfg.filter_dup = 0;

    tal_ble_bt_init(TAL_BLE_ROLE_CENTRAL, ble_central_event_callback);
    tal_ble_scan_start(&scan_cfg);
}
```

Handle `TAL_BLE_EVT_ADV_REPORT` in the callback; call `tal_ble_scan_stop()` when done.

## BLE remote (service layer)

If the user wants **涂鸦蓝牙遥控器** / custom beacon remote:

1. Read `service_ble_remote/README.md`.
2. Register scan/bind callbacks **before** full product online as demo order requires.
3. APIs include `tuya_ble_reg_app_scan_adv_cb`, `tuya_ble_reg_app_scan_adv_handle_cbs`,
   `tuya_ble_set_bind_window`, and user raw scan CB variants.

This is **not** the same as bare `tal_ble_bt_init` peripheral demos.

## Rules

1. Prefer adapting `os_ble` demos over free-hand GATT design.
2. Role is exclusive in demos — confirm central vs peripheral; dual-role needs platform support check.
3. Do not mix TuyaOpen BLE helpers or host-side stacks into the firmware skill path.
4. After code changes: `local.mk` if new files, then **`tuyaos-build`**.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| No ADV seen | init failed / wrong role / ADV not started in `TAL_BLE_STACK_INIT` | start ADV only after stack init success |
| Scan empty | passive vs active / window too small / RF coexistence | match demo scan_cfg; check Wi-Fi+BLE coexistence |
| Connect then drop | bad conn params / app watchdog | log `TAL_BLE_EVT_DISCONNECT`; restart ADV |
| Remote never binds | wrong init order vs `example_soc_init` | follow `service_ble_remote` README order |
