---
name: tuyaopen-miniapp
description: 'Use IDE Agent Tools and the Capability Broker for shared MiniApp templates, build, schema, preview, upload, review and binding operations.'
license: Apache-2.0
compatibility: An authenticated IDE session with an open TuyaOpen or TuyaOS MiniApp project
metadata:
  version: 2.5.2
  owner: miniapp-team
  deprecated: false
---

# Shared MiniApp capability

This skill is executable only through the IDE Agent Tool adapter. It does not
publish a shell command, binary path, credential environment variable or
product-specific project-file path. The Host resolves the active product line
and project before the Agent invokes a capability.

## No `tuyaopen-cli` CLI coverage

The shared payload is executed through IDE Agent Tools and Broker capabilities;
it has no direct command-line coverage.

## Exact Agent Tool contract

First resolve context:

```json
{
  "method": "project.context.resolve",
  "request": { "schemaVersion": 1, "requestId": "<host-issued-request-id>" }
}
```

Then send a capability invocation using the returned context and revision:

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

The Host owns identity, credentials, paths and request IDs. The Agent may
provide task inputs only. P2 responses are operation/user-action states; use
the returned `operation.*` tool methods and report the final typed result.

## Capability map

| Intent | Capability ID | Input |
|---|---|---|
| List templates | `miniapp.template.list` | `{}` |
| Create from a template | `miniapp.template.create` | `{ "templateId": "<id>" }` |
| Build the active project | `miniapp.build` | `{ "mode": "development" }` |
| Generate the device schema | `miniapp.schema.generate` | `{ "target": "panel-device-schema" }` |
| Start preview | `miniapp.preview.start` | `{ "port": 0 }` |
| Read preview status | `miniapp.preview.status.get` | `{}` |
| Stop preview | `miniapp.preview.stop` | `{ "port": <port> }` |
| Refresh DP snapshot | `cloud.dp.sync` | `{ "productId": "<pid>", "force": false }` |
| Upload a package | `miniapp.upload` | `{ "miniappId": "<id>", "versionCode": "<x.y.z>", "packagePath": "<local package path>", "biz": "<biz>", "sign": "<sig>", "random": "<random>", "lowestJssdk": "<sdk ver>" }` |
| Submit review | `miniapp.review.submit` | `{ "miniappId": "<id>", "version": "<version>" }` |
| Publish a release | `miniapp.release.publish` | `{ "miniappId": "<id>", "version": "<version>" }` |
| List binding candidates | `miniapp.binding.candidates.list` | `{ "productId": "<pid>" }` |
| Bind the MiniApp | `miniapp.binding.bind` | `{ "miniappId": "<id>", "productId": "<pid>" }` |

Input/output schemas from `capability.describe` are authoritative. Two
easy-to-guess fields: `packagePath` is a local path to the packaged archive on
the machine brokering the upload — the vendored CLI reads it there; and the
CLI neither compiles nor signs — `biz`/`sign`/`random` are produced upstream
by the caller and forwarded verbatim.

## Local workflow

1. List or create a template, then build the active project.
2. Generate the schema after `cloud.dp.sync` has returned the current typed
   snapshot.
3. Start preview and retain the returned process/port operation identity.
   Query status before stopping it; stop is idempotent.
4. Upload, submit, publish and bind only as P2 operations. A user-action or
   confirmation response is resumable state, not a success result.

Workspace switches and Host disposal invalidate local preview ownership. Do
not retain a process handle across either event.
