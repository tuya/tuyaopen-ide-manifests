---
id: perf-setdata-granularity
priority: CRITICAL
category: Performance > State Update
---

# 最小化 setData 更新范围

## Rule
原生小程序 `setData` 必须最小化更新范围，禁止整对象替换。Ray/React hooks 场景不要套用 `setData` 路径语法，应通过拆分 state、memo selector 或只更新必要字段来降低渲染成本。

## Bad (原生小程序)

```js
setData({
  entity: {
    ...state.entity,
    field: nextValue,
  },
});
```

整棵对象被替换，扩大序列化、传输和 diff 范围。

## Good (原生小程序)

```js
setData({
  'entity.field': nextValue,
});
```

路径更新只传递实际变化字段，减少跨层通信成本。

## Ray / React Note

```tsx
const [entityField, setEntityField] = useState(initialField);

function updateField(nextValue) {
  setEntityField(nextValue);
}
```

React hooks 不支持原生小程序的路径更新语法。若只有局部字段会变化，优先拆分 state 或使用 memoized derived data，避免每次重建大对象并触发无关子组件渲染。

## Why
小程序 setData 跨逻辑层与渲染层通信，需要序列化传输。大对象整树替换会增加序列化与 diff 成本，导致界面更新延迟。
