# Project context and DP snapshot

The Broker exposes project metadata and platform snapshots through typed
context and capability responses. Shared skills do not read a product-line
specific dot-directory or invoke a synchronisation binary.

## Source of truth

- `project.context.resolve` identifies the active product line, workspace and
  project and returns the revision used for subsequent calls.
- `cloud.product.get` returns the typed product identity.
- `cloud.dpSchema.fetch` reads the current platform DP schema.
- `cloud.dp.sync` refreshes and commits the IDE-owned local snapshot.
- `miniapp.binding.candidates.list` returns typed MiniApp candidates.

The Host selects the correct TuyaOpen or TuyaOS metadata files internally.
Agents must not infer the location, edit a snapshot, or copy platform payloads
into project files.

## Staleness and recovery

Use the returned external revision on every context-bound call. A
`REVISION_CONFLICT` response means that the project changed: resolve context,
read the product/schema again, and recompute the next input. Keep operation
handles for pending sync or binding work; do not create a second operation to
work around a conflict.
