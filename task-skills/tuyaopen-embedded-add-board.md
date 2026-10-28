# New board support

Own a new BSP: board directory, registration, board Kconfig and default configurations. Application code for an already adapted board belongs to hardware.

1. Inspect the actual SDK boards tree and its add_new_board documentation. Derive supported platforms from that checkout; do not freeze a historic platform list in this skill.
2. Choose a same-platform reference board from source and understand its electrical differences. Preserve the original board; create an independent variant for different hardware.
3. Use the installed tos.py new board flow only if its actual interface supports this environment; otherwise copy and edit intentionally. Board directory and choice symbols must agree.
4. Keep platform changes in the platform layer and board registration in board code. Check the actual board CMake/Kconfig conventions before registering drivers.
5. Create an appropriate application preset, select it through supported configuration tooling and compile the intended application. Hand subsequent app code to hardware and build.
6. A custom SDK board is not automatically a published onboarding catalogue board. Do not use boards list as proof the BSP was registered.
7. Build success is not electrical/audio/display validation. Report untested physical behavior and wiring explicitly.

Read [board layers](references/BOARD_LAYERS.md) and the current SDK's own board documentation for concrete templates. Never assume a config preset name must equal its board directory name.
