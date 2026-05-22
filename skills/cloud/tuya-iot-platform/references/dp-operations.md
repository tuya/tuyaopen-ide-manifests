# DP (Data Points / 功能点) Operations

DPs are the functional definitions of a product — switch state, brightness level, color, etc.

---

## Find / Query

### Current DPs on the product

```bash
tuya-devplat-cli product dp-schema --product-id <pid> --format json
```

Returns `data.dps[]` — all active DPs (standard and custom).
Key fields per DP: `id`, `code`, `name`, `type`, `subType`, `mode`, `property`, `standarded` (1=standard, 0=custom), `required`.

### Standard DP pool from the solution

```bash
tuya-devplat-cli product dp-list --product-id <pid> --format json
```

Returns the full DP pool defined by the product's solution. Use this to discover DP `id` values
before calling `dp-add-standard`. Returns `data[]` (flat array) with `id`, `code`, `name`, `selected`, `required`.

### Validate DPs

```bash
tuya-devplat-cli product dp-valid --product-id <pid> --format json
```

Returns `data[]` — validation result for each DP. Run before releasing the product.

### Search DP templates from other categories

```bash
tuya-devplat-cli product dp-template-search \
  --product-id <pid> \
  --keyword "temperature" \
  --page-no 1 --page-size 20 \
  --format json
```

Returns `data.totalCount` and `data.datas[]`. Note: `datas` may be empty even when `totalCount > 0`
due to platform-side pagination behaviour for some category combinations.

---

## Create

### Add standard DPs (required after product creation)

A newly created product has no DPs. Call this immediately after creation using IDs from `dp-list`:

```bash
tuya-devplat-cli product dp-add-standard \
  --product-id <pid> \
  --self-dps "[1,2,3]" \
  --dry-run --format json

tuya-devplat-cli product dp-add-standard \
  --product-id <pid> \
  --self-dps "[1,2,3]" \
  --confirm <token> --format json
```

`--self-dps` is a JSON array of DP IDs from `dp-list`. `--another-dps` is an optional second group (defaults to `[]`).

### Add a custom DP

`id` is **required** and must be a unique integer in the valid platform range (**1–150**).
The CLI validates id before sending and returns a structured error for:
- `DP_ID_MISSING` — id absent or non-positive
- `DP_ID_OUT_OF_RANGE` — id > 150
- `DP_ID_CONFLICT` — id already used by an existing DP on this product

Use `dp-schema` first to check which ids are already taken, then choose a free slot (101–150 by convention for custom DPs).

Required DP fields: `id`, `name`, `code`, `mode` (`ro`/`rw`/`wr`), `type` (`obj`/`raw`),
`subType` (matches `property.type`), `property` object.

```bash
tuya-devplat-cli product dp-add-custom \
  --product-id <pid> \
  --dp '{"id":101,"name":"Custom Switch","code":"custom_switch","mode":"rw","type":"obj","subType":"bool","property":{"type":"bool"}}' \
  --dry-run --format json

tuya-devplat-cli product dp-add-custom \
  --product-id <pid> \
  --dp '{"id":101,"name":"Custom Switch","code":"custom_switch","mode":"rw","type":"obj","subType":"bool","property":{"type":"bool"}}' \
  --confirm <token> --format json
```

Supported `property.type` values and their `subType`:

| property.type | subType | Notes |
|---|---|---|
| `bool` | `bool` | True/false |
| `value` | `value` | Integer with min/max/step/unit/scale |
| `enum` | `enum` | `property.range: ["val1","val2"]` |
| `string` | `string` | `property.maxlen: <n>` |
| `bitmap` | `bitmap` | `property.maxlen`, `property.label` |
| `raw` | `raw` | Opaque bytes; use `type:"raw"` |

---

## Update

The v2 update API requires the **full DP object** — not just the changed fields.
Always call `dp-schema` first to get the current DP, then send all core fields with your changes.

Required fields: `id`, `code`, `name`, `desc`, `mode`, `type`, `subType`, `property`.

```bash
# 1. Get current DP state
tuya-devplat-cli product dp-schema --product-id <pid> --format json

# 2. Update (send all core fields, not just the diff)
tuya-devplat-cli product dp-update \
  --product-id <pid> \
  --dp '{"id":101,"name":"New Name","desc":"updated","code":"custom_switch","mode":"rw","type":"obj","subType":"bool","property":{"type":"bool"}}' \
  --dry-run --format json

tuya-devplat-cli product dp-update \
  --product-id <pid> \
  --dp '{"id":101,"name":"New Name","desc":"updated","code":"custom_switch","mode":"rw","type":"obj","subType":"bool","property":{"type":"bool"}}' \
  --confirm <token> --format json
```

Returns `data: true` on success.

---

## Delete / Remove

### Remove a standard DP

Risk level: **P0** (permanently removes the DP binding from the product).

```bash
tuya-devplat-cli product dp-remove-standard \
  --product-id <pid> \
  --dp-id <dpId> \
  --dry-run --format json

tuya-devplat-cli product dp-remove-standard \
  --product-id <pid> \
  --dp-id <dpId> \
  --confirm <token> --format json
```

Only non-required standard DPs can be removed. Required DPs (`required: true` in `dp-schema`) cannot be removed.

### Remove a custom DP

There is no `dp-remove-custom` CLI command. To remove a custom DP, use the platform web UI at
[platform.tuya.com](https://platform.tuya.com) or call the platform API directly with `--raw-body`.
