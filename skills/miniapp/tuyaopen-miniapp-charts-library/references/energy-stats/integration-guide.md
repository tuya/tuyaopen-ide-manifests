# Electrician Energy Billing — Integration Guide

## Prerequisites

### 1. Cloud Capability Authorization

All energy billing APIs require cloud capability authorization in the mini-program developer platform.

**Steps:**
1. Open [小程序开发者平台](https://platform.tuya.com/miniapp/)
2. Navigate to `开发设置` → `云能力`
3. Enable authorization for the following API groups:
   - Smart Energy device data (`m.energy.device.indicator.data`)
   - Smart Energy device currency (`tuya.m.smartenergy.device.currency.*`)
   - Smart Energy device price (`tuya.m.smartenergy.device.price.*`)
   - Smart Energy device budget (`tuya.m.smartenergy.device.budget.*`)
   - Smart Energy device data management (`tuya.m.smartenergy.device.data.*`)
   - Smart Energy common (`tuya.m.smartenergy.common.*`)

### 2. Product Activation — Electricity Statistics Advanced Capability

For energy data collection to work (getDeviceData, budget, export, clean), the device product must have the electricity statistics capability enabled.

**Steps:**
1. Open [涂鸦 IoT 开发平台](https://iot.tuya.com/)
2. Go to product management → select your product
3. Enable **电量统计** (Electricity Statistics) advanced capability
4. Ensure DP points like `cur_power` (current power), `add_ele` (accumulated electricity) are configured in the product schema

Without this capability, `getDeviceData` returns empty data and budget APIs may error.

---

## API Mapping: atop → @tuya-miniapp/cloud-api

| Old Pattern (DO NOT USE) | cloud-api Function | Notes |
|---|---|---|
| `apiRequestByAtop('m.energy.device.indicator.data', ...)` | `getDeviceData(params)` | Same params: devId, indicatorCode, dateType, beginDate, endDate |
| `apiRequestByAtop('tuya.m.smartenergy.device.price.get', ...)` | `getPeakValleyPrice({ devId })` | Returns parsed config (auto JSON.parse) |
| `apiRequestByAtop('tuya.m.smartenergy.device.price.save', ...)` | `savePeakValleyPrice({ devId, priceConfig })` | Auto-injects energyType + priceType + energyAction |
| `apiRequestByAtop('tuya.m.smartenergy.device.currency.get', ...)` | `getDeviceCurrency({ devId })` | Returns string directly (empty string if not set) |
| `apiRequestByAtop('tuya.m.smartenergy.device.currency.save', ...)` | `saveDeviceCurrency({ devId, currency })` | ISO 4217 code |
| `apiRequestByAtop('tuya.m.smartenergy.common.currency.list', ...)` | `getCurrencyList()` | Filters out DEFAULT placeholder |
| `apiRequestByAtop('tuya.m.smartenergy.device.budget.get', ...)` | `getDeviceConsumeBudget({ devId })` | Auto-filters energyAction === 'consume' |
| `apiRequestByAtop('tuya.m.smartenergy.device.budget.get', ...)` | `getDeviceCostBudget({ devId })` | Auto-filters energyAction === 'cost' |
| `apiRequestByAtop('tuya.m.smartenergy.device.budget.save.batch', ...)` | `batchSaveConsumeBudget({ devId, budgetConfig })` | Auto-injects energyType + energyAction |
| `apiRequestByAtop('tuya.m.smartenergy.device.budget.save.batch', ...)` | `batchSaveCostBudget({ devId, budgetConfig })` | Auto-injects energyType + energyAction |
| `apiRequestByAtop('tuya.m.smartenergy.device.data.clean', ...)` | `cleanDeviceData({ devId })` | Irreversible |
| `apiRequestByAtop('tuya.m.smartenergy.device.data.export', ...)` | `exportDeviceData({ devId, dateType, beginDate, endDate, email, indicatorCodes })` | Async email |
| `apiRequestByAtop('tuya.m.smartenergy.device.data', ...)` | `getUnitByIndicatorCode({ devId, indicatorCode, dateType, beginDate, endDate })` | Returns unit string |

### Removed APIs (DO NOT generate)

| Old Pattern | Reason |
|---|---|
| `getBuyerHighPower(code)` / `m.energy.product.ability.exists` / `{THING}.app.buyer.high.power.get` | Capability gating removed — assume feature is enabled |

---

## Device Property Keys

For data that is not energy-specific (email address, custom currency unit), use device property storage from `@ray-js/ray`:

```typescript
import { getDeviceProperty, setDeviceProperty } from '@ray-js/ray';
```

| Property Key | Purpose | Example Value |
|---|---|---|
| `email_export_address` | Email for data export | `"user@example.com"` |
| `custom_currency_unit` | Custom currency display unit | `"积分"` |

---

## Page Routing Index

| Page | Recommended Route | Purpose |
|---|---|---|
| Settings Hub | `/pages/energyMain/index` | Navigation cells to sub-pages |
| Statistics Chart | `/pages/energyStatistic/index` | EleUsage/EleCost tabs + F2 chart |
| Peak-Valley Price | `/pages/energyPrice/index` | Configure electricity pricing |
| Currency Settings | `/pages/energyCurrency/index` | Standard + custom currency |
| Cost Budget | `/pages/energyCostWarn/index` | Day/week/month cost budget |
| Usage Budget | `/pages/energyUsageWarn/index` | Day/week/month consumption budget |

Route names are recommendations — adapt to target project conventions.

---

## Dependencies

| Package | Purpose | Required |
|---|---|---|
| `@tuya-miniapp/cloud-api` | Energy billing API abstraction | Yes |
| `@ray-js/ray` | Device property, navigation, showModal, showLoading | Yes |
| `@ray-js/common-charts` | Chart rendering for statistics (default import `CommonCharts`, ECharts-compatible `option`) | Yes (for statistics page) |
| `ahooks` | `useAsyncEffect`, `useDebounceFn` | Recommended |

---

## Common Pitfalls

1. **Date format mismatch**: `DateType.Hour` expects `YYYYMMDDHH`, `DateType.Day` expects `YYYYMMDD`, `DateType.Month` expects `YYYYMM`. Mismatches cause empty data.

2. **Budget batch save is additive**: `batchSaveConsumeBudget` only updates dimensions you pass. Omitted dimensions retain their previous value.

3. **Peak-valley time format**: Use two-digit hour strings (`"00"` to `"24"`), not `"0"` or `"8"`. Segments must not overlap.

4. **Export is async**: `exportDeviceData` returning `true` means the task is queued, not that the email is sent. UI should show "export submitted" message.

5. **Currency change affects future only**: After `saveDeviceCurrency`, historical cost data remains in the old currency. Display a notice to users.
