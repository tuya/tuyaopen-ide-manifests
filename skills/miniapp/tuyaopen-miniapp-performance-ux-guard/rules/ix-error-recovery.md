---
id: ix-error-recovery
priority: MEDIUM-HIGH
category: Interaction > Recovery
---

# 错误场景可恢复路径

## Rule

错误与失败场景必须提供可恢复路径（重试按钮/刷新入口/返回操作）。

## Bad

```js
try {
  const data = await fetchData();
  setState({ data });
} catch (error) {
  log(error);
}
```

失败只记录日志，界面没有错误态、说明或恢复入口。

## Good

```js
try {
  setState({ status: 'loading' });
  const data = await fetchData();
  setState({ status: 'success', data });
} catch (error) {
  setState({
    status: 'error',
    errorMessage: t('error_retryable'),
    retryAction: fetchData,
  });
}

// View pseudocode:
// if status === 'error':
//   show ErrorState(message=errorMessage, onRetry=retryAction)
```

失败后进入可见错误态，并提供重试或返回等恢复路径。

## Why

让用户能从错误中恢复是体验底线。无恢复路径等于功能不可用，尤其在弱网环境极为常见。
