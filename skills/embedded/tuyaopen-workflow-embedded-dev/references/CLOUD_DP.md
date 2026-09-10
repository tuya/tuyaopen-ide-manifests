# Cloud connection and DP send/receive

The one piece of firmware nobody hands you. `dp generate` writes the DP **id
macros**; wiring those ids to the cloud is application code, and beta round 6
had to reverse-engineer it by grepping `apps/` for `tuya_iot_init`. Two hours
and one wrong `#include` later it worked. This file is that answer, written
down.

**Canonical reference:** `$OPEN_SDK_ROOT/apps/tuya_cloud/switch_demo/`. Read it.
Everything below is a map of what to take from it and what not to.

---

## The trap, first

`switch_demo/src/tuya_main.c` opens with:

```c
#include "reset_netcfg.h"
```

That is **not an SDK header.** It is `switch_demo/src/reset_netcfg.{c,h}` — a
file local to that app, not on any component's PUBLIC include path. Copying the
`#include` without the two files it names gives you:

```
fatal error: reset_netcfg.h: No such file or directory
```

at the *first* compile, after the whole toolchain download. If you want the
"press reset N times to re-provision" behaviour, copy
`reset_netcfg.c` / `reset_netcfg.h` into your own `src/` and `include/` — the
logic is self-contained and has no other dependency. If you don't want it, drop
the include **and** the `reset_netconfig_check()` call.

Same rule for anything else in that directory: `cli_cmd.c`, `tuya_config.h`.
App-local until proven otherwise.

---

## 1. Init → start → yield

```c
#include "tuya_iot.h"
#include "netmgr.h"

static tuya_iot_client_t client;

void tuya_app_main(void)
{
    tuya_iot_license_t license;
    /* Read UUID/AuthKey written by `tuyaopen-cli firmware authorize`.
     * Falls back to the compile-time constants when the device has none. */
    if (OPRT_OK != tuya_iot_license_read(&license)) {
        license.uuid    = TUYA_OPENSDK_UUID;
        license.authkey = TUYA_OPENSDK_AUTHKEY;
        PR_WARN("no device license — the device will log `client no active`");
    }

    OPERATE_RET rt = tuya_iot_init(&client, &(const tuya_iot_config_t){
        .software_ver  = PROJECT_VERSION,
        .productkey    = TUYA_PRODUCT_ID,      /* the PID, from tuya_config.h */
        .uuid          = license.uuid,
        .authkey       = license.authkey,
        .event_handler = user_event_handler_on,
        .network_check = user_network_check,
    });
    assert(rt == OPRT_OK);

    netmgr_type_e type = 0;
#if defined(ENABLE_WIFI) && (ENABLE_WIFI == 1)
    type |= NETCONN_WIFI;
#endif
    netmgr_init(type);

#if defined(ENABLE_WIFI) && (ENABLE_WIFI == 1)
    /* Both provisioning paths. Drop NETCFG_TUYA_BLE if the product has no BLE. */
    netmgr_conn_set(NETCONN_WIFI, NETCONN_CMD_NETCFG,
                    &(netcfg_args_t){ .type = NETCFG_TUYA_BLE | NETCFG_TUYA_WIFI_AP });
#endif

    tuya_iot_start(&client);

    for (;;) {
        tuya_iot_yield(&client);   /* blocking; owns this thread forever */
    }
}
```

`tuya_iot_yield()` never returns. Anything else your app must do — a timer, a UI
task, a button scan — belongs on **its own thread**, started before this loop.

---

## 2. Receiving DPs (panel → device)

Everything arrives through the event handler you registered:

```c
void user_event_handler_on(tuya_iot_client_t *client, tuya_event_msg_t *event)
{
    switch (event->id) {
    case TUYA_EVENT_DP_RECEIVE_OBJ: {
        dp_obj_recv_t *dpobj = event->value.dpobj;
        for (uint32_t i = 0; i < dpobj->dpscnt; i++) {
            dp_obj_t *dp = dpobj->dps + i;
            switch (dp->id) {
            case DPID_SWITCH:         app_set_running(dp->value.dp_bool);      break;
            case DPID_COUNTDOWN_SET:  app_set_minutes(dp->value.dp_value);     break;
            case DPID_WORK_STATE:     app_set_state(dp->value.dp_enum);        break;
            default: PR_WARN("unhandled dp %d", dp->id);                       break;
            }
        }
        /* Echo the whole batch back — this is what makes the panel switch
         * update instead of springing back. Do it after applying, not before. */
        tuya_iot_dp_obj_report(client, dpobj->devid, dpobj->dps, dpobj->dpscnt, 0);
    } break;
    ...
    }
}
```

Value union by DP type — the pairing is not guessable, get it right:

| DP type | `dp->type` | Read from |
|---|---|---|
| `bool` | `PROP_BOOL` | `dp->value.dp_bool` |
| `value` | `PROP_VALUE` | `dp->value.dp_value` |
| `string` | `PROP_STR` | `dp->value.dp_str` |
| `enum` | `PROP_ENUM` | `dp->value.dp_enum` |
| `bitmap` | `PROP_BITMAP` | `dp->value.dp_bitmap` |

`raw` DPs arrive on `TUYA_EVENT_DP_RECEIVE_RAW` with `event->value.dpraw`, a
separate branch.

The `case DPID_*` labels come from `include/tuya_dp_id.h` — the header
`tuyaopen-cli dp generate` writes. Do not hand-maintain that file.

---

## 3. Reporting DPs (device → panel)

Build the array yourself and report it:

```c
void app_report_state(int remaining_s, int work_state)
{
    dp_obj_t dps[2] = {
        { .id = DPID_COUNTDOWN_REMAIN, .type = PROP_VALUE, .value.dp_value = remaining_s },
        { .id = DPID_WORK_STATE,       .type = PROP_ENUM,  .value.dp_enum  = work_state  },
    };
    int rt = tuya_iot_dp_obj_report(&client, client.activate.devid, dps, 2, 0);
    if (rt != OPRT_OK) PR_WARN("dp report failed rt=%d", rt);   /* -3585 = not activated */
}
```

Three things that cost time if you learn them from the device instead:

- **Batch.** One call with N entries, not N calls. The cloud rate-limits.
- **Report on change, not on tick.** A 1 Hz timer that reports an unchanged
  value produces `no valid dp to rept` in the log every second and nothing else.
- **`rt = -3585` means the device is not activated** — no license written, or
  not provisioned yet. It is not a bug in your reporting code. Check
  `tuyaopen-cli firmware auth-status --port <port>`.

---

## 4. Events worth handling

| Event | Why |
|---|---|
| `TUYA_EVENT_BIND_START` | Provisioning began — good place to change the UI |
| `TUYA_EVENT_MQTT_CONNECTED` | Online. Report your initial state **here**, not at boot |
| `TUYA_EVENT_RESET` / `TUYA_EVENT_RESET_COMPLETE` | Wipe app data out of KV; the SDK does not know what is yours |
| `TUYA_EVENT_UPGRADE_NOTIFY` | OTA offered |
| `TUYA_EVENT_DP_RECEIVE_OBJ` / `_RAW` | Above |

`EVENT_ID2STR(event->id)` renders the name for logging.

---

## 5. Verifying it without a phone

With the device CLI compiled in (skill `tuyaopen-embedded-cli-debug` § 0.1),
`sys_iot_report_dp` reports a DP from the serial console and
`sys_iot_get_devid` prints the device id — so you can prove the report path
works before the panel exists. That needs
`CONFIG_ENABLE_SERIAL_CLI_CMD=y` **and** a `tal_cli_init()` call in your main.
