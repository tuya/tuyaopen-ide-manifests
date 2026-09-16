# DP capability reference

DP operations use the shared Broker Agent Tool envelope from the parent skill.
The capability input schemas are closed; use `capability.describe` instead of
guessing fields.

## Read and synchronise

Read the current platform schema with `cloud.dpSchema.fetch`:

```json
{ "productId": "<pid>" }
```

Refresh the Broker-owned snapshot with `cloud.dp.sync`:

```json
{ "productId": "<pid>", "force": false }
```

`cloud.dp.sync` performs the remote read and local commit under its operation
CAS. It has no web fallback. A conflict preserves the pending intent for the
Broker's reconciliation path.

## Create a DP

Invoke `cloud.dp.create`. The `branch` field selects the input schema. The
custom branch defines one new DP (id 101–199):

```json
{
  "branch": "custom",
  "productId": "<pid>",
  "dp": {
    "id": 101,
    "name": "<display-name>",
    "code": "<stable-code>",
    "mode": "rw",
    "property": { "type": "bool" }
  }
}
```

The standard branch selects already-defined DPs onto the product:
`{ "branch": "standard", "productId": "<pid>", "selfDps": [101] }`.

This chain can only add. Removing a DP from the platform is outside the
Broker surface — use the IDE's product surface or the CLI's `dp remove`
command.

Creation is P2. The Broker owns confirmation, one-shot credentials,
idempotency and the final typed `dpId`. Do not treat a preview or a user-action
response as a created DP.

## Troubleshooting

- `platform_auth_expired` means the developer must use the IDE account flow;
  the Agent must not request or print a token.
- `REVISION_CONFLICT` means re-resolve context and re-read the schema.
- `provider_result_malformed` means stop and report the typed error; never
  repair a platform payload in a local project file.

## Next: generate the local schema

After a confirmed DP change, call `cloud.dp.sync`, then hand its typed snapshot
to the IDE's local `miniapp.schema.generate` or firmware code-generation
surface. The next phase is `miniapp-development-workflow` for panel work.
