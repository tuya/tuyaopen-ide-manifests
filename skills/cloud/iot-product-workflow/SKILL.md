---
name: iot-product-workflow
description: 'Shared product-development workflow for TuyaOpen and TuyaOS, covering 产品 and 平台 operations with IDE Agent Tools and Capability Broker.'
license: Apache-2.0
compatibility: An authenticated IDE session with an open project context
metadata:
  version: 2.2.3
  owner: cloud-team
  deprecated: false
---

# Shared product development workflow

This phase skill describes order and hand-offs. Every executable step is an
Agent Tool call through the IDE Capability Broker. The Host supplies identity,
credentials, product line, workspace and project context; the skill supplies
only capability IDs and typed input.

## No `tuyaopen-cli` CLI coverage

This shared workflow is executed through IDE Agent Tools and Broker
capabilities; it has no direct command-line coverage.

## Tool sequence

1. Call `project.context.resolve` and retain its `contextRef` and
   `expectedExternalRevision`.
2. Call `cloud.product.get` to inspect the active product. If no product is
   bound, ask the IDE to complete the product-binding flow before continuing.
3. Call `cloud.dpSchema.fetch` to read the platform DP schema.
4. Call `cloud.dp.create` for a missing custom DP. It is P2: follow the Broker
   operation handle through confirmation and readback.
5. Call `cloud.dp.sync` after a confirmed platform change. This is the only
   operation in this workflow that commits the Broker-owned DP snapshot.
6. Hand the schema to the local firmware or MiniApp capability as a separate
   operation; do not reproduce its file or build steps here.

## Request shape

The adapter sends the same versioned frame for every capability:

```json
{
  "method": "capability.invoke",
  "request": {
    "schemaVersion": 1,
    "requestId": "<host-issued-request-id>",
    "contextRef": { "workspaceId": "<resolved>", "projectId": "<resolved>" },
    "expectedExternalRevision": "<resolved>",
    "capability": { "id": "cloud.product.get", "version": 1 },
    "input": { "productId": "<resolved-or-user-confirmed-pid>" }
  }
}
```

The Host validates project ownership and revision. User text cannot replace
the request identity or the context fields. Use `capability.describe` for the
closed input/output schema before an unfamiliar call.

## Completion rules

- A typed success with a product/DP identifier is the only completed cloud
  result.
- A P2 confirmation, web action or in-progress operation is not success; use
  `operation.get`, `operation.resume`, `operation.cancel` or reconciliation as
  directed by the returned operation state.
- A revision conflict requires a fresh context resolve and readback.
- Authentication failures go to the IDE account surface. Never request,
  print or persist a credential.
