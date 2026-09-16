# MiniApp upload checklist

Run these checks through the IDE surfaces and Broker Agent Tools before a P2
upload. The checklist does not authorize a platform write by itself.

## Local checks

- `miniapp.build` returned a typed success for the active project.
- `miniapp.schema.generate` used the current `cloud.dp.sync` snapshot.
- Preview was started, queried and stopped through the three preview
  capabilities; no process handle escaped the Host-owned operation.
- The package digest is calculated by the Host and is the only package value
  sent to `miniapp.upload`.
- The MiniApp ID and version are returned by the resolved project/platform
  context or explicitly confirmed by the developer.

## Platform sequence

Each row is a separate `capability.invoke` call with the shared envelope:

| Stage | Capability | Completion condition |
|---|---|---|
| Upload | `miniapp.upload` | typed `uploaded` and `uploadId` |
| Submit | `miniapp.review.submit` | typed `submitted` and `reviewId` |
| Publish | `miniapp.release.publish` | typed `published` and `releaseId` |
| Bind | `miniapp.binding.bind` | typed `bound` and `bindingId` |

All four are P2 operations. A confirmation, URL or in-progress state is not a
completion condition; resume the operation and retain its owner binding.

## Failure handling

- Permission or expired-authentication errors go to the IDE account surface.
- Revision conflicts require a fresh context resolve and readback.
- Timeout or malformed-response errors stop the sequence; do not repeat a
  platform write with a new operation identity.
- If the remote result is ambiguous, use the Broker reconciliation path and
  report the unresolved state to the developer.
