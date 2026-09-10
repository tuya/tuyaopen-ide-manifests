# Capability: Electricity Cost Functional Page

电费设置功能页，appid `tyfqg0bbutva4kcghp`。

## Knowledge

### 注册

```ts
functionalPages: {
  ElectricityCostFunctional: { appid: 'tyfqg0bbutva4kcghp' },
}
```

### 可用页面

| page 值        | 说明           |
| -------------- | -------------- |
| `main`         | 电费设置入口页 |
| `costCurrency` | 电费单位设置   |
| `costPrice`    | 电费单价设置   |
| `costWarn`     | 电费提醒设置   |

### 跳转

```ts
const jumpUrl = `functional://ElectricityCostFunctional/main?deviceId=${encodeURIComponent(
  deviceId
)}`;
navigateTo({ url: jumpUrl });
```

## Constraints

- **Must**: 在 `global.config.ts` 注册 appid
- **Must**: 设备需有 `add_ele` DP
