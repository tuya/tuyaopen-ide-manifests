# Multi-stage firmware development

Use only for a multi-stage firmware request, continuing such work, or an agreed build/flash/debug loop. A single build, log capture or peripheral request goes directly to that task skill.

1. Record this request's endpoint: implement, compile, run on a device, or verify a specified cloud path. Do not expand local development into a full phone product.
2. Read actual project metadata, source, confirmed hardware and existing evidence. Bound product snapshots live under the project's platform metadata directory; tolerate unbound local projects.
3. Load effective project/hardware/build skill payloads before their actions. Hardware owns pins, registration and its confirmed record; build owns Kconfig and compilation. Update architecture after implementation.
4. If the requested endpoint includes device execution, load flash and debug, identify the current artifact/device, flash and gather runtime evidence. Prefer an existing console probe before rebuilding for a question the running device can answer.
5. If cloud behavior is requested, read device-auth before diagnosing credentials, and cloud before product/DP changes. Credential write/readback, pairing, activation and MQTT are different stages. No code needed is not a reason to skip local testing; no board attached is a reported limit.
6. Run code-check over modified files. Its external APP support separates the SDK rules root from this project's source root.
7. Stop at the agreed endpoint. Report built, flashed, observed, credentials, activation, MQTT and DP evidence separately. Preserve errors, blockers and unobserved physical checks honestly. A local-only request never requires a panel, cloud product or authorization code as its definition of done.

For LINUX targets the bundled scripts/build_run.py can build/run the real embedded tree; do not use it on MCU images. The task's source and scripts must come from one resolved payload root. The workflow never maintains its own competing pin allocator, API restrictions, Kconfig table or monitor path rules.
