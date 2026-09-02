---
id: ix-async-chain
priority: HIGH
category: Interaction > Flow
---

# 异步操作链路完整覆盖

## Rule

异步操作链路必须完整覆盖：进行中、成功、失败、重试四种状态。

## Bad

```tsx
const res = await api();
setResult(res);
```

失败时界面静默，无任何提示。

## Good

```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState<unknown>(null);
const [result, setResult] = useState<ResultType | null>(null);
const [showRetry, setShowRetry] = useState(false);

const loadData = useCallback(async () => {
  setLoading(true);
  setError(null);
  setShowRetry(false);

  try {
    const res = await api();
    setResult(res);
  } catch (e) {
    ty.showToast({ title: I18n.t('load_failed') });
    setError(e);
    setShowRetry(true);
  } finally {
    setLoading(false);
  }
}, []);
```

展示 loading → try 成功更新数据 → catch 错误提示与重试入口 → finally 收起 loading。

## Why

不完整的异步链路会导致界面"卡死"——用户看不到进度、不知道失败、无法恢复，只能退出重进。
