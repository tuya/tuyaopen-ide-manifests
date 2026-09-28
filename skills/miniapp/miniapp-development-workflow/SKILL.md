---
name: miniapp-development-workflow
description: 'Shared MiniApp 小程序 and 面板 development and release workflow for TuyaOpen and TuyaOS, including Ray and 需求 hand-offs, using IDE Agent Tools and Capability Broker.'
license: Apache-2.0
compatibility: An authenticated IDE session with an open MiniApp project
metadata:
  version: 2.7.4
  owner: miniapp-team
  deprecated: false
---

# Shared MiniApp development workflow

This phase skill owns order and hand-offs. The IDE Agent Tool adapter owns
execution through the Capability Broker; there is no shell or product-line
specific command syntax in this skill.

## No `tuyaopen-cli` CLI coverage

This payload's executable vocabulary is Broker capabilities only — it
deliberately publishes no shell commands. The executable CLI route lives in
the CLI's own discovery surfaces, which are always present, always current,
and read by agents that never open a skill:

- the `miniapp upload` JSON envelope's `webSteps` block, whose `order` array
  spells the post-upload route (submit for review, release, bind) command by
  command, with web fallback URLs; and
- `schema list` / `schema get`, which describe every command and flag the
  installed CLI actually carries.

Read the absence of commands here precisely: it does NOT mean any step is
web-only. Submit for review, release, and bind are all scriptable outside the
IDE; this document is just not the place that publishes the commands.

## One request contract

Resolve context once, then use the returned context and revision for every
capability call:

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

The Host injects and validates identity, product line, workspace, project and
credentials. The Agent provides only task input. Use `capability.describe`
when an input schema is unclear.

## Phase order

1. `miniapp.template.list`; choose a supported template.
2. `miniapp.template.create`; then `miniapp.build` for the active project.
3. `cloud.dp.sync`; then `miniapp.schema.generate` so schema generation uses
   the current typed DP snapshot.
4. `miniapp.preview.start`; poll `miniapp.preview.status.get`; stop with
   `miniapp.preview.stop`. Keep the returned operation/process ownership in
   the Host and discard it on workspace switch or disposal.
5. Package locally and call `miniapp.upload` — it takes the local `packagePath`
   plus the caller-produced `biz`/`sign`/`random` upload material, not a digest.
6. Follow the P2 operation states for `miniapp.review.submit`,
   `miniapp.release.publish` and `miniapp.binding.bind`.

## State and failure rules

- A successful build or schema generation is local typed output; it does not
  imply an uploaded or published MiniApp.
- Confirmation, user-action and in-progress responses must be resumed through
  the returned operation handle. Never report them as completed.
- On revision conflict, resolve context again and repeat the affected read.
- Authentication, permission, timeout and malformed-response errors remain
  typed Broker results. Stop at the failed phase and preserve the operation
  handle for recovery.

The capability skill contains the closed input map. This workflow contains
the phase order only, so the two documents cannot drift into competing
execution instructions.
