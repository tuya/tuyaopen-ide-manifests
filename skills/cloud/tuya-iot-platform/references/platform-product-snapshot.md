# Platform Product Snapshot (IDE Cache)

## When to read

Read this reference whenever you need to interpret the cached product/DP data at:

```
<project>/.tuyaopen/platform/product-<pid>.json
```

The **active product PID** comes from `tuyaopen.project.ini` → `[product]` → `pid`.
If the file is missing or stale, ask the developer to trigger a sync in the TuyaOpen IDE
(Project Details → refresh). Do not invent product or DP data.

---

## IDE snapshot envelope

The file is a JSON object (`PlatformProductSnapshot`) with these top-level fields:

| Field | Type | Meaning |
|-------|------|---------|
| `schemaVersion` | `1` or `2` | Format version — use version-specific handling below |
| `pid` | `string` | Product ID matching the filename suffix |
| `fetchedAt` | `string` | ISO 8601 timestamp of last successful CLI fetch |
| `source` | `"tuya-devplat-cli"` | Always this value |
| `detail` | `object?` | Raw `product detail` CLI stdout JSON |
| `dpSchema` | `object?` | Raw `product dp-schema` CLI stdout JSON |
| `fetchError` | `string?` | Joined error text when last fetch failed; `detail`/`dpSchema` may still hold stale data |

`schemaVersion: 2` is current. Both `detail` and `dpSchema` may be absent when the snapshot
was written after a fetch failure.

---

## `detail` — product information

### Unwrap

```
const data = detail.data ?? detail
```

The CLI wraps responses in `{ ok, data }`. Always unwrap before reading fields.

### Common fields (after unwrap)

| Field | Description |
|-------|-------------|
| `id` | Product ID (same as `pid`) |
| `name` | Product display name |
| `productName` | Alternative name field (prefer `name` if both exist) |
| `category` / `categoryVO` | Object with `categoryName` or `name` — category breadcrumb |
| `categoryCode` | Category code (e.g. `wf_ble_dj`) |
| `productKey` | Unique product key string |
| `status` | Product status code |

Not all fields are present for every product type.

---

## `dpSchema` — data point schema

### Unwrap

```
const data = dpSchema.data ?? dpSchema
```

### `dps[]` — active data points

After unwrapping, `data.dps` is an array of DP objects. Only DPs with **`selected === true`**
are active on this product — skip others.

Each selected DP object:

| Field | Alternatives | Description |
|-------|-------------|-------------|
| `id` | `dpId`, `dp_id` | DP numeric ID |
| `code` | `dpCode`, `dp_code` | DP code string (e.g. `switch_1`) |
| `name` | `dpName`, `dp_name` | Display name |
| `type` | `dpType`, `dataType` | Data type (`bool`, `value`, `string`, `enum`, `raw`, `obj`) |
| `subType` | `sub_type` | Sub-type when `type === "obj"` |
| `mode` | `accessMode`, `rw` | Access mode (`rw`, `ro`, `wr`) |
| `property` | — | Object with type-specific constraints (see below) |
| `selected` | — | **Must be `true`** — skip all others |

`property` fields (excluding the `type` key itself): range bounds (`min`, `max`, `step`,
`scale`), enum values (`range`), max-length (`maxlen`), label for `bool`, etc.

### `uiConfig.bic[]` — cloud (BIC) functions

`data.uiConfig.bic` may be an array of cloud function definitions enabled for this product.
Each entry has `code`, `name`, and configuration specific to that cloud function type.

---

## Legacy schemaVersion 1

Snapshots written before schemaVersion 2 have a different structure:
- Top-level `dps` array (already normalized, not raw CLI JSON)
- `detail` if present is a plain object without the `data` wrapper

When `schemaVersion === 1`:
- Read `dps` directly from the top level (no unwrap needed)
- `detail.name` is the product name directly

If possible, ask the developer to re-sync to upgrade to schemaVersion 2.

---

## Rules

- **Read-only** — never modify `product-<pid>.json` directly; it is owned by the IDE.
- **IDE sync** — the file is written by the TuyaOpen IDE on project open and on manual refresh.
- **Mutations via CLI** — to add, remove, or update DPs, use `tuya-devplat-cli` commands
  (see `dp-operations.md`).
- **Never invent data** — if the snapshot is missing or `fetchError` is set, surface the gap
  to the developer rather than guessing.

---

## Related references

- [`product-create.md`](product-create.md) — create a product and obtain its PID
- [`dp-operations.md`](dp-operations.md) — query, add, update, and remove DPs via CLI
