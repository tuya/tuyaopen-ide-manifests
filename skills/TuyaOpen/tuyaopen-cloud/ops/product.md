# Product Management

Search, inspect, and create products on the Tuya Developer Platform.

See [../SKILL.md](../SKILL.md) for auth, output format, and dry-run/confirm conventions.

---

## Standard path — helper script

`scripts/product.py` covers all three operations:

> If `tuya-devplat-cli` is not in PATH, set `TUYA_DEVPLAT_CLI` to the binary path:
> ```bash
> export TUYA_DEVPLAT_CLI=".tuyaopen/ide/bin/tuya-devplat-cli"
> ```
> The script also auto-detects the binary at `.tuyaopen/ide/bin/tuya-devplat-cli` by
> searching upward from the current working directory.

```bash
# List all products (default max 20)
python scripts/product.py list

# Search by keyword
python scripts/product.py list --keyword "test"

# Get product details by PID
python scripts/product.py detail --product-id <pid>

# Create a product (default: wf_ble_qt, solution 10019526)
python scripts/product.py create --name "my-product"

# Create with a specific category/solution
python scripts/product.py create --name "my-socket" --category wf_ble_cz --solution-id 134001
```

---

## Manual path

### Search / list products

```bash
tuya-devplat-cli product list --format json --max-items 20
tuya-devplat-cli product list --keyword "<keyword>" --format json --max-items 20
```

Results are in `data.datas[]`. Key fields: `id`, `name`, `categoryName`, `developStatus`.

Use `--fields` to reduce output:

```bash
tuya-devplat-cli product list --format json \
  --fields id,name,categoryName,developStatus --max-items 20
```

### Get product details

```bash
tuya-devplat-cli product detail --id <pid> \
  --fields id,name,categoryName,categoryCode,communicationCodes,developStatus \
  --format json
```

### Create a product

> **Account cap — read before creating.** The platform limits how many products
> may sit in **Developing** (开发中) state at once. The cap counts *only*
> Developing products, **not** the account's product total: on a measured
> account (2026-08-20) the ceiling was **10 Developing** while 24 products
> existed overall. A refusal looks like this:
>
> ```json
> { "ok": false,
>   "code": "CREATE_PRODUCT_DEVELOPING_LINE",
>   "error": "The number of products in Developing state has reached the limit. Try finishing the development of a product or upgrading your account" }
> ```
>
> Three ways out, in order of cost: **finish** a Developing product (its
> `developStatus` goes 0 → 3 and it stops counting), **delete** a Developing
> product you no longer need, or **upgrade the account**. Both of the first two
> are done at <https://platform.tuya.com/pmg/list>.
>
> Deleting a **released** product frees nothing — it was never in the Developing
> bucket. To see which products actually count, list them and filter on
> `developStatus == 0` (`0` = developing, `3` = released):
>
> ```bash
> tuya-devplat-cli product list --page-size 100 --format json \
>   --fields id,name,developStatus
> ```
>
> The CLI's `suggestion` field is **not** useful for this refusal — it falls back
> to the generic "Check parameters or run the command with --help", which is
> wrong advice here. Trust `code` and `error`.

#### Step 1 — Find the category code

Skip if using a known category from the reference table in SKILL.md.

```bash
tuya-devplat-cli product category-tree --keyword "<keyword>" --format json
```

Find the matching node; its **`code` field** is the category code.

#### Step 2 — Find the solution ID

Run `custom-list` with the raw category code:

```bash
tuya-devplat-cli product custom-list --category-code <code> --format json
```

**Case A — `solutionModuleVOS` present** (e.g., `cz`, `dj`):
Pick any entry where `capabilityCode == "wifi_bluetooth"`. Its **`code` field** is the solution ID.

**Case B — `solutionModuleVOS` absent** (e.g., `qt`):
Take `solutionGroupVOS[0].solutionGroupId`, then:

```bash
tuya-devplat-cli product communication-list \
  --solution-group-id <solutionGroupId> --format json
```

In `data[0].data[]`, find `upstream.name == "WiFi-蓝牙"`.
Use its **`solutionId`** and **`code`** (= frontend category code).

#### Step 3 — Create (dry-run → confirm)

```bash
# dry-run
tuya-devplat-cli product create-common \
  --name "<name>" --category <frontend_category> --solution-id <solution_id> \
  --dry-run --format json

# confirm
tuya-devplat-cli product create-common \
  --name "<name>" --category <frontend_category> --solution-id <solution_id> \
  --confirm <confirm_token> --format json
```

`data.id` in the confirm response is the **PID**.

#### Step 4 — Verify

```bash
tuya-devplat-cli product detail --id <pid> \
  --fields id,name,categoryName,categoryCode,communicationCodes,developStatus \
  --format json
```

Confirm `communicationCodes` contains both `"wifi"` and `"bluetooth"`.

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `CATEGORY_NOT_EXIST` | Pass English code (e.g., `cz`), not Chinese name |
| `solutionModuleVOS` absent | Use `communication-list` fallback (Case B) |
| `confirm_token` rejected (`INVALID_CONFIRMATION`) | Re-run `--dry-run` to get a new token |
| `API_OR_API_VERSION_WRONG` | Check auth: `tuya-devplat-cli auth status` |
| `CREATE_PRODUCT_DEVELOPING_LINE` | The account's **Developing**-product cap is full (measured ceiling: 10). Finish or delete a Developing product at <https://platform.tuya.com/pmg/list>, or upgrade the account. Deleting a *released* product does **not** help — see the account-cap note above |
