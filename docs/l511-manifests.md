# L511 manifest sources

The three module manifests use the TuyaOpen platform and board symbols
`L511G_Y7PM`, `L511C_Y7PM`, and `L511C_Y6E`. Metadata was checked on
2026-10-26 against the public BSPs and the sources below.

All three variants and board entries belong to the shared `platformId: "l511"`
family. Detail files live under `platforms/l511/` and `boards-and-chips/l511/`.
Each board retains its exact `variantId`, and the platform/board symbols remain
model-specific for SDK configuration.

## Public sources

- [TuyaOpen board configurations](https://github.com/tuya/TuyaOpen/tree/master/boards):
  each model has its own directory and matching `BOARD_CHOICE`.
- [L511G-Y7PM adapter](https://github.com/tuya/TuyaOpen-LYNQ/tree/l511g-y7pm/tuyaos/tuyaos_adapter/src).
- [L511C-Y7PM adapter](https://github.com/tuya/TuyaOpen-LYNQ/tree/l511c-y7pm/tuyaos/tuyaos_adapter/src).
- [L511C-Y6E adapter](https://github.com/tuya/TuyaOpen-LYNQ/tree/l511c-y6e/tuyaos/tuyaos_adapter/src).
- [Official L511-Y6 series datasheet](https://developer.tuya.com/en/docs/iot/L511C-Y6E-Module-datasheet?id=Kee7nleqo4qqg):
  Y6E SRAM and flash capacity, supply and IO voltage, and all 109 physical pads.
- [MobileTek L511G-Y7 introduction](https://mobiletek.cn/news/46):
  manufacturer, module family, LTE Cat.1 bis, and supply voltage.
- [User-supplied L511C/G-Y7PM validation notes](hardware/l511c-g-y7pm.md).
- [User-supplied L511C-Y6E validation notes](hardware/l511c-y6e.md).
  The user confirmed that L511C-Y7PM and L511G-Y7PM have the same hardware
  function-pin assignments. The original notes are preserved unchanged; their
  `OK` labels are reported validation results, not tests performed here.

## Pin numbering and advertised interfaces

`pin`, `gpio`, peripheral pin groups, and board `expansionPins` use module pad
numbers. The SoC `GPIO<n>` aliases in adapter comments are a different numbering
system and must not be used as Tuya GPIO IDs.

| Module | General GPIO pads | PWM channels | Hardware I2C ports |
| --- | ---: | ---: | ---: |
| L511G-Y7PM | 29 | 5 | 2 |
| L511C-Y7PM | 33 | 5 | 2 |
| L511C-Y6E | 13 | 5 | Disabled |

Both Y7PM pinouts now contain the same 39 physical pad entries and signal names,
including the user-confirmed SPI and I2S assignments. Their general-GPIO routing
tokens still follow each target's current adapter: shared hardware pin functions
do not imply that both adapters enable every pad. Capabilities and pad notes
retain the additional hardware information without enabling unsupported GPIO
selections. The common table is still not a complete package pinout.

The GPIO lists come from active entries in `tkl_gpio.c`, excluding pads rejected
by `tkl_gpio_init`: Y7 pad 79 and Y6E pads 19 and 79. Those pads have dedicated
wakeup/SIM-detect handling. Commented-out entries are excluded. The conservative
IRQ lists expose only the adapter's wakeup GPIO paths that also support general
GPIO initialization: Y7 pads 5/6/19 and Y6E pads 20/25, with rising/falling edges.
Other GPIO IRQ paths require separate verification, particularly Y7 pads
32/58/62/63/64/66/67/78, whose supplied notes record IRQ limitations. Y7 pad 19's
normal wakeup role must be disabled with `CELL_IOCTL_CLOSE_WAKEUP_MODULE` before
repurposing it for a GPIO interrupt. Pad 16 can be occupied by the network
indicator, and pad 100 can be occupied on modules with built-in GPS.

PWM pin assignments come from the active `pwm_map` in each `tkl_pwm.c`, including
Y7 pad 23, which is usable for PWM but is commented out in the general GPIO map.
Y7 I2C0 uses SCL57/SDA58; I2C1 uses SCL67/SDA66. These fixed assignments come from
`tkl_i2c.c`; pins 66/67 are usable by I2C even when absent from the general GPIO
map. For Y6E, the user instructed us to ignore the I2C item in section 20 of the
supplied notes. Section 3 records I2C0 on pads 18/19 and I2C1 on pads 22/23 as
tested OK, without identifying which pad is SCL or SDA. These are recorded
hardware assignments. The current `tkl_i2c.c` still contains unsupported stubs,
so I2C is explicitly disabled per the user's instruction
(`peripherals.i2c.enabled: false`, zero selectable ports). The supplied hardware
pin pairs are retained here for future adaptation.
This is a TuyaOpen TKL integration gap, not evidence that the vendor SDK lacks
I2C: Y6E includes `PLAT/open_api/inc/ol_i2c_api.h` with `ol_i2c_init`,
`ol_i2c_write`, `ol_i2c_read`, and `ol_i2c_deinit`, plus
`PLAT/project/ec7xx_0h00/ap/apps/app_demo/src/i2c_demo.c` and the CMSIS I2C
driver source. Those files establish the lower-level interface and example;
they do not by themselves verify a working TuyaOpen TKL path.
The Y7 notes list other I2C mux combinations, but the current adapter fixes the
two groups above; alternate groups are not advertised as selectable. I2C1 is
occupied when the external codec is fitted, and conflicts with SPI0.

The supplied notes establish these identical Y7PM SPI routes:

| Port | Clock | MOSI | MISO | CS |
| --- | ---: | ---: | ---: | ---: |
| SPI0 | 29 | 67 | 28 | 66 |
| SPI1 | 49 | 63 | 62 | 64 |

SPI1 shares pads with USIM2. The notes recommend SPI1 for external flash up to
32 MB; that is an optional external-device limit, not internal flash capacity.
`ENABLE_EXT_FLASH` can reserve `EXT_FLASH_SPI_INDEX`, so that port may be
unavailable to the general SPI API in such builds. SPI0 shares pads 66/67 with
I2C1 and pads 28/29 with AUX UART. Avoid simultaneous conflicting uses.

The common PCM/I2S wiring is clock 30, sync 31, input 32, output 33, and master
clock 26. These signals are recorded in pin `caps` with the ES8311 support note.
They do not declare a generic `tkl_i2s` backend or an onboard codec.

Y6E ADC0/ADC1 use pads 9/96, with 12-bit hardware resolution per the datasheet.
The adapter supports voltage reads; raw-sample reads and some other ADC APIs
return `OPRT_NOT_SUPPORTED`.

Y6E AUX/DBG UART pad names disagree between the official datasheet and adapter
comments for pads 28/29/38/39. The physical names follow the datasheet, and UART
routing tokens are omitted pending reconciliation. The Y7 UART validation table
has no physical pin assignments and marks UART2 unverified, so it does not supply
enough information to add selectable UART routes.

Corrections and unresolved details in the supplied notes:

- Y7 ADC call indices are 0/1 for ADC0/ADC1, respectively, as confirmed by the
  user and current adapter (`ADC_CHN_MAX = 2`, mapped from `TUYA_ADC_NUM_0` to
  `OL_ADC_0`). The supplied notes' Tuya 1/2 labels are a numbering error;
  the original source snapshot is preserved unchanged. Physical ADC pads are
  absent from the supplied Y7 notes, so Y7 ADC routes remain omitted for that
  reason, independently of the resolved call-index correction.
- Y6E section 20's I2C unsupported item is ignored per the user's instruction;
  it is not evidence against the tested groups in section 3. Remaining gaps are
  the current SDK's I2C implementation and the SCL/SDA role assignments for each
  pair. The original source snapshot is preserved unchanged. SPI remains
  unadvertised for Y6E.

`peripheralPatterns` remains empty: these entries describe modules, and the two
L511C board registration functions register no attached peripherals. L511G's
configurable button/display wiring describes an application board and is not
treated as hardware fitted to every module. Board `expansionPins` exposes the
confirmed GPIO/PWM/I2C/SPI/ADC connection options instead.

## Images and remaining gaps

The Y7 board and platform entries use matching local copies of an AI-enhanced
L511-Y7 family illustration, shared across Y7 variants. It was edited from the
existing family image after checking the [MobileTek L511G-Y7 introduction](https://mobiletek.cn/news/46).
It is not a product photograph; fine markings, QR content, and placeholder
serial text are illustrative, not technical evidence. The original images are
retained unchanged. Per-folder source notes are in the corresponding image
folders.

The Y6E board and platform entries use matching local copies of an AI-enhanced
front-view family illustration based on the [official L511C-Y6E package drawing](https://developer.tuya.com/en/docs/iot/L511C-Y6E-Module-datasheet?id=Kee7nleqo4qqg).
The original three-view drawings are retained unchanged. The edited view is not
a new photograph; fine markings and QR content are illustrative, not technical
evidence. Per-folder source notes are in the corresponding image folders.

No complete public Y7PM datasheet or module-specific schematic was confirmed.
The corresponding links remain null. Y7 memory capacities are not inferred
from the model suffix. The existing L511G zero-valued memory fields remain
placeholders; Y6E capacities are physical totals, not free application memory.
The notes' Y7 remaining memory of 3.12M, filesystem size of 300K, and Y6E free
memory of 350K/200K are configuration-dependent observations, not installed
memory capacities; they are not used to populate total-memory fields.
Both Y7PM IO levels are now recorded as 1.8V typical from the supplied notes.
The notes say switching to 3.3V requires SDK support, so no automatic 1.8-3.3V
operating range is inferred. An unverified L511G sleep-current value was removed.

These are source and documentation checks, not hardware validation.
