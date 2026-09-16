# Product capability reference

Product operations are Broker capability calls. Use the shared request
envelope in the parent skill after `project.context.resolve`.

## Read product details

Invoke `cloud.product.get` with:

```json
{ "productId": "<pid>" }
```

The typed response is either `found: true` with `{id, name, dpCount}`, or a
typed `found: false` result. Do not interpret a missing product as an empty
success.

## Create a product

Invoke `cloud.product.create` with:

```json
{
  "branch": "common",
  "name": "<display-name>",
  "category": "<category>",
  "solutionId": "<solution-id>"
}
```

`branch` selects the input schema: `common` takes a string `category` and
string `solutionId`; `custom` takes `categoryCode` and a numeric
`solutionId`.

This is a P2 platform write. A successful first response may be a confirmation
or user action rather than the final product ID. Use the Broker operation tool
to resume, inspect, cancel or reconcile it. Only the final typed `productId`
is a completed result.

## Rules

- Do not guess category, communication mode, product identity or extra input
  fields; request `capability.describe` first when the current contract is
  unknown.
- Never retry a completed P2 operation with a new request ID. Use its operation
  handle and idempotency semantics.
- Never store raw credentials or platform response bodies in a project file.

## Next: define and synchronise DPs

After a product is created, use `cloud.dpSchema.fetch` to inspect its schema
and `cloud.dp.sync` to commit the Broker-owned snapshot. Continue with
`ops/manage-dp.md` for DP work.
