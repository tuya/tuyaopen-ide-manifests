# Coding Conventions — Tuya Panel MiniApp

> 这份文档是「写代码时的红线」。AI 生成的代码违反任何一条都必须拒绝
> 并改正。每条规则都标了 **为什么必须** + **错误示例** + **正确写法**。

## 规则总览（违反任何一条都阻塞提交）

1. [DP I/O 必须走 panel-sdk hooks（Basic / Complex 两档），禁止用 `useState` 管 DP](#rule-1)
2. [网络请求必须走 `@tuya-miniapp/cloud-api`，禁止用 `fetch` / `axios`](#rule-2)
3. [UI 必须优先用 `@ray-js/smart-ui`，禁止从头造常见组件](#rule-3)
4. [样式必须用 `.module.less`，禁止全局污染](#rule-4)
5. [文案禁止硬编码中文，走 i18n](#rule-5)
6. [`src/devices/schema.ts` 是真值源，禁止手动编辑](#rule-6)
7. [类型安全：DP 类型必须从 schema 推导，禁止 `any`](#rule-7)
8. [生命周期挂载：副作用必须用 `useEffect` 清理，禁止裸 `setTimeout`](#rule-8)
9. [面板的入口组件必须是 class（framework 限制）](#rule-9)
10. [禁止使用已废弃 / 不允许的 API（黑名单见 §10）](#rule-10)

---

## Rule 1: DP I/O 必须走 panel-sdk hooks（Basic / Complex 两档） {#rule-1}

**为什么**：DP 状态由 `SmartDeviceModel` 拥有，它接收 MQTT 推送并广播
变化。用 `useState` 副本管理 DP 值会导致：
- 设备真实状态变化时 UI 不更新（订阅断了）
- 你以为「设了」但实际没下发到设备
- 同一 DP 多处显示时数据不一致

### 选 hook 的分档表

DP 分两类——**先翻 `src/devices/schema.ts` 看 `type`**，再按下表选 hook。
品类专属的细节（什么字段是 raw、JSON 内部结构等）以**对应品类 skill** 为准。

| DP 类型 | schema `type` | 读 | 写（首选） | 写（特殊） | 备注 |
|---|---|---|---|---|---|
| **Basic** | `bool` / `value` / `enum` / `string` | `useProps(p => p.code)` | `publishDpOutTime(code, value)` | `useActions().code.set(v)` 用于连续手势（PTZ / 滑条） | `publishDpOutTime` 自带 Loading + 超时 + 失败 toast |
| **Complex** | `raw` / `string`（实际是 JSON）| `useStructuredProps` | `useStructuredActions` | — | **必须**在 `protocols/index.ts` 注册 Transformer；典型场景：`colour_data` / `control_data` / `scene_data` / `music_data` / `ipc_mobile_path` 等 |

**`publishDpOutTime` 优先**：除非是滑条 / PTZ 这种需要每几百毫秒持续下
发的场景（用 `useActions().code.set()` 配 `setInterval`），Basic DP 一律
首选 `publishDpOutTime` —— 它把 Loading + 超时（默认 10s）+ 失败 toast
都封装好了，`useActions().code.set()` 没这些。

**`useStructuredProps` 是 Complex DP 的唯一正确读法**：用 `useProps`
拿到的是**未解析的 JSON 字符串**，你得到的不是对象，编解码也没接通
Transformer。这是面板代码里出现 `JSON.parse(p.colour_data as string)`
这种代码的根因——遇到这种代码，立刻改成 `useStructuredProps`。

**允许用 `useState` 的场景**（纯本地 UI 状态，不涉及 DP）：
- 输入框的 draft 值（发送前临时状态）
- OTA 升级进度 / 错误提示
- Modal/Popup 的开关状态
- 本地 loading 状态

### ❌ 错误（DP 状态用 useState）

```tsx
function PowerSwitch() {
  const [isOn, setIsOn] = useState(false);   // 错！DP 值用 useState

  useEffect(() => {
    someTuyaApi.getDp('switch').then(setIsOn);
  }, []);

  return <Switch checked={isOn} onChange={(v) => {
    setIsOn(v);                              // 本地变了
    publishDps({ switch: v });              // 但 DP 状态可能没回来
  }} />;
}
```

### ✅ 正确——Basic DP（首选 publishDpOutTime）

```tsx
import { useProps } from '@ray-js/panel-sdk';
import { publishDpOutTime } from '@ray-js/panel-sdk';

function PowerSwitch() {
  const isOn = useProps(p => p.switch as boolean);   // 响应式读

  return <Switch
    checked={isOn}
    onChange={(e) => publishDpOutTime('switch', !!e?.detail?.value)}
  />;
}
```

### ✅ 正确——Basic DP 连续手势（用 useActions）

```tsx
import { useActions } from '@ray-js/panel-sdk';

function PtzUpButton() {
  const actions = useActions();
  const intervalRef = useRef<number | null>(null);

  const onTouchStart = () => {
    actions.ptz_control.set('up');
    intervalRef.current = setInterval(() => actions.ptz_control.set('up'), 1000);
  };
  const onTouchEnd = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    actions.ptz_stop.set(true);
  };

  return <Button onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>↑</Button>;
}
```

### ✅ 正确——Complex DP（useStructuredProps / useStructuredActions）

```tsx
import { useStructuredProps, useStructuredActions } from '@ray-js/panel-sdk';

function ColorPicker() {
  // colour_data 在 protocols/index.ts 已注册 Transformer，
  // 拿到的是解析后的对象（{ h, s, v }），不再是 hex 字符串
  const colour = useStructuredProps(p => p.colour_data);
  const sa = useStructuredActions();

  return <Picker
    value={colour}
    onChange={(c) => sa.colour_data.set(c)}
  />;
}
```

### ❌ 错误——用 useProps 读 Complex DP

```tsx
// 错！拿到的是字符串，不是对象，且没走 Transformer
const raw = useProps(p => p.colour_data as string);
const parsed = JSON.parse(raw);   // ← 出现这种代码就是信号
```

### ✅ 正确（本地 UI 状态用 useState）

```tsx
function StringDpRow({ dp }) {
  const value = useProps(p => p[dp.code] as string);  // DP 值 — 走 useProps
  const [draft, setDraft] = useState('');             // 输入 draft — useState OK
  const [error, setError] = useState('');             // 错误提示 — useState OK

  return (
    <Input value={draft} onInput={e => setDraft(e.detail?.value ?? '')} />
  );
}
```

### ✅ 正确（本地 UI 状态用 useState）

```tsx
function StringDpRow({ dp }) {
  const value = useProps(p => p[dp.code] as string);  // DP 值 — 走 useProps
  const actions = useActions();
  const [draft, setDraft] = useState('');             // 输入 draft — useState OK
  const [error, setError] = useState('');             // 错误提示 — useState OK

  return (
    <Input value={draft} onInput={e => setDraft(e.detail?.value ?? '')} />
  );
}
```

---

## Rule 2: 网络请求必须走 `@tuya-miniapp/cloud-api` {#rule-2}

**为什么**：
- Tuya 平台对面板的网络请求有**白名单**和**签名验证**
- `fetch` / `axios` 调出去要么被网关拦，要么签名错误
- `@tuya-miniapp/cloud-api` 自动处理 token / 鉴权 / 设备绑定

### ❌ 错误

```ts
const res = await fetch('https://openapi.tuya.com/v1.0/devices/abc/energy', {
  headers: { 'Authorization': 'Bearer ...' }
});
```

### ✅ 正确

```ts
import { getDeviceData } from '@tuya-miniapp/cloud-api';

const data = await getDeviceData({
  deviceId: 'abc',
  indicatorCode: 'electricityConsumption',
});
```

**例外**：图片资源、第三方静态资源（且必须在 Tuya 平台审核时声明的
**网络请求白名单**里）可以用 `<Image src="https://...">`。其他**一律**
走 cloud-api。

---

## Rule 3: UI 必须优先用 `@ray-js/smart-ui` {#rule-3}

**为什么**：
- Tuya 设计规范要求面板视觉一致
- smart-ui 已实现暗色模式 / 国际化 / 无障碍
- 自己写的组件审核时可能因「设计不一致」被打回

### ❌ 错误

```tsx
function MyButton({ onClick, children }) {
  return (
    <View style={{ background: '#1890ff', padding: 12, borderRadius: 8 }} onClick={onClick}>
      <Text style={{ color: '#fff' }}>{children}</Text>
    </View>
  );
}
```

### ✅ 正确

```tsx
import { Button } from '@ray-js/smart-ui';

<Button type="primary" onClick={onClick}>{children}</Button>
```

**何时可以自己写**：smart-ui 没有的特殊形态（比如带物理设备形状的滑块、
品类专属可视化）。即使自己写，**色值 / 字号 / 间距必须从 smart-ui CSS
变量取**（`var(--app-B1-color)` 等）。

**找组件先查**：smart-ui skill 的 `_meta.json`，**不要凭记忆猜组件名**。

---

## Rule 4: 样式必须用 `.module.less` {#rule-4}

**为什么**：
- 类名自动命名空间化，避免组件间样式覆盖
- raypack v1.7+ 的 `?modules.js` 查询参数模式不可靠（已知 bug：生成
  `class="undefined undefined"`），必须用扩展名

### ❌ 错误

```less
// pages/home/index.less   ← 扩展名错
.card { background: #fff; }
```

### ✅ 正确

```less
// pages/home/index.module.less
.card { background: #fff; }
```

```tsx
import styles from './index.module.less';
<View className={styles.card}>...</View>
```

**多类名**：

```tsx
<View className={`${styles.card} ${active ? styles.cardActive : ''}`} />
```

---

## Rule 5: 文案禁止硬编码中文 {#rule-5}

**为什么**：
- Tuya 审核要求面板**至少支持中英两种语言**（i18n 包必备）
- 硬编码中文 = 老外用户看不懂 = 审核拒
- 即使初版只做中文，也要走 i18n 框架

### ❌ 错误

```tsx
<Text>开关</Text>
ty.showToast({ title: '升级成功', icon: 'success' })
```

### ✅ 正确

```tsx
import { useTranslation } from '@ray-js/ray';

function Component() {
  const { t } = useTranslation();
  return <Text>{t('home.switch.label')}</Text>;
}

// i18n 资源文件
// src/i18n/en.json   { "ota.success": "Update succeeded" }
// src/i18n/zh.json   { "ota.success": "升级成功" }

ty.showToast({ title: t('ota.success'), icon: 'success' })
```

**例外**：DP 的 `name` 字段（云端返的中文名）可以直接显示，但**应用文案**
（按钮 / 提示 / 错误）必须 i18n。

---

## Rule 6: `src/devices/schema.ts` 是真值源 {#rule-6}

**为什么**：
- 这个文件由 IDE 的「Sync DPs from Cloud」按钮**自动生成**
- 顶部有 `Auto-generated by TuyaOpen IDE` 标记，下次同步会**整体替换**
- 你手动加的内容下次同步会消失

### ❌ 错误

```ts
export const lampSchema = [
  ...原内容,
  { code: 'my_local_thing', mode: 'rw', ... },  // 错！下次同步丢
] as const;
```

### ✅ 正确

```
1. 去 Tuya 平台 (iot.tuya.com) 的产品里加这个 DP
2. 在 IDE 里点「Sync DPs from Cloud」
3. schema.ts 自动更新
```

**如果需要纯本地状态**（不上云）：用 `useState` 在组件内即可，不要进 schema。

---

## Rule 7: 类型安全：DP 类型从 schema 推导 {#rule-7}

### ❌ 错误

```ts
const props = useProps((p: any) => p);
const v = props['switch'];   // any，编译器不查 code 拼写
```

### ✅ 正确

```ts
const isOn = useProps(p => p.switch as boolean);
const battery = useProps(p => p.battery_percentage as number);
```

**推荐**：建一个 `src/config/dpCodes.ts` 把 code 作为常量：

```ts
export const DP_CODES = {
  SWITCH: 'switch',
  BATTERY: 'battery_percentage',
} as const;

useProps(p => p[DP_CODES.SWITCH] as boolean);
```

---

## Rule 8: 副作用必须清理 {#rule-8}

### ❌ 错误

```tsx
useEffect(() => {
  setInterval(() => { /* poll */ }, 1000);     // 没清！
  someEvent.on('change', handler);             // 没清！
}, []);
```

### ✅ 正确

```tsx
useEffect(() => {
  const timer = setInterval(() => { /* poll */ }, 1000);
  someEvent.on('change', handler);
  return () => {
    clearInterval(timer);
    someEvent.off('change', handler);
  };
}, []);
```

**更深的原则**：能用 `useProps` 替代的轮询，**永远不要写 `setInterval`**。
DP 是事件驱动的，订阅 useProps 就够了。

---

## Rule 9: App 入口必须是 class {#rule-9}

**为什么**：Ray framework 把 ref 传给 App 组件，调用 `onLaunch` /
`onShow` / `onHide`。Function component 不能接 ref，会导致这些生命周期
**完全不触发**。

### ✅ 正确

```tsx
class App extends React.Component {
  onLaunch() { /* 启动钩子 */ }
  onShow() {  /* 显示钩子 */ }
  onHide() {  /* 隐藏钩子 */ }

  render() {
    return (
      <SdmProvider value={devices.common}>
        {this.props.children}
      </SdmProvider>
    );
  }
}
export default App;
```

---

## Rule 10: 已废弃 / 不允许的 API 黑名单 {#rule-10}

以下 API 在面板里**严禁使用**（审核必拒 / 已废弃）：

| API | 替代 |
|---|---|
| `ty.apiRequestByAtop(…)` | `@tuya-miniapp/cloud-api` 提供的具体方法 |
| `wx.*` 系列 | `ty.*` 和 `@ray-js/ray` 提供的同名 API |
| `tt.*` 系列 | 同上 |
| `localStorage.*` / `sessionStorage.*` | `ty.getStorage` / `ty.setStorage` from `@ray-js/ray` |
| `document.cookie` | 不允许，没有 cookie 概念 |
| `window.open(...)` | `navigateTo` from `@ray-js/ray` |
| `eval` / `new Function` | 绝对禁止（审核硬性） |
| Old DOM (`document.querySelector`) | Ray 是 React + RN-like，没有真正的 DOM |
| `XMLHttpRequest` / `fetch` | `@tuya-miniapp/cloud-api`（见 [Rule 2](#rule-2)） |

**例外**：`src/ty-shim.ts` 中使用 `localStorage` 是 IDE 预览 shim 的存储回退，
仅在 TuyaOpen IDE 开发环境生效，不违反此规则。validate.mjs 会跳过该文件。

每出现一处上述 API（ty-shim.ts 除外）都是**审核硬伤**，必须改。

---

## 7 个典型反模式速查

| AI 写的 | 你应该立刻看出问题 | 修复 |
|---|---|---|
| `const [dpVal, setDpVal] = useState(...)` 用于 DP | 违 Rule 1 | Basic DP 用 `useProps` 读 + `publishDpOutTime` 写；Complex DP 用 `useStructuredProps` / `useStructuredActions` |
| `const raw = useProps(p => p.colour_data); JSON.parse(raw)` | 违 Rule 1（Complex DP 用错 hook）| 改 `useStructuredProps` + 在 `protocols/index.ts` 注册 Transformer |
| `actions.code.set(v)` 用于单次手动操作 | Rule 1 提醒 | 改 `publishDpOutTime(code, v)`，自带 Loading + 超时 + 失败 toast |
| `fetch('https://api.tuya.com/...')` | 违 Rule 2 | 换 cloud-api |
| `<View style={{...}}>` 用了 30 行 inline 样式 | 违 Rule 3+4 | 抽到 `.module.less` + 用 smart-ui |
| 直接修改 `src/devices/schema.ts` 添 DP | 违 Rule 6 | 去 Tuya 平台改 → 同步 |
| `<Text>请选择模式</Text>` 或 `ty.showToast({ title: '错误' })` | 违 Rule 5 | 走 i18n |
| `setInterval(() => publishDp(...))` 轮询 DP | 违 Rule 1+8 | 订阅 `useProps`（响应式自动收到推送） |
| `export default function App()` | 违 Rule 9 | 改成 class |
| `wx.request(...)` / `tt.request(...)` | 违 Rule 10 | 改 `ty.*` + cloud-api |

---

## 下一步

- 上传前 → [upload-checklist.md](upload-checklist.md)
- 跑自动化检查 → `node .agents/skills/miniapp/smart-panel-dev/scripts/validate.mjs`
