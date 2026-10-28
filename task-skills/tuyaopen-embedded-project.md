# Project identity and configuration

Own project creation, metadata, board/PID binding, demo browsing and IDE settings. Kconfig editing and build cleanup belong to `tuyaopen-embedded-build`; creating cloud products belongs to `tuyaopen-cloud`.

1. Establish the absolute APP root with tuyaopen.project.ini and its project metadata. The embedded source directory is not the project CLI root.
2. Read current project info, selected board/platform and any existing binding. Preserve unknown metadata fields and user changes.
3. Use the installed project command for creation, board/platform selection, binding and lifecycle updates. Query its schema before constructing arguments.
4. Browse demos and published boards as catalogues; they do not enumerate every custom BSP in the user's SDK checkout.
5. Creating from a raw SDK template and creating an IDE project are different layouts. Use the actual scaffold result rather than moving sources to satisfy an assumed directory.
6. IDE settings named config are distinct from tos.py Kconfig. Do not send a CONFIG_* option to the IDE settings command.
7. Advance lifecycle only after that stage's evidence exists. Architecture describes implemented modules; record confirmed hardware separately before implementation.

Refresh generated instructions with `project refresh-agent-context --dry-run` first. Unchanged generated files can be updated; custom or unknown instructions stay intact with a candidate under project metadata. Refreshing instructions does not rebuild or flash firmware.
