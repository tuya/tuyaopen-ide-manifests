---
name: tuyaos/wifi
description: >-
  TuyaOS Wi-Fi via tal_wifi: station connect, AP start, scan, low power.
  WiFi、联网、STA、AP、扫网、配网、tal_wifi、连接路由器、热点。
when_to_use: >-
  Use for any TuyaOS Wi-Fi request: connect to router (STA), softAP, scan APs,
  Wi-Fi low power / DTIM. Prefer reading os_wifi demos before inventing flows.
id: tuyaos-wifi
surfaces: [embedded]
tags: [wifi, sta, ap, scan, tuyaos, tal_wifi, networking]
---

# TuyaOS Wi-Fi (`tal_wifi`)

**Demos:** `software/TuyaOS/apps/tuyaos_demo_examples/src/examples/os_wifi/`

| Mode | File | Entry |
|------|------|-------|
| Station (STA) | `example_os_wifi_sta.c` | `example_wifi_sta` |
| SoftAP | `example_os_wifi_ap.c` | `example_wifi_ap` |
| Scan | `example_os_wifi_scan.c` | `example_wifi_scan` |
| Low power | `example_os_wifi_low_power.c` | `example_wifi_low_power` |

Also related (product remote, not basic STA/AP):

| Topic | Demo |
|-------|------|
| Wi-Fi FFC master | `…/service_ffc_master/` (`tuya_iot_wifi_ffc_*`) |
| Wi-Fi FFC slaver | `…/service_ffc_slaver/` |

## Confirm first

- **Role:** STA / AP / scan / LP / FFC remote?
- **STA:** SSID + password (never hardcode secrets from demos — demos use placeholders).
- **AP:** SSID, password, channel, IP/mask/gw if static.
- Whether the app already runs a higher-level TuyaOS product init (`example_soc_*` / framework Wi-Fi). If the product stack owns Wi-Fi, do **not** double-`tal_wifi_init` without checking existing code.

## Core APIs

| Function | Role |
|----------|------|
| `tal_wifi_init(event_cb)` | register `WF_EVENT_E` callback, bring up stack |
| `tal_wifi_set_work_mode(mode)` | e.g. `WWM_STATION` / AP mode enum in headers |
| `tal_wifi_station_connect(ssid, passwd)` | STA join |
| `tal_wifi_get_ip(WF_STATION, &ip)` | read IP after `WFE_CONNECTED` |
| `tal_wifi_ap_start(...)` | softAP (see AP demo for exact args / `NW_IP_S`) |
| `tal_wifi_all_ap_scan` / `tal_wifi_release_ap` | scan + free results |
| `tal_wifi_lp_enable` / `tal_wifi_lp_disable` / `tal_wifi_set_lps_dtim` | low power |
| `tal_net_*` | UDP/TCP after link is up (AP demo uses broadcast) |

## STA pattern (adapt demo — do not leave xxxx credentials)

```c
#include "tuya_cloud_types.h"
#include "tal_log.h"
#include "tal_wifi.h"

static void wifi_event_callback(WF_EVENT_E event, void *arg)
{
    (void)arg;
    switch (event) {
    case WFE_CONNECTED: {
        NW_IP_S sta_info;
        memset(&sta_info, 0, sizeof(sta_info));
        if (tal_wifi_get_ip(WF_STATION, &sta_info) == OPRT_OK) {
            /* log ip/gw/mask — field names differ by SDK macro (nwipstr vs .ip) */
            TAL_PR_NOTICE("wifi connected");
        }
        break;
    }
    case WFE_CONNECT_FAILED:
        TAL_PR_ERR("wifi connect failed");
        break;
    case WFE_DISCONNECTED:
        TAL_PR_NOTICE("wifi disconnected");
        break;
    default:
        break;
    }
}

void app_wifi_sta_start(const char *ssid, const char *passwd)
{
    if (tal_wifi_init(wifi_event_callback) != OPRT_OK) {
        TAL_PR_ERR("tal_wifi_init failed");
        return;
    }
    if (tal_wifi_set_work_mode(WWM_STATION) != OPRT_OK) {
        TAL_PR_ERR("set station mode failed");
        return;
    }
    tal_wifi_station_connect((SCHAR_T *)ssid, (SCHAR_T *)passwd);
}
```

## SoftAP (summary)

From `example_os_wifi_ap.c`:

1. `tal_wifi_init(cb)`
2. set AP work mode
3. fill `NW_IP_S` (ip/mask/gw) + SSID/password/channel
4. `tal_wifi_ap_start(...)` (exact prototype in demo / `tal_wifi.h`)
5. optional: `tal_net_socket_create` + `tal_net_send_to` for LAN broadcast

## Scan (summary)

`tal_wifi_all_ap_scan(&ap_list, &count)` then print SSID/RSSI/auth; always
`tal_wifi_release_ap(ap_list)` when done.

## Low power (summary)

After STA is up: `tal_wifi_set_lps_dtim(...)`, `tal_wifi_lp_enable()`, and
platform CPU LP helpers (`tal_cpu_set_lp_mode` / `tal_sleep`) as in the LP demo.
Disable LP before heavy traffic.

## Rules

1. **Open the matching demo `.c` in-tree** when present; copy event handling and struct field names for this SDK version.
2. **Never commit real passwords** from chat into source without user OK; use config / macros the app already uses.
3. **Product vs raw Wi-Fi:** many commercial apps already init Wi-Fi inside TuyaOS product/device init. Grep the app for `tal_wifi_init` / `tuya_iot_*` first.
4. **FFC remotes** use `tuya_iot_wifi_ffc_init/control/bind/send` — different stack; read `service_ffc_*` READMEs.
5. Build with **`tuyaos-build`**. Not TuyaOpen `tos.py` / lwIP-only examples from other trees.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| No `WFE_CONNECTED` | wrong SSID/pass / 5 GHz-only AP on 2.4-only chip | verify band + credentials |
| Double init crash | product stack already called `tal_wifi_init` | reuse existing callback path |
| No IP fields compile | SDK uses `nwipstr` vs `.ip` | match demo `#ifdef` style |
| Scan leaks | forgot `tal_wifi_release_ap` | free after use |
