# Product Creation Workflow

## 1. Find the right category

```bash
# Flat list of all leaf categories with breadcrumb paths
tuya-devplat-cli product category-tree --type standard --format json

# Narrow by keyword (recommended — the full list is large)
tuya-devplat-cli product category-tree --type standard --keyword "灯" --format json
```

Returns a flat array. Key fields per entry:
- `categoryCode` — **sub-category code** (e.g. `kg`, `dj`)
- `categoryName` — display name in Chinese
- `path` — breadcrumb like `电工 > 开关`

> **Note:** `create-common` requires a **front-end category code** (e.g. `wf_ble_dj`) which
> combines a communication-type prefix with the sub-category code.
> `category-tree` returns only the sub-category code portion (`dj`).
> Obtain the full front-end code from: `product detail --id <existingPid>` → `categoryCode` field,
> or construct it as `<commPrefix>_<subCode>` (e.g. WiFi+BLE prefix = `wf_ble_`, giving `wf_ble_dj`).

## 2. Get the solution ID

`solution-list` currently returns empty results for all category codes — use the Tuya Developer
Platform web UI (`iot.tuya.com`) to find a valid `solutionId` for your category, or copy the
`solutionId` from an existing product via `product detail --id <pid>`.

```bash
# Inspect an existing product to borrow its IDs
tuya-devplat-cli product detail --id <existingPid> --format json
```

## 3. Create the product

**Common mode** — front-end category code + solution ID:
```bash
tuya-devplat-cli product create-common \
  --name "My Smart Light" \
  --category wf_ble_dj \
  --solution-id 12345 \
  --project-id $PROJECT_ID \
  --dry-run --format json

tuya-devplat-cli product create-common \
  --name "My Smart Light" \
  --category wf_ble_dj \
  --solution-id 12345 \
  --project-id $PROJECT_ID \
  --confirm <token> --format json
```

**Custom mode** — sub-category code + hardware solution + communication type:
```bash
tuya-devplat-cli product create-custom \
  --name "My Device" \
  --category-code qt \
  --solution-id 1243004929182797887 \
  --communication-type 1025 \
  --project-id $PROJECT_ID \
  --dry-run --format json
```

**TuyaLink mode** — TuyaLink protocol products:
```bash
tuya-devplat-cli product create-tuyalink \
  --name "My TuyaLink Device" \
  --device-type <type> \
  --data-format <format> \
  --communication-tag <tag> \
  --project-id $PROJECT_ID \
  --dry-run --format json
```

## 4. Extract the PID

The successful create response contains `data.id` — this is the **Product ID (PID)**.

```bash
tuya-devplat-cli product detail --id <pid> --format json
```

> The CLI auto-saves the PID to sandbox resource relations when `--project-id` or `$PROJECT_ID`
> is set. If neither is present, the relation step is skipped but the product is still created.

## Next steps after creation

1. Add DPs — a new product has none by default. See `dp-operations.md`.
