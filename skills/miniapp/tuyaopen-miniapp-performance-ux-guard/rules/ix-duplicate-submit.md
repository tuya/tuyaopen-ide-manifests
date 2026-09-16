---
id: ix-duplicate-submit
priority: HIGH
category: Interaction > Safety
---

# 副作用操作防重复提交

## Rule

所有会触发副作用的操作（创建/支付/删除）必须有防重复提交机制。

## Bad

```js
async function onActionTap() {
  await performAction();
}
```

快速连续触发时会并发执行多次副作用操作。

## Good

```tsx
const submittingRef = useRef(false);
const [submitting, setSubmitting] = useState(false);

const onActionTap = useCallback(async () => {
  if (submittingRef.current) return;

  submittingRef.current = true;
  setSubmitting(true);

  try {
    await performAction();
  } finally {
    submittingRef.current = false;
    setSubmitting(false);
  }
}, []);
```

用 `submittingRef` 做同步互斥锁，`submitting` state 只负责 UI loading/disabled；`finally` 保证成功或失败后都能释放锁。

## Why

重复提交可能导致重复创建订单、重复扣费等严重后果。防重入应覆盖整个异步生命周期。
在 Ray/React Hooks 中，state 更新是异步的，闭包也可能读到旧状态；不要只依赖 `submitting` state 判断是否可提交。
