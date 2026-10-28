# Confirmed hardware implementation

Own actual hardware evidence, pin selection, confirmed records, peripheral implementation and API layer choice. New BSP adaptation belongs to `tuyaopen-embedded-add-board`.

1. Read used-peripherals.json, the selected board context, raw board.json, platform.json and the actual SDK headers/examples. Compare recorded decisions with source and architecture; source inference is evidence to reconcile, not automatic user confirmation.
2. User pins must be in board.expansionPins, support the requested mux function and be free of confirmed/board/reserved use. Intersect this with actual SDK/controller support. Missing expansionPins means information is unknown, not proof the board is sealed.
3. UART ports live under peripherals.uart.spec.ports with role and pinGroups in the current manifests; inspect the actual shape. Do not assume flashAndDebug, enableMacro or uart[].logPort fields exist. GPIO range pairs must be expanded correctly.
4. Reuse explicit user choices and confirmed records. Ask and wait only for unresolved wiring/instance choices. Serial may mean logs or a separate user UART; clarify when the intent is genuinely ambiguous.
5. Record the full confirmed set before implementation, preserving prior instances. hardware set-used supports flat IDs; on-chip pin objects require a validated direct update until the CLI supports them. Never drop occupancy information to fit a shortcut.
6. Board-adapted devices use board registration and TDL. External devices use usr_board registration (reuse an existing driver where available). Raw SoC bus/pin access may call TAL/TKL directly as demonstrated by this SDK. Do not impose a blanket TKL ban.
7. Check this board's resolved Kconfig. Copy required board-device choices; add a driver option only when it is actually needed and supported. Delegate configuration application to the build procedure.
8. Keep the app entry thin; add focused feature modules and register source paths according to the real CMake setup. Build, flash and physical observation are separate evidence.

Detailed API references: [GPIO](references/peripherals/onchip-gpio.md), [UART](references/peripherals/onchip-uart.md), [PWM](references/peripherals/onchip-pwm.md), [I2C](references/peripherals/onchip-i2c.md), [external registration](references/peripherals/usr-board.md), [LVGL](references/lvgl/README.md). Resolve other peripheral references from this payload's files list. Never invent APIs or register every optional board accessory.
