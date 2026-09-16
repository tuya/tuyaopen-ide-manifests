# MiniApp release flow

This reference is an Agent Tool checklist. Every platform or local action is
sent through the IDE Capability Broker with the resolved context and revision.

## Request envelope

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

The Host supplies identity, credentials, paths and product line. The Agent
must not add those fields from user text.

## Ordered calls

1. `project.context.resolve`
2. `miniapp.template.list`
3. `miniapp.template.create` with `{ "templateId": "<id>" }`
4. `miniapp.build` with `{ "mode": "development" }`
5. `cloud.dp.sync` with `{ "productId": "<pid>", "force": false }`
6. `miniapp.schema.generate` with `{ "target": "panel-device-schema" }`
7. `miniapp.preview.start` with `{ "port": 0 }`; poll
   `miniapp.preview.status.get`; finish with `miniapp.preview.stop`
8. `miniapp.upload` with the package SHA-256 digest
9. `miniapp.review.submit`, `miniapp.release.publish`, and
   `miniapp.binding.bind` as separate P2 operations

The first response for a P2 call can be a confirmation or user-action state.
Use the returned operation handle until a final typed result is available.
Never report an operation as uploaded, approved, published or bound while it
is still pending.

## Recovery

Use `operation.get` for durable state, `operation.resume` for a returned user
action, and `operation.cancel` or reconciliation for a failed or interrupted
operation. On a revision conflict, resolve context and re-read before retrying.
Workspace changes and Host disposal invalidate local preview ownership.
