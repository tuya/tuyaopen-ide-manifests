---
name: tuyaopen-cloud
description: 'Use the IDE Agent Tool Broker for Tuya Developer Platform product and DP operations. Shared by TuyaOpen and TuyaOS.'
license: Apache-2.0
compatibility: Authenticated IDE platform account and an open project context
metadata:
  version: 1.8.4
  owner: cloud-team
  deprecated: false
---

# Shared Cloud capability

This skill is an Agent workflow over the IDE Capability Broker. It has no shell
entry point, no product-line-specific executable, and never asks the Agent to
read or inject credentials. The Host supplies the authenticated caller and
project context.

## No `tuyaopen-cli` CLI coverage

The shared payload is executed through IDE Agent Tools and Broker capabilities;
it has no direct command-line coverage.

## Exact Agent Tool contract

Resolve context once at the start of a session:

```json
{
  "method": "project.context.resolve",
  "request": { "schemaVersion": 1, "requestId": "<host-issued-request-id>" }
}
```

For a capability call, pass the `contextRef` and
`expectedExternalRevision` returned by that resolve response. The Agent Tool
adapter sends this exact Broker request shape:

```json
{
  "method": "capability.invoke",
  "request": {
    "schemaVersion": 1,
    "requestId": "<host-issued-request-id>",
    "contextRef": { "workspaceId": "<resolved>", "projectId": "<resolved>" },
    "expectedExternalRevision": "<resolved>",
    "capability": { "id": "<capability-id>", "version": 1 },
    "input": {}
  }
}
```

The request ID, identity, credentials, workspace and project are Host-owned;
do not copy them from user input. Read results are returned synchronously.
P2 writes first return the Broker confirmation/user-action result; continue
only through the returned `operation.*` tool methods. Never treat a pending
operation as a completed platform write.

## Capability map

| Intent | Capability ID | Input |
|---|---|---|
| Read product details | `cloud.product.get` | `{ "productId": "<pid>" }` |
| Read the current DP schema | `cloud.dpSchema.fetch` | `{ "productId": "<pid>" }` |
| Refresh the Broker-owned DP snapshot | `cloud.dp.sync` | `{ "productId": "<pid>", "force": false }` |
| Create a product | `cloud.product.create` | common branch: `{ "branch": "common", "name": "<name>", "category": "<category>", "solutionId": "<solution>", "communicationType": <n>, "projectId": "<id>" }` (custom branch swaps `category` → `categoryCode` and `solutionId` becomes a number) |
| Create a DP | `cloud.dp.create` | standard branch: `{ "branch": "standard", "productId": "<pid>", "selfDps": [<dpId>…] }`; custom branch: `{ "branch": "custom", "productId": "<pid>", "dp": { "id": <101-199>, "name": "<name>", "code": "<code>", "mode": "<mode>", "property": { … } } }` |
| List MiniApp binding candidates | `miniapp.binding.candidates.list` | `{ "productId": "<pid>" }` |
| Bind a MiniApp | `miniapp.binding.bind` | `{ "miniappId": "<id>", "productId": "<pid>" }` |

The input schemas in `capability.describe` are authoritative. Do not infer a
capability from a command-group name or invent fields. `cloud.dp.sync` is the
only operation that refreshes and commits the local DP snapshot; it is not a
web fallback.

Deletion boundary: the Broker chain is create-only for DPs. It has no remove
or modify capability — taking a DP off the platform goes through the IDE's
product surface or the CLI's `dp remove` command, never through this chain.

## Safe execution rules

- Call `capability.list` or `capability.describe` when the available provider
  or input contract is unclear.
- A missing provider is a typed Broker error before any platform request; do
  not substitute a shell command or ask for a secret.
- For a P2 result, show the returned summary and URL/action to the developer,
  then use the returned operation handle. The Broker owns confirmation,
  idempotency, expiry and reconciliation.
- On `REVISION_CONFLICT`, resolve context again and re-read the affected
  capability. Never reuse a stale revision.
- Never write a platform snapshot by hand. The Broker is the sole writer.

## Product/DP workflow

1. Resolve context and inspect the active product identity.
2. Call `cloud.product.get` and `cloud.dpSchema.fetch` for readback.
3. Use `cloud.dp.create` only when the requested custom DP is not already
   present; accept its P2 operation result and final typed reference.
4. Call `cloud.dp.sync` to refresh the local snapshot after a confirmed cloud
   change.
5. Pass the resulting schema to the IDE's local MiniApp/firmware surfaces;
   those are separate capabilities and must not be emulated here.

See `ops/product.md` and `ops/manage-dp.md` for the field-level decisions.
